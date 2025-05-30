
import { ClasseForm } from "@/components/forms/ClasseForm";
import { PageHeader } from "@/components/PageHeader";

export default function NovaClassePage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <PageHeader
        title="Registrar Nova Classe"
        description="Preencha os dados abaixo para adicionar uma nova classe de animais."
      />
      <ClasseForm />
    </div>
  );
}
