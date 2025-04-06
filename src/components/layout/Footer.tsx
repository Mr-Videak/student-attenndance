
import React from 'react';
import { Calendar, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-muted py-6 border-t">
      <div className="container max-w-6xl px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-primary mr-2" />
            <span className="text-lg font-semibold">HighClass Attendance</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <p className="text-sm text-muted-foreground text-center">
              Created by <span className="font-medium">VEMA VIVEK DATTA</span>
            </p>
            <a 
              href="mailto:vivekcharan0609@gmail.com" 
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <Mail className="h-3.5 w-3.5" />
              vivekcharan0609@gmail.com
            </a>
            <p className="text-xs text-muted-foreground text-center mt-2">
              &copy; {new Date().getFullYear()} HighClass Attendance System. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
