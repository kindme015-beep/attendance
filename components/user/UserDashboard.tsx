import React, { useState, useEffect, useCallback } from 'react';
import type { User, AttendanceRecord } from '../../types';
import { getAttendanceRecords, updateAttendanceRecord } from '../../services/storageService';

interface UserDashboardProps {
  user: User;
  onLogout: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, onLogout }) => {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentRecord, setCurrentRecord] = useState<AttendanceRecord | null>(null);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  // For manual entry on past dates
  const [manualInTime, setManualInTime] = useState('');
  const [manualOutTime, setManualOutTime] = useState('');

  const getRecordForDate = useCallback((dateStr: string): AttendanceRecord => {
    const records = getAttendanceRecords();
    const recordId = `${user.id}-${dateStr}`;
    let record = records.find(r => r.id === recordId);
    
    if (!record) {
      record = {
        id: recordId,
        userId: user.id,
        date: dateStr,
        inTime: null,
        outTime: null,
        flagged: false,
        durationHours: null,
        notes: null,
      };
      // Create the record if it doesn't exist for the selected date
      updateAttendanceRecord(record);
    }
    return record;
  }, [user.id]);

  useEffect(() => {
    const record = getRecordForDate(selectedDate);
    setCurrentRecord(record);
    // When date changes, populate manual time inputs from the existing record
    setManualInTime(record.inTime ? new Date(record.inTime).toTimeString().substring(0, 5) : '');
    setManualOutTime(record.outTime ? new Date(record.outTime).toTimeString().substring(0, 5) : '');
  }, [getRecordForDate, selectedDate]);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };
  
  const handleClockIn = () => {
    if (currentRecord?.inTime) {
      showMessage('You have already clocked in today.', 'error');
      return;
    }
    const now = new Date().toISOString();
    const updatedRecord = { ...getRecordForDate(selectedDate), inTime: now };
    updateAttendanceRecord(updatedRecord);
    setCurrentRecord(updatedRecord);
    showMessage('Clocked in successfully!', 'success');
  };

  const handleClockOut = () => {
    const latestRecord = getRecordForDate(selectedDate);
    if (!latestRecord.inTime) {
      showMessage('You must clock in before clocking out.', 'error');
      return;
    }
    if (latestRecord.outTime) {
      showMessage('You have already clocked out today.', 'error');
      return;
    }

    const now = new Date();
    const inTime = new Date(latestRecord.inTime);
    const durationMs = now.getTime() - inTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    const isFlagged = durationHours > 20;
    const noteText = isFlagged ? 'Shift exceeded 20 hours.' : null;

    const updatedRecord = { 
      ...latestRecord, 
      outTime: now.toISOString(),
      durationHours: durationHours,
      flagged: isFlagged,
      notes: noteText
    };
    updateAttendanceRecord(updatedRecord);
    setCurrentRecord(updatedRecord);
    showMessage('Clocked out successfully!', 'success');
  };

  const handleManualSave = () => {
    if (manualOutTime && !manualInTime) {
        showMessage('Cannot set a clock out time without a clock in time.', 'error');
        return;
    }
    if (manualInTime && manualOutTime && manualOutTime <= manualInTime) {
        showMessage('Clock out time must be after clock in time.', 'error');
        return;
    }

    const inTimeISO = manualInTime ? new Date(`${selectedDate}T${manualInTime}:00`).toISOString() : null;
    const outTimeISO = manualOutTime ? new Date(`${selectedDate}T${manualOutTime}:00`).toISOString() : null;
    
    let durationHours = null;
    let isFlagged = true; // Always flag manual edits
    let noteText = 'Manually edited by user.';

    if (inTimeISO && outTimeISO) {
        const durationMs = new Date(outTimeISO).getTime() - new Date(inTimeISO).getTime();
        durationHours = durationMs / (1000 * 60 * 60);
        if (durationHours > 20) {
           noteText = 'Manually edited. Shift exceeded 20 hours.';
        }
    }

    const updatedRecord = {
        ...getRecordForDate(selectedDate),
        inTime: inTimeISO,
        outTime: outTimeISO,
        durationHours,
        flagged: isFlagged,
        notes: noteText,
    };

    updateAttendanceRecord(updatedRecord);
    setCurrentRecord(updatedRecord);
    showMessage(`Attendance for ${selectedDate} has been saved and flagged for review.`, 'success');
  };

  const isPastDate = selectedDate < today;
  const hasClockedIn = !!currentRecord?.inTime;
  const hasClockedOut = !!currentRecord?.outTime;

  return (
    <div className="bg-white p-8 rounded-xl shadow-2xl text-center">
      <div className="flex justify-between items-start">
        <div className="text-left">
            <h2 className="text-3xl font-bold text-slate-800">Welcome, {user.id}</h2>
            <p className="text-slate-500">Manage your attendance.</p>
        </div>
        <button onClick={onLogout} className="text-sm px-3 py-1 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300">Logout</button>
      </div>

      <div className="mt-6">
        <label htmlFor="attendance-date" className="block text-sm font-medium text-slate-700 text-left mb-1">Select Date</label>
        <input 
            type="date" 
            id="attendance-date"
            value={selectedDate}
            max={today}
            onChange={e => setSelectedDate(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-md"
        />
      </div>

      <div className="mt-6">
        {message && (
          <p className={`p-3 rounded-md mb-6 text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </p>
        )}
        
        {isPastDate ? (
            <div className="space-y-4 text-left">
                <h3 className="text-lg font-semibold text-slate-800 text-center mb-4">Editing Past Attendance for {selectedDate}</h3>
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700">Clock In Time</label>
                        <input type="time" value={manualInTime} onChange={e => setManualInTime(e.target.value)} className="mt-1 w-full p-2 border border-slate-300 rounded-md"/>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700">Clock Out Time</label>
                        <input type="time" value={manualOutTime} onChange={e => setManualOutTime(e.target.value)} className="mt-1 w-full p-2 border border-slate-300 rounded-md"/>
                    </div>
                </div>
                <button onClick={handleManualSave} className="w-full mt-2 py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                    Save Changes
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleClockIn}
                disabled={hasClockedIn}
                className="w-full py-4 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                Clock In
              </button>
              <button
                onClick={handleClockOut}
                disabled={!hasClockedIn || hasClockedOut}
                className="w-full py-4 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                Clock Out
              </button>
            </div>
        )}

        {currentRecord?.inTime && (
            <div className="mt-8 text-left bg-slate-50 p-4 rounded-lg">
                <h4 className="font-bold text-slate-700 mb-2">Activity for {selectedDate}</h4>
                <p className="text-sm text-slate-600">
                    <strong>Clock In:</strong> {new Date(currentRecord.inTime).toLocaleTimeString()}
                </p>
                {currentRecord.outTime && (
                    <p className="text-sm text-slate-600">
                        <strong>Clock Out:</strong> {new Date(currentRecord.outTime).toLocaleTimeString()}
                    </p>
                )}
                 {currentRecord.durationHours !== null && (
                    <p className="text-sm text-slate-600 mt-2">
                        <strong>Total Duration:</strong> {currentRecord.durationHours.toFixed(2)} hours
                    </p>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;