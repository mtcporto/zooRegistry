
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/firebase"; // Use Firestore db instance
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import type { CadastroAnimal, SexoAnimal, MarcacaoTipoAnimal } from "@/types";
import { getAnimalById } from "./animalActions"; // This will now use Firestore
import { formatISO, parseISO } from "date-fns";

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
      return { 
        id: docSnap.id, 
        ...cadastroData,
        f_animalNome: animalNome,
        f_entrada: cadastroData.f_entrada ? (cadastroData.f_entrada.toDate ? cadastroData.f_entrada.toDate().toISOString() : cadastroData.f_entrada) : undefined,
        f_saida: cadastroData.f_saida ? (cadastroData.f_saida.toDate ? cadastroData.f_saida.toDate().toISOString() : cadastroData.f_saida) : undefined,
      } as CadastroAnimal;
    });
    return Promise.all(cadastrosPromises);
  } catch (error) {
    console.error("Error fetching cadastros:", error);
    return [];
  }
}

export async function getCadastroById(id: string): Promise<CadastroAnimal | undefined> {
  try {
    if (!id) {
        console.warn("getCadastroById called with no id");
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
      return { 
        id: docSnap.id, 
        ...cadastroData,
        f_animalNome: animalNome,
        f_entrada: cadastroData.f_entrada ? (cadastroData.f_entrada.toDate ? cadastroData.f_entrada.toDate().toISOString() : cadastroData.f_entrada) : undefined,
        f_saida: cadastroData.f_saida ? (cadastroData.f_saida.toDate ? cadastroData.f_saida.toDate().toISOString() : cadastroData.f_saida) : undefined,
      } as CadastroAnimal;
    }
    return undefined;
  } catch (error) {
    console.error(`Error fetching cadastro by id ${id}:`, error);
    return undefined;
  }
}

// Helper to prepare data for Firestore, converting dates to Timestamps
const prepareCadastroDataForFirestore = (formData: FormData): Omit<CadastroAnimal, 'id' | 'f_animalNome'> => {
  const entradaStr = formData.get("f_entrada") as string | undefined;
  const saidaStr = formData.get("f_saida") as string | undefined;

  const data: any = { // Use 'any' temporarily for easier construction
    f_animalId: formData.get("f_animalId") as string,
    f_apelido: formData.get("f_apelido") as string || null, // Firestore prefers null for empty strings
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
  
  // Remove undefined fields explicitly so Firestore doesn't store them
  Object.keys(data).forEach(key => {
    if (data[key] === undefined) {
      data[key] = null; // Or delete data[key] if you prefer not to store nulls
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
  } catch (error) {
    console.error("Error adding cadastro to Firestore:", error);
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
    // Fetch original animalId to revalidate its path if changed
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
  } catch (error) {
    console.error("Error updating cadastro in Firestore:", error);
    return { success: false, message: "Erro ao atualizar cadastro no Firestore." };
  }
}

export async function deleteCadastro(id: string): Promise<{ success: boolean; message: string }> {
  if (!id) return { success: false, message: "ID do cadastro é obrigatório para exclusão."};
  try {
    const cadastroDocRef = doc(db, CADASTROS_COLLECTION, id);
    // Fetch original animalId to revalidate its path
    const originalCadastroSnap = await getDoc(cadastroDocRef);
    const originalAnimalId = originalCadastroSnap.exists() ? (originalCadastroSnap.data().f_animalId as string) : null;

    await deleteDoc(cadastroDocRef);
    
    revalidatePath("/cadastros", "layout");
    revalidatePath(`/cadastros/${id}`, "layout"); 
    if (originalAnimalId) {
      revalidatePath(`/animais/${originalAnimalId}`, "layout"); 
    }
    
    return { success: true, message: "Cadastro individual excluído com sucesso do Firestore!" };
  } catch (error) {
    console.error("Error deleting cadastro from Firestore:", error);
    return { success: false, message: "Erro ao excluir cadastro do Firestore." };
  }
}
