
import { getAnimalById } from "@/lib/actions/animalActions";
import { getClasses } from "@/lib/actions/classeActions";
import { getOrdens } from "@/lib/actions/ordemActions";
import { getFamilias } from "@/lib/actions/familiaActions";
import { AnimalForm } from "@/components/forms/AnimalForm";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditarAnimalPage({ params }: { params: { id: string } }) {
  const [animal, classes, ordens, familias] = await Promise.all([
    getAnimalById(params.id),
    getClasses(),
    getOrdens(),
    getFamilias()
  ]);

  if (!animal) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center">
        <PageHeader title="Animal não encontrado" description="O animal que você está tentando editar não existe." />
        <Button asChild>
          <Link href="/animais">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Animais
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <PageHeader
        title={`Editar Animal: ${animal.f_nome}`}
        description="Modifique os dados da espécie abaixo."
      />
      <AnimalForm initialData={animal} classes={classes} ordens={ordens} familias={familias} />
    </div>
  );
}
