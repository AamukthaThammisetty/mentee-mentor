import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, []);

  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold">Welcome to the Dashboard</h1>
      <p>More features coming soon...</p>
    </div>
  );
}
