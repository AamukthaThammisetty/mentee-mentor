import React, { useEffect, useState } from "react";

const Sessions = () => {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://127.0.0.1:8000/api/sessions/mine", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch sessions");
        const data = await response.json();
        setSessions(data);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    };

    fetchSessions();
  }, []);

  return (
    <div className="p-6 max-w-screen-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Upcoming Sessions</h1>
      {sessions.length === 0 ? (
        <p className="text-gray-500">You have no upcoming sessions yet.</p>
      ) : (
        <ul className="space-y-4">
          {sessions.map((session) => (
            <li key={session.id} className="border rounded-lg p-4 shadow-sm bg-white">
              <h3 className="text-lg font-semibold">{session.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{session.description}</p>
              <p className="text-sm text-blue-600">Time: {new Date(session.time).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Sessions;
