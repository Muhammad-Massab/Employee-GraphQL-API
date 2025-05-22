import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  status: {
    type: String,
    enum: ["present", "absent", "leave"],
    required: true,
  },
});

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true, min: 18, max: 65 },
    class: { type: String, required: true },
    subjects: [{ type: String }],
    attendance: [attendanceSchema],
    role: { type: String, enum: ["admin", "employee"], default: "employee" },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

employeeSchema.index({ name: "text" });
employeeSchema.index({ email: 1 }, { unique: true });
employeeSchema.index({ class: 1 });

export default mongoose.model("Employee", employeeSchema);
