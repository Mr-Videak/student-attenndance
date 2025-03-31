
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import CreateClassForm from '@/components/classes/CreateClassForm';

const CreateClass = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container max-w-3xl px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Create New Class</h1>
          <p className="text-muted-foreground mt-1">
            Add a new class with students for attendance tracking
          </p>
        </div>
        
        <CreateClassForm onSuccess={() => navigate('/')} />
      </main>
      <Footer />
    </div>
  );
};

export default CreateClass;
