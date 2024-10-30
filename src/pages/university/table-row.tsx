import { Search } from 'lucide-react';
import { useState } from 'react';

import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

export interface UniversityTableRowProps {
  university?: {
    id: string;
    name: string;
    slug: string;
    site?: string;
    phone?: string;
    created_at: Date;
    status: 'active' | 'inactive' | 'canceled' | 'pending';
    max_discount?: number;
    partner_id?: string;
    about?: string;
    logo?: string;
  };
}

export default function UniveristyTableRow({ university }: UniversityTableRowProps) {


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-custom-500/70';
      case 'pending':
        return 'bg-yellow-500 shadow-yellow-300';
      case 'canceled':
        return 'bg-red-500 shadow-red-300';
      case 'inactive':
        return 'bg-gray-500 shadow-gray-300';
      default:
        return 'bg-gray-500 shadow-gray-300';
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'pending':
        return 'Pendente';
      case 'canceled':
        return 'Cancelado';
      case 'inactive':
        return 'Inativo';
      default:
        return 'Desconhecido';
    }
  };

  if (!university) return null; 

  return (
    <TableRow>
      <TableCell className="font-mono text-xs font-medium">
        {university.slug ?? 'N/A'}
      </TableCell>
      <TableCell className="font-medium">
        {university.max_discount ? `${university.max_discount}%` : 'N/A'}
      </TableCell>
      <TableCell className="font-medium">{university.name ?? 'N/A'}</TableCell>
      <TableCell>
        <div className="flex items-center">
          <span
            className={`w-3 h-3 rounded-full ${getStatusColor(university.status)}`}
          />
          <span className="ml-2">{translateStatus(university.status)}</span>
        </div>
      </TableCell>
      <TableCell>{university.partner_id ?? 'N/A'}</TableCell>
      <TableCell></TableCell>
    </TableRow>
  );
}
