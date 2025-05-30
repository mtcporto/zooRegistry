
import { OrdemForm } from "@/components/forms/OrdemForm";
import { PageHeader } from "@/components/PageHeader";
import { getClasses } from "@/lib/actions/classeActions";

export default async function NovaOrdemPage() {
  const classes = await getClasses();
  return (
    <div className="container mx-auto p-4 md:p-8">
      <PageHeader
        title="Registrar Nova Ordem"
        description="Preencha os dados abaixo para adicionar uma nova ordem de animais."
      />
      <OrdemForm classes={classes} />
    </div>
  );
}
