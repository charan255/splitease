import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, Bell } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showLogout?: boolean;
  className?: string;
}

export function Header({ title, showBack, showLogout = true, className }: HeaderProps) {
  const navigate = useNavigate();
  
  return (
    <header className={cn(
      'sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border',
      className
    )}>
      <div className="container max-w-lg mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          
          {title ? (
            <h1 className="font-semibold text-lg">{title}</h1>
          ) : (
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">S</span>
              </div>
              <span className="font-semibold text-lg">SplitEase</span>
            </Link>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-muted transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-balance-negative rounded-full" />
          </button>
          
          {showLogout && (
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
