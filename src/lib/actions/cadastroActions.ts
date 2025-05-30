
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/firebase";
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import type { CadastroAnimal, SexoAnimal, MarcacaoTipoAnimal } from "@/types";
import { getAnimalById } from "./animalActions";
import { parseISO } from "date-fns";

const CADASTROS_COLLECTION = "cadastros";

function processCadastroDoc(docSnap: any, cadastroData: any, animalNome: string): CadastroAnimal {
  let processedEntrada: string | null = null;
  if (cadastroData.f_entrada) {
    if (cadastroData.f_entrada instanceof Timestamp) {
      processedEntrada = cadastroData.f_entrada.toDate().toISOString();
    } else if (typeof cadastroData.f_entrada === 'object' && 'seconds' in cadastroData.f_entrada && 'nanoseconds' in cadastroData.f_entrada) {
      // Handle plain objects resembling Timestamps
      processedEntrada = new Timestamp(cadastroData.f_entrada.seconds, cadastroData.f_entrada.nanoseconds).toDate().toISOString();
    } else if (typeof cadastroData.f_entrada === 'string') {
      // Assume it's already an ISO string or a parsable date string
      try {
        processedEntrada = parseISO(cadastroData.f_entrada).toISOString();
      } catch (e) {
        console.warn(`Could not parse date string for f_entrada: ${cadastroData.f_entrada}`);
        processedEntrada = cadastroData.f_entrada; // Keep original if unparsable
      }
    }
  }

  let processedSaida: string | null = null;
  if (cadastroData.f_saida) {
    if (cadastroData.f_saida instanceof Timestamp) {
      processedSaida = cadastroData.f_saida.toDate().toISOString();
    } else if (typeof cadastroData.f_saida === 'object' && 'seconds' in cadastroData.f_saida && 'nanoseconds' in cadastroData.f_saida) {
      processedSaida = new Timestamp(cadastroData.f_saida.seconds, cadastroData.f_saida.nanoseconds).toDate().toISOString();
    } else if (typeof cadastroData.f_saida === 'string') {
      try {
        processedSaida = parseISO(cadastroData.f_saida).toISOString();
      } catch (e) {
        console.warn(`Could not parse date string for f_saida: ${cadastroData.f_saida}`);
        processedSaida = cadastroData.f_saida;
      }
    }
  }

  // Explicitly construct the object to ensure all fields are correctly typed and defaults applied
  const returnedCadastro: CadastroAnimal = {
    id: docSnap.id,
    f_animalId: cadastroData.f_animalId as string,
    f_apelido: cadastroData.f_apelido ?? null,
    f_registro: cadastroData.f_registro ?? null,
    f_procedencia: cadastroData.f_procedencia ?? null,
    f_sexo: (cadastroData.f_sexo as SexoAnimal) ?? null,
    f_idade: cadastroData.f_idade ?? null,
    f_sinais: cadastroData.f_sinais ?? null,
    f_marcacaotipo: (cadastroData.f_marcacaotipo as MarcacaoTipoAnimal) ?? null,
    f_marcacaonumero: cadastroData.f_marcacaonumero ?? null,
    f_motivosaida: cadastroData.f_motivosaida ?? null,
    f_observacao: cadastroData.f_observacao ?? null,
    f_origem_trafico: cadastroData.f_origem_trafico === true, // Ensure boolean
    f_informacoes_trafico: cadastroData.f_informacoes_trafico ?? null,
    f_entrada: processedEntrada,
    f_saida: processedSaida,
    f_animalNome: animalNome ?? "Espécie não encontrada",
  };
  return returnedCadastro;
}


export async function getCadastros(): Promise<CadastroAnimal[]> {
  try {
    const cadastrosCollection = collection(db, CADASTROS_COLLECTION);
    const snapshot = await getDocs(cadastrosCollection);
    if (snapshot.empty) {
      return [];
    }

    const cadastrosPromises = snapshot.docs.map(async (docSnap) => {
      const cadastroData = docSnap.data();
      let animalNome = "N/A";
      if (cadastroData.f_animalId) {
        const animal = await getAnimalById(cadastroData.f_animalId as string);
        animalNome = animal?.f_nome || "Espécie não encontrada";
      }
      return processCadastroDoc(docSnap, cadastroData, animalNome);
    });
    return Promise.all(cadastrosPromises);
  } catch (error: any) {
    console.error(`[FIRESTORE_ERROR:getCadastros] Failed to fetch from '${CADASTROS_COLLECTION}' collection:`, error.code, error.message);
    if (error.code === 'permission-denied' || error.message?.includes('permission-denied') || error.message?.includes('insufficient permissions')) {
        console.error(`[FIRESTORE_ERROR:getCadastros] PERMISSION DENIED. Please check your Firestore security rules in the Firebase console. Public read access might be required for this collection.`);
    }
    return [];
  }
}

