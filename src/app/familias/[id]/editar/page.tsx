
import { getFamiliaById } from "@/lib/actions/familiaActions";
import { getOrdens } from "@/lib/actions/ordemActions";
import { FamiliaForm } from "@/components/forms/FamiliaForm";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditarFamiliaPage({ params }: { params: { id: string } }) {
  const [familia, ordens] = await Promise.all([
    getFamiliaById(params.id),
    getOrdens()
  ]);

  if (!familia) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center">
        <PageHeader title="Família não encontrada" description="A família que você está tentando editar não existe." />
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
      <PageHeader
        title={`Editar Família: ${familia.f_nome}`}
        description="Modifique os dados da família abaixo."
      />
      <FamiliaForm initialData={familia} ordens={ordens} />
    </div>
  );
}
