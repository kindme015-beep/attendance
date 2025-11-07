import { Admin, User, AttendanceRecord } from '../types';

const ADMINS_KEY = 'attendance_admins';
const USERS_KEY = 'attendance_users';
const ATTENDANCE_KEY = 'attendance_records';

// --- Admins ---
export const getAdmins = (): Admin[] => {
    try {
        const admins = localStorage.getItem(ADMINS_KEY);
        return admins ? JSON.parse(admins) : [];
    } catch (error) {
        console.error("Failed to parse admins from localStorage", error);
        return [];
    }
};

export const addAdmin = (newAdmin: Admin): boolean => {
    const admins = getAdmins();
    if (admins.some(admin => admin.id === newAdmin.id)) {
        return false; // Admin already exists
    }
    admins.push(newAdmin);
    localStorage.setItem(ADMINS_KEY, JSON.stringify(admins));
    return true;
};

// --- Users ---
export const getUsers = (): User[] => {
    try {
        const users = localStorage.getItem(USERS_KEY);
        return users ? JSON.parse(users) : [];
    } catch (error) {
        console.error("Failed to parse users from localStorage", error);
        return [];
    }
};

export const addUser = (newUser: User): boolean => {
    const users = getUsers();
    if (users.some(user => user.id === newUser.id)) {
        return false; // User already exists
    }
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Add user to attendance sheet for today
    const records = getAttendanceRecords();
    const today = new Date().toISOString().split('T')[0];
    const todayRecordId = `${newUser.id}-${today}`;
    if (!records.some(rec => rec.id === todayRecordId)) {
        records.push({
            id: todayRecordId,
            userId: newUser.id,
            date: today,
            inTime: null,
            outTime: null,
            flagged: false,
            durationHours: null,
            notes: null,
        });
        localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
    }

    return true;
};

export const updateUser = (oldId: string, updatedUser: User): { success: boolean; error?: string } => {
    const users = getUsers();
    const existingUserIndex = users.findIndex(u => u.id === oldId);

    if (existingUserIndex === -1) {
        return { success: false, error: "User not found." };
    }

    // Check if new ID is already taken by another user
    if (oldId !== updatedUser.id && users.some((u, index) => u.id === updatedUser.id && index !== existingUserIndex)) {
        return { success: false, error: "New User ID is already in use." };
    }
    
    // Update user in users array
    users[existingUserIndex] = updatedUser;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // If ID changed, update all attendance records for that user
    if (oldId !== updatedUser.id) {
        let records = getAttendanceRecords();
        records.forEach(rec => {
            if (rec.userId === oldId) {
                rec.userId = updatedUser.id;
                rec.id = `${updatedUser.id}-${rec.date}`;
            }
        });
        localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
    }

    return { success: true };
};

export const deleteUser = (userId: string): void => {
    // Delete user from users list
    let users = getUsers();
    users = users.filter(u => u.id !== userId);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Delete all attendance records for that user
    let records = getAttendanceRecords();
    records = records.filter(r => r.userId !== userId);
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
};


// --- Attendance ---
export const getAttendanceRecords = (): AttendanceRecord[] => {
     try {
        const records = localStorage.getItem(ATTENDANCE_KEY);
        return records ? JSON.parse(records) : [];
    } catch (error) {
        console.error("Failed to parse attendance from localStorage", error);
        return [];
    }
};

export const updateAttendanceRecord = (updatedRecord: AttendanceRecord): void => {
    let records = getAttendanceRecords();
    const recordIndex = records.findIndex(rec => rec.id === updatedRecord.id);
    if (recordIndex > -1) {
        records[recordIndex] = updatedRecord;
    } else {
        records.push(updatedRecord);
    }
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
};