export async function getCadastroById(id: string): Promise<CadastroAnimal | undefined> {
  try {
    if (!id) {
        console.warn("[getCadastroById] Called with no id");
        return undefined;
    }
    const cadastroDocRef = doc(db, CADASTROS_COLLECTION, id);
    const docSnap = await getDoc(cadastroDocRef);

    if (docSnap.exists()) {
      const cadastroData = docSnap.data();
      let animalNome = "N/A";
      if (cadastroData.f_animalId) {
        const animal = await getAnimalById(cadastroData.f_animalId as string);
        animalNome = animal?.f_nome || "Espécie não encontrada";
      }
      return processCadastroDoc(docSnap, cadastroData, animalNome);
    }
    return undefined;
  } catch (error: any) {
    console.error(`[FIRESTORE_ERROR:getCadastroById] Failed to fetch document '${id}' from '${CADASTROS_COLLECTION}':`, error.code, error.message);
    if (error.code === 'permission-denied' || error.message?.includes('permission-denied') || error.message?.includes('insufficient permissions')) {
        console.error(`[FIRESTORE_ERROR:getCadastroById] PERMISSION DENIED for document '${id}'. Check Firestore security rules.`);
    }
    return undefined;
  }
}

const prepareCadastroDataForFirestore = (formData: FormData): Record<string, any> => {
  const entradaStr = formData.get("f_entrada") as string | null;
  const saidaStr = formData.get("f_saida") as string | null;

  const data: Record<string, any> = {
    f_animalId: formData.get("f_animalId") as string,
    f_apelido: formData.get("f_apelido") || null,
    f_registro: formData.get("f_registro") || null,
    f_procedencia: formData.get("f_procedencia") || null,
    f_sexo: (formData.get("f_sexo") as SexoAnimal) || null,
    f_idade: formData.get("f_idade") || null,
    f_sinais: formData.get("f_sinais") || null,
    f_marcacaotipo: (formData.get("f_marcacaotipo") as MarcacaoTipoAnimal) || null,
    f_marcacaonumero: formData.get("f_marcacaonumero") || null,
    f_motivosaida: formData.get("f_motivosaida") || null,
    f_observacao: formData.get("f_observacao") || null,
    f_origem_trafico: formData.get("f_origem_trafico") === 'true', // Handles string 'true'/'false' from FormData
    f_informacoes_trafico: formData.get("f_informacoes_trafico") || null,
  };

  if (entradaStr) data.f_entrada = Timestamp.fromDate(parseISO(entradaStr));
  else data.f_entrada = null;

  if (saidaStr) data.f_saida = Timestamp.fromDate(parseISO(saidaStr));
  else data.f_saida = null;

  // Ensure no undefined values are sent to Firestore
  Object.keys(data).forEach(key => {
    if (data[key] === undefined) {
      data[key] = null;
    }
  });

  return data;
};


export async function addCadastro(formData: FormData): Promise<{ success: boolean; message: string; data?: CadastroAnimal }> {
  const animalId = formData.get("f_animalId") as string;
  if (!animalId) return { success: false, message: "Animal (espécie) é obrigatório." };

  const animalExists = await getAnimalById(animalId);
  if (!animalExists) return { success: false, message: "Animal (espécie) selecionado inválido." };

  const newCadastroData = prepareCadastroDataForFirestore(formData);

  try {
    const docRef = await addDoc(collection(db, CADASTROS_COLLECTION), newCadastroData);
    revalidatePath("/cadastros", "layout");
    revalidatePath(`/animais/${animalId}`, "layout");
    revalidatePath("/", "layout"); // Revalidate dashboard as well

    // Construct the data to return, ensuring dates are strings
    const returnedData = {
        id: docRef.id,
        ...newCadastroData, // This data has Timestamps if dates were provided
        f_animalNome: animalExists.f_nome,
        f_entrada: newCadastroData.f_entrada instanceof Timestamp ? newCadastroData.f_entrada.toDate().toISOString() : null,
        f_saida: newCadastroData.f_saida instanceof Timestamp ? newCadastroData.f_saida.toDate().toISOString() : null,
    } as CadastroAnimal;


    return { success: true, message: "Cadastro de animal individual adicionado com sucesso ao Firestore!", data: returnedData };
  } catch (error: any) {
    console.error(`[FIRESTORE_ERROR:addCadastro] Failed to add document to '${CADASTROS_COLLECTION}':`, error.code, error.message, error);
    if (error.code === 'permission-denied' || error.message?.includes('permission-denied') || error.message?.includes('insufficient permissions')) {
        console.error(`[FIRESTORE_ERROR:addCadastro] PERMISSION DENIED. Check Firestore security rules for write access.`);
    } else if (error.code === 'invalid-argument' || error.message?.includes('invalid-argument')) {
        console.error(`[FIRESTORE_ERROR:addCadastro] INVALID ARGUMENT. Often due to undefined field values. Data being sent:`, JSON.stringify(newCadastroData, null, 2));
    }
    return { success: false, message: `Erro ao adicionar cadastro ao Firestore: ${error.message}` };
  }
}

