import type { Trip } from "@/types/trip";

export const trips: Trip[] = [
  {
    id: "1",
    slug: "barcelona-getaway",
    title: "Barcelona Getaway",
    dates: "Apr 12 → Apr 18",
    travelers: "2 travelers",
    status: "Active",
    nextActionTitle: "Leave for airport at 4:30 PM",
    nextActionDescription:
      "International flight check-in closes 1 hour before departure.",
    weatherSummary: "22°C Sunny",
    weatherNote: "Great weather for walking and outdoor dining.",
    nearby: [
      "Brunch spot 6 min away",
      "Pharmacy 4 min away",
      "Beach entrance 12 min away",
    ],
    timeline: [
      {
        time: "4:30 PM",
        title: "Leave for airport",
        note: "Make sure to arrive at the airport at least 2 hours before your flight.",
      },
      {
        time: "5:00 PM",
        title: "Check-in at the airport",
        note: "Proceed to the check-in counter and present your identification and boarding pass.",
      },
    ],
  },
  {
    id: "2",
    slug: "lagos-work-trip",
    title: "Lagos Work Trip",
    dates: "May 03 → May 07",
    travelers: "1 traveler",
    status: "Upcoming",
    nextActionTitle: "Pack laptop and travel adapter",
    nextActionDescription:
      "You have a client meeting the morning after arrival.",
    weatherSummary: "29°C Humid",
    weatherNote: "Warm weather with a chance of evening showers.",
    nearby: [
      "Coffee shop 3 min away",
      "Pharmacy 8 min away",
      "Meeting venue 10 min away",
    ],
    timeline: [
      {
        time: "7:00 AM",
        title: "Leave for airport",
        note: "Morning traffic can build up quickly.",
      },
      {
        time: "9:30 AM",
        title: "Flight departure",
        note: "Boarding usually begins 40 minutes before takeoff.",
      },
    ],
  },
];