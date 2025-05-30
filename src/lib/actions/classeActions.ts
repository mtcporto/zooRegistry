
"use server";

import { revalidatePath } from "next/cache";
import { db, generateId } from "@/lib/mockDb";
import type { Classe } from "@/types";
import { redirect } from "next/navigation";

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
    f_imagem: imagem || `https://placehold.co/300x200.png?text=${encodeURIComponent(nome)}`,
    f_hero: hero || `https://placehold.co/800x400.png?text=${encodeURIComponent(nome)}+Hero`,
  };
  
  (newClasse as any)['data-ai-hint'] = nome.toLowerCase().split(" ").slice(0,2).join(" ") || "animal illustration";
  (newClasse as any)['data-ai-hint-hero'] = nome.toLowerCase().split(" ").slice(0,2).join(" ") + " habitat" || "nature landscape";


  db.classes.push(newClasse);
  revalidatePath("/classes");
  revalidatePath("/classes/novo");

  return { success: true, message: "Classe adicionada com sucesso!", data: newClasse };
}

export async function updateClasse(id: string, formData: FormData): Promise<{ success: boolean; message: string; data?: Classe }> {
  const nome = formData.get("f_nome") as string;
  const descricao = formData.get("f_descricao") as string | undefined;
  const imagem = formData.get("f_imagem") as string | undefined;
  const hero = formData.get("f_hero") as string | undefined;

  if (!nome) {
    return { success: false, message: "Nome da classe é obrigatório." };
  }

  const classeIndex = db.classes.findIndex(c => c.id === id);
  if (classeIndex === -1) {
    return { success: false, message: "Classe não encontrada." };
  }

  const updatedClasse: Classe = {
    ...db.classes[classeIndex],
    f_nome: nome,
    f_descricao: descricao,
    f_imagem: imagem || `https://placehold.co/300x200.png?text=${encodeURIComponent(nome)}`,
    f_hero: hero || `https://placehold.co/800x400.png?text=${encodeURIComponent(nome)}+Hero`,
  };

  (updatedClasse as any)['data-ai-hint'] = nome.toLowerCase().split(" ").slice(0,2).join(" ") || "animal illustration";
  (updatedClasse as any)['data-ai-hint-hero'] = nome.toLowerCase().split(" ").slice(0,2).join(" ") + " habitat" || "nature landscape";
  
  db.classes[classeIndex] = updatedClasse;
  
  revalidatePath("/classes");
  revalidatePath(`/classes/${id}`);
  revalidatePath(`/classes/${id}/editar`);

  return { success: true, message: "Classe atualizada com sucesso!", data: updatedClasse };
}

export async function deleteClasse(id: string): Promise<{ success: boolean; message: string }> {
  const classeIndex = db.classes.findIndex(c => c.id === id);
  if (classeIndex === -1) {
    return { success: false, message: "Classe não encontrada." };
  }

  // Check for dependencies in Ordens
  const hasOrdens = db.ordens.some(ordem => ordem.f_classeId === id);
  if (hasOrdens) {
    return { success: false, message: "Não é possível excluir a classe. Existem ordens associadas a ela." };
  }

  db.classes.splice(classeIndex, 1);
  revalidatePath("/classes");
  // No need to redirect from server action, client will handle after toast
  return { success: true, message: "Classe excluída com sucesso!" };
}
