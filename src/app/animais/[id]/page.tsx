
import { getAnimalById } from "@/lib/actions/animalActions";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function AnimalDetailPage({ params }: { params: { id: string } }) {
  const animal = await getAnimalById(params.id);

  if (!animal) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center">
        <PageHeader title="Animal não encontrado" description="O animal que você está procurando não existe." />
        <Button asChild>
          <Link href="/animais">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Animais (Espécies)
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/animais">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Animais (Espécies)
          </Link>
        </Button>
      </div>
      
      <Card className="overflow-hidden shadow-xl">
        {animal.f_imagem && (
          <div className="relative w-full h-64 md:h-96 bg-muted">
            <Image
              src={animal.f_imagem}
              alt={`${animal.f_nome} - ${animal.f_nomecientifico}`}
              layout="fill"
              objectFit="contain" 
              data-ai-hint={ (animal as any)['data-ai-hint'] || animal.f_nome.toLowerCase().split(" ").slice(0,2).join(" ") }
            />
          </div>
        )}
        <CardHeader className="pt-6">
          <CardTitle className="text-4xl font-extrabold text-primary">{animal.f_nome}</CardTitle>
          <CardDescription className="text-2xl italic text-muted-foreground">{animal.f_nomecientifico}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-secondary/30">
              <h4 className="font-semibold text-primary">Classe (IUCN)</h4>
              <p>{animal.f_iucn_className || "N/A"}</p>
            </div>
            <div className="p-4 border rounded-lg bg-secondary/30">
              <h4 className="font-semibold text-primary">Ordem (IUCN)</h4>
              <p>{animal.f_iucn_orderName || "N/A"}</p>
            </div>
            <div className="p-4 border rounded-lg bg-secondary/30">
              <h4 className="font-semibold text-primary">Família (IUCN)</h4>
              <p>{animal.f_iucn_familyName || "N/A"}</p>
            </div>
          </div>

          {animal.f_iucn_kingdomName && (
            <div className="p-4 border rounded-lg bg-secondary/30 mt-4">
              <h4 className="font-semibold text-primary">Reino (IUCN)</h4>
              <p>{animal.f_iucn_kingdomName}</p>
              {animal.f_iucn_phylumName && <p className="text-sm text-muted-foreground">Filo: {animal.f_iucn_phylumName}</p>}
            </div>
          )}

          {animal.f_status_conservacao && (
            <div>
              <h3 className="text-xl font-semibold">Status de Conservação (IUCN)</h3>
              <Badge variant={animal.f_status_conservacao === "CR" || animal.f_status_conservacao === "EN" || animal.f_status_conservacao === "VU" ? "destructive" : "secondary"}>
                {animal.f_status_conservacao}
              </Badge>
            </div>
          )}

          {animal.f_nomes_alternativos && (
            <div>
              <h3 className="text-xl font-semibold">Outros Nomes Locais</h3>
              <p className="text-muted-foreground">{animal.f_nomes_alternativos}</p>
            </div>
          )}
          {animal.f_iucn_commonNames && (
            <div>
              <h3 className="text-xl font-semibold">Nomes Comuns (IUCN)</h3>
              <p className="text-muted-foreground">{animal.f_iucn_commonNames}</p>
            </div>
          )}
           <div>
             <Badge variant="secondary">ID da Espécie: {animal.id}</Badge>
           </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Button variant="outline" asChild>
            <Link href={`/animais/${animal.id}/editar`}>
              <Edit className="mr-2 h-4 w-4" /> Editar Espécie
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/cadastros/novo?animalId=${animal.id}&animalNome=${encodeURIComponent(animal.f_nome)}`}>
              Registrar Indivíduo desta Espécie
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
