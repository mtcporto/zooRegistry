
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

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
import type { Familia, Ordem } from "@/types";
import { addFamilia } from "@/lib/actions/familiaActions";
import { SubmitButton } from "./SubmitButton";

const formSchema = z.object({
  f_nome: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres." }).max(100),
  f_ordemId: z.string({ required_error: "Selecione uma ordem." }),
  f_descricao: z.string().max(500).optional(),
  f_imagem: z.string().url({ message: "Por favor, insira uma URL válida para a imagem." }).optional().or(z.literal('')),
  f_hero: z.string().url({ message: "Por favor, insira uma URL válida para a imagem hero." }).optional().or(z.literal('')),
});

type FamiliaFormValues = z.infer<typeof formSchema>;

interface FamiliaFormProps {
  initialData?: Familia | null;
  ordens: Ordem[];
}

export function FamiliaForm({ initialData, ordens }: FamiliaFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FamiliaFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      f_descricao: initialData.f_descricao || "",
      f_imagem: initialData.f_imagem || "",
      f_hero: initialData.f_hero || "",
    } : {
      f_nome: "",
      f_ordemId: "",
      f_descricao: "",
      f_imagem: "",
      f_hero: "",
    },
  });

  async function onSubmit(values: FamiliaFormValues) {
    const formData = new FormData();
    formData.append("f_nome", values.f_nome);
    formData.append("f_ordemId", values.f_ordemId);
    if (values.f_descricao) formData.append("f_descricao", values.f_descricao);
    if (values.f_imagem) formData.append("f_imagem", values.f_imagem);
    if (values.f_hero) formData.append("f_hero", values.f_hero);

    const result = await addFamilia(formData);

    if (result.success) {
      toast({
        title: "Sucesso!",
        description: result.message,
      });
      router.push("/familias");
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
        <CardTitle>{initialData ? "Editar Família" : "Nova Família"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="f_ordemId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ordem</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a ordem" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ordens.map((ordem) => (
                        <SelectItem key={ordem.id} value={ordem.id}>
                          {ordem.f_nome} (Classe: {ordem.f_classeNome || 'N/A'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>A ordem à qual esta família pertence.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="f_nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Família</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Felidae" {...field} />
                  </FormControl>
                  <FormDescription>O nome principal da família.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="f_descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva brevemente a família..." {...field} />
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
                  <FormDescription>Link para uma imagem representativa da família.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="f_hero"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Imagem Hero (Opcional)</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://exemplo.com/hero.png" {...field} />
                  </FormControl>
                  <FormDescription>Link para uma imagem de destaque (banner) para a família.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <SubmitButton>
                {initialData ? "Salvar Alterações" : "Adicionar Família"}
              </SubmitButton>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
