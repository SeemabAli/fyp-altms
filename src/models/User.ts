import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: "admin" | "coordinator" | "faculty" | "student";
  designation?:
    | "Professor"
    | "Associate Professor"
    | "Assistant Professor"
    | "Lecturer"
    | null;
  batch?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    designation: {
      type: String,
      enum: [
        "Professor",
        "Associate Professor",
        "Assistant Professor",
        "Lecturer",
      ],
      default: null,
    },
    role: {
      type: String,
      enum: ["admin", "coordinator", "faculty", "student"],
      required: [true, "Role is required"],
    },
    batch: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
