
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ClipboardList, Clock, UserCheck } from 'lucide-react';
import { Class, loadAttendanceRecords, loadClasses } from '@/utils/data';
import { getCurrentDate } from '@/utils/attendance';
import EmptyState from '../ui/EmptyState';

const Dashboard = () => {
  // Load data
  const classes = loadClasses();
  const attendanceRecords = loadAttendanceRecords();
  const currentDate = getCurrentDate();
  
  // Dashboard stats
  const totalClasses = classes.length;
  const totalStudents = useMemo(() => 
    classes.reduce((total, cls) => total + cls.students.length, 0), 
    [classes]
  );
  
  // Today's attendance records
  const todayRecords = attendanceRecords.filter(record => record.date === currentDate);
  const classesWithAttendanceToday = todayRecords.map(record => record.classId);
  
  // Recent classes that need attendance
  const recentClasses = classes
    .filter(cls => !classesWithAttendanceToday.includes(cls.id))
    .slice(0, 3);

  if (classes.length === 0) {
    return (
      <div className="container max-w-6xl px-4 py-8">
        <EmptyState
          title="No Classes Found"
          description="You haven't added any classes yet. Add your first class to start tracking attendance."
          action={{
            label: "Add Class",
            onClick: () => {/* This would be implemented in future */}
          }}
          icon={<ClipboardList className="h-16 w-16 text-muted-foreground" />}
        />
      </div>
    );
  }
  
  return (
    <div className="container max-w-6xl px-4 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <ClipboardList className="mr-2 h-4 w-4 text-primary" />
              Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalClasses}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <UserCheck className="mr-2 h-4 w-4 text-primary" />
              Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalStudents}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-primary" />
              Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {todayRecords.length}/{totalClasses}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Classes with attendance today
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Classes Section */}
      <h2 className="text-2xl font-semibold mb-4 flex items-center">
        <Clock className="mr-2 h-5 w-5 text-primary" />
        Attendance Needed Today
      </h2>
      
      {recentClasses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {recentClasses.map((cls) => (
            <Card key={cls.id} className="card-hover">
              <CardHeader>
                <CardTitle>{cls.name}</CardTitle>
                <CardDescription>
                  Section {cls.section} | Batch {cls.batch}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {cls.students.length} students
                </p>
              </CardContent>
              <CardFooter>
                <Link to={`/attendance/${cls.id}`} className="w-full">
                  <Button className="w-full">Take Attendance</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="mb-8">
          <CardContent className="py-6">
            <EmptyState
              title="All Caught Up!"
              description="You've taken attendance for all classes today."
              icon={<UserCheck className="h-12 w-12 text-success" />}
            />
          </CardContent>
        </Card>
      )}
      
      {/* View All Classes Button */}
      <div className="flex justify-center">
        <Link to="/classes">
          <Button variant="outline" className="w-full md:w-auto">
            View All Classes
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
