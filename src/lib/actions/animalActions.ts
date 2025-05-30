
"use server";

import { revalidatePath } from "next/cache";
import { db, generateId } from "@/lib/mockDb";
import type { Animal } from "@/types";
import { getConservationStatusAndTaxonomy } from "@/ai/flows/get-conservation-status-flow";
import { getAnimalImage } from "@/ai/flows/get-animal-image-flow";

export async function getAnimais(): Promise<Animal[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return db.animais;
}

export async function getAnimalById(id: string): Promise<Animal | undefined> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return db.animais.find(a => a.id === id);
}

export async function addAnimal(formData: FormData): Promise<{ success: boolean; message: string; data?: Animal }> {
  const pexelsKeyExists = !!process.env.PEXELS_API_KEY;
  const pexelsKeyPreview = process.env.PEXELS_API_KEY ? process.env.PEXELS_API_KEY.substring(0, 5) + "..." : "NOT SET";
  console.log(`[AnimalAction_Add] PEXELS_API_KEY check: Exists=${pexelsKeyExists}, Preview=${pexelsKeyPreview}`);
  console.log(`[AnimalAction_Add] IUCN_REDLIST_API_TOKEN check: Exists=${!!process.env.IUCN_REDLIST_API_TOKEN}`);

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

  if (process.env.IUCN_REDLIST_API_TOKEN) {
    console.log(`[AnimalAction_Add] Attempting to fetch IUCN data for ${nomeCientifico}...`);
    try {
      iucnData = await getConservationStatusAndTaxonomy({ scientificName: nomeCientifico });
      if (iucnData.errorMessage) { // Check if there was any message, even if some data was returned
        console.log(`[AnimalAction_Add] IUCN data fetch for ${nomeCientifico} response: ${iucnData.errorMessage}. Status: ${iucnData.status}, Class: ${iucnData.className}`);
      } else {
        console.log(`[AnimalAction_Add] IUCN data for ${nomeCientifico} successfully fetched. Status: ${iucnData.status}, Class: ${iucnData.className}`);
      }
    } catch (e: any) {
        console.error(`[AnimalAction_Add] Error calling getConservationStatusAndTaxonomy flow for IUCN:`, e.message);
    }
  } else {
    console.log("[AnimalAction_Add] IUCN_REDLIST_API_TOKEN not set. Skipping IUCN data fetch.");
  }

  let finalImageToSave: string | undefined;
  const searchTermForImage = nomeCientifico || nomeVulgar;

  console.log(`[AnimalAction_Add] Image handling: imagemUrlFromForm="${imagemUrlFromForm}", searchTermForImage="${searchTermForImage}"`);

  if (imagemUrlFromForm && imagemUrlFromForm.trim() !== "") {
    finalImageToSave = imagemUrlFromForm.trim();
    console.log(`[AnimalAction_Add] User provided image URL: ${finalImageToSave}`);
  } else {
    console.log(`[AnimalAction_Add] Image URL from form is empty or not provided.`);
    if (searchTermForImage && pexelsKeyExists) {
      console.log(`[AnimalAction_Add] Conditions met for Pexels search. Calling getAnimalImage for "${searchTermForImage}"...`);
      try {
        const imageResult = await getAnimalImage({ animalName: searchTermForImage });
        if (imageResult.imageUrl) {
          finalImageToSave = imageResult.imageUrl;
          console.log(`[AnimalAction_Add] Pexels search successful. Using Pexels image: ${finalImageToSave}`);
        } else {
          console.log(`[AnimalAction_Add] Pexels search completed, but no image URL returned. Message: ${imageResult.errorMessage}`);
        }
      } catch (e: any) {
        console.error(`[AnimalAction_Add] Error calling getAnimalImage flow for Pexels:`, e.message);
      }
    } else {
      console.log(`[AnimalAction_Add] Conditions NOT met for Pexels search. SearchTerm: ${searchTermForImage}, PexelsKeyAvailable: ${pexelsKeyExists}`);
    }
  }

  if (!finalImageToSave) {
    finalImageToSave = `https://placehold.co/300x200.png?text=${encodeURIComponent(nomeVulgar || 'Animal')}`;
    console.log(`[AnimalAction_Add] No image obtained from user or Pexels. Using placeholder: ${finalImageToSave}`);
  }

  const finalStatus = (statusConservacaoUser && statusConservacaoUser.trim() !== "") ? statusConservacaoUser.trim().toUpperCase() : iucnData.status;

  const newAnimal: Animal = {
    id: generateId(),
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
  };
  
  (newAnimal as any)['data-ai-hint'] = nomeVulgar.toLowerCase().split(" ").slice(0,2).join(" ") || "animal photo";

  db.animais.push(newAnimal);
  revalidatePath("/animais");
  revalidatePath("/"); 

  return { success: true, message: "Animal (espécie) adicionado com sucesso!", data: newAnimal };
}

