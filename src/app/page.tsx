
import { PageHeader } from "@/components/PageHeader";
import { getAnimais } from "@/lib/actions/animalActions";
import type { Animal } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Eye, Squirrel } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function HomePage() {
  const animais = await getAnimais();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <PageHeader
        title="Visão Geral do Plantel"
        description="Navegue pelas espécies de animais cadastradas no sistema."
      />
      {animais.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {animais.map((animal) => {
            const imageUrl = animal.f_imagem || `https://placehold.co/400x300.png?text=${encodeURIComponent(animal.f_nome || 'Animal')}`;
            const imageHint = (animal as any)['data-ai-hint'] || (animal.f_nome || 'animal').toLowerCase().split(" ").slice(0,2).join(" ");

            return (
              <Card key={animal.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="relative w-full h-48 bg-muted">
                  <Image
                    src={imageUrl}
                    alt={animal.f_nome}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                    data-ai-hint={imageHint}
                  />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-semibold text-primary">{animal.f_nome}</CardTitle>
                  <CardDescription className="italic">{animal.f_nomecientifico}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-1 text-sm">
                  <div><Badge variant="outline">Classe:</Badge> {animal.f_iucn_className || "N/A"}</div>
                  <div><Badge variant="outline">Ordem:</Badge> {animal.f_iucn_orderName || "N/A"}</div>
                  <div><Badge variant="outline">Família:</Badge> {animal.f_iucn_familyName || "N/A"}</div>
                  {animal.f_status_conservacao && (
                    <div>
                      <Badge variant={animal.f_status_conservacao === "CR" || animal.f_status_conservacao === "EN" || animal.f_status_conservacao === "VU" ? "destructive" : "secondary"}>
                        Status IUCN:
                      </Badge> {animal.f_status_conservacao}
                    </div>
                  )}
                  {animal.f_nomes_alternativos && (
                    <div className="text-xs text-muted-foreground pt-1">
                      Nomes Locais: {animal.f_nomes_alternativos}
                    </div>
                  )}
                  {animal.f_iucn_commonNames && (
                    <div className="text-xs text-muted-foreground pt-1">
                      Nomes Comuns (IUCN): {animal.f_iucn_commonNames}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-end gap-2">
                  <Button variant="outline" size="sm" asChild title="Ver Detalhes da Espécie">
                    <Link href={`/animais/${animal.id}`}><Eye className="mr-1 h-4 w-4" /> Ver Detalhes</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="shadow-lg">
          <CardContent className="text-center text-muted-foreground py-12">
            <Squirrel className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma espécie animal registrada ainda.</h3>
            <p>Utilize a seção "Animais (Espécies)" no menu lateral para adicionar uma nova espécie.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
