
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, ClipboardList, Home, Menu, LogOut, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTheme } from '@/hooks/use-theme';

const Navbar = () => {
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const menuItems = [
    { title: 'Dashboard', icon: <Home className="h-5 w-5 mr-2" />, href: '/' },
    { title: 'Classes', icon: <ClipboardList className="h-5 w-5 mr-2" />, href: '/classes' },
    { title: 'Attendance', icon: <Calendar className="h-5 w-5 mr-2" />, href: '/attendance-records' },
  ];

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <Calendar className="h-6 w-6 text-primary mr-2" />
            <span className="text-xl font-bold">HighClass</span>
          </Link>
        </div>

        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>HighClass</SheetTitle>
                <SheetDescription>
                  Attendance tracking made simple
                </SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col gap-2 mt-6">
                {menuItems.map((item) => (
                  <Link
                    key={item.title}
                    to={item.href}
                    className={`flex items-center py-2 px-3 rounded-md hover:bg-muted ${
                      location.pathname === item.href ? 'bg-muted' : ''
                    }`}
                  >
                    {item.icon}
                    {item.title}
                  </Link>
                ))}
                
                <button
                  onClick={toggleTheme}
                  className="flex items-center py-2 px-3 rounded-md hover:bg-muted text-left"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-5 w-5 mr-2" />
                  ) : (
                    <Moon className="h-5 w-5 mr-2" />
                  )}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
                
                {user && (
                  <Button 
                    variant="ghost" 
                    className="flex items-center justify-start mt-4"
                    onClick={() => signOut()}
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Sign Out
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        ) : (
          <div className="flex items-center">
            <nav className="flex items-center space-x-2 mr-4">
              {menuItems.map((item) => (
                <Link key={item.title} to={item.href}>
                  <Button 
                    variant={location.pathname === item.href ? "default" : "ghost"} 
                    className="text-sm"
                  >
                    <span className="flex items-center">
                      {item.icon}
                      {item.title}
                    </span>
                  </Button>
                </Link>
              ))}
            </nav>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="mr-2"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            
            {user && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => signOut()}
                className="flex items-center"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
