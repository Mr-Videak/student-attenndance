
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { saveClasses, loadClasses, Class, generateStudentsFromRollNumbers } from '@/utils';

interface CreateClassFormProps {
  onSuccess: () => void;
}

const CreateClassForm: React.FC<CreateClassFormProps> = ({ onSuccess }) => {
  const [className, setClassName] = useState('');
  const [section, setSection] = useState('');
  const [batch, setBatch] = useState('');
  const [rollRanges, setRollRanges] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Parse roll ranges (format: 23BQ1A4755-23BQ1A4799,23BQ1A47A0-23BQ1A47A7)
      const parsedRanges = rollRanges.split(',').map(range => {
        const [start, end] = range.trim().split('-');
        return { start, end };
      });

      // Validate inputs
      if (!className || !section || !batch || parsedRanges.length === 0) {
        toast.error('Please fill all required fields');
        setIsLoading(false);
        return;
      }

      // Create new class
      const existingClasses = loadClasses();
      const newClass: Class = {
        id: `class-${Date.now()}`,
        name: className,
        section,
        batch,
        students: generateStudentsFromRollNumbers(parsedRanges, section, batch)
      };

      // Save to storage
      saveClasses([...existingClasses, newClass]);
      
      toast.success('Class created successfully!');
      onSuccess();
      
      // Reset form
      setClassName('');
      setSection('');
      setBatch('');
      setRollRanges('');
    } catch (error) {
      console.error('Error creating class:', error);
      toast.error('Failed to create class');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Class</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="className">Class Name</Label>
            <Input
              id="className"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="e.g. Computer Science"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <Input
                id="section"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="e.g. A"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="batch">Batch</Label>
              <Input
                id="batch"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                placeholder="e.g. 2023"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rollRanges">Roll Number Ranges</Label>
            <Input
              id="rollRanges"
              value={rollRanges}
              onChange={(e) => setRollRanges(e.target.value)}
              placeholder="e.g. 23BQ1A4755-23BQ1A4799,23BQ1A47A0-23BQ1A47A7"
              required
            />
            <p className="text-sm text-muted-foreground">
              Comma-separated ranges, e.g. 23BQ1A4755-23BQ1A4799,23BQ1A47A0-23BQ1A47A7
            </p>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Creating...' : 'Create Class'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CreateClassForm;
