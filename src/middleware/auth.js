import jwt from "jsonwebtoken";
import Employee from "../models/employee.js";

export const authenticate = async (context) => {
  const authHeader = context.req.headers.authorization;
  if (!authHeader) throw new Error("Authentication required");

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const employee = await Employee.findById(decoded.id).select("-password");
    if (!employee) throw new Error("Invalid token");

    context.employee = employee;
    return employee;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

export const authorize = (context, roles) => {
  if (!roles.includes(context.employee.role)) {
    throw new Error("Unauthorized access");
  }
};
