
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Rows, Binary, ShieldHalf, Squirrel, Info, PlusCircle } from "lucide-react";
import Link from "next/link";

const quickLinks = [
  { href: "/classes/novo", label: "Nova Classe", icon: Rows },
  { href: "/ordens/novo", label: "Nova Ordem", icon: Binary },
  { href: "/familias/novo", label: "Nova Família", icon: ShieldHalf },
  { href: "/animais/novo", label: "Novo Animal", icon: Squirrel },
  { href: "/cadastros/novo", label: "Novo Cadastro", icon: Info },
];

export default function DashboardPage() {
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
            Abaixo, você encontra alguns atalhos rápidos para adicionar novos registros.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickLinks.map((link) => (
          <Card key={link.href} className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center text-accent mb-2">
                <link.icon className="h-8 w-8 mr-3" />
                <CardTitle className="text-xl">{link.label}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Clique aqui para adicionar um novo registro de {link.label.split(" ")[1].toLowerCase()}.
              </p>
              <Link href={link.href} passHref>
                <Button className="w-full" variant="default">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Adicionar
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
