import React, { useState, useEffect } from 'react';
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
import { Calendar, ClipboardList, Clock, UserCheck, BarChart, Trophy } from 'lucide-react';
import { Class } from '@/utils/data';
import { getCurrentDate } from '@/utils/attendance';
import EmptyState from '../ui/EmptyState';
import { loadClasses, loadAttendanceRecords } from '@/utils/data';

const Dashboard = () => {
  const [classes, setClasses] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentDate = getCurrentDate();
  
  // Load data
  useEffect(() => {
    const fetchData = () => {
      setLoading(true);
      
      try {
        // Load classes from localStorage
        const classesData = loadClasses();
        setClasses(classesData || []);
        
        // Load attendance records from localStorage
        const recordsData = loadAttendanceRecords();
        const todayRecords = recordsData.filter(record => record.date === currentDate);
        setAttendanceRecords(todayRecords || []);
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentDate]);
  
  // Dashboard stats
  const totalClasses = classes.length;
  const totalStudents = classes.reduce((total, cls) => {
    // Since we're using Supabase, the structure might be different
    return total + (cls.student_count || 0);
  }, 0);
  
  // Today's attendance records
  const classesWithAttendanceToday = attendanceRecords.map(record => record.class_id);
  
  // Recent classes that need attendance
  const recentClasses = classes
    .filter(cls => !classesWithAttendanceToday.includes(cls.id))
    .slice(0, 3);
    
  // Loading state
  if (loading) {
    return (
      <div className="container max-w-6xl px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-8 bg-muted rounded w-1/3 mt-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="container max-w-6xl px-4 py-8">
        <EmptyState
          title="No Classes Found"
          description="You haven't added any classes yet. Add your first class to start tracking attendance."
          action={{
            label: "Add Class",
            onClick: () => window.location.href = '/create-class'
          }}
          icon={<ClipboardList className="h-16 w-16 text-muted-foreground" />}
        />
      </div>
    );
  }
  
  return (
    <div className="container max-w-6xl px-4 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      {/* Stats Cards with Colorful Graphics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="overflow-hidden border-l-4 border-l-primary hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-full flex items-center justify-center">
            <ClipboardList className="h-6 w-6 text-primary" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalClasses}</p>
            <div className="w-full h-1 bg-muted mt-2 rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: '100%' }}></div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-l-4 border-l-indigo-500 hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-bl-full flex items-center justify-center">
            <UserCheck className="h-6 w-6 text-indigo-500" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalStudents}</p>
            <div className="w-full h-1 bg-muted mt-2 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500" style={{ width: '100%' }}></div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-l-4 border-l-green-500 hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-bl-full flex items-center justify-center">
            <Calendar className="h-6 w-6 text-green-500" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {attendanceRecords.length}/{totalClasses}
            </p>
            <div className="w-full h-1 bg-muted mt-2 rounded-full overflow-hidden">
              <div className="h-full bg-green-500" 
                style={{ width: `${totalClasses ? (attendanceRecords.length / totalClasses) * 100 : 0}%` }}>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Classes with attendance today
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Classes Section with Enhanced Graphics */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <Clock className="mr-2 h-5 w-5 text-primary" />
          <span>Attendance Needed Today</span>
          <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-sm rounded-full">
            {recentClasses.length} pending
          </span>
        </h2>
      </div>
      
      {recentClasses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {recentClasses.map((cls, index) => (
            <Card key={cls.id} className="card-hover relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/40 rounded-full transform scale-0 group-hover:scale-150 transition-transform duration-500"></div>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {cls.name}
                  <Trophy className={`h-5 w-5 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-700' : 'text-muted-foreground'}`} />
                </CardTitle>
                <CardDescription>
                  Section {cls.section} | Batch {cls.batch}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {cls.student_count || 0} students
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Link to={`/attendance/${cls.id}`} className="w-full">
                  <Button className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-700 transition-all duration-300">
                    Take Attendance
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="mb-8 overflow-hidden border border-success/30 bg-success/5">
          <CardContent className="py-6">
            <EmptyState
              title="All Caught Up!"
              description="You've taken attendance for all classes today."
              icon={<UserCheck className="h-12 w-12 text-success" />}
            />
          </CardContent>
        </Card>
      )}
      
      {/* View All Classes Button with Enhanced Styling */}
      <div className="flex justify-center">
        <Link to="/classes">
          <Button variant="outline" className="w-full md:w-auto group relative overflow-hidden">
            <span className="relative z-10">View All Classes</span>
            <span className="absolute inset-0 bg-primary/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
