"use server";

import { revalidatePath } from "next/cache";
import { db, generateId } from "@/lib/mockDb";
import type { Animal } from "@/types";
import { getClassById } from "./classeActions";
import { getOrdemById } from "./ordemActions";
import { getFamiliaById } from "./familiaActions";
import { getConservationStatus } from "@/ai/flows/get-conservation-status-flow";
import { getAnimalImage } from "@/ai/flows/get-animal-image-flow"; // Import the new flow

export async function getAnimais(): Promise<Animal[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return Promise.all(db.animais.map(async (animal) => {
    const classe = await getClassById(animal.f_classeId);
    const ordem = await getOrdemById(animal.f_ordemId);
    const familia = await getFamiliaById(animal.f_familiaId);
    return {
      ...animal,
      f_classeNome: classe?.f_nome || "N/A",
      f_ordemNome: ordem?.f_nome || "N/A",
      f_familiaNome: familia?.f_nome || "N/A",
    };
  }));
}

export async function getAnimalById(id: string): Promise<Animal | undefined> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const animal = db.animais.find(a => a.id === id);
  if (animal) {
    const classe = await getClassById(animal.f_classeId);
    const ordem = await getOrdemById(animal.f_ordemId);
    const familia = await getFamiliaById(animal.f_familiaId);
    return {
      ...animal,
      f_classeNome: classe?.f_nome || "N/A",
      f_ordemNome: ordem?.f_nome || "N/A",
      f_familiaNome: familia?.f_nome || "N/A",
    };
  }
  return undefined;
}

export async function addAnimal(formData: FormData): Promise<{ success: boolean; message: string; data?: Animal }> {
  const nomeCientifico = formData.get("f_nomecientifico") as string;
  const nomeVulgar = formData.get("f_nome") as string;
  const classeId = formData.get("f_classeId") as string;
  const ordemId = formData.get("f_ordemId") as string;
  const familiaId = formData.get("f_familiaId") as string;
  const nomesAlternativos = formData.get("f_nomes_alternativos") as string | undefined;
  let imagem = formData.get("f_imagem") as string | undefined;
  let statusConservacao = formData.get("f_status_conservacao") as string | undefined;

  if (!nomeCientifico) return { success: false, message: "Nome científico é obrigatório." };
  if (!nomeVulgar) return { success: false, message: "Nome vulgar é obrigatório." };
  if (!classeId) return { success: false, message: "Classe é obrigatória." };
  if (!ordemId) return { success: false, message: "Ordem é obrigatória." };
  if (!familiaId) return { success: false, message: "Família é obrigatória." };
  
  if (!await getClassById(classeId)) return { success: false, message: "Classe selecionada inválida." };
  if (!await getOrdemById(ordemId)) return { success: false, message: "Ordem selecionada inválida." };
  if (!await getFamiliaById(familiaId)) return { success: false, message: "Família selecionada inválida." };

  if (!statusConservacao && nomeCientifico && process.env.IUCN_REDLIST_API_TOKEN) {
    try {
      console.log(`Attempting to fetch IUCN status for ${nomeCientifico}...`);
      const iucnResult = await getConservationStatus({ scientificName: nomeCientifico });
      if (iucnResult.status) {
        statusConservacao = iucnResult.status;
        console.log(`IUCN status for ${nomeCientifico} successfully fetched: ${statusConservacao}`);
      } else if (iucnResult.errorMessage) {
        console.log(`IUCN status for ${nomeCientifico} (API V4): ${iucnResult.errorMessage}`);
      }
    } catch (e) {
        console.error(`Error fetching IUCN status for ${nomeCientifico}:`, e);
    }
  }

  if ((!imagem || imagem.trim() === "") && nomeVulgar && process.env.PEXELS_API_KEY) {
    try {
      console.log(`Attempting to fetch image for ${nomeVulgar} from Pexels...`);
      const imageResult = await getAnimalImage({ animalName: nomeVulgar });
      if (imageResult.imageUrl) {
        imagem = imageResult.imageUrl;
        console.log(`Image for ${nomeVulgar} successfully fetched from Pexels: ${imagem}`);
      } else if (imageResult.errorMessage) {
        console.log(`Pexels image fetch for ${nomeVulgar}: ${imageResult.errorMessage}`);
      }
    } catch (e) {
      console.error(`Error fetching image from Pexels for ${nomeVulgar}:`, e);
    }
  }


  const newAnimal: Animal = {
    id: generateId(),
    f_nomecientifico: nomeCientifico,
    f_nome: nomeVulgar,
    f_classeId: classeId,
    f_ordemId: ordemId,
    f_familiaId: familiaId,
    f_nomes_alternativos: nomesAlternativos,
    f_imagem: imagem && imagem.trim() !== "" ? imagem : `https://placehold.co/300x200.png?text=${encodeURIComponent(nomeVulgar)}`,
    f_status_conservacao: statusConservacao,
  };
  
  (newAnimal as any)['data-ai-hint'] = nomeVulgar.toLowerCase().split(" ").slice(0,2).join(" ") || "animal photo";

  db.animais.push(newAnimal);
  revalidatePath("/animais");
  revalidatePath(`/classes/${classeId}`);
  revalidatePath(`/ordens/${ordemId}`);
  revalidatePath(`/familias/${familiaId}`);
  revalidatePath("/"); 

  return { success: true, message: "Animal (espécie) adicionado com sucesso!", data: newAnimal };
}

