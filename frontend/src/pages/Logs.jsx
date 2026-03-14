import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Calendar, Download, RotateCcw, Search, User } from 'lucide-react';
import api from '../apiClient';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [admins, setAdmins] = useState([]);
  const [actions, setActions] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({
    q: '',
    admin: 'ALL',
    action: 'ALL',
    start_date: '',
    end_date: '',
    sessionOnly: true,
  });

  const sessionId = localStorage.getItem('session_id') || '';
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      setFilters((prev) => ({ ...prev, q: searchInput.trim() }));
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  const requestParams = useMemo(() => {
    const params = {
      page,
      page_size: pageSize,
      q: filters.q,
      admin: filters.admin,
      action: filters.action,
      start_date: filters.start_date,
      end_date: filters.end_date,
    };

    if (filters.sessionOnly && sessionId) {
      params.session_id = sessionId;
    }

    return params;
  }, [filters, page, pageSize, sessionId]);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/api/audit-logs', { params: requestParams });
        setLogs(response.data.items || []);
        setTotal(response.data.total || 0);
        setAdmins(response.data.admins || []);
        setActions(response.data.actions || []);
      } catch (err) {
        console.error("Error fetching audit logs:", err);
        setError('Failed to fetch logs from backend.');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [requestParams]);

  const resetFilters = () => {
    setSearchInput('');
    setPage(1);
    setFilters({
      q: '',
      admin: 'ALL',
      action: 'ALL',
      start_date: '',
      end_date: '',
      sessionOnly: true,
    });
  };

  const exportCsv = async () => {
    try {
      const response = await api.get('/api/audit-logs/export', {
        params: requestParams,
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit_logs_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export csv', err);
    }
  };

  return (
    <div className="flex-1 bg-[#F8F9FB] p-8 font-poppins overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1D1D47]">Audit Trail & Activity Logs</h1>
            <p className="text-gray-400 text-sm">Monitor all administrative actions across the system</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <input 
                type="text" 
                placeholder="Search logs..." 
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-lg text-sm outline-none w-64 shadow-sm"
              />
            </div>
            <button onClick={exportCsv} className="bg-[#FFB800] hover:bg-[#E6A600] text-[#1D1D47] px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition-all">
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex-wrap">
          <span>Filter By</span>

          <FilterSelect
            icon={<User size={14} />}
            value={filters.admin}
            onChange={(value) => {
              setPage(1);
              setFilters((prev) => ({ ...prev, admin: value }));
            }}
            options={["ALL", ...admins]}
            formatLabel={(option) => option === 'ALL' ? 'All Administrators' : option}
          />

          <FilterSelect
            icon={<Activity size={14} />}
            value={filters.action}
            onChange={(value) => {
              setPage(1);
              setFilters((prev) => ({ ...prev, action: value }));
            }}
            options={["ALL", ...actions]}
            formatLabel={(option) => option === 'ALL' ? 'All Actions' : option}
          />

          <FilterDate
            icon={<Calendar size={14} />}
            value={filters.start_date}
            placeholder="Start Date"
            onChange={(value) => {
              setPage(1);
              setFilters((prev) => ({ ...prev, start_date: value }));
            }}
          />

          <FilterDate
            icon={<Calendar size={14} />}
            value={filters.end_date}
            placeholder="End Date"
            onChange={(value) => {
              setPage(1);
              setFilters((prev) => ({ ...prev, end_date: value }));
            }}
          />

          <label className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-100 rounded-lg shadow-sm normal-case text-gray-600 text-xs">
            <input
              type="checkbox"
              checked={filters.sessionOnly}
              onChange={(e) => {
                setPage(1);
                setFilters((prev) => ({ ...prev, sessionOnly: e.target.checked }));
              }}
            />
            Current Session Only
          </label>

          <button onClick={resetFilters} className="flex items-center gap-1 ml-auto text-[#3F3D8F] hover:underline">
            <RotateCcw size={14} /> Reset Filters
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-400 font-bold border-b border-gray-100">
              <tr>
                <th className="px-8 py-4">Timestamp</th>
                <th className="px-8 py-4">Admin User</th>
                <th className="px-8 py-4">Action</th>
                <th className="px-8 py-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {!loading && logs.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-8 py-10 text-center text-sm text-gray-400">
                    {error || 'No logs found for selected filters.'}
                  </td>
                </tr>
              )}
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-5 text-xs text-gray-500 font-medium">{log.timestamp}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-indigo-100 text-[#3F3D8F] rounded-full flex items-center justify-center text-[10px] font-bold">
                        {log.user ? log.user.split(' ').map(n => n[0]).join('') : 'AD'}
                      </div>
                      <span className="text-sm font-bold text-gray-700">{log.user || 'System'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <StatusBadge action={log.action_type || log.action} />
                  </td>
                  <td className="px-8 py-5 text-sm text-gray-500 max-w-md">
                    {log.description || log.action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-8 py-4 bg-white border-t border-gray-50 flex justify-between items-center text-[11px] font-bold text-gray-400">
            <span>
              Showing {total === 0 ? 0 : (page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} of {total} results
            </span>
            <div className="flex gap-2 items-center">
              <button
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="px-3 py-1 rounded-md border border-gray-100 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <span className="text-xs text-gray-500">Page {page} / {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                className="px-3 py-1 rounded-md border border-gray-100 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterSelect = ({ icon, value, onChange, options, formatLabel }) => (
  <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-100 rounded-lg shadow-sm normal-case text-gray-600">
    {icon}
    <select className="text-xs bg-transparent outline-none" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((option) => (
        <option key={option} value={option}>{formatLabel(option)}</option>
      ))}
    </select>
  </div>
);

const FilterDate = ({ icon, value, onChange, placeholder }) => (
  <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-100 rounded-lg shadow-sm normal-case text-gray-600">
    {icon}
    <input type="date" value={value} onChange={(e) => onChange(e.target.value)} className="text-xs bg-transparent outline-none" placeholder={placeholder} />
  </div>
);

const StatusBadge = ({ action }) => {
  const styles = {
    CREATE: "bg-emerald-50 text-emerald-600",
    UPDATE: "bg-blue-50 text-blue-600",
    DELETE: "bg-red-50 text-red-600",
    SYSTEM: "bg-amber-50 text-amber-600",
    LOGIN: "bg-gray-100 text-gray-600"
  };
  
  const type = (action || 'SYSTEM').toUpperCase().split(' ')[0];
  const colorClass = styles[type] || styles.LOGIN;

  return (
    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${colorClass}`}>
      {type}
    </span>
  );
};

export default Logs;