import { z } from "zod";
import { sexosAnimais, marcacaoTiposAnimais } from "@/types";

export const animalFormSchema = z.object({
  f_nomecientifico: z.string().min(2, { message: "Nome científico deve ter pelo menos 2 caracteres." }).max(100),
  f_nome: z.string().min(2, { message: "Nome vulgar deve ter pelo menos 2 caracteres." }).max(100),
  f_nomes_alternativos: z.string().max(200).optional().nullable(),
  f_imagem: z.string().url({ message: "Por favor, insira uma URL válida para a imagem." }).optional().or(z.literal('')).nullable(),
  f_status_conservacao: z.string().max(100).optional().nullable(),
});

export const cadastroFormSchema = z.object({
  f_animalId: z.string({
    error: issue => issue.input === undefined ? "Selecione a espécie do animal." : undefined,
  }),
  f_apelido: z.string().max(100).optional().nullable(),
  f_registro: z.string().max(50).optional().nullable(),
  f_procedencia: z.string().max(200).optional().nullable(),
  f_entrada: z.date().optional().nullable(),
  f_sexo: z.enum(sexosAnimais).optional().nullable(),
  f_idade: z.string().max(50).optional().nullable(),
  f_sinais: z.string().max(500).optional().nullable(),
  f_marcacaotipo: z.enum(marcacaoTiposAnimais).optional().nullable(),
  f_marcacaonumero: z.string().max(50).optional().nullable(),
  f_saida: z.date().optional().nullable(),
  f_motivosaida: z.string().max(500).optional().nullable(),
  f_observacao: z.string().max(1000).optional().nullable(),
  f_origem_trafico: z.boolean().optional().default(false),
  f_informacoes_trafico: z.string().max(500).optional().nullable(),
});
