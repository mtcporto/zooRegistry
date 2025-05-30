
export interface Animal {
  id: string;
  f_nomecientifico: string;
  f_nome: string; 
  f_nomes_alternativos?: string | null;
  f_imagem?: string | null;    
  f_status_conservacao?: string | null; 
  
  f_iucn_kingdomName?: string | null;
  f_iucn_phylumName?: string | null;
  f_iucn_className?: string | null;
  f_iucn_orderName?: string | null;
  f_iucn_familyName?: string | null;
  f_iucn_commonNames?: string | null; 
  "data-ai-hint"?: string | null;
}

export type SexoAnimal = 'Macho' | 'Femea' | 'Indefinido';
export const sexosAnimais: SexoAnimal[] = ['Macho', 'Femea', 'Indefinido'];

export type MarcacaoTipoAnimal = 'Microchip' | 'Microchip / Tatuagem CN01' | 'MC' | 'Anilha CETAS' | 'Anilha TE PZBAC' | 'Sem marcação';
export const marcacaoTiposAnimais: MarcacaoTipoAnimal[] = ['Microchip', 'Microchip / Tatuagem CN01', 'MC', 'Anilha CETAS', 'Anilha TE PZBAC', 'Sem marcação'];

export interface CadastroAnimal {
  id: string;
  f_animalId: string; 
  f_animalNome?: string | null; 
  f_apelido?: string | null;
  f_registro?: string | null;
  f_procedencia?: string | null;
  f_entrada?: string | null; 
  f_sexo?: SexoAnimal | null;
  f_idade?: string | null;
  f_sinais?: string | null;
  f_marcacaotipo?: MarcacaoTipoAnimal | null;
  f_marcacaonumero?: string | null;
  f_saida?: string | null; 
  f_motivosaida?: string | null;
  f_observacao?: string | null;
  f_origem_trafico?: boolean | null; // Booleans are fine as is or null
  f_informacoes_trafico?: string | null;
}
