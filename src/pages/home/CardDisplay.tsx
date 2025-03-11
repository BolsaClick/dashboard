import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton"; // Importe o Skeleton do ShadcnUI
import { fetchCommissionData } from '@/api/api'
interface CommissionData {
  _id: string;
  name: string;
  cpf: string;
  candidateInstallments: {
    _id: string;
    installmentNumber: string;
    price: number;
    dateStatus: string;
    dateExpiration: string;
    status: string;
  }[];
}

export const CardDisplay = () => {
  const [data, setData] = useState<CommissionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [analytics, setAnalytics] = useState({
    total: 0,
    waiting: 0,
    totalCpf: 0, 
    idsByCpf: {} as { [cpf: string]: string[] },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await fetchCommissionData();
        setData(result.data.data);
        console.log(result.data, 'aqui resultado');
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      calculateAnalytics();
    }
  }, [data]);

  const calculateAnalytics = () => {
    let total = 0;
    let waiting = 0;
    const idsByCpf: { [cpf: string]: string[] } = {};
    const cpfSet = new Set<string>(); 

    data.forEach(item => {
      item.candidateInstallments.forEach(installment => {
        total += installment.price;

        if (installment.status === 'waiting_for') {
          waiting += installment.price;
        }

        if (!idsByCpf[item.cpf]) {
          idsByCpf[item.cpf] = [];
        }
        idsByCpf[item.cpf].push(installment._id);

        // Adicionando o CPF no Set para garantir que seja único
        cpfSet.add(item.cpf);
      });
    });

    setAnalytics({
      total,
      waiting,
      totalCpf: cpfSet.size, // A quantidade de CPFs únicos
      idsByCpf,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Skeleton para o Valor Total */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            <Skeleton className="w-32 h-6" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-24 h-8" />
          <Skeleton className="w-40 h-6 mt-2" />
        </CardContent>
      </Card>

      {/* Skeleton para o Valor em Espera */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            <Skeleton className="w-32 h-6" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-24 h-8" />
        </CardContent>
      </Card>

      {/* Skeleton para o Total de CPFs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            <Skeleton className="w-32 h-6" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="w-24 h-8" />
        </CardContent>
      </Card>
    </div>
  );

  if (error) return <p>Erro: {error}</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Card Valor Total */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Valor Total</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">R$ {formatPrice(analytics.total)}</p>
          <p className="text-sm text-muted-foreground">
            Valor total de usuários cadastrados.
          </p>
        </CardContent>
      </Card>

      {/* Card Valor em Espera */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Valor em espera da NF</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">R$ {formatPrice(analytics.waiting)}</p>
        </CardContent>
      </Card>

      {/* Card Total de CPFs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Total de CPFs Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{analytics.totalCpf}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CardDisplay;
