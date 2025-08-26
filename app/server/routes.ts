import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertEmployeeSchema, insertTimesheetSchema, insertLeaveRequestSchema, insertLeavePolicySchema } from "@shared/schema";
import { z } from "zod";
import {
  ObjectStorageService,
  ObjectNotFoundError,
} from "./objectStorage";

// Employee authentication middleware
const isEmployeeAuthenticated = (req: any, res: any, next: any) => {
  if (req.session?.employeeId && req.session?.userType === 'employee') {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Check for employee session first
      if (req.session?.employeeId && req.session?.userType === 'employee') {
        const employee = await storage.getEmployee(req.session.employeeId);
        if (employee) {
          return res.json({
            id: employee.id,
            email: employee.email,
            firstName: employee.firstName,
            lastName: employee.lastName,
            positionTitle: employee.positionTitle,
            userType: 'employee'
          });
        }
      }

      // Fall back to regular Replit auth - use isAuthenticated middleware logic manually
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get user's company membership (for now, get the first one)
      const membership = await storage.getUserFirstMembership(userId);
      
      res.json({
        ...user,
        companyId: membership?.companyId || null,
        role: membership?.role || null,
        userType: 'admin'
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Company setup route for new users
  app.post('/api/setup/company', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { companyName, countryCode = 'US', currency = 'USD' } = req.body;
      
      if (!companyName) {
        return res.status(400).json({ message: "Company name is required" });
      }
      
      // Check if user already has a company
      const existingMembership = await storage.getUserFirstMembership(userId);
      if (existingMembership) {
        return res.status(400).json({ message: "User already belongs to a company" });
      }
      
      const company = await storage.createCompanyWithOwner(userId, {
        name: companyName,
        countryCode,
        currency
      });
      
      res.json(company);
    } catch (error) {
      console.error("Error setting up company:", error);
      res.status(500).json({ message: "Failed to setup company" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const membership = await storage.getUserFirstMembership(userId);
      
      if (!membership) {
        // Return empty stats for users without company
        return res.json({
          totalEmployees: 0,
          pendingTimesheets: 0,
          leaveRequests: 0,
          payrollStatus: 'Not Setup'
        });
      }
      
      const stats = await storage.getDashboardStats(membership.companyId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Employee routes
  app.get('/api/employees', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const membership = await storage.getUserFirstMembership(userId);
      
      if (!membership) {
        return res.json([]);
      }
      
      const employees = await storage.getEmployees(membership.companyId);
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.get('/api/employees/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const employee = await storage.getEmployee(id);
      
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      res.json(employee);
    } catch (error) {
      console.error("Error fetching employee:", error);
      res.status(500).json({ message: "Failed to fetch employee" });
    }
  });

  app.post('/api/employees', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "User not found" });
      }

      // Get user's company membership
      const membership = await storage.getUserFirstMembership(userId);
      if (!membership) {
        return res.status(404).json({ message: "No company found" });
      }

      const validatedData = insertEmployeeSchema.parse(req.body);
      // Ensure companyId is set to user's company
      const employeeData = { ...validatedData, companyId: membership.companyId };
      const employee = await storage.createEmployee(employeeData);
      res.status(201).json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating employee:", error);
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  app.put('/api/employees/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertEmployeeSchema.partial().parse(req.body);
      const employee = await storage.updateEmployee(id, validatedData);
      res.json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating employee:", error);
      res.status(500).json({ message: "Failed to update employee" });
    }
  });

  app.delete('/api/employees/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteEmployee(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting employee:", error);
      res.status(500).json({ message: "Failed to delete employee" });
    }
  });

  // Employee Portal Routes
  app.get('/api/employee/profile', isEmployeeAuthenticated, async (req: any, res) => {
    try {
      const employeeId = req.session.employeeId;
      const employee = await storage.getEmployee(employeeId);
      
      if (!employee) {
        return res.status(404).json({ message: "Employee profile not found" });
      }

      res.json(employee);
    } catch (error) {
      console.error("Error fetching employee profile:", error);
      res.status(500).json({ message: "Failed to fetch employee profile" });
    }
  });

  app.get('/api/employee/timesheets', isEmployeeAuthenticated, async (req: any, res) => {
    try {
      const employeeId = req.session.employeeId;
      const timesheets = await storage.getEmployeeTimesheets(employeeId);
      res.json(timesheets);
    } catch (error) {
      console.error("Error fetching employee timesheets:", error);
      res.status(500).json({ message: "Failed to fetch timesheets" });
    }
  });

  app.get('/api/employee/leave-requests', isEmployeeAuthenticated, async (req: any, res) => {
    try {
      const employeeId = req.session.employeeId;
      const leaveRequests = await storage.getEmployeeLeaveRequests(employeeId);
      res.json(leaveRequests);
    } catch (error) {
      console.error("Error fetching employee leave requests:", error);
      res.status(500).json({ message: "Failed to fetch leave requests" });
    }
  });

  // Create leave request
  app.post('/api/employee/leave-requests', isEmployeeAuthenticated, async (req: any, res) => {
    try {
      const employeeId = req.session.employeeId;
      
      // Convert quantity to string (decimal) for database storage
      const leaveRequestData = { 
        ...req.body, 
        employeeId, 
        status: 'SUBMITTED',
        quantity: typeof req.body.quantity === 'number' ? req.body.quantity.toString() : req.body.quantity
      };
      
      // Validate request data
      const validatedData = insertLeaveRequestSchema.parse(leaveRequestData);
      
      const leaveRequest = await storage.createLeaveRequest(validatedData);
      res.status(201).json(leaveRequest);
    } catch (error) {
      console.error('Error creating leave request:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid request data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create leave request' });
    }
  });

  // Employee leave policies
  app.get('/api/employee/leave-policies', isEmployeeAuthenticated, async (req: any, res) => {
    try {
      const employeeId = req.session.employeeId;
      const employee = await storage.getEmployee(employeeId);
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
      
      const leavePolicies = await storage.getCompanyLeavePolicies(employee.companyId);
      res.json(leavePolicies);
    } catch (error) {
      console.error('Error fetching leave policies:', error);
      res.status(500).json({ message: 'Failed to fetch leave policies' });
    }
  });

  app.get('/api/employee/payroll-docs', isEmployeeAuthenticated, async (req: any, res) => {
    try {
      const employeeId = req.session.employeeId;
      const payrollDocs = await storage.getEmployeePayrollDocs(employeeId);
      res.json(payrollDocs);
    } catch (error) {
      console.error("Error fetching employee payroll documents:", error);
      res.status(500).json({ message: "Failed to fetch payroll documents" });
    }
  });

  // Employee management routes for admin
  app.get('/api/employees', isAuthenticated, async (req, res) => {
    try {
      const employees = await storage.getAllEmployees();
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.post('/api/employees', isAuthenticated, async (req, res) => {
    try {
      const employeeData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(employeeData);
      res.status(201).json(employee);
    } catch (error) {
      console.error("Error creating employee:", error);
      res.status(400).json({ message: "Invalid employee data" });
    }
  });

  app.delete('/api/employees/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteEmployee(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting employee:", error);
      res.status(500).json({ message: "Failed to delete employee" });
    }
  });

  app.patch('/api/employees/:id/password', isAuthenticated, async (req, res) => {
    try {
      const { password } = req.body;
      await storage.updateEmployeePassword(req.params.id, password);
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });

  // Leave management routes for admin
  app.get('/api/leave-requests', isAuthenticated, async (req, res) => {
    try {
      const leaveRequests = await storage.getAllLeaveRequests();
      res.json(leaveRequests);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      res.status(500).json({ message: "Failed to fetch leave requests" });
    }
  });

  app.get('/api/admin/leave-requests', isAuthenticated, async (req, res) => {
    try {
      const leaveRequests = await storage.getAllLeaveRequestsWithEmployees();
      res.json(leaveRequests);
    } catch (error) {
      console.error("Error fetching leave requests with employees:", error);
      res.status(500).json({ message: "Failed to fetch leave requests" });
    }
  });

  app.patch('/api/leave-requests/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;
      
      if (!['APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedRequest = await storage.updateLeaveRequestStatus(id, status, reason);
      res.json(updatedRequest);
    } catch (error) {
      console.error("Error updating leave request status:", error);
      res.status(500).json({ message: "Failed to update leave request status" });
    }
  });

  // Get employee leave balance
  app.get('/api/employees/:employeeId/leave-balance', isAuthenticated, async (req, res) => {
    try {
      const { employeeId } = req.params;
      const leaveBalances = await storage.getEmployeeLeaveBalance(employeeId);
      
      // If no balances exist, return sample data for demonstration
      if (leaveBalances.length === 0) {
        const sampleBalance = [{
          id: 'sample-balance-1',
          employeeId: employeeId,
          policyId: 'sample-policy-1',
          periodStart: '2024-01-01',
          periodEnd: '2024-12-31',
          opening: '25.0',
          accrued: '25.0',
          taken: '5.0',
          adjusted: '0.0',
          closing: '20.0'
        }];
        return res.json(sampleBalance);
      }
      
      res.json(leaveBalances);
    } catch (error) {
      console.error("Error fetching employee leave balance:", error);
      res.status(500).json({ message: "Failed to fetch leave balance" });
    }
  });

  // Create new leave policy
  app.post('/api/leave-policies', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const membership = await storage.getUserFirstMembership(userId);
      if (!membership) {
        return res.status(404).json({ message: "No company membership found" });
      }

      const validatedData = insertLeavePolicySchema.parse({
        ...req.body,
        companyId: membership.companyId,
      });

      const leavePolicy = await storage.createLeavePolicy(validatedData);
      res.status(201).json(leavePolicy);
    } catch (error) {
      console.error("Error creating leave policy:", error);
      res.status(500).json({ message: "Failed to create leave policy" });
    }
  });

  // Get leave policies
  app.get('/api/leave-policies', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const membership = await storage.getUserFirstMembership(userId);
      if (!membership) {
        return res.status(404).json({ message: "No company membership found" });
      }

      const leavePolicies = await storage.getCompanyLeavePolicies(membership.companyId);
      res.json(leavePolicies);
    } catch (error) {
      console.error("Error fetching leave policies:", error);
      res.status(500).json({ message: "Failed to fetch leave policies" });
    }
  });

  // Get employee leave requests
  app.get('/api/employees/:id/leave-requests', isAuthenticated, async (req, res) => {
    try {
      const employeeId = req.params.id;
      const leaveRequests = await storage.getEmployeeLeaveRequests(employeeId);
      res.json(leaveRequests);
    } catch (error) {
      console.error("Error fetching employee leave requests:", error);
      res.status(500).json({ message: "Failed to fetch leave requests" });
    }
  });

  // Update leave request status (approve/reject)
  app.patch('/api/leave-requests/:id', isAuthenticated, async (req, res) => {
    try {
      const requestId = req.params.id;
      const { status } = req.body;
      
      if (!['APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be APPROVED or REJECTED" });
      }

      const updateData = {
        status,
        approvedAt: status === 'APPROVED' ? new Date() : null,
      };

      const updatedRequest = await storage.updateLeaveRequest(requestId, updateData);
      res.json(updatedRequest);
    } catch (error) {
      console.error("Error updating leave request:", error);
      res.status(500).json({ message: "Failed to update leave request" });
    }
  });

  // Get advanced analytics data
  app.get('/api/analytics/advanced', isAuthenticated, async (req, res) => {
    try {
      // Return sample analytics data for now
      const analyticsData = {
        employeeGrowth: {
          current: 12,
          previous: 10,
          trend: 'up',
          percentage: 20
        },
        averageProductivity: {
          score: 8.2,
          trend: 'up',
          change: 0.3
        },
        leaveUtilization: {
          percentage: 72,
          trend: 'down',
          change: -5
        },
        upcomingReviews: 3,
        pendingOnboarding: 2,
        atRiskEmployees: 1
      };
      res.json(analyticsData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Timesheet management routes for admin
  app.get('/api/timesheets', isAuthenticated, async (req, res) => {
    try {
      const timesheets = await storage.getAllTimesheets();
      res.json(timesheets);
    } catch (error) {
      console.error("Error fetching timesheets:", error);
      res.status(500).json({ message: "Failed to fetch timesheets" });
    }
  });

  // Set Employee Password
  app.put('/api/employees/:id/password', isAuthenticated, async (req, res) => {
    try {
      console.log("Password setting request for employee ID:", req.params.id);
      console.log("Request body:", req.body);
      console.log("User authenticated:", !!req.user);
      
      const { id } = req.params;
      const { password } = req.body;

      if (!password || password.length < 8) {
        console.log("Password validation failed - too short");
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }

      // Hash the password before storing
      const bcrypt = await import('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);
      
      console.log("Attempting to set password for employee:", id);
      await storage.setEmployeePassword(id, hashedPassword);
      console.log("Password set successfully for employee:", id);
      
      res.json({ message: "Password set successfully" });
    } catch (error) {
      console.error("Error setting employee password:", error);
      res.status(500).json({ message: "Failed to set password" });
    }
  });

  // Employee Login
  app.post('/api/auth/employee-login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Find employee by email
      const employee = await storage.getEmployeeByEmail(email);
      if (!employee || !employee.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Verify password
      const bcrypt = await import('bcryptjs');
      const isValid = await bcrypt.compare(password, employee.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Create a session for the employee
      // For now, we'll create a simple session marker
      (req.session as any).employeeId = employee.id;
      (req.session as any).userType = 'employee';

      res.json({ 
        message: "Login successful", 
        employee: {
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          positionTitle: employee.positionTitle
        }
      });
    } catch (error) {
      console.error("Error during employee login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Employee logout endpoint
  app.post('/api/auth/employee-logout', async (req, res) => {
    try {
      if (req.session) {
        req.session.destroy((err) => {
          if (err) {
            console.error('Session destruction error:', err);
            return res.status(500).json({ message: 'Logout failed' });
          }
          res.clearCookie('connect.sid');
          res.json({ message: 'Logout successful' });
        });
      } else {
        res.json({ message: 'Already logged out' });
      }
    } catch (error) {
      console.error('Employee logout error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Timesheet routes
  app.get('/api/timesheets', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const employeeId = req.query.employeeId as string;
      const membership = await storage.getUserFirstMembership(userId);
      
      if (!membership) {
        return res.json([]);
      }
      
      let timesheets;
      if (employeeId) {
        timesheets = await storage.getEmployeeTimesheets(employeeId);
      } else {
        timesheets = await storage.getTimesheets(membership.companyId);
      }
      
      res.json(timesheets);
    } catch (error) {
      console.error("Error fetching timesheets:", error);
      res.status(500).json({ message: "Failed to fetch timesheets" });
    }
  });

  app.post('/api/timesheets', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertTimesheetSchema.parse(req.body);
      const timesheet = await storage.createTimesheet(validatedData);
      res.status(201).json(timesheet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating timesheet:", error);
      res.status(500).json({ message: "Failed to create timesheet" });
    }
  });

  app.put('/api/timesheets/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertTimesheetSchema.partial().parse(req.body);
      const timesheet = await storage.updateTimesheet(id, validatedData);
      res.json(timesheet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating timesheet:", error);
      res.status(500).json({ message: "Failed to update timesheet" });
    }
  });

  // Leave request routes
  app.get('/api/leave-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const employeeId = req.query.employeeId as string;
      const status = req.query.status as string;
      const membership = await storage.getUserFirstMembership(userId);
      
      if (!membership) {
        return res.json([]);
      }
      
      let leaveRequests;
      if (employeeId) {
        leaveRequests = await storage.getEmployeeLeaveRequests(employeeId);
      } else {
        leaveRequests = await storage.getLeaveRequests(membership.companyId);
      }
      
      // Filter by status if provided
      if (status) {
        leaveRequests = leaveRequests.filter((request: any) => request.status === status);
      }
      
      res.json(leaveRequests);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      res.status(500).json({ message: "Failed to fetch leave requests" });
    }
  });

  app.post('/api/leave-requests', isAuthenticated, async (req, res) => {
    try {
      // Ensure quantity is string for decimal validation
      if (req.body.quantity && typeof req.body.quantity === 'number') {
        req.body.quantity = req.body.quantity.toString();
      }
      
      console.log("Received leave request data:", JSON.stringify(req.body, null, 2));
      const validatedData = insertLeaveRequestSchema.parse(req.body);
      console.log("Validated data:", JSON.stringify(validatedData, null, 2));
      const leaveRequest = await storage.createLeaveRequest(validatedData);
      res.status(201).json(leaveRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating leave request:", error);
      res.status(500).json({ message: "Failed to create leave request" });
    }
  });

  app.put('/api/leave-requests/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertLeaveRequestSchema.partial().parse(req.body);
      const leaveRequest = await storage.updateLeaveRequest(id, validatedData);
      res.json(leaveRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating leave request:", error);
      res.status(500).json({ message: "Failed to update leave request" });
    }
  });

  // Object storage routes for document uploads
  app.post('/api/objects/upload', isAuthenticated, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  });

  // Employee payroll documents routes
  app.get('/api/employees/:id/payroll-documents', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const documents = await storage.getEmployeePayrollDocuments(id);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching payroll documents:", error);
      res.status(500).json({ message: "Failed to fetch payroll documents" });
    }
  });

  app.put('/api/employees/:id/payroll-documents', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { documentUrl, fileName, payrollMonth, payrollYear, uploadedAt } = req.body;
      
      if (!documentUrl || !fileName || !payrollMonth || !payrollYear) {
        return res.status(400).json({ message: "Document URL, filename, payroll month, and year are required" });
      }

      // Gets the authenticated user id for ACL policy
      const userId = req.user?.claims?.sub;
      const objectStorageService = new ObjectStorageService();
      
      // Set ACL policy for the uploaded document (private - only accessible by admin/HR)
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        documentUrl,
        {
          owner: userId,
          visibility: "private", // Payroll documents are private
        }
      );

      // Save document record to database
      const document = await storage.createEmployeePayrollDocument({
        employeeId: id,
        fileName,
        documentUrl: objectPath,
        payrollMonth,
        payrollYear,
        uploadedAt: uploadedAt ? new Date(uploadedAt) : new Date(),
        uploadedBy: userId,
      });

      res.json(document);
    } catch (error) {
      console.error("Error saving payroll document:", error);
      res.status(500).json({ message: "Failed to save payroll document" });
    }
  });

  // Route to serve private payroll documents
  app.get("/objects/:objectPath(*)", isAuthenticated, async (req, res) => {
    const userId = req.user?.claims?.sub;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: "read" as any,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Master data routes
  app.get('/api/locations', isAuthenticated, async (req: any, res) => {
    try {
      const companyId = req.query.companyId as string;
      if (!companyId) {
        return res.status(400).json({ message: "Company ID is required" });
      }
      
      const locations = await storage.getLocations(companyId);
      res.json(locations);
    } catch (error) {
      console.error("Error fetching locations:", error);
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });

  app.get('/api/cost-centers', isAuthenticated, async (req: any, res) => {
    try {
      const companyId = req.query.companyId as string;
      if (!companyId) {
        return res.status(400).json({ message: "Company ID is required" });
      }
      
      const costCenters = await storage.getCostCenters(companyId);
      res.json(costCenters);
    } catch (error) {
      console.error("Error fetching cost centers:", error);
      res.status(500).json({ message: "Failed to fetch cost centers" });
    }
  });

  app.get('/api/work-schedules', isAuthenticated, async (req: any, res) => {
    try {
      const companyId = req.query.companyId as string;
      if (!companyId) {
        return res.status(400).json({ message: "Company ID is required" });
      }
      
      const workSchedules = await storage.getWorkSchedules(companyId);
      res.json(workSchedules);
    } catch (error) {
      console.error("Error fetching work schedules:", error);
      res.status(500).json({ message: "Failed to fetch work schedules" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
