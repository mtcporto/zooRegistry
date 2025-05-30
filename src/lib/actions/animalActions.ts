
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
  const nomeCientifico = formData.get("f_nomecientifico") as string;
  const nomeVulgar = formData.get("f_nome") as string;
  const nomesAlternativos = formData.get("f_nomes_alternativos") as string | undefined;
  let imagem = formData.get("f_imagem") as string | undefined;
  let statusConservacaoUser = formData.get("f_status_conservacao") as string | undefined;

  if (!nomeCientifico) return { success: false, message: "Nome científico é obrigatório." };
  if (!nomeVulgar) return { success: false, message: "Nome vulgar é obrigatório." };
  
  let iucnData: Awaited<ReturnType<typeof getConservationStatusAndTaxonomy>> = {
    status: null, kingdomName: null, phylumName: null, className: null, orderName: null, familyName: null, commonNames: null
  };

  if (process.env.IUCN_REDLIST_API_TOKEN) {
    try {
      console.log(`[AnimalAction_Add] Attempting to fetch IUCN data for ${nomeCientifico}...`);
      iucnData = await getConservationStatusAndTaxonomy({ scientificName: nomeCientifico });
      if (iucnData.errorMessage && !iucnData.status) { 
        console.log(`[AnimalAction_Add] IUCN data fetch for ${nomeCientifico}: ${iucnData.errorMessage}`);
      } else {
        console.log(`[AnimalAction_Add] IUCN data for ${nomeCientifico} successfully fetched/processed. Status: ${iucnData.status}`);
      }
    } catch (e) {
        console.error(`[AnimalAction_Add] Error fetching IUCN data for ${nomeCientifico}:`, e);
    }
  } else {
    console.log("[AnimalAction_Add] IUCN_REDLIST_API_TOKEN not set. Skipping IUCN data fetch.");
  }

  const searchTermForImage = nomeCientifico || nomeVulgar;
  if ((!imagem || imagem.trim() === "") && searchTermForImage && process.env.PEXELS_API_KEY) {
    try {
      console.log(`[AnimalAction_Add] Attempting to fetch image for "${searchTermForImage}" from Pexels...`);
      const imageResult = await getAnimalImage({ animalName: searchTermForImage });
      console.log(`[AnimalAction_Add] Pexels attempt for "${searchTermForImage}": URL=${imageResult.imageUrl}, Error=${imageResult.errorMessage}`);
      if (imageResult.imageUrl) {
        imagem = imageResult.imageUrl;
        console.log(`[AnimalAction_Add] Using Pexels image for ${searchTermForImage}: ${imagem}`);
      } else {
        console.log(`[AnimalAction_Add] Pexels did not return an image for ${searchTermForImage}.`);
      }
    } catch (e) {
      console.error(`[AnimalAction_Add] Error fetching image from Pexels for "${searchTermForImage}":`, e);
    }
  } else if (!imagem || imagem.trim() === "") {
     console.log(`[AnimalAction_Add] No image provided and Pexels API key not set or no search term. Will use placeholder.`);
  }


  const finalStatus = (statusConservacaoUser && statusConservacaoUser.trim() !== "") ? statusConservacaoUser.trim().toUpperCase() : iucnData.status;
  const finalImage = imagem && imagem.trim() !== "" ? imagem : `https://placehold.co/300x200.png?text=${encodeURIComponent(nomeVulgar)}`;
  console.log(`[AnimalAction_Add] Final image for ${nomeVulgar}: ${finalImage}`);

  const newAnimal: Animal = {
    id: generateId(),
    f_nomecientifico: nomeCientifico,
    f_nome: nomeVulgar,
    f_nomes_alternativos: nomesAlternativos,
    f_imagem: finalImage,
    f_status_conservacao: finalStatus,
    f_iucn_kingdomName: iucnData.kingdomName,
    f_iucn_phylumName: iucnData.phylumName,
    f_iucn_className: iucnData.className,
    f_iucn_orderName: iucnData.orderName,
    f_iucn_familyName: iucnData.familyName,
    f_iucn_commonNames: iucnData.commonNames,
  };
  
  (newAnimal as any)['data-ai-hint'] = nomeVulgar.toLowerCase().split(" ").slice(0,2).join(" ") || "animal photo";

  db.animais.push(newAnimal);
  revalidatePath("/animais");
  revalidatePath("/"); 

  return { success: true, message: "Animal (espécie) adicionado com sucesso!", data: newAnimal };
}

