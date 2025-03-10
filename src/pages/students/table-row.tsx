import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatToCPF, formatToPhone } from 'brazilian-values';
import { TableCell, TableRow } from '@/components/ui/table';
import { Icon } from '@/components/Icon';

export interface Student {
  id: string;
  name: string;
  email: string;
  cpf: string;
  document: string;
  birthday: string;
  address: string;
  address_number: string;
  neighborhood: string;
  city: string;
  state: string;
  postal_code: string;
  phone: string;
  whatsapp_optin: boolean;
  high_school_completion_year: string;
  createdAt: string;
}

export interface StudentTableRowProps {
  student: Student | undefined; 
}

export default function StudentTableRow({ student }: StudentTableRowProps) {
  if (!student) {
    return (
      <TableRow>
        <TableCell colSpan={6}>No data available</TableCell>
      </TableRow>
    );
  }

  function formatAddress(student: Student): string {
    const {
      address,
      address_number,
      neighborhood,
      city,
      state,
      postal_code,
    } = student;
    return `${address}, ${address_number} - ${neighborhood}, ${city} - ${state}, CEP: ${postal_code}`;
  }

  return (
    <TableRow>

      <TableCell className="font-medium">{student.name ?? 'N/A'}</TableCell>
      <TableCell className="font-mono text-xs font-medium">{student.email ?? 'N/A'}</TableCell>
      <TableCell className="font-medium">{formatToCPF(student.cpf)}</TableCell>
      <TableCell>{formatAddress(student)}</TableCell>
      <TableCell className="flex items-center">
        {formatToPhone(student.phone)}
        <span className="ml-2">
          {student.whatsapp_optin && <Icon name="WhatsappLogo" size={16} className="text-green-500" />}
        </span>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDistanceToNow(new Date(student.createdAt), { locale: ptBR, addSuffix: true })}
      </TableCell>
    </TableRow>
  );
}
