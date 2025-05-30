
import type { Classe, Ordem, Familia, Animal, CadastroAnimal } from '@/types';

interface Db {
  classes: Classe[];
  ordens: Ordem[];
  familias: Familia[];
  animais: Animal[];
  cadastros: CadastroAnimal[];
}

export const db: Db = {
  classes: [
    { id: '1', f_nome: 'Mamíferos', f_descricao: 'Animais vertebrados que se caracterizam pela presença de glândulas mamárias.', f_imagem: 'https://placehold.co/300x200?text=Mamiferos', f_hero: 'https://placehold.co/800x400?text=Mamiferos+Hero', "data-ai-hint": "mammal illustration" },
    { id: '2', f_nome: 'Aves', f_descricao: 'Animais vertebrados que se caracterizam pela presença de penas, bico e capacidade de voo na maioria das espécies.', f_imagem: 'https://placehold.co/300x200?text=Aves', f_hero: 'https://placehold.co/800x400?text=Aves+Hero', "data-ai-hint": "bird illustration" },
  ],
  ordens: [
    { id: '101', f_classeId: '1', f_classeNome: 'Mamíferos', f_nome: 'Primatas', f_descricao: 'Ordem de mamíferos que inclui lêmures, macacos e humanos.', f_imagem: 'https://placehold.co/300x200?text=Primatas', "data-ai-hint": "monkey illustration" },
  ],
  familias: [
     { id: '201', f_ordemId: '101', f_ordemNome: 'Primatas', f_nome: 'Cebidae', f_descricao: 'Família de macacos do Novo Mundo.', f_imagem: 'https://placehold.co/300x200?text=Cebidae', "data-ai-hint": "capuchin monkey" },
  ],
  animais: [
    { id: '301', f_classeId: '1', f_classeNome: 'Mamíferos', f_ordemId: '101', f_ordemNome: 'Primatas', f_familiaId: '201', f_familiaNome: 'Cebidae', f_nomecientifico: 'Sapajus flavius', f_nome: 'Macaco-prego-galego', f_imagem: 'https://placehold.co/300x200?text=MacacoPrego', "data-ai-hint": "blonde capuchin" },
  ],
  cadastros: [
    { id: '401', f_animalId: '301', f_animalNome: 'Macaco-prego-galego', f_apelido: 'Galego', f_registro: 'BICA-001', f_procedencia: 'Resgate IBAMA', f_entrada: '2023-01-15', f_sexo: 'Macho', f_idade: '5 anos', f_marcacaotipo: 'Microchip', f_marcacaonumero: '987654321012345' }
  ],
};

// Helper to generate unique IDs
let nextIdCounter = 500;
export const generateId = () => {
  nextIdCounter += 1;
  return nextIdCounter.toString();
};
