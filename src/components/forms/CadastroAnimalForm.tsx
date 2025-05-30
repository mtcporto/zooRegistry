
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CadastroAnimal, Animal, SexoAnimal, MarcacaoTipoAnimal } from "@/types";
import { sexosAnimais, marcacaoTiposAnimais } from "@/types";
import { addCadastro } from "@/lib/actions/cadastroActions";
import { SubmitButton } from "./SubmitButton";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  f_animalId: z.string({ required_error: "Selecione a espécie do animal." }),
  f_apelido: z.string().max(100).optional(),
  f_registro: z.string().max(50).optional(),
  f_procedencia: z.string().max(200).optional(),
  f_entrada: z.date().optional(),
  f_sexo: z.enum(sexosAnimais).optional(),
  f_idade: z.string().max(50).optional(),
  f_sinais: z.string().max(500).optional(),
  f_marcacaotipo: z.enum(marcacaoTiposAnimais).optional(),
  f_marcacaonumero: z.string().max(50).optional(),
  f_saida: z.date().optional(),
  f_motivosaida: z.string().max(500).optional(),
  f_observacao: z.string().max(1000).optional(),
});

type CadastroFormValues = z.infer<typeof formSchema>;

interface CadastroAnimalFormProps {
  initialData?: CadastroAnimal | null;
  animais: Animal[]; // List of species
  defaultAnimalId?: string;
}

export function CadastroAnimalForm({ initialData, animais, defaultAnimalId }: CadastroAnimalFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<CadastroFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
        ...initialData,
        f_entrada: initialData.f_entrada ? new Date(initialData.f_entrada) : undefined,
        f_saida: initialData.f_saida ? new Date(initialData.f_saida) : undefined,
    } : {
      f_animalId: defaultAnimalId || "",
      f_apelido: "",
      f_registro: "",
      f_procedencia: "",
      f_entrada: undefined,
      f_sexo: undefined,
      f_idade: "",
      f_sinais: "",
      f_marcacaotipo: undefined,
      f_marcacaonumero: "",
      f_saida: undefined,
      f_motivosaida: "",
      f_observacao: "",
    },
  });

  async function onSubmit(values: CadastroFormValues) {
    const formData = new FormData();
    
    Object.entries(values).forEach(([key, value]) => {
      if (value instanceof Date) {
        formData.append(key, format(value, "yyyy-MM-dd"));
      } else if (value !== undefined && value !== null && value !== "") {
        formData.append(key, String(value));
      }
    });

    const result = await addCadastro(formData);

    if (result.success) {
      toast({
        title: "Sucesso!",
        description: result.message,
      });
      router.push("/cadastros");
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
    <Card className="max-w-3xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>{initialData ? "Editar Cadastro Individual" : "Novo Cadastro Individual"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="f_animalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Espécie do Animal</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a espécie" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {animais.map((animal) => (
                        <SelectItem key={animal.id} value={animal.id}>
                          {animal.f_nome} ({animal.f_nomecientifico})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="f_apelido" render={({ field }) => ( <FormItem> <FormLabel>Apelido</FormLabel> <FormControl><Input placeholder="Ex: Rex" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="f_registro" render={({ field }) => ( <FormItem> <FormLabel>Nº de Registro</FormLabel> <FormControl><Input placeholder="Ex: BICA-001" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="f_procedencia" render={({ field }) => ( <FormItem> <FormLabel>Procedência</FormLabel> <FormControl><Input placeholder="Ex: Resgate IBAMA" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="f_idade" render={({ field }) => ( <FormItem> <FormLabel>Idade</FormLabel> <FormControl><Input placeholder="Ex: 5 anos / Filhote" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <FormField
                control={form.control}
                name="f_entrada"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Entrada</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              <span>Escolha uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="f_sexo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sexo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Selecione o sexo" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sexosAnimais.map(sexo => <SelectItem key={sexo} value={sexo}>{sexo}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField control={form.control} name="f_sinais" render={({ field }) => ( <FormItem> <FormLabel>Sinais Particulares</FormLabel> <FormControl><Textarea placeholder="Descreva quaisquer sinais distintivos do animal..." {...field} /></FormControl> <FormMessage /> </FormItem> )} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="f_marcacaotipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Marcação</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Selecione o tipo de marcação" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {marcacaoTiposAnimais.map(tipo => <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="f_marcacaonumero" render={({ field }) => ( <FormItem> <FormLabel>Nº da Marcação</FormLabel> <FormControl><Input placeholder="Número do microchip, anilha, etc." {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="f_saida"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Saída (Opcional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "PPP", { locale: ptBR }) : (<span>Escolha uma data</span>)}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} locale={ptBR} />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="f_motivosaida" render={({ field }) => ( <FormItem> <FormLabel>Motivo da Saída (Opcional)</FormLabel> <FormControl><Input placeholder="Ex: Óbito, Transferência" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
            </div>
            
            <FormField control={form.control} name="f_observacao" render={({ field }) => ( <FormItem> <FormLabel>Observações (Opcional)</FormLabel> <FormControl><Textarea placeholder="Informações adicionais relevantes..." {...field} rows={4} /></FormControl> <FormMessage /> </FormItem> )} />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <SubmitButton>
                {initialData ? "Salvar Alterações" : "Adicionar Cadastro"}
              </SubmitButton>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
