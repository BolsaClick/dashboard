import { zodResolver } from '@hookform/resolvers/zod';
import { Search, X } from 'lucide-react';
import {  useForm } from 'react-hook-form';
import { z } from 'zod';


import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';


const orderFiltersSchema = z.object({
  email: z.string().optional(),
  name: z.string().optional(),
});

type OrderFiltersSchema = z.infer<typeof orderFiltersSchema>;

interface TableFiltersProps {
  onFilterChange: (filters: Partial<OrderFiltersSchema>) => void;
}

export function FilterStudent({ onFilterChange }: TableFiltersProps) {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const name = searchParams.get('name') || '';


  const { register, handleSubmit, control, reset } = useForm<OrderFiltersSchema>({
    resolver: zodResolver(orderFiltersSchema),
    defaultValues: {
      email,
      name,
 
    },
  });

 
  useEffect(() => {
    reset({ email, name });
  }, [email, name, reset]);

 
  function setSearchParams(callback: (state: URLSearchParams) => URLSearchParams) {
    const params = new URLSearchParams(window.location.search);
    const newParams = callback(params);
    window.history.replaceState({}, '', `${window.location.pathname}?${newParams}`);
  }

  function handleFilter({ email, name }: OrderFiltersSchema) {
    onFilterChange({ email, name });
    setSearchParams((state) => {
      email && email ? state.set('email', email) : state.delete('email');
      email && name ? state.set('name', name) : state.delete('name');
    
      state.set('page', '1'); 
      return state;
    });
  }

  function handleClearFilter() {
    onFilterChange({ email: '', name: '' }); 
    setSearchParams((state) => {
      state.delete('email');
      state.delete('name');
    
      state.set('page', '1'); 
      return state;
    });

    reset({
      email: '',
      name: '',
    
    });
  }

  return (
    <form onSubmit={handleSubmit(handleFilter)} className="flex items-center gap-2">
      <span className="text-sm font-semibold">Filtros:</span>

      <Input
        placeholder="Email"
        className="h-8 w-auto"
        {...register('email')}
      />
      <Input
        placeholder="Nome"
        className="h-8 w-[320px]"
        {...register('name')}
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
