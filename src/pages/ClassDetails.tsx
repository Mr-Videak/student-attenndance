
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ListFilter, UserPlus } from 'lucide-react';
import SearchBar from '@/components/ui/SearchBar';
import { Class, loadClasses } from '@/utils/data';
import StudentCard from '@/components/attendance/StudentCard';
import EmptyState from '@/components/ui/EmptyState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ClassDetails = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const classes = loadClasses();
  const classData = classes.find(c => c.id === classId);
  
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Filter students based on search query
  const filteredStudents = classData?.students.filter(
    student =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];
  
  if (!classData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container max-w-6xl px-4 py-8">
          <EmptyState
            title="Class Not Found"
            description="The class you're looking for doesn't exist."
            action={{
              label: "Go Back",
              onClick: () => navigate(-1),
            }}
          />
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container max-w-6xl px-4 py-8 animate-fade-in">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">{classData.name}</h1>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between mb-8">
          <div>
            <p className="text-muted-foreground">
              Section {classData.section} | Batch {classData.batch}
            </p>
            <p className="mt-1 font-medium">
              {classData.students.length} Students
            </p>
          </div>
          
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Link to={`/attendance/${classData.id}`}>
              <Button className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Take Attendance
              </Button>
            </Link>
          </div>
        </div>
        
        <Tabs defaultValue="students">
          <TabsList className="mb-6">
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="attendance">Attendance Records</TabsTrigger>
          </TabsList>
          
          <TabsContent value="students">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-semibold">Students</h2>
                  <Button variant="ghost" size="icon">
                    <ListFilter className="h-4 w-4" />
                  </Button>
                </div>
                <Button size="sm" variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </div>
              
              <SearchBar
                onSearch={setSearchQuery}
                placeholder="Search students by name or roll number..."
              />
              
              <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
                {filteredStudents.length > 0 ? (
                  <div className="divide-y">
                    {filteredStudents.map(student => (
                      <Link
                        to={`/student/${student.rollNumber}`}
                        key={student.id}
                        className="block p-4 hover:bg-muted transition-colors"
                      >
                        <StudentCard student={student} />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No Students Found"
                    description={
                      searchQuery
                        ? `No students matching "${searchQuery}"`
                        : "This class doesn't have any students yet."
                    }
                    action={{
                      label: "Add Student",
                      onClick: () => {/* Implementation would go here */},
                    }}
                  />
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="attendance">
            <div className="py-8 text-center text-muted-foreground">
              <p>Attendance records will be displayed here in a future update.</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default ClassDetails;
