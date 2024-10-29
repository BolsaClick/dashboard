import { Icon } from '@/components/Icon';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useSession, signIn, signOut } from 'next-auth/react';


interface HeaderProps {
  setIsAsideOpen: (isAsideOpen: boolean) => void;
  isAsideOpen: boolean;
  title: string;
}

const Header = ({ setIsAsideOpen, isAsideOpen, title }: HeaderProps) => {
  const { data: session, status } = useSession();

 
  const getInitials = (name: string): string => {
    const names = name.split(' ');
    const initials = `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    return initials;
  };

  return (
    <header className="flex bg-white border-b-2 border-gray-100 p-4 justify-between items-center mb-4">
      <div className="flex items-center gap-4">
        <button 
          className="bg-gray-50 rounded-sm hover:bg-gray-100 transition-all p-2"
          onClick={() => setIsAsideOpen(!isAsideOpen)} 
        >
          <Icon name="List" size={32} className='text-custom-600' />
        </button>
        <span className="border-r-[1px] border-gray-200 h-8"></span>
        <h1 className="font-semibold text-lg text-zinc-600 uppercase">{title}</h1>
      </div>
      <div className="flex items-center gap-2 pr-4">
        {status === 'loading' ? (
          <span>Carregando...</span>
        ) : session ? (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center cursor-pointer">
                  <Avatar>
                    <AvatarFallback>{getInitials(session.user?.name || '')}</AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <button className="w-full text-left" onClick={() => {}}>
                    Configurações
                  </button>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <button className="w-full text-left" onClick={() => signOut()}>
                    Sair
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <button
            onClick={() => signIn()}
            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            Entrar
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
