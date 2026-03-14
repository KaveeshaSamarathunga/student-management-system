import React, { useState } from 'react';
import api from '../apiClient';
import { useNavigate } from 'react-router-dom';
import { CalendarPlus, Info } from 'lucide-react';

const CreateIntake = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    intakeName: '',
    startDate: '',
    endDate: '',
    description: '',
    isActive: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/intakes', formData);
      if (response.status === 201) {
        navigate('/intakes'); // Go back to the management list
      }
    } catch (err) {
      console.error("Failed to create intake", err);
    }
  };

  return (
    <div className="flex-1 bg-[#F8F9FB] p-8 font-poppins overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex gap-2">
          <span>Intake</span> / <span className="text-[#3F3D8F]">Create Intake</span>
        </nav>

        <h1 className="text-3xl font-bold text-[#1D1D47] mb-2">Create New Intake</h1>
        <p className="text-gray-400 text-sm mb-8">Configure a new academic cycle for student admissions and scheduling.</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-[32px] p-10 shadow-sm border border-gray-100">
          <div className="space-y-8">
            {/* Intake Name */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                Intake Name <span className="text-red-500">*</span>
              </label>
              <input 
                required
                type="text"
                placeholder="e.g., Software Engineering Batch 2024 (Fall)"
                className="w-full p-4 bg-white border border-gray-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#3F3D8F]/10"
                onChange={(e) => setFormData({...formData, intakeName: e.target.value})}
              />
              <p className="text-[10px] text-gray-400 flex items-center gap-1"><Info size={12}/> A clear name to identify this session across the system.</p>
            </div>

            {/* Dates Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Start Date *</label>
                <input 
                  required
                  type="date"
                  className="w-full p-4 bg-white border border-gray-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#3F3D8F]/10"
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">End Date *</label>
                <input 
                  required
                  type="date"
                  className="w-full p-4 bg-white border border-gray-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-[#3F3D8F]/10"
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Description</label>
              <textarea 
                placeholder="Provide details about admission criteria or special instructions for this intake..."
                className="w-full p-4 bg-white border border-gray-100 rounded-2xl text-sm h-32 outline-none focus:ring-2 focus:ring-[#3F3D8F]/10"
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            {/* Toggle Active */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div>
                <p className="text-[11px] font-bold text-gray-700 uppercase">Set as Active Intake</p>
                <p className="text-[10px] text-gray-400">New students will be automatically assigned to this intake by default.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3F3D8F]"></div>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end items-center gap-6 mt-10 pt-8 border-t border-gray-50">
            <button type="button" onClick={() => navigate('/intakes')} className="text-sm font-bold text-gray-400 hover:text-gray-600">Cancel</button>
            <button type="submit" className="bg-[#FFB800] hover:bg-[#E6A600] text-[#1D1D47] px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-lg shadow-amber-100">
              <CalendarPlus size={20} /> Create New Intake
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateIntake;