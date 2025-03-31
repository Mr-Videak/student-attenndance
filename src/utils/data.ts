
import { toast } from "@/components/ui/sonner";

export type Student = {
  id: string;
  rollNumber: string;
  name: string;
  section: string;
  batch: string;
  avatar?: string;
};

export type Class = {
  id: string;
  name: string;
  section: string;
  batch: string;
  students: Student[];
};

export type AttendanceRecord = {
  id: string;
  classId: string;
  date: string;
  presentStudents: string[]; // roll numbers
};

// Generate a list of students based on roll number ranges
export const generateStudentsFromRollNumbers = (
  ranges: { start: string; end: string }[],
  classSection: string,
  batch: string
): Student[] => {
  const students: Student[] = [];
  
  // Helper function to increment roll number
  const incrementRollNumber = (rollNumber: string): string => {
    // If the roll number ends with a letter
    if (rollNumber.match(/[A-Za-z]$/)) {
      const prefix = rollNumber.slice(0, -1);
      const lastChar = rollNumber.slice(-1);
      const nextChar = String.fromCharCode(lastChar.charCodeAt(0) + 1);
      return prefix + nextChar;
    } 
    // If it's a numeric roll number
    else {
      const numericPart = parseInt(rollNumber.match(/\d+$/)?.[0] || "0", 10);
      const prefix = rollNumber.replace(/\d+$/, "");
      return prefix + (numericPart + 1).toString().padStart(rollNumber.match(/\d+$/)?.[0].length || 0, "0");
    }
  };
  
  // Function to check if rollNumber1 <= rollNumber2
  const isLessOrEqual = (rollNumber1: string, rollNumber2: string): boolean => {
    // Extract numeric and alphabetic parts
    const isAlphaEnd1 = rollNumber1.match(/[A-Za-z]$/) !== null;
    const isAlphaEnd2 = rollNumber2.match(/[A-Za-z]$/) !== null;
    
    // If format is different, lexicographic comparison should work for our case
    if (isAlphaEnd1 !== isAlphaEnd2) {
      return rollNumber1 <= rollNumber2;
    }
    
    // For numeric endings
    if (!isAlphaEnd1) {
      const prefix1 = rollNumber1.replace(/\d+$/, "");
      const prefix2 = rollNumber2.replace(/\d+$/, "");
      
      if (prefix1 !== prefix2) {
        return prefix1 <= prefix2;
      }
      
      const num1 = parseInt(rollNumber1.match(/\d+$/)?.[0] || "0", 10);
      const num2 = parseInt(rollNumber2.match(/\d+$/)?.[0] || "0", 10);
      return num1 <= num2;
    }
    
    // For alphabetic endings
    const prefix1 = rollNumber1.slice(0, -1);
    const prefix2 = rollNumber2.slice(0, -1);
    
    if (prefix1 !== prefix2) {
      return prefix1 <= prefix2;
    }
    
    const char1 = rollNumber1.slice(-1);
    const char2 = rollNumber2.slice(-1);
    return char1 <= char2;
  };
  
  // Generate students for each range
  ranges.forEach(({ start, end }) => {
    let currentRoll = start;
    let id = 1;
    
    while (isLessOrEqual(currentRoll, end)) {
      students.push({
        id: `student-${currentRoll}`,
        rollNumber: currentRoll,
        name: `Student ${currentRoll}`,
        section: classSection,
        batch: batch,
        avatar: `/placeholder.svg`
      });
      
      // Move to next roll number
      currentRoll = incrementRollNumber(currentRoll);
      id++;
    }
  });
  
  return students;
};

// Local Storage keys
const CLASSES_STORAGE_KEY = 'attendance-app-classes';
const ATTENDANCE_STORAGE_KEY = 'attendance-app-attendance';

// Load data from localStorage
export const loadClasses = (): Class[] => {
  try {
    const savedClasses = localStorage.getItem(CLASSES_STORAGE_KEY);
    return savedClasses ? JSON.parse(savedClasses) : [];
  } catch (error) {
    console.error('Failed to load classes from localStorage:', error);
    return [];
  }
};

export const saveClasses = (classes: Class[]): void => {
  try {
    localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(classes));
  } catch (error) {
    console.error('Failed to save classes to localStorage:', error);
    toast.error('Failed to save class data');
  }
};

export const loadAttendanceRecords = (): AttendanceRecord[] => {
  try {
    const savedRecords = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
    return savedRecords ? JSON.parse(savedRecords) : [];
  } catch (error) {
    console.error('Failed to load attendance records from localStorage:', error);
    return [];
  }
};

export const saveAttendanceRecords = (records: AttendanceRecord[]): void => {
  try {
    localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error('Failed to save attendance records to localStorage:', error);
    toast.error('Failed to save attendance data');
  }
};

// Default class data with predefined roll number ranges
export const generateDefaultClasses = (): Class[] => {
  const defaultClasses: Class[] = [
    {
      id: 'class-1',
      name: 'Computer Science',
      section: 'A',
      batch: '2023',
      students: generateStudentsFromRollNumbers(
        [
          { start: '23BQ1A4755', end: '23BQ1A4799' },
          { start: '23BQ1A47A0', end: '23BQ1A47A7' }
        ],
        'A',
        '2023'
      )
    },
    {
      id: 'class-2',
      name: 'Information Technology',
      section: 'B',
      batch: '2024',
      students: generateStudentsFromRollNumbers(
        [
          { start: '24BQ5A4708', end: '24BQ5A4714' }
        ],
        'B',
        '2024'
      )
    }
  ];
  
  return defaultClasses;
};

// Initialize the app with default data if none exists
export const initializeAppData = (): void => {
  const existingClasses = loadClasses();
  
  if (existingClasses.length === 0) {
    const defaultClasses = generateDefaultClasses();
    saveClasses(defaultClasses);
  }
};
