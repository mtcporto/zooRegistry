
import { CadastroAnimalForm } from "@/components/forms/CadastroAnimalForm";
import { PageHeader } from "@/components/PageHeader";
import { getAnimais } from "@/lib/actions/animalActions"; // Fetch all species

export default async function NovoCadastroPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined }}) {
  const animais = await getAnimais();
  const defaultAnimalId = typeof searchParams?.animalId === 'string' ? searchParams.animalId : undefined;
  const animalNome = typeof searchParams?.animalNome === 'string' ? decodeURIComponent(searchParams.animalNome) : undefined;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <PageHeader
        title={animalNome ? `Novo Cadastro para ${animalNome}` : "Registrar Novo Animal Individualmente"}
        description="Preencha os dados abaixo para adicionar um novo animal ao plantel."
      />
      <CadastroAnimalForm animais={animais} defaultAnimalId={defaultAnimalId} />
    </div>
  );
}
