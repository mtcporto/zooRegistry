
import { getClassById } from "@/lib/actions/classeActions";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function ClasseDetailPage({ params }: { params: { id: string } }) {
  const classe = await getClassById(params.id);

  if (!classe) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center">
        <PageHeader title="Classe não encontrada" description="A classe que você está procurando não existe." />
        <Button asChild>
          <Link href="/classes">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Classes
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/classes">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Classes
          </Link>
        </Button>
      </div>
      
      <Card className="overflow-hidden shadow-xl">
        {classe.f_hero && (
          <div className="relative w-full h-64 md:h-96">
            <Image
              src={classe.f_hero}
              alt={`${classe.f_nome} Hero Image`}
              layout="fill"
              objectFit="cover"
              data-ai-hint={ (classe as any)['data-ai-hint-hero'] || "nature scenic" }
            />
          </div>
        )}
        <CardHeader className="pt-6">
          <CardTitle className="text-4xl font-extrabold text-primary">{classe.f_nome}</CardTitle>
          <CardDescription className="text-lg">{classe.f_descricao || "Nenhuma descrição fornecida."}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {classe.f_imagem && (
            <div>
              <h3 className="text-xl font-semibold mb-2">Imagem Representativa</h3>
              <Image
                src={classe.f_imagem}
                alt={classe.f_nome}
                width={300}
                height={200}
                className="rounded-lg shadow-md border"
                data-ai-hint={ (classe as any)['data-ai-hint'] || classe.f_nome.toLowerCase().split(" ")[0] }
              />
            </div>
          )}
           <div>
             <Badge variant="secondary">ID: {classe.id}</Badge>
           </div>
        </CardContent>
        <CardFooter>
           {/* Placeholder for edit button */}
          <Button variant="outline" disabled>Editar Classe (Em breve)</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
