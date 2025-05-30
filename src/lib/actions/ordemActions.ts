
"use server";

import { revalidatePath } from "next/cache";
import { db, generateId } from "@/lib/mockDb";
import type { Ordem } from "@/types";
import { getClassById } from "./classeActions";

export async function getOrdens(): Promise<Ordem[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  // Enrich with classeNome
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
    f_imagem: imagem || `https://placehold.co/300x200?text=${encodeURIComponent(nome)}`,
    f_hero: hero || `https://placehold.co/800x400?text=${encodeURIComponent(nome)}+Hero`,
  };
  
  (newOrdem as any)['data-ai-hint'] = "animal group";
  (newOrdem as any)['data-ai-hint-hero'] = "habitat panoramic";

  db.ordens.push(newOrdem);
  revalidatePath("/ordens");
  revalidatePath("/classes/[id]", "page"); // If orders are shown on class page

  return { success: true, message: "Ordem adicionada com sucesso!", data: newOrdem };
}
