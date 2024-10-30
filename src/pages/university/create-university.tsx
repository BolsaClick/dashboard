import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { createUniversity } from '@/api/create-univeristy';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Icon } from '../../components/Icon';

export default function CreateUniversity({open, setOpen}: any) {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    try {
      const response = await createUniversity(data);
      console.log('Resposta da API:', response);
      toast.success('Faculdade cadastrada com sucesso!');
      setOpen(false); // Fechar o diálogo após o cadastro
    } catch (error) {
      console.error('Erro ao criar a universidade:', error);
      toast.error('Erro ao cadastrar a faculdade.');
    }
  };

  return (
    <>


      <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-black/30" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg">
            <DialogTitle className="text-lg font-bold">Criar Faculdade</DialogTitle>

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
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
