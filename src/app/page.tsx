
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Rows, Binary, ShieldHalf, Squirrel, Info, PlusCircle, Eye } from "lucide-react";
import Link from "next/link";
import { getClasses } from "@/lib/actions/classeActions";
import { getOrdens } from "@/lib/actions/ordemActions";
import { getFamilias } from "@/lib/actions/familiaActions";
import { getAnimais } from "@/lib/actions/animalActions";
import { getCadastros } from "@/lib/actions/cadastroActions";

interface DashboardItem {
  entityName: string;
  icon: React.ComponentType<{ className?: string }>;
  viewAllUrl: string;
  addNewUrl: string;
  count: number;
  descriptionSingular: string;
  descriptionPlural: string;
}

export default async function DashboardPage() {
  const [
    classes,
    ordens,
    familias,
    animais,
    cadastros
  ] = await Promise.all([
    getClasses(),
    getOrdens(),
    getFamilias(),
    getAnimais(),
    getCadastros()
  ]);

  const dashboardItems: DashboardItem[] = [
    { entityName: "Classes", icon: Rows, viewAllUrl: "/classes", addNewUrl: "/classes/novo", count: classes.length, descriptionSingular: "classe", descriptionPlural: "classes" },
    { entityName: "Ordens", icon: Binary, viewAllUrl: "/ordens", addNewUrl: "/ordens/novo", count: ordens.length, descriptionSingular: "ordem", descriptionPlural: "ordens" },
    { entityName: "Famílias", icon: ShieldHalf, viewAllUrl: "/familias", addNewUrl: "/familias/novo", count: familias.length, descriptionSingular: "família", descriptionPlural: "famílias" },
    { entityName: "Animais (Espécies)", icon: Squirrel, viewAllUrl: "/animais", addNewUrl: "/animais/novo", count: animais.length, descriptionSingular: "animal (espécie)", descriptionPlural: "animais (espécies)" },
    { entityName: "Cadastros Individuais", icon: Info, viewAllUrl: "/cadastros", addNewUrl: "/cadastros/novo", count: cadastros.length, descriptionSingular: "cadastro individual", descriptionPlural: "cadastros individuais" },
  ];

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">Bem-vindo ao Zoo Registry!</CardTitle>
          <CardDescription className="text-lg">
            Sistema de gerenciamento do plantel do Parque Zoobotânico Arruda Câmara.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Utilize o menu lateral para navegar entre as seções de Classes, Ordens, Famílias, Animais e Cadastros Individuais.
            Abaixo, você encontra um resumo e atalhos para cada seção.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardItems.map((item) => (
          <Card key={item.entityName} className="hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <CardHeader>
              <div className="flex items-center text-primary mb-2">
                <item.icon className="h-8 w-8 mr-3" />
                <CardTitle className="text-xl">{item.entityName}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between">
              <p className="text-muted-foreground mb-4">
                {item.count > 0
                  ? `${item.count} ${item.count === 1 ? item.descriptionSingular : item.descriptionPlural} ${item.count === 1 ? 'registrada' : 'registradas'}.`
                  : `Nenhuma ${item.descriptionSingular} registrada.`}
              </p>
              <div className="flex flex-col sm:flex-row gap-2 mt-auto">
                <Link href={item.viewAllUrl} passHref className="flex-1">
                  <Button className="w-full" variant="outline">
                    <Eye className="mr-2 h-5 w-5" />
                    Ver {item.count === 1 && item.entityName.endsWith('s') ? item.entityName.slice(0,-1) : item.entityName.split(" ")[0]}
                  </Button>
                </Link>
                <Link href={item.addNewUrl} passHref className="flex-1">
                  <Button className="w-full" variant="default">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Adicionar
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
