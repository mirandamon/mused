
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusSquare } from 'lucide-react';
import BrandIcon from './BrandIcon';

const NavBar: React.FC = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? 'glass shadow-sm border-b border-white/10' : 'bg-transparent'
      }`}
    >
      <div className="container h-16 max-w-screen-md mx-auto flex items-center justify-between">
        <Link 
          to="/" 
          className="text-2xl font-medium flex items-center transition-transform duration-300 hover:scale-105"
        >
          <BrandIcon size={30} className="mr-2" />
          <span>Mused</span>
        </Link>
        
        <nav className="flex items-center space-x-2">
          <NavLink to="/" active={location.pathname === '/'}>
            <Home className="h-5 w-5" />
            <span className="sr-only">Home</span>
          </NavLink>
          <NavLink to="/create" active={location.pathname === '/create'}>
            <PlusSquare className="h-5 w-5" />
            <span className="sr-only">Create</span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

interface NavLinkProps {
  to: string;
  active: boolean;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ to, active, children }) => {
  return (
    <Link
      to={to}
      className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
      }`}
    >
      {children}
      <span 
        className={`absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full transition-all duration-300 ${
          active ? 'bg-primary opacity-100' : 'opacity-0'
        }`} 
      />
    </Link>
  );
};

export default NavBar;
