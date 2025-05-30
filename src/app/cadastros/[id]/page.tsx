
import { getCadastroById } from "@/lib/actions/cadastroActions";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

function DetailItem({ label, value, isBoolean }: { label: string; value?: string | null | boolean | undefined; isBoolean?: boolean }) {
  if (value === undefined || value === null || value === '') {
    if (isBoolean && value === false) {
        // continue for false boolean
    } else {
      return null;
    }
  }
  
  let displayValue = String(value);
  if (isBoolean) {
    displayValue = value ? "Sim" : "Não";
  }

  return (
    <div className="py-2 px-3 odd:bg-secondary/30 even:bg-card rounded-md">
      <span className="font-semibold text-primary">{label}: </span>
      <span>{displayValue}</span>
    </div>
  );
}

export default async function CadastroDetailPage({ params }: { params: { id: string } }) {
  const cadastro = await getCadastroById(params.id);

  if (!cadastro) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center">
        <PageHeader title="Cadastro não encontrado" description="O cadastro de animal individual que você está procurando não existe." />
        <Button asChild>
          <Link href="/cadastros">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Cadastros
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/cadastros">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Cadastros
          </Link>
        </Button>
      </div>
      
      <Card className="shadow-xl">
        <CardHeader className="bg-primary/10">
          <CardTitle className="text-3xl font-bold text-primary">
            {cadastro.f_apelido || `Registro #${cadastro.f_registro}` || `Animal Individual #${cadastro.id}`}
          </CardTitle>
          <CardDescription className="text-lg">
            Espécie: <Link href={`/animais/${cadastro.f_animalId}`} className="text-accent hover:underline">{cadastro.f_animalNome}</Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <DetailItem label="Apelido" value={cadastro.f_apelido} />
          <DetailItem label="Nº de Registro" value={cadastro.f_registro} />
          <DetailItem label="Procedência" value={cadastro.f_procedencia} />
          <DetailItem label="Idade na Entrada" value={cadastro.f_idade} />
          <DetailItem label="Data de Entrada" value={cadastro.f_entrada && format(parseISO(cadastro.f_entrada), "dd/MM/yyyy", { locale: ptBR })} />
          <DetailItem label="Sexo" value={cadastro.f_sexo} />
          <DetailItem label="Tipo de Marcação" value={cadastro.f_marcacaotipo} />
          <DetailItem label="Nº da Marcação" value={cadastro.f_marcacaonumero} />
          <DetailItem label="Data de Saída" value={cadastro.f_saida && format(parseISO(cadastro.f_saida), "dd/MM/yyyy", { locale: ptBR })} />
          <DetailItem label="Motivo da Saída" value={cadastro.f_motivosaida} />
          <DetailItem label="Origem do Tráfico" value={cadastro.f_origem_trafico} isBoolean />
          <DetailItem label="Informações sobre Tráfico" value={cadastro.f_informacoes_trafico} />
        </CardContent>
        { (cadastro.f_sinais || cadastro.f_observacao) &&
            <CardContent className="border-t pt-4 mt-4">
                {cadastro.f_sinais && (
                    <div className="mb-4">
                        <h4 className="font-semibold text-lg text-primary mb-1">Sinais Particulares</h4>
                        <p className="text-sm whitespace-pre-wrap bg-secondary/20 p-3 rounded-md">{cadastro.f_sinais}</p>
                    </div>
                )}
                {cadastro.f_observacao && (
                    <div>
                        <h4 className="font-semibold text-lg text-primary mb-1">Observações</h4>
                        <p className="text-sm whitespace-pre-wrap bg-secondary/20 p-3 rounded-md">{cadastro.f_observacao}</p>
                    </div>
                )}
            </CardContent>
        }
        <CardFooter className="border-t mt-4 pt-4">
          <Button variant="outline" asChild>
            <Link href={`/cadastros/${cadastro.id}/editar`}>
                <Edit className="mr-2 h-4 w-4" /> Editar Cadastro
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