export async function updateCadastro(id: string, formData: FormData): Promise<{ success: boolean; message: string; data?: CadastroAnimal }> {
  if (!id) return { success: false, message: "ID do cadastro é obrigatório para atualização." };

  const animalId = formData.get("f_animalId") as string;
  if (!animalId) return { success: false, message: "Animal (espécie) é obrigatório." };

  const animalExists = await getAnimalById(animalId);
  if (!animalExists) return { success: false, message: "Animal (espécie) selecionado inválido." };

  const cadastroDocRef = doc(db, CADASTROS_COLLECTION, id);
  const updatedCadastroData = prepareCadastroDataForFirestore(formData);

  try {
    const originalCadastroSnap = await getDoc(cadastroDocRef);
    const originalAnimalId = originalCadastroSnap.exists() ? (originalCadastroSnap.data()?.f_animalId as string) : null;

    await updateDoc(cadastroDocRef, updatedCadastroData);

    revalidatePath("/cadastros", "layout");
    revalidatePath(`/cadastros/${id}`, "layout");
    revalidatePath(`/cadastros/${id}/editar`, "layout");
    revalidatePath(`/animais/${animalId}`, "layout");
    revalidatePath("/", "layout"); // Revalidate dashboard as well
    if (originalAnimalId && originalAnimalId !== animalId) {
      revalidatePath(`/animais/${originalAnimalId}`, "layout");
    }

    // Construct the data to return, ensuring dates are strings
    const returnedData = {
        id,
        ...updatedCadastroData, // This data has Timestamps if dates were provided
        f_animalNome: animalExists.f_nome,
        f_entrada: updatedCadastroData.f_entrada instanceof Timestamp ? updatedCadastroData.f_entrada.toDate().toISOString() : null,
        f_saida: updatedCadastroData.f_saida instanceof Timestamp ? updatedCadastroData.f_saida.toDate().toISOString() : null,
    } as CadastroAnimal;

    return { success: true, message: "Cadastro individual atualizado com sucesso no Firestore!", data: returnedData };
  } catch (error: any) {
    console.error(`[FIRESTORE_ERROR:updateCadastro] Failed to update document '${id}' in '${CADASTROS_COLLECTION}':`, error.code, error.message, error);
    if (error.code === 'permission-denied' || error.message?.includes('permission-denied') || error.message?.includes('insufficient permissions')) {
        console.error(`[FIRESTORE_ERROR:updateCadastro] PERMISSION DENIED for document '${id}'. Check Firestore security rules.`);
    } else if (error.code === 'invalid-argument' || error.message?.includes('invalid-argument')) {
         console.error(`[FIRESTORE_ERROR:updateCadastro] INVALID ARGUMENT. Often due to undefined field values. Data being sent:`, JSON.stringify(updatedCadastroData, null, 2));
    }
    return { success: false, message: `Erro ao atualizar cadastro no Firestore: ${error.message}` };
  }
}

export async function deleteCadastro(id: string): Promise<{ success: boolean; message: string }> {
  if (!id) return { success: false, message: "ID do cadastro é obrigatório para exclusão."};
  try {
    const cadastroDocRef = doc(db, CADASTROS_COLLECTION, id);
    const originalCadastroSnap = await getDoc(cadastroDocRef);
    const originalAnimalId = originalCadastroSnap.exists() ? (originalCadastroSnap.data()?.f_animalId as string) : null;

    await deleteDoc(cadastroDocRef);

    revalidatePath("/cadastros", "layout");
    revalidatePath(`/cadastros/${id}`, "layout");
    revalidatePath("/", "layout"); // Revalidate dashboard as well
    if (originalAnimalId) {
      revalidatePath(`/animais/${originalAnimalId}`, "layout");
    }

    return { success: true, message: "Cadastro individual excluído com sucesso do Firestore!" };
  } catch (error: any) {
    console.error(`[FIRESTORE_ERROR:deleteCadastro] Failed to delete document '${id}' from '${CADASTROS_COLLECTION}':`, error.code, error.message);
     if (error.code === 'permission-denied' || error.message?.includes('permission-denied') || error.message?.includes('insufficient permissions')) {
        console.error(`[FIRESTORE_ERROR:deleteCadastro] PERMISSION DENIED for document '${id}'. Check Firestore security rules.`);
    }
    return { success: false, message: `Erro ao excluir cadastro do Firestore: ${error.message}` };
  }
}

    