import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Calendar, Clock, User, Video, CheckCircle, XCircle, Loader } from "lucide-react";

export default function MentorSession() {
  const [sessions, setSessions] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedDateTime, setSelectedDateTime] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const token = localStorage.getItem("token");

  const fetchSessions = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/sessions", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(Array.isArray(data) ? data : []);
      } else {
        console.error("Failed to fetch sessions");
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/session-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPendingRequests(data || []);
      } else {
        console.error("Failed to fetch requests");
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchRequests();
  }, [token]);

  const handleAccept = async (requestId) => {
    const scheduledDateTime = selectedDateTime[requestId];

    if (!scheduledDateTime) {
      alert("Please select date and time.");
      return;
    }

    setActionLoading(requestId);

    try {
      const response = await fetch("http://localhost:8000/api/accept-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          request_id: requestId,
          scheduled_time: scheduledDateTime,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Session accepted successfully! Meet link generated.");
        fetchSessions();
        fetchRequests();
        setSelectedDateTime((prev) => {
          const updated = { ...prev };
          delete updated[requestId];
          return updated;
        });
      } else {
        throw new Error(data.detail || "Failed to accept session");
      }
    } catch (error) {
      console.error("Error accepting session:", error);
      alert(error.message || "Failed to accept session");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId) => {
    if (!confirm("Are you sure you want to reject this session request?")) {
      return;
    }

    setActionLoading(requestId);

    try {
      const response = await fetch(`http://localhost:8000/api/reject-session/${requestId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert("Session request rejected.");
        fetchRequests();
      } else {
        throw new Error(data.detail || "Failed to reject session");
      }
    } catch (error) {
      console.error("Error rejecting session:", error);
      alert(error.message || "Failed to reject session");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDateTimeChange = (id, value) => {
    setSelectedDateTime((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin mr-2" />
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Mentor Dashboard</h2>

      {/* Pending Requests */}
      <div className="mb-8">
        <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-6 h-6 text-orange-600" />
          Pending Session Requests ({pendingRequests.length})
        </h3>

        {pendingRequests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No pending session requests</p>
              <p className="text-gray-400 text-sm mt-2">When mentees request sessions, they'll appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pendingRequests.map((req) => (
              <Card key={req.id} className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {req.topic}
                  </CardTitle>
                  <CardDescription>
                    Request from: {req.requested_by?.name} ({req.requested_by?.email})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Requested time: {formatDateTime(req.time)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Created: {formatDateTime(req.created_at)}
                      </div>
                    </div>

                    {req.description && (
                      <div className="text-sm text-gray-600 p-3 bg-white rounded-lg">
                        <strong>Details:</strong> {req.description}
                      </div>
                    )}

                    <div className="border-t pt-4">
                      <Label htmlFor={`datetime-${req.id}`} className="text-sm font-medium">
                        Schedule Session Date & Time:
                      </Label>
                      <Input
                        id={`datetime-${req.id}`}
                        type="datetime-local"
                        min={getCurrentDateTime()}
                        value={selectedDateTime[req.id] || ""}
                        onChange={(e) => handleDateTimeChange(req.id, e.target.value)}
                        className="mt-2 mb-3"
                      />

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAccept(req.id)}
                          disabled={!selectedDateTime[req.id] || actionLoading === req.id}
                          className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                        >
                          {actionLoading === req.id ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          Accept & Schedule
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleReject(req.id)}
                          disabled={actionLoading === req.id}
                          className="border-red-200 text-red-700 hover:bg-red-50 flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* My Sessions */}
      <div>
        <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          My Sessions ({sessions.length})
        </h3>

        {sessions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No sessions scheduled</p>
              <p className="text-gray-400 text-sm mt-2">Accepted session requests will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {sessions.map((session) => {
              const isUpcoming = new Date(session.time) > new Date();
              const isPast = new Date(session.time) < new Date();

              return (
                <Card key={session.id} className={`${isPast ? "bg-gray-50 opacity-75" : "hover:shadow-md"} transition-shadow`}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {session.title}
                        {isPast && <Badge variant="secondary">Completed</Badge>}
                        {isUpcoming && <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>}
                      </div>
                    </CardTitle>
                    <CardDescription>{session.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {formatDateTime(session.time)}
                        </div>
                        {session.attendees && session.attendees.length > 0 && (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Attendees: {session.attendees.map((a) => a.name).join(", ")}
                          </div>
                        )}
                      </div>

                      {session.meet_link && (
                        <div className="flex items-center gap-2 pt-2 border-t">
                          <Video className="w-5 h-5 text-blue-500" />
                          <a
                            href={session.meet_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Join Meeting
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
