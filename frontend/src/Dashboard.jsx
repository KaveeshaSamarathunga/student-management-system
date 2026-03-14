
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, BookOpen, Clock, FileText,
    Plus, Bell, LogOut, TrendingUp, AlertCircle
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import api from './apiClient';


const Dashboard = () => {
    const navigate = useNavigate();
    const adminName = localStorage.getItem('user');
    const [stats, setStats] = useState({ total_students: 0, active_batches: 0, total_courses: 0 });
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // If no user is found in localStorage, kick them back to Login
        if (!adminName) {
            navigate('/');
        }

        const fetchData = async () => {
            try {
                const statsRes = await api.get('/api/dashboard-stats');
                const logsRes = await api.get('/api/audit-logs', {
                    params: {
                        page: 1,
                        page_size: 5,
                        session_id: localStorage.getItem('session_id') || '',
                    },
                });

                setStats(statsRes.data);
                setLogs(logsRes.data.items || []);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching dashboard data", err);
                setLoading(false);
            }
        };

        
        fetchData();
    }, [adminName, navigate]);

    if (!adminName) return null; // Don't even render the page if not logged in

    return (
        <div className="flex h-screen bg-[#F3F4F6] font-poppins">
            

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
                    <h2 className="text-lg font-bold text-slate-800">Dashboard</h2>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <button className="bg-[#1E293B] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-black transition-all">
                            <Plus size={18} /> New Intake
                        </button>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard
                            label="Total Students"
                            value={stats.total_students}
                            change="+12% from last month"
                            icon={<Users className="text-indigo-600" />}
                            trend="up"
                        />
                        <StatCard
                            label="Active Batches"
                            value={stats.active_batches}
                            change="Currently in progress"
                            icon={<Clock className="text-blue-600" />}
                        />
                        <StatCard
                            label="Total Courses"
                            value={stats.total_courses}
                            change="2 require updates"
                            icon={<BookOpen className="text-slate-600" />}
                            warning
                        />
                    </div>

                    {/* Audit Logs Table */}
                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">Recent Audit Logs</h3>
                            <button className="text-xs font-bold text-indigo-600 hover:underline">View All Logs</button>
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#1E293B] text-white uppercase text-[10px] tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Action</th>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Timestamp</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {logs.length > 0 ? (
                                    logs.map((log, index) => (
                                        <LogRow
                                            key={index} // Unique ID for React to track the row
                                            action={log.action}
                                            user={log.user}
                                            time={log.timestamp}
                                            status={log.status}
                                        />
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-10 text-center text-gray-400">
                                            No recent activity found in the database.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </section>

                    {/* Bottom Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Chart Placeholder */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4">Course Enrollment Trends</h3>
                            <div className="h-64 bg-slate-50 rounded-xl flex items-end justify-between px-8 py-4">
                                {[40, 70, 60, 90, 80, 45, 55].map((h, i) => (
                                    <div key={i} className="w-12 bg-indigo-200 rounded-t-lg hover:bg-indigo-500 transition-all cursor-pointer" style={{ height: `${h}%` }}></div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <ActionButton icon={<Plus size={18} />} label="Add Student" />
                                <ActionButton icon={<FileText size={18} />} label="View Logs" />
                                <ActionButton icon={<TrendingUp size={18} />} label="Export Data" />
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

// --- Helper Components ---

const SidebarItem = ({ icon, label, active = false }) => (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-400 hover:bg-slate-800 hover:text-white'}`}>
        {icon} <span className="text-sm font-medium">{label}</span>
    </div>
);

const StatCard = ({ label, value, change, icon, trend, warning }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5">
        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center">
            {icon}
        </div>
        <div>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{label}</p>
            <h4 className="text-2xl font-black text-slate-800">{value}</h4>
            <p className={`text-[10px] mt-1 flex items-center gap-1 font-medium ${warning ? 'text-amber-500' : 'text-emerald-500'}`}>
                {trend === 'up' && <TrendingUp size={12} />}
                {warning && <AlertCircle size={12} />}
                {change}
            </p>
        </div>
    </div>
);

const LogRow = ({ action, user, time, status }) => (
    <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4 font-medium text-slate-700">{action}</td>
        <td className="px-6 py-4 text-gray-500">{user}</td>
        <td className="px-6 py-4 text-gray-400 text-xs">{time}</td>
        <td className="px-6 py-4">
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${status === 'Success' || status === 'SUCCESS' || status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                {status}
            </span>
        </td>
    </tr>
);

const ActionButton = ({ icon, label }) => (
    <button className="w-full flex items-center justify-center gap-3 py-3 border-2 border-dashed border-gray-100 rounded-xl text-gray-500 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all font-bold text-sm">
        {icon} {label}
    </button>
);

export default Dashboard;