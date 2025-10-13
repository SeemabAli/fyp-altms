import mongoose, { Schema, Document, Model } from "mongoose";

interface ITimetable extends Document {
  facultyId: string;
  courseCode: string;
  courseTitle: string;
  room: string;
  day: string;
  startTime: string;
  endTime: string;
  batch?: string;
}

const TimetableSchema = new Schema<ITimetable>(
  {
    facultyId: { type: String, required: true },
    courseCode: { type: String, required: true },
    courseTitle: { type: String, required: true },
    room: { type: String, required: true },
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    batch: { type: String },
  },
  { timestamps: true }
);

const Timetable: Model<ITimetable> =
  mongoose.models.Timetable || mongoose.model("Timetable", TimetableSchema);

export default Timetable;
