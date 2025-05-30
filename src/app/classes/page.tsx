
import { PageHeader } from "@/components/PageHeader";
import { getClasses } from "@/lib/actions/classeActions";
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
import { Eye, Edit, Trash2 } from "lucide-react"; // Placeholder for future actions

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
                  <TableHead className="text-right w-[150px]">Ações</TableHead>
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
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild title="Visualizar">
                        <Link href={`/classes/${classe.id}`}><Eye className="h-4 w-4" /></Link>
                      </Button>
                       {/* Placeholder for Edit/Delete actions */}
                      <Button variant="ghost" size="icon" disabled title="Editar (Em breve)">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" disabled title="Excluir (Em breve)" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">Nenhuma classe registrada ainda.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
