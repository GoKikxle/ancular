export type TimelineItem = {
  time: string;
  title: string;
  note: string;
};

export type Trip = {
  id: string;
  slug: string;
  title: string;
  dates: string;
  travelers: string;
  status: string;
  nextActionTitle: string;
  nextActionDescription: string;
  documents: string[];
  weatherSummary: string;
  weatherNote: string;
  nearby: string[];
  timeline: TimelineItem[];
};