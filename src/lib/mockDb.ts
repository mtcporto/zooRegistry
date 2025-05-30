
import type { Classe, Ordem, Familia, Animal, CadastroAnimal } from '@/types';

interface Db {
  classes: Classe[];
  ordens: Ordem[];
  familias: Familia[];
  animais: Animal[];
  cadastros: CadastroAnimal[];
}

// Helper to generate unique IDs
let nextIdCounter = 500; // Start from a higher number to avoid clashes with initial data
export const generateId = () => {
  nextIdCounter += 1;
  return nextIdCounter.toString();
};

// --- Define all IDs upfront ---

// Classe IDs
const classeMamiferosId = '1';
const classeAvesId = '2';
const classeReptiliaId = generateId(); // 501

// Ordem IDs
const ordemPrimatasId = '101';
const ordemCarnivoraId = generateId(); // 502
const ordemCrocodyliaId = generateId(); // 503
const ordemPsittaciformesId = generateId(); // 504
const ordemPilosaId = generateId(); // 505
const ordemSquamataId = generateId(); // 506
const ordemCathartiformesId = generateId(); // 507
const ordemFalconiformesId = generateId(); // 508

// Familia IDs
const familiaCebidaeId = '201';
const familiaFelidaeId = generateId(); // 509
const familiaAlligatoridaeId = generateId(); // 510
const familiaPsittacidaeId = generateId(); // 511
const familiaCallitrichidaeId = generateId(); // 512
const familiaMyrmecophagidaeId = generateId(); // 513
const familiaColubridaeId = generateId(); // 514
const familiaPythonidaeId = generateId(); // 515
const familiaViperidaeId = generateId(); // 516
const familiaCathartidaeId = generateId(); // 517
const familiaFalconidaeId = generateId(); // 518
const familiaCercopithecidaeId = generateId(); // 519

// Animal IDs
const animalMacacoPregoGalegoId = '301'; // Hardcoded as per original
const animalLeaoId = generateId(); // 520
const animalOncaPintadaId = generateId(); // 521
const animalOncaPardaId = generateId(); // 522
const animalJacareDePapoAmareloId = generateId(); // 523
const animalAraraAzulGrandeId = generateId(); // 524
const animalSaguiDeTufosBrancosId = generateId(); // 525
const animalGatoDoMatoPequenoId = generateId(); // 526
const animalTamanduaBandeiraId = generateId(); // 527
const animalTamanduaMirimId = generateId(); // 528
const animalCobraDoMilhoId = generateId(); // 529
const animalPitonRealId = generateId(); // 530
const animalCascavelId = generateId(); // 531
const animalUrubuDeCabecaPretaId = generateId(); // 532
const animalCarcaraId = generateId(); // 533
const animalMacacoRhesusId = generateId(); // 534

