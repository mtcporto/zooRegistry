
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
    f_imagem: imagem || `https://placehold.co/300x200.png?text=${encodeURIComponent(nome)}`,
    f_hero: hero || `https://placehold.co/800x400.png?text=${encodeURIComponent(nome)}+Hero`,
  };
  
  (newFamilia as any)['data-ai-hint'] = nome.toLowerCase().split(" ").slice(0,2).join(" ") || "animal group image";
  (newFamilia as any)['data-ai-hint-hero'] = nome.toLowerCase().split(" ").slice(0,2).join(" ") + " ecosystem" || "nature pattern";

  db.familias.push(newFamilia);
  revalidatePath("/familias");
  revalidatePath(`/ordens/${ordemId}`); 

  return { success: true, message: "Família adicionada com sucesso!", data: newFamilia };
}

export async function updateFamilia(id: string, formData: FormData): Promise<{ success: boolean; message: string; data?: Familia }> {
  const nome = formData.get("f_nome") as string;
  const ordemId = formData.get("f_ordemId") as string;
  const descricao = formData.get("f_descricao") as string | undefined;
  const imagem = formData.get("f_imagem") as string | undefined;
  const hero = formData.get("f_hero") as string | undefined;

  if (!nome) return { success: false, message: "Nome da família é obrigatório." };
  if (!ordemId) return { success: false, message: "Ordem é obrigatória." };

  const ordem = await getOrdemById(ordemId);
  if (!ordem) return { success: false, message: "Ordem selecionada inválida." };

  const familiaIndex = db.familias.findIndex(f => f.id === id);
  if (familiaIndex === -1) {
    return { success: false, message: "Família não encontrada." };
  }

  const familiaOriginal = db.familias[familiaIndex];

  const updatedFamilia: Familia = {
    ...familiaOriginal,
    f_nome: nome,
    f_ordemId: ordemId,
    f_descricao: descricao,
    f_imagem: imagem || `https://placehold.co/300x200.png?text=${encodeURIComponent(nome)}`,
    f_hero: hero || `https://placehold.co/800x400.png?text=${encodeURIComponent(nome)}+Hero`,
  };

  (updatedFamilia as any)['data-ai-hint'] = nome.toLowerCase().split(" ").slice(0,2).join(" ") || "animal group image";
  (updatedFamilia as any)['data-ai-hint-hero'] = nome.toLowerCase().split(" ").slice(0,2).join(" ") + " ecosystem" || "nature pattern";
  
  db.familias[familiaIndex] = updatedFamilia;

  revalidatePath("/familias");
  revalidatePath(`/familias/${id}`);
  revalidatePath(`/familias/${id}/editar`);
  revalidatePath(`/ordens/${ordemId}`);
  if (familiaOriginal.f_ordemId !== ordemId) {
    revalidatePath(`/ordens/${familiaOriginal.f_ordemId}`);
  }

  return { success: true, message: "Família atualizada com sucesso!", data: updatedFamilia };
}

export async function deleteFamilia(id: string): Promise<{ success: boolean; message: string }> {
  const familiaIndex = db.familias.findIndex(f => f.id === id);
  if (familiaIndex === -1) {
    return { success: false, message: "Família não encontrada." };
  }

  const hasAnimais = db.animais.some(animal => animal.f_familiaId === id);
  if (hasAnimais) {
    return { success: false, message: "Não é possível excluir a família. Existem espécies de animais associadas a ela." };
  }

  const familiaToDelete = db.familias[familiaIndex];
  db.familias.splice(familiaIndex, 1);
  
  revalidatePath("/familias");
  revalidatePath(`/familias/${id}`);
  revalidatePath(`/ordens/${familiaToDelete.f_ordemId}`); 
  
  return { success: true, message: "Família excluída com sucesso!" };
}
