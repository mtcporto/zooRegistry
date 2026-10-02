
import { CadastroAnimalForm } from "@/components/forms/CadastroAnimalForm";
import { PageHeader } from "@/components/PageHeader";
import { getAnimais } from "@/lib/actions/animalActions"; // Fetch all species

export const dynamic = 'force-dynamic';

export default async function NovoCadastroPage({ searchParams }: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }>}) {
  const animais = await getAnimais();
  // Next.js provides search parameters asynchronously.
  const defaultAnimalId = (await searchParams)?.animalId as string | undefined;
  const animalNome = (await searchParams)?.animalNome ? decodeURIComponent((await searchParams)!.animalNome as string) : undefined;

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
