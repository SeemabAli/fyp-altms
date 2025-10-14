import mongoose from "mongoose";

// Import each model here to ensure they are registered with mongoose
import "@/models/User";
import "@/models/Course";
import "@/models/Classroom";
import "@/models/ScheduleEntry";
import "@/models/Enrollment";

// Export mongoose for convenience (optional)
export default mongoose;
