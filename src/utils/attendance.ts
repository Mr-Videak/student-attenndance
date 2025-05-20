
// Get an attendance record for a specific class and date
export const getAttendanceRecord = (
  classId: string,
  date: string
): AttendanceRecord | undefined => {
  const records = loadAttendanceRecords();
  return records.find((r) => r.classId === classId && r.date === date);
};
