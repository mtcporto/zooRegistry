
import { getOrdemById } from "@/lib/actions/ordemActions";
import { getClasses } from "@/lib/actions/classeActions";
import { OrdemForm } from "@/components/forms/OrdemForm";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditarOrdemPage({ params }: { params: { id: string } }) {
  const [ordem, classes] = await Promise.all([
    getOrdemById(params.id),
    getClasses()
  ]);

  if (!ordem) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center">
        <PageHeader title="Ordem não encontrada" description="A ordem que você está tentando editar não existe." />
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
      <PageHeader
        title={`Editar Ordem: ${ordem.f_nome}`}
        description="Modifique os dados da ordem abaixo."
      />
      <OrdemForm initialData={ordem} classes={classes} />
    </div>
  );
}
