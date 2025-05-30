
import { PageHeader } from "@/components/PageHeader";
import { getAnimais, deleteAnimal } from "@/lib/actions/animalActions";
import type { Animal } from "@/types";
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
import Image from "next/image";
import { Eye, Edit, Trash2, Squirrel } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmationButton } from "@/components/DeleteConfirmationButton";

export default async function AnimaisPage() {
  const animais = await getAnimais();

  return (
    <div className="container mx-auto p-4 md:p-8">
      <PageHeader
        title="Animais (Espécies)"
        description="Navegue e gerencie as espécies de animais registradas."
        actionButton={{ href: "/animais/novo", label: "Nova Espécie" }}
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Lista de Espécies</CardTitle>
        </CardHeader>
        <CardContent>
          {animais.length > 0 ? (
            <Table>
              <TableCaption>Uma lista das espécies de animais registradas.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Imagem</TableHead>
                  <TableHead>Nome Vulgar</TableHead>
                  <TableHead>Nome Científico</TableHead>
                  <TableHead>Classe (IUCN)</TableHead>
                  <TableHead>Ordem (IUCN)</TableHead>
                  <TableHead>Família (IUCN)</TableHead>
                  <TableHead>Status IUCN</TableHead>
                  <TableHead className="text-right w-[180px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {animais.map((animal) => (
                  <TableRow key={animal.id}>
                    <TableCell>
                      <div className="relative w-[80px] h-[60px] bg-muted rounded">
                        <Image
                          src={animal.f_imagem || "https://placehold.co/100x60.png?text=S/Foto"}
                          alt={animal.f_nome}
                          fill
                          sizes="80px"
                          className="rounded object-contain"
                          data-ai-hint={ (animal as any)['data-ai-hint'] || animal.f_nome.toLowerCase().split(" ").slice(0,2).join(" ") }
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{animal.f_nome}</TableCell>
                    <TableCell className="italic">{animal.f_nomecientifico}</TableCell>
                    <TableCell>{animal.f_iucn_className || "N/A"}</TableCell>
                    <TableCell>{animal.f_iucn_orderName || "N/A"}</TableCell>
                    <TableCell>{animal.f_iucn_familyName || "N/A"}</TableCell>
                    <TableCell>
                      {animal.f_status_conservacao ? (
                        <Badge variant={animal.f_status_conservacao === "CR" || animal.f_status_conservacao === "EN" || animal.f_status_conservacao === "VU" ? "destructive" : "secondary"}>
                          {animal.f_status_conservacao}
                        </Badge>
                      ) : (
                        <Badge variant="outline">N/A</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" asChild title="Visualizar">
                        <Link href={`/animais/${animal.id}`}><Eye className="h-4 w-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild title="Editar">
                        <Link href={`/animais/${animal.id}/editar`}><Edit className="h-4 w-4" /></Link>
                      </Button>
                      <DeleteConfirmationButton
                        itemId={animal.id}
                        itemName={animal.f_nome}
                        itemType="Animal (Espécie)"
                        deleteAction={deleteAnimal}
                        triggerButtonProps={{variant: "ghost", size: "icon", title: "Excluir"}}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-muted-foreground py-12">
              <Squirrel className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma espécie animal registrada ainda.</h3>
              <p>Comece adicionando uma nova espécie.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
