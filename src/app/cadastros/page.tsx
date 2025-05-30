
import { PageHeader } from "@/components/PageHeader";
import { getCadastros, deleteCadastro } from "@/lib/actions/cadastroActions";
import type { CadastroAnimal } from "@/types";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, Edit, Trash2, PawPrint } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DeleteConfirmationButton } from "@/components/DeleteConfirmationButton";

export default async function CadastrosPage() {
  const cadastros = await getCadastros();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <PageHeader
        title="Cadastros Individuais"
        description="Navegue e gerencie os animais individuais do plantel."
        actionButton={{ href: "/cadastros/novo", label: "Novo Cadastro" }}
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Lista de Cadastros</CardTitle>
        </CardHeader>
        <CardContent>
          {cadastros.length > 0 ? (
            <Table>
              <TableCaption>Uma lista dos animais individuais registrados.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Identificação</TableHead>
                  <TableHead>Espécie</TableHead>
                  <TableHead>Data de Entrada</TableHead>
                  <TableHead>Sexo</TableHead>
                  <TableHead>Marcação</TableHead>
                  <TableHead>Origem Tráfico</TableHead>
                  <TableHead className="text-right w-[180px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cadastros.map((cadastro) => (
                  <TableRow key={cadastro.id}>
                    <TableCell className="font-medium">
                      {cadastro.f_apelido || `Registro #${cadastro.f_registro}` || `Animal #${cadastro.id}`}
                    </TableCell>
                    <TableCell>
                        <Link href={`/animais/${cadastro.f_animalId}`} className="hover:underline" title={`Ver espécie ${cadastro.f_animalNome}`}>
                            {cadastro.f_animalNome}
                        </Link>
                    </TableCell>
                    <TableCell>
                      {cadastro.f_entrada ? format(parseISO(cadastro.f_entrada), "dd/MM/yyyy", { locale: ptBR }) : "N/A"}
                    </TableCell>
                    <TableCell>
                      {cadastro.f_sexo ? <Badge variant={cadastro.f_sexo === 'Macho' ? 'default' : cadastro.f_sexo === 'Femea' ? 'destructive' : 'secondary'} className="capitalize">{cadastro.f_sexo}</Badge> : "N/A"}
                    </TableCell>
                    <TableCell>
                      {cadastro.f_marcacaotipo ? `${cadastro.f_marcacaotipo}${cadastro.f_marcacaonumero ? ` (${cadastro.f_marcacaonumero})` : ''}` : "N/A"}
                    </TableCell>
                    <TableCell>
                      {cadastro.f_origem_trafico ? <Badge variant="destructive">Sim</Badge> : <Badge variant="outline">Não</Badge>}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" asChild title="Visualizar">
                        <Link href={`/cadastros/${cadastro.id}`}><Eye className="h-4 w-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild title="Editar">
                        <Link href={`/cadastros/${cadastro.id}/editar`}><Edit className="h-4 w-4" /></Link>
                      </Button>
                      <DeleteConfirmationButton
                        itemId={cadastro.id}
                        itemName={cadastro.f_apelido || `Registro ${cadastro.f_registro}` || `Animal ${cadastro.id}`}
                        itemType="Cadastro Individual"
                        deleteAction={deleteCadastro}
                        triggerButtonProps={{variant: "ghost", size: "icon", title: "Excluir"}}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              <PawPrint className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum cadastro individual encontrado.</h3>
              <p>Comece registrando um animal.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
