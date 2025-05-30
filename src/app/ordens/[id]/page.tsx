
import { getOrdemById } from "@/lib/actions/ordemActions";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function OrdemDetailPage({ params }: { params: { id: string } }) {
  const ordem = await getOrdemById(params.id);

  if (!ordem) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center">
        <PageHeader title="Ordem não encontrada" description="A ordem que você está procurando não existe." />
        <Button asChild>
          <Link href="/ordens">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Ordens
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/ordens">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Ordens
          </Link>
        </Button>
      </div>
      
      <Card className="overflow-hidden shadow-xl">
        {ordem.f_hero && (
          <div className="relative w-full h-64 md:h-96">
            <Image
              src={ordem.f_hero}
              alt={`${ordem.f_nome} Hero Image`}
              layout="fill"
              objectFit="cover"
              data-ai-hint={ (ordem as any)['data-ai-hint-hero'] || "wildlife environment" }
            />
          </div>
        )}
        <CardHeader className="pt-6">
          <CardTitle className="text-4xl font-extrabold text-primary">{ordem.f_nome}</CardTitle>
          {ordem.f_classeNome && <Badge variant="secondary" className="my-2">Classe: {ordem.f_classeNome}</Badge>}
          <CardDescription className="text-lg">{ordem.f_descricao || "Nenhuma descrição fornecida."}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {ordem.f_imagem && (
            <div>
              <h3 className="text-xl font-semibold mb-2">Imagem Representativa</h3>
              <Image
                src={ordem.f_imagem}
                alt={ordem.f_nome}
                width={300}
                height={200}
                className="rounded-lg shadow-md border"
                data-ai-hint={ (ordem as any)['data-ai-hint'] || ordem.f_nome.toLowerCase().split(" ")[0] }
              />
            </div>
          )}
           <div>
             <Badge variant="secondary">ID: {ordem.id}</Badge>
           </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" disabled>Editar Ordem (Em breve)</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
