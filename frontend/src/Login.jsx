import React, { useState } from 'react';
import api from './apiClient';
import { User, Lock, Eye, ArrowRight } from 'lucide-react';
import logo from './assets/logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/login', { email, password });
      if (response.data.status === 'authenticated') {
        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        localStorage.setItem('user', response.data.admin_name);
        localStorage.setItem('session_id', response.data.session_id);
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 font-poppins px-4">
      {/* Top Section: Logo & Titles */}
      <div className="text-center mb-8 flex flex-col items-center gap-1.5">
           <img src={logo} className='w-20' />

        <h1 className="text-3xl font-bold text-indigo-950">Student Management System</h1>
        <p className="text-gray-500 tracking-[0.2em] uppercase text-xs mt-1 font-semibold">Admin Portal</p>
      </div>

      {/* Login Card */}
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl shadow-indigo-100/50 w-full max-w-md border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
        <p className="text-gray-400 text-sm mb-8 mt-1">Please enter your details to sign in.</p>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          {/* Username/Email Field */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <User size={16} className="text-indigo-900" /> Username
            </label>
            <input 
              type="email" 
              placeholder="admin@institution.com" 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Lock size={16} className="text-indigo-900" /> Password
              </label>
              <a href="#" className="text-xs font-semibold text-indigo-900 hover:text-amber-600 transition-colors">Forgot?</a>
            </div>
            <div className="relative">
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <Eye size={18} className="absolute right-3 top-3.5 text-gray-400 cursor-pointer hover:text-indigo-900 transition-colors" />
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-900 focus:ring-indigo-900" id="remember" />
            <label htmlFor="remember" className="cursor-pointer">Remember for 30 days</label>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="w-full py-4 bg-amber-400 hover:bg-amber-500 text-indigo-950 font-bold rounded-xl flex justify-center items-center gap-3 shadow-lg shadow-amber-200 transition-all active:scale-95"
          >
            Login to Dashboard <ArrowRight size={20} />
          </button>
        </form>
      </div>
      
      <p className="mt-8 text-gray-400 text-xs text-center">
        © 2026 Student Management System. <br/> All rights reserved.
      </p>
    </div>
  );
};

export default Login;