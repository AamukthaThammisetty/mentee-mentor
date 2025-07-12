import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const MentorSidebar = ({ email, onLogout }) => {
  return (
    <div className="h-screen w-64 bg-white shadow-md p-6 flex flex-col justify-between">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-8 text-gray-800">Mentor Panel</h2>

        {/* Navigation Links */}
        <nav className="space-y-4">
          <Link
            to="/mentor/create-session"
            className="block text-gray-700 hover:text-black"
          >
            Create Session
          </Link>
          <Link
            to="/mentor/sessions"
            className="block text-gray-700 hover:text-black"
          >
            My Sessions
          </Link>
          <Link
            to="/profile"
            className="block text-gray-700 hover:text-black"
          >
            Profile
          </Link>
        </nav>
      </div>

      {/* Footer */}
      <div className="text-sm text-gray-500 mt-10">
        <p className="mb-2 break-all">{email}</p>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-red-500 hover:text-red-700"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );
};

export default MentorSidebar;
