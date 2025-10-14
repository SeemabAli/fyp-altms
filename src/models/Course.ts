import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICourse extends Document {
  code: string;
  title: string;
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
    enrollment: { type: Number, required: true, min: 1 },
    multimediaRequired: { type: Boolean, default: false },
    studentBatch: { type: String, default: "" },
  },
  { timestamps: true }
);

CourseSchema.index({ code: 1 }, { unique: true });

const Course: Model<ICourse> =
  mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema);

export default Course;
