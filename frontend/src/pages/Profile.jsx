import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    bio: '',
    role: '',
    skills: [],
  });
  const [inputSkill, setInputSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUserData() {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const email = decoded.sub;

        const res = await fetch(`http://localhost:8000/api/users?email=${encodeURIComponent(email)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error('User not found');
        }

        const data = await res.json();
        setUserData({
          name: '',
          email: '',
          bio: '',
          role: '',
          skills: [],
          avatar: '',
        });

      } catch (err) {
        console.error('Failed to load profile:', err);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [navigate]);

  const handleSkillAdd = (e) => {
    if (e.key === 'Enter' && inputSkill.trim()) {
      if (!userData.skills.includes(inputSkill.trim())) {
        setUserData((prev) => ({
          ...prev,
          skills: [...prev.skills, inputSkill.trim()],
        }));
      }
      setInputSkill('');
      e.preventDefault();
    }
  };


  const removeSkill = (skillToRemove) => {
    setUserData({
      ...userData,
      skills: userData.skills.filter((skill) => skill !== skillToRemove),
    });
  };


  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem('token');
    const email = userData.email;

    try {
      const response = await fetch(`http://localhost:8000/api/users/${encodeURIComponent(userData.email)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: userData.name,
          bio: userData.bio,
          skills: userData.skills,
          avatar: userData.avatar,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
      //console.log("Rendering avatar with:", userData.avatar);

    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserData({
      name: data.name || '',
      email: data.email || '',
      bio: data.bio || '',
      role: data.is_mentor ? 'Mentor' : 'Mentee',
      skills: data.skills || [],
      avatar: data.avatar || '',
    });

    navigate('/login');
  };


  if (loading) return <p className="text-center mt-10">Loading profile...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <button
          onClick={handleLogout}
          className="text-red-500 hover:text-red-700 font-medium"
        >
          Logout
        </button>
      </div>

      {/* Basic Info */}
      {/* Basic Info */}
      <div className="bg-white rounded-xl shadow p-4 flex items-center space-x-6">
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setUserData((prev) => ({ ...prev, avatar: reader.result }));
                };
                reader.readAsDataURL(file);
              }
            }}
          />
          <img
            src={userData.avatar || '/avatar.jpg'}
            alt="avatar"
            className="w-20 h-20 rounded-full object-cover mt-2"
          />
        </div>
        <div>
          <input
            type="text"
            value={userData.name}
            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
            className="text-lg font-semibold w-full"
          />
          <p className="text-gray-500">{userData.email}</p>
          <span className="text-sm bg-orange-200 text-orange-800 px-3 py-1 rounded-full">
            {userData.role}
          </span>
        </div>
      </div>


      {/* About Me */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2">About Me</h2>
        <textarea
          value={userData.bio}
          onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
          className="w-full border rounded-lg p-2 resize-none"
          rows={3}
          placeholder="Tell others about yourself, your experience, and what you can help with"
        />
      </div>

      {/* Skills & Expertise */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Skills & Expertise</h2>
        <div className="flex flex-wrap gap-2 mb-2">
          {userData?.skills?.map((skill, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
            >
              {skill}
              <button
                onClick={() => removeSkill(skill)}
                className="ml-2 text-blue-700 hover:text-red-600"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={inputSkill}
          onChange={(e) => setInputSkill(e.target.value)}
          onKeyDown={handleSkillAdd}
          placeholder="Type a skill and press Enter"
          className="w-full border rounded-lg p-2"
        />
      </div>

      {/* Save Button */}
      <div className="text-right">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
