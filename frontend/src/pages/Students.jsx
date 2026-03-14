import React, { useState, useEffect } from 'react';
import api from '../apiClient';
import { Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get('/api/students');
        setStudents(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching students:", err);
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  return (
    <div className="flex-1 bg-[#F8F9FB] p-8 font-poppins">
      <div className="max-w-6xl mx-auto">
        {/* Top Search Bar Area */}
        <div className="flex justify-between items-center mb-8">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by Unique ID"
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-lg text-sm focus:outline-none shadow-sm"
            />
          </div>
          <Link to="/register-student">
            <button className="bg-[#1D1D47] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-black transition-all cursor-pointer">
              <Plus size={18} /> Add New Student
            </button>
          </Link>
        </div>

        {/* Directory Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1D1D47]">Student Directory</h1>
          <p className="text-gray-400 text-sm">Manage and track academic progress across all intakes.</p>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[11px] uppercase tracking-widest text-gray-400 font-bold">
              <tr>
                <th className="px-8 py-4">Student ID</th>
                <th className="px-8 py-4">Full Name</th>
                <th className="px-8 py-4">Intake</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-5 text-sm font-bold text-[#3F3D8F]">{student.student_id}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://ui-avatars.com/api/?name=${student.name}&background=random`}
                        className="w-8 h-8 rounded-full"
                        alt="Avatar"
                      />
                      <span className="text-sm font-bold text-gray-700">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-gray-500 font-medium">{student.intake}</td>
                  <td className="px-8 py-5 text-right">
                    <button
                      onClick={() => navigate(`/students/${student.id}`)}
                      className="text-xs font-bold text-[#3F3D8F] hover:underline"
                    >
                      View Profile &gt;
                    </button>                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Footer */}
          <div className="px-8 py-4 bg-white border-t border-gray-50 flex justify-between items-center text-[11px] font-bold text-gray-400">
            <span>Showing 1 to {students.length} of {students.length} students</span>
            <div className="flex gap-2">
              <button className="p-1 border border-gray-100 rounded bg-gray-50 text-gray-300"><ChevronLeft size={16} /></button>
              <button className="p-1 border border-gray-100 rounded hover:bg-gray-50 transition-all"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Students;