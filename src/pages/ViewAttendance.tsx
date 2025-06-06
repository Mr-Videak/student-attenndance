import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Copy, Share } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import EmptyState from '@/components/ui/EmptyState';
import { formatMinimalisticAttendanceReport } from '@/utils/attendance';

const ViewAttendance = () => {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [attendanceRecord, setAttendanceRecord] = useState(null);
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchAttendanceData();
  }, [recordId]);
  
  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      
      const { data: recordData, error: recordError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('id', recordId)
        .single();
      
      if (recordError) throw recordError;
      setAttendanceRecord(recordData);
      
      if (recordData?.class_id) {
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('*')
          .eq('id', recordData.class_id)
          .single();
        
        if (classError) throw classError;
        setClassData(classData);
        
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('*')
          .eq('class_id', recordData.class_id)
          .order('roll_number', { ascending: true });
        
        if (studentsError) throw studentsError;
        setStudents(studentsData || []);
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load attendance data.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const copyAttendanceToClipboard = () => {
    if (!attendanceRecord || !classData || !students.length) return;
    
    const message = formatMinimalisticAttendanceReport(
      classData,
      students,
      attendanceRecord.present_students,
      attendanceRecord.date
    );
    
    navigator.clipboard.writeText(message);
    
    toast({
      title: "Copied to clipboard",
      description: "Attendance report has been copied to clipboard.",
    });
  };
  
  const shareAttendanceOnWhatsApp = () => {
    if (!attendanceRecord || !classData || !students.length) return;
    
    const message = formatMinimalisticAttendanceReport(
      classData,
      students,
      attendanceRecord.present_students,
      attendanceRecord.date
    );
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container max-w-6xl px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!attendanceRecord || !classData) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container max-w-6xl px-4 py-8">
          <EmptyState
            title="Record Not Found"
            description="The attendance record you're looking for doesn't exist."
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
  
  const date = new Date(attendanceRecord.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const presentStudents = students.filter(student => 
    attendanceRecord.present_students.includes(student.roll_number)
  );
  
  const absentStudents = students.filter(student => 
    !attendanceRecord.present_students.includes(student.roll_number)
  );
  
  const attendancePercentage = Math.round((presentStudents.length / students.length) * 100) || 0;
  
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
          <h1 className="text-3xl font-bold">Attendance Record</h1>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle>{classData.name}</CardTitle>
                <CardDescription>
                  Section {classData.section} | Batch {classData.batch}
                </CardDescription>
              </div>
              <div>
                <CardTitle className="text-right">{date}</CardTitle>
                <CardDescription className="text-right">
                  {presentStudents.length} / {students.length} present ({attendancePercentage}%)
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={copyAttendanceToClipboard}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Report
                </Button>
                <Button size="sm" onClick={shareAttendanceOnWhatsApp}>
                  <Share className="h-4 w-4 mr-2" />
                  Share on WhatsApp
                </Button>
              </div>
              
              <div className="h-3 bg-muted rounded-full overflow-hidden mb-6">
                <div 
                  className={`h-full rounded-full ${
                    attendancePercentage >= 75 
                    ? 'bg-success' 
                    : attendancePercentage >= 50 
                      ? 'bg-warning' 
                      : 'bg-destructive'}`}
                  style={{ width: `${attendancePercentage}%` }}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center text-success">
                    <span className="inline-block w-3 h-3 bg-success rounded-full mr-2"></span>
                    Present Students ({presentStudents.length})
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Roll No.</TableHead>
                        <TableHead>Name</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {presentStudents.length > 0 ? (
                        presentStudents.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.roll_number}</TableCell>
                            <TableCell>{student.name}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center text-muted-foreground">
                            No present students
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2 flex items-center text-destructive">
                    <span className="inline-block w-3 h-3 bg-destructive rounded-full mr-2"></span>
                    Absent Students ({absentStudents.length})
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Roll No.</TableHead>
                        <TableHead>Name</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {absentStudents.length > 0 ? (
                        absentStudents.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.roll_number}</TableCell>
                            <TableCell>{student.name}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center text-muted-foreground">
                            No absent students
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ViewAttendance;
