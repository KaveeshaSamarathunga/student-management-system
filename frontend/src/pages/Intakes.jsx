import React, { useState, useEffect } from 'react';
import api from '../apiClient';
import { Calendar, CheckSquare, Book } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Intakes = () => {
  const [intakes, setIntakes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedIntake, setSelectedIntake] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [assigning, setAssigning] = useState(false);
  const [loadingAssigned, setLoadingAssigned] = useState(false);
  const [assignMessage, setAssignMessage] = useState('');
  const [assignError, setAssignError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch Intakes and Courses from your Flask backend
    const fetchData = async () => {
      try {
        const [intakeRes, courseRes] = await Promise.all([
          api.get('/api/intakes'),
          api.get('/api/courses')
        ]);
        setIntakes(intakeRes.data);
        setCourses(courseRes.data);
      } catch (err) {
        console.error("Error fetching intake data", err);
      }
    };
    fetchData();
  }, []);

  const toggleCourse = (courseId) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    );
  };

  const handleIntakeSelect = async (intake) => {
    setSelectedIntake(intake);
    setAssignMessage('');
    setAssignError('');
    setLoadingAssigned(true);

    try {
      const response = await api.get(`/api/intakes/${intake.id}/courses`);
      setSelectedCourses(response.data.course_ids || []);
    } catch (err) {
      setSelectedCourses([]);
      setAssignError('Failed to load assigned courses for this intake.');
    } finally {
      setLoadingAssigned(false);
    }
  };

  const handleAssignCourses = async () => {
    if (!selectedIntake) {
      setAssignError('Please select an intake first.');
      return;
    }

    setAssigning(true);
    setAssignMessage('');
    setAssignError('');

    try {
      await api.put(`/api/intakes/${selectedIntake.id}/courses`, {
        course_ids: selectedCourses,
      });
      setAssignMessage('Courses assigned successfully.');
    } catch (err) {
      setAssignError(err?.response?.data?.error || 'Failed to assign courses.');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="flex-1 bg-[#F8F9FB] p-8 font-poppins overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <nav className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
          Management / Intake & Course Management
        </nav>
        <h1 className="text-3xl font-bold text-[#1D1D47] mb-8">Intake & Course Management</h1>

        {/* Active Intakes Card */}
        <section className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h2 className="flex items-center gap-2 font-bold text-[#1D1D47]">
              <Calendar size={18} className="text-[#3F3D8F]" /> Active Academic Intakes
            </h2>
            <button 
  onClick={() => navigate('/create-intake')}
  className="bg-[#FFB800] text-[#1D1D47] px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#E6A600]"
>
  Create Intake
</button>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
              <tr>
                <th className="px-6 py-4">Select</th>
                <th className="px-6 py-4">Intake Name</th>
                <th className="px-6 py-4">Start Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Capacity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {intakes.map((intake) => (
                <tr key={intake.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <input 
                      type="radio" 
                      name="intake_select" 
                      className="w-4 h-4 accent-[#3F3D8F]" 
                      checked={selectedIntake?.id === intake.id}
                      onChange={() => handleIntakeSelect(intake)}
                    />
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-700">{intake.name}</td>
                  <td className="px-6 py-4 text-gray-500">{intake.start_date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                      intake.status === 'Ongoing' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {intake.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 font-medium">{intake.enrolled} / {intake.capacity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Course Checklist Card */}
        <section className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8">
          <h2 className="flex items-center gap-2 font-bold text-[#1D1D47] mb-2">
            <CheckSquare size={18} className="text-[#3F3D8F]" /> Course Checklist
          </h2>
          <p className="text-gray-400 text-sm mb-8">
            Select courses from the catalog to assign to <span className="font-bold text-[#3F3D8F]">{selectedIntake?.name || 'an intake'}</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
            {courses.map((course) => (
              <div 
                key={course.id}
                onClick={() => toggleCourse(course.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                  selectedCourses.includes(course.id) ? 'border-[#3F3D8F] bg-indigo-50/30' : 'border-gray-50 bg-white'
                }`}
              >
                <div className={`w-5 h-5 rounded border flex items-center justify-center mt-1 ${
                  selectedCourses.includes(course.id) ? 'bg-[#3F3D8F] border-[#3F3D8F]' : 'bg-white border-gray-200'
                }`}>
                  {selectedCourses.includes(course.id) && <div className="w-2 h-2 bg-white rounded-sm" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800">{course.name}</h4>
                  <p className="text-[10px] text-gray-400 uppercase mt-1">{course.code} • {course.credits} Credits</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center border-t border-gray-50 pt-8">
            <p className="text-sm font-medium text-gray-500">
              {loadingAssigned ? (
                'Loading assigned courses...'
              ) : (
                <>
                  Selected: <span className="text-[#3F3D8F] font-bold">{selectedCourses.length} courses</span> for {selectedIntake?.name || '...'}
                </>
              )}
            </p>
            <div className="flex gap-4">
              <button onClick={() => setSelectedCourses([])} className="text-sm font-bold text-gray-400" disabled={loadingAssigned || assigning}>Clear Selection</button>
              <button
                onClick={handleAssignCourses}
                disabled={!selectedIntake || assigning || loadingAssigned}
                className="bg-[#FFB800] text-[#1D1D47] px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-amber-100 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Book size={18} /> {assigning ? 'Assigning...' : 'Assign Selected Courses to Intake'}
              </button>
            </div>
          </div>
          {assignError && <p className="text-sm text-red-600 mt-4">{assignError}</p>}
          {assignMessage && <p className="text-sm text-green-600 mt-4">{assignMessage}</p>}
        </section>
      </div>
    </div>
  );
};

export default Intakes;