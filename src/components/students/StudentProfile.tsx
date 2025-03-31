
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Student, Class } from '@/utils/data';
import { 
  calculateStudentAttendanceStats, 
  getStudentAttendanceRecords 
} from '@/utils/attendance';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Calendar, CheckCircle2, XCircle } from 'lucide-react';

interface StudentProfileProps {
  student: Student;
  classData: Class;
}

const StudentProfile = ({ student, classData }: StudentProfileProps) => {
  // Get attendance data
  const stats = calculateStudentAttendanceStats(student.rollNumber, classData.id);
  const attendanceRecords = getStudentAttendanceRecords(student.rollNumber, classData.id);
  
  // Get status color based on attendance percentage
  const getStatusColor = (percentage: number) => {
    if (percentage >= 85) return 'text-success';
    if (percentage >= 75) return 'text-warning';
    return 'text-destructive';
  };
  
  // Generate initials for avatar fallback
  const initials = student.name.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Student Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={student.avatar} alt={student.name} />
          <AvatarFallback className="text-xl">{initials}</AvatarFallback>
        </Avatar>
        
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold">{student.name}</h1>
          <p className="text-muted-foreground">{student.rollNumber}</p>
          <p className="mt-1">
            Section {student.section} | Batch {student.batch}
          </p>
        </div>
      </div>
      
      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-primary" />
              Total Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalClasses}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <CheckCircle2 className="mr-2 h-4 w-4 text-success" />
              Present
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.present}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <XCircle className="mr-2 h-4 w-4 text-destructive" />
              Absent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.absent}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Attendance Percentage */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Percentage</CardTitle>
          <CardDescription>
            Overall attendance in {classData.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <span className={`text-3xl font-bold ${getStatusColor(stats.percentage)}`}>
                {stats.percentage.toFixed(1)}%
              </span>
              <span className="text-sm text-muted-foreground">
                Target: 75%
              </span>
            </div>
            
            <Progress 
              value={stats.percentage} 
              className="h-2"
              indicatorClassName={
                stats.percentage >= 85 
                  ? "bg-success" 
                  : stats.percentage >= 75 
                    ? "bg-warning" 
                    : "bg-destructive"
              }
            />
            
            {stats.percentage < 75 && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Attendance Warning</AlertTitle>
                <AlertDescription>
                  Current attendance is below the required 75% threshold.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Attendance History */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
          <CardDescription>
            Recent attendance records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {attendanceRecords.length > 0 ? (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {attendanceRecords.map((record, index) => {
                const date = new Date(record.date);
                return (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 border-b last:border-0"
                  >
                    <div className="font-medium">
                      {format(date, "EEEE, MMMM d, yyyy")}
                    </div>
                    <div>
                      {record.present ? (
                        <span className="status-present">Present</span>
                      ) : (
                        <span className="status-absent">Absent</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No attendance records found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentProfile;
