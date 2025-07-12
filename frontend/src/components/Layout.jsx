import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import Sidebar from "./Sidebar";
import MentorSidebar from "../pages/MentorSidebar"; // ✅ import mentor sidebar

const Layout = () => {
  const [email, setEmail] = useState("");
  const [isMentor, setIsMentor] = useState(false); // ✅ track mentor status
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      const decoded = jwtDecode(token);
      setEmail(decoded.sub);

      // ✅ Optional: fetch from backend if needed
      const mentorStatus = localStorage.getItem("isMentor") === "true";
      setIsMentor(mentorStatus);
    } catch (err) {
      console.error("Token error:", err);
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isMentor");
    navigate("/login");
  };

  return (
    <div className="flex h-screen">
      {isMentor ? (
        <MentorSidebar email={email} onLogout={handleLogout} />
      ) : (
        <Sidebar email={email} onLogout={handleLogout} />
      )}

      <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
