import { AlertCircle, Clock, CheckCircle2 } from "lucide-react";

export const CATEGORIES = [
  "Road & Infrastructure",
  "Waste Management",
  "Water Supply",
  "Street Lighting",
  "Public Safety",
  "Parks & Recreation",
  "Traffic Issues",
  "Noise Pollution",
  "Building Violations",
  "Other"
];

export const STATUS_CONFIG = {
  "reported": {
    label: "Reported",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: AlertCircle,
  },
  "in-progress": {
    label: "In Progress",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Clock,
  },
  "resolved": {
    label: "Resolved",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle2,
  }
} as const;
