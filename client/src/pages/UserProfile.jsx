import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { apiUrl } from '../api/baseUrl';

function UserProfile() {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const { success, error } = useToast();
  
  // Use user from AuthContext instead of state
  const user = authUser;

  const handleLogout = () => {
    logout();
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const response = await fetch(apiUrl('/auth/delete-account'), {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user?.accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          logout();
          success('Account deleted successfully');
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response.' }));
          error(`Failed to delete account: ${errorData.message || 'An unknown error occurred.'}`);
        }
      } catch (err) {
        console.error('Error deleting account:', err);
        error('Failed to delete account');
      }
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-white">Please log in</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">User Profile</h1>
        
        <div className="bg-gray-900 rounded-lg p-8 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Account Information</h2>
          <div className="space-y-4">
            <div>
              <label className="text-gray-400">Username</label>
              <p className="text-xl text-white">{user.username}</p>
            </div>
            <div>
              <label className="text-gray-400">Email</label>
              <p className="text-xl text-white">{user.email}</p>
            </div>
            <div>
              <label className="text-gray-400">Account ID</label>
              <p className="text-sm text-gray-500">{user.id}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-8 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Account Settings</h2>
          <div className="space-y-4">
            <button
              onClick={() => navigate('/watchlist')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded font-semibold transition"
            >
              View My Watchlist
            </button>
            <button
              onClick={() => navigate('/forgot-password')}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded font-semibold transition"
            >
              Change Password
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded font-semibold transition"
            >
              Go Back
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded font-semibold transition"
          >
            Logout
          </button>
          <button
            onClick={handleDeleteAccount}
            className="w-full bg-red-900 hover:bg-red-800 text-white py-3 px-4 rounded font-semibold transition"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
