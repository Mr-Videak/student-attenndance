
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Class, Student, loadClasses } from '@/utils/data';
import EmptyState from '@/components/ui/EmptyState';
import StudentProfile from '@/components/students/StudentProfile';

const StudentDetails = () => {
  const { rollNumber } = useParams<{ rollNumber: string }>();
  const navigate = useNavigate();
  const classes = loadClasses();
  
  // Find the student across all classes
  let student: Student | undefined;
  let classData: Class | undefined;
  
  for (const cls of classes) {
    const foundStudent = cls.students.find(s => s.rollNumber === rollNumber);
    if (foundStudent) {
      student = foundStudent;
      classData = cls;
      break;
    }
  }
  
  if (!student || !classData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container max-w-4xl px-4 py-8">
          <EmptyState
            title="Student Not Found"
            description="The student you're looking for doesn't exist."
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
      <main className="flex-1 container max-w-4xl px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        
        <StudentProfile student={student} classData={classData} />
      </main>
      <Footer />
    </div>
  );
};

export default StudentDetails;
