
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Animal, Classe, Ordem, Familia } from "@/types";
import { addAnimal } from "@/lib/actions/animalActions";
import { SubmitButton } from "./SubmitButton";

const formSchema = z.object({
  f_nomecientifico: z.string().min(2, { message: "Nome científico deve ter pelo menos 2 caracteres." }).max(100),
  f_nome: z.string().min(2, { message: "Nome vulgar deve ter pelo menos 2 caracteres." }).max(100),
  f_classeId: z.string({ required_error: "Selecione uma classe." }),
  f_ordemId: z.string({ required_error: "Selecione uma ordem." }),
  f_familiaId: z.string({ required_error: "Selecione uma família." }),
  f_nomes_alternativos: z.string().max(200).optional(),
  f_imagem: z.string().url({ message: "Por favor, insira uma URL válida para a imagem." }).optional().or(z.literal('')),
});

type AnimalFormValues = z.infer<typeof formSchema>;

interface AnimalFormProps {
  initialData?: Animal | null;
  classes: Classe[];
  ordens: Ordem[];
  familias: Familia[];
}

export function AnimalForm({ initialData, classes, ordens: allOrdens, familias: allFamilias }: AnimalFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<AnimalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      f_nomecientifico: "",
      f_nome: "",
      f_classeId: "",
      f_ordemId: "",
      f_familiaId: "",
      f_nomes_alternativos: "",
      f_imagem: "",
    },
  });

  const selectedClasseId = form.watch("f_classeId");
  const selectedOrdemId = form.watch("f_ordemId");

  const filteredOrdens = React.useMemo(() => {
    if (!selectedClasseId) return [];
    return allOrdens.filter(ordem => ordem.f_classeId === selectedClasseId);
  }, [selectedClasseId, allOrdens]);

  const filteredFamilias = React.useMemo(() => {
    if (!selectedOrdemId) return [];
    return allFamilias.filter(familia => familia.f_ordemId === selectedOrdemId);
  }, [selectedOrdemId, allFamilias]);
  
  React.useEffect(() => {
    // Reset ordem if classe changes and selected ordem is no longer valid
    if (selectedClasseId && form.getValues("f_ordemId")) {
        const currentOrdem = allOrdens.find(o => o.id === form.getValues("f_ordemId"));
        if (currentOrdem && currentOrdem.f_classeId !== selectedClasseId) {
            form.setValue("f_ordemId", "");
            form.setValue("f_familiaId", ""); // Also reset familia
        }
    }
  }, [selectedClasseId, form, allOrdens]);

  React.useEffect(() => {
    // Reset familia if ordem changes and selected familia is no longer valid
    if (selectedOrdemId && form.getValues("f_familiaId")) {
        const currentFamilia = allFamilias.find(f => f.id === form.getValues("f_familiaId"));
        if (currentFamilia && currentFamilia.f_ordemId !== selectedOrdemId) {
            form.setValue("f_familiaId", "");
        }
    }
  }, [selectedOrdemId, form, allFamilias]);


  async function onSubmit(values: AnimalFormValues) {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    const result = await addAnimal(formData);

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
        <CardTitle>{initialData ? "Editar Animal" : "Novo Animal (Espécie)"}</CardTitle>
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
            
            <FormField
              control={form.control}
              name="f_classeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Classe</FormLabel>
                  <Select onValueChange={(value) => { field.onChange(value); form.setValue("f_ordemId", ""); form.setValue("f_familiaId", ""); }} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a classe" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classes.map((classe) => (
                        <SelectItem key={classe.id} value={classe.id}>
                          {classe.f_nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="f_ordemId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ordem</FormLabel>
                  <Select onValueChange={(value) => { field.onChange(value); form.setValue("f_familiaId", ""); }} value={field.value} disabled={!selectedClasseId || filteredOrdens.length === 0}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={!selectedClasseId ? "Selecione uma classe primeiro" : (filteredOrdens.length === 0 ? "Nenhuma ordem para esta classe" : "Selecione a ordem")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredOrdens.map((ordem) => (
                        <SelectItem key={ordem.id} value={ordem.id}>
                          {ordem.f_nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="f_familiaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Família</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!selectedOrdemId || filteredFamilias.length === 0}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={!selectedOrdemId ? "Selecione uma ordem primeiro" : (filteredFamilias.length === 0 ? "Nenhuma família para esta ordem" : "Selecione a família")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredFamilias.map((familia) => (
                        <SelectItem key={familia.id} value={familia.id}>
                          {familia.f_nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="f_nomes_alternativos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Outros Nomes (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Nomes populares, regionais, etc." {...field} />
                  </FormControl>
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
                    <Input type="url" placeholder="https://exemplo.com/imagem.png" {...field} />
                  </FormControl>
                  <FormDescription>Link para uma foto ou ilustração do animal.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <SubmitButton>
                {initialData ? "Salvar Alterações" : "Adicionar Animal"}
              </SubmitButton>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
