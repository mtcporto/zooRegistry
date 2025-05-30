
import { PageHeader } from "@/components/PageHeader";
import { getAnimais, deleteAnimal } from "@/lib/actions/animalActions"; 
import type { Animal } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Eye, Edit, Trash2, Squirrel } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmationButton } from "@/components/DeleteConfirmationButton";

export default async function AnimaisPage() {
  const animais = await getAnimais();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <PageHeader
        title="Animais (Espécies)"
        description="Navegue e gerencie as espécies de animais registradas."
        actionButton={{ href: "/animais/novo", label: "Novo Animal" }}
      />
      {animais.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {animais.map((animal) => (
            <Card key={animal.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="relative w-full h-48">
                <Image
                  src={animal.f_imagem || "https://placehold.co/400x300.png?text=Sem+Imagem"}
                  alt={animal.f_nome}
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint={ (animal as any)['data-ai-hint'] || animal.f_nome.toLowerCase().split(" ").slice(0,2).join(" ") }
                />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl font-semibold text-primary">{animal.f_nome}</CardTitle>
                <CardDescription className="italic">{animal.f_nomecientifico}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-1 text-sm">
                <p><Badge variant="outline">Classe:</Badge> {animal.f_classeNome}</p>
                <p><Badge variant="outline">Ordem:</Badge> {animal.f_ordemNome}</p>
                <p><Badge variant="outline">Família:</Badge> {animal.f_familiaNome}</p>
                {animal.f_status_conservacao && <p><Badge variant={animal.f_status_conservacao.includes("Ameaçado") || animal.f_status_conservacao.includes("Perigo") ? "destructive" : "secondary"}>Status:</Badge> {animal.f_status_conservacao}</p>}
                {animal.f_nomes_alternativos && (
                  <p className="text-xs text-muted-foreground pt-1">
                    Também conhecido como: {animal.f_nomes_alternativos}
                  </p>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-end gap-2">
                <Button variant="ghost" size="sm" asChild title="Visualizar">
                  <Link href={`/animais/${animal.id}`}><Eye className="mr-1 h-4 w-4" /> Ver</Link>
                </Button>
                <Button variant="ghost" size="sm" asChild title="Editar">
                  <Link href={`/animais/${animal.id}/editar`}><Edit className="mr-1 h-4 w-4" /> Editar</Link>
                </Button>
                 <DeleteConfirmationButton
                    itemId={animal.id}
                    itemName={animal.f_nome}
                    itemType="Animal (Espécie)"
                    deleteAction={deleteAnimal} 
                    triggerButtonProps={{variant: "ghost", size: "sm", title: "Excluir"}}
                    triggerIcon={<><Trash2 className="mr-1 h-4 w-4" /> Excluir</>}
                  />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-lg">
          <CardContent className="text-center text-muted-foreground py-12">
            <Squirrel className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum animal registrado ainda.</h3>
            <p>Comece adicionando uma nova espécie.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
