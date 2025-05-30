
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/firebase";
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, query, where, Timestamp } from "firebase/firestore";
import type { Animal } from "@/types";
import { getConservationStatusAndTaxonomy, type GetIUCNDataOutput } from "@/ai/flows/get-conservation-status-flow";
import { getAnimalImage, type GetAnimalImageOutput } from "@/ai/flows/get-animal-image-flow";

const ANIMAIS_COLLECTION = "animais";
const CADASTROS_COLLECTION = "cadastros";

export async function getAnimais(): Promise<Animal[]> {
  try {
    const animaisCollection = collection(db, ANIMAIS_COLLECTION);
    const snapshot = await getDocs(animaisCollection);
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Animal));
  } catch (error: any) {
    console.error(`[FIRESTORE_ERROR:getAnimais] Failed to fetch from '${ANIMAIS_COLLECTION}' collection:`, error.code, error.message);
    if (error.code === 'permission-denied' || error.message?.includes('permission-denied') || error.message?.includes('insufficient permissions')) {
        console.error("[FIRESTORE_ERROR:getAnimais] PERMISSION DENIED. Please check your Firestore security rules in the Firebase console. Public read access might be required for this collection.");
    }
    return [];
  }
}

export async function getAnimalById(id: string): Promise<Animal | undefined> {
  try {
    if (!id) {
        console.warn("[getAnimalById] Called with no id");
        return undefined;
    }
    const animalDocRef = doc(db, ANIMAIS_COLLECTION, id);
    const docSnap = await getDoc(animalDocRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Animal;
    }
    return undefined;
  } catch (error: any) {
    console.error(`[FIRESTORE_ERROR:getAnimalById] Failed to fetch document '${id}' from '${ANIMAIS_COLLECTION}':`, error.code, error.message);
    if (error.code === 'permission-denied' || error.message?.includes('permission-denied') || error.message?.includes('insufficient permissions')) {
        console.error(`[FIRESTORE_ERROR:getAnimalById] PERMISSION DENIED for document '${id}'. Check Firestore security rules.`);
    }
    return undefined;
  }
}

