import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const navLinks = [
  { href: '#recursos', label: 'Recursos' },
  { href: '#canais', label: 'Canais' },
  { href: '#segmentos', label: 'Segmentos' },
  { href: '#integracoes', label: 'Integrações' },
  { href: '#faq', label: 'FAQ' },
];

export function LandingNavbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const scrollTo = (href: string) => {
    setOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-gray-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="shrink-0">
          <Logo size="sm" showCompany className="[&_span]:text-white [&_span_span]:text-teal-400 [&_p]:text-gray-400" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" className="text-gray-300 hover:bg-white/10 hover:text-white" onClick={() => navigate('/login')}>
            Entrar
          </Button>
          <Button onClick={() => navigate('/login')}>Teste grátis</Button>
        </div>

        <button className="rounded-lg p-2 text-gray-300 md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-gray-950 px-4 py-4 md:hidden">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="block w-full py-2 text-left text-sm text-gray-300"
            >
              {link.label}
            </button>
          ))}
          <div className="mt-4 flex flex-col gap-2">
            <Button variant="outline" onClick={() => navigate('/login')}>Entrar</Button>
            <Button onClick={() => navigate('/login')}>Teste grátis</Button>
          </div>
        </div>
      )}
    </header>
  );
}

interface SectionProps {
  id?: string;
  className?: string;
  children: React.ReactNode;
}

export function LandingSection({ id, className, children }: SectionProps) {
  return (
    <section id={id} className={cn('py-20 sm:py-28', className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-white/10 bg-gray-950 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Logo size="sm" showCompany className="[&_span]:text-white [&_span_span]:text-teal-400 [&_p]:text-gray-500" />
          <p className="text-sm text-gray-500">© 2024 Tironitech · PulseDesk. Todos os direitos reservados.</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link to="/legal/privacidade" className="hover:text-gray-300">Privacidade</Link>
            <Link to="/legal/termos" className="hover:text-gray-300">Termos</Link>
            <Link to="/legal/suporte" className="hover:text-gray-300">Suporte</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
