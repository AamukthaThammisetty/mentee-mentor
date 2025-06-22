import { Badge } from "../components/ui/badge"
import { Star } from "lucide-react"

const mentors = [
  {
    name: "Dr. Rao",
    title: "Mastering Data Structures",
    image: "https://source.unsplash.com/400x300/?professor,man",
    rating: 4.5,
    reviews: 128,
    time: "10:00 AM",
    badge: "Live",
  },
  {
    name: "Ms. Sneha",
    title: "React & Hooks Deep Dive",
    image: "https://source.unsplash.com/400x300/?woman,developer",
    rating: 4.8,
    reviews: 92,
    time: "2:30 PM",
    badge: "Upcoming",
  },
  {
    name: "Mr. Arjun",
    title: "System Design Explained",
    image: "https://source.unsplash.com/400x300/?teacher",
    rating: 4.2,
    reviews: 47,
    time: "4:00 PM",
    badge: "Live",
  },
]

export default function MentorCards() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
      {mentors.map((mentor, idx) => (
        <div
          key={idx}
          className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
        >

          <div className="p-4 space-y-1">
            <h2 className="font-semibold text-base">{mentor.title}</h2>
            <p className="text-sm text-gray-500">{mentor.name}</p>

            <div className="flex items-center gap-1 text-sm text-yellow-600 font-medium">
              <Star className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
              {mentor.rating}
              <span className="text-xs text-gray-400">({mentor.reviews})</span>
            </div>

            <p className="text-sm text-gray-800 font-semibold">🕒 {mentor.time}</p>

            <Badge
              variant={mentor.badge === "Live" ? "default" : "secondary"}
              className="mt-1"
            >
              {mentor.badge}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  )
}
