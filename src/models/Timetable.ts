import mongoose, { Schema, Document, Model } from "mongoose";

interface ITimetable extends Document {
  faculty: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  classroom: mongoose.Types.ObjectId;
  day: string;
  slot: string;
}

const TimetableSchema = new Schema<ITimetable>(
  {
    faculty: { type: Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    classroom: { type: Schema.Types.ObjectId, ref: "Classroom", required: true },
    day: { type: String, required: true },
    slot: { type: String, required: true },
  },
  { timestamps: true }
);

const Timetable: Model<ITimetable> =
  mongoose.models.Timetable || mongoose.model("Timetable", TimetableSchema);

export default Timetable;
