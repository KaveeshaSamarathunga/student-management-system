import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import api from '../apiClient';

const IntakeStudents = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [intake, setIntake] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchIntakeStudents = async () => {
      try {
        const response = await api.get(`/api/intakes/${id}/students`);
        setIntake(response.data.intake);
        setStudents(response.data.students || []);
        setError('');
      } catch (err) {
        console.error('Error fetching intake students:', err);
        setError(err?.response?.data?.error || 'Failed to load student list.');
      } finally {
        setLoading(false);
      }
    };

    fetchIntakeStudents();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 bg-[#F8F9FB] p-8 font-poppins">
        <div className="max-w-6xl mx-auto text-center font-bold text-[#1D1D47]">
          Loading student list...
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#F8F9FB] p-8 font-poppins overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <nav className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              Management / Intakes / Student List
            </nav>
            <h1 className="text-3xl font-bold text-[#1D1D47]">
              {intake?.name || 'Intake'} Student List
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              View all students currently assigned to this intake.
            </p>
          </div>

          <button
            onClick={() => navigate('/intakes')}
            className="bg-white border border-gray-200 text-[#1D1D47] px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-50"
          >
            Back to Intakes
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold text-[#1D1D47]">
              <Users size={18} className="text-[#3F3D8F]" />
              Assigned Students
            </h2>
            <span className="text-sm font-bold text-[#3F3D8F]">
              {students.length} students
            </span>
          </div>

          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[11px] uppercase tracking-widest text-gray-400 font-bold">
              <tr>
                <th className="px-8 py-4">Student ID</th>
                <th className="px-8 py-4">Full Name</th>
                <th className="px-8 py-4">Email</th>
                <th className="px-8 py-4">Mobile</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-12 text-center text-sm text-gray-400 font-medium">
                    No students are assigned to this intake yet.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5 text-sm font-bold text-[#3F3D8F]">
                      {student.student_id}
                    </td>
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
                    <td className="px-8 py-5 text-sm text-gray-500 font-medium">
                      {student.email || 'Not set'}
                    </td>
                    <td className="px-8 py-5 text-sm text-gray-500 font-medium">
                      {student.mobile_number || 'Not set'}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => navigate(`/students/${student.id}`)}
                        className="text-xs font-bold text-[#3F3D8F] hover:underline"
                      >
                        View Profile &gt;
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="px-8 py-4 bg-white border-t border-gray-50 flex justify-between items-center text-[11px] font-bold text-gray-400">
            <span>Showing 1 to {students.length} of {students.length} students</span>
            <div className="flex gap-2">
              <button className="p-1 border border-gray-100 rounded bg-gray-50 text-gray-300">
                <ChevronLeft size={16} />
              </button>
              <button className="p-1 border border-gray-100 rounded hover:bg-gray-50 transition-all">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntakeStudents;