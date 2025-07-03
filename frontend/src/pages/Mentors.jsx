import React, { useEffect, useState } from "react";

const Mentors = () => {
  const [mentors, setMentors] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/mentors")
      .then((res) => res.json())
      .then((data) => setMentors(data))
      .catch((err) => console.error("Failed to fetch mentors", err));
  }, []);

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Find Mentors</h2>

      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Search mentors by name or skill..."
          className="flex-1 px-4 py-2 border rounded-lg shadow-sm"
        />
        <select className="px-4 py-2 border rounded-lg">
          <option>Java</option>
        </select>
        <select className="px-4 py-2 border rounded-lg">
          <option>Highest Rated</option>
        </select>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {mentors.map((mentor) => (
          <div
            key={mentor.id}
            className="bg-white rounded-xl shadow-md p-5 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-lg font-semibold">{mentor.name}</h3>
              <p className="text-gray-500 text-sm mb-2">{mentor.email}</p>
              <p className="text-sm mb-3">
                Java Backend Developer with 5+ years of experience in Spring Boot and scalable systems.
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">Java</span>
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">Spring Boot</span>
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">Backend</span>
              </div>

              {/* Rating */}
              <div className="flex items-center text-sm text-yellow-500 mb-3">
                ★ ★ ★ ★ ☆ <span className="ml-2 text-gray-700">4.5</span>
              </div>
            </div>

            <button className="mt-auto bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm">
              Request Session
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Mentors;
