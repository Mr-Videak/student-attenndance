
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Class, loadClasses } from '@/utils/data';
import EmptyState from '@/components/ui/EmptyState';
import AttendanceMarker from '@/components/attendance/AttendanceMarker';

const TakeAttendance = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const classes = loadClasses();
  const classData = classes.find(c => c.id === classId);
  
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
      <main className="flex-1 container max-w-6xl px-4 py-8">
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
          <h1 className="text-2xl font-bold">Attendance: {classData.name}</h1>
        </div>
        
        <div className="mb-4">
          <p className="text-muted-foreground">
            Section {classData.section} | Batch {classData.batch} | {classData.students.length} Students
          </p>
        </div>
        
        <AttendanceMarker classData={classData} />
      </main>
      <Footer />
    </div>
  );
};

export default TakeAttendance;
