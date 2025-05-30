
"use server";

import { revalidatePath } from "next/cache";
import { db, generateId } from "@/lib/mockDb";
import type { CadastroAnimal, SexoAnimal, MarcacaoTipoAnimal } from "@/types";
import { getAnimalById } from "./animalActions"; 
import { formatISO } from "date-fns";


export async function getCadastros(): Promise<CadastroAnimal[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return Promise.all(db.cadastros.map(async (cadastro) => {
    const animal = await getAnimalById(cadastro.f_animalId);
    return { ...cadastro, f_animalNome: animal?.f_nome || "N/A" };
  }));
}

export async function getCadastroById(id: string): Promise<CadastroAnimal | undefined> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const cadastro = db.cadastros.find(c => c.id === id);
  if (cadastro) {
    const animal = await getAnimalById(cadastro.f_animalId);
    return { ...cadastro, f_animalNome: animal?.f_nome || "N/A" };
  }
  return undefined;
}

export async function addCadastro(formData: FormData): Promise<{ success: boolean; message: string; data?: CadastroAnimal }> {
  const animalId = formData.get("f_animalId") as string;
  if (!animalId) return { success: false, message: "Animal (espécie) é obrigatório." };
  
  const animalExists = await getAnimalById(animalId);
  if (!animalExists) return { success: false, message: "Animal (espécie) selecionado inválido." };
  
  const entrada = formData.get("f_entrada") as string | undefined;
  const saida = formData.get("f_saida") as string | undefined;

  const newCadastro: CadastroAnimal = {
    id: generateId(),
    f_animalId: animalId,
    f_apelido: formData.get("f_apelido") as string | undefined,
    f_registro: formData.get("f_registro") as string | undefined,
    f_procedencia: formData.get("f_procedencia") as string | undefined,
    f_entrada: entrada ? formatISO(new Date(entrada)) : undefined,
    f_sexo: formData.get("f_sexo") as SexoAnimal | undefined,
    f_idade: formData.get("f_idade") as string | undefined,
    f_sinais: formData.get("f_sinais") as string | undefined,
    f_marcacaotipo: formData.get("f_marcacaotipo") as MarcacaoTipoAnimal | undefined,
    f_marcacaonumero: formData.get("f_marcacaonumero") as string | undefined,
    f_saida: saida ? formatISO(new Date(saida)) : undefined,
    f_motivosaida: formData.get("f_motivosaida") as string | undefined,
    f_observacao: formData.get("f_observacao") as string | undefined,
    f_origem_trafico: formData.get("f_origem_trafico") === 'true',
    f_informacoes_trafico: formData.get("f_informacoes_trafico") as string | undefined,
  };

  db.cadastros.push(newCadastro);
  revalidatePath("/cadastros");
  revalidatePath(`/animais/${animalId}`); 

  return { success: true, message: "Cadastro de animal individual adicionado com sucesso!", data: newCadastro };
}

export async function updateCadastro(id: string, formData: FormData): Promise<{ success: boolean; message: string; data?: CadastroAnimal }> {
  const animalId = formData.get("f_animalId") as string;
  if (!animalId) return { success: false, message: "Animal (espécie) é obrigatório." };
  
  const animalExists = await getAnimalById(animalId);
  if (!animalExists) return { success: false, message: "Animal (espécie) selecionado inválido." };

  const cadastroIndex = db.cadastros.findIndex(c => c.id === id);
  if (cadastroIndex === -1) {
    return { success: false, message: "Cadastro individual não encontrado." };
  }
  
  const cadastroOriginal = db.cadastros[cadastroIndex];
  const entrada = formData.get("f_entrada") as string | undefined;
  const saida = formData.get("f_saida") as string | undefined;

  const updatedCadastro: CadastroAnimal = {
    ...cadastroOriginal,
    f_animalId: animalId,
    f_apelido: formData.get("f_apelido") as string | undefined,
    f_registro: formData.get("f_registro") as string | undefined,
    f_procedencia: formData.get("f_procedencia") as string | undefined,
    f_entrada: entrada ? formatISO(new Date(entrada)) : undefined,
    f_sexo: formData.get("f_sexo") as SexoAnimal | undefined,
    f_idade: formData.get("f_idade") as string | undefined,
    f_sinais: formData.get("f_sinais") as string | undefined,
    f_marcacaotipo: formData.get("f_marcacaotipo") as MarcacaoTipoAnimal | undefined,
    f_marcacaonumero: formData.get("f_marcacaonumero") as string | undefined,
    f_saida: saida ? formatISO(new Date(saida)) : undefined,
    f_motivosaida: formData.get("f_motivosaida") as string | undefined,
    f_observacao: formData.get("f_observacao") as string | undefined,
    f_origem_trafico: formData.get("f_origem_trafico") === 'true',
    f_informacoes_trafico: formData.get("f_informacoes_trafico") as string | undefined,
  };

  db.cadastros[cadastroIndex] = updatedCadastro;
  
  revalidatePath("/cadastros");
  revalidatePath(`/cadastros/${id}`);
  revalidatePath(`/cadastros/${id}/editar`);
  revalidatePath(`/animais/${animalId}`);
  if (cadastroOriginal.f_animalId !== animalId) {
    revalidatePath(`/animais/${cadastroOriginal.f_animalId}`);
  }

  return { success: true, message: "Cadastro individual atualizado com sucesso!", data: updatedCadastro };
}

export async function deleteCadastro(id: string): Promise<{ success: boolean; message: string }> {
  const cadastroIndex = db.cadastros.findIndex(c => c.id === id);
  if (cadastroIndex === -1) {
    return { success: false, message: "Cadastro individual não encontrado." };
  }

  const cadastroToDelete = db.cadastros[cadastroIndex];
  db.cadastros.splice(cadastroIndex, 1);
  
  revalidatePath("/cadastros");
  revalidatePath(`/cadastros/${id}`); 
  if (cadastroToDelete.f_animalId) {
    revalidatePath(`/animais/${cadastroToDelete.f_animalId}`); 
  }
  
  return { success: true, message: "Cadastro individual excluído com sucesso!" };
}
