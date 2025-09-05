
import { format } from 'date-fns';
import { loadAttendanceRecords } from './data';

// Import AttendanceRecord from data.ts to avoid duplication
import type { AttendanceRecord } from './data';

// Get current date in YYYY-MM-DD format
export const getCurrentDate = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

// Get an attendance record for a specific class and date
export const getAttendanceRecord = (
  classId: string,
  date: string
): AttendanceRecord | undefined => {
  const records = loadAttendanceRecords();
  return records.find((r) => r.classId === classId && r.date === date);
};

// Get attendance records for a specific student
export const getStudentAttendanceRecords = (
  rollNumber: string,
  classId: string
): {date: string; present: boolean}[] => {
  const records = loadAttendanceRecords();
  return records
    .filter(record => record.classId === classId)
    .map(record => ({
      date: record.date,
      present: record.presentStudents.includes(rollNumber)
    }));
};

// Calculate attendance statistics for a specific student
export const calculateStudentAttendanceStats = (
  rollNumber: string,
  classId: string
) => {
  const records = getStudentAttendanceRecords(rollNumber, classId);
  
  const totalClasses = records.length;
  const present = records.filter(record => record.present).length;
  const absent = totalClasses - present;
  const percentage = totalClasses > 0 ? Math.round((present / totalClasses) * 100) : 0;
  
  return {
    totalClasses,
    present,
    absent,
    percentage
  };
};

// Format attendance report for WhatsApp sharing in a minimalistic style
export const formatMinimalisticAttendanceReport = (
  classData: { name: string; section: string; batch: string },
  students: { roll_number: string; name: string }[],
  presentStudentIds: string[],
  date: string
): string => {
  // Convert date string to Date object and format
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  
  // Calculate attendance percentage
  const totalStudents = students.length;
  const presentCount = presentStudentIds.length;
  const absentCount = totalStudents - presentCount;
  const attendancePercentage = Math.round((presentCount / totalStudents) * 100) || 0;
  
  // Get list of absent students
  const absentStudents = students
    .filter(student => !presentStudentIds.includes(student.roll_number))
    .map(student => student.roll_number);
  
  // Build the message
  let report = `📆 ${formattedDate}\n`;
  report += `📚 ${classData.name} - ${classData.section} | 🎓 Batch: ${classData.batch}\n\n`;
  
  if (absentStudents.length > 0) {
    report += `❌ Absentees (${absentCount}/${totalStudents})\n`;
    report += absentStudents.join('\n');
    report += '\n\n';
  } else {
    report += `✅ All students present\n\n`;
  }
  
  report += `📊 Attendance: ${attendancePercentage}%`;
  
  return report;
};

