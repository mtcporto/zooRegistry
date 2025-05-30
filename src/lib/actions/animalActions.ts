
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

  if (!nomeCientifico) return { success: false, message: "Nome científico é obrigatório." };
  if (!nomeVulgar) return { success: false, message: "Nome vulgar é obrigatório." };
  if (!classeId) return { success: false, message: "Classe é obrigatória." };
  if (!ordemId) return { success: false, message: "Ordem é obrigatória." };
  if (!familiaId) return { success: false, message: "Família é obrigatória." };
  
  // Basic validation for existence of selected IDs
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
    f_imagem: imagem || `https://placehold.co/300x200?text=${encodeURIComponent(nomeVulgar)}`,
  };
  
  (newAnimal as any)['data-ai-hint'] = nomeVulgar.toLowerCase().split(" ").slice(0,2).join(" ");


  db.animais.push(newAnimal);
  revalidatePath("/animais");

  return { success: true, message: "Animal adicionado com sucesso!", data: newAnimal };
}

