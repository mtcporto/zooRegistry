
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// Select, SelectContent, SelectItem, SelectTrigger, SelectValue removidos pois não há mais seleção de classe/ordem/família local
import { Card, CardContent, CardHeader, CardTitle, CardDescription as CardSubDescription } from "@/components/ui/card";
import type { Animal } from "@/types"; // Classe, Ordem, Familia removidos
import { addAnimal, updateAnimal } from "@/lib/actions/animalActions";
import { SubmitButton } from "./SubmitButton";

const formSchema = z.object({
  f_nomecientifico: z.string().min(2, { message: "Nome científico deve ter pelo menos 2 caracteres." }).max(100),
  f_nome: z.string().min(2, { message: "Nome vulgar deve ter pelo menos 2 caracteres." }).max(100),
  // f_classeId, f_ordemId, f_familiaId removidos
  f_nomes_alternativos: z.string().max(200).optional().nullable(),
  f_imagem: z.string().url({ message: "Por favor, insira uma URL válida para a imagem." }).optional().or(z.literal('')).nullable(),
  f_status_conservacao: z.string().max(100).optional().nullable(), // Usuário pode sobrescrever status da IUCN
});

type AnimalFormValues = z.infer<typeof formSchema>;

interface AnimalFormProps {
  initialData?: Animal | null;
  // classes, ordens, familias props removidas
}

export function AnimalForm({ initialData }: AnimalFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<AnimalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
        f_nomecientifico: initialData.f_nomecientifico || "",
        f_nome: initialData.f_nome || "",
        f_nomes_alternativos: initialData.f_nomes_alternativos || "",
        f_imagem: initialData.f_imagem || "",
        f_status_conservacao: initialData.f_status_conservacao || "",
    } : {
      f_nomecientifico: "",
      f_nome: "",
      f_nomes_alternativos: "",
      f_imagem: "",
      f_status_conservacao: "",
    },
  });

  async function onSubmit(values: AnimalFormValues) {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    // Se for edição e o nome científico mudou, a action deve rebuscar dados da IUCN
    if (initialData?.id && initialData.f_nomecientifico !== values.f_nomecientifico) {
        formData.append("f_rebuscar_iucn", "true");
    }


    let result;
    if (initialData?.id) {
      result = await updateAnimal(initialData.id, formData);
    } else {
      result = await addAnimal(formData);
    }

    if (result.success) {
      toast({
        title: "Sucesso!",
        description: result.message,
      });
      router.push("/animais");
      router.refresh();
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive",
      });
    }
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>{initialData ? `Editar Espécie: ${initialData.f_nome}` : "Nova Espécie Animal"}</CardTitle>
        {initialData && (
            <CardSubDescription className="text-sm text-muted-foreground pt-2">
                Informações Taxonômicas (IUCN): <br />
                {initialData.f_iucn_kingdomName && <span>Reino: {initialData.f_iucn_kingdomName}<br /></span>}
                {initialData.f_iucn_phylumName && <span>Filo: {initialData.f_iucn_phylumName}<br /></span>}
                {initialData.f_iucn_className && <span>Classe: {initialData.f_iucn_className}<br /></span>}
                {initialData.f_iucn_orderName && <span>Ordem: {initialData.f_iucn_orderName}<br /></span>}
                {initialData.f_iucn_familyName && <span>Família: {initialData.f_iucn_familyName}<br /></span>}
                {initialData.f_iucn_commonNames && <span>Outros Nomes (IUCN): {initialData.f_iucn_commonNames}</span>}
                 {!initialData.f_iucn_className && <span>Nenhuma informação taxonômica da IUCN disponível.</span>}
            </CardSubDescription>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="f_nomecientifico"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Científico</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Panthera leo" {...field} />
                    </FormControl>
                    <FormDescription>Este nome será usado para buscar dados na IUCN.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="f_nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Vulgar</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Leão" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Campos de seleção de Classe, Ordem, Família removidos */}
            
            <FormField
              control={form.control}
              name="f_nomes_alternativos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Outros Nomes Locais (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Nomes populares, regionais, etc., usados localmente." {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormDescription>Nomes comuns da IUCN serão buscados automaticamente.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="f_imagem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Imagem (Opcional)</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://exemplo.com/imagem.png" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormDescription>Deixe em branco para tentar buscar automaticamente na Pexels.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="f_status_conservacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status de Conservação (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: EN, VU, LC" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormDescription>Deixe em branco para buscar na IUCN. Se preenchido, este valor será usado.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <SubmitButton>
                {initialData ? "Salvar Alterações" : "Adicionar Espécie"}
              </SubmitButton>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
