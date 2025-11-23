import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IFacultyPreference extends Document {
  facultyId: Types.ObjectId;
  courses: Types.ObjectId[];
  timestamp: Date;
}

const FacultyPreferenceSchema: Schema<IFacultyPreference> = new Schema(
  {
    facultyId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, 
    },
    courses: [
      {
        type: Schema.Types.ObjectId,
        ref: "Course",
        required: true,
      },
    ],
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const FacultyPreference: Model<IFacultyPreference> =
  mongoose.models.FacultyPreference ||
  mongoose.model<IFacultyPreference>(
    "FacultyPreference",
    FacultyPreferenceSchema
  );

export default FacultyPreference;
