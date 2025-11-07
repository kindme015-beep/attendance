export interface Admin {
  id: string;
  pin: string;
}

export interface User {
  id:string;
  pin: string;
}

export interface AttendanceRecord {
  id: string; 
  userId: string;
  date: string; 
  inTime: string | null;
  outTime: string | null;
  flagged: boolean;
  durationHours: number | null;
  notes: string | null;
}