import { createStudents } from '@/api/create-students';
import { getCep } from '@/api/get-cep';
import { getAllUniversities } from '@/api/get-university';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';


import { toast } from 'sonner';

interface CreateStudentProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}


export default function CreateStudents({ open, setOpen }: CreateStudentProps) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm();
  
  const [universities, setUniversities] = useState<any[]>([]); // Estado para armazenar universidades
  const [selectedUniversitySlug, setSelectedUniversitySlug] = useState<string>(''); // Estado para armazenar o slug selecionado

  useEffect(() => {
    // Função para buscar universidades ao montar o componente
    const fetchUniversities = async () => {
      try {
        const response = await getAllUniversities();
        setUniversities(response.data); 
      } catch (error) {
        console.error('Erro ao buscar universidades:', error);
        toast.error('Erro ao buscar universidades.');
      }
    };

    fetchUniversities();
  }, []);


  
  const onSubmit = async (data: any) => {
    try {
      data.universitySlug = selectedUniversitySlug; 
      await createStudents(data);
      toast.success('Aluno cadastrado com sucesso!');
      reset();
    } catch (error) {
      console.error('Erro ao cadastrar o aluno:', error);
      const errorMessage = (error as any).response?.data?.message || 'Erro ao cadastrar o aluno.';
      toast.error(errorMessage); 
    }
  };

  const handleCepChange = async (cep: string) => {
    const cleanCep = cep.replace('-', '').replace(/\D/g, '');
    if (cleanCep.length === 8) {
      try {
        const data = await getCep(cleanCep);
        if (data) {
          setValue('address', data.logradouro || '');
          setValue('neighborhood', data.bairro || '');
          setValue('city', data.localidade || '');
          setValue('state', data.uf || '');
          setValue('postal_code', data.cep || '');
        } else {
          toast.error('CEP não encontrado.');
        }
      } catch (error) {
        console.error('Erro ao buscar dados do CEP:', error);
        toast.error('Erro ao buscar dados do CEP.');
      }
    }
  };

  const handleClean = () => {
    reset();
  };

  if (!open) return null; 

  return (
   
       <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
       <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
         <h2 className="text-lg font-bold">Cadastrar Aluno</h2>
 
         <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 mt-4">
          <Input
            {...register('name', { required: true })}
            type="text"
            placeholder="Nome"
            className={errors.name ? 'border-red-500' : ''}
          />

          <div className='grid grid-cols-2 gap-2'>
            <Controller
              control={control}
              name="cpf"
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  mask="999.999.999-99"
                  placeholder="CPF"
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value);
                  }}
                  className={errors.cpf ? 'border-red-500' : ''}
                />
              )}
            />

            <Controller
              control={control}
              name="document"
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  mask="99.999.999-9"
                  placeholder="RG"
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value);
                  }}
                  className={errors.document ? 'border-red-500' : ''}
                />
              )}
            />
          </div>

          <div className='w-full flex flex-1 gap-2'>
            <Controller
              control={control}
              name="birthday"
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="date"
                  placeholder="Data de Nascimento"
                  className={errors.birthday ? 'border-red-500' : ''}
                />
              )}
            />

            <Input
              {...register('email', { required: true })}
              type="email"
              placeholder="Email"
              className={errors.email ? 'border-red-500' : ''}
            />
          </div>

          <div className='w-full'>
          
            <select
              id="university"
              className="border rounded-lg text-zinc-500 text-md w-full p-2"
              onChange={(e) => setSelectedUniversitySlug(e.target.value)} 
            >
              <option value="">Selecione uma universidade</option>
              {universities.map((university) => (
                <option key={university.slug} value={university.slug}>
                  {university.name}
                </option>
              ))}
            </select>
          </div>

          <div className='grid grid-cols-2 gap-2'>
            <Controller
              control={control}
              name="postal_code"
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  mask="99999-999"
                  placeholder="CEP"
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value);
                    handleCepChange(value);
                  }}
                  className={errors.postal_code ? 'border-red-500' : ''}
                />
              )}
            />

            <Input
              {...register('address', { required: true })}
              type="text"
              placeholder="Endereço"
              className={errors.address ? 'border-red-500' : ''}
            />

            <Input
              {...register('address_number', { required: true })}
              type="text"
              placeholder="Número"
              className={errors.address_number ? 'border-red-500' : ''}
            />

            <Input
              {...register('neighborhood', { required: true })}
              type="text"
              placeholder="Bairro"
              className={errors.neighborhood ? 'border-red-500' : ''}
            />

            <Input
              {...register('city', { required: true })}
              type="text"
              placeholder="Cidade"
              className={errors.city ? 'border-red-500' : ''}
            />

            <Input
              {...register('state', { required: true })}
              type="text"
              placeholder="Estado"
              className={errors.state ? 'border-red-500' : ''}
            />
          </div>

          <div className='flex items-center gap-2'>
            <Controller
              control={control}
              name="phone"
              rules={{ required: true }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  mask="(99) 99999-9999"
                  placeholder="Telefone"
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value);
                  }}
                  className={errors.phone ? 'border-red-500' : ''}
                />
              )}
            />

            <div className='w-full flex items-center'>
              <Controller
                control={control}
                name="active"
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className='mr-2'
                  />
                )}
              />
              <label>WhatsApp</label>
            </div>
          </div>
          
          <Input
            {...register('high_school_completion_year', { required: true })}
            type="text"
            placeholder="Ano de conclusão do ensino médio"
          />

        
        
        </div>

        <div className="flex justify-end mt-6">
            <Button type="button" onClick={handleClean} variant="outline" className="mr-4">
              Limpar
            </Button>
            <Button type="submit">Cadastrar Faculdade</Button>
          </div>
      </form>
       </div>
     </div>
  );
}
