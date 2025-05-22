import DataLoader from "dataloader";
import Employee from "../models/employee.js";

const batchGetEmployees = async (ids) => {
  const employees = await Employee.find({ _id: { $in: ids } }).lean();
  const employeeMap = {};
  employees.forEach((employee) => {
    employeeMap[employee._id.toString()] = employee;
  });
  return ids.map((id) => employeeMap[id] || null);
};

let employeeLoader;

export const getEmployeeLoader = () => {
  if (!employeeLoader) {
    employeeLoader = new DataLoader(batchGetEmployees, { cache: false });
  }
  return employeeLoader;
};
