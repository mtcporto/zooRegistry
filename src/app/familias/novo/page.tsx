
import { FamiliaForm } from "@/components/forms/FamiliaForm";
import { PageHeader } from "@/components/PageHeader";
import { getOrdens } from "@/lib/actions/ordemActions";

export default async function NovaFamiliaPage() {
  const ordens = await getOrdens();
  return (
    <div className="container mx-auto p-4 md:p-8">
      <PageHeader
        title="Registrar Nova Família"
        description="Preencha os dados abaixo para adicionar uma nova família de animais."
      />
      <FamiliaForm ordens={ordens} />
    </div>
  );
}
