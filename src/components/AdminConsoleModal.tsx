import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Users,
  HardDrive,
  FileText,
  Search,
  CheckCircle,
  Gift,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { PlanId, User } from '../types/drive';
import { formatBytes, STORAGE_PLANS } from '../utils/driveLogic';

interface AdminUserSummary {
  id: string;
  username: string;
  name: string;
  role: string;
  planId: PlanId;
  storageQuotaBytes: number;
  storageUsedBytes: number;
  filesCount: number;
  isPlanCompedByAdmin?: boolean;
  createdAt: string;
}

interface AdminConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  authToken: string | null;
  onRefreshData: () => void;
}

export const AdminConsoleModal: React.FC<AdminConsoleModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  authToken,
  onRefreshData,
}) => {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [totalFiles, setTotalFiles] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && authToken && currentUser?.role === 'admin') {
      fetchAdminData();
    }
  }, [isOpen, authToken, currentUser]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setTotalFiles(data.totalFiles || 0);
      }
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGrantFreePlan = async (userId: string, newPlanId: PlanId) => {
    setUpdatingUser(userId);
    try {
      const res = await fetch('/api/admin/grant-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ targetUserId: userId, planId: newPlanId }),
      });
      if (res.ok) {
        const data = await res.json();
        setFeedback(data.message || `Granted ${newPlanId.toUpperCase()} for free!`);
        fetchAdminData();
        onRefreshData();
        setTimeout(() => setFeedback(null), 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingUser(null);
    }
  };

  if (!isOpen) return null;

  const totalStorageAllocated = users.reduce((acc, u) => acc + (u.storageUsedBytes || 0), 0);
  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[85vh] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden text-gray-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
              <ShieldCheck className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold tracking-tight">Admin Console</h2>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                  Eyad.Eliwa Active
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-gray-900 text-[10px] font-black uppercase flex items-center gap-1">
                  <Gift className="w-3 h-3" />
                  Free Plan Authority
                </span>
              </div>
              <p className="text-amber-100 text-xs mt-0.5">
                Full administrative oversight, unlimited storage, and access to grant any plan to any user for 100% free!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close admin console"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-6 bg-gray-50/70 border-b border-gray-100">
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-semibold">Total Accounts</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-gray-900">{users.length}</div>
            <span className="text-[11px] text-emerald-600 font-medium">Cross-device synced</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-semibold">System Files</span>
              <FileText className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-gray-900">{totalFiles}</div>
            <span className="text-[11px] text-gray-500">Stored on cloud disk</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-semibold">Live Storage Used</span>
              <HardDrive className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-gray-900">
              {formatBytes(totalStorageAllocated)}
            </div>
            <span className="text-[11px] text-gray-500">Across all accounts</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs bg-amber-50/40">
            <div className="flex items-center justify-between text-amber-900 mb-1">
              <span className="text-xs font-semibold">Admin Quota</span>
              <ShieldCheck className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-950">Unlimited</div>
            <span className="text-[11px] text-amber-700 font-medium">Grant free plans anytime</span>
          </div>
        </div>

        {/* User Management List */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span>User Accounts & Free Plan Grants</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Zero Cost for Users
                </span>
              </h3>
              <p className="text-xs text-gray-500">
                Eyad.Eliwa can grant any plan (Free 15GB, Pro 250GB, Ultimate 450GB, Ultimate Pro 1TB, or Unlimited) for 100% free!
              </p>
            </div>

            <div className="relative w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto border border-gray-200 rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold sticky top-0 z-10">
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Current Plan & Status</th>
                  <th className="p-3.5">Storage Used</th>
                  <th className="p-3.5">Quota</th>
                  <th className="p-3.5">Grant Plan 100% Free</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => {
                  const isThisAdmin = u.username.toLowerCase() === 'eyad.eliwa';
                  return (
                    <tr key={u.id} className="hover:bg-gray-50/70 transition">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                              isThisAdmin ? 'bg-amber-600' : 'bg-blue-600'
                            }`}
                          >
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block">{u.name}</span>
                            <span className="text-[11px] text-gray-500 font-mono">@{u.username}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                            u.role === 'admin'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="font-semibold text-gray-900">
                            {u.planId.replace('_', ' ').toUpperCase()}
                          </span>
                          {u.isPlanCompedByAdmin && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                              <Gift className="w-2.5 h-2.5" />
                              Free by Eyad
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 font-medium text-gray-700">
                        {formatBytes(u.storageUsedBytes)}
                      </td>
                      <td className="p-3.5 font-medium">
                        {u.storageQuotaBytes === -1 ? (
                          <span className="text-emerald-600 font-bold">Unlimited</span>
                        ) : (
                          formatBytes(u.storageQuotaBytes)
                        )}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <select
                            value={u.planId}
                            disabled={updatingUser === u.id}
                            onChange={(e) => handleGrantFreePlan(u.id, e.target.value as PlanId)}
                            className="bg-white border border-gray-200 text-gray-800 py-1.5 px-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-xs"
                          >
                            <option value="free">Gift Free (15 GB)</option>
                            <option value="pro">Gift Pro (250 GB) — Free</option>
                            <option value="ultimate">Gift Ultimate (450 GB) — Free</option>
                            <option value="ultimate_pro">Gift Ultimate Pro (1 TB) — Free</option>
                            <option value="admin_unlimited">Gift Unlimited — Free</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
