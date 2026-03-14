import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../apiClient';
import { Mail, Phone, GraduationCap, Edit3, Save, X } from 'lucide-react';

const StudentProfile = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');

  const profileValue = (value) => {
    if (value === null || value === undefined || value === '') {
      return 'Not set';
    }
    return value;
  };

  const normalizeStudent = (data) => ({
    ...data,
    email: data.email || '',
    department: data.department || '',
    enrollment_date: data.enrollment_date || '',
    city: data.city || '',
    postal_code: data.postal_code || '',
    guardian_name: data.guardian_name || '',
    guardian_relationship: data.guardian_relationship || '',
    guardian_occupation: data.guardian_occupation || '',
    emergency_contact: data.emergency_contact || '',
    semester: data.semester || '',
    address: data.address || '',
    mobile_number: data.mobile_number || '',
    assigned_courses: data.assigned_courses || [],
  });

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await api.get(`/api/students/${id}`);
        const normalized = normalizeStudent(response.data);
        setStudent(normalized);
        setFormData(normalized);
        setError('');
        setLoading(false);
      } catch (err) {
        console.error("Error fetching student profile:", err);
        setError('Failed to load profile data.');
        setLoading(false);
      }
    };
    fetchStudentData();
  }, [id]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCancel = () => {
    setFormData(student);
    setIsEditing(false);
    setError('');
  };

  const handleSave = async () => {
    if (!formData) return;

    setSaving(true);
    setError('');

    try {
      const payload = {
        email: formData.email,
        department: formData.department,
        enrollment_date: formData.enrollment_date || null,
        city: formData.city,
        postal_code: formData.postal_code,
        guardian_name: formData.guardian_name,
        guardian_relationship: formData.guardian_relationship,
        guardian_occupation: formData.guardian_occupation,
        emergency_contact: formData.emergency_contact,
        semester: formData.semester,
        address: formData.address,
        mobile_number: formData.mobile_number,
      };

      const response = await api.put(`/api/students/${id}`, payload);
      const normalized = normalizeStudent(response.data);
      setStudent(normalized);
      setFormData(normalized);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving student profile:', err);
      const apiError = err?.response?.data?.error;
      setError(apiError || 'Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center font-bold text-indigo-900">Loading Profile...</div>;
  if (!student) return <div className="p-8 text-center text-red-500">Student not found.</div>;

  return (
    <div className="flex-1 bg-[#F8F9FB] p-8 font-poppins overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb & Edit Button */}
        <div className="flex justify-between items-center mb-8">
          <nav className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex gap-2">
            <span>Students</span> / <span className="text-[#3F3D8F]">Student Profile</span>
          </nav>

          {isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all"
              >
                <X size={16} /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#10B981] hover:bg-[#059669] text-white px-5 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-sm disabled:opacity-70"
              >
                <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-[#FFB800] hover:bg-[#E6A600] text-[#1D1D47] px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-sm"
            >
              <Edit3 size={16} /> Edit Profile
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Summary Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 text-center">
              <div className="relative inline-block mb-4">
                <img 
                  src={`https://ui-avatars.com/api/?name=${student.name}&size=150&background=random`} 
                  className="w-32 h-32 rounded-3xl object-cover border-4 border-gray-50"
                  alt="Profile"
                />
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#10B981] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Active</span>
              </div>
              <h2 className="text-2xl font-bold text-[#1D1D47]">{student.name}</h2>
              <p className="text-gray-400 text-sm font-medium mb-6">{student.student_id}</p>
              
              <div className="space-y-4 text-left border-t border-gray-50 pt-6">
                <ProfileItem icon={<Mail size={16}/>} label="Email Address" value={profileValue(student.email)} />
                <ProfileItem icon={<Phone size={16}/>} label="Phone Number" value={profileValue(student.mobile_number)} />
                <ProfileItem icon={<GraduationCap size={16}/>} label="Department" value={profileValue(student.department)} />
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
              <h3 className="text-xs font-black text-[#1D1D47] uppercase tracking-widest mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Intake</p>
                  <p className="text-xl font-bold text-[#3F3D8F]">{student.intake_name || student.intake_id || 'Not Assigned'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Semester</p>
                  <p className="text-xl font-bold text-[#3F3D8F]">{profileValue(student.semester)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Detailed Info */}
          <div className="lg:col-span-8 bg-white rounded-[32px] p-10 shadow-sm border border-gray-100">
            <div className="border-b border-gray-100 pb-4 mb-8">
              <span className="text-sm font-bold text-[#3F3D8F] border-b-2 border-[#3F3D8F] pb-4 px-2">Personal Info</span>
            </div>

            <section className="mb-10">
              <h4 className="text-[10px] font-black text-[#3F3D8F] uppercase tracking-[0.2em] mb-6">Primary Information</h4>
              <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                <InfoBox label="Date of Birth" value={profileValue(student.dob)} />
                <InfoBox label="Gender" value={profileValue(student.gender)} />
                <EditableInfoBox
                  label="Enrollment Date"
                  value={formData.enrollment_date}
                  isEditing={isEditing}
                  type="date"
                  onChange={(value) => handleChange('enrollment_date', value)}
                />
                <InfoBox label="National ID" value={profileValue(student.nic)} />
              </div>
            </section>

            <section className="mb-10 pt-10 border-t border-gray-50">
              <h4 className="text-[10px] font-black text-[#3F3D8F] uppercase tracking-[0.2em] mb-6">Contact & Address</h4>
              <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                <div className="col-span-2">
                  <EditableInfoBox
                    label="Residential Address"
                    value={formData.address}
                    isEditing={isEditing}
                    onChange={(value) => handleChange('address', value)}
                  />
                </div>
                <EditableInfoBox
                  label="City"
                  value={formData.city}
                  isEditing={isEditing}
                  onChange={(value) => handleChange('city', value)}
                />
                <EditableInfoBox
                  label="Postal Code"
                  value={formData.postal_code}
                  isEditing={isEditing}
                  onChange={(value) => handleChange('postal_code', value)}
                />
                <EditableInfoBox
                  label="Phone Number"
                  value={formData.mobile_number}
                  isEditing={isEditing}
                  onChange={(value) => handleChange('mobile_number', value)}
                />
                <EditableInfoBox
                  label="Email Address"
                  value={formData.email}
                  isEditing={isEditing}
                  type="email"
                  onChange={(value) => handleChange('email', value)}
                />
                <EditableInfoBox
                  label="Department"
                  value={formData.department}
                  isEditing={isEditing}
                  onChange={(value) => handleChange('department', value)}
                />
                <EditableInfoBox
                  label="Semester"
                  value={formData.semester}
                  isEditing={isEditing}
                  onChange={(value) => handleChange('semester', value)}
                />
              </div>
            </section>

            <section className="mb-10 pt-10 border-t border-gray-50">
              <h4 className="text-[10px] font-black text-[#3F3D8F] uppercase tracking-[0.2em] mb-6">Assigned Courses (By Intake)</h4>
              {student.assigned_courses.length === 0 ? (
                <p className="text-sm font-semibold text-gray-500">
                  No courses assigned for this student's intake yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {student.assigned_courses.map((course) => (
                    <div key={course.id} className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                      <p className="text-sm font-bold text-gray-800">{course.name}</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                        {course.code} • {course.credits} Credits
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="pt-10 border-t border-gray-50">
              <h4 className="text-[10px] font-black text-[#3F3D8F] uppercase tracking-[0.2em] mb-6">Guardian Details</h4>
              <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                <EditableInfoBox
                  label="Guardian Name"
                  value={formData.guardian_name}
                  isEditing={isEditing}
                  onChange={(value) => handleChange('guardian_name', value)}
                />
                <EditableInfoBox
                  label="Relationship"
                  value={formData.guardian_relationship}
                  isEditing={isEditing}
                  onChange={(value) => handleChange('guardian_relationship', value)}
                />
                <EditableInfoBox
                  label="Occupation"
                  value={formData.guardian_occupation}
                  isEditing={isEditing}
                  onChange={(value) => handleChange('guardian_occupation', value)}
                />
                <EditableInfoBox
                  label="Emergency Contact"
                  value={formData.emergency_contact}
                  isEditing={isEditing}
                  onChange={(value) => handleChange('emergency_contact', value)}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-components
const ProfileItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-4">
    <div className="p-2 bg-indigo-50 text-[#3F3D8F] rounded-lg">{icon}</div>
    <div>
      <p className="text-[9px] font-bold text-gray-400 uppercase">{label}</p>
      <p className="text-xs font-bold text-gray-700">{value}</p>
    </div>
  </div>
);

const InfoBox = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
    <p className="text-sm font-bold text-gray-700">{value || 'Not set'}</p>
  </div>
);

const EditableInfoBox = ({ label, value, isEditing, onChange, type = 'text' }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
    {isEditing ? (
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
    ) : (
      <p className="text-sm font-bold text-gray-700">{value || 'Not set'}</p>
    )}
  </div>
);

export default StudentProfile;