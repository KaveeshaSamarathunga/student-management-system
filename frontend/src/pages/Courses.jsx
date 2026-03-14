import React, { useState, useEffect } from 'react';
import api from '../apiClient';
import { BookOpen, Plus, Trash2, Search, AlertCircle } from 'lucide-react';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ code: '', name: '', credits: 0, description: '' });
  const [error, setError] = useState(null);

  const filteredCourses = courses.filter((course) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;

    return (
      course.code?.toLowerCase().includes(query) ||
      course.name?.toLowerCase().includes(query) ||
      String(course.credits ?? '').toLowerCase().includes(query) ||
      course.description?.toLowerCase().includes(query)
    );
  });

  const fetchCourses = async () => {
    try {
      const res = await api.get('/api/courses');
      setCourses(res.data);
    } catch (err) {
      console.error("Error fetching courses", err);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/courses', formData);
      setFormData({ code: '', name: '', credits: 0, description: '' });
      setError(null);
      fetchCourses(); // Refresh list immediately
    } catch (err) {
      setError("Duplicate Code Detected"); // Matches your UI screenshot
    }
  };

  const deleteCourse = async (id) => {
    if (window.confirm("Delete this course?")) {
      await api.delete(`/api/courses/${id}`);
      fetchCourses();
    }
  };

  return (
    <div className="flex-1 bg-[#F8F9FB] p-8 font-poppins overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <nav className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
          Dashboard / Course Master
        </nav>
        <h1 className="text-3xl font-bold text-[#1D1D47] mb-2">Course Master Entry</h1>
        <p className="text-gray-400 text-sm mb-8">Manage and register new academic courses for the student curriculum.</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: New Course Form */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 h-fit">
            <h2 className="flex items-center gap-2 font-bold text-[#1D1D47] mb-6">
              <Plus size={18} className="text-[#3F3D8F]" /> New Course Details
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Course Code</label>
                  {error && <span className="text-[10px] text-red-500 flex items-center gap-1 font-bold"><AlertCircle size={10}/> {error}</span>}
                </div>
                <input 
                  required
                  className={`w-full p-3 border rounded-xl text-sm outline-none focus:ring-2 ${error ? 'border-red-200 bg-red-50/30' : 'border-gray-100 focus:ring-[#3F3D8F]/10'}`}
                  placeholder="e.g. CS101"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase">Course Name</label>
                <input 
                  required
                  className="w-full p-3 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3F3D8F]/10"
                  placeholder="e.g. Introduction to Computer Science"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase">Credits</label>
                <input 
                  type="number"
                  className="w-full p-3 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#3F3D8F]/10"
                  value={formData.credits}
                  onChange={(e) => setFormData({...formData, credits: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase">Brief Description</label>
                <textarea 
                  className="w-full p-3 border border-gray-100 rounded-xl text-sm h-24 outline-none focus:ring-2 focus:ring-[#3F3D8F]/10"
                  placeholder="Provide a short overview of the curriculum..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <button type="submit" className="w-full bg-[#FFB800] hover:bg-[#E6A600] text-[#1D1D47] py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all mt-4 cursor-pointer">
                <BookOpen size={18} /> Add to Inventory
              </button>
            </form>
          </div>

          {/* Right: Course Inventory Table */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h2 className="flex items-center gap-2 font-bold text-[#1D1D47]">
                <BookOpen size={18} className="text-[#3F3D8F]" /> Course Inventory
              </h2>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-300" size={14} />
                <input
                  className="pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-xs w-48 outline-none focus:ring-1 focus:ring-indigo-100"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-[#1E293B] text-white uppercase text-[10px] tracking-widest font-bold">
                <tr>
                  <th className="px-6 py-4">Course Code</th>
                  <th className="px-6 py-4">Course Name</th>
                  <th className="px-6 py-4">Credits</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-bold text-[#3F3D8F]">
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-gray-400 font-medium">
                      No courses match your search.
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-5">{course.code}</td>
                      <td className="px-6 py-5 text-gray-700">{course.name}</td>
                      <td className="px-6 py-5 text-gray-400">{course.credits}</td>
                      <td className="px-6 py-5 text-center">
                        <button onClick={() => deleteCourse(course.id)} className="bg-gray-100 text-gray-400 px-4 py-1.5 rounded-lg text-[10px] hover:bg-red-50 hover:text-red-500 transition-all uppercase">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;