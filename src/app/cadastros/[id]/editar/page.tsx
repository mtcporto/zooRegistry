
import { getCadastroById } from "@/lib/actions/cadastroActions";
import { getAnimais } from "@/lib/actions/animalActions";
import { CadastroAnimalForm } from "@/components/forms/CadastroAnimalForm";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditarCadastroPage({ params }: { params: { id: string } }) {
  const [cadastro, animais] = await Promise.all([
    getCadastroById(params.id),
    getAnimais() // Fetch all species for the dropdown
  ]);

  if (!cadastro) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center">
        <PageHeader title="Cadastro não encontrado" description="O cadastro individual que você está tentando editar não existe." />
        <Button asChild>
          <Link href="/cadastros">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Cadastros
          </Link>
        </Button>
      </div>
    );
  }
  
  const pageTitle = cadastro.f_apelido || `Registro #${cadastro.f_registro}` || `Animal Individual #${cadastro.id}`;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <PageHeader
        title={`Editar Cadastro: ${pageTitle}`}
        description="Modifique os dados do animal individual abaixo."
      />
      <CadastroAnimalForm initialData={cadastro} animais={animais} />
    </div>
  );
}
