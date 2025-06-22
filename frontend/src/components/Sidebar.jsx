import { Home, Calendar, Clock, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

const Sidebar = ({ email, onLogout }) => {
  return (
    <div className="h-screen w-64 bg-white shadow-md p-4 flex flex-col justify-between">
      <div>
        <h1 className="text-xl font-bold mb-6">Mentor Connect</h1>
        <nav className="space-y-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-black">
            <Home className="w-4 h-4" /> Home
          </Link>
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar className="w-4 h-4" /> Calendar
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Clock className="w-4 h-4" /> Upcoming
          </div>
        </nav>
      </div>
      <div className="text-sm text-gray-500">
        <p className="mb-2">{email}</p>
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

export default Sidebar;
