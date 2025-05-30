
"use server";

import { revalidatePath } from "next/cache";
import { db, generateId } from "@/lib/mockDb";
import type { Animal } from "@/types";
import { getClassById } from "./classeActions";
import { getOrdemById } from "./ordemActions";
import { getFamiliaById } from "./familiaActions";

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
  const imagem = formData.get("f_imagem") as string | undefined;
  const statusConservacao = formData.get("f_status_conservacao") as string | undefined;

  if (!nomeCientifico) return { success: false, message: "Nome científico é obrigatório." };
  if (!nomeVulgar) return { success: false, message: "Nome vulgar é obrigatório." };
  if (!classeId) return { success: false, message: "Classe é obrigatória." };
  if (!ordemId) return { success: false, message: "Ordem é obrigatória." };
  if (!familiaId) return { success: false, message: "Família é obrigatória." };
  
  if (!await getClassById(classeId)) return { success: false, message: "Classe selecionada inválida." };
  if (!await getOrdemById(ordemId)) return { success: false, message: "Ordem selecionada inválida." };
  if (!await getFamiliaById(familiaId)) return { success: false, message: "Família selecionada inválida." };

  const newAnimal: Animal = {
    id: generateId(),
    f_nomecientifico: nomeCientifico,
    f_nome: nomeVulgar,
    f_classeId: classeId,
    f_ordemId: ordemId,
    f_familiaId: familiaId,
    f_nomes_alternativos: nomesAlternativos,
    f_imagem: imagem || `https://placehold.co/300x200.png?text=${encodeURIComponent(nomeVulgar)}`,
    f_status_conservacao: statusConservacao,
  };
  
  (newAnimal as any)['data-ai-hint'] = nomeVulgar.toLowerCase().split(" ").slice(0,2).join(" ") || "animal photo";

  db.animais.push(newAnimal);
  revalidatePath("/animais");
  revalidatePath(`/classes/${classeId}`);
  revalidatePath(`/ordens/${ordemId}`);
  revalidatePath(`/familias/${familiaId}`);

  return { success: true, message: "Animal (espécie) adicionado com sucesso!", data: newAnimal };
}

export async function updateAnimal(id: string, formData: FormData): Promise<{ success: boolean; message: string; data?: Animal }> {
  const nomeCientifico = formData.get("f_nomecientifico") as string;
  const nomeVulgar = formData.get("f_nome") as string;
  const classeId = formData.get("f_classeId") as string;
  const ordemId = formData.get("f_ordemId") as string;
  const familiaId = formData.get("f_familiaId") as string;
  const nomesAlternativos = formData.get("f_nomes_alternativos") as string | undefined;
  const imagem = formData.get("f_imagem") as string | undefined;
  const statusConservacao = formData.get("f_status_conservacao") as string | undefined;

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

  const updatedAnimal: Animal = {
    ...animalOriginal,
    f_nomecientifico: nomeCientifico,
    f_nome: nomeVulgar,
    f_classeId: classeId,
    f_ordemId: ordemId,
    f_familiaId: familiaId,
    f_nomes_alternativos: nomesAlternativos,
    f_imagem: imagem || `https://placehold.co/300x200.png?text=${encodeURIComponent(nomeVulgar)}`,
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
  
  return { success: true, message: "Animal (espécie) excluído com sucesso!" };
}
