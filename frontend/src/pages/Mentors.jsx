import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Calendar, Clock, User } from "lucide-react";

const Mentors = () => {
  const [mentors, setMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({
    topic: "",
    time: "",
    description: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestSession = async (mentor) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first!");
      return;
    }

    setSelectedMentor(mentor);
    setIsDialogOpen(true);
  };

  const submitSessionRequest = async () => {
    const token = localStorage.getItem("token");

    if (!requestForm.topic || !requestForm.time) {
      alert("Topic and time are required.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/sessions/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mentor_id: selectedMentor.id,
          topic: requestForm.topic,
          time: requestForm.time,
          description: requestForm.description
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Something went wrong");
      }

      // Success - close dialog and reset form
      setIsDialogOpen(false);
      setRequestForm({ topic: "", time: "", description: "" });
      alert("Session request sent successfully! The mentor will review your request.");

    } catch (err) {
      console.error("Error requesting session:", err.message);
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/mentors")
      .then((res) => res.json())
      .then((data) => setMentors(data))
      .catch((err) => console.error("Failed to fetch mentors", err));
  }, []);

  // Format datetime for input field
  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

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
          <option>All Skills</option>
          <option>Java</option>
          <option>Python</option>
          <option>React</option>
        </select>
        <select className="px-4 py-2 border rounded-lg">
          <option>Highest Rated</option>
          <option>Most Recent</option>
        </select>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {mentors.map((mentor) => (
          <div
            key={mentor.id}
            className="bg-white rounded-xl shadow-md p-5 flex flex-col justify-between hover:shadow-lg transition-shadow"
          >
            <div>
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                  {mentor.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{mentor.name}</h3>
                  <p className="text-gray-500 text-sm">{mentor.email}</p>
                </div>
              </div>

              <p className="text-sm mb-3 text-gray-600">
                {mentor.bio || "Experienced mentor ready to help you grow!"}
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

            <Dialog open={isDialogOpen && selectedMentor?.id === mentor.id} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <button
                  className="mt-auto bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                  onClick={() => handleRequestSession(mentor)}
                >
                  <Calendar className="w-4 h-4" />
                  Request Session
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Request Session with {selectedMentor?.name}
                  </DialogTitle>
                  <DialogDescription>
                    Send a mentorship session request to {selectedMentor?.name}. They will review and respond to your request.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="topic">Session Topic *</Label>
                    <Input
                      id="topic"
                      placeholder="e.g., Java Spring Boot Development"
                      value={requestForm.topic}
                      onChange={(e) => setRequestForm({ ...requestForm, topic: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="time" className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Preferred Date & Time *
                    </Label>
                    <Input
                      id="time"
                      type="datetime-local"
                      min={getCurrentDateTime()}
                      value={requestForm.time}
                      onChange={(e) => setRequestForm({ ...requestForm, time: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Additional Details</Label>
                    <Textarea
                      id="description"
                      placeholder="Tell the mentor what you'd like to learn or discuss..."
                      className="min-h-[100px]"
                      value={requestForm.description}
                      onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={submitSessionRequest}
                    disabled={isLoading || !requestForm.topic || !requestForm.time}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? "Sending..." : "Send Request"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Mentors;
