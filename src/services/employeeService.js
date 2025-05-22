import Employee from "../models/employee.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { getEmployeeLoader } from "../loaders/employeeLoader.js";

const employeeLoader = getEmployeeLoader();

import NodeCache from "node-cache";
const cache = new NodeCache({ stdTTL: 60 });

export const getEmployees = async ({
  filter,
  class: empClass,
  ageMin,
  ageMax,
  page,
  limit,
  sortBy,
  sortOrder,
}) => {
  const cacheKey = `employees-${filter}-${empClass}-${ageMin}-${ageMax}-${page}-${limit}-${sortBy}-${sortOrder}`;
  const cachedData = cache.get(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  const query = {};

  if (filter) {
    query.$text = { $search: filter };
  }

  if (empClass) {
    query.class = empClass;
  }

  if (ageMin || ageMax) {
    query.age = {};
    if (ageMin) query.age.$gte = ageMin;
    if (ageMax) query.age.$lte = ageMax;
  }

  const skip = (page - 1) * limit;
  const sortOptions = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const [employees, totalCount] = await Promise.all([
    Employee.find(query).sort(sortOptions).skip(skip).limit(limit).lean(),
    Employee.countDocuments(query),
  ]);

  const result = {
    employees,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };

  cache.set(cacheKey, result);
  return result;
};

export const getEmployeeById = async (id) => {
  return employeeLoader.load(id.toString());
};

export const createEmployee = async (input) => {
  const hashedPassword = await bcrypt.hash(input.password, 10);
  const employee = new Employee({
    ...input,
    password: hashedPassword,
  });
  return employee.save();
};

export const updateEmployee = async (id, input) => {
  if (input.password) {
    input.password = await bcrypt.hash(input.password, 10);
  }
  return Employee.findByIdAndUpdate(id, input, { new: true });
};

export const deleteEmployee = async (id) => {
  await Employee.findByIdAndDelete(id);
  return true;
};

export const markAttendance = async (employeeId, date, status) => {
  const employee = await Employee.findById(employeeId);
  if (!employee) throw new Error("Employee not found");

  // Check if attendance already marked for this date
  const existingIndex = employee.attendance.findIndex(
    (a) => new Date(a.date).toDateString() === new Date(date).toDateString()
  );

  const attendanceRecord = {
    date: new Date(date),
    status,
  };

  if (existingIndex >= 0) {
    employee.attendance[existingIndex] = attendanceRecord;
  } else {
    employee.attendance.push(attendanceRecord);
  }

  await employee.save();
  return attendanceRecord;
};

export const loginEmployee = async (email, password) => {
  const employee = await Employee.findOne({ email });
  if (!employee) throw new Error("Invalid credentials");

  const isMatch = await bcrypt.compare(password, employee.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = jwt.sign({ id: employee.id, role: employee.role }, "secret", {
    expiresIn: "1h",
  });

  return {
    token,
    employee,
  };
};
