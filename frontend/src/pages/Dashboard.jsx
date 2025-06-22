import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import MentorCards from "../components/MentorCards";

const Dashboard = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      const decoded = jwtDecode(token);
      setEmail(decoded.sub);
    } catch (err) {
      console.error("Token error:", err);
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex h-screen">
      <Sidebar email={email} onLogout={handleLogout} />
      <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">
        <MentorCards />
      </main>
    </div>
  );
};

export default Dashboard;