export async function updateAnimal(id: string, formData: FormData): Promise<{ success: boolean; message: string; data?: Animal }> {
  const nomeCientifico = formData.get("f_nomecientifico") as string;
  const nomeVulgar = formData.get("f_nome") as string;
  const nomesAlternativos = formData.get("f_nomes_alternativos") as string | undefined;
  let imagem = formData.get("f_imagem") as string | undefined; // Image URL from form
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
  };

  if (rebuscarIUCN && process.env.IUCN_REDLIST_API_TOKEN) {
     try {
      console.log(`[AnimalAction_Update] Re-fetching IUCN data for ${nomeCientifico}...`);
      const fetchedIUCNData = await getConservationStatusAndTaxonomy({ scientificName: nomeCientifico });
      if (fetchedIUCNData.errorMessage && !fetchedIUCNData.status) {
         console.log(`[AnimalAction_Update] IUCN data re-fetch for ${nomeCientifico}: ${fetchedIUCNData.errorMessage}`);
      } else {
        console.log(`[AnimalAction_Update] IUCN data for ${nomeCientifico} successfully re-fetched. Status: ${fetchedIUCNData.status}`);
        iucnData = { // Update with newly fetched data
            status: fetchedIUCNData.status,
            kingdomName: fetchedIUCNData.kingdomName,
            phylumName: fetchedIUCNData.phylumName,
            className: fetchedIUCNData.className,
            orderName: fetchedIUCNData.orderName,
            familyName: fetchedIUCNData.familyName,
            commonNames: fetchedIUCNData.commonNames,
        };
      }
    } catch (e) {
        console.error(`[AnimalAction_Update] Error re-fetching IUCN data for ${nomeCientifico}:`, e);
    }
  } else if (rebuscarIUCN) {
    console.log("[AnimalAction_Update] IUCN_REDLIST_API_TOKEN not set, but re-fetch was requested. Skipping IUCN data fetch.");
  }

  // Image handling logic:
  // Case 1: User cleared the image field (submitted as empty string).
  // Case 2: User provided a new image URL.
  // Case 3: User didn't change the image field (it keeps its original value from form, could be a URL or empty if it was cleared).
  // If 'imagem' from form is empty/cleared, try Pexels. If Pexels fails, use placeholder.
  // If 'imagem' from form has a value, use that value.
  
  const searchTermForImage = nomeCientifico || nomeVulgar;
  let finalImage = animalOriginal.f_imagem; // Default to original image

  if (typeof imagem === 'string' && imagem.trim() === "") { // User explicitly cleared the image field or it was empty
      console.log(`[AnimalAction_Update] Image field was empty for ${nomeVulgar}. Attempting Pexels.`);
      if (searchTermForImage && process.env.PEXELS_API_KEY) {
          try {
              const imageResult = await getAnimalImage({ animalName: searchTermForImage });
              console.log(`[AnimalAction_Update] Pexels attempt for "${searchTermForImage}": URL=${imageResult.imageUrl}, Error=${imageResult.errorMessage}`);
              if (imageResult.imageUrl) {
                  finalImage = imageResult.imageUrl;
                  console.log(`[AnimalAction_Update] Using Pexels image for ${searchTermForImage}: ${finalImage}`);
              } else {
                  finalImage = `https://placehold.co/300x200.png?text=${encodeURIComponent(nomeVulgar)}`;
                  console.log(`[AnimalAction_Update] Pexels did not return an image for ${searchTermForImage}. Using placeholder: ${finalImage}`);
              }
          } catch (e) {
              console.error(`[AnimalAction_Update] Error fetching image from Pexels for "${searchTermForImage}":`, e);
              finalImage = `https://placehold.co/300x200.png?text=${encodeURIComponent(nomeVulgar)}`;
          }
      } else {
          finalImage = `https://placehold.co/300x200.png?text=${encodeURIComponent(nomeVulgar)}`;
          console.log(`[AnimalAction_Update] No Pexels key or search term for empty image field. Using placeholder: ${finalImage}`);
      }
  } else if (typeof imagem === 'string' && imagem.trim() !== "") { // User provided a new, non-empty image URL
      finalImage = imagem;
      console.log(`[AnimalAction_Update] User provided new image URL for ${nomeVulgar}: ${finalImage}`);
  }
  // If 'imagem' from formData was undefined (field not submitted, which is unlikely for text inputs unless disabled),
  // or if it was not an empty string and not a new non-empty string, 'finalImage' remains 'animalOriginal.f_imagem'.
  // This case should not happen if the form field is always present.
  else {
    console.log(`[AnimalAction_Update] Image field for ${nomeVulgar} was not explicitly cleared nor a new URL provided. Retaining original: ${finalImage}`);
  }
  console.log(`[AnimalAction_Update] Final image for ${nomeVulgar}: ${finalImage}`);


  const finalStatus = (statusConservacaoUser && statusConservacaoUser.trim() !== "") ? statusConservacaoUser.trim().toUpperCase() : iucnData.status;

  const updatedAnimal: Animal = {
    ...animalOriginal,
    f_nomecientifico: nomeCientifico,
    f_nome: nomeVulgar,
    f_nomes_alternativos: nomesAlternativos,
    f_imagem: finalImage,
    f_status_conservacao: finalStatus,
    f_iucn_kingdomName: iucnData.kingdomName,
    f_iucn_phylumName: iucnData.phylumName,
    f_iucn_className: iucnData.className,
    f_iucn_orderName: iucnData.orderName,
    f_iucn_familyName: iucnData.familyName,
    f_iucn_commonNames: iucnData.commonNames,
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