export async function updateAnimal(id: string, formData: FormData): Promise<{ success: boolean; message: string; data?: Animal }> {
  const nomeCientifico = formData.get("f_nomecientifico") as string;
  const nomeVulgar = formData.get("f_nome") as string;
  const classeId = formData.get("f_classeId") as string;
  const ordemId = formData.get("f_ordemId") as string;
  const familiaId = formData.get("f_familiaId") as string;
  const nomesAlternativos = formData.get("f_nomes_alternativos") as string | undefined;
  let imagem = formData.get("f_imagem") as string | undefined;
  let statusConservacao = formData.get("f_status_conservacao") as string | undefined;

  if (!nomeCientifico) return { success: false, message: "Nome científico é obrigatório." };
  if (!nomeVulgar) return { success: false, message: "Nome vulgar é obrigatório." };
  if (!classeId) return { success: false, message: "Classe é obrigatória." };
  if (!ordemId) return { success: false, message: "Ordem é obrigatória." };
  if (!familiaId) return { success: false, message: "Família é obrigatória." };

  if (!await getClassById(classeId)) return { success: false, message: "Classe selecionada inválida." };
  if (!await getOrdemById(ordemId)) return { success: false, message: "Ordem selecionada inválida." };
  if (!await getFamiliaById(familiaId)) return { success: false, message: "Família selecionada inválida." };

  const animalIndex = db.animais.findIndex(a => a.id === id);
  if (animalIndex === -1) {
    return { success: false, message: "Animal (espécie) não encontrado." };
  }
  
  const animalOriginal = db.animais[animalIndex];

  // Fetch from IUCN only if status is not provided (or explicitly cleared) and scientific name is present
  const userProvidedStatus = formData.has("f_status_conservacao");
  const currentStatusOnForm = formData.get("f_status_conservacao") as string | undefined;

  if ((!userProvidedStatus || (userProvidedStatus && (!currentStatusOnForm || currentStatusOnForm.trim() === ""))) && nomeCientifico && process.env.IUCN_REDLIST_API_TOKEN) {
     try {
      console.log(`Attempting to fetch IUCN status for ${nomeCientifico} (update)...`);
      const iucnResult = await getConservationStatus({ scientificName: nomeCientifico });
      if (iucnResult.status) {
        statusConservacao = iucnResult.status;
        console.log(`IUCN status for ${nomeCientifico} successfully fetched: ${statusConservacao}`);
      } else if (iucnResult.errorMessage) {
         console.log(`IUCN status for ${nomeCientifico} (API V4): ${iucnResult.errorMessage}`);
         statusConservacao = userProvidedStatus ? currentStatusOnForm : animalOriginal.f_status_conservacao; // keep form value if explicitly set, else original
      }
    } catch (e) {
        console.error(`Error fetching IUCN status for ${nomeCientifico}:`, e);
        statusConservacao = userProvidedStatus ? currentStatusOnForm : animalOriginal.f_status_conservacao; // keep form value if explicitly set, else original
    }
  } else if (userProvidedStatus) {
    statusConservacao = currentStatusOnForm; // User explicitly provided a status (even if empty)
  } else {
    statusConservacao = animalOriginal.f_status_conservacao; // No change requested by user, keep original
  }


  // Fetch image from Pexels only if image is not provided (or explicitly cleared) and animal name is present
  const userProvidedImage = formData.has("f_imagem");
  const currentImageOnForm = formData.get("f_imagem") as string | undefined;

  if ((!userProvidedImage || (userProvidedImage && (!currentImageOnForm || currentImageOnForm.trim() === ""))) && nomeVulgar && process.env.PEXELS_API_KEY) {
    try {
      console.log(`Attempting to fetch image for ${nomeVulgar} from Pexels (update)...`);
      const imageResult = await getAnimalImage({ animalName: nomeVulgar });
      if (imageResult.imageUrl) {
        imagem = imageResult.imageUrl;
         console.log(`Image for ${nomeVulgar} successfully fetched from Pexels: ${imagem}`);
      } else if (imageResult.errorMessage) {
        console.log(`Pexels image fetch for ${nomeVulgar}: ${imageResult.errorMessage}`);
        imagem = userProvidedImage ? currentImageOnForm : animalOriginal.f_imagem; // Keep form value or original if fetch fails
      }
    } catch (e) {
      console.error(`Error fetching image from Pexels for ${nomeVulgar}:`, e);
      imagem = userProvidedImage ? currentImageOnForm : animalOriginal.f_imagem; // Keep form value or original on error
    }
  } else if (userProvidedImage) {
    imagem = currentImageOnForm; // User explicitly provided an image URL (even if empty)
  } else {
    imagem = animalOriginal.f_imagem; // No change requested by user, keep original
  }


  const updatedAnimal: Animal = {
    ...animalOriginal,
    f_nomecientifico: nomeCientifico,
    f_nome: nomeVulgar,
    f_classeId: classeId,
    f_ordemId: ordemId,
    f_familiaId: familiaId,
    f_nomes_alternativos: nomesAlternativos,
    f_imagem: imagem && imagem.trim() !== "" ? imagem : `https://placehold.co/300x200.png?text=${encodeURIComponent(nomeVulgar)}`,
    f_status_conservacao: statusConservacao,
  };

  (updatedAnimal as any)['data-ai-hint'] = nomeVulgar.toLowerCase().split(" ").slice(0,2).join(" ") || "animal photo";
  
  db.animais[animalIndex] = updatedAnimal;

  revalidatePath("/animais");
  revalidatePath(`/animais/${id}`);
  revalidatePath(`/animais/${id}/editar`);
  revalidatePath(`/classes/${classeId}`);
  revalidatePath(`/ordens/${ordemId}`);
  revalidatePath(`/familias/${familiaId}`);
  revalidatePath("/");

  if (animalOriginal.f_classeId !== classeId) revalidatePath(`/classes/${animalOriginal.f_classeId}`);
  if (animalOriginal.f_ordemId !== ordemId) revalidatePath(`/ordens/${animalOriginal.f_ordemId}`);
  if (animalOriginal.f_familiaId !== familiaId) revalidatePath(`/familias/${animalOriginal.f_familiaId}`);

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

  const animalToDelete = db.animais[animalIndex];
  db.animais.splice(animalIndex, 1);
  
  revalidatePath("/animais");
  revalidatePath(`/animais/${id}`);
  revalidatePath(`/classes/${animalToDelete.f_classeId}`);
  revalidatePath(`/ordens/${animalToDelete.f_ordemId}`);
  revalidatePath(`/familias/${animalToDelete.f_familiaId}`);
  revalidatePath("/");
  
  return { success: true, message: "Animal (espécie) excluído com sucesso!" };
}