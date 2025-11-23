import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPreference extends Document {
  facultyId: Types.ObjectId;
  courses: Types.ObjectId[];    
  timeSlots: Types.ObjectId[];
  submittedAt: Date;
}

const PreferenceSchema = new Schema<IPreference>({
  facultyId: { type: Schema.Types.ObjectId, ref: "Faculty", required: true },
  courses: [{ type: Schema.Types.ObjectId, ref: "Course", required: true }], // array
  timeSlots: [{ type: Schema.Types.ObjectId, ref: "Timeslot", required: true }],
  submittedAt: { type: Date, default: Date.now },
});

const Preference =
  (mongoose.models.Preference as mongoose.Model<IPreference>) ||
  mongoose.model<IPreference>("Preference", PreferenceSchema);

export default Preference;
