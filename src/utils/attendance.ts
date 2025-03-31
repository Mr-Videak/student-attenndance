
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

// Format attendance data for export/display
export const formatAttendanceReport = (
  classObj: Class,
  date: string
): string => {
  const absentees = getAbsenteesList(classObj, date);
  const absenteeRollNumbers = absentees.map((student) => student.rollNumber).join(', ');
  
  return `
Date: ${date}
Class Name: ${classObj.name}
Section: ${classObj.section}
Batch: ${classObj.batch}
Absentees: ${absenteeRollNumbers || 'None'}
  `.trim();
};
