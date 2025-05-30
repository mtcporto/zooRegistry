
"use server";

import { revalidatePath } from "next/cache";
import { db, generateId } from "@/lib/mockDb";
import type { Familia } from "@/types";
import { getOrdemById } from "./ordemActions";

export async function getFamilias(): Promise<Familia[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return Promise.all(db.familias.map(async (familia) => {
    const ordem = await getOrdemById(familia.f_ordemId);
    return { ...familia, f_ordemNome: ordem?.f_nome || "N/A" };
  }));
}

export async function getFamiliaById(id: string): Promise<Familia | undefined> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const familia = db.familias.find(f => f.id === id);
  if (familia) {
    const ordem = await getOrdemById(familia.f_ordemId);
    return { ...familia, f_ordemNome: ordem?.f_nome || "N/A" };
  }
  return undefined;
}

export async function addFamilia(formData: FormData): Promise<{ success: boolean; message: string; data?: Familia }> {
  const nome = formData.get("f_nome") as string;
  const ordemId = formData.get("f_ordemId") as string;
  const descricao = formData.get("f_descricao") as string | undefined;
  const imagem = formData.get("f_imagem") as string | undefined;
  const hero = formData.get("f_hero") as string | undefined;

  if (!nome) return { success: false, message: "Nome da família é obrigatório." };
  if (!ordemId) return { success: false, message: "Ordem é obrigatória." };

  const ordem = await getOrdemById(ordemId);
  if (!ordem) return { success: false, message: "Ordem selecionada inválida." };

  const newFamilia: Familia = {
    id: generateId(),
    f_nome: nome,
    f_ordemId: ordemId,
    f_descricao: descricao,
    f_imagem: imagem || `https://placehold.co/300x200?text=${encodeURIComponent(nome)}`,
    f_hero: hero || `https://placehold.co/800x400?text=${encodeURIComponent(nome)}+Hero`,
  };
  
  (newFamilia as any)['data-ai-hint'] = "animal family";
  (newFamilia as any)['data-ai-hint-hero'] = "nature pattern";

  db.familias.push(newFamilia);
  revalidatePath("/familias");

  return { success: true, message: "Família adicionada com sucesso!", data: newFamilia };
}
