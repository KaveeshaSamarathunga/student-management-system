import React, { useState, useEffect } from 'react';
import api from '../apiClient';
import { User, Home, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Registration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', dob: '', nic: '',
    gender: 'Male', intake_id: '', address: '', mobile_number: ''
  });
  const [intakes, setIntakes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/intakes')
      .then(res => {
        const active = res.data.filter(i => i.status === 'Ongoing');
        setIntakes(active);
        if (active.length > 0) {
          setFormData(prev => ({ ...prev, intake_id: active[0].id }));
        }
      })
      .catch(err => console.error("Failed to load intakes", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/register-student', formData);
      if (response.status === 201 || response.status === 200) {
        navigate('/students');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please check your data.');
    }
  };

  return (
    <div className="flex-1 bg-[#F8F9FB] p-8 font-poppins overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <nav className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex gap-2">
          <span>Students</span> / <span className="text-[#3F3D8F]">Registration</span>
        </nav>

        <h1 className="text-3xl font-bold text-[#1D1D47] mb-2">Student Registration</h1>
        <p className="text-gray-400 text-sm mb-8">Enroll a new student into the management system by completing the form below.</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-[32px] p-10 shadow-sm border border-gray-100">
          {error && <p className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">{error}</p>}

          {/* Personal Information Section */}
          <section className="mb-10">
            <h2 className="flex items-center gap-2 text-sm font-bold text-[#1D1D47] mb-6">
              <User size={18} className="text-[#3F3D8F]" /> Personal Information
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <InputField label="First Name" placeholder="e.g. Michael" onChange={(v) => setFormData({...formData, first_name: v})} />
              <InputField label="Last Name" placeholder="e.g. Scott" onChange={(v) => setFormData({...formData, last_name: v})} />
              <InputField label="Date of Birth" type="date" onChange={(v) => setFormData({...formData, dob: v})} />
              <InputField label="NIC" placeholder="e.g. 123456789V" onChange={(v) => setFormData({...formData, nic: v})} />
              <SelectField label="Gender" options={['Male', 'Female', 'Other']} onChange={(v) => setFormData({...formData, gender: v})} />

              {/* Intake dropdown - loaded from API */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Select Intake</label>
                <select
                  required
                  className="w-full p-4 bg-white border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#3F3D8F]/10 outline-none appearance-none"
                  onChange={(e) => setFormData({...formData, intake_id: parseInt(e.target.value)})}
                >
                  {intakes.length === 0 && <option value="">No active intakes</option>}
                  {intakes.map(intake => (
                    <option key={intake.id} value={intake.id}>{intake.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Contact Information Section */}
          <section className="mb-10">
            <h2 className="flex items-center gap-2 text-sm font-bold text-[#1D1D47] mb-6">
              <Home size={18} className="text-[#3F3D8F]" /> Contact Information
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Address</label>
                <textarea
                  required
                  placeholder="Enter full residential address"
                  className="w-full p-4 bg-white border border-gray-100 rounded-2xl text-sm h-24 focus:ring-2 focus:ring-[#3F3D8F]/10 outline-none"
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div className="w-1/2">
                <InputField label="Mobile Number" placeholder="e.g. 070xxxxxxx" onChange={(v) => setFormData({...formData, mobile_number: v})} />
              </div>
            </div>
          </section>

          {/* Footer Actions */}
          <div className="flex justify-end items-center gap-6 pt-6 border-t border-gray-50">
            <button type="button" onClick={() => navigate('/students')} className="text-sm font-bold text-gray-400 hover:text-gray-600">Cancel</button>
            <button type="submit" className="bg-[#FFB800] hover:bg-[#E6A600] text-[#1D1D47] px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all shadow-lg shadow-amber-100">
              <UserPlus size={20} /> Register Student
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputField = ({ label, placeholder, type = "text", onChange }) => (
  <div className="space-y-2">
    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{label}</label>
    <input
      required
      type={type}
      placeholder={placeholder}
      className="w-full p-4 bg-white border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#3F3D8F]/10 outline-none"
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const SelectField = ({ label, options, onChange }) => (
  <div className="space-y-2">
    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{label}</label>
    <select
      className="w-full p-4 bg-white border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#3F3D8F]/10 outline-none appearance-none"
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export default Registration;