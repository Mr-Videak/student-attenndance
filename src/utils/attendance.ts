import { AttendanceRecord, Class, Student, loadAttendanceRecords, saveAttendanceRecords } from "./data";

// Format date to YYYY-MM-DD
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Get the current date formatted
export const getCurrentDate = (): string => {
  return formatDate(new Date());
};

// Create a new attendance record
export const createAttendanceRecord = (
  classId: string,
  date: string,
  presentStudents: string[]
): AttendanceRecord => {
  return {
    id: `attendance-${classId}-${date}`,
    classId,
    date,
    presentStudents,
  };
};

// Save an attendance record
export const saveAttendanceRecord = (record: AttendanceRecord): void => {
  const records = loadAttendanceRecords();
  
  // Check if a record for this class and date already exists
  const existingIndex = records.findIndex(
    (r) => r.classId === record.classId && r.date === record.date
  );
  
  if (existingIndex >= 0) {
    // Update existing record
    records[existingIndex] = record;
  } else {
    // Add new record
    records.push(record);
  }
  
  saveAttendanceRecords(records);
};

// Get an attendance record for a specific class and date
export const getAttendanceRecord = (
  classId: string,
  date: string
): AttendanceRecord | undefined => {
  const records = loadAttendanceRecords();
  return records.find((r) => r.classId === classId && r.date === date);
};

// Get all attendance records for a class
export const getClassAttendanceRecords = (classId: string): AttendanceRecord[] => {
  const records = loadAttendanceRecords();
  return records.filter((r) => r.classId === classId);
};

// Get all attendance records for a student
export const getStudentAttendanceRecords = (
  rollNumber: string,
  classId: string
): { date: string; present: boolean }[] => {
  const records = loadAttendanceRecords();
  const classRecords = records.filter((r) => r.classId === classId);
  
  return classRecords.map((record) => ({
    date: record.date,
    present: record.presentStudents.includes(rollNumber),
  }));
};

// Calculate attendance statistics for a student
export const calculateStudentAttendanceStats = (
  rollNumber: string,
  classId: string
): {
  totalClasses: number;
  present: number;
  absent: number;
  percentage: number;
} => {
  const records = getStudentAttendanceRecords(rollNumber, classId);
  const totalClasses = records.length;
  const present = records.filter((r) => r.present).length;
  const absent = totalClasses - present;
  const percentage = totalClasses > 0 ? (present / totalClasses) * 100 : 0;
  
  return {
    totalClasses,
    present,
    absent,
    percentage: Math.round(percentage * 100) / 100,
  };
};

// Get list of absentees for a specific class and date
export const getAbsenteesList = (
  classObj: Class,
  date: string
): Student[] => {
  const record = getAttendanceRecord(classObj.id, date);
  
  if (!record) {
    return classObj.students; // If no record, all students are considered absent
  }
  
  return classObj.students.filter(
    (student) => !record.presentStudents.includes(student.rollNumber)
  );
};

// Format attendance data for modern minimalistic WhatsApp report
export const formatMinimalisticAttendanceReport = (
  classObj: Class,
  students: Student[],
  presentStudentRolls: string[],
  date: string
): string => {
  const presentStudents = students.filter(student => 
    presentStudentRolls.includes(student.rollNumber)
  );
  
  const absentStudents = students.filter(student => 
    !presentStudentRolls.includes(student.rollNumber)
  );
  
  const presentCount = presentStudents.length;
  const totalCount = students.length;
  const percentage = Math.round((presentCount / totalCount) * 100);
  
  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  
  let message = `Attendance Report\n`;
  message += `📆 ${formattedDate}\n`;
  message += `📚 ${classObj.name} - ${classObj.section} | 🎓 Batch: ${classObj.batch}\n\n`;
  
  if (absentStudents.length > 0) {
    message += `❌ Absentees (${absentStudents.length}/${totalCount})\n`;
    const absentRollNumbers = absentStudents.map(s => s.rollNumber).join('\n');
    message += absentRollNumbers;
  } else {
    message += `✅ All students present!`;
  }
  
  message += `\n\n📊 Attendance: ${percentage}%`;
  
  return message;
};

// Get formatted date string for display
export const getFormattedDateString = (date: string): string => {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short', 
    day: 'numeric'
  });
};
