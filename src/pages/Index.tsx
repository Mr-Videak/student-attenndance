
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import ClassList from '@/components/classes/ClassList';
import { loadClasses } from '@/utils/data';

const Index = () => {
  const { user, signOut } = useAuth();
  const classes = loadClasses();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container max-w-6xl px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Class Attendance</h1>
            <p className="text-muted-foreground mt-1">
              Manage attendance for your classes
            </p>
          </div>
          
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Link to="/create-class">
              <Button className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                Create Class
              </Button>
            </Link>
          </div>
        </div>
        
        <ClassList classes={classes} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
