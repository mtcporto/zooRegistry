
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Classe } from "@/types";
import { addClasse } from "@/lib/actions/classeActions";
import { SubmitButton } from "./SubmitButton";

const formSchema = z.object({
  f_nome: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres." }).max(100),
  f_descricao: z.string().max(500).optional(),
  f_imagem: z.string().url({ message: "Por favor, insira uma URL válida para a imagem." }).optional().or(z.literal('')),
  f_hero: z.string().url({ message: "Por favor, insira uma URL válida para a imagem hero." }).optional().or(z.literal('')),
});

type ClasseFormValues = z.infer<typeof formSchema>;

interface ClasseFormProps {
  initialData?: Classe | null;
}

export function ClasseForm({ initialData }: ClasseFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<ClasseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      f_nome: "",
      f_descricao: "",
      f_imagem: "",
      f_hero: "",
    },
  });

  async function onSubmit(values: ClasseFormValues) {
    const formData = new FormData();
    formData.append("f_nome", values.f_nome);
    if (values.f_descricao) formData.append("f_descricao", values.f_descricao);
    if (values.f_imagem) formData.append("f_imagem", values.f_imagem);
    if (values.f_hero) formData.append("f_hero", values.f_hero);
    
    // TODO: Add data-ai-hint based on f_nome if f_imagem or f_hero are provided
    // For example: (newClasse as any)['data-ai-hint'] = values.f_nome.toLowerCase().split(" ")[0];

    const result = await addClasse(formData);

    if (result.success) {
      toast({
        title: "Sucesso!",
        description: result.message,
      });
      router.push("/classes");
      router.refresh(); // Ensure the list is updated
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
        <CardTitle>{initialData ? "Editar Classe" : "Nova Classe"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="f_nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Classe</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Mamíferos" {...field} />
                  </FormControl>
                  <FormDescription>O nome principal da classe.</FormDescription>
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
                    <Textarea placeholder="Descreva brevemente a classe..." {...field} />
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
                  <FormDescription>Link para uma imagem representativa da classe.</FormDescription>
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
                  <FormDescription>Link para uma imagem de destaque (banner) para a classe.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <SubmitButton>
                {initialData ? "Salvar Alterações" : "Adicionar Classe"}
              </SubmitButton>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
