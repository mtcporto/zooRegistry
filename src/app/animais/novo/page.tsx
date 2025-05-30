
import { AnimalForm } from "@/components/forms/AnimalForm";
import { PageHeader } from "@/components/PageHeader";
import { getClasses } from "@/lib/actions/classeActions";
import { getOrdens } from "@/lib/actions/ordemActions";
import { getFamilias } from "@/lib/actions/familiaActions";

export default async function NovoAnimalPage() {
  const classes = await getClasses();
  const ordens = await getOrdens(); // Fetch all initially
  const familias = await getFamilias(); // Fetch all initially

  return (
    <div className="container mx-auto p-4 md:p-8">
      <PageHeader
        title="Registrar Novo Animal (Espécie)"
        description="Preencha os dados abaixo para adicionar uma nova espécie animal."
      />
      <AnimalForm classes={classes} ordens={ordens} familias={familias} />
    </div>
  );
}
