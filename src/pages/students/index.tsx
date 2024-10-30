import Layout from "../layout";


import  StudentTableRow  from "./table-row";
import { useEffect, useState } from "react";

import  CreateStudents  from "./create-students";
import { NextSeo } from "next-seo";
import { getStudent, Student } from "@/api/get-students";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/Icon";
import { FilterStudent } from "@/components/FilterStudent";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const Univeristy = () => {
   const [universities, setUniversities] = useState<Student[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [currentPage, setCurrentPage] = useState(1);
   const [totalPages, setTotalPages] = useState(0);
   const [filters, setFilters] = useState({ name: '', email: '' });
   const [isOpen, setIsOpen] = useState(false);

   const getUniversities = async (page: number) => {
      setIsLoading(true);
      try {
         const data = await getStudent(page, 10, filters.name || undefined, filters.email || undefined,);
         console.log('Dados recebidos:', data);
         setUniversities(data.data)
         setTotalPages(data.totalPages);
      } catch (error) {
         console.error('Error:', error);
      } finally {
         setIsLoading(false);
      }
   };

   useEffect(() => {

      getUniversities(currentPage);
   }, [currentPage, filters]);



   const handleNextPage = () => {
      if (currentPage < totalPages) {
         setCurrentPage(currentPage + 1);
      }
   };

   const handlePreviousPage = () => {
      if (currentPage > 1) {
         setCurrentPage(currentPage - 1);
      }
   };

   const handleFirstPage = () => {
      if (currentPage !== 1) {
         setCurrentPage(1);
      }
   };

   const handleLastPage = () => {
      if (currentPage !== totalPages) {
         setCurrentPage(totalPages);
      }
   };

   const handleFilterChange = (newFilters: Partial<{ name: string; email: string; }>) => {

      setFilters(prevFilters => ({
         ...prevFilters,
         ...newFilters,
      }));
      setCurrentPage(1);
   };
   return (
      <Layout title="Estudantes">
         <NextSeo
            title="Estudantes | Bolsa Click - Dashboard"

         />
         <div className="w-full h-screen">
            <div className="w-full rounded-md bg-white p-4">
               <div className="flex w-full justify-between">
                  <div className="w-full">
                           <Button variant="custom" className="flex gap-2">
                              <Icon name="Plus" /> Adicionar Aluno
                           </Button>
                   

                        <CreateStudents  open={isOpen} setOpen={setIsOpen} />
                    
                  </div>
               </div>
            </div>
            <div className="space-y-2.5 mt-10">
               <FilterStudent onFilterChange={handleFilterChange} />
               <div className="rounded-md bg-white border">
                  <Table>
                     <TableHeader>
                        <TableRow>
                           <TableHead className="w-[180px]">Nome</TableHead>
                           <TableHead className="w-[180px]">E-mail</TableHead>
                           <TableHead className="w-[140px]">CPF</TableHead>
                           <TableHead>Endereco</TableHead>
                           <TableHead className="w-[164px]">Telefone</TableHead>
                           <TableHead className="w-[140px]">Criação</TableHead>

                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {isLoading ? (
                           Array.from({ length: 5 }).map((_, index) => (
                              <TableRow key={index}>
                                 <TableHead className="w-[64px]"><Skeleton className="h-4 w-6" /></TableHead>
                                 <TableHead className="w-[140px]"><Skeleton className="h-4 w-20" /></TableHead>
                                 <TableHead className="w-[180px]"><Skeleton className="h-4 w-24" /></TableHead>
                                 <TableHead className="w-[140px]"><Skeleton className="h-4 w-16" /></TableHead>
                                 <TableHead className="w-[180px]"><Skeleton className="h-4 w-32" /></TableHead>
                                 <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                                 <TableHead className="w-[164px]"><Skeleton className="h-4 w-24" /></TableHead>
                                 <TableHead className="w-[132px]"><Skeleton className="h-4 w-10" /></TableHead>
                              </TableRow>
                           ))
                        ) : (
                           universities.map((student: any) => (
                              <StudentTableRow key={student.id} student={student} />
                           ))
                        )}
                     </TableBody>
                  </Table>
               </div>
            </div>

            <div className="flex items-center justify-end mt-4 gap-2">
               <span className="mx-4">Página {currentPage} de {totalPages}</span>

               <Button className="h-8 w-8 p-0" onClick={handleFirstPage} size='xs' disabled={currentPage === 1}>
                  <Icon name="CaretDoubleLeft" />
               </Button>
               <Button className="h-8 w-8 p-0" onClick={handlePreviousPage} size='xs' disabled={currentPage === 1}>
                  <Icon name="CaretLeft" className="h-4 w-4" />
               </Button>

               <Button className="h-8 w-8 p-0" onClick={handleNextPage} size='xs' disabled={currentPage === totalPages}>
                  <Icon name="CaretRight" className="h-4 w-4" />
               </Button>
               <Button className="h-8 w-8 p-0" onClick={handleLastPage} size='xs' disabled={currentPage === totalPages}>
                  <Icon name="CaretDoubleRight" className="h-4 w-4" />
               </Button>
            </div>
         </div>
      </Layout>
   );
};

export default Univeristy;
