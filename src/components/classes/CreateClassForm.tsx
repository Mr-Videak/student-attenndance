
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateStudentsFromRollNumbers, saveClasses } from '@/utils/data';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

// Form validation schema
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
  rollNumberRanges: z.string().optional(),
});

interface CreateClassFormProps {
  onSuccess?: () => void;
}

const CreateClassForm = ({ onSuccess }: CreateClassFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      section: "",
      batch: "",
      rollNumberRanges: "",
    },
  });
  
  const parseRollNumberRanges = (input: string) => {
    if (!input.trim()) return [];
    
    // Split by commas or new lines
    const ranges = input.split(/[,\n]/).map(r => r.trim()).filter(Boolean);
    
    return ranges.map(range => {
      // Check if it's a range with hyphen (e.g., "A001-A010")
      if (range.includes('-')) {
        const [start, end] = range.split('-').map(r => r.trim());
        return { start, end };
      }
      // Single roll number
      return { start: range, end: range };
    });
  };
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to create a class",
        });
        return;
      }
      
      // Parse roll number ranges
      const rollNumberRanges = parseRollNumberRanges(values.rollNumberRanges || "");
      
      // Create class in Supabase
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .insert([
          {
            name: values.name,
            section: values.section,
            batch: values.batch,
            user_id: user.id,
          }
        ])
        .select();
      
      if (classError) throw classError;
      
      const newClass = classData[0];
      
      // Generate students from roll number ranges if provided
      if (rollNumberRanges.length > 0) {
        const students = generateStudentsFromRollNumbers(
          rollNumberRanges,
          values.section,
          values.batch
        );
        
        // Prepare students for Supabase insert
        const supabaseStudents = students.map(student => ({
          name: student.name,
          roll_number: student.rollNumber,
          section: student.section,
          batch: student.batch,
          class_id: newClass.id,
          avatar: student.avatar,
        }));
        
        // Insert students
        if (supabaseStudents.length > 0) {
          const { error: studentsError } = await supabase
            .from('students')
            .insert(supabaseStudents);
          
          if (studentsError) throw studentsError;
        }
      }
      
      toast({
        title: "Class Created",
        description: `${values.name} has been created successfully.`,
      });
      
      // Reset form
      form.reset();
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating class:', error);
      toast({
        variant: "destructive",
        title: "Failed to create class",
        description: error.message || "There was an error creating the class. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Class Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Computer Science" {...field} />
              </FormControl>
              <FormDescription>
                Enter the name of the class or subject.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="section"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Section</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. A" {...field} />
                </FormControl>
                <FormDescription>
                  Enter the section identifier.
                </FormDescription>
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
                <FormDescription>
                  Enter the batch or year.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="rollNumberRanges"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Roll Number Ranges (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="e.g. 2023A001-2023A020, 2023B010"
                  className="h-28"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Enter roll number ranges or individual roll numbers separated by commas or new lines.
                For example: 2023A001-2023A020, 2023B010
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Class"}
        </Button>
      </form>
    </Form>
  );
};

export default CreateClassForm;
