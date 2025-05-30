
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/firebase"; 
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import type { CadastroAnimal, SexoAnimal, MarcacaoTipoAnimal } from "@/types";
import { getAnimalById } from "./animalActions"; 
import { parseISO } from "date-fns";

const CADASTROS_COLLECTION = "cadastros";

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
      // Convert Firestore Timestamps to ISO strings for client-side compatibility
      const entradaISO = cadastroData.f_entrada instanceof Timestamp ? cadastroData.f_entrada.toDate().toISOString() : cadastroData.f_entrada;
      const saidaISO = cadastroData.f_saida instanceof Timestamp ? cadastroData.f_saida.toDate().toISOString() : cadastroData.f_saida;

      return { 
        id: docSnap.id, 
        ...cadastroData,
        f_animalNome: animalNome,
        f_entrada: entradaISO,
        f_saida: saidaISO,
      } as CadastroAnimal;
    });
    return Promise.all(cadastrosPromises);
  } catch (error: any) {
    console.error(`[FIRESTORE_ERROR:getCadastros] Failed to fetch from '${CADASTROS_COLLECTION}' collection:`, error.code, error.message);
    if (error.code === 'permission-denied') {
        console.error(`[FIRESTORE_ERROR:getCadastros] PERMISSION DENIED. Check Firestore security rules for read access.`);
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
      const entradaISO = cadastroData.f_entrada instanceof Timestamp ? cadastroData.f_entrada.toDate().toISOString() : cadastroData.f_entrada;
      const saidaISO = cadastroData.f_saida instanceof Timestamp ? cadastroData.f_saida.toDate().toISOString() : cadastroData.f_saida;
      
      return { 
        id: docSnap.id, 
        ...cadastroData,
        f_animalNome: animalNome,
        f_entrada: entradaISO,
        f_saida: saidaISO,
      } as CadastroAnimal;
    }
    return undefined;
  } catch (error: any) {
    console.error(`[FIRESTORE_ERROR:getCadastroById] Failed to fetch document '${id}' from '${CADASTROS_COLLECTION}':`, error.code, error.message);
    if (error.code === 'permission-denied') {
        console.error(`[FIRESTORE_ERROR:getCadastroById] PERMISSION DENIED for document '${id}'. Check Firestore security rules.`);
    }
    return undefined;
  }
}

const prepareCadastroDataForFirestore = (formData: FormData): Omit<CadastroAnimal, 'id' | 'f_animalNome'> => {
  const entradaStr = formData.get("f_entrada") as string | undefined;
  const saidaStr = formData.get("f_saida") as string | undefined;

  const data: any = { 
    f_animalId: formData.get("f_animalId") as string,
    f_apelido: formData.get("f_apelido") as string || null,
    f_registro: formData.get("f_registro") as string || null,
    f_procedencia: formData.get("f_procedencia") as string || null,
    f_sexo: formData.get("f_sexo") as SexoAnimal || null,
    f_idade: formData.get("f_idade") as string || null,
    f_sinais: formData.get("f_sinais") as string || null,
    f_marcacaotipo: formData.get("f_marcacaotipo") as MarcacaoTipoAnimal || null,
    f_marcacaonumero: formData.get("f_marcacaonumero") as string || null,
    f_motivosaida: formData.get("f_motivosaida") as string || null,
    f_observacao: formData.get("f_observacao") as string || null,
    f_origem_trafico: formData.get("f_origem_trafico") === 'true',
    f_informacoes_trafico: formData.get("f_informacoes_trafico") as string || null,
  };

  if (entradaStr) data.f_entrada = Timestamp.fromDate(parseISO(entradaStr));
  else data.f_entrada = null;

  if (saidaStr) data.f_saida = Timestamp.fromDate(parseISO(saidaStr));
  else data.f_saida = null;
  
  Object.keys(data).forEach(key => {
    if (data[key] === undefined) {
      data[key] = null; 
    }
  });
  
  return data as Omit<CadastroAnimal, 'id' | 'f_animalNome'>;
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

    return { success: true, message: "Cadastro de animal individual adicionado com sucesso ao Firestore!", data: { id: docRef.id, ...newCadastroData, f_animalNome: animalExists.f_nome } as CadastroAnimal };
  } catch (error: any) {
    console.error(`[FIRESTORE_ERROR:addCadastro] Failed to add document to '${CADASTROS_COLLECTION}':`, error.code, error.message);
    if (error.code === 'permission-denied') {
        console.error(`[FIRESTORE_ERROR:addCadastro] PERMISSION DENIED. Check Firestore security rules for write access.`);
    }
    return { success: false, message: "Erro ao adicionar cadastro ao Firestore." };
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
    const originalAnimalId = originalCadastroSnap.exists() ? (originalCadastroSnap.data().f_animalId as string) : null;

    await updateDoc(cadastroDocRef, updatedCadastroData);
    
    revalidatePath("/cadastros", "layout");
    revalidatePath(`/cadastros/${id}`, "layout");
    revalidatePath(`/cadastros/${id}/editar`, "layout");
    revalidatePath(`/animais/${animalId}`, "layout");
    if (originalAnimalId && originalAnimalId !== animalId) {
      revalidatePath(`/animais/${originalAnimalId}`, "layout");
    }

    return { success: true, message: "Cadastro individual atualizado com sucesso no Firestore!", data: { id, ...updatedCadastroData, f_animalNome: animalExists.f_nome } as CadastroAnimal };
  } catch (error: any) {
    console.error(`[FIRESTORE_ERROR:updateCadastro] Failed to update document '${id}' in '${CADASTROS_COLLECTION}':`, error.code, error.message);
    if (error.code === 'permission-denied') {
        console.error(`[FIRESTORE_ERROR:updateCadastro] PERMISSION DENIED for document '${id}'. Check Firestore security rules.`);
    }
    return { success: false, message: "Erro ao atualizar cadastro no Firestore." };
  }
}

export async function deleteCadastro(id: string): Promise<{ success: boolean; message: string }> {
  if (!id) return { success: false, message: "ID do cadastro é obrigatório para exclusão."};
  try {
    const cadastroDocRef = doc(db, CADASTROS_COLLECTION, id);
    const originalCadastroSnap = await getDoc(cadastroDocRef);
    const originalAnimalId = originalCadastroSnap.exists() ? (originalCadastroSnap.data().f_animalId as string) : null;

    await deleteDoc(cadastroDocRef);
    
    revalidatePath("/cadastros", "layout");
    revalidatePath(`/cadastros/${id}`, "layout"); 
    if (originalAnimalId) {
      revalidatePath(`/animais/${originalAnimalId}`, "layout"); 
    }
    
    return { success: true, message: "Cadastro individual excluído com sucesso do Firestore!" };
  } catch (error: any) {
    console.error(`[FIRESTORE_ERROR:deleteCadastro] Failed to delete document '${id}' from '${CADASTROS_COLLECTION}':`, error.code, error.message);
     if (error.code === 'permission-denied') {
        console.error(`[FIRESTORE_ERROR:deleteCadastro] PERMISSION DENIED for document '${id}'. Check Firestore security rules.`);
    }
    return { success: false, message: "Erro ao excluir cadastro do Firestore." };
  }
}

