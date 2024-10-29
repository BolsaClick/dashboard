
import * as Icons from '@phosphor-icons/react'; 

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 20, className }: IconProps) {
  const IconComponent = (Icons as any)[name]; 

  if (!IconComponent) {
    return null;
  }

  return <IconComponent size={size} className={className} />;
}
