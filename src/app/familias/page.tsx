
import { PageHeader } from "@/components/PageHeader";
import { getFamilias } from "@/lib/actions/familiaActions";
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

export default async function FamiliasPage() {
  const familias = await getFamilias();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <PageHeader
        title="Famílias de Animais"
        description="Navegue e gerencie as famílias de animais registradas."
        actionButton={{ href: "/familias/novo", label: "Nova Família" }}
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Lista de Famílias</CardTitle>
        </CardHeader>
        <CardContent>
          {familias.length > 0 ? (
            <Table>
              <TableCaption>Uma lista das famílias de animais registradas.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Imagem</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Ordem</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right w-[150px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {familias.map((familia) => (
                  <TableRow key={familia.id}>
                    <TableCell>
                      <Image
                        src={familia.f_imagem || "https://placehold.co/100x60.png?text=Sem+Imagem"}
                        alt={familia.f_nome}
                        width={100}
                        height={60}
                        className="rounded object-cover"
                        data-ai-hint={ (familia as any)['data-ai-hint'] || familia.f_nome.toLowerCase().split(" ")[0] }
                      />
                    </TableCell>
                    <TableCell className="font-medium">{familia.f_nome}</TableCell>
                    <TableCell>{familia.f_ordemNome || "N/A"}</TableCell>
                    <TableCell className="max-w-xs truncate">{familia.f_descricao || "N/A"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild title="Visualizar">
                        <Link href={`/familias/${familia.id}`}><Eye className="h-4 w-4" /></Link>
                      </Button>
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
            <p className="text-center text-muted-foreground py-8">Nenhuma família registrada ainda.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
