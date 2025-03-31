
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ClipboardList, Home, Menu } from 'lucide-react';
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

const Navbar = () => {
  const isMobile = useIsMobile();

  const menuItems = [
    { title: 'Dashboard', icon: <Home className="h-5 w-5 mr-2" />, href: '/' },
    { title: 'Classes', icon: <ClipboardList className="h-5 w-5 mr-2" />, href: '/classes' },
    { title: 'Attendance', icon: <Calendar className="h-5 w-5 mr-2" />, href: '/attendance' },
  ];

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
                    className="flex items-center py-2 px-3 rounded-md hover:bg-muted"
                  >
                    {item.icon}
                    {item.title}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        ) : (
          <nav className="flex items-center space-x-2">
            {menuItems.map((item) => (
              <Link key={item.title} to={item.href}>
                <Button variant="ghost" className="text-sm">
                  <span className="flex items-center">
                    {item.icon}
                    {item.title}
                  </span>
                </Button>
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navbar;
