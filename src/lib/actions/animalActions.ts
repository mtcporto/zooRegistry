
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/firebase"; // Use Firestore db instance
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, query, where, Timestamp } from "firebase/firestore";
import type { Animal } from "@/types";
import { getConservationStatusAndTaxonomy } from "@/ai/flows/get-conservation-status-flow";
import { getAnimalImage } from "@/ai/flows/get-animal-image-flow";

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
  } catch (error) {
    console.error("Error fetching animais:", error);
    return [];
  }
}

export async function getAnimalById(id: string): Promise<Animal | undefined> {
  try {
    if (!id) {
        console.warn("getAnimalById called with no id");
        return undefined;
    }
    const animalDocRef = doc(db, ANIMAIS_COLLECTION, id);
    const docSnap = await getDoc(animalDocRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Animal;
    }
    return undefined;
  } catch (error) {
    console.error(`Error fetching animal by id ${id}:`, error);
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
  const nomesAlternativos = formData.get("f_nomes_alternativos") as string | undefined;
  const imagemUrlFromForm = formData.get("f_imagem") as string | null;
  let statusConservacaoUser = formData.get("f_status_conservacao") as string | undefined;

  if (!nomeCientifico) return { success: false, message: "Nome científico é obrigatório." };
  if (!nomeVulgar) return { success: false, message: "Nome vulgar é obrigatório." };
  
  let iucnData: Awaited<ReturnType<typeof getConservationStatusAndTaxonomy>> = {
    status: null, kingdomName: null, phylumName: null, className: null, orderName: null, familyName: null, commonNames: null, errorMessage: undefined
  };

  if (iucnKeyExists) {
    console.log(`[AnimalAction_Add_Firestore] Attempting to fetch IUCN data for ${nomeCientifico}...`);
    try {
      iucnData = await getConservationStatusAndTaxonomy({ scientificName: nomeCientifico });
      console.log(`[AnimalAction_Add_Firestore] IUCN data for ${nomeCientifico} fetch response. Status: ${iucnData.status}, Class: ${iucnData.className}, Error: ${iucnData.errorMessage}`);
    } catch (e: any) {
        console.error(`[AnimalAction_Add_Firestore] Error calling IUCN flow:`, e.message);
    }
  } else {
    console.log("[AnimalAction_Add_Firestore] IUCN_REDLIST_API_TOKEN not set. Skipping IUCN data fetch.");
  }

  let finalImageToSave: string | undefined = "";
  const searchTermForImage = nomeCientifico || nomeVulgar;

  if (imagemUrlFromForm && imagemUrlFromForm.trim() !== "") {
    finalImageToSave = imagemUrlFromForm.trim();
  } else {
    if (searchTermForImage && pexelsKeyExists) {
      try {
        const imageResult = await getAnimalImage({ animalName: searchTermForImage });
        if (imageResult.imageUrl) {
          finalImageToSave = imageResult.imageUrl;
        }
        console.log(`[AnimalAction_Add_Firestore] Pexels search for ${searchTermForImage}. Result: ${finalImageToSave}, Message: ${imageResult.errorMessage}`);
      } catch (e: any) {
        console.error(`[AnimalAction_Add_Firestore] Error calling Pexels flow:`, e.message);
      }
    }
  }

  if (!finalImageToSave) {
    finalImageToSave = `https://placehold.co/300x200.png?text=${encodeURIComponent(nomeVulgar || 'Animal')}`;
  }

  const finalStatus = (statusConservacaoUser && statusConservacaoUser.trim() !== "") ? statusConservacaoUser.trim().toUpperCase() : iucnData.status;

  const newAnimalData: Omit<Animal, 'id'> = {
    f_nomecientifico: nomeCientifico,
    f_nome: nomeVulgar,
    f_nomes_alternativos: nomesAlternativos || undefined,
    f_imagem: finalImageToSave,
    f_status_conservacao: finalStatus || undefined,
    f_iucn_kingdomName: iucnData.kingdomName || undefined,
    f_iucn_phylumName: iucnData.phylumName || undefined,
    f_iucn_className: iucnData.className || undefined,
    f_iucn_orderName: iucnData.orderName || undefined,
    f_iucn_familyName: iucnData.familyName || undefined,
    f_iucn_commonNames: iucnData.commonNames || undefined,
    "data-ai-hint": nomeVulgar.toLowerCase().split(" ").slice(0,2).join(" ") || "animal photo",
  };
  
  try {
    const docRef = await addDoc(collection(db, ANIMAIS_COLLECTION), newAnimalData);
    revalidatePath("/animais", "layout");
    revalidatePath("/", "layout");
    return { success: true, message: "Animal (espécie) adicionado com sucesso ao Firestore!", data: { id: docRef.id, ...newAnimalData } };
  } catch (error) {
    console.error("Error adding animal to Firestore:", error);
    return { success: false, message: "Erro ao adicionar animal (espécie) ao Firestore." };
  }
}

export async function updateAnimal(id: string, formData: FormData): Promise<{ success: boolean; message: string; data?: Animal }> {
  const pexelsKeyExists = !!process.env.PEXELS_API_KEY;
  const iucnKeyExists = !!process.env.IUCN_REDLIST_API_TOKEN;

  const nomeCientifico = formData.get("f_nomecientifico") as string;
  const nomeVulgar = formData.get("f_nome") as string;
  const nomesAlternativos = formData.get("f_nomes_alternativos") as string | undefined;
  const imagemUrlFromForm = formData.get("f_imagem") as string | null;
  let statusConservacaoUser = formData.get("f_status_conservacao") as string | undefined;
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

    let iucnDataResult = {
      status: animalOriginal.f_status_conservacao,
      kingdomName: animalOriginal.f_iucn_kingdomName,
      phylumName: animalOriginal.f_iucn_phylumName,
      className: animalOriginal.f_iucn_className,
      orderName: animalOriginal.f_iucn_orderName,
      familyName: animalOriginal.f_iucn_familyName,
      commonNames: animalOriginal.f_iucn_commonNames,
    };

    if (iucnKeyExists && (rebuscarIUCN || (animalOriginal.f_nomecientifico !== nomeCientifico && !statusConservacaoUser))) {
      console.log(`[AnimalAction_Update_Firestore] Re-fetching IUCN data for ${nomeCientifico}`);
      try {
        const fetchedIUCN = await getConservationStatusAndTaxonomy({ scientificName: nomeCientifico });
        iucnDataResult = {
            status: fetchedIUCN.status, // This is IUCN code
            kingdomName: fetchedIUCN.kingdomName,
            phylumName: fetchedIUCN.phylumName,
            className: fetchedIUCN.className,
            orderName: fetchedIUCN.orderName,
            familyName: fetchedIUCN.familyName,
            commonNames: fetchedIUCN.commonNames,
        };
        console.log(`[AnimalAction_Update_Firestore] IUCN re-fetch for ${nomeCientifico}. Status: ${iucnDataResult.status}, Class: ${iucnDataResult.className}, Error: ${fetchedIUCN.errorMessage}`);
      } catch (e: any) {
          console.error(`[AnimalAction_Update_Firestore] Error re-fetching IUCN data:`, e.message);
      }
    }

    let finalImageToSave: string | undefined = animalOriginal.f_imagem;
    let attemptPexelsSearch = false;
    const searchTermForImage = nomeCientifico || nomeVulgar;

    if (imagemUrlFromForm && imagemUrlFromForm.trim() !== "") {
      if (imagemUrlFromForm.trim() !== animalOriginal.f_imagem) {
          finalImageToSave = imagemUrlFromForm.trim();
      }
    } else if (typeof imagemUrlFromForm === 'string' && imagemUrlFromForm.trim() === "") {
      attemptPexelsSearch = true;
    } else if (!animalOriginal.f_imagem && imagemUrlFromForm === null) {
      attemptPexelsSearch = true;
    }

    if (attemptPexelsSearch && searchTermForImage && pexelsKeyExists) {
      try {
        const imageResult = await getAnimalImage({ animalName: searchTermForImage });
        if (imageResult.imageUrl) {
          finalImageToSave = imageResult.imageUrl;
        }
        console.log(`[AnimalAction_Update_Firestore] Pexels search for ${searchTermForImage}. Result: ${finalImageToSave}, Message: ${imageResult.errorMessage}`);
      } catch (e: any) {
        console.error(`[AnimalAction_Update_Firestore] Error calling Pexels flow:`, e.message);
      }
    }
    
    if (attemptPexelsSearch && !finalImageToSave) { 
        finalImageToSave = `https://placehold.co/300x200.png?text=${encodeURIComponent(nomeVulgar || 'Animal')}`;
    }
    
    const finalStatus = (statusConservacaoUser && statusConservacaoUser.trim() !== "") ? statusConservacaoUser.trim().toUpperCase() : iucnDataResult.status;

    const updatedAnimalData = {
      f_nomecientifico: nomeCientifico,
      f_nome: nomeVulgar,
      f_nomes_alternativos: nomesAlternativos || animalOriginal.f_nomes_alternativos || undefined,
      f_imagem: finalImageToSave,
      f_status_conservacao: finalStatus || undefined,
      f_iucn_kingdomName: iucnDataResult.kingdomName || undefined,
      f_iucn_phylumName: iucnDataResult.phylumName || undefined,
      f_iucn_className: iucnDataResult.className || undefined,
      f_iucn_orderName: iucnDataResult.orderName || undefined,
      f_iucn_familyName: iucnDataResult.familyName || undefined,
      f_iucn_commonNames: iucnDataResult.commonNames || undefined,
      "data-ai-hint": nomeVulgar.toLowerCase().split(" ").slice(0,2).join(" ") || "animal photo",
    };

    await updateDoc(animalDocRef, updatedAnimalData);
    
    revalidatePath("/animais", "layout");
    revalidatePath(`/animais/${id}`, "layout");
    revalidatePath(`/animais/${id}/editar`, "layout");
    revalidatePath("/", "layout");

    return { success: true, message: "Animal (espécie) atualizado com sucesso no Firestore!", data: { id, ...updatedAnimalData } };
  } catch (error) {
    console.error("Error updating animal in Firestore:", error);
    return { success: false, message: "Erro ao atualizar animal (espécie) no Firestore." };
  }
}

export async function deleteAnimal(id: string): Promise<{ success: boolean; message: string }> {
  if (!id) return { success: false, message: "ID do animal é obrigatório para exclusão."};
  try {
    // Check if there are associated cadastros
    const q = query(collection(db, CADASTROS_COLLECTION), where("f_animalId", "==", id));
    const cadastrosSnapshot = await getDocs(q);
    if (!cadastrosSnapshot.empty) {
      return { success: false, message: "Não é possível excluir a espécie. Existem cadastros individuais associados a ela." };
    }

    const animalDocRef = doc(db, ANIMAIS_COLLECTION, id);
    await deleteDoc(animalDocRef);
    
    console.log(`[AnimalAction_Delete_Firestore] Animal with id ${id} deleted.`);
    revalidatePath("/animais", "layout");
    revalidatePath(`/animais/${id}`, "layout"); // Invalidate specific animal page if it was visited
    revalidatePath("/", "layout");
    
    return { success: true, message: "Animal (espécie) excluído com sucesso do Firestore!" };
  } catch (error) {
    console.error("Error deleting animal from Firestore:", error);
    return { success: false, message: "Erro ao excluir animal (espécie) do Firestore." };
  }
}
