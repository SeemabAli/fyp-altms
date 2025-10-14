import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITimeSlot extends Document {
  startTime: string;
  endTime: string;
}

export interface IClassroom extends Document {
  _id: string;
  name: string;
  capacity: number;
  type: "classroom" | "lab";
  multimedia: boolean;
  timeSlots: ITimeSlot[];
  createdAt: Date;
  updatedAt: Date;
}

const TimeSlotSchema: Schema<ITimeSlot> = new Schema({
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
});

const ClassroomSchema: Schema<IClassroom> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    capacity: { type: Number, required: true },
    type: {
      type: String,
      enum: ["classroom", "lab"],
      required: true,
    },
    multimedia: { type: Boolean, default: false },
    timeSlots: [TimeSlotSchema],
  },
  { timestamps: true }
);

const Classroom: Model<IClassroom> =
  mongoose.models.Classroom ||
  mongoose.model<IClassroom>("Classroom", ClassroomSchema);

export default Classroom;
