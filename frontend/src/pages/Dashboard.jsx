// src/pages/Dashboard.jsx
import MentorCards from "../components/MentorCards";

const Dashboard = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Welcome to Mentor Connect</h1>
      <p className="text-gray-600 mb-6">Here are your today's sessions:</p>
      <MentorCards />
    </div>
  );
};

export default Dashboard;
