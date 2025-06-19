import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../lib/api";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isMentor, setIsMentor] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      await api.post("/signup", {
        name,
        email,
        password,
        is_mentor: isMentor, // ✅ send the required field
      });
      alert("Signup successful! Please login.");
      navigate("/login");
    } catch (error) {
      alert("Signup failed. Please check your data.");
      console.log(error.response?.data);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-80 space-y-4">
        <h2 className="text-xl font-bold text-center">Sign Up</h2>

        <input
          className="w-full px-3 py-2 border rounded"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full px-3 py-2 border rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full px-3 py-2 border rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label className="text-sm">
          <input
            type="checkbox"
            checked={isMentor}
            onChange={(e) => setIsMentor(e.target.checked)}
            className="mr-2"
          />
          I am a mentor
        </label>

        <button onClick={handleSignup} className="w-full bg-green-600 text-white py-2 rounded">
          Sign Up
        </button>

        <p className="text-sm text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
