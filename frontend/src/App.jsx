import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import Sessions from "./pages/Sessions.jsx";
import Mentors from "./pages/Mentors.jsx";
import Feedback from "./pages/Feedback.jsx";
import Layout from "./components/Layout.jsx";

// ⬇️ NEW mentor pages
import MentorCreateSession from "./pages/MentorCreateSession.jsx";
import MentorSession from "./pages/MentorSession.jsx";
import MentorSidebar from "./pages/MentorSidebar.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Shared Authenticated Layout */}
        <Route path="/" element={<Layout />}>
          {/* Common routes */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="sessions" element={<Sessions />} />
          <Route path="mentors" element={<Mentors />} />
          <Route path="feedback" element={<Feedback />} />

          {/* Mentor-specific routes */}
          <Route path="mentor/dashboard" element={<MentorSidebar />} />
          <Route path="mentor/create-session" element={<MentorCreateSession />} />
          <Route path="mentor/sessions" element={<MentorSession />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
