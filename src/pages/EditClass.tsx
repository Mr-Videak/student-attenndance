import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { loadClasses, saveClasses } from '@/utils/data';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Class name must be at least 2 characters.",
  }),
  section: z.string().min(1, {
    message: "Section is required",
  }),
  batch: z.string().min(1, {
    message: "Batch year is required",
  }),
});

const EditClass = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      section: "",
      batch: "",
    },
  });
  
  useEffect(() => {
    const fetchClassData = () => {
      try {
        setLoading(true);
        const classes = loadClasses();
        const classData = classes.find(c => c.id === classId);
        
        if (classData) {
          form.reset({
            name: classData.name,
            section: classData.section,
            batch: classData.batch,
          });
        }
      } catch (error) {
        console.error('Error fetching class:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load class data. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchClassData();
  }, [classId, form]);
  
  const onSubmit = (values) => {
    try {
      const classes = loadClasses();
      const updatedClasses = classes.map(c => 
        c.id === classId 
          ? { ...c, name: values.name, section: values.section, batch: values.batch }
          : c
      );
      saveClasses(updatedClasses);
      
      toast({
        title: "Class updated",
        description: "The class has been updated successfully.",
      });
      
      navigate(`/class/${classId}`);
    } catch (error) {
      console.error('Error updating class:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update class. Please try again.",
      });
    }
  };
  
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
          <h1 className="text-3xl font-bold">Edit Class</h1>
          <p className="text-muted-foreground mt-1">
            Update class details
          </p>
        </div>
        
        {loading ? (
          <div className="space-y-4">
            <div className="h-10 bg-muted rounded animate-pulse"></div>
            <div className="h-10 bg-muted rounded animate-pulse"></div>
            <div className="h-10 bg-muted rounded animate-pulse"></div>
            <div className="h-10 bg-muted rounded animate-pulse w-1/3"></div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Computer Science" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="section"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="batch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 2023" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full">
                Update Class
              </Button>
            </form>
          </Form>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default EditClass;
