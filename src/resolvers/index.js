import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  markAttendance,
  loginEmployee,
} from "../services/employeeService.js";
import { authenticate, authorize } from "../middleware/auth.js";

const resolvers = {
  Query: {
    employees: async (_, args, context) => {
      await authenticate(context);
      return getEmployees(args);
    },
    employee: async (_, { id }, context) => {
      await authenticate(context);
      return getEmployeeById(id);
    },
    me: async (_, __, context) => {
      await authenticate(context);
      return context.employee;
    },
  },
  Mutation: {
    login: async (_, { email, password }) => {
      return loginEmployee(email, password);
    },
    addEmployee: async (_, { input }, context) => {
      await authenticate(context);
      authorize(context, ["admin"]);
      return createEmployee(input);
    },
    updateEmployee: async (_, { id, input }, context) => {
      await authenticate(context);
      // Employees can update their own profile, admins can update any
      if (context.employee.role !== "admin" && context.employee.id !== id) {
        throw new Error("Unauthorized");
      }
      return updateEmployee(id, input);
    },
    deleteEmployee: async (_, { id }, context) => {
      await authenticate(context);
      authorize(context, ["admin"]);
      return deleteEmployee(id);
    },
    markAttendance: async (_, { employeeId, date, status }, context) => {
      await authenticate(context);
      // Employees can mark their own attendance, admins can mark for anyone
      if (
        context.employee.role !== "admin" &&
        context.employee.id !== employeeId
      ) {
        throw new Error("Unauthorized");
      }
      return markAttendance(employeeId, date, status);
    },
  },
};

export default resolvers;