export async function addAnimal(formData: FormData): Promise<{ success: boolean; message: string; data?: Animal }> {
  const pexelsKeyExists = !!process.env.PEXELS_API_KEY;
  const iucnKeyExists = !!process.env.IUCN_REDLIST_API_TOKEN;
  
  console.log(`[AnimalAction_Add_Firestore] PEXELS_API_KEY check: Exists=${pexelsKeyExists}`);
  console.log(`[AnimalAction_Add_Firestore] IUCN_REDLIST_API_TOKEN check: Exists=${iucnKeyExists}`);

  const nomeCientifico = formData.get("f_nomecientifico") as string;
  const nomeVulgar = formData.get("f_nome") as string;
  
  const nomesAlternativosForm = formData.get("f_nomes_alternativos") as string | null;
  const imagemUrlFromForm = formData.get("f_imagem") as string | null;
  const statusConservacaoUserForm = formData.get("f_status_conservacao") as string | null;

  if (!nomeCientifico) return { success: false, message: "Nome científico é obrigatório." };
  if (!nomeVulgar) return { success: false, message: "Nome vulgar é obrigatório." };
  
  let iucnData: GetIUCNDataOutput = {
    status: null, kingdomName: null, phylumName: null, className: null, orderName: null, familyName: null, commonNames: null, errorMessage: undefined
  };

  if (iucnKeyExists && nomeCientifico) {
    console.log(`[AnimalAction_Add_Firestore] Attempting to fetch IUCN data for ${nomeCientifico}...`);
    try {
      iucnData = await getConservationStatusAndTaxonomy({ scientificName: nomeCientifico });
      console.log(`[AnimalAction_Add_Firestore] IUCN data for ${nomeCientifico} fetch response. Status: ${iucnData.status}, Class: ${iucnData.className}, Error: ${iucnData.errorMessage}`);
    } catch (e: any) {
        console.error(`[AnimalAction_Add_Firestore] Error calling IUCN flow:`, e.message, e);
        iucnData.errorMessage = e.message;
    }
  } else {
    console.log("[AnimalAction_Add_Firestore] IUCN_REDLIST_API_TOKEN not set or nomeCientifico missing. Skipping IUCN data fetch.");
  }

  let finalImageToSave: string | null = (imagemUrlFromForm && imagemUrlFromForm.trim() !== "") ? imagemUrlFromForm.trim() : null;
  const searchTermForImage = nomeCientifico || nomeVulgar;

  if (!finalImageToSave && searchTermForImage && pexelsKeyExists) {
    try {
      const imageResult: GetAnimalImageOutput = await getAnimalImage({ animalName: searchTermForImage });
      if (imageResult.imageUrl) {
        finalImageToSave = imageResult.imageUrl;
      }
      console.log(`[AnimalAction_Add_Firestore] Pexels search for ${searchTermForImage}. Result: ${finalImageToSave || 'none'}, Message: ${imageResult.errorMessage || 'none'}`);
    } catch (e: any) {
      console.error(`[AnimalAction_Add_Firestore] Error calling Pexels flow:`, e.message, e);
    }
  }

  if (!finalImageToSave) {
    finalImageToSave = `https://placehold.co/300x200.png?text=${encodeURIComponent(nomeVulgar || 'Animal')}`;
  }

  const finalStatusConservacao = (statusConservacaoUserForm && statusConservacaoUserForm.trim() !== "") 
    ? statusConservacaoUserForm.trim().toUpperCase() 
    : (iucnData.status || null);

  const newAnimalData: Omit<Animal, 'id'> = {
    f_nomecientifico: nomeCientifico,
    f_nome: nomeVulgar,
    f_nomes_alternativos: (nomesAlternativosForm && nomesAlternativosForm.trim() !== "") ? nomesAlternativosForm.trim() : null,
    f_imagem: finalImageToSave, // Already string or null
    f_status_conservacao: finalStatusConservacao, // Already string or null
    f_iucn_kingdomName: iucnData.kingdomName || null,
    f_iucn_phylumName: iucnData.phylumName || null,
    f_iucn_className: iucnData.className || null,
    f_iucn_orderName: iucnData.orderName || null,
    f_iucn_familyName: iucnData.familyName || null,
    f_iucn_commonNames: iucnData.commonNames || null,
    "data-ai-hint": (nomeVulgar ? nomeVulgar.toLowerCase().split(" ").slice(0,2).join(" ") : "animal") || "animal photo",
  };
  
  try {
    const docRef = await addDoc(collection(db, ANIMAIS_COLLECTION), newAnimalData);
    revalidatePath("/animais", "layout");
    revalidatePath("/", "layout");
    return { success: true, message: "Animal (espécie) adicionado com sucesso ao Firestore!", data: { id: docRef.id, ...newAnimalData } };
  } catch (error: any) {
    console.error(`[FIRESTORE_ERROR:addAnimal] Failed to add document to '${ANIMAIS_COLLECTION}':`, error.code || 'N/A', error.message || 'No message', error);
     if (error.code === 'permission-denied' || error.message?.includes('permission-denied') || error.message?.includes('insufficient permissions')) {
        console.error(`[FIRESTORE_ERROR:addAnimal] PERMISSION DENIED. Check Firestore security rules for write access to collection '${ANIMAIS_COLLECTION}'.`);
    } else if (error.code === 'invalid-argument' || error.message?.includes('invalid-argument')) {
        console.error(`[FIRESTORE_ERROR:addAnimal] INVALID ARGUMENT. Often due to undefined field values. Data being sent:`, JSON.stringify(newAnimalData, null, 2));
    }
    return { success: false, message: `Erro ao adicionar animal (espécie) ao Firestore: ${error.message}` };
  }
}

