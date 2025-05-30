
"use server";

import { revalidatePath } from "next/cache";
import { db, generateId } from "@/lib/mockDb";
import type { Classe } from "@/types";

export async function getClasses(): Promise<Classe[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return db.classes;
}

export async function getClassById(id: string): Promise<Classe | undefined> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return db.classes.find(c => c.id === id);
}

export async function addClasse(formData: FormData): Promise<{ success: boolean; message: string; data?: Classe }> {
  const nome = formData.get("f_nome") as string;
  const descricao = formData.get("f_descricao") as string | undefined;
  const imagem = formData.get("f_imagem") as string | undefined;
  const hero = formData.get("f_hero") as string | undefined;

  if (!nome) {
    return { success: false, message: "Nome da classe é obrigatório." };
  }

  const newClasse: Classe = {
    id: generateId(),
    f_nome: nome,
    f_descricao: descricao,
    f_imagem: imagem || `https://placehold.co/300x200?text=${encodeURIComponent(nome)}`,
    f_hero: hero || `https://placehold.co/800x400?text=${encodeURIComponent(nome)}+Hero`,
  };
  
  // Add data-ai-hint if not provided
  if (newClasse.f_imagem && !newClasse.f_imagem.includes('data-ai-hint')) {
    (newClasse as any)['data-ai-hint'] = "animal illustration";
  }
   if (newClasse.f_hero && !newClasse.f_hero.includes('data-ai-hint')) {
    (newClasse as any)['data-ai-hint-hero'] = "nature landscape";
  }


  db.classes.push(newClasse);
  revalidatePath("/classes");

  return { success: true, message: "Classe adicionada com sucesso!", data: newClasse };
}
