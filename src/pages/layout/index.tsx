import { ReactNode, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import clsx from 'clsx'; 
import Image from 'next/image';
import Logo from '@/public/logo-icon.png';
import Header from './Header';
import { Icon } from '@/components/Icon';
import Loading from '@/components/Loading';

interface LayoutProps {
  children: ReactNode;
  title: string;
}
interface MenuItem {
  label: string;
  path: string;
  icon: string;
}

const menuItems: MenuItem[] = [
  { label: 'Home', path: '/', icon: 'House' },
  { label: 'Universidade', path: '/university', icon: 'GraduationCap' },
  { label: 'Estudante', path: '/students', icon: 'Student' },
];

const Layout = ({ children, title }: LayoutProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAsideOpen, setIsAsideOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/signin');
    } else {
      setIsLoading(false); 
    }
  }, [session, status, router]);

  const isActive = (path: string) => router.pathname === path;

  const handleMenuItemClick = (path: string) => {
    setIsLoading(true); // Mostra o loading ao trocar de página
    router.push(path);
  };

  return (
    <div className="flex h-screen bg-zinc-100">
      <aside className={clsx("transition-all text-gray-100 bg-zinc-900 border-r", {
        'w-64': isAsideOpen,
        'w-0 overflow-hidden': !isAsideOpen 
      })}>
        <div className="p-4">
          <h2 className={clsx("gap-2 text-lg mb-10 flex justify-center font-bold transition-opacity", {
            'opacity-100': isAsideOpen,
            'opacity-0': !isAsideOpen
          })}>
            <Image src={Logo} width={50} height={50} alt='Logo bolsa click'/>
          </h2>
          <ul className="mt-4">
            {menuItems.map((item) => (
              <li key={item.path} className={clsx("py-2 px-4 hover:bg-gray-200/20 rounded-sm mb-2 transition-all", isActive(item.path) && 'bg-custom-600 hover:bg-custom-600 font-bold')}>
                <button 
                  onClick={() => handleMenuItemClick(item.path)} 
                  className="flex gap-2 items-center w-full text-left"
                >
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="flex-1">
        <Header isAsideOpen={isAsideOpen} setIsAsideOpen={setIsAsideOpen} title={title}/>
        <main className="pt-4 px-4">
          {isLoading ? <Loading /> : children} 
        </main>
      </div>
    </div>
  );
};

export default Layout;
