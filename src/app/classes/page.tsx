
import { PageHeader } from "@/components/PageHeader";
import { getClasses, deleteClasse } from "@/lib/actions/classeActions";
import type { Classe } from "@/types";
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
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, Edit, Trash2 } from "lucide-react";
import { DeleteConfirmationButton } from "@/components/DeleteConfirmationButton";
import { Squirrel } from "lucide-react"; // Assuming Squirrel icon exists for empty state

export default async function ClassesPage() {
  const classes = await getClasses();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <PageHeader
        title="Classes de Animais"
        description="Navegue e gerencie as classes de animais registradas."
        actionButton={{ href: "/classes/novo", label: "Nova Classe" }}
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Lista de Classes</CardTitle>
        </CardHeader>
        <CardContent>
          {classes.length > 0 ? (
            <Table>
              <TableCaption>Uma lista das classes de animais registradas.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Imagem</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right w-[180px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((classe) => (
                  <TableRow key={classe.id}>
                    <TableCell>
                      <Image
                        src={classe.f_imagem || "https://placehold.co/100x60.png?text=Sem+Imagem"}
                        alt={classe.f_nome}
                        width={100}
                        height={60}
                        className="rounded object-cover"
                        data-ai-hint={ (classe as any)['data-ai-hint'] || classe.f_nome.toLowerCase().split(" ")[0] }
                      />
                    </TableCell>
                    <TableCell className="font-medium">{classe.f_nome}</TableCell>
                    <TableCell className="max-w-sm truncate">{classe.f_descricao || "N/A"}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" asChild title="Visualizar">
                        <Link href={`/classes/${classe.id}`}><Eye className="h-4 w-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild title="Editar">
                        <Link href={`/classes/${classe.id}/editar`}><Edit className="h-4 w-4" /></Link>
                      </Button>
                      <DeleteConfirmationButton
                        itemId={classe.id}
                        itemName={classe.f_nome}
                        itemType="Classe"
                        deleteAction={deleteClasse}
                        triggerButtonProps={{variant: "ghost", size: "icon", title: "Excluir"}}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="text-center text-muted-foreground py-12">
                <Squirrel className="mx-auto h-12 w-12 text-gray-400 mb-4" /> {/* Using Squirrel as a placeholder */}
                <h3 className="text-xl font-semibold mb-2">Nenhuma classe registrada ainda.</h3>
                <p>Comece adicionando uma nova classe.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