export async function updateAnimal(id: string, formData: FormData): Promise<{ success: boolean; message: string; data?: Animal }> {
  const pexelsKeyExists = !!process.env.PEXELS_API_KEY;
  const pexelsKeyPreview = process.env.PEXELS_API_KEY ? process.env.PEXELS_API_KEY.substring(0, 5) + "..." : "NOT SET";
  console.log(`[AnimalAction_Update] ID: ${id}. PEXELS_API_KEY check: Exists=${pexelsKeyExists}, Preview=${pexelsKeyPreview}`);
  console.log(`[AnimalAction_Update] IUCN_REDLIST_API_TOKEN check: Exists=${!!process.env.IUCN_REDLIST_API_TOKEN}`);


  const nomeCientifico = formData.get("f_nomecientifico") as string;
  const nomeVulgar = formData.get("f_nome") as string;
  const nomesAlternativos = formData.get("f_nomes_alternativos") as string | undefined;
  const imagemUrlFromForm = formData.get("f_imagem") as string | null; // Can be empty string if cleared, or null if not in form
  let statusConservacaoUser = formData.get("f_status_conservacao") as string | undefined;
  const rebuscarIUCN = formData.get("f_rebuscar_iucn") === "true";

  if (!nomeCientifico) return { success: false, message: "Nome científico é obrigatório." };
  if (!nomeVulgar) return { success: false, message: "Nome vulgar é obrigatório." };

  const animalIndex = db.animais.findIndex(a => a.id === id);
  if (animalIndex === -1) {
    return { success: false, message: "Animal (espécie) não encontrado." };
  }
  
  const animalOriginal = db.animais[animalIndex];
  let iucnData = {
    status: animalOriginal.f_status_conservacao,
    kingdomName: animalOriginal.f_iucn_kingdomName,
    phylumName: animalOriginal.f_iucn_phylumName,
    className: animalOriginal.f_iucn_className,
    orderName: animalOriginal.f_iucn_orderName,
    familyName: animalOriginal.f_iucn_familyName,
    commonNames: animalOriginal.f_iucn_commonNames,
    errorMessage: undefined as string | undefined,
  };

  if (rebuscarIUCN || (animalOriginal.f_nomecientifico !== nomeCientifico && !statusConservacaoUser) ) {
    if (process.env.IUCN_REDLIST_API_TOKEN) {
      console.log(`[AnimalAction_Update] Re-fetching IUCN data for ${nomeCientifico} (rebuscarIUCN: ${rebuscarIUCN}, nameChanged: ${animalOriginal.f_nomecientifico !== nomeCientifico})...`);
      try {
        const fetchedIUCNData = await getConservationStatusAndTaxonomy({ scientificName: nomeCientifico });
        if (fetchedIUCNData.errorMessage) {
           console.log(`[AnimalAction_Update] IUCN data re-fetch for ${nomeCientifico} response: ${fetchedIUCNData.errorMessage}. Status: ${fetchedIUCNData.status}, Class: ${fetchedIUCNData.className}`);
        } else {
          console.log(`[AnimalAction_Update] IUCN data for ${nomeCientifico} successfully re-fetched. Status: ${fetchedIUCNData.status}, Class: ${fetchedIUCNData.className}`);
        }
        // Update iucnData regardless of error message, as some fields might still be populated
        iucnData = {
            status: fetchedIUCNData.status,
            kingdomName: fetchedIUCNData.kingdomName,
            phylumName: fetchedIUCNData.phylumName,
            className: fetchedIUCNData.className,
            orderName: fetchedIUCNData.orderName,
            familyName: fetchedIUCNData.familyName,
            commonNames: fetchedIUCNData.commonNames,
            errorMessage: fetchedIUCNData.errorMessage,
        };
      } catch (e: any) {
          console.error(`[AnimalAction_Update] Error re-fetching IUCN data for ${nomeCientifico}:`, e.message);
          iucnData.errorMessage = e.message;
      }
    } else {
      console.log("[AnimalAction_Update] IUCN_REDLIST_API_TOKEN not set, but re-fetch was requested/needed. Skipping IUCN data fetch.");
    }
  }

  let finalImageToSave: string | undefined = animalOriginal.f_imagem;
  let attemptPexelsSearch = false;
  const searchTermForImage = nomeCientifico || nomeVulgar;

  console.log(`[AnimalAction_Update] Image handling: originalImage="${animalOriginal.f_imagem}", imagemUrlFromForm="${imagemUrlFromForm}", searchTermForImage="${searchTermForImage}"`);

  if (imagemUrlFromForm && imagemUrlFromForm.trim() !== "") {
    // User provided a specific image URL
    if (imagemUrlFromForm.trim() !== animalOriginal.f_imagem) {
        finalImageToSave = imagemUrlFromForm.trim();
        console.log(`[AnimalAction_Update] User provided new image URL: ${finalImageToSave}`);
    } else {
        console.log(`[AnimalAction_Update] User provided image URL is the same as original: ${finalImageToSave}. No Pexels search.`);
    }
  } else if (typeof imagemUrlFromForm === 'string' && imagemUrlFromForm.trim() === "") {
    // User explicitly cleared the image field
    console.log(`[AnimalAction_Update] Image field explicitly cleared by user. Attempting Pexels search.`);
    attemptPexelsSearch = true;
  } else if (!animalOriginal.f_imagem && imagemUrlFromForm === null) { // imagemUrlFromForm is null if field not present/touched
    // No original image, and form field was not touched (implies desire for auto-fetch on an item that never had an image)
    console.log(`[AnimalAction_Update] No original image and form field not touched/provided. Attempting Pexels search.`);
    attemptPexelsSearch = true;
  } else {
    console.log(`[AnimalAction_Update] No explicit change to image or clearing. Current image: ${finalImageToSave}. No Pexels search.`);
  }

  if (attemptPexelsSearch) {
    if (searchTermForImage && pexelsKeyExists) {
      console.log(`[AnimalAction_Update] Conditions met for Pexels search. Calling getAnimalImage for "${searchTermForImage}"...`);
      try {
        const imageResult = await getAnimalImage({ animalName: searchTermForImage });
        if (imageResult.imageUrl) {
          finalImageToSave = imageResult.imageUrl;
          console.log(`[AnimalAction_Update] Pexels search successful. Using Pexels image: ${finalImageToSave}`);
        } else {
          console.log(`[AnimalAction_Update] Pexels search completed, but no image URL returned. Message: ${imageResult.errorMessage}`);
        }
      } catch (e: any) {
        console.error(`[AnimalAction_Update] Error calling getAnimalImage flow for Pexels:`, e.message);
      }
    } else {
      console.log(`[AnimalAction_Update] Conditions for Pexels search met, but no search term or Pexels key. SearchTerm: ${searchTermForImage}, PexelsKeyAvailable: ${pexelsKeyExists}`);
    }
    // If Pexels search was attempted but failed to yield an image, we fall through to placeholder logic
    if (!finalImageToSave) {
        finalImageToSave = `https://placehold.co/300x200.png?text=${encodeURIComponent(nomeVulgar || 'Animal')}`;
        console.log(`[AnimalAction_Update] Pexels search attempted but failed or conditions not fully met. Using placeholder: ${finalImageToSave}`);
    }
  }
  
  if (!finalImageToSave) { // Fallback if, for any reason, finalImageToSave is still not set
    finalImageToSave = `https://placehold.co/300x200.png?text=${encodeURIComponent(nomeVulgar || 'Animal')}`;
    console.log(`[AnimalAction_Update] Fallback: No image obtained from user or Pexels (after all checks). Using placeholder: ${finalImageToSave}`);
  }
  
  const finalStatus = (statusConservacaoUser && statusConservacaoUser.trim() !== "") ? statusConservacaoUser.trim().toUpperCase() : iucnData.status;

  const updatedAnimal: Animal = {
    ...animalOriginal,
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
  };

  (updatedAnimal as any)['data-ai-hint'] = nomeVulgar.toLowerCase().split(" ").slice(0,2).join(" ") || "animal photo";
  
  db.animais[animalIndex] = updatedAnimal;

  revalidatePath("/animais");
  revalidatePath(`/animais/${id}`);
  revalidatePath(`/animais/${id}/editar`);
  revalidatePath("/");

  return { success: true, message: "Animal (espécie) atualizado com sucesso!", data: updatedAnimal };
}


export async function deleteAnimal(id: string): Promise<{ success: boolean; message: string }> {
  const animalIndex = db.animais.findIndex(a => a.id === id);
  if (animalIndex === -1) {
    return { success: false, message: "Animal (espécie) não encontrado." };
  }

  const hasCadastros = db.cadastros.some(cadastro => cadastro.f_animalId === id);
  if (hasCadastros) {
    return { success: false, message: "Não é possível excluir a espécie. Existem cadastros individuais associados a ela." };
  }

  db.animais.splice(animalIndex, 1);
  console.log(`[AnimalAction_Delete] Animal with id ${id} deleted.`);
  
  revalidatePath("/animais");
  revalidatePath(`/animais/${id}`);
  revalidatePath("/");
  
  return { success: true, message: "Animal (espécie) excluído com sucesso!" };
}


    