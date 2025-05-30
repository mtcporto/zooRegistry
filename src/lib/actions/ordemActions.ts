
"use server";

import { revalidatePath } from "next/cache";
import { db, generateId } from "@/lib/mockDb";
import type { Ordem } from "@/types";
import { getClassById } from "./classeActions";
import { redirect } from "next/navigation";

export async function getOrdens(): Promise<Ordem[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return Promise.all(db.ordens.map(async (ordem) => {
    const classe = await getClassById(ordem.f_classeId);
    return { ...ordem, f_classeNome: classe?.f_nome || "N/A" };
  }));
}

export async function getOrdemById(id: string): Promise<Ordem | undefined> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const ordem = db.ordens.find(o => o.id === id);
  if (ordem) {
    const classe = await getClassById(ordem.f_classeId);
    return { ...ordem, f_classeNome: classe?.f_nome || "N/A" };
  }
  return undefined;
}

export async function addOrdem(formData: FormData): Promise<{ success: boolean; message: string; data?: Ordem }> {
  const nome = formData.get("f_nome") as string;
  const classeId = formData.get("f_classeId") as string;
  const descricao = formData.get("f_descricao") as string | undefined;
  const imagem = formData.get("f_imagem") as string | undefined;
  const hero = formData.get("f_hero") as string | undefined;

  if (!nome) return { success: false, message: "Nome da ordem é obrigatório." };
  if (!classeId) return { success: false, message: "Classe é obrigatória." };

  const classe = await getClassById(classeId);
  if (!classe) return { success: false, message: "Classe selecionada inválida." };

  const newOrdem: Ordem = {
    id: generateId(),
    f_nome: nome,
    f_classeId: classeId,
    f_descricao: descricao,
    f_imagem: imagem || `https://placehold.co/300x200.png?text=${encodeURIComponent(nome)}`,
    f_hero: hero || `https://placehold.co/800x400.png?text=${encodeURIComponent(nome)}+Hero`,
  };
  
  (newOrdem as any)['data-ai-hint'] = nome.toLowerCase().split(" ").slice(0,2).join(" ") || "animal group";
  (newOrdem as any)['data-ai-hint-hero'] = nome.toLowerCase().split(" ").slice(0,2).join(" ") + " environment" ||"habitat panoramic";

  db.ordens.push(newOrdem);
  revalidatePath("/ordens");
  revalidatePath("/ordens/novo");
  revalidatePath(`/classes/${classeId}`); // Revalidate class page if it shows orders

  return { success: true, message: "Ordem adicionada com sucesso!", data: newOrdem };
}

export async function updateOrdem(id: string, formData: FormData): Promise<{ success: boolean; message: string; data?: Ordem }> {
  const nome = formData.get("f_nome") as string;
  const classeId = formData.get("f_classeId") as string;
  const descricao = formData.get("f_descricao") as string | undefined;
  const imagem = formData.get("f_imagem") as string | undefined;
  const hero = formData.get("f_hero") as string | undefined;

  if (!nome) return { success: false, message: "Nome da ordem é obrigatório." };
  if (!classeId) return { success: false, message: "Classe é obrigatória." };
  
  const classe = await getClassById(classeId);
  if (!classe) return { success: false, message: "Classe selecionada inválida." };

  const ordemIndex = db.ordens.findIndex(o => o.id === id);
  if (ordemIndex === -1) {
    return { success: false, message: "Ordem não encontrada." };
  }

  const updatedOrdem: Ordem = {
    ...db.ordens[ordemIndex],
    f_nome: nome,
    f_classeId: classeId,
    f_descricao: descricao,
    f_imagem: imagem || `https://placehold.co/300x200.png?text=${encodeURIComponent(nome)}`,
    f_hero: hero || `https://placehold.co/800x400.png?text=${encodeURIComponent(nome)}+Hero`,
  };

  (updatedOrdem as any)['data-ai-hint'] = nome.toLowerCase().split(" ").slice(0,2).join(" ") || "animal group";
  (updatedOrdem as any)['data-ai-hint-hero'] = nome.toLowerCase().split(" ").slice(0,2).join(" ") + " environment" ||"habitat panoramic";

  db.ordens[ordemIndex] = updatedOrdem;
  
  revalidatePath("/ordens");
  revalidatePath(`/ordens/${id}`);
  revalidatePath(`/ordens/${id}/editar`);
  revalidatePath(`/classes/${classeId}`); // Revalidate class page

  return { success: true, message: "Ordem atualizada com sucesso!", data: updatedOrdem };
}

export async function deleteOrdem(id: string): Promise<{ success: boolean; message: string }> {
  const ordemIndex = db.ordens.findIndex(o => o.id === id);
  if (ordemIndex === -1) {
    return { success: false, message: "Ordem não encontrada." };
  }
  const ordemToDelete = db.ordens[ordemIndex];

  // Check for dependencies in Familias
  const hasFamilias = db.familias.some(familia => familia.f_ordemId === id);
  if (hasFamilias) {
    return { success: false, message: "Não é possível excluir a ordem. Existem famílias associadas a ela." };
  }

  db.ordens.splice(ordemIndex, 1);
  
  revalidatePath("/ordens");
  revalidatePath(`/classes/${ordemToDelete.f_classeId}`); // Revalidate relevant class page
  
  return { success: true, message: "Ordem excluída com sucesso!" };
}
