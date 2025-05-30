
import { PageHeader } from "@/components/PageHeader";
import { getCadastros } from "@/lib/actions/cadastroActions";
import type { CadastroAnimal } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, Edit, Trash2, PawPrint } from "lucide-react"; // PawPrint as general animal icon
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function CadastrosPage() {
  const cadastros = await getCadastros();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <PageHeader
        title="Cadastros Individuais"
        description="Navegue e gerencie os animais individuais do plantel."
        actionButton={{ href: "/cadastros/novo", label: "Novo Cadastro" }}
      />
      {cadastros.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cadastros.map((cadastro) => (
            <Card key={cadastro.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-2 bg-primary/10">
                <div className="flex items-center justify-between">
                   <CardTitle className="text-xl font-semibold text-primary">
                    {cadastro.f_apelido || `Registro #${cadastro.f_registro}` || `Animal #${cadastro.id}`}
                   </CardTitle>
                   {cadastro.f_sexo && <Badge variant={cadastro.f_sexo === 'Macho' ? 'default' : cadastro.f_sexo === 'Femea' ? 'destructive' : 'secondary'} className="capitalize">{cadastro.f_sexo}</Badge>}
                </div>
                <CardDescription className="italic">{cadastro.f_animalNome}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-1 text-sm pt-4">
                {cadastro.f_registro && <p><Badge variant="outline">Registro:</Badge> {cadastro.f_registro}</p>}
                {cadastro.f_entrada && <p><Badge variant="outline">Entrada:</Badge> {format(parseISO(cadastro.f_entrada), "dd/MM/yyyy", { locale: ptBR })}</p>}
                {cadastro.f_idade && <p><Badge variant="outline">Idade:</Badge> {cadastro.f_idade}</p>}
                {cadastro.f_marcacaotipo && <p><Badge variant="outline">Marcação:</Badge> {cadastro.f_marcacaotipo} {cadastro.f_marcacaonumero && `(${cadastro.f_marcacaonumero})`}</p>}
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-end gap-2">
                <Button variant="ghost" size="sm" asChild title="Visualizar">
                  <Link href={`/cadastros/${cadastro.id}`}><Eye className="mr-1 h-4 w-4" /> Ver Detalhes</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
         <Card className="shadow-lg">
          <CardContent className="text-center text-muted-foreground py-12">
            <PawPrint className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhum cadastro individual encontrado.</h3>
            <p>Comece registrando um animal.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