export async function updateAnimal(id: string, formData: FormData): Promise<{ success: boolean; message: string; data?: Animal }> {
  const pexelsKeyExists = !!process.env.PEXELS_API_KEY;
  const iucnKeyExists = !!process.env.IUCN_REDLIST_API_TOKEN;

  const nomeCientifico = formData.get("f_nomecientifico") as string;
  const nomeVulgar = formData.get("f_nome") as string;
  const nomesAlternativosForm = formData.get("f_nomes_alternativos") as string | null;
  const imagemUrlFromForm = formData.get("f_imagem") as string | null;
  const statusConservacaoUserForm = formData.get("f_status_conservacao") as string | null;
  const rebuscarIUCN = formData.get("f_rebuscar_iucn") === "true";

  if (!id) return { success: false, message: "ID do animal é obrigatório para atualização." };
  if (!nomeCientifico) return { success: false, message: "Nome científico é obrigatório." };
  if (!nomeVulgar) return { success: false, message: "Nome vulgar é obrigatório." };

  const animalDocRef = doc(db, ANIMAIS_COLLECTION, id);
  
  try {
    const animalOriginalSnap = await getDoc(animalDocRef);
    if (!animalOriginalSnap.exists()) {
      return { success: false, message: "Animal (espécie) não encontrado no Firestore." };
    }
    const animalOriginal = animalOriginalSnap.data() as Animal;

    let iucnDataResult: Partial<GetIUCNDataOutput> = {
      status: animalOriginal.f_status_conservacao || null,
      kingdomName: animalOriginal.f_iucn_kingdomName || null,
      phylumName: animalOriginal.f_iucn_phylumName || null,
      className: animalOriginal.f_iucn_className || null,
      orderName: animalOriginal.f_iucn_orderName || null,
      familyName: animalOriginal.f_iucn_familyName || null,
      commonNames: animalOriginal.f_iucn_commonNames || null,
    };

    if (iucnKeyExists && nomeCientifico && (rebuscarIUCN || (animalOriginal.f_nomecientifico !== nomeCientifico && !statusConservacaoUserForm))) {
      console.log(`[AnimalAction_Update_Firestore] Re-fetching IUCN data for ${nomeCientifico}`);
      try {
        const fetchedIUCN = await getConservationStatusAndTaxonomy({ scientificName: nomeCientifico });
        iucnDataResult = {
            status: fetchedIUCN.status || iucnDataResult.status, 
            kingdomName: fetchedIUCN.kingdomName || iucnDataResult.kingdomName,
            phylumName: fetchedIUCN.phylumName || iucnDataResult.phylumName,
            className: fetchedIUCN.className || iucnDataResult.className,
            orderName: fetchedIUCN.orderName || iucnDataResult.orderName,
            familyName: fetchedIUCN.familyName || iucnDataResult.familyName,
            commonNames: fetchedIUCN.commonNames || iucnDataResult.commonNames,
        };
        console.log(`[AnimalAction_Update_Firestore] IUCN re-fetch for ${nomeCientifico}. Status: ${iucnDataResult.status}, Class: ${iucnDataResult.className}, Error: ${fetchedIUCN.errorMessage}`);
      } catch (e: any) {
          console.error(`[AnimalAction_Update_Firestore] Error re-fetching IUCN data:`, e.message, e);
      }
    }

    let finalImageToSave: string | null = animalOriginal.f_imagem || null;
    const searchTermForImage = nomeCientifico || nomeVulgar;

    if (imagemUrlFromForm !== null) { // User provided something (empty string or URL)
        if (imagemUrlFromForm.trim() !== "" && imagemUrlFromForm.trim() !== animalOriginal.f_imagem) {
            finalImageToSave = imagemUrlFromForm.trim();
        } else if (imagemUrlFromForm.trim() === "") { // User explicitly cleared the field
            finalImageToSave = null; // Allow Pexels search
        }
    }


    if (finalImageToSave === null && searchTermForImage && pexelsKeyExists) {
      try {
        const imageResult = await getAnimalImage({ animalName: searchTermForImage });
        if (imageResult.imageUrl) {
          finalImageToSave = imageResult.imageUrl;
        }
         console.log(`[AnimalAction_Update_Firestore] Pexels search for ${searchTermForImage}. Result: ${finalImageToSave || 'none'}, Message: ${imageResult.errorMessage || 'none'}`);
      } catch (e: any) {
        console.error(`[AnimalAction_Update_Firestore] Error calling Pexels flow:`, e.message, e);
      }
    }
    
    if (finalImageToSave === null) { // Fallback if Pexels fails or was not called
        finalImageToSave = `https://placehold.co/300x200.png?text=${encodeURIComponent(nomeVulgar || 'Animal')}`;
    }
    
    const finalStatusConservacao = (statusConservacaoUserForm && statusConservacaoUserForm.trim() !== "") 
        ? statusConservacaoUserForm.trim().toUpperCase() 
        : (iucnDataResult.status || null);

    const updatedAnimalData = {
      f_nomecientifico: nomeCientifico,
      f_nome: nomeVulgar,
      f_nomes_alternativos: (nomesAlternativosForm && nomesAlternativosForm.trim() !== "") ? nomesAlternativosForm.trim() : null,
      f_imagem: finalImageToSave,
      f_status_conservacao: finalStatusConservacao,
      f_iucn_kingdomName: iucnDataResult.kingdomName || null,
      f_iucn_phylumName: iucnDataResult.phylumName || null,
      f_iucn_className: iucnDataResult.className || null,
      f_iucn_orderName: iucnDataResult.orderName || null,
      f_iucn_familyName: iucnDataResult.familyName || null,
      f_iucn_commonNames: iucnDataResult.commonNames || null,
      "data-ai-hint": (nomeVulgar ? nomeVulgar.toLowerCase().split(" ").slice(0,2).join(" ") : "animal") || "animal photo",
    };

    await updateDoc(animalDocRef, updatedAnimalData);
    
    revalidatePath("/animais", "layout");
    revalidatePath(`/animais/${id}`, "layout");
    revalidatePath(`/animais/${id}/editar`, "layout");
    revalidatePath("/", "layout");

    return { success: true, message: "Animal (espécie) atualizado com sucesso no Firestore!", data: { id, ...updatedAnimalData } as Animal };
  } catch (error: any) {
    console.error(`[FIRESTORE_ERROR:updateAnimal] Failed to update document '${id}' in '${ANIMAIS_COLLECTION}':`, error.code || 'N/A', error.message || 'No message', error);
     if (error.code === 'permission-denied' || error.message?.includes('permission-denied') || error.message?.includes('insufficient permissions')) {
        console.error(`[FIRESTORE_ERROR:updateAnimal] PERMISSION DENIED for document '${id}'. Check Firestore security rules.`);
    } else if (error.code === 'invalid-argument' || error.message?.includes('invalid-argument')) {
        console.error(`[FIRESTORE_ERROR:updateAnimal] INVALID ARGUMENT. Often due to undefined field values. Data being sent:`, JSON.stringify(updatedAnimalData, null, 2));
    }
    return { success: false, message: `Erro ao atualizar animal (espécie) no Firestore: ${error.message}` };
  }
}

