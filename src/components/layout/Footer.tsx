
import React from 'react';
import { Calendar } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-muted py-6 border-t">
      <div className="container max-w-6xl px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-primary mr-2" />
            <span className="text-lg font-semibold">HighClass Attendance</span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} HighClass Attendance System. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
