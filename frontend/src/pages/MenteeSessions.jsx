import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Video, CheckCircle, XCircle, Loader } from "lucide-react";

const MenteeSessions = () => {
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [sessionRequests, setSessionRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUpcomingSessions = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/upcoming-sessions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUpcomingSessions(data);
      }
    } catch (error) {
      console.error("Error fetching upcoming sessions:", error);
    }
  };

  const fetchMyRequests = async () => {
    const token = localStorage.getItem("token");

    try {
      // This endpoint would need to be created to get mentee's own requests
      const response = await fetch("http://127.0.0.1:8000/api/my-session-requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSessionRequests(data);
      }
    } catch (error) {
      console.error("Error fetching session requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTimeUntilSession = (dateString) => {
    const sessionTime = new Date(dateString);
    const now = new Date();
    const diffMs = sessionTime - now;
    const diffMins = Math.ceil(diffMs / (1000 * 60));

    if (diffMins < 0) return "Session has passed";
    if (diffMins < 60) return `In ${diffMins} minutes`;

    const diffHours = Math.ceil(diffMins / 60);
    if (diffHours < 24) return `In ${diffHours} hours`;

    const diffDays = Math.ceil(diffHours / 24);
    return `In ${diffDays} days`;
  };

  const copyMeetLink = (meetLink) => {
    navigator.clipboard.writeText(meetLink);
    alert("Meet link copied to clipboard!");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700"><Loader className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  useEffect(() => {
    fetchUpcomingSessions();
    fetchMyRequests();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin mr-2" />
        Loading your sessions...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">My Sessions</h2>

      {/* Upcoming Sessions Section */}
      <div className="mb-8">
        <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          Upcoming Sessions ({upcomingSessions.length})
        </h3>

        {upcomingSessions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No upcoming sessions scheduled</p>
              <p className="text-gray-400 text-sm mt-2">Request a session with a mentor to get started!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {upcomingSessions.map((session) => {
              const isUpcoming = new Date(session.time) > new Date();
              return (
                <Card key={session.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl flex items-center gap-2">
                          {session.title}
                          {isUpcoming && (
                            <Badge className="bg-blue-100 text-blue-800">
                              {getTimeUntilSession(session.time)}
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-2 text-base">
                          {session.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {formatDateTime(session.time)}
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Mentor: {session.mentor?.name || 'Unknown'}
                        </div>
                      </div>

                      {session.meet_link && (
                        <div className="flex items-center gap-2 pt-2 border-t">
                          <Button
                            onClick={() => window.open(session.meet_link, '_blank')}
                            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                            disabled={!isUpcoming}
                          >
                            <Video className="w-4 h-4" />
                            {isUpcoming ? 'Join Meeting' : 'Session Ended'}
                          </Button>
                          {isUpcoming && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyMeetLink(session.meet_link)}
                            >
                              Copy Link
                            </Button>
                          )}
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

      {/* Session Requests Section */}
      <div>
        <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-6 h-6 text-orange-600" />
          My Session Requests ({sessionRequests.length})
        </h3>

        {sessionRequests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No session requests found</p>
              <p className="text-gray-400 text-sm mt-2">Your session requests will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {sessionRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{request.topic}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <User className="w-4 h-4" />
                        Mentor: {request.mentor?.name} ({request.mentor?.email})
                      </CardDescription>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      Requested time: {formatDateTime(request.time)}
                    </div>

                    {request.description && (
                      <div className="text-sm text-gray-600">
                        <strong>Details:</strong> {request.description}
                      </div>
                    )}

                    <div className="text-xs text-gray-500 pt-2 border-t">
                      Requested on: {formatDateTime(request.created_at)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenteeSessions;
