import type { Animal, CadastroAnimal } from '@/types';

interface Db {
  animais: Animal[];
  cadastros: CadastroAnimal[];
}

let nextIdCounter = 500;
export const generateId = () => {
  nextIdCounter += 1;
  return nextIdCounter.toString();
};

// Animal IDs
const animalMacacoPregoGalegoId = '301';
const animalLeaoId = generateId(); // 501
const animalOncaPintadaId = generateId(); // 502
const animalOncaPardaId = generateId(); // 503
const animalJacareDePapoAmareloId = generateId(); // 504
const animalAraraAzulGrandeId = generateId(); // 505
const animalSaguiDeTufosBrancosId = generateId(); // 506
const animalGatoDoMatoPequenoId = generateId(); // 507
const animalTamanduaBandeiraId = generateId(); // 508
const animalTamanduaMirimId = generateId(); // 509
const animalCobraDoMilhoId = generateId(); // 510
const animalPitonRealId = generateId(); // 511
const animalCascavelId = generateId(); // 512
const animalUrubuDeCabecaPretaId = generateId(); // 513
const animalCarcaraId = generateId(); // 514
const animalMacacoRhesusId = generateId(); // 515


export const db: Db = {
  animais: [
    { 
      id: animalMacacoPregoGalegoId, 
      f_nomecientifico: 'Sapajus flavius', 
      f_nome: 'Macaco-prego-galego', 
      f_imagem: 'https://placehold.co/300x200.png', 
      "data-ai-hint": "blonde capuchin", 
      f_status_conservacao: 'EN',
      f_iucn_kingdomName: "ANIMALIA",
      f_iucn_phylumName: "CHORDATA",
      f_iucn_className: "MAMMALIA",
      f_iucn_orderName: "PRIMATES",
      f_iucn_familyName: "CEBIDAE",
      f_iucn_commonNames: "Blonde Capuchin, Marcgrave's Capuchin Monkey"
    },
    { 
      id: animalLeaoId, 
      f_nomecientifico: 'Panthera leo', 
      f_nome: 'Leão', 
      f_imagem: 'https://placehold.co/300x200.png', 
      "data-ai-hint": "lion majestic", 
      f_status_conservacao: 'VU',
      f_iucn_kingdomName: "ANIMALIA",
      f_iucn_phylumName: "CHORDATA",
      f_iucn_className: "MAMMALIA",
      f_iucn_orderName: "CARNIVORA",
      f_iucn_familyName: "FELIDAE",
      f_iucn_commonNames: "Lion"
    },
    { 
      id: animalOncaPintadaId, 
      f_nomecientifico: 'Panthera onca', 
      f_nome: 'Onça-pintada', 
      f_imagem: 'https://placehold.co/300x200.png', 
      "data-ai-hint": "jaguar rainforest", 
      f_status_conservacao: 'NT',
      f_iucn_kingdomName: "ANIMALIA",
      f_iucn_phylumName: "CHORDATA",
      f_iucn_className: "MAMMALIA",
      f_iucn_orderName: "CARNIVORA",
      f_iucn_familyName: "FELIDAE",
      f_iucn_commonNames: "Jaguar"
    },
    { 
      id: animalOncaPardaId, 
      f_nomecientifico: 'Puma concolor', 
      f_nome: 'Onça-parda', 
      f_nomes_alternativos: 'Suçuarana, Leão-baio', 
      f_imagem: 'https://placehold.co/300x200.png', 
      "data-ai-hint": "puma mountain", 
      f_status_conservacao: 'LC',
      f_iucn_kingdomName: "ANIMALIA",
      f_iucn_phylumName: "CHORDATA",
      f_iucn_className: "MAMMALIA",
      f_iucn_orderName: "CARNIVORA",
      f_iucn_familyName: "FELIDAE",
      f_iucn_commonNames: "Puma, Cougar, Mountain Lion"
    },
    { 
      id: animalJacareDePapoAmareloId, 
      f_nomecientifico: 'Caiman latirostris', 
      f_nome: 'Jacaré-de-papo-amarelo', 
      f_imagem: 'https://placehold.co/300x200.png', 
      "data-ai-hint": "broad-snouted caiman", 
      f_status_conservacao: 'LC',
      f_iucn_kingdomName: "ANIMALIA",
      f_iucn_phylumName: "CHORDATA",
      f_iucn_className: "REPTILIA",
      f_iucn_orderName: "CROCODYLIA",
      f_iucn_familyName: "ALLIGATORIDAE",
      f_iucn_commonNames: "Broad-snouted Caiman"
    },
    { 
      id: animalAraraAzulGrandeId, 
      f_nomecientifico: 'Anodorhynchus hyacinthinus', 
      f_nome: 'Arara-azul-grande', 
      f_imagem: 'https://placehold.co/300x200.png', 
      "data-ai-hint": "hyacinth macaw", 
      f_status_conservacao: 'VU',
      f_iucn_kingdomName: "ANIMALIA",
      f_iucn_phylumName: "CHORDATA",
      f_iucn_className: "AVES",
      f_iucn_orderName: "PSITTACIFORMES",
      f_iucn_familyName: "PSITTACIDAE",
      f_iucn_commonNames: "Hyacinth Macaw"
    },
     { 
      id: animalSaguiDeTufosBrancosId, 
      f_nomecientifico: 'Callithrix jacchus', 
      f_nome: 'Sagui-de-tufos-brancos', 
      f_imagem: 'https://placehold.co/300x200.png', 
      "data-ai-hint": "common marmoset", 
      f_status_conservacao: 'LC',
      f_iucn_kingdomName: "ANIMALIA",
      f_iucn_phylumName: "CHORDATA",
      f_iucn_className: "MAMMALIA",
      f_iucn_orderName: "PRIMATES",
      f_iucn_familyName: "CALLITRICHIDAE",
      f_iucn_commonNames: "Common Marmoset, White-tufted-ear Marmoset"
    },
    { 
      id: animalGatoDoMatoPequenoId, 
      f_nomecientifico: 'Leopardus tigrinus', 
      f_nome: 'Gato-do-mato-pequeno', 
      f_nomes_alternativos: 'Oncilla', 
      f_imagem: 'https://placehold.co/300x200.png', 
      "data-ai-hint": "oncilla wildcat", 
      f_status_conservacao: 'VU',
      f_iucn_kingdomName: "ANIMALIA",
      f_iucn_phylumName: "CHORDATA",
      f_iucn_className: "MAMMALIA",
      f_iucn_orderName: "CARNIVORA",
      f_iucn_familyName: "FELIDAE",
      f_iucn_commonNames: "Oncilla, Northern Tiger Cat"
    },
    { 
      id: animalTamanduaBandeiraId, 
      f_nomecientifico: 'Myrmecophaga tridactyla', 
      f_nome: 'Tamanduá-bandeira', 
      f_imagem: 'https://placehold.co/300x200.png', 
      "data-ai-hint": "giant anteater", 
      f_status_conservacao: 'VU',
      f_iucn_kingdomName: "ANIMALIA",
      f_iucn_phylumName: "CHORDATA",
      f_iucn_className: "MAMMALIA",
      f_iucn_orderName: "PILOSA",
      f_iucn_familyName: "MYRMECOPHAGIDAE",
      f_iucn_commonNames: "Giant Anteater"
    },
    { 
      id: animalTamanduaMirimId, 
      f_nomecientifico: 'Tamandua tetradactyla', 
      f_nome: 'Tamanduá-mirim', 
      f_nomes_alternativos: 'Mambira, Coleteiro', 
      f_imagem: 'https://placehold.co/300x200.png', 
      "data-ai-hint": "southern tamandua", 
      f_status_conservacao: 'LC',
      f_iucn_kingdomName: "ANIMALIA",
      f_iucn_phylumName: "CHORDATA",
      f_iucn_className: "MAMMALIA",
      f_iucn_orderName: "PILOSA",
      f_iucn_familyName: "MYRMECOPHAGIDAE",
      f_iucn_commonNames: "Southern Tamandua, Lesser Anteater"
    },
    { 
      id: animalCobraDoMilhoId, 
      f_nomecientifico: 'Pantherophis guttatus', 
      f_nome: 'Cobra-do-milho', 
      f_nomes_alternativos: 'Corn Snake', 
      f_imagem: 'https://placehold.co/300x200.png', 
      "data-ai-hint": "corn snake", 
      f_status_conservacao: 'LC', 
      f_iucn_kingdomName: "ANIMALIA",
      f_iucn_phylumName: "CHORDATA",
      f_iucn_className: "REPTILIA",
      f_iucn_orderName: "SQUAMATA",
      f_iucn_familyName: "COLUBRIDAE",
      f_iucn_commonNames: "Corn Snake, Red Rat Snake"
    },
    { 
      id: animalPitonRealId, 
      f_nomecientifico: 'Python regius', 
      f_nome: 'Píton-real', 
      f_nomes_alternativos: 'Ball Python', 
      f_imagem: 'https://placehold.co/300x200.png', 
      "data-ai-hint": "ball python", 
      f_status_conservacao: 'NT', 
      f_iucn_kingdomName: "ANIMALIA",
      f_iucn_phylumName: "CHORDATA",
      f_iucn_className: "REPTILIA",
      f_iucn_orderName: "SQUAMATA",
      f_iucn_familyName: "PYTHONIDAE",
      f_iucn_commonNames: "Ball Python, Royal Python"
    },
    { 
      id: animalCascavelId, 
      f_nomecientifico: 'Crotalus durissus', 
      f_nome: 'Cascavel', 
      f_imagem: 'https://placehold.co/300x200.png', 
      "data-ai-hint": "tropical rattlesnake", 
      f_status_conservacao: 'LC',
      f_iucn_kingdomName: "ANIMALIA",
      f_iucn_phylumName: "CHORDATA",
      f_iucn_className: "REPTILIA",
      f_iucn_orderName: "SQUAMATA",
      f_iucn_familyName: "VIPERIDAE",
      f_iucn_commonNames: "Tropical Rattlesnake, South American Rattlesnake"
    },
    { 
      id: animalUrubuDeCabecaPretaId, 
      f_nomecientifico: 'Coragyps atratus', 
      f_nome: 'Urubu-de-cabeça-preta', 
      f_imagem: 'https://placehold.co/300x200.png', 
      "data-ai-hint": "black vulture", 
      f_status_conservacao: 'LC',
      f_iucn_kingdomName: "ANIMALIA",
      f_iucn_phylumName: "CHORDATA",
      f_iucn_className: "AVES",
      f_iucn_orderName: "CATHARTIFORMES", // Ou Accipitriformes dependendo da taxonomia
      f_iucn_familyName: "CATHARTIDAE",
      f_iucn_commonNames: "Black Vulture"
    },
    { 
      id: animalCarcaraId, 
      f_nomecientifico: 'Caracara plancus', 
      f_nome: 'Carcará', 
      f_imagem: 'https://placehold.co/300x200.png', 
      "data-ai-hint": "crested caracara", 
      f_status_conservacao: 'LC',
      f_iucn_kingdomName: "ANIMALIA",
      f_iucn_phylumName: "CHORDATA",
      f_iucn_className: "AVES",
      f_iucn_orderName: "FALCONIFORMES",
      f_iucn_familyName: "FALCONIDAE",
      f_iucn_commonNames: "Crested Caracara, Southern Caracara"
    },
    { 
      id: animalMacacoRhesusId, 
      f_nomecientifico: 'Macaca mulatta', 
      f_nome: 'Macaco rhesus', 
      f_imagem: 'https://placehold.co/300x200.png', 
      "data-ai-hint": "rhesus macaque", 
      f_status_conservacao: 'LC', 
      f_iucn_kingdomName: "ANIMALIA",
      f_iucn_phylumName: "CHORDATA",
      f_iucn_className: "MAMMALIA",
      f_iucn_orderName: "PRIMATES",
      f_iucn_familyName: "CERCOPITHECIDAE",
      f_iucn_commonNames: "Rhesus Macaque, Rhesus Monkey"
    },
  ],
  cadastros: [
     { 
      id: '401', 
      f_animalId: animalMacacoPregoGalegoId,
      f_apelido: 'Galego', 
      f_registro: 'BICA-001', 
      f_procedencia: 'Resgate IBAMA', 
      f_entrada: '2023-01-15T00:00:00.000Z', 
      f_sexo: 'Macho', 
      f_idade: '5 anos', 
      f_marcacaotipo: 'Microchip', 
      f_marcacaonumero: '987654321012345',
      f_origem_trafico: true,
      f_informacoes_trafico: 'Resgatado de cativeiro ilegal em feira.',
      f_observacao: 'Adaptação em andamento.'
    },
    { 
      id: generateId(), 
      f_animalId: animalLeaoId,
      f_apelido: 'Simba', 
      f_registro: 'BICA-002', 
      f_procedencia: 'Nascido em cativeiro (outro zoo)', 
      f_entrada: '2022-05-20T00:00:00.000Z', 
      f_sexo: 'Macho', 
      f_idade: '3 anos', 
      f_marcacaotipo: 'Microchip', 
      f_marcacaonumero: '123450987654321',
      f_origem_trafico: false,
      f_observacao: 'Saudável e bem adaptado.'
    },
    { 
      id: generateId(), 
      f_animalId: animalOncaPintadaId,
      f_apelido: 'Juma', 
      f_registro: 'BICA-003', 
      f_procedencia: 'Resgate ICMBio', 
      f_entrada: '2023-11-10T00:00:00.000Z', 
      f_sexo: 'Femea', 
      f_idade: 'Aprox. 2 anos', 
      f_marcacaotipo: 'Sem marcação', 
      f_origem_trafico: true,
      f_informacoes_trafico: 'Encontrada em área de desmatamento, suspeita de tentativa de venda.',
      f_observacao: 'Ainda arisca, requer cuidados especiais.'
    },
    { 
      id: generateId(), 
      f_animalId: animalAraraAzulGrandeId,
      f_apelido: 'Blue', 
      f_registro: 'BICA-004', 
      f_procedencia: 'Apreensão Polícia Federal', 
      f_entrada: '2024-02-01T00:00:00.000Z', 
      f_sexo: 'Indefinido', 
      f_idade: 'Filhote', 
      f_marcacaotipo: 'Anilha CETAS', 
      f_marcacaonumero: 'CETAS-BR-007',
      f_origem_trafico: true,
      f_informacoes_trafico: 'Apreendida com traficante de aves silvestres.',
      f_observacao: 'Recebendo alimentação especial.'
    },
     { 
      id: generateId(), 
      f_animalId: animalJacareDePapoAmareloId,
      f_apelido: 'Papo', 
      f_registro: 'BICA-005', 
      f_procedencia: 'Doação Corpo de Bombeiros', 
      f_entrada: '2023-07-14T00:00:00.000Z', 
      f_sexo: 'Macho', 
      f_idade: 'Jovem', 
      f_marcacaotipo: 'Microchip', 
      f_marcacaonumero: 'JAC001992883',
      f_origem_trafico: false,
      f_observacao: 'Resgatado de área urbana.'
    },
    { 
      id: generateId(), 
      f_animalId: animalSaguiDeTufosBrancosId,
      f_apelido: 'Tufinho', 
      f_registro: 'BICA-006', 
      f_procedencia: 'Entrega voluntária', 
      f_entrada: '2024-01-05T00:00:00.000Z', 
      f_sexo: 'Macho', 
      f_idade: 'Adulto', 
      f_marcacaotipo: 'Sem marcação',
      f_origem_trafico: true,
      f_informacoes_trafico: 'Mantido como animal de estimação ilegalmente.',
      f_observacao: 'Socializando com outros da espécie.'
    },
    { 
      id: generateId(), 
      f_animalId: animalTamanduaBandeiraId,
      f_apelido: 'Bandeira', 
      f_registro: 'BICA-007', 
      f_procedencia: 'Resgate em rodovia', 
      f_entrada: '2023-09-22T00:00:00.000Z', 
      f_sexo: 'Femea', 
      f_idade: 'Adulta', 
      f_marcacaotipo: 'Microchip', 
      f_marcacaonumero: 'TAM001992883',
      f_origem_trafico: false,
      f_observacao: 'Recuperada de ferimentos leves.'
    },
    { 
      id: generateId(), 
      f_animalId: animalCobraDoMilhoId,
      f_apelido: 'Milly', 
      f_registro: 'BICA-008', 
      f_procedencia: 'Doação (pet exótico)', 
      f_entrada: '2023-03-10T00:00:00.000Z', 
      f_sexo: 'Femea', 
      f_idade: '2 anos', 
      f_marcacaotipo: 'Sem marcação',
      f_origem_trafico: false,
      f_observacao: 'Animal dócil, acostumado ao manejo.'
    },
  ],
};

// Populando f_animalNome nos cadastros mockados
db.cadastros.forEach(cadastro => {
  const animal = db.animais.find(a => a.id === cadastro.f_animalId);
  if (animal) {
    cadastro.f_animalNome = animal.f_nome; 
  }
});