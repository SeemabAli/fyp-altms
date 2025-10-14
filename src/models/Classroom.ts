// src/models/Classroom.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IClassroom extends Document {
  classroomId: string;
  capacity: number;
  multimediaAvailable: boolean;
  building?: string | null;
  availableSlots?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ClassroomSchema = new Schema<IClassroom>(
  {
    classroomId: {
      type: String,
      required: true,
      unique: true, // ✅ enforce uniqueness
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    multimediaAvailable: {
      type: Boolean,
      required: true,
      default: false,
    },
    building: {
      type: String,
      default: null,
    },
    availableSlots: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const Classroom =
  mongoose.models.Classroom ||
  mongoose.model<IClassroom>("Classroom", ClassroomSchema);

export default Classroom;