export async function deleteAnimal(id: string): Promise<{ success: boolean; message: string }> {
  if (!id) return { success: false, message: "ID do animal é obrigatório para exclusão."};
  try {
    const q = query(collection(db, CADASTROS_COLLECTION), where("f_animalId", "==", id));
    const cadastrosSnapshot = await getDocs(q);
    if (!cadastrosSnapshot.empty) {
      return { success: false, message: "Não é possível excluir a espécie. Existem cadastros individuais associados a ela." };
    }

    const animalDocRef = doc(db, ANIMAIS_COLLECTION, id);
    await deleteDoc(animalDocRef);
    
    console.log(`[AnimalAction_Delete_Firestore] Animal with id ${id} deleted.`);
    revalidatePath("/animais", "layout");
    revalidatePath(`/animais/${id}`, "layout");
    revalidatePath("/", "layout");
    
    return { success: true, message: "Animal (espécie) excluído com sucesso do Firestore!" };
  } catch (error: any) {
    console.error(`[FIRESTORE_ERROR:deleteAnimal] Failed to delete document '${id}' from '${ANIMAIS_COLLECTION}':`, error.code, error.message);
    if (error.code === 'permission-denied' || error.message?.includes('permission-denied') || error.message?.includes('insufficient permissions')) {
        console.error(`[FIRESTORE_ERROR:deleteAnimal] PERMISSION DENIED for document '${id}'. Check Firestore security rules.`);
    }
    return { success: false, message: `Erro ao excluir animal (espécie) do Firestore: ${error.message}` };
  }
}

