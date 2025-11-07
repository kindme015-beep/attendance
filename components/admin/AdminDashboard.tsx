import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Admin, User, AttendanceRecord } from '../../types';
import { getUsers, addUser, getAttendanceRecords, updateUser, deleteUser } from '../../services/storageService';
import { generateAttendanceSummary } from '../../services/geminiService';

interface AdminDashboardProps {
  admin: Admin;
  onLogout: () => void;
}

type Tab = 'createUser' | 'userList' | 'attendance' | 'reports';

// --- Helper Components defined outside AdminDashboard ---

const CreateUserForm: React.FC<{onUserAdded: (user: User) => void}> = ({ onUserAdded }) => {
    const [newUserId, setNewUserId] = useState('');
    const [newUserPin, setNewUserPin] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!newUserId || !newUserPin) {
            setError('User ID and PIN are required.');
            return;
        }
        const newUser = { id: newUserId, pin: newUserPin };
        const wasAdded = addUser(newUser);
        if (wasAdded) {
            setSuccess(`User "${newUserId}" created successfully.`);
            onUserAdded(newUser);
            setNewUserId('');
            setNewUserPin('');
        } else {
            setError(`User ID "${newUserId}" already exists.`);
        }
    };
    
    return (
        <form onSubmit={handleCreateUser} className="space-y-4 max-w-md">
            {error && <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md">{error}</p>}
            {success && <p className="text-sm text-green-600 bg-green-100 p-2 rounded-md">{success}</p>}
            <div>
                <label className="block text-sm font-medium text-slate-700">New User ID</label>
                <input type="text" value={newUserId} onChange={e => setNewUserId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700">New User PIN</label>
                <input type="password" value={newUserPin} onChange={e => setNewUserPin(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Create User</button>
        </form>
    );
};

const UserList: React.FC<{users: User[], onEdit: (user: User) => void, onDelete: (user: User) => void}> = ({ users, onEdit, onDelete }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-slate-200">
            <thead className="bg-slate-100">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
                {users.map(user => (
                    <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{user.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                            <button onClick={() => onEdit(user)} className="text-indigo-600 hover:text-indigo-800 font-semibold">Edit</button>
                            <button onClick={() => onDelete(user)} className="text-red-600 hover:text-red-800 font-semibold">Delete</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const AttendanceSheetTable: React.FC<{records: AttendanceRecord[]}> = ({ records }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-slate-200">
            <thead className="bg-slate-100">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Clock In</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Clock Out</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Duration (Hrs)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Notes</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
                {records.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-10 text-slate-500">No records match the current filters.</td></tr>
                ) : (
                    records.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime() || a.userId.localeCompare(b.userId)).map(rec => (
                        <tr key={rec.id} className={rec.flagged ? 'bg-orange-50' : ''}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{rec.userId}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{rec.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{rec.inTime ? new Date(rec.inTime).toLocaleTimeString() : 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{rec.outTime ? new Date(rec.outTime).toLocaleTimeString() : 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{rec.durationHours?.toFixed(2) ?? 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-700 font-medium">{rec.notes}</td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    </div>
);

const ReportGenerator: React.FC<{records: AttendanceRecord[]}> = ({ records }) => {
    const [report, setReport] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateReport = async () => {
        setIsLoading(true);
        setReport('');
        const summary = await generateAttendanceSummary(records);
        setReport(summary);
        setIsLoading(false);
    };

    return (
        <div>
            <button onClick={handleGenerateReport} disabled={isLoading} className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:bg-slate-400">
                {isLoading ? 'Generating...' : 'Generate AI Summary'}
            </button>
            {report && (
                 <div className="mt-4 p-4 bg-slate-100 rounded-md border border-slate-200">
                    <h4 className="font-bold text-lg mb-2">Attendance Report</h4>
                    <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700">{report}</pre>
                </div>
            )}
        </div>
    );
};

const EditUserModal: React.FC<{user: User; onSave: () => void; onCancel: () => void;}> = ({ user, onSave, onCancel }) => {
    const [id, setId] = useState(user.id);
    const [pin, setPin] = useState(user.pin);
    const [error, setError] = useState('');

    const handleSave = () => {
        setError('');
        if (!id || !pin) {
            setError('ID and PIN cannot be empty.');
            return;
        }
        const result = updateUser(user.id, { id, pin });
        if (result.success) {
            onSave();
        } else {
            setError(result.error || 'An unknown error occurred.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">Edit User</h3>
                {error && <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md mb-4">{error}</p>}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">User ID</label>
                        <input type="text" value={id} onChange={e => setId(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">User PIN</label>
                        <input type="password" value={pin} onChange={e => setPin(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                    <button onClick={onCancel} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Save Changes</button>
                </div>
            </div>
        </div>
    );
};

const ConfirmDeleteModal: React.FC<{user: User; onConfirm: () => void; onCancel: () => void;}> = ({ user, onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-2">Confirm Deletion</h3>
            <p className="text-slate-600 mb-4">Are you sure you want to delete user "{user.id}"? This action will also remove all their attendance records and cannot be undone.</p>
            <div className="mt-6 flex justify-end space-x-2">
                <button onClick={onCancel} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Cancel</button>
                <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Delete User</button>
            </div>
        </div>
    </div>
);


// --- Main AdminDashboard Component ---

const AdminDashboard: React.FC<AdminDashboardProps> = ({ admin, onLogout }) => {
    const [activeTab, setActiveTab] = useState<Tab>('attendance');
    const [users, setUsers] = useState<User[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [userFilter, setUserFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    const fetchData = useCallback(() => {
        setUsers(getUsers());
        setAttendance(getAttendanceRecords());
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleUserAdded = () => {
        fetchData(); 
    };
    
    const handleSaveUser = () => {
        fetchData();
        setEditingUser(null);
    };

    const handleConfirmDelete = () => {
        if(deletingUser) {
            deleteUser(deletingUser.id);
            fetchData();
            setDeletingUser(null);
        }
    };

    const filteredAttendance = useMemo(() => {
        return attendance.filter(rec => {
            const userMatch = userFilter ? rec.userId === userFilter : true;
            const dateMatch = dateFilter ? rec.date === dateFilter : true;
            return userMatch && dateMatch;
        });
    }, [attendance, userFilter, dateFilter]);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'createUser':
                return (
                    <div>
                        <h3 className="text-2xl font-bold mb-4">Create New User</h3>
                        <CreateUserForm onUserAdded={handleUserAdded} />
                    </div>
                );
            case 'userList':
                return (
                    <div>
                        <h3 className="text-2xl font-bold mb-4">User List & Credentials</h3>
                        {users.length > 0 ? <UserList users={users} onEdit={setEditingUser} onDelete={setDeletingUser} /> : <p>No users created yet.</p>}
                    </div>
                );
            case 'attendance':
                return (
                    <div>
                        <div className="sm:flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-2xl font-bold">Attendance Spreadsheet</h3>
                                <p className="text-sm text-slate-500">Flagged entries are highlighted in orange.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
                                <select value={userFilter} onChange={e => setUserFilter(e.target.value)} className="border border-slate-300 rounded-md px-2 py-1">
                                    <option value="">All Users</option>
                                    {users.map(u => <option key={u.id} value={u.id}>{u.id}</option>)}
                                </select>
                                <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="border border-slate-300 rounded-md px-2 py-1"/>
                                <button onClick={() => {setUserFilter(''); setDateFilter('');}} className="text-sm text-indigo-600 hover:underline">Clear</button>
                            </div>
                        </div>
                        <AttendanceSheetTable records={filteredAttendance} />
                    </div>
                );
            case 'reports':
                return (
                    <div>
                        <h3 className="text-2xl font-bold mb-4">AI Powered Reports</h3>
                        <p className="text-sm text-slate-500 mb-4">Generate an analysis of the attendance data (uses current filters).</p>
                        <ReportGenerator records={filteredAttendance} />
                    </div>
                );
        }
    };

    return (
        <div className="container mx-auto">
            {editingUser && <EditUserModal user={editingUser} onSave={handleSaveUser} onCancel={() => setEditingUser(null)} />}
            {deletingUser && <ConfirmDeleteModal user={deletingUser} onConfirm={handleConfirmDelete} onCancel={() => setDeletingUser(null)} />}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
                <div>
                    <h2 className="text-3xl font-bold">Admin Panel</h2>
                    <p className="text-slate-500">Welcome, {admin.id}</p>
                </div>
                <button onClick={onLogout} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Logout</button>
            </div>
            
            <div className="flex border-b border-slate-200 mb-6">
                <TabButton title="Attendance" tabName="attendance" activeTab={activeTab} setActiveTab={setActiveTab} />
                <TabButton title="User List" tabName="userList" activeTab={activeTab} setActiveTab={setActiveTab} />
                <TabButton title="Create User" tabName="createUser" activeTab={activeTab} setActiveTab={setActiveTab} />
                <TabButton title="AI Reports" tabName="reports" activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
                {renderTabContent()}
            </div>
        </div>
    );
};

const TabButton: React.FC<{title: string, tabName: Tab, activeTab: Tab, setActiveTab: (tab: Tab) => void}> = ({ title, tabName, activeTab, setActiveTab }) => (
    <button onClick={() => setActiveTab(tabName)} className={`px-4 py-2 -mb-px border-b-2 text-sm font-medium transition-colors ${activeTab === tabName ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
        {title}
    </button>
);


export default AdminDashboard;