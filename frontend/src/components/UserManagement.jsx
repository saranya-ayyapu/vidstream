import { useState, useEffect } from 'react';
import api from '../services/api';
import { User, Shield, ShieldCheck, Search, Loader2, UserPlus } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/auth/users');
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      await api.put(`/auth/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error('Error updating role:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-100 text-center">
        <div className="bg-blue-50 p-4 rounded-2xl mb-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading team members...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-1 tracking-tight">Team Management</h2>
          <p className="text-slate-400 text-sm font-semibold tracking-wide">Manage user roles and permissions for your organization.</p>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="bg-white border border-slate-200 text-slate-900 pl-12 pr-4 py-3 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all w-full md:w-80 text-sm font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xl shadow-slate-200/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 transition-colors group-hover:bg-white group-hover:shadow-md">
                        <User className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-900">{user.name}</div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                      user.role === 'Admin' 
                        ? 'bg-purple-50 text-purple-600 border-purple-100' 
                        : user.role === 'Editor'
                        ? 'bg-blue-50 text-blue-600 border-blue-100'
                        : 'bg-slate-50 text-slate-500 border-slate-100'
                    }`}>
                      {user.role === 'Admin' ? <ShieldCheck className="w-3.5 h-3.5" /> : user.role === 'Editor' ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-black uppercase tracking-widest">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {user.role !== 'Admin' ? (
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                        disabled={updatingId === user._id}
                        className="bg-slate-50 border border-slate-200 text-slate-900 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all cursor-pointer"
                      >
                        <option value="Viewer">Viewer</option>
                        <option value="Editor">Editor</option>
                        <option value="Admin">Admin</option>
                      </select>
                    ) : (
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Owner</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-100 p-16 text-center shadow-xl shadow-slate-100/50">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-50 mb-6 transition-transform hover:scale-110">
            <UserPlus className="w-10 h-10 text-slate-200" />
          </div>
          <h3 className="text-slate-900 font-black text-xl mb-2">No users found</h3>
          <p className="text-slate-400 text-sm font-semibold max-w-[280px] mx-auto">Try adjusting your search criteria or check back later.</p>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
