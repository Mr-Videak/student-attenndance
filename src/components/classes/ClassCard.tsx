
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Eye, Users } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Class } from '@/utils/data';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface ClassCardProps {
  classData: any;
  onDelete?: (id: string) => void;
  refreshClasses?: () => void;
}

const ClassCard = ({ classData, onDelete, refreshClasses }: ClassCardProps) => {
  const { toast } = useToast();
  
  const deleteClass = async () => {
    try {
      // First, delete all students associated with this class to avoid foreign key constraints
      const { error: studentsError } = await supabase
        .from('students')
        .delete()
        .eq('class_id', classData.id);
      
      if (studentsError) throw studentsError;
      
      // Next, delete all attendance records for this class
      const { error: attendanceError } = await supabase
        .from('attendance_records')
        .delete()
        .eq('class_id', classData.id);
      
      if (attendanceError) throw attendanceError;
      
      // Finally delete the class itself
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classData.id);
      
      if (error) throw error;
      
      toast({
        title: "Class deleted",
        description: "The class has been successfully deleted.",
      });
      
      // Refresh classes list if provided
      if (refreshClasses) {
        refreshClasses();
      } else if (onDelete) {
        onDelete(classData.id);
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      toast({
        variant: "destructive",
        title: "Error deleting class",
        description: error.message,
      });
    }
  };

  return (
    <Card className="card-hover overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-primary via-primary/70 to-transparent"></div>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{classData.name}</span>
          <Badge variant="outline" className="bg-primary/10">
            {classData.student_count || 0} <Users className="ml-1 h-3 w-3" />
          </Badge>
        </CardTitle>
        <CardDescription>
          Section {classData.section} | Batch {classData.batch}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="text-sm flex flex-col space-y-2">
          <div className="flex justify-end space-x-2">
            <Link to={`/class/${classData.id}`}>
              <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                <Eye className="h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>
            <Link to={`/edit-class/${classData.id}`}>
              <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                <Edit className="h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Class</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this class? All students and attendance records associated with this class will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={deleteClass}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-2">
        <div className="grid grid-cols-2 gap-2 w-full">
          <Link to={`/class/${classData.id}`}>
            <Button variant="outline" className="w-full group">
              <span className="group-hover:translate-x-1 transition-transform">View Details</span>
            </Button>
          </Link>
          <Link to={`/attendance/${classData.id}`}>
            <Button className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-700 transition-all duration-300">
              <span>Take Attendance</span>
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ClassCard;
