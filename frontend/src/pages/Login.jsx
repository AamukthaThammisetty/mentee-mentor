import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios"; // or your `api` instance

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const formData = new URLSearchParams();
      formData.append("username", email); // 👈 treat email as username
      formData.append("password", password);

      const response = await axios.post("http://127.0.0.1:8000/api/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const token = response.data.access_token;
      localStorage.setItem("token", token); // ✅ store JWT token

      // ✅ Fetch user info using token
      const userRes = await axios.get("http://127.0.0.1:8000/api/users", {
        params: { email },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const isMentor = userRes.data.is_mentor;
      localStorage.setItem("isMentor", isMentor); // ✅ Store isMentor status

      alert("Login successful!");
      navigate("/dashboard"); // ✅ Navigate after storing everything
    } catch (error) {
      alert("Login failed. Check your credentials.");
      console.error(error.response?.data);
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-80 space-y-4">
        <h2 className="text-xl font-bold text-center">Login</h2>

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

        <button
          className="w-full bg-blue-600 text-white py-2 rounded"
          onClick={handleLogin}
        >
          Login
        </button>

        <p className="text-sm text-center">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-600 underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
