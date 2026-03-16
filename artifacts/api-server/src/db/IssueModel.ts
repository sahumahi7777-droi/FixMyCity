import mongoose, { Schema, Document } from "mongoose";

export interface IIssue extends Document {
  title: string;
  category: string;
  description: string;
  digiPin: string;
  location: string;
  reporterName: string;
  reporterEmail: string;
  reporterContact: string;
  status: "reported" | "in-progress" | "resolved";
  reportCount: number;
  adminNotes: string | null;
  submittedAt: Date;
  resolvedAt: Date | null;
}

const IssueSchema = new Schema<IIssue>(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    digiPin: { type: String, required: true },
    location: { type: String, default: "" },
    reporterName: { type: String, required: true },
    reporterEmail: { type: String, required: true },
    reporterContact: { type: String, required: true },
    status: {
      type: String,
      enum: ["reported", "in-progress", "resolved"],
      default: "reported",
    },
    reportCount: { type: Number, default: 1 },
    adminNotes: { type: String, default: null },
    submittedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date, default: null },
  },
  {
    timestamps: false,
  }
);

IssueSchema.index({ digiPin: 1, category: 1 });
IssueSchema.index({ submittedAt: -1 });
IssueSchema.index({ reporterEmail: 1 });

export const Issue = mongoose.models.Issue || mongoose.model<IIssue>("Issue", IssueSchema);
