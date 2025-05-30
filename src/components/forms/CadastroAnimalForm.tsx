
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import React from "react"; // Added this import
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";

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
import { addCadastro, updateCadastro } from "@/lib/actions/cadastroActions";
import { SubmitButton } from "./SubmitButton";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

const formSchema = z.object({
  f_animalId: z.string({ required_error: "Selecione a espécie do animal." }),
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

type CadastroFormValues = z.infer<typeof formSchema>;

interface CadastroAnimalFormProps {
  initialData?: CadastroAnimal | null;
  animais: Animal[]; 
  defaultAnimalId?: string;
}

export function CadastroAnimalForm({ initialData, animais, defaultAnimalId }: CadastroAnimalFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [animalSelectOpen, setAnimalSelectOpen] = React.useState(false);

  const form = useForm<CadastroFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
        ...initialData,
        f_apelido: initialData.f_apelido ?? "",
        f_registro: initialData.f_registro ?? "",
        f_procedencia: initialData.f_procedencia ?? "",
        f_entrada: initialData.f_entrada ? parseISO(initialData.f_entrada) : undefined,
        f_sexo: initialData.f_sexo ?? undefined,
        f_idade: initialData.f_idade ?? "",
        f_sinais: initialData.f_sinais ?? "",
        f_marcacaotipo: initialData.f_marcacaotipo ?? undefined,
        f_marcacaonumero: initialData.f_marcacaonumero ?? "",
        f_saida: initialData.f_saida ? parseISO(initialData.f_saida) : undefined,
        f_motivosaida: initialData.f_motivosaida ?? "",
        f_observacao: initialData.f_observacao ?? "",
        f_origem_trafico: initialData.f_origem_trafico ?? false,
        f_informacoes_trafico: initialData.f_informacoes_trafico ?? "",
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
      f_origem_trafico: false,
      f_informacoes_trafico: "",
    },
  });

  async function onSubmit(values: CadastroFormValues) {
    const formData = new FormData();
    
    Object.entries(values).forEach(([key, value]) => {
      if (value instanceof Date) {
        formData.append(key, value.toISOString()); // Send full ISO string
      } else if (value !== undefined && value !== null && value !== "") {
        formData.append(key, String(value));
      }
    });
    
    // Ensure boolean is sent correctly
    formData.set("f_origem_trafico", String(values.f_origem_trafico || false));


    let result;
    if (initialData?.id) {
      result = await updateCadastro(initialData.id, formData);
    } else {
      result = await addCadastro(formData);
    }

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
                <FormItem className="flex flex-col">
                  <FormLabel>Espécie do Animal</FormLabel>
                   <Popover open={animalSelectOpen} onOpenChange={setAnimalSelectOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? animais.find(
                                (animal) => animal.id === field.value
                              )?.f_nome
                            : "Selecione a espécie"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar espécie..." />
                        <CommandList>
                          <CommandEmpty>Nenhuma espécie encontrada.</CommandEmpty>
                          <CommandGroup>
                            {animais.map((animal) => (
                              <CommandItem
                                value={animal.f_nome}
                                key={animal.id}
                                onSelect={() => {
                                  form.setValue("f_animalId", animal.id);
                                  setAnimalSelectOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    animal.id === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {animal.f_nome} ({animal.f_nomecientifico})
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="f_apelido" render={({ field }) => ( <FormItem> <FormLabel>Apelido</FormLabel> <FormControl><Input placeholder="Ex: Rex" {...field} value={field.value ?? ""} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="f_registro" render={({ field }) => ( <FormItem> <FormLabel>Nº de Registro</FormLabel> <FormControl><Input placeholder="Ex: BICA-001" {...field} value={field.value ?? ""} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="f_procedencia" render={({ field }) => ( <FormItem> <FormLabel>Procedência</FormLabel> <FormControl><Input placeholder="Ex: Resgate IBAMA" {...field} value={field.value ?? ""} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="f_idade" render={({ field }) => ( <FormItem> <FormLabel>Idade na Entrada</FormLabel> <FormControl><Input placeholder="Ex: 5 anos / Filhote" {...field} value={field.value ?? ""} /></FormControl> <FormMessage /> </FormItem> )} />
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
                    <Select onValueChange={field.onChange} value={field.value ?? undefined}>
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

            <FormField control={form.control} name="f_sinais" render={({ field }) => ( <FormItem> <FormLabel>Sinais Particulares</FormLabel> <FormControl><Textarea placeholder="Descreva quaisquer sinais distintivos do animal..." {...field} value={field.value ?? ""} /></FormControl> <FormMessage /> </FormItem> )} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="f_marcacaotipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Marcação</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? undefined}>
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
              <FormField control={form.control} name="f_marcacaonumero" render={({ field }) => ( <FormItem> <FormLabel>Nº da Marcação</FormLabel> <FormControl><Input placeholder="Número do microchip, anilha, etc." {...field} value={field.value ?? ""} /></FormControl> <FormMessage /> </FormItem> )} />
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
              <FormField control={form.control} name="f_motivosaida" render={({ field }) => ( <FormItem> <FormLabel>Motivo da Saída (Opcional)</FormLabel> <FormControl><Input placeholder="Ex: Óbito, Transferência" {...field} value={field.value ?? ""} /></FormControl> <FormMessage /> </FormItem> )} />
            </div>

            <FormField
                control={form.control}
                name="f_origem_trafico"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow">
                    <FormControl>
                        <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                        <FormLabel>
                        Origem do Tráfico?
                        </FormLabel>
                        <FormDescription>
                        Marque se o animal tem origem suspeita ou confirmada de tráfico.
                        </FormDescription>
                    </div>
                    </FormItem>
                )}
            />
            <FormField control={form.control} name="f_informacoes_trafico" render={({ field }) => ( <FormItem> <FormLabel>Informações sobre Tráfico (Opcional)</FormLabel> <FormControl><Textarea placeholder="Detalhes sobre o resgate, apreensão, etc." {...field} value={field.value ?? ""} rows={3} /></FormControl> <FormMessage /> </FormItem> )} />
            
            <FormField control={form.control} name="f_observacao" render={({ field }) => ( <FormItem> <FormLabel>Observações (Opcional)</FormLabel> <FormControl><Textarea placeholder="Informações adicionais relevantes..." {...field} value={field.value ?? ""} rows={4} /></FormControl> <FormMessage /> </FormItem> )} />

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
