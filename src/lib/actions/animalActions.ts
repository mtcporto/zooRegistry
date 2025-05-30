
"use server";

import { revalidatePath } from "next/cache";
import { db, generateId } from "@/lib/mockDb";
import type { Animal } from "@/types";
import { getConservationStatusAndTaxonomy } from "@/ai/flows/get-conservation-status-flow"; // Atualizado o nome
import { getAnimalImage } from "@/ai/flows/get-animal-image-flow";

export async function getAnimais(): Promise<Animal[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  // Não precisa mais buscar classe/ordem/família separadamente
  return db.animais;
}

export async function getAnimalById(id: string): Promise<Animal | undefined> {
  await new Promise(resolve => setTimeout(resolve, 300));
  // Não precisa mais buscar classe/ordem/família separadamente
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
      console.log(`Attempting to fetch IUCN data for ${nomeCientifico}...`);
      iucnData = await getConservationStatusAndTaxonomy({ scientificName: nomeCientifico });
      if (iucnData.errorMessage && !iucnData.status) { // Log error if significant
        console.log(`IUCN data fetch for ${nomeCientifico}: ${iucnData.errorMessage}`);
      } else {
        console.log(`IUCN data for ${nomeCientifico} successfully fetched.`);
      }
    } catch (e) {
        console.error(`Error fetching IUCN data for ${nomeCientifico}:`, e);
    }
  }

  const searchTermForImage = nomeCientifico || nomeVulgar;
  if ((!imagem || imagem.trim() === "") && searchTermForImage && process.env.PEXELS_API_KEY) {
    try {
      console.log(`Attempting to fetch image for "${searchTermForImage}" from Pexels...`);
      const imageResult = await getAnimalImage({ animalName: searchTermForImage });
      if (imageResult.imageUrl) {
        imagem = imageResult.imageUrl;
        console.log(`Image for "${searchTermForImage}" successfully fetched from Pexels: ${imagem}`);
      } else if (imageResult.errorMessage) {
        console.log(`Pexels image fetch for "${searchTermForImage}": ${imageResult.errorMessage}`);
      }
    } catch (e) {
      console.error(`Error fetching image from Pexels for "${searchTermForImage}":`, e);
    }
  }

  const finalStatus = (statusConservacaoUser && statusConservacaoUser.trim() !== "") ? statusConservacaoUser.trim().toUpperCase() : iucnData.status;

  const newAnimal: Animal = {
    id: generateId(),
    f_nomecientifico: nomeCientifico,
    f_nome: nomeVulgar,
    f_nomes_alternativos: nomesAlternativos,
    f_imagem: imagem && imagem.trim() !== "" ? imagem : `https://placehold.co/300x200.png?text=${encodeURIComponent(nomeVulgar)}`,
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
  let imagem = formData.get("f_imagem") as string | undefined;
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
      console.log(`Re-fetching IUCN data for ${nomeCientifico} (update)...`);
      const fetchedIUCNData = await getConservationStatusAndTaxonomy({ scientificName: nomeCientifico });
      if (fetchedIUCNData.errorMessage && !fetchedIUCNData.status) {
         console.log(`IUCN data re-fetch for ${nomeCientifico}: ${fetchedIUCNData.errorMessage}`);
      } else {
        console.log(`IUCN data for ${nomeCientifico} successfully re-fetched.`);
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
        console.error(`Error re-fetching IUCN data for ${nomeCientifico}:`, e);
    }
  }

  const userProvidedImage = formData.has("f_imagem");
  const currentImageOnForm = formData.get("f_imagem") as string | undefined;
  const searchTermForImage = nomeCientifico || nomeVulgar;

  if (userProvidedImage && (!currentImageOnForm || currentImageOnForm.trim() === "")) { // User cleared the image field
     if (searchTermForImage && process.env.PEXELS_API_KEY) {
        try {
            console.log(`Attempting to fetch image for "${searchTermForImage}" from Pexels (update - field cleared)...`);
            const imageResult = await getAnimalImage({ animalName: searchTermForImage });
            if (imageResult.imageUrl) {
                imagem = imageResult.imageUrl;
                console.log(`Image for "${searchTermForImage}" successfully fetched from Pexels: ${imagem}`);
            } else if (imageResult.errorMessage) {
                console.log(`Pexels image fetch for "${searchTermForImage}": ${imageResult.errorMessage}`);
                imagem = `https://placehold.co/300x200.png?text=${encodeURIComponent(nomeVulgar)}`; // Fallback if Pexels fails after clearing
            }
            } catch (e) {
                console.error(`Error fetching image from Pexels for "${searchTermForImage}":`, e);
                imagem = `https://placehold.co/300x200.png?text=${encodeURIComponent(nomeVulgar)}`;
            }
     } else {
        imagem = `https://placehold.co/300x200.png?text=${encodeURIComponent(nomeVulgar)}`;
     }
  } else if (userProvidedImage) { // User provided a new image URL or kept the existing one
    imagem = currentImageOnForm;
  } else { // User didn't touch the image field, keep original
    imagem = animalOriginal.f_imagem;
  }


  const finalStatus = (statusConservacaoUser && statusConservacaoUser.trim() !== "") ? statusConservacaoUser.trim().toUpperCase() : iucnData.status;

  const updatedAnimal: Animal = {
    ...animalOriginal,
    f_nomecientifico: nomeCientifico,
    f_nome: nomeVulgar,
    f_nomes_alternativos: nomesAlternativos,
    f_imagem: imagem && imagem.trim() !== "" ? imagem : `https://placehold.co/300x200.png?text=${encodeURIComponent(nomeVulgar)}`,
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
  
  revalidatePath("/animais");
  revalidatePath(`/animais/${id}`);
  revalidatePath("/");
  
  return { success: true, message: "Animal (espécie) excluído com sucesso!" };
}
