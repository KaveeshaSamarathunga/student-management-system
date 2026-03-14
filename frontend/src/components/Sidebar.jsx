import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Clock, BookOpen, FileText, LogOut } from 'lucide-react';
import api from '../apiClient';

const Sidebar = () => {
  const location = useLocation(); // To highlight the active link
  const adminName = localStorage.getItem('user') || 'KDU Admin';

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
      console.error('Failed to log logout event', err);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('session_id');
      window.location.href = '/';
    }
  };

  return (
    <aside className="w-64 bg-[#1E293B] text-white flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
          <BookOpen size={24} />
        </div>
        <div>
          <h1 className="font-bold text-sm leading-tight">SMS Admin</h1>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">Management Portal</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        <SidebarItem to="/dashboard" icon={<LayoutDashboard size={20}/>} label="Dashboard" active={location.pathname === '/dashboard'} />
        <SidebarItem to="/students" icon={<Users size={20}/>} label="Students" active={location.pathname === '/students'} />
        <SidebarItem to="/intakes" icon={<Clock size={20}/>} label="Intakes" active={location.pathname === '/intakes'} />
        <SidebarItem to="/courses" icon={<BookOpen size={20}/>} label="Courses" active={location.pathname === '/courses'} />
        <SidebarItem to="/logs" icon={<FileText size={20}/>} label="Logs" active={location.pathname === '/logs'} />
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 p-2">
          <div className="w-10 h-10 bg-slate-600 rounded-full overflow-hidden">
             <img src={`https://ui-avatars.com/api/?name=${adminName}&background=random`} alt="Admin" />
          </div>
          <div className="flex-1 overflow-hidden text-xs">
            <p className="font-bold truncate">{adminName}</p>
            <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 flex items-center gap-1 mt-1">
              <LogOut size={12} /> Logout
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

const SidebarItem = ({ icon, label, to, active }) => (
  <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-400 hover:bg-slate-800 hover:text-white'}`}>
    {icon} <span className="text-sm font-medium">{label}</span>
  </Link>
);

export default Sidebar;