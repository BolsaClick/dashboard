import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { createUniversity } from '@/api/create-univeristy';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Icon } from '@/components/Icon';

interface CreateUniversityProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function CreateUniversity({ open, setOpen }: CreateUniversityProps) {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    try {
      const response = await createUniversity(data);
      console.log('Resposta da API:', response);
      toast.success('Faculdade cadastrada com sucesso!');
      setOpen(false);
    } catch (error) {
      console.error('Erro ao criar a universidade:', error);
      toast.error('Erro ao cadastrar a faculdade.');
    }
  };

  if (!open) return null; // Não renderiza o modal se não estiver aberto

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <h2 className="text-lg font-bold">Criar Faculdade</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 mt-4">
            <div className="relative">
              <Input
                {...register('name', { required: true })}
                type="text"
                placeholder="Nome da Universidade"
              />
              {errors.name && (
                <span className="text-red-500 text-sm flex mt-2 gap-2">
                  <Icon name="WarningCircle" /> Este campo é obrigatório
                </span>
              )}
            </div>

            <div className="relative">
              <Input
                {...register('slug', { required: true })}
                type="text"
                placeholder="Slug da Universidade"
              />
              {errors.slug && (
                <span className="text-red-500 text-sm flex mt-2 gap-2">
                  <Icon name="WarningCircle" /> Este campo é obrigatório
                </span>
              )}
            </div>

            <Input {...register('site')} type="url" placeholder="Site da Universidade" />
            <Input {...register('phone')} type="tel" placeholder="Telefone" />
            <Input {...register('logo')} type="url" placeholder="URL do Logo" />
          </div>

          <div className="grid gap-4 mt-4">
            <Textarea {...register('benefits')} placeholder="Benefícios" />
            <Textarea {...register('about')} placeholder="Sobre" />
          </div>

          <div className="flex justify-end mt-6">
            <Button type="button" onClick={() => setOpen(false)} variant="outline" className="mr-4">
              Cancelar
            </Button>
            <Button type="submit">Cadastrar Faculdade</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
