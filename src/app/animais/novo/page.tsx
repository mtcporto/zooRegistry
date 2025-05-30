
import { AnimalForm } from "@/components/forms/AnimalForm";
import { PageHeader } from "@/components/PageHeader";
// Remoção de imports de getClasses, getOrdens, getFamilias

export default async function NovoAnimalPage() {
  // Não precisa mais buscar classes, ordens, familias
  return (
    <div className="container mx-auto p-4 md:p-8">
      <PageHeader
        title="Registrar Nova Espécie Animal"
        description="Preencha os dados abaixo para adicionar uma nova espécie. Dados taxonômicos e de conservação serão buscados na IUCN."
      />
      <AnimalForm /> {/* Removido props classes, ordens, familias */}
    </div>
  );
}
