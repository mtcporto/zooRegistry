
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
import type { Ordem, Classe } from "@/types";
import { addOrdem } from "@/lib/actions/ordemActions";
import { SubmitButton } from "./SubmitButton";

const formSchema = z.object({
  f_nome: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres." }).max(100),
  f_classeId: z.string({ required_error: "Selecione uma classe." }),
  f_descricao: z.string().max(500).optional(),
  f_imagem: z.string().url({ message: "Por favor, insira uma URL válida para a imagem." }).optional().or(z.literal('')),
  f_hero: z.string().url({ message: "Por favor, insira uma URL válida para a imagem hero." }).optional().or(z.literal('')),
});

type OrdemFormValues = z.infer<typeof formSchema>;

interface OrdemFormProps {
  initialData?: Ordem | null;
  classes: Classe[];
}

export function OrdemForm({ initialData, classes }: OrdemFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<OrdemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      ...initialData,
      f_descricao: initialData.f_descricao || "",
      f_imagem: initialData.f_imagem || "",
      f_hero: initialData.f_hero || "",
    } : {
      f_nome: "",
      f_classeId: "",
      f_descricao: "",
      f_imagem: "",
      f_hero: "",
    },
  });

  async function onSubmit(values: OrdemFormValues) {
    const formData = new FormData();
    formData.append("f_nome", values.f_nome);
    formData.append("f_classeId", values.f_classeId);
    if (values.f_descricao) formData.append("f_descricao", values.f_descricao);
    if (values.f_imagem) formData.append("f_imagem", values.f_imagem);
    if (values.f_hero) formData.append("f_hero", values.f_hero);

    const result = await addOrdem(formData);

    if (result.success) {
      toast({
        title: "Sucesso!",
        description: result.message,
      });
      router.push("/ordens");
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
        <CardTitle>{initialData ? "Editar Ordem" : "Nova Ordem"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="f_classeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Classe</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <FormDescription>A classe à qual esta ordem pertence.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="f_nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Ordem</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Primatas" {...field} />
                  </FormControl>
                  <FormDescription>O nome principal da ordem.</FormDescription>
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
                    <Textarea placeholder="Descreva brevemente a ordem..." {...field} />
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
                  <FormDescription>Link para uma imagem representativa da ordem.</FormDescription>
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
                  <FormDescription>Link para uma imagem de destaque (banner) para a ordem.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <SubmitButton>
                {initialData ? "Salvar Alterações" : "Adicionar Ordem"}
              </SubmitButton>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