// --- Define the DB object ---
export const db: Db = {
  classes: [
    { id: classeMamiferosId, f_nome: 'Mamíferos', f_descricao: 'Animais vertebrados que se caracterizam pela presença de glândulas mamárias.', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "mammal illustration", f_hero: 'https://placehold.co/800x400.png', "data-ai-hint-hero": "mammal diversity" },
    { id: classeAvesId, f_nome: 'Aves', f_descricao: 'Animais vertebrados que se caracterizam pela presença de penas, bico e capacidade de voo na maioria das espécies.', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "bird illustration", f_hero: 'https://placehold.co/800x400.png', "data-ai-hint-hero": "bird flight" },
    { id: classeReptiliaId, f_nome: 'Répteis', f_descricao: 'Animais vertebrados que se caracterizam pela pele coberta por escamas ou placas córneas.', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "reptile skin", f_hero: 'https://placehold.co/800x400.png', "data-ai-hint-hero": "reptile habitat" },
  ],
  ordens: [
    { id: ordemPrimatasId, f_classeId: classeMamiferosId, f_nome: 'Primatas', f_descricao: 'Ordem de mamíferos que inclui lêmures, macacos e humanos.', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "monkey group", f_hero: 'https://placehold.co/800x400.png', "data-ai-hint-hero": "jungle canopy" },
    { id: ordemCarnivoraId, f_classeId: classeMamiferosId, f_nome: 'Carnivora', f_descricao: 'Ordem de mamíferos placentários que se alimentam predominantemente de carne.', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "predator teeth", f_hero: 'https://placehold.co/800x400.png', "data-ai-hint-hero": "savanna hunt" },
    { id: ordemCrocodyliaId, f_classeId: classeReptiliaId, f_nome: 'Crocodylia', f_descricao: 'Ordem de répteis grandes, predadores e semiaquáticos.', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "crocodile snout", f_hero: 'https://placehold.co/800x400.png', "data-ai-hint-hero": "swamp water" },
    { id: ordemPsittaciformesId, f_classeId: classeAvesId, f_nome: 'Psittaciformes', f_descricao: 'Ordem de aves que inclui papagaios, araras, periquitos e cacatuas.', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "parrot feather", f_hero: 'https://placehold.co/800x400.png', "data-ai-hint-hero": "tropical rainforest" },
    { id: ordemPilosaId, f_classeId: classeMamiferosId, f_nome: 'Pilosa', f_descricao: 'Ordem de mamíferos que inclui tamanduás e preguiças.', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "anteater snout", f_hero: 'https://placehold.co/800x400.png', "data-ai-hint-hero": "forest floor" },
    { id: ordemSquamataId, f_classeId: classeReptiliaId, f_nome: 'Squamata', f_descricao: 'Ordem de répteis que inclui lagartos, serpentes e anfisbenas.', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "snake scale", f_hero: 'https://placehold.co/800x400.png', "data-ai-hint-hero": "desert rocks" },
    { id: ordemCathartiformesId, f_classeId: classeAvesId, f_nome: 'Cathartiformes', f_descricao: 'Ordem de aves que inclui os abutres do Novo Mundo.', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "vulture flight", f_hero: 'https://placehold.co/800x400.png', "data-ai-hint-hero": "sky expanse" },
    { id: ordemFalconiformesId, f_classeId: classeAvesId, f_nome: 'Falconiformes', f_descricao: 'Ordem de aves de rapina diurnas, como falcões e carcarás.', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "falcon talon", f_hero: 'https://placehold.co/800x400.png', "data-ai-hint-hero": "mountain peak" },
  ],
  familias: [
    { id: familiaCebidaeId, f_ordemId: ordemPrimatasId, f_nome: 'Cebidae', f_descricao: 'Família de macacos do Novo Mundo, como macacos-prego e micos-de-cheiro.', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "capuchin monkey", f_hero: 'https://placehold.co/800x400.png', "data-ai-hint-hero": "newworld monkeys" },
    { id: familiaFelidaeId, f_ordemId: ordemCarnivoraId, f_nome: 'Felidae', f_descricao: 'Família de mamíferos carnívoros que inclui leões, tigres, onças e gatos domésticos.', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "feline eyes", f_hero: 'https://placehold.co/800x400.png', "data-ai-hint-hero": "big cat" },
    { id: familiaAlligatoridaeId, f_ordemId: ordemCrocodyliaId, f_nome: 'Alligatoridae', f_descricao: 'Família de crocodilianos que inclui jacarés e caimões.', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "alligator jaw", f_hero: 'https://placehold.co/800x400.png', "data-ai-hint-hero": "river bank" },
    { id: familiaPsittacidaeId, f_ordemId: ordemPsittaciformesId, f_nome: 'Psittacidae', f_descricao: 'Família de aves que compreende a maioria dos papagaios e araras típicos.', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "macaw plumage", f_hero: 'https://placehold.co/800x400.png', "data-ai-hint-hero": "colorful birds" },
    { id: familiaCallitrichidaeId, f_ordemId: ordemPrimatasId, f_nome: 'Callitrichidae', f_descricao: 'Família de primatas do Novo Mundo que inclui saguis e micos-leões.', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "marmoset fur", f_hero: 'https://placehold.co/800x400.png', "data-ai-hint-hero": "small monkeys" },
    { id: familiaMyrmecophagidaeId, f_ordemId: ordemPilosaId, f_nome: 'Myrmecophagidae', f_descricao: 'Família de mamíferos que inclui os tamanduás.', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "anteater claws", f_hero: 'https://placehold.co/800x400.png', "data-ai-hint-hero": "termite mound" },
    { id: familiaColubridaeId, f_ordemId: ordemSquamataId, f_nome: 'Colubridae', f_descricao: 'A maior família de serpentes, com espécies não venenosas ou com veneno de baixa toxicidade para humanos.', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "corn snake", f_hero: 'https://placehold.co/800x400.png', "data-ai-hint-hero": "snake pattern" },
    { id: familiaPythonidaeId, f_ordemId: ordemSquamataId, f_nome: 'Pythonidae', f_descricao: 'Família de serpentes constritoras encontradas na África, Ásia e Austrália.', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "python coil", f_hero: 'https://placehold.co/800x400.png', "data-ai-hint-hero": "large snake" },
    { id: familiaViperidaeId, f_ordemId: ordemSquamataId, f_nome: 'Viperidae', f_descricao: 'Família de serpentes peçonhentas, como víboras e cascavéis.', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "viper fangs", f_hero: 'https://placehold.co/800x400.png', "data-ai-hint-hero": "venomous snake" },
    { id: familiaCathartidaeId, f_ordemId: ordemCathartiformesId, f_nome: 'Cathartidae', f_descricao: 'Família de aves de rapina necrófagas do Novo Mundo, conhecidas como urubus ou condores.', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "vulture head", f_hero: 'https://placehold.co/800x400.png', "data-ai-hint-hero": "scavenging bird" },
    { id: familiaFalconidaeId, f_ordemId: ordemFalconiformesId, f_nome: 'Falconidae', f_descricao: 'Família de aves de rapina que inclui falcões, carcarás e queresmas.', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "caracara beak", f_hero: 'https://placehold.co/800x400.png', "data-ai-hint-hero": "bird prey" },
    { id: familiaCercopithecidaeId, f_ordemId: ordemPrimatasId, f_nome: 'Cercopithecidae', f_descricao: 'Família de primatas do Velho Mundo, como macacos rhesus e babuínos.', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "rhesus macaque", f_hero: 'https://placehold.co/800x400.png', "data-ai-hint-hero": "oldworld monkeys" },
  ],
  animais: [
    { id: animalMacacoPregoGalegoId, f_classeId: classeMamiferosId, f_ordemId: ordemPrimatasId, f_familiaId: familiaCebidaeId, f_nomecientifico: 'Sapajus flavius', f_nome: 'Macaco-prego-galego', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "blonde capuchin", f_status_conservacao: 'Em Perigo (EN)' },
    { id: animalLeaoId, f_classeId: classeMamiferosId, f_ordemId: ordemCarnivoraId, f_familiaId: familiaFelidaeId, f_nomecientifico: 'Panthera leo', f_nome: 'Leão', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "lion pride", f_status_conservacao: 'Vulnerável (VU)' },
    { id: animalOncaPintadaId, f_classeId: classeMamiferosId, f_ordemId: ordemCarnivoraId, f_familiaId: familiaFelidaeId, f_nomecientifico: 'Panthera onca', f_nome: 'Onça-pintada', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "jaguar spots", f_status_conservacao: 'Quase Ameaçado (NT)' },
    { id: animalOncaPardaId, f_classeId: classeMamiferosId, f_ordemId: ordemCarnivoraId, f_familiaId: familiaFelidaeId, f_nomecientifico: 'Puma concolor', f_nome: 'Onça-parda', f_nomes_alternativos: 'Suçuarana, Leão-baio', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "puma concolor", f_status_conservacao: 'Pouco Preocupante (LC)' },
    { id: animalJacareDePapoAmareloId, f_classeId: classeReptiliaId, f_ordemId: ordemCrocodyliaId, f_familiaId: familiaAlligatoridaeId, f_nomecientifico: 'Caiman latirostris', f_nome: 'Jacaré-de-papo-amarelo', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "caiman snout", f_status_conservacao: 'Pouco Preocupante (LC)' },
    { id: animalAraraAzulGrandeId, f_classeId: classeAvesId, f_ordemId: ordemPsittaciformesId, f_familiaId: familiaPsittacidaeId, f_nomecientifico: 'Anodorhynchus hyacinthinus', f_nome: 'Arara-azul-grande', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "hyacinth macaw", f_status_conservacao: 'Vulnerável (VU)' },
    { id: animalSaguiDeTufosBrancosId, f_classeId: classeMamiferosId, f_ordemId: ordemPrimatasId, f_familiaId: familiaCallitrichidaeId, f_nomecientifico: 'Callithrix jacchus', f_nome: 'Sagui-de-tufos-brancos', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "common marmoset", f_status_conservacao: 'Pouco Preocupante (LC)' },
    { id: animalGatoDoMatoPequenoId, f_classeId: classeMamiferosId, f_ordemId: ordemCarnivoraId, f_familiaId: familiaFelidaeId, f_nomecientifico: 'Leopardus tigrinus', f_nome: 'Gato-do-mato-pequeno', f_nomes_alternativos: 'Oncilla', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "oncilla cat", f_status_conservacao: 'Vulnerável (VU)' },
    { id: animalTamanduaBandeiraId, f_classeId: classeMamiferosId, f_ordemId: ordemPilosaId, f_familiaId: familiaMyrmecophagidaeId, f_nomecientifico: 'Myrmecophaga tridactyla', f_nome: 'Tamanduá-bandeira', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "giant anteater", f_status_conservacao: 'Vulnerável (VU)' },
    { id: animalTamanduaMirimId, f_classeId: classeMamiferosId, f_ordemId: ordemPilosaId, f_familiaId: familiaMyrmecophagidaeId, f_nomecientifico: 'Tamandua tetradactyla', f_nome: 'Tamanduá-mirim', f_nomes_alternativos: 'Mambira, Coleteiro', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "southern tamandua", f_status_conservacao: 'Pouco Preocupante (LC)' },
    { id: animalCobraDoMilhoId, f_classeId: classeReptiliaId, f_ordemId: ordemSquamataId, f_familiaId: familiaColubridaeId, f_nomecientifico: 'Pantherophis guttatus', f_nome: 'Cobra-do-milho', f_nomes_alternativos: 'Corn Snake', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "corn snake", f_status_conservacao: 'Pouco Preocupante (LC) (Não nativa)' },
    { id: animalPitonRealId, f_classeId: classeReptiliaId, f_ordemId: ordemSquamataId, f_familiaId: familiaPythonidaeId, f_nomecientifico: 'Python regius', f_nome: 'Píton-real', f_nomes_alternativos: 'Ball Python', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "ball python", f_status_conservacao: 'Quase Ameaçado (NT) (Não nativa)' },
    { id: animalCascavelId, f_classeId: classeReptiliaId, f_ordemId: ordemSquamataId, f_familiaId: familiaViperidaeId, f_nomecientifico: 'Crotalus durissus', f_nome: 'Cascavel', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "rattlesnake rattle", f_status_conservacao: 'Pouco Preocupante (LC)' },
    { id: animalUrubuDeCabecaPretaId, f_classeId: classeAvesId, f_ordemId: ordemCathartiformesId, f_familiaId: familiaCathartidaeId, f_nomecientifico: 'Coragyps atratus', f_nome: 'Urubu-de-cabeça-preta', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "black vulture", f_status_conservacao: 'Pouco Preocupante (LC)' },
    { id: animalCarcaraId, f_classeId: classeAvesId, f_ordemId: ordemFalconiformesId, f_familiaId: familiaFalconidaeId, f_nomecientifico: 'Caracara plancus', f_nome: 'Carcará', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "southern caracara", f_status_conservacao: 'Pouco Preocupante (LC)' },
    { id: animalMacacoRhesusId, f_classeId: classeMamiferosId, f_ordemId: ordemPrimatasId, f_familiaId: familiaCercopithecidaeId, f_nomecientifico: 'Macaca mulatta', f_nome: 'Macaco rhesus', f_imagem: 'https://placehold.co/300x200.png', "data-ai-hint": "rhesus macaque", f_status_conservacao: 'Pouco Preocupante (LC) (Não nativo)' },
  ],
  cadastros: [
    { 
      id: '401', 
      f_animalId: animalMacacoPregoGalegoId,
      f_apelido: 'Galego', 
      f_registro: 'BICA-001', 
      f_procedencia: 'Resgate IBAMA', 
      f_entrada: '2023-01-15', 
      f_sexo: 'Macho', 
      f_idade: '5 anos', 
      f_marcacaotipo: 'Microchip', 
      f_marcacaonumero: '987654321012345',
      f_origem_trafico: true,
      f_informacoes_trafico: 'Resgatado de cativeiro ilegal em feira.',
      f_observacao: 'Adaptação em andamento.'
    },
    { 
      id: generateId(), // 535
      f_animalId: animalLeaoId,
      f_apelido: 'Simba', 
      f_registro: 'BICA-002', 
      f_procedencia: 'Nascido em cativeiro (outro zoo)', 
      f_entrada: '2022-05-20', 
      f_sexo: 'Macho', 
      f_idade: '3 anos', 
      f_marcacaotipo: 'Microchip', 
      f_marcacaonumero: '123450987654321',
      f_origem_trafico: false,
      f_observacao: 'Saudável e bem adaptado.'
    },
    { 
      id: generateId(), // 536
      f_animalId: animalOncaPintadaId,
      f_apelido: 'Juma', 
      f_registro: 'BICA-003', 
      f_procedencia: 'Resgate ICMBio', 
      f_entrada: '2023-11-10', 
      f_sexo: 'Femea', 
      f_idade: 'Aprox. 2 anos', 
      f_marcacaotipo: 'Sem marcação', 
      f_origem_trafico: true,
      f_informacoes_trafico: 'Encontrada em área de desmatamento, suspeita de tentativa de venda.',
      f_observacao: 'Ainda arisca, requer cuidados especiais.'
    },
    { 
      id: generateId(), // 537
      f_animalId: animalAraraAzulGrandeId,
      f_apelido: 'Blue', 
      f_registro: 'BICA-004', 
      f_procedencia: 'Apreensão Polícia Federal', 
      f_entrada: '2024-02-01', 
      f_sexo: 'Indefinido', 
      f_idade: 'Filhote', 
      f_marcacaotipo: 'Anilha CETAS', 
      f_marcacaonumero: 'CETAS-BR-007',
      f_origem_trafico: true,
      f_informacoes_trafico: 'Apreendida com traficante de aves silvestres.',
      f_observacao: 'Recebendo alimentação especial.'
    },
     { 
      id: generateId(), // 538
      f_animalId: animalJacareDePapoAmareloId,
      f_apelido: 'Papo', 
      f_registro: 'BICA-005', 
      f_procedencia: 'Doação Corpo de Bombeiros', 
      f_entrada: '2023-07-14', 
      f_sexo: 'Macho', 
      f_idade: 'Jovem', 
      f_marcacaotipo: 'Microchip', 
      f_marcacaonumero: 'JAC001992883',
      f_origem_trafico: false,
      f_observacao: 'Resgatado de área urbana.'
    },
    { 
      id: generateId(), // 539
      f_animalId: animalSaguiDeTufosBrancosId,
      f_apelido: 'Tufinho', 
      f_registro: 'BICA-006', 
      f_procedencia: 'Entrega voluntária', 
      f_entrada: '2024-01-05', 
      f_sexo: 'Macho', 
      f_idade: 'Adulto', 
      f_marcacaotipo: 'Sem marcação',
      f_origem_trafico: true,
      f_informacoes_trafico: 'Mantido como animal de estimação ilegalmente.',
      f_observacao: 'Socializando com outros da espécie.'
    },
    { 
      id: generateId(), // 540
      f_animalId: animalTamanduaBandeiraId,
      f_apelido: 'Bandeira', 
      f_registro: 'BICA-007', 
      f_procedencia: 'Resgate em rodovia', 
      f_entrada: '2023-09-22', 
      f_sexo: 'Femea', 
      f_idade: 'Adulta', 
      f_marcacaotipo: 'Microchip', 
      f_marcacaonumero: 'TAM001992883',
      f_origem_trafico: false,
      f_observacao: 'Recuperada de ferimentos leves.'
    },
    { 
      id: generateId(), // 541
      f_animalId: animalCobraDoMilhoId,
      f_apelido: 'Milly', 
      f_registro: 'BICA-008', 
      f_procedencia: 'Doação (pet exótico)', 
      f_entrada: '2023-03-10', 
      f_sexo: 'Femea', 
      f_idade: '2 anos', 
      f_marcacaotipo: 'Sem marcação',
      f_origem_trafico: false,
      f_observacao: 'Animal dócil, acostumado ao manejo.'
    },
  ],
};

// --- Post-initialization mapping for display names ---
// This part runs after 'db' is fully initialized.

db.ordens.forEach(ordem => {
  const classe = db.classes.find(c => c.id === ordem.f_classeId);
  if (classe) ordem.f_classeNome = classe.f_nome;
});

db.familias.forEach(familia => {
  const ordem = db.ordens.find(o => o.id === familia.f_ordemId);
  if (ordem) familia.f_ordemNome = ordem.f_nome;
});

db.animais.forEach(animal => {
  const classe = db.classes.find(c => c.id === animal.f_classeId);
  const ordem = db.ordens.find(o => o.id === animal.f_ordemId);
  const familia = db.familias.find(f => f.id === animal.f_familiaId);
  if (classe) animal.f_classeNome = classe.f_nome;
  if (ordem) animal.f_ordemNome = ordem.f_nome;
  if (familia) animal.f_familiaNome = familia.f_nome;
});

db.cadastros.forEach(cadastro => {
  const animal = db.animais.find(a => a.id === cadastro.f_animalId);
  if (animal) cadastro.f_animalNome = animal.f_nome;
});

    