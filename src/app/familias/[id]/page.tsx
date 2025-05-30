
import { getFamiliaById, deleteFamilia } from "@/lib/actions/familiaActions";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmationButton } from "@/components/DeleteConfirmationButton";
import { redirect } from 'next/navigation';

export default async function FamiliaDetailPage({ params }: { params: { id: string } }) {
  const familia = await getFamiliaById(params.id);

  if (!familia) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center">
        <PageHeader title="Família não encontrada" description="A família que você está procurando não existe." />
        <Button asChild>
          <Link href="/familias">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Famílias
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-6 flex justify-between items-center">
        <Button variant="outline" asChild>
          <Link href="/familias">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Famílias
          </Link>
        </Button>
        <div className="space-x-2">
            <Button variant="outline" asChild>
                <Link href={`/familias/${familia.id}/editar`}>
                    <Edit className="mr-2 h-4 w-4" /> Editar Família
                </Link>
            </Button>
            <DeleteConfirmationButton
                itemId={familia.id}
                itemName={familia.f_nome}
                itemType="Família"
                deleteAction={deleteFamilia}
                onSuccess={() => redirect('/familias')}
                triggerButtonProps={{variant: "destructive"}}
                triggerIcon={<><Trash2 className="mr-2 h-4 w-4" /> Excluir Família</>}
            />
        </div>
      </div>
      
      <Card className="overflow-hidden shadow-xl">
        {familia.f_hero && (
          <div className="relative w-full h-64 md:h-96 bg-muted">
            <Image
              src={familia.f_hero}
              alt={`${familia.f_nome} Hero Image`}
              layout="fill"
              objectFit="cover"
              data-ai-hint={ (familia as any)['data-ai-hint-hero'] || "ecosystem wildlife" }
            />
          </div>
        )}
        <CardHeader className="pt-6">
          <CardTitle className="text-4xl font-extrabold text-primary">{familia.f_nome}</CardTitle>
          {familia.f_ordemNome && <Badge variant="secondary" className="my-2">Ordem: {familia.f_ordemNome}</Badge>}
          <CardDescription className="text-lg">{familia.f_descricao || "Nenhuma descrição fornecida."}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {familia.f_imagem && (
            <div>
              <h3 className="text-xl font-semibold mb-2">Imagem Representativa</h3>
              <Image
                src={familia.f_imagem}
                alt={familia.f_nome}
                width={300}
                height={200}
                className="rounded-lg shadow-md border"
                data-ai-hint={ (familia as any)['data-ai-hint'] || familia.f_nome.toLowerCase().split(" ")[0] }
              />
            </div>
          )}
           <div>
             <Badge variant="secondary">ID: {familia.id}</Badge>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
