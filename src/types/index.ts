
export interface Classe {
  id: string;
  f_nome: string;
  f_descricao?: string;
  f_imagem?: string; // URL to image
  f_hero?: string;   // URL to hero image
}

export interface Ordem {
  id: string;
  f_classeId: string; // Reference to Classe
  f_classeNome?: string; // For display purposes
  f_nome: string;
  f_descricao?: string;
  f_imagem?: string; // URL to image
  f_hero?: string;   // URL to hero image
}

export interface Familia {
  id: string;
  f_ordemId: string; // Reference to Ordem
  f_ordemNome?: string; // For display purposes
  f_nome: string;
  f_descricao?: string;
  f_imagem?: string; // URL to image
  f_hero?: string;   // URL to hero image
}

export interface Animal {
  id: string;
  f_classeId: string; // Reference to Classe
  f_classeNome?: string; // For display
  f_ordemId: string;  // Reference to Ordem
  f_ordemNome?: string; // For display
  f_familiaId: string; // Reference to Familia
  f_familiaNome?: string; // For display
  f_imagem?: string;    // URL to image
  f_nomecientifico: string;
  f_nome: string; // Nome vulgar
  f_nomes_alternativos?: string;
  f_status_conservacao?: string; // Ex: "Pouco Preocupante (LC)", "Ameaçado (EN)"
}

export type SexoAnimal = 'Macho' | 'Femea' | 'Indefinido';
export const sexosAnimais: SexoAnimal[] = ['Macho', 'Femea', 'Indefinido'];

export type MarcacaoTipoAnimal = 'Microchip' | 'Microchip / Tatuagem CN01' | 'MC' | 'Anilha CETAS' | 'Anilha TE PZBAC' | 'Sem marcação';
export const marcacaoTiposAnimais: MarcacaoTipoAnimal[] = ['Microchip', 'Microchip / Tatuagem CN01', 'MC', 'Anilha CETAS', 'Anilha TE PZBAC', 'Sem marcação'];

export interface CadastroAnimal {
  id: string;
  f_animalId: string; // Reference to Animal
  f_animalNome?: string; // For display purposes
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
