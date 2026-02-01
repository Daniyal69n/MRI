'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserCog, Trash2, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/dashboard/PageHeader';

interface RegisteredUser {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  contactNumber: string;
  pmdcNumber?: string;
  specialization?: string;
  createdAt: string;
}

export default function ManageUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (!userData) {
      router.push('/login');
      return;
    }
    try {
      const user = JSON.parse(userData);
      if (!user?.isAdmin) {
        router.push('/dashboard');
        return;
      }
    } catch {
      router.push('/login');
      return;
    }
    loadUsers();
  }, [router]);

  const loadUsers = async () => {
    const userData = localStorage.getItem('user');
    if (!userData) return;
    try {
      const user = JSON.parse(userData);
      const response = await fetch('/api/users', {
        headers: {
          'X-User-Email': user.email || '',
        },
      });
      const data = await response.json();
      if (response.ok && data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    const d = new Date(timestamp);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user account? This will remove the user from the database.')) {
      return;
    }
    const userData = localStorage.getItem('user');
    if (!userData) return;
    const user = JSON.parse(userData);
    setDeletingId(id);
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: {
          'X-User-Email': user.email || '',
        },
      });
      const data = await response.json();
      if (response.ok) {
        setUsers((prev) => prev.filter((u) => u._id !== id));
      } else {
        alert(data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Users"
        description="View and manage registered user accounts"
        icon={UserCog}
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gradient-to-r from-gray-50/80 to-gray-100/80">
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Username</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Contact Number</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">PMDC Number</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Specialization</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Registered At</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    No registered users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u._id}
                    className="border-b border-gray-100/50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{u.username}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{u.email}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{u.contactNumber}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{u.pmdcNumber || '—'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{u.specialization || '—'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{formatDate(u.createdAt)}</td>
                    <td className="py-3 px-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleDelete(u._id)}
                        disabled={deletingId === u._id}
                      >
                        {deletingId === u._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
