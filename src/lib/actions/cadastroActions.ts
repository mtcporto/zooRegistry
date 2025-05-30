
"use server";

import { revalidatePath } from "next/cache";
import { db, generateId } from "@/lib/mockDb";
import type { CadastroAnimal } from "@/types";
import { getAnimalById } from "./animalActions"; // To get animal name for display

export async function getCadastros(): Promise<CadastroAnimal[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  // Enrich with animalNome
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
  
  const newCadastro: CadastroAnimal = {
    id: generateId(),
    f_animalId: animalId,
    f_apelido: formData.get("f_apelido") as string | undefined,
    f_registro: formData.get("f_registro") as string | undefined,
    f_procedencia: formData.get("f_procedencia") as string | undefined,
    f_entrada: formData.get("f_entrada") as string | undefined, // Expect YYYY-MM-DD
    f_sexo: formData.get("f_sexo") as CadastroAnimal['f_sexo'] | undefined,
    f_idade: formData.get("f_idade") as string | undefined,
    f_sinais: formData.get("f_sinais") as string | undefined,
    f_marcacaotipo: formData.get("f_marcacaotipo") as CadastroAnimal['f_marcacaotipo'] | undefined,
    f_marcacaonumero: formData.get("f_marcacaonumero") as string | undefined,
    f_saida: formData.get("f_saida") as string | undefined, // Expect YYYY-MM-DD
    f_motivosaida: formData.get("f_motivosaida") as string | undefined,
    f_observacao: formData.get("f_observacao") as string | undefined,
    f_origem_trafico: formData.get("f_origem_trafico") === 'true' ? true : formData.get("f_origem_trafico") === 'false' ? false : undefined,
    f_informacoes_trafico: formData.get("f_informacoes_trafico") as string | undefined,
  };

  db.cadastros.push(newCadastro);
  revalidatePath("/cadastros");
  revalidatePath(`/animais/${animalId}`); // Revalidate animal detail page if it shows individual counts

  return { success: true, message: "Cadastro de animal individual adicionado com sucesso!", data: newCadastro };
}

export async function deleteCadastro(id: string): Promise<{ success: boolean; message: string }> {
  const cadastroIndex = db.cadastros.findIndex(c => c.id === id);
  if (cadastroIndex === -1) {
    return { success: false, message: "Cadastro individual não encontrado." };
  }

  const cadastroToDelete = db.cadastros[cadastroIndex];
  db.cadastros.splice(cadastroIndex, 1);
  
  revalidatePath("/cadastros");
  revalidatePath(`/cadastros/${id}`); // In case someone is on the detail page
  if (cadastroToDelete.f_animalId) {
    revalidatePath(`/animais/${cadastroToDelete.f_animalId}`); // Revalidate animal detail page
  }
  
  return { success: true, message: "Cadastro individual excluído com sucesso!" };
}
