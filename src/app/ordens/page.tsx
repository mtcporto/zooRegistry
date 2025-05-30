
import { PageHeader } from "@/components/PageHeader";
import { getOrdens } from "@/lib/actions/ordemActions";
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

export default async function OrdensPage() {
  const ordens = await getOrdens();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <PageHeader
        title="Ordens de Animais"
        description="Navegue e gerencie as ordens de animais registradas."
        actionButton={{ href: "/ordens/novo", label: "Nova Ordem" }}
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Lista de Ordens</CardTitle>
        </CardHeader>
        <CardContent>
          {ordens.length > 0 ? (
            <Table>
              <TableCaption>Uma lista das ordens de animais registradas.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Imagem</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Classe</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right w-[150px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordens.map((ordem) => (
                  <TableRow key={ordem.id}>
                    <TableCell>
                      <Image
                        src={ordem.f_imagem || "https://placehold.co/100x60.png?text=Sem+Imagem"}
                        alt={ordem.f_nome}
                        width={100}
                        height={60}
                        className="rounded object-cover"
                        data-ai-hint={ (ordem as any)['data-ai-hint'] || ordem.f_nome.toLowerCase().split(" ")[0] }
                      />
                    </TableCell>
                    <TableCell className="font-medium">{ordem.f_nome}</TableCell>
                    <TableCell>{ordem.f_classeNome || "N/A"}</TableCell>
                    <TableCell className="max-w-xs truncate">{ordem.f_descricao || "N/A"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild title="Visualizar">
                        <Link href={`/ordens/${ordem.id}`}><Eye className="h-4 w-4" /></Link>
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
            <p className="text-center text-muted-foreground py-8">Nenhuma ordem registrada ainda.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
