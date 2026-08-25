// models/ScheduleEntry.ts
import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IScheduleEntry extends Document {
  courseId: Types.ObjectId;
  facultyId: Types.ObjectId;
  roomId: Types.ObjectId;
  day: string;
  slot: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleEntrySchema = new Schema<IScheduleEntry>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    facultyId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    roomId: { type: Schema.Types.ObjectId, ref: "Classroom", required: true },
    day: { type: String, required: true },
    slot: { type: String, required: true },
  },
  { timestamps: true }
);

// Indexes for fast querying and constraint safety
ScheduleEntrySchema.index({ day: 1, slot: 1, roomId: 1 });
ScheduleEntrySchema.index({ day: 1, slot: 1, facultyId: 1 });
ScheduleEntrySchema.index({ courseId: 1 });

const ScheduleEntry: Model<IScheduleEntry> =
  mongoose.models.ScheduleEntry ||
  mongoose.model<IScheduleEntry>("ScheduleEntry", ScheduleEntrySchema);

export default ScheduleEntry;
