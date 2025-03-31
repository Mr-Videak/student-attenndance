
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import SearchBar from '@/components/ui/SearchBar';
import EmptyState from '@/components/ui/EmptyState';
import { ClipboardList } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/components/auth/AuthProvider';

const Classes = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchClasses();
  }, [user]);
  
  const fetchClasses = async () => {
    try {
      setLoading(true);
      if (!user) return;
      
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({
        variant: "destructive",
        title: "Error fetching classes",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };
  
  const deleteClass = async (classId) => {
    try {
      // First, delete all students associated with this class to avoid foreign key constraints
      const { error: studentsError } = await supabase
        .from('students')
        .delete()
        .eq('class_id', classId);
      
      if (studentsError) throw studentsError;
      
      // Next, delete all attendance records for this class
      const { error: attendanceError } = await supabase
        .from('attendance_records')
        .delete()
        .eq('class_id', classId);
      
      if (attendanceError) throw attendanceError;
      
      // Finally delete the class itself
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId);
      
      if (error) throw error;
      
      // Update local state
      setClasses(classes.filter(c => c.id !== classId));
      
      toast({
        title: "Class deleted",
        description: "The class has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting class:', error);
      toast({
        variant: "destructive",
        title: "Error deleting class",
        description: error.message,
      });
    }
  };
  
  // Filter classes based on search query
  const filteredClasses = classes.filter((cls) =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.batch.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container max-w-6xl px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Classes</h1>
            <p className="text-muted-foreground mt-1">
              Manage your classes and attendance
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
        
        <div className="space-y-6 animate-fade-in">
          <div className="mb-6">
            <SearchBar 
              onSearch={setSearchQuery} 
              placeholder="Search classes by name, section or batch..."
            />
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                  </CardContent>
                  <CardFooter>
                    <div className="h-10 bg-muted rounded w-full"></div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredClasses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClasses.map((cls) => (
                <Card key={cls.id} className="card-hover">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{cls.name}</span>
                    </CardTitle>
                    <CardDescription>
                      Section {cls.section} | Batch {cls.batch}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm flex flex-col space-y-2">
                      <div className="flex justify-end space-x-2">
                        <Link to={`/class/${cls.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </Link>
                        <Link to={`/edit-class/${cls.id}`}>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
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
                                onClick={() => deleteClass(cls.id)}
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
                      <Link to={`/class/${cls.id}`}>
                        <Button variant="outline" className="w-full">
                          View Details
                        </Button>
                      </Link>
                      <Link to={`/attendance/${cls.id}`}>
                        <Button className="w-full">
                          Take Attendance
                        </Button>
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Classes Found"
              description={
                searchQuery
                  ? `No classes matching "${searchQuery}"`
                  : "You haven't added any classes yet."
              }
              icon={<ClipboardList className="h-12 w-12 text-muted-foreground" />}
              action={{
                label: "Create Class",
                onClick: () => { window.location.href = '/create-class'; }
              }}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Classes;
