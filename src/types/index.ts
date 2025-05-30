
// Remove Classe, Ordem, Familia interfaces

export interface Animal {
  id: string;
  f_nomecientifico: string;
  f_nome: string; // Nome vulgar
  f_nomes_alternativos?: string;
  f_imagem?: string;    // URL to image
  f_status_conservacao?: string; // Ex: "Pouco Preocupante (LC)", "Ameaçado (EN)", "EN" (código IUCN)
  
  // Campos preenchidos pela API da IUCN
  f_iucn_kingdomName?: string;
  f_iucn_phylumName?: string;
  f_iucn_className?: string;
  f_iucn_orderName?: string;
  f_iucn_familyName?: string;
  f_iucn_commonNames?: string; // Nomes comuns concatenados
}

export type SexoAnimal = 'Macho' | 'Femea' | 'Indefinido';
export const sexosAnimais: SexoAnimal[] = ['Macho', 'Femea', 'Indefinido'];

export type MarcacaoTipoAnimal = 'Microchip' | 'Microchip / Tatuagem CN01' | 'MC' | 'Anilha CETAS' | 'Anilha TE PZBAC' | 'Sem marcação';
export const marcacaoTiposAnimais: MarcacaoTipoAnimal[] = ['Microchip', 'Microchip / Tatuagem CN01', 'MC', 'Anilha CETAS', 'Anilha TE PZBAC', 'Sem marcação'];

export interface CadastroAnimal {
  id: string;
  f_animalId: string; // Reference to Animal
  f_animalNome?: string; // For display purposes (nome vulgar da espécie)
  f_apelido?: string;
  f_registro?: string;
  f_procedencia?: string;
  f_entrada?: string; // Store as ISO string (YYYY-MM-DD)
  f_sexo?: SexoAnimal;
  f_idade?: string;
  f_sinais?: string;
  f_marcacaotipo?: MarcacaoTipoAnimal;
  f_marcacaonumero?: string;
  f_saida?: string; // Store as ISO string (YYYY-MM-DD)
  f_motivosaida?: string;
  f_observacao?: string;
  f_origem_trafico?: boolean;
  f_informacoes_trafico?: string;
}
