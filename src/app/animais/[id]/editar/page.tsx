
import { getAnimalById } from "@/lib/actions/animalActions";
// Remoção de imports de getClasses, getOrdens, getFamilias
import { AnimalForm } from "@/components/forms/AnimalForm";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditarAnimalPage({ params }: { params: { id: string } }) {
  const animal = await getAnimalById(params.id);
  // Não precisa mais de Promise.all para classes, ordens, familias

  if (!animal) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center">
        <PageHeader title="Animal não encontrado" description="O animal que você está tentando editar não existe." />
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
      <PageHeader
        title={`Editar Espécie: ${animal.f_nome}`}
        description="Modifique os dados da espécie abaixo. Dados taxonômicos e de conservação podem ser atualizados pela IUCN se o nome científico mudar."
      />
      <AnimalForm initialData={animal} /> {/* Removido props classes, ordens, familias */}
    </div>
  );
}
