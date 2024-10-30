import { zodResolver } from '@hookform/resolvers/zod';
import { Search, X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';


import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';


const orderFiltersSchema = z.object({
  slug: z.string().optional(),
  name: z.string().optional(),
  status: z.string().optional(),
});

type OrderFiltersSchema = z.infer<typeof orderFiltersSchema>;

interface TableFiltersProps {
  onFilterChange: (filters: Partial<OrderFiltersSchema>) => void;
}

export function TableFilters({ onFilterChange }: TableFiltersProps) {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug') || '';
  const name = searchParams.get('name') || '';
  const status = searchParams.get('status') || 'all';

  const { register, handleSubmit, control, reset } = useForm<OrderFiltersSchema>({
    resolver: zodResolver(orderFiltersSchema),
    defaultValues: {
      slug,
      name,
      status,
    },
  });

 
  useEffect(() => {
    reset({ slug, name, status });
  }, [slug, name, status, reset]);

 
  function setSearchParams(callback: (state: URLSearchParams) => URLSearchParams) {
    const params = new URLSearchParams(window.location.search);
    const newParams = callback(params);
    window.history.replaceState({}, '', `${window.location.pathname}?${newParams}`);
  }

  function handleFilter({ slug, name, status }: OrderFiltersSchema) {
    onFilterChange({ slug, name, status });
    setSearchParams((state) => {
      slug && slug ? state.set('slug', slug) : state.delete('slug');
      slug && name ? state.set('name', name) : state.delete('name');
      status && status !== 'all' ? state.set('status', status) : state.delete('status');
      state.set('page', '1'); 
      return state;
    });
  }

  function handleClearFilter() {
    onFilterChange({ slug: '', name: '', status: 'all' }); 
    setSearchParams((state) => {
      state.delete('slug');
      state.delete('name');
      state.delete('status');
      state.set('page', '1'); 
      return state;
    });

    reset({
      slug: '',
      name: '',
      status: 'all',
    });
  }

  return (
    <form onSubmit={handleSubmit(handleFilter)} className="flex items-center gap-2">
      <span className="text-sm font-semibold">Filtros:</span>

      <Input
        placeholder="Slug"
        className="h-8 w-auto"
        {...register('slug')}
      />
      <Input
        placeholder="Nome"
        className="h-8 w-[320px]"
        {...register('name')}
      />
      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <Select
            defaultValue="all"
            onValueChange={field.onChange}
            value={field.value}
          >
            <SelectTrigger className="h-8 w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="canceled">Cancelado</SelectItem>
              <SelectItem value="processing">Em Preparo</SelectItem>
              <SelectItem value="delivering">Em Entrega</SelectItem>
              <SelectItem value="delivered">Entregue</SelectItem>
            </SelectContent>
          </Select>
        )}
      />

      <Button type="submit" size="xs" >
        <Search className="mr-2 h-4 w-4" />
        Filtrar resultados
      </Button>

      <Button onClick={handleClearFilter} type="button" size="xs" variant="outline">
        <X className="mr-2 h-4 w-4" />
        Remover filtros
      </Button>
    </form>
  );
}
