import mongoose, { Schema, Document, Types } from "mongoose";
export interface IStudent extends Document {
  user_id: Types.ObjectId; // Reference to a general User model if you have one
  registration_no: string;
  full_name: string; // For display purposes
  semester: number;
  program: string;
}

const StudentSchema: Schema = new Schema(
  {
    registration_no: {
      type: String,
      required: [true, "Registration number is required."],
      unique: true,
      trim: true,
    },
    full_name: {
      type: String,
      required: [true, "Full name is required."],
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, "Semester is required."],
      min: 1,
      max: 8,
    },
    program: {
      type: String,
      required: [true, "Program is required."],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Student =
  mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);

export default Student;
