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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import CustomProgress from '@/components/ui/custom-progress';
import { 
  ArrowLeft, 
  Calendar,
  CheckCircle2, 
  Clock, 
  XCircle 
} from 'lucide-react';
import { Class, Student } from '@/utils';
import { calculateStudentAttendanceStats, getStudentAttendanceRecords } from '@/utils/attendance';

interface StudentProfileProps {
  student: Student;
  classData: Class;
}

const StudentProfile: React.FC<StudentProfileProps> = ({ student, classData }) => {
  const attendanceRecords = getStudentAttendanceRecords(student.rollNumber, classData.id);
  const stats = calculateStudentAttendanceStats(student.rollNumber, classData.id);
  
  const sortedAttendance = useMemo(() => {
    return [...attendanceRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [attendanceRecords]);
  
  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            {student.name}
          </CardTitle>
          <CardDescription>
            Roll Number: {student.rollNumber} | Section: {student.section} | Batch: {student.batch}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center space-x-4">
            <img
              src={student.avatar || "/placeholder.svg"}
              alt="Student Avatar"
              className="w-24 h-24 rounded-full object-cover shadow-md"
            />
            <div>
              <p className="text-lg font-semibold">{student.name}</p>
              <p className="text-muted-foreground">
                {classData.name} - Section {classData.section}
              </p>
            </div>
          </div>
          
          <Tabs defaultValue="profile" className="w-full">
            <TabsList>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <div className="grid gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                  <p className="text-muted-foreground">No contact information available.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold">Guardian Information</h3>
                  <p className="text-muted-foreground">No guardian information available.</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="attendance">
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-primary" />
                        Total Classes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{stats.totalClasses}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
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
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <XCircle className="mr-2 h-4 w-4 text-red-500" />
                        Absent
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{stats.absent}</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold flex items-center">
                    Attendance Rate
                  </h3>
                  <CustomProgress value={stats.percentage} className="h-2" indicatorClassName="bg-green-500" />
                  <p className="text-sm text-muted-foreground mt-1">
                    {stats.percentage}%
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold">Attendance History</h3>
                  {sortedAttendance.length > 0 ? (
                    <div className="space-y-2">
                      {sortedAttendance.map((record) => (
                        <div key={record.date} className="flex items-center justify-between">
                          <p className="text-sm">
                            {record.date}
                          </p>
                          <Badge variant={record.present ? "success" : "destructive"}>
                            {record.present ? "Present" : "Absent"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No attendance records found.</p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Link to={`/attendance/${classData.id}`}>
            <Button variant="outline">View Class Attendance</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default StudentProfile;
