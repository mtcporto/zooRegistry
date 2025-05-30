
import { getClassById } from "@/lib/actions/classeActions";
import { ClasseForm } from "@/components/forms/ClasseForm";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditarClassePage({ params }: { params: { id: string } }) {
  const classe = await getClassById(params.id);

  if (!classe) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center">
        <PageHeader title="Classe não encontrada" description="A classe que você está tentando editar não existe." />
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
      <PageHeader
        title={`Editar Classe: ${classe.f_nome}`}
        description="Modifique os dados da classe abaixo."
      />
      <ClasseForm initialData={classe} />
    </div>
  );
}
