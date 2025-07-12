import { useEffect, useState } from "react";
import axios from "axios";

export default function MentorSession() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8000/api/sessions", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (Array.isArray(response.data)) {
          setSessions(response.data);
        } else {
          console.error("Unexpected data format:", response.data);
          setSessions([]); // prevent .map error
        }
      } catch (error) {
        console.error("Error fetching sessions:", error.response?.data || error.message);
      }
    };

    fetchSessions();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">My Sessions</h2>
      {sessions.map((session, idx) => (
        <div key={idx} className="p-2 border rounded mb-2">
          <p><strong>Student:</strong> {session.mentee_name}</p>
          <p><strong>Time:</strong> {session.time}</p>
        </div>
      ))}
    </div>
  );
}
