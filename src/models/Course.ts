import { Schema, Document, Model, models, model } from "mongoose";

export interface ICourse extends Document {
  code: string;
  title: string;
  creditHours: number;
  enrollment: number;
  multimediaRequired: boolean;
  studentBatch: string;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    code: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    creditHours: { type: Number, required: true, min: 1, max: 4, default: 3 },
    enrollment: { type: Number, required: true, min: 1 },
    multimediaRequired: { type: Boolean, default: false },
    studentBatch: { type: String, default: "" },
  },
  { timestamps: true }
);

const Course =
  (models?.Course as Model<ICourse>) ||
  model<ICourse>("Course", CourseSchema);

export default Course;
