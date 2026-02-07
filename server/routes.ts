import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { notificationService } from "./notificationService";
import { paymentService } from "./paymentService";
import { wearableService } from "./wearableService";
import { digitalSignatureService } from "./digitalSignatureService";
import { mfaService } from "./mfaService";
import { mockMedicines } from "./comprehensiveMockData";
import {
  insertDepartmentSchema,
  insertDoctorSchema,
  insertAppointmentSchema,
  insertMedicineSchema,
  insertPrescriptionSchema,
  insertPrescriptionItemSchema,
  insertVitalSchema,
  insertAllergySchema,
  insertDocumentSchema,
  insertFamilyMemberSchema,
  insertBillSchema,
  insertFavoriteSchema,
  insertNotificationSchema,
  insertNotificationPreferenceSchema,
  insertVaccinationSchema,
} from "./schema-sqlite";
import { z } from "zod";
import { insertMessageSchema } from "./schema-sqlite";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  await setupAuth(app);

  // ============================================================
  // Health Check Endpoints (required for Docker/Kubernetes)
  // ============================================================
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      uptime: process.uptime()
    });
  });

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // ============================================================
  // Auth routes
  // ============================================================
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    console.log("Server: /api/auth/user called, cookies:", req.cookies);
    // In development mode, return the mock user data if role is selected
    if (process.env.NODE_ENV !== "production") {
      // Get role from cookie if available
      const devRole = req.cookies?.devRole;
      if (!devRole) {
        console.log("Server: No devRole cookie, returning null");
        return res.json(null);
      }
      console.log("Server: Dev mode, devRole from cookie:", devRole);

      // Default mock user data based on role - use consistent IDs
      let mockUserData = {
        id: "dev-user",
        email: "dev@localhost",
        firstName: "Dev",
        lastName: "User",
        profileImageUrl: "",
        role: "patient",
        phone: "+1 (555) 123-4567",
        dateOfBirth: "1985-06-15",
        gender: "Male",
        address: "123 Main St, City, State 12345"
      };

      // Customize mock data based on role but keep consistent IDs
      if (devRole === "doctor" || devRole === "dev-doctor") {
        mockUserData = {
          id: "dev-doctor",
          email: "dr.dev@hospital.com",
          firstName: "Dr. Dev",
          lastName: "User",
          profileImageUrl: "",
          role: "doctor",
          phone: "+1 (555) 111-2222",
          dateOfBirth: "1980-01-15",
          gender: "Female",
          address: "456 Medical Ave, Health City, HC 56789"
        };
      } else if (devRole === "doctor-1-user") {
        mockUserData = {
          id: "doctor-1-user",
          email: "dr.sarah.smith@hospital.com",
          firstName: "Sarah",
          lastName: "Smith",
          profileImageUrl: "",
          role: "doctor",
          phone: "+1 (555) 111-2222",
          dateOfBirth: "1975-08-20",
          gender: "Female",
          address: "123 Hospital Dr, Medical City, MC 12345"
        };
      } else if (devRole === "doctor-2-user") {
        mockUserData = {
          id: "doctor-2-user",
          email: "dr.michael.johnson@hospital.com",
          firstName: "Michael",
          lastName: "Johnson",
          profileImageUrl: "",
          role: "doctor",
          phone: "+1 (555) 333-4444",
          dateOfBirth: "1970-05-15",
          gender: "Male",
          address: "456 Clinic Ave, Health Town, HT 67890"
        };
      } else if (devRole === "doctor-3-user") {
        mockUserData = {
          id: "doctor-3-user",
          email: "dr.emily.brown@hospital.com",
          firstName: "Emily",
          lastName: "Brown",
          profileImageUrl: "",
          role: "doctor",
          phone: "+1 (555) 555-6666",
          dateOfBirth: "1978-12-03",
          gender: "Female",
          address: "789 Medical Plaza, Wellness City, WC 54321"
        };
      } else if (devRole === "admin") {
        mockUserData = {
          id: "dev-admin",
          email: "admin@hospital.com",
          firstName: "Admin",
          lastName: "User",
          profileImageUrl: "",
          role: "admin",
          phone: "+1 (555) 777-8888",
          dateOfBirth: "1975-12-10",
          gender: "Other",
          address: "789 Admin Plaza, System City, SC 98765"
        };
      } else if (devRole === "patient") {
        // Explicitly handle patient role
        mockUserData = {
          id: "dev-user",
          email: "patient@localhost",
          firstName: "John",
          lastName: "Doe",
          profileImageUrl: "",
          role: "patient",
          phone: "+1 (555) 123-4567",
          dateOfBirth: "1985-06-15",
          gender: "Male",
          address: "123 Main St, City, State 12345"
        };
      }

      console.log("Server: Returning mock user:", mockUserData);
      return res.json(mockUserData);
    }
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Department routes
  app.get("/api/departments", async (req, res) => {
    try {
      const departments = await storage.getDepartments();
      res.json(departments);
    } catch (error) {
      console.error("Error fetching departments:", error);
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });

  app.get("/api/departments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const department = await storage.getDepartment(id);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      res.json(department);
    } catch (error) {
      console.error("Error fetching department:", error);
      res.status(500).json({ message: "Failed to fetch department" });
    }
  });

  // Doctor routes (public)
  app.get("/api/doctors", async (req, res) => {
    try {
      const departmentId = req.query.departmentId ? parseInt(req.query.departmentId as string) : null;
      if (departmentId) {
        const doctors = await storage.getDoctorsByDepartment(departmentId);
        res.json(doctors);
      } else {
        const doctors = await storage.getDoctors();
        res.json(doctors);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      res.status(500).json({ message: "Failed to fetch doctors" });
    }
  });

  app.get("/api/doctors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const doctor = await storage.getDoctor(id);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      res.json(doctor);
    } catch (error) {
      console.error("Error fetching doctor:", error);
      res.status(500).json({ message: "Failed to fetch doctor" });
    }
  });

  app.get("/api/doctors/:id/schedules", async (req, res) => {
    try {
      const doctorId = parseInt(req.params.id);
      const schedules = await storage.getDoctorSchedules(doctorId);
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      res.status(500).json({ message: "Failed to fetch schedules" });
    }
  });

  // Patient routes
  app.get("/api/appointments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const appointments = await storage.getAppointments(userId);

      // Populate doctor information
      const appointmentsWithDoctor = await Promise.all(
        appointments.map(async (appointment) => {
          if (appointment.doctorId) {
            const doctor = await storage.getDoctor(appointment.doctorId);
            return {
              ...appointment,
              doctor: doctor ? {
                id: doctor.id,
                firstName: doctor.user?.firstName || '',
                lastName: doctor.user?.lastName || '',
                specialty: doctor.specialty || '',
                qualification: doctor.qualification || ''
              } : null
            };
          }
          return appointment;
        })
      );

      res.json(appointmentsWithDoctor);
    } catch (error) {
      // In development mode, if database is not available, return empty array
      if (process.env.NODE_ENV !== "production") {
        console.warn("Database not available, returning empty array in development mode for appointments");
        return res.json([]);
      }
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.post("/api/appointments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertAppointmentSchema.parse({ ...req.body, patientId: userId });
      const appointment = await storage.createAppointment(data);

      // Send notification to patient
      const doctor = await storage.getDoctor(appointment.doctorId);
      const doctorUser = doctor ? await storage.getUser(doctor.userId) : null;
      const doctorName = doctorUser ? `${doctorUser.firstName} ${doctorUser.lastName}` : 'Doctor';

      await notificationService.notifyAppointmentBooked(userId, {
        doctorName,
        dateTime: `${appointment.appointmentDate} at ${appointment.appointmentTime}`,
      });

      // Send notification to doctor
      if (doctorUser) {
        const patientUser = await storage.getUser(userId);
        const patientName = patientUser ? `${patientUser.firstName} ${patientUser.lastName}` : 'Patient';

        await notificationService.sendNotificationToUser(doctorUser.id, {
          title: "New Appointment Booked",
          message: `${patientName} has booked an appointment for ${appointment.appointmentDate} at ${appointment.appointmentTime}`,
          type: "appointment",
          priority: "high",
        });
      }

      res.status(201).json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  // Cancel appointment route (must be before general update route)
  app.patch("/api/appointments/:id/cancel", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const appointment = await storage.getAppointment(id);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      const updatedAppointment = await storage.updateAppointment(id, { status: "cancelled" });

      // Send cancellation notifications
      await notificationService.notifyAppointmentCancelled(appointment.patientId, appointment.doctorId);

      res.json(updatedAppointment);
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      res.status(500).json({ message: "Failed to cancel appointment" });
    }
  });

  app.patch("/api/appointments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const appointment = await storage.getAppointment(id);

      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      // Check if user owns this appointment or is the doctor
      const doctor = await storage.getDoctorByUserId(userId);
      if (appointment.patientId !== userId && (!doctor || doctor.id !== appointment.doctorId)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedAppointment = await storage.updateAppointment(id, req.body);

      // Send notifications based on status changes
      if (req.body.status && req.body.status !== appointment.status) {
        if (req.body.status === 'completed') {
          await notificationService.notifyAppointmentCompleted(appointment.patientId, appointment.doctorId);
        } else if (req.body.status === 'cancelled') {
          await notificationService.notifyAppointmentCancelled(appointment.patientId, appointment.doctorId);
        } else if (req.body.status === 'no_show') {
          await notificationService.notifyAppointmentNoShow(appointment.patientId, appointment.doctorId);
        }
      }

      res.json(updatedAppointment);
    } catch (error) {
      console.error("Error updating appointment:", error);
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });

  app.delete("/api/appointments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const appointment = await storage.getAppointment(id);

      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      // Check if user owns this appointment or is the doctor
      const doctor = await storage.getDoctorByUserId(userId);
      if (appointment.patientId !== userId && (!doctor || doctor.id !== appointment.doctorId)) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteAppointment(id);

      // Send notification about appointment deletion
      await notificationService.notifyAppointmentDeleted(appointment.patientId, appointment.doctorId);

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting appointment:", error);
      res.status(500).json({ message: "Failed to delete appointment" });
    }
  });

  app.get("/api/vitals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const vitals = await storage.getVitals(userId);
      res.json(vitals);
    } catch (error) {
      // In development mode, if database is not available, return empty array
      if (process.env.NODE_ENV !== "production") {
        console.warn("Database not available, returning empty array in development mode for vitals");
        return res.json([]);
      }
      console.error("Error fetching vitals:", error);
      res.status(500).json({ message: "Failed to fetch vitals" });
    }
  });

  app.post("/api/vitals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertVitalSchema.parse({ ...req.body, patientId: userId });
      const vital = await storage.createVital(data);

      // Notify doctors about the new vital
      await notificationService.notifyVitalAdded(userId, data.type, data.value, data.unit || '');

      res.status(201).json(vital);
    } catch (error) {
      console.error("Error creating vital:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create vital" });
    }
  });

  app.delete("/api/vitals/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteVital(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting vital:", error);
      res.status(500).json({ message: "Failed to delete vital" });
    }
  });

  app.get("/api/allergies", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const allergies = await storage.getAllergies(userId);
      res.json(allergies);
    } catch (error) {
      // In development mode, if database is not available, return empty array
      if (process.env.NODE_ENV !== "production") {
        console.warn("Database not available, returning empty array in development mode for allergies");
        return res.json([]);
      }
      console.error("Error fetching allergies:", error);
      res.status(500).json({ message: "Failed to fetch allergies" });
    }
  });

  app.post("/api/allergies", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertAllergySchema.parse({ ...req.body, patientId: userId });
      const allergy = await storage.createAllergy(data);
      res.status(201).json(allergy);
    } catch (error) {
      console.error("Error creating allergy:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create allergy" });
    }
  });

  app.delete("/api/allergies/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAllergy(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting allergy:", error);
      res.status(500).json({ message: "Failed to delete allergy" });
    }
  });

  app.get("/api/prescriptions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const prescriptions = await storage.getPrescriptions(userId);
      res.json(prescriptions);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      res.status(500).json({ message: "Failed to fetch prescriptions" });
    }
  });

  app.get("/api/prescriptions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const prescription = await storage.getPrescription(id);

      if (!prescription) {
        return res.status(404).json({ message: "Prescription not found" });
      }

      // Check if user owns this prescription or is the doctor who created it
      const doctor = await storage.getDoctorByUserId(userId);
      if (prescription.patientId !== userId && (!doctor || doctor.id !== prescription.doctorId)) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(prescription);
    } catch (error) {
      console.error("Error fetching prescription:", error);
      res.status(500).json({ message: "Failed to fetch prescription" });
    }
  });

  app.get("/api/appointments/:appointmentId/prescriptions", isAuthenticated, async (req: any, res) => {
    try {
      const appointmentId = parseInt(req.params.appointmentId);
      const userId = req.user.claims.sub;

      // Get the appointment to check permissions
      const appointment = await storage.getAppointment(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      // Check if user owns this appointment or is the doctor
      const doctor = await storage.getDoctorByUserId(userId);
      if (appointment.patientId !== userId && (!doctor || doctor.id !== appointment.doctorId)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const prescriptions = await storage.getPrescriptionsByAppointment(appointmentId);
      res.json(prescriptions);
    } catch (error) {
      console.error("Error fetching prescriptions by appointment:", error);
      res.status(500).json({ message: "Failed to fetch prescriptions" });
    }
  });

  app.patch("/api/prescriptions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const prescription = await storage.getPrescription(id);

      if (!prescription) {
        return res.status(404).json({ message: "Prescription not found" });
      }

      // Only the doctor who created the prescription can update it
      const doctor = await storage.getDoctorByUserId(userId);
      if (!doctor || doctor.id !== prescription.doctorId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // In a real implementation, you'd update the prescription
      // For now, we'll return the existing prescription
      res.json(prescription);
    } catch (error) {
      console.error("Error updating prescription:", error);
      res.status(500).json({ message: "Failed to update prescription" });
    }
  });

  app.delete("/api/prescriptions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const prescription = await storage.getPrescription(id);

      if (!prescription) {
        return res.status(404).json({ message: "Prescription not found" });
      }

      // Only the doctor who created the prescription can delete it
      const doctor = await storage.getDoctorByUserId(userId);
      if (!doctor || doctor.id !== prescription.doctorId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // In a real implementation, you'd delete the prescription
      // For now, we'll just return success
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting prescription:", error);
      res.status(500).json({ message: "Failed to delete prescription" });
    }
  });

  app.get("/api/documents", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const documents = await storage.getDocuments(userId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post("/api/documents", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertDocumentSchema.parse({ ...req.body, patientId: userId, uploadedBy: userId });
      const document = await storage.createDocument(data);
      res.status(201).json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create document" });
    }
  });


  // Family member routes
  app.get("/api/family-members", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const members = await storage.getFamilyMembers(userId);
      res.json(members);
    } catch (error) {
      console.error("Error fetching family members:", error);
      res.status(500).json({ message: "Failed to fetch family members" });
    }
  });

  app.post("/api/family-members", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertFamilyMemberSchema.parse({ ...req.body, primaryUserId: userId });
      const member = await storage.createFamilyMember(data);
      res.status(201).json(member);
    } catch (error) {
      console.error("Error creating family member:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create family member" });
    }
  });

  app.delete("/api/family-members/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFamilyMember(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting family member:", error);
      res.status(500).json({ message: "Failed to delete family member" });
    }
  });

  // Bill routes
  app.get("/api/bills", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bills = await storage.getBills(userId);
      res.json(bills);
    } catch (error) {
      console.error("Error fetching bills:", error);
      res.status(500).json({ message: "Failed to fetch bills" });
    }
  });

  app.post("/api/bills", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertBillSchema.parse({ ...req.body, patientId: userId });
      const bill = await storage.createBill(data);
      res.status(201).json(bill);
    } catch (error) {
      console.error("Error creating bill:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create bill" });
    }
  });

  app.patch("/api/bills/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const bill = await storage.updateBill(id, req.body);
      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }

      // Send payment success notification if status changed to paid
      if (req.body.status === 'paid') {
        await notificationService.notifyPaymentSuccess(bill.patientId, parseFloat(bill.amount.toString()));
      }

      res.json(bill);
    } catch (error) {
      console.error("Error updating bill:", error);
      res.status(500).json({ message: "Failed to update bill" });
    }
  });

  // Favorites routes
  app.get("/api/favorites", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const favorites = await storage.getFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertFavoriteSchema.parse({ ...req.body, patientId: userId });
      const favorite = await storage.addFavorite(data);
      res.status(201).json(favorite);
    } catch (error) {
      console.error("Error creating favorite:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create favorite" });
    }
  });

  app.delete("/api/favorites/:doctorId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const doctorId = parseInt(req.params.doctorId);
      await storage.removeFavorite(userId, doctorId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting favorite:", error);
      res.status(500).json({ message: "Failed to delete favorite" });
    }
  });

  // Notifications routes
  app.get("/api/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const data = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(data);
      res.status(201).json(notification);
    } catch (error) {
      console.error("Error creating notification:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create notification" });
    }
  });

  app.patch("/api/notifications/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const notification = await storage.markNotificationAsRead(id);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Notification preferences routes
  app.get("/api/notification-preferences", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = await storage.getNotificationPreferences(userId);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
      res.status(500).json({ message: "Failed to fetch notification preferences" });
    }
  });

  app.patch("/api/notification-preferences", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = await storage.updateNotificationPreferences(userId, req.body);
      res.json(preferences);
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      res.status(500).json({ message: "Failed to update notification preferences" });
    }
  });

  // Vaccination routes
  app.get("/api/vaccinations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const vaccinations = await storage.getVaccinations(userId);
      res.json(vaccinations);
    } catch (error) {
      console.error("Error fetching vaccinations:", error);
      res.status(500).json({ message: "Failed to fetch vaccinations" });
    }
  });

  app.post("/api/vaccinations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertVaccinationSchema.parse({ ...req.body, patientId: userId });
      const vaccination = await storage.createVaccination(data);
      res.status(201).json(vaccination);
    } catch (error) {
      console.error("Error creating vaccination:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create vaccination" });
    }
  });

  app.patch("/api/vaccinations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const vaccination = await storage.updateVaccination(id, req.body);
      if (!vaccination) {
        return res.status(404).json({ message: "Vaccination not found" });
      }
      res.json(vaccination);
    } catch (error) {
      console.error("Error updating vaccination:", error);
      res.status(500).json({ message: "Failed to update vaccination" });
    }
  });

  app.delete("/api/vaccinations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteVaccination(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting vaccination:", error);
      res.status(500).json({ message: "Failed to delete vaccination" });
    }
  });

  // Mark appointment as no-show route
  app.patch("/api/appointments/:id/no-show", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const appointment = await storage.getAppointment(id);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      const updatedAppointment = await storage.updateAppointment(id, { status: "no_show" });

      // Send no-show notifications
      await notificationService.notifyAppointmentNoShow(appointment.patientId, appointment.doctorId);

      res.json(updatedAppointment);
    } catch (error) {
      console.error("Error marking appointment as no-show:", error);
      res.status(500).json({ message: "Failed to mark appointment as no-show" });
    }
  });

  // Doctor routes (authenticated)
  app.get("/api/doctor/appointments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const doctor = await storage.getDoctorByUserId(userId);
      if (!doctor) {
        return res.status(403).json({ message: "Not authorized as doctor" });
      }
      const appointments = await storage.getAppointmentsByDoctor(doctor.id);

      // Populate patient information if not already included
      const appointmentsWithPatient = await Promise.all(
        appointments.map(async (appointment) => {
          if (appointment.patientId && !appointment.patient) {
            const patient = await storage.getUser(appointment.patientId);
            return {
              ...appointment,
              patient: patient ? {
                id: patient.id,
                firstName: patient.firstName || '',
                lastName: patient.lastName || '',
                email: patient.email || '',
                phone: patient.phone || ''
              } : null
            };
          }
          return appointment;
        })
      );

      res.json(appointmentsWithPatient);
    } catch (error) {
      console.error("Error fetching doctor appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.get("/api/doctor/appointments/today", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const doctor = await storage.getDoctorByUserId(userId);
      if (!doctor) {
        return res.status(403).json({ message: "Not authorized as doctor" });
      }
      // Use UTC dates to avoid timezone issues
      const now = new Date();
      const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const tomorrow = new Date(today);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      const appointments = await storage.getDoctorAppointmentsForDate(doctor.id, today, tomorrow);

      // Populate patient information if not already included
      const appointmentsWithPatient = await Promise.all(
        appointments.map(async (appointment) => {
          if (appointment.patientId && !appointment.patient) {
            const patient = await storage.getUser(appointment.patientId);
            return {
              ...appointment,
              patient: patient ? {
                id: patient.id,
                firstName: patient.firstName || '',
                lastName: patient.lastName || '',
                email: patient.email || '',
                phone: patient.phone || ''
              } : null
            };
          }
          return appointment;
        })
      );

      res.json(appointmentsWithPatient);
    } catch (error) {
      console.error("Error fetching today's appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.get("/api/doctor/patients", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const doctor = await storage.getDoctorByUserId(userId);
      if (!doctor) {
        return res.status(403).json({ message: "Not authorized as doctor" });
      }

      // In development mode, return mock patients
      if (process.env.NODE_ENV !== "production") {
        const mockPatients = [
          {
            id: "dev-user",
            name: "Dev User",
            age: 40,
            gender: "Male",
            phone: "+1 (555) 123-4567",
            email: "dev@localhost",
            lastVisit: "2024-12-15",
            condition: "General checkup",
            status: "active"
          },
          {
            id: "patient-1",
            name: "John Doe",
            age: 47,
            gender: "Male",
            phone: "+1 (555) 234-5678",
            email: "john.doe@example.com",
            lastVisit: "2024-12-20",
            condition: "General checkup",
            status: "active"
          }
        ];
        res.json(mockPatients);
        return;
      }

      // Get all appointments for this doctor
      const appointments = await storage.getAppointmentsByDoctor(doctor.id);

      // Extract unique patients from appointments
      const patientMap = new Map();
      appointments.forEach(apt => {
        if (apt.patient && !patientMap.has(apt.patient.id)) {
          patientMap.set(apt.patient.id, {
            id: apt.patient.id,
            name: `${apt.patient.firstName} ${apt.patient.lastName}`,
            age: apt.patient.dateOfBirth ?
              Math.floor((new Date().getTime() - new Date(apt.patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) :
              null,
            gender: apt.patient.gender || 'Not specified',
            phone: apt.patient.phone || '',
            email: apt.patient.email,
            lastVisit: apt.appointmentDate,
            condition: 'General checkup', // Would need to derive from medical history
            status: 'active' // Would need to determine based on recent activity
          });
        }
      });

      const patients = Array.from(patientMap.values());
      res.json(patients);
    } catch (error) {
      console.error("Error fetching doctor patients:", error);
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  app.get("/api/doctor/prescriptions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const doctor = await storage.getDoctorByUserId(userId);
      if (!doctor) {
        return res.status(403).json({ message: "Not authorized as doctor" });
      }
      const prescriptions = await storage.getDoctorPrescriptions(doctor.id);

      // Populate patient and medicine information
      const prescriptionsWithDetails = await Promise.all(
        prescriptions.map(async (prescription) => {
          const patient = prescription.patientId ? await storage.getUser(prescription.patientId) : null;
          const itemsWithMedicine = prescription.items ? await Promise.all(
            prescription.items.map(async (item) => {
              const medicine = item.medicineId ? await storage.getMedicine(item.medicineId) : null;
              return {
                ...item,
                medicine: medicine ? {
                  id: medicine.id,
                  name: medicine.name,
                  genericName: medicine.genericName,
                  category: medicine.category,
                  manufacturer: medicine.manufacturer,
                  dosageForm: medicine.dosageForm,
                  strength: medicine.strength,
                  createdAt: medicine.createdAt
                } : { name: 'Unknown Medicine' }
              };
            })
          ) : [];

          return {
            ...prescription,
            patient: patient ? {
              id: patient.id,
              firstName: patient.firstName || '',
              lastName: patient.lastName || '',
              email: patient.email || '',
              phone: patient.phone || ''
            } : null,
            items: itemsWithMedicine
          };
        })
      );

      res.json(prescriptionsWithDetails);
    } catch (error) {
      // In development mode, if database is not available, return empty array
      if (process.env.NODE_ENV !== "production") {
        console.warn("Database not available, returning empty array in development mode for doctor prescriptions");
        return res.json([]);
      }
      console.error("Error fetching prescriptions:", error);
      res.status(500).json({ message: "Failed to fetch prescriptions" });
    }
  });

  app.get("/api/doctor/prescriptions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const doctor = await storage.getDoctorByUserId(userId);
      if (!doctor) {
        return res.status(403).json({ message: "Not authorized as doctor" });
      }

      const prescription = await storage.getPrescription(id);
      if (!prescription) {
        return res.status(404).json({ message: "Prescription not found" });
      }

      // Check if doctor created this prescription
      if (prescription.doctorId !== doctor.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Populate patient and medicine information
      const patient = prescription.patientId ? await storage.getUser(prescription.patientId) : null;
      const itemsWithMedicine = prescription.items ? await Promise.all(
        prescription.items.map(async (item) => {
          const medicine = item.medicineId ? await storage.getMedicine(item.medicineId) : null;
          return {
            ...item,
            medicine: medicine ? {
              id: medicine.id,
              name: medicine.name,
              genericName: medicine.genericName,
              category: medicine.category,
              manufacturer: medicine.manufacturer,
              dosageForm: medicine.dosageForm,
              strength: medicine.strength,
              createdAt: medicine.createdAt
            } : { name: 'Unknown Medicine' }
          };
        })
      ) : [];

      const prescriptionWithDetails = {
        ...prescription,
        patient: patient ? {
          id: patient.id,
          firstName: patient.firstName || '',
          lastName: patient.lastName || '',
          email: patient.email || '',
          phone: patient.phone || ''
        } : null,
        items: itemsWithMedicine
      };

      res.json(prescriptionWithDetails);
    } catch (error) {
      console.error("Error fetching prescription:", error);
      res.status(500).json({ message: "Failed to fetch prescription" });
    }
  });

  app.get("/api/doctor/prescriptions/pending", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const doctor = await storage.getDoctorByUserId(userId);
      if (!doctor) {
        return res.status(403).json({ message: "Not authorized as doctor" });
      }
      const prescriptions = await storage.getDoctorPrescriptions(doctor.id);
      res.json(prescriptions);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      res.status(500).json({ message: "Failed to fetch prescriptions" });
    }
  });

  app.get("/api/doctor/appointments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const appointment = await storage.getAppointment(id);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      // Populate doctor and patient information
      const doctor = appointment.doctorId ? await storage.getDoctor(appointment.doctorId) : null;
      const patient = appointment.patientId ? await storage.getUser(appointment.patientId) : null;

      const appointmentWithDetails = {
        ...appointment,
        doctor: doctor ? {
          id: doctor.id,
          firstName: doctor.user?.firstName || '',
          lastName: doctor.user?.lastName || '',
          specialty: doctor.specialty || '',
          qualification: doctor.qualification || ''
        } : null,
        patient: patient ? {
          id: patient.id,
          firstName: patient.firstName || '',
          lastName: patient.lastName || '',
          email: patient.email || '',
          phone: patient.phone || ''
        } : null
      };

      res.json(appointmentWithDetails);
    } catch (error) {
      console.error("Error fetching appointment:", error);
      res.status(500).json({ message: "Failed to fetch appointment" });
    }
  });

  app.post("/api/doctor/appointments/:id/complete", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { diagnosis, notes, prescriptionItems } = req.body;

      // Get the doctor
      const doctor = await storage.getDoctorByUserId(userId);
      if (!doctor) {
        return res.status(403).json({ message: "Not authorized as doctor" });
      }

      // Get the appointment
      const appointment = await storage.getAppointment(id);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      // Check if doctor owns this appointment
      if (appointment.doctorId !== doctor.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Update appointment status to completed
      const updatedAppointment = await storage.updateAppointment(id, {
        status: "completed"
      });

      let prescriptionCreated = false;

      // Create prescription if items provided
      if (prescriptionItems && prescriptionItems.length > 0) {
        const prescriptionData = {
          patientId: appointment.patientId,
          doctorId: doctor.id,
          diagnosis: diagnosis || null,
          notes: notes || null,
          appointmentId: id
        };

        const prescription = await storage.createPrescription(prescriptionData);

        // Add prescription items
        for (const item of prescriptionItems) {
          console.log("Processing prescription item:", item);
          let medicineId = Number(item.medicineId);
          console.log("Medicine ID:", medicineId, "type:", typeof medicineId);
          
          // Check if medicine exists
          let medicine = await storage.getMedicine(medicineId);
          
          // In development mode, auto-create missing medicines from mock data
          if (!medicine && process.env.NODE_ENV !== "production") {
            const template = mockMedicines.find(m => m.id === medicineId);
            if (template) {
              const medicineData = insertMedicineSchema.parse(template);
              medicine = await storage.createMedicine(medicineData);
              console.log(`Auto-created medicine ${medicineId}: ${template.name}`);
            }
          }
          
          if (!medicine) {
            throw new Error(`Medicine with id ${medicineId} not found`);
          }

          const itemData = {
            prescriptionId: prescription.id,
            medicineId: medicineId,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            instructions: item.instructions
          };
          console.log("Inserting prescription item:", itemData);
          await storage.addPrescriptionItem(itemData);
        }

        prescriptionCreated = true;
      }

      // Check if there's an existing prescription for this appointment
      const existingPrescriptions = await storage.getPrescriptions(appointment.patientId);
      const appointmentPrescription = existingPrescriptions.find(p => p.appointmentId === id);

      // Send prescription notification if prescription was created or exists
      if (prescriptionCreated || appointmentPrescription) {
        const doctorUser = await storage.getUser(doctor.userId);
        const doctorName = doctorUser ? `${doctorUser.firstName} ${doctorUser.lastName}` : 'Doctor';

        await notificationService.notifyPrescriptionAdded(appointment.patientId, doctorName);
      }

      // Send appointment completion notification
      await notificationService.notifyAppointmentCompleted(appointment.patientId, doctor.id);

      res.json(updatedAppointment);
    } catch (error) {
      console.error("Error completing appointment:", error);
      res.status(500).json({ message: "Failed to complete appointment" });
    }
  });

  app.get("/api/doctor/patient/:patientId/allergies", isAuthenticated, async (req: any, res) => {
    try {
      const allergies = await storage.getAllergies(req.params.patientId);
      res.json(allergies);
    } catch (error) {
      console.error("Error fetching patient allergies:", error);
      res.status(500).json({ message: "Failed to fetch allergies" });
    }
  });

  app.get("/api/doctor/patient/:patientId/vitals", isAuthenticated, async (req: any, res) => {
    try {
      const vitals = await storage.getVitals(req.params.patientId);
      res.json(vitals);
    } catch (error) {
      console.error("Error fetching patient vitals:", error);
      res.status(500).json({ message: "Failed to fetch vitals" });
    }
  });

  app.get("/api/doctor/revenue/summary", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const doctor = await storage.getDoctorByUserId(userId);
      if (!doctor) {
        return res.status(403).json({ message: "Not authorized as doctor" });
      }

      // Mock revenue data - in real implementation, this would calculate from bills/payments
      const revenueSummary = {
        today: 450,
        thisMonth: 2450,
        thisYear: 28500,
        breakdown: {
          consultations: { count: 15, amount: 1800 },
          procedures: { count: 3, amount: 450 },
          followups: { count: 8, amount: 200 }
        }
      };

      res.json(revenueSummary);
    } catch (error) {
      console.error("Error fetching revenue summary:", error);
      res.status(500).json({ message: "Failed to fetch revenue summary" });
    }
  });

  app.get("/api/doctor/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      // In development mode, return mock doctor data
      if (process.env.NODE_ENV !== "production") {
        const devRole = req.cookies?.devRole;
        let mockDoctorData = {
          id: 1,
          userId: "dev-doctor",
          departmentId: 1,
          specialty: "General Medicine",
          qualification: "MD",
          experience: 10,
          consultationFee: "500.00",
          bio: "Experienced general physician with over 10 years of practice",
          isAvailable: true,
          createdAt: new Date(),
          user: {
            id: "dev-doctor",
            email: "dr.dev@hospital.com",
            firstName: "Dr. Dev",
            lastName: "User",
            profileImageUrl: "",
            role: "doctor",
            phone: "+1 (555) 111-2222",
            dateOfBirth: "1980-01-15",
            gender: "Female",
            address: "456 Medical Ave, Health City, HC 56789"
          },
          department: {
            id: 1,
            name: "Cardiology",
            description: "Heart and cardiovascular system care",
            icon: "heart",
            createdAt: new Date()
          }
        };

        // Customize mock data based on devRole
        if (devRole === "doctor-1-user") {
          mockDoctorData = {
            id: 2,
            userId: "doctor-1-user",
            departmentId: 1,
            specialty: "Cardiologist",
            qualification: "MD, FACC",
            experience: 15,
            consultationFee: "800.00",
            bio: "Board-certified cardiologist specializing in heart disease prevention and treatment",
            isAvailable: true,
            createdAt: new Date(),
            user: {
              id: "doctor-1-user",
              email: "dr.sarah.smith@hospital.com",
              firstName: "Sarah",
              lastName: "Smith",
              profileImageUrl: "",
              role: "doctor",
              phone: "+1 (555) 111-2222",
              dateOfBirth: "1975-08-20",
              gender: "Female",
              address: "123 Hospital Dr, Medical City, MC 12345"
            },
            department: {
              id: 1,
              name: "Cardiology",
              description: "Heart and cardiovascular system care",
              icon: "heart",
              createdAt: new Date()
            }
          };
        } else if (devRole === "doctor-2-user") {
          mockDoctorData = {
            id: 3,
            userId: "doctor-2-user",
            departmentId: 5,
            specialty: "Orthopedic Surgeon",
            qualification: "MD, MS Ortho",
            experience: 12,
            consultationFee: "900.00",
            bio: "Specialized in joint replacements and sports medicine",
            isAvailable: true,
            createdAt: new Date(),
            user: {
              id: "doctor-2-user",
              email: "dr.michael.johnson@hospital.com",
              firstName: "Michael",
              lastName: "Johnson",
              profileImageUrl: "",
              role: "doctor",
              phone: "+1 (555) 333-4444",
              dateOfBirth: "1970-05-15",
              gender: "Male",
              address: "456 Clinic Ave, Health Town, HT 67890"
            },
            department: {
              id: 5,
              name: "Orthopedics",
              description: "Bone and muscle care",
              icon: "bone",
              createdAt: new Date()
            }
          };
        } else if (devRole === "doctor-3-user") {
          mockDoctorData = {
            id: 4,
            userId: "doctor-3-user",
            departmentId: 2,
            specialty: "Dermatologist",
            qualification: "MD, FAAD",
            experience: 8,
            consultationFee: "600.00",
            bio: "Expert in skin disorders and cosmetic dermatology",
            isAvailable: true,
            createdAt: new Date(),
            user: {
              id: "doctor-3-user",
              email: "dr.emily.brown@hospital.com",
              firstName: "Emily",
              lastName: "Brown",
              profileImageUrl: "",
              role: "doctor",
              phone: "+1 (555) 555-6666",
              dateOfBirth: "1978-12-03",
              gender: "Female",
              address: "789 Medical Plaza, Wellness City, WC 54321"
            },
            department: {
              id: 2,
              name: "Dermatology",
              description: "Skin care and treatment",
              icon: "skin",
              createdAt: new Date()
            }
          };
        }

        console.log("Server: Returning mock doctor profile:", mockDoctorData);
        return res.json(mockDoctorData);
      }

      const doctor = await storage.getDoctorByUserId(userId);
      if (!doctor) {
        return res.status(403).json({ message: "Not authorized as doctor" });
      }
      res.json(doctor);
    } catch (error) {
      console.error("Error fetching doctor profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.patch("/api/doctor/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const doctor = await storage.getDoctorByUserId(userId);
      if (!doctor) {
        return res.status(403).json({ message: "Not authorized as doctor" });
      }

      // Update user data
      const userUpdates = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phone: req.body.phone,
      };

      await storage.upsertUser({ ...userUpdates, id: userId, email: req.body.email });

      // Update doctor data
      const doctorUpdates = {
        specialty: req.body.specialization,
        qualification: req.body.qualification,
        experience: req.body.experience ? parseInt(req.body.experience) : null,
        consultationFee: req.body.consultationFee,
        bio: req.body.bio,
        isAvailable: req.body.isAvailable,
      };

      const updatedDoctor = await storage.updateDoctor(doctor.id, doctorUpdates);
      res.json(updatedDoctor);
    } catch (error) {
      console.error("Error updating doctor profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.get("/api/doctor/schedule", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const doctor = await storage.getDoctorByUserId(userId);
      if (!doctor) {
        return res.status(403).json({ message: "Not authorized as doctor" });
      }

      const schedules = await storage.getDoctorSchedules(doctor.id);
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching doctor schedule:", error);
      res.status(500).json({ message: "Failed to fetch schedule" });
    }
  });

  app.patch("/api/doctor/schedule", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const doctor = await storage.getDoctorByUserId(userId);
      if (!doctor) {
        return res.status(403).json({ message: "Not authorized as doctor" });
      }

      // Update schedules for each day
      const scheduleUpdates = req.body;
      const dayNames = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

      for (let i = 0; i < dayNames.length; i++) {
        const dayName = dayNames[i];
        const daySchedule = scheduleUpdates[dayName];

        if (daySchedule) {
          const existingSchedule = await storage.getDoctorSchedules(doctor.id);
          const existingDaySchedule = existingSchedule.find(s => s.dayOfWeek === i);

          if (existingDaySchedule) {
            // Update existing schedule
            await storage.updateDoctorSchedule(existingDaySchedule.id, {
              startTime: daySchedule.start,
              endTime: daySchedule.end,
              isActive: daySchedule.active,
            });
          } else {
            // Create new schedule
            await storage.createDoctorSchedule({
              doctorId: doctor.id,
              dayOfWeek: i,
              startTime: daySchedule.start,
              endTime: daySchedule.end,
              isActive: daySchedule.active,
            });
          }
        }
      }

      res.json({ message: "Schedule updated successfully" });
    } catch (error) {
      console.error("Error updating doctor schedule:", error);
      res.status(500).json({ message: "Failed to update schedule" });
    }
  });

  // Messages endpoint - returns all messages involving this doctor or their patients
  app.get("/api/doctor/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const doctor = await storage.getDoctorByUserId(userId);
      
      if (!doctor) {
        // If not a doctor, return regular messages
        const msgs = await storage.getMessages(userId);
        return res.json(msgs);
      }
      
      // Get all messages involving this doctor
      const allMessages = await storage.getMessages(userId);
      
      // Also get messages sent to/from this doctor's patients
      const appointments = await storage.getAppointmentsByDoctor(doctor.id);
      const patientIds = [...new Set(appointments.map(apt => apt.patientId))];
      
      // Filter messages to include those involving doctor or their patients
      const doctorMessages = allMessages.filter((m: any) => {
        return m.senderId === userId || 
               m.receiverId === userId ||
               patientIds.includes(m.senderId) || 
               patientIds.includes(m.receiverId);
      });
      
      console.log(`GET /api/doctor/messages - userId: ${userId}, found ${doctorMessages.length} messages`);
      res.json(doctorMessages);
    } catch (error) {
      console.error("Error fetching doctor messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Messages endpoint for patients
  app.get("/api/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      console.log("GET /api/messages - userId:", userId);
      const messages = await storage.getMessages(userId);
      console.log("GET /api/messages - found", messages.length, "messages");
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      console.log("POST /api/messages - userId:", userId);
      console.log("POST /api/messages - body:", req.body);
      
      const messageData = {
        senderId: userId,
        receiverId: req.body.receiverId,
        subject: req.body.subject || "",
        content: req.body.content,
        priority: req.body.priority || "medium",
        appointmentId: req.body.appointmentId || undefined
      };
      
      console.log("POST /api/messages - creating message with data:", messageData);
      const created = await storage.createMessage(messageData);
      console.log("POST /api/messages - created message:", created);
      res.status(201).json(created);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.patch("/api/messages/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log("PATCH /api/messages/:id/read - id:", id);
      const updated = await storage.markMessageAsRead(id);
      console.log("PATCH /api/messages/:id/read - updated:", updated);
      if (!updated) return res.status(404).json({ message: "Message not found" });
      res.json(updated);
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // Patient profile routes
  app.get("/api/patient/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching patient profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Doctor access to patient data
  app.get("/api/patient/:patientId", isAuthenticated, async (req: any, res) => {
    try {
      const patientId = req.params.patientId;
      const userId = req.user.claims.sub;

      // Check if requester is a doctor or the patient themselves
      const doctor = await storage.getDoctorByUserId(userId);
      if (userId !== patientId && !doctor) {
        return res.status(403).json({ message: "Access denied" });
      }

      const patient = await storage.getUser(patientId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      res.json(patient);
    } catch (error) {
      console.error("Error fetching patient:", error);
      res.status(500).json({ message: "Failed to fetch patient" });
    }
  });

  app.get("/api/patient/:patientId/prescriptions", isAuthenticated, async (req: any, res) => {
    try {
      const patientId = req.params.patientId;
      const userId = req.user.claims.sub;

      // Check if requester is a doctor or the patient themselves
      const doctor = await storage.getDoctorByUserId(userId);
      if (userId !== patientId && !doctor) {
        return res.status(403).json({ message: "Access denied" });
      }

      const prescriptions = await storage.getPrescriptions(patientId);
      res.json(prescriptions);
    } catch (error) {
      console.error("Error fetching patient prescriptions:", error);
      res.status(500).json({ message: "Failed to fetch prescriptions" });
    }
  });

  app.get("/api/patient/:patientId/documents", isAuthenticated, async (req: any, res) => {
    try {
      const patientId = req.params.patientId;
      const userId = req.user.claims.sub;

      // Check if requester is a doctor or the patient themselves
      const doctor = await storage.getDoctorByUserId(userId);
      if (userId !== patientId && !doctor) {
        return res.status(403).json({ message: "Access denied" });
      }

      const documents = await storage.getDocuments(patientId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching patient documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.get("/api/patient/:patientId/appointments", isAuthenticated, async (req: any, res) => {
    try {
      const patientId = req.params.patientId;
      const userId = req.user.claims.sub;

      // Check if requester is a doctor or the patient themselves
      const doctor = await storage.getDoctorByUserId(userId);
      if (userId !== patientId && !doctor) {
        return res.status(403).json({ message: "Access denied" });
      }

      const appointments = await storage.getAppointments(patientId);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching patient appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.get("/api/patient/:patientId/bills", isAuthenticated, async (req: any, res) => {
    try {
      const patientId = req.params.patientId;
      const userId = req.user.claims.sub;

      // Check if requester is a doctor or the patient themselves
      const doctor = await storage.getDoctorByUserId(userId);
      if (userId !== patientId && !doctor) {
        return res.status(403).json({ message: "Access denied" });
      }

      const bills = await storage.getBills(patientId);
      res.json(bills);
    } catch (error) {
      console.error("Error fetching patient bills:", error);
      res.status(500).json({ message: "Failed to fetch bills" });
    }
  });

  app.get("/api/patient/:patientId/vaccinations", isAuthenticated, async (req: any, res) => {
    try {
      const patientId = req.params.patientId;
      const userId = req.user.claims.sub;

      // Check if requester is a doctor or the patient themselves
      const doctor = await storage.getDoctorByUserId(userId);
      if (userId !== patientId && !doctor) {
        return res.status(403).json({ message: "Access denied" });
      }

      const vaccinations = await storage.getVaccinations(patientId);
      res.json(vaccinations);
    } catch (error) {
      console.error("Error fetching patient vaccinations:", error);
      res.status(500).json({ message: "Failed to fetch vaccinations" });
    }
  });

  app.patch("/api/patient/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update user data
      const userUpdates = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        dateOfBirth: req.body.dateOfBirth,
        gender: req.body.gender,
        address: req.body.address,
      };

      const updatedUser = await storage.upsertUser({ ...userUpdates, id: userId });
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating patient profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.patch("/api/patient/health", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // In a real implementation, you'd update health data in a separate table
      // For now, we'll just acknowledge the update
      res.json({ message: "Health data updated successfully" });
    } catch (error) {
      console.error("Error updating patient health data:", error);
      res.status(500).json({ message: "Failed to update health data" });
    }
  });

  app.patch("/api/patient/privacy", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // In a real implementation, you'd update privacy settings
      // For now, we'll just acknowledge the update
      res.json({ message: "Privacy settings updated successfully" });
    } catch (error) {
      console.error("Error updating patient privacy settings:", error);
      res.status(500).json({ message: "Failed to update privacy settings" });
    }
  });

  app.post("/api/patient/upload-profile-picture", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // In a real implementation, you'd handle file upload
      // For now, we'll just acknowledge the upload
      res.json({ message: "Profile picture uploaded successfully" });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      res.status(500).json({ message: "Failed to upload profile picture" });
    }
  });

  app.post("/api/patient/upload-insurance-card", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // In a real implementation, you'd handle file upload
      // For now, we'll just acknowledge the upload
      res.json({ message: "Insurance card uploaded successfully" });
    } catch (error) {
      console.error("Error uploading insurance card:", error);
      res.status(500).json({ message: "Failed to upload insurance card" });
    }
  });

  // Admin profile routes
  app.get("/api/admin/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching admin profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.patch("/api/admin/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Update user data
      const userUpdates = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
      };

      const updatedUser = await storage.upsertUser({ ...userUpdates, id: userId });
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating admin profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.post("/api/doctor/prescriptions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const doctor = await storage.getDoctorByUserId(userId);
      if (!doctor) {
        return res.status(403).json({ message: "Not authorized as doctor" });
      }

      const { items, appointmentId, ...prescriptionData } = req.body;

      // In development mode, map string patientIds to proper string IDs
      if (req.cookies.devRole) {
        const patientIdMap: { [key: string]: string } = {
          'dev-user': 'dev-user',
          'patient-1': 'patient-1',
          'patient-2': 'patient-2',
          'patient-3': 'patient-3',
        };
        if (prescriptionData.patientId in patientIdMap) {
          prescriptionData.patientId = patientIdMap[prescriptionData.patientId];
        } else {
          prescriptionData.patientId = 'dev-user'; // default
        }
      }

      // Handle custom medicines (when medicineName is provided)
      if (items && Array.isArray(items)) {
        for (const item of items) {
          if (!('medicineId' in item) && !('medicineName' in item)) {
            return res.status(400).json({ message: "Medicine not specified for prescription item" });
          }

          if (item.medicineName) {
            // Create new medicine for custom entry
            const medicineData = insertMedicineSchema.parse({
              name: item.medicineName,
              genericName: item.medicineName,
              category: 'General',
              manufacturer: 'Unknown',
              dosageForm: 'tablet',
              strength: 'Unknown',
            });
            const medicine = await storage.createMedicine(medicineData);
            item.medicineId = medicine.id;
            delete item.medicineName;
          } else if (typeof item.medicineId === 'string') {
            // Handle old client code where medicineId is a string (e.g., "14")
            // Try to auto-create from template first
            const templateId = parseInt(item.medicineId);
            if (!isNaN(templateId) && templateId > 0 && templateId <= 15) {
              const template = mockMedicines.find(m => m.id === templateId);
              if (template) {
                const medicineData = insertMedicineSchema.parse(template);
                medicine = await storage.createMedicine(medicineData);
                item.medicineId = medicine.id;
                console.log(`Auto-created medicine ${templateId}: ${template.name}`);
              }
            }
            
            // If still no medicine (string is not a number or template not found), create with string as name
            if (!medicine) {
              const medicineData = insertMedicineSchema.parse({
                name: item.medicineId,
                genericName: item.medicineId,
                category: 'General',
                manufacturer: 'Unknown',
                dosageForm: 'tablet',
                strength: 'Unknown',
              });
              medicine = await storage.createMedicine(medicineData);
              item.medicineId = medicine.id;
            }
          } else if ('medicineId' in item && item.medicineId != null) {
            // Medicine ID is a number, check if medicine exists
            let medicine = await storage.getMedicine(item.medicineId);
            
            // In development mode, auto-create missing medicines from mock template
            if (!medicine && process.env.NODE_ENV !== "production") {
              const template = mockMedicines.find(m => m.id === item.medicineId);
              if (template) {
                const medicineData = insertMedicineSchema.parse(template);
                medicine = await storage.createMedicine(medicineData);
                console.log(`Auto-created medicine ${item.medicineId}: ${template.name}`);
              }
            }
            
            if (!medicine) {
              return res.status(400).json({ message: `Medicine with id ${item.medicineId} not found` });
            }
            item.medicineId = medicine.id;
          } else {
            return res.status(400).json({ message: "Invalid medicine specification" });
          }
        }
      }

      const data = insertPrescriptionSchema.parse({
        ...prescriptionData,
        doctorId: doctor.id,
        appointmentId: appointmentId || null
      });
      const prescription = await storage.createPrescription(data);

      // Add new prescription items
      if (items && Array.isArray(items)) {
        for (const item of items) {
          const itemData = insertPrescriptionItemSchema.parse({ ...item, prescriptionId: prescription.id });
          await storage.addPrescriptionItem(itemData);
        }
      }

      // Automatically sign the prescription
      try {
        const { privateKey } = await digitalSignatureService.generateKeyPair();
        const signature = await digitalSignatureService.signPrescription(prescription.id, doctor.id, privateKey);

        // Create audit entry
        await digitalSignatureService.createPrescriptionAuditEntry(prescription.id, 'auto_signed', userId, {
          signatureId: signature.prescriptionId,
          algorithm: signature.algorithm,
        });

        console.log(`Prescription ${prescription.id} automatically signed by doctor ${doctor.id}`);
      } catch (signError) {
        console.error("Error auto-signing prescription:", signError);
        // Don't fail the prescription creation if signing fails
      }

      // Send notification to patient
      const doctorUser = await storage.getUser(doctor.userId);
      const doctorName = doctorUser ? `${doctorUser.firstName} ${doctorUser.lastName}` : 'Doctor';

      await notificationService.notifyPrescriptionAdded(prescription.patientId, doctorName);

      // Return prescription with items
      const fullPrescription = await storage.getPrescription(prescription.id);
      res.status(201).json(fullPrescription);
    } catch (error) {
      console.error("Error creating prescription:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create prescription" });
    }
  });

  app.get("/api/medicines", async (req, res) => {
    try {
      const medicines = await storage.getMedicines();
      console.log("GET /api/medicines - found", medicines.length, "medicines");
  
      // If no medicines in database, return mock data for development
      if (medicines.length === 0 && process.env.NODE_ENV !== "production") {
        console.log("No medicines in database, returning mock data");
        const mockMedicines = [
          {
            id: 1,
            name: "Lisinopril",
            genericName: "Lisinopril",
            description: "ACE inhibitor for blood pressure",
            category: "Antihypertensive",
            manufacturer: "Generic Pharmaceuticals",
            dosageForm: "tablet",
            strength: "10mg",
            createdAt: new Date("2024-01-01")
          },
          {
            id: 2,
            name: "Atorvastatin",
            genericName: "Atorvastatin Calcium",
            description: "Statin for cholesterol management",
            category: "Statins",
            manufacturer: "Generic Pharmaceuticals",
            dosageForm: "tablet",
            strength: "20mg",
            createdAt: new Date("2024-01-01")
          },
          {
            id: 3,
            name: "Metformin",
            genericName: "Metformin Hydrochloride",
            description: "Diabetes medication",
            category: "Antidiabetic",
            manufacturer: "Various",
            dosageForm: "tablet",
            strength: "500mg, 1000mg",
            createdAt: new Date("2024-01-01")
          },
          {
            id: 4,
            name: "Amoxicillin",
            genericName: "Amoxicillin",
            description: "Antibiotic for bacterial infections",
            category: "Antibiotic",
            manufacturer: "Various",
            dosageForm: "capsule",
            strength: "250mg, 500mg",
            createdAt: new Date("2024-01-01")
          },
          {
            id: 5,
            name: "Ibuprofen",
            genericName: "Ibuprofen",
            description: "NSAID for pain and inflammation",
            category: "Analgesic",
            manufacturer: "Various",
            dosageForm: "tablet",
            strength: "200mg, 400mg, 600mg",
            createdAt: new Date("2024-01-01")
          }
        ];
        return res.json(mockMedicines);
      }
  
      res.json(medicines);
    } catch (error) {
      console.error("Error fetching medicines:", error);
      res.status(500).json({ message: "Failed to fetch medicines" });
    }
  });

  app.get("/api/medicines/search", async (req, res) => {
    try {
      const query = req.query.q as string || "";
      const medicines = await storage.searchMedicines(query);
      res.json(medicines);
    } catch (error) {
      console.error("Error searching medicines:", error);
      res.status(500).json({ message: "Failed to search medicines" });
    }
  });

  // Admin routes
  const isAdmin = async (req: any, res: any, next: any) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      next();
    } catch (error) {
      res.status(500).json({ message: "Authorization error" });
    }
  };

  // Admin patient management routes
  app.get("/api/admin/patients", isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Get all users with role "patient"
      // Note: In a real implementation, you'd have a proper way to get all patients
      // For now, we'll return a mock response
      const patients = [
        {
          id: "dev-user",
          email: "dev@localhost",
          firstName: "Dev",
          lastName: "User",
          role: "patient",
          phone: "+1 (555) 123-4567",
          dateOfBirth: "1985-06-15",
          gender: "Male",
          address: "123 Main St, City, State 12345"
        }
      ];
      res.json(patients);
    } catch (error) {
      console.error("Error fetching patients:", error);
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  app.post("/api/admin/patients", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { firstName, lastName, email, phone, dateOfBirth, gender, address } = req.body;

      const userData = await storage.upsertUser({
        id: `patient-${Date.now()}`,
        email,
        firstName,
        lastName,
        role: "patient",
        phone: phone || null,
        dateOfBirth: dateOfBirth || null,
        gender: gender || null,
        address: address || null,
      });

      res.status(201).json(userData);
    } catch (error) {
      console.error("Error creating patient:", error);
      res.status(500).json({ message: "Failed to create patient" });
    }
  });

  app.patch("/api/admin/patients/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Patient not found" });
      }

      // Update user data
      const userUpdates = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        dateOfBirth: req.body.dateOfBirth,
        gender: req.body.gender,
        address: req.body.address,
      };

      const updatedUser = await storage.upsertUser({ ...userUpdates, id: userId });
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating patient:", error);
      res.status(500).json({ message: "Failed to update patient" });
    }
  });

  app.delete("/api/admin/patients/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      // In a real implementation, you'd delete the user
      // For now, we'll just return success
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting patient:", error);
      res.status(500).json({ message: "Failed to delete patient" });
    }
  });

  app.get("/api/admin/departments", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const departments = await storage.getDepartments();
      res.json(departments);
    } catch (error) {
      console.error("Error fetching departments:", error);
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });

  app.get("/api/admin/appointments/today", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const allAppointments = await storage.getAllAppointmentsForDate(today, tomorrow);

      // Populate doctor and patient information
      const appointmentsWithDetails = await Promise.all(
        allAppointments.map(async (appointment) => {
          const doctor = appointment.doctorId ? await storage.getDoctor(appointment.doctorId) : null;
          const patient = appointment.patientId ? await storage.getUser(appointment.patientId) : null;

          return {
            ...appointment,
            doctor: doctor ? {
              id: doctor.id,
              firstName: doctor.user?.firstName || '',
              lastName: doctor.user?.lastName || '',
              specialty: doctor.specialty || '',
              qualification: doctor.qualification || ''
            } : null,
            patient: patient ? {
              id: patient.id,
              firstName: patient.firstName || '',
              lastName: patient.lastName || '',
              email: patient.email || '',
              phone: patient.phone || ''
            } : null
          };
        })
      );

      res.json(appointmentsWithDetails);
    } catch (error) {
      console.error("Error fetching today's appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.get("/api/admin/appointments/all", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user || (user.role !== "admin" && user.role !== "doctor")) {
        return res.status(403).json({ message: "Access denied" });
      }

      const allAppointments = await storage.getAllAppointments();

      // Populate doctor and patient information
      const appointmentsWithDetails = await Promise.all(
        allAppointments.map(async (appointment) => {
          const doctor = appointment.doctorId ? await storage.getDoctor(appointment.doctorId) : null;
          const patient = appointment.patientId ? await storage.getUser(appointment.patientId) : null;

          return {
            ...appointment,
            doctor: doctor ? {
              id: doctor.id,
              firstName: doctor.user?.firstName || '',
              lastName: doctor.user?.lastName || '',
              specialty: doctor.specialty || '',
              qualification: doctor.qualification || ''
            } : null,
            patient: patient ? {
              id: patient.id,
              firstName: patient.firstName || '',
              lastName: patient.lastName || '',
              email: patient.email || '',
              phone: patient.phone || ''
            } : null
          };
        })
      );

      res.json(appointmentsWithDetails);
    } catch (error) {
      console.error("Error fetching all appointments:", error);
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.get("/api/admin/doctors", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const doctors = await storage.getDoctors();
      res.json(doctors);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      res.status(500).json({ message: "Failed to fetch doctors" });
    }
  });

  app.post("/api/admin/doctors", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { firstName, lastName, email, departmentId, specialty, qualification, experience, consultationFee } = req.body;
      
      const userData = await storage.upsertUser({
        id: `doctor-${Date.now()}`,
        email,
        firstName,
        lastName,
        role: "doctor",
      });
      
      const doctorData = insertDoctorSchema.parse({
        userId: userData.id,
        departmentId,
        specialty,
        qualification,
        experience,
        consultationFee,
      });
      
      const doctor = await storage.createDoctor(doctorData);
      res.status(201).json(doctor);
    } catch (error) {
      console.error("Error creating doctor:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create doctor" });
    }
  });

  app.patch("/api/admin/doctors/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const doctor = await storage.updateDoctor(id, req.body);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      res.json(doctor);
    } catch (error) {
      console.error("Error updating doctor:", error);
      res.status(500).json({ message: "Failed to update doctor" });
    }
  });

  app.delete("/api/admin/doctors/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const doctor = await storage.getDoctor(id);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }

      // In a real implementation, you'd delete the doctor and associated user
      // For now, we'll just return success
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting doctor:", error);
      res.status(500).json({ message: "Failed to delete doctor" });
    }
  });

  app.post("/api/admin/departments", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const data = insertDepartmentSchema.parse(req.body);
      const department = await storage.createDepartment(data);
      res.status(201).json(department);
    } catch (error) {
      console.error("Error creating department:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create department" });
    }
  });

  app.patch("/api/admin/departments/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const department = await storage.updateDepartment(id, req.body);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      res.json(department);
    } catch (error) {
      console.error("Error updating department:", error);
      res.status(500).json({ message: "Failed to update department" });
    }
  });

  app.delete("/api/admin/departments/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteDepartment(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting department:", error);
      res.status(500).json({ message: "Failed to delete department" });
    }
  });

  app.get("/api/admin/medicines", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const medicines = await storage.getMedicines();
      res.json(medicines);
    } catch (error) {
      console.error("Error fetching medicines:", error);
      res.status(500).json({ message: "Failed to fetch medicines" });
    }
  });

  app.post("/api/admin/medicines", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const data = insertMedicineSchema.parse(req.body);
      const medicine = await storage.createMedicine(data);
      res.status(201).json(medicine);
    } catch (error) {
      console.error("Error creating medicine:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create medicine" });
    }
  });

  app.patch("/api/admin/medicines/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const medicine = await storage.updateMedicine(id, req.body);
      if (!medicine) {
        return res.status(404).json({ message: "Medicine not found" });
      }
      res.json(medicine);
    } catch (error) {
      console.error("Error updating medicine:", error);
      res.status(500).json({ message: "Failed to update medicine" });
    }
  });

  app.delete("/api/admin/medicines/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMedicine(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting medicine:", error);
      res.status(500).json({ message: "Failed to delete medicine" });
    }
  });

  // Admin prescription management routes
  app.get("/api/admin/prescriptions", isAuthenticated, isAdmin, async (req, res) => {
    try {
      // In a real implementation, you'd get all prescriptions
      // For now, we'll return an empty array
      res.json([]);
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      res.status(500).json({ message: "Failed to fetch prescriptions" });
    }
  });

  app.get("/api/admin/prescriptions/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const prescription = await storage.getPrescription(id);
      if (!prescription) {
        return res.status(404).json({ message: "Prescription not found" });
      }
      res.json(prescription);
    } catch (error) {
      console.error("Error fetching prescription:", error);
      res.status(500).json({ message: "Failed to fetch prescription" });
    }
  });

  app.patch("/api/admin/prescriptions/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const prescription = await storage.getPrescription(id);
      if (!prescription) {
        return res.status(404).json({ message: "Prescription not found" });
      }
      // In a real implementation, you'd update the prescription
      // For now, we'll return the existing prescription
      res.json(prescription);
    } catch (error) {
      console.error("Error updating prescription:", error);
      res.status(500).json({ message: "Failed to update prescription" });
    }
  });

  app.delete("/api/admin/prescriptions/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const prescription = await storage.getPrescription(id);
      if (!prescription) {
        return res.status(404).json({ message: "Prescription not found" });
      }
      // In a real implementation, you'd delete the prescription
      // For now, we'll just return success
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting prescription:", error);
      res.status(500).json({ message: "Failed to delete prescription" });
    }
  });

  // Blocked slots routes for schedule management
  app.get("/api/blocked-slots", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const doctorId = req.query.doctorId ? parseInt(req.query.doctorId as string) : null;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : null;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : null;

      if (!doctorId) {
        return res.status(400).json({ message: "Doctor ID is required" });
      }

      const blockedSlots = await storage.getBlockedSlots(doctorId, startDate || undefined, endDate || undefined);
      res.json(blockedSlots);
    } catch (error) {
      console.error("Error fetching blocked slots:", error);
      res.status(500).json({ message: "Failed to fetch blocked slots" });
    }
  });

  app.post("/api/admin/block-slot", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { doctorId, date, reason, type } = req.body;

      if (!doctorId || !date || !reason || !type) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const blockedSlot = await storage.createBlockedSlot({
        doctorId: parseInt(doctorId),
        date: new Date(date),
        reason,
        type,
      });

      res.status(201).json(blockedSlot);
    } catch (error) {
      console.error("Error creating blocked slot:", error);
      res.status(500).json({ message: "Failed to create blocked slot" });
    }
  });

  app.delete("/api/admin/block-slot/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBlockedSlot(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting blocked slot:", error);
      res.status(500).json({ message: "Failed to delete blocked slot" });
    }
  });

  // Doctor schedules routes
  app.get("/api/doctor-schedules", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (user?.role === "admin") {
        // Admin can query any doctor's schedules
        const doctorId = req.query.doctorId ? parseInt(req.query.doctorId as string) : null;
        if (!doctorId) {
          return res.status(400).json({ message: "Doctor ID is required" });
        }
        const schedules = await storage.getDoctorSchedules(doctorId);
        res.json(schedules);
      } else {
        // Doctor can only query their own schedules
        // In development mode, return mock schedule data
        if (process.env.NODE_ENV !== "production") {
          const mockSchedules = [
            { id: 1, doctorId: 1, dayOfWeek: 1, startTime: "09:00", endTime: "17:00", isActive: true },
            { id: 2, doctorId: 1, dayOfWeek: 2, startTime: "09:00", endTime: "17:00", isActive: true },
            { id: 3, doctorId: 1, dayOfWeek: 3, startTime: "09:00", endTime: "17:00", isActive: true },
            { id: 4, doctorId: 1, dayOfWeek: 4, startTime: "09:00", endTime: "17:00", isActive: true },
            { id: 5, doctorId: 1, dayOfWeek: 5, startTime: "09:00", endTime: "17:00", isActive: true },
            { id: 6, doctorId: 1, dayOfWeek: 6, startTime: "10:00", endTime: "14:00", isActive: false },
            { id: 7, doctorId: 1, dayOfWeek: 0, startTime: "10:00", endTime: "14:00", isActive: false }
          ];
          console.log("Server: Returning mock doctor schedules");
          return res.json(mockSchedules);
        }

        const doctor = await storage.getDoctorByUserId(userId);
        if (!doctor) {
          return res.status(403).json({ message: "Not authorized as doctor" });
        }
        const schedules = await storage.getDoctorSchedules(doctor.id);
        res.json(schedules);
      }
    } catch (error) {
      console.error("Error fetching doctor schedules:", error);
      res.status(500).json({ message: "Failed to fetch doctor schedules" });
    }
  });

  // Encrypted document storage routes
  app.post("/api/documents/encrypted", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { content, title, type, description, appointmentId } = req.body;

      if (!content || !title || !type) {
        return res.status(400).json({ message: "Content, title, and type are required" });
      }

      const documentData = insertDocumentSchema.parse({
        patientId: userId,
        title,
        type,
        description: description || null,
        appointmentId: appointmentId || null,
        uploadedBy: userId,
      });

      const result = await storage.storeEncryptedDocument(documentData, content);

      res.status(201).json(result);
    } catch (error) {
      console.error("Error storing encrypted document:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to store encrypted document" });
    }
  });

  app.get("/api/documents/encrypted/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.retrieveEncryptedDocument(id);

      if (!result) {
        return res.status(404).json({ message: "Encrypted document not found" });
      }

      res.json(result);
    } catch (error) {
      console.error("Error retrieving encrypted document:", error);
      res.status(500).json({ message: "Failed to retrieve encrypted document" });
    }
  });

  // Payment routes
  app.get("/api/payments/config", async (req, res) => {
    try {
      const config = paymentService.getClientConfig();
      res.json(config);
    } catch (error) {
      console.error("Error getting payment config:", error);
      res.status(500).json({ message: "Failed to get payment configuration" });
    }
  });

  app.post("/api/payments/create-intent", isAuthenticated, async (req: any, res) => {
    try {
      const { amount, currency, metadata } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Valid amount is required" });
      }

      const paymentIntent = await paymentService.createPaymentIntent(
        amount,
        currency || 'INR',
        metadata
      );

      res.json(paymentIntent);
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });

  app.post("/api/payments/bill/:billId", isAuthenticated, async (req: any, res) => {
    try {
      const billId = parseInt(req.params.billId);
      const { paymentMethod } = req.body;

      const result = await paymentService.createBillPayment(billId, paymentMethod);
      res.json(result);
    } catch (error) {
      console.error("Error creating bill payment:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to create bill payment" });
    }
  });

  app.post("/api/payments/confirm/:billId", isAuthenticated, async (req: any, res) => {
    try {
      const billId = parseInt(req.params.billId);
      const { paymentIntentId, paymentMethod } = req.body;

      if (!paymentIntentId) {
        return res.status(400).json({ message: "Payment intent ID is required" });
      }

      const result = await paymentService.completeBillPayment(billId, paymentIntentId, paymentMethod);
      res.json(result);
    } catch (error) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to confirm payment" });
    }
  });

  app.post("/api/payments/refund/:billId", isAuthenticated, async (req: any, res) => {
    try {
      const billId = parseInt(req.params.billId);
      const { amount, reason } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Valid refund amount is required" });
      }

      const refund = await paymentService.refundBillPayment(billId, amount, reason);
      res.json(refund);
    } catch (error) {
      console.error("Error processing refund:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to process refund" });
    }
  });

  app.post("/api/payments/wallet", isAuthenticated, async (req: any, res) => {
    try {
      const { amount, walletType } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Valid amount is required" });
      }

      if (!['paytm', 'gpay', 'phonepe', 'amazonpay'].includes(walletType)) {
        return res.status(400).json({ message: "Invalid wallet type" });
      }

      const paymentIntent = await paymentService.createWalletPayment(amount, walletType);
      res.json(paymentIntent);
    } catch (error) {
      console.error("Error creating wallet payment:", error);
      res.status(500).json({ message: "Failed to create wallet payment" });
    }
  });

  app.post("/api/payments/upi", isAuthenticated, async (req: any, res) => {
    try {
      const { amount, upiId } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Valid amount is required" });
      }

      const paymentIntent = await paymentService.createUPIPayment(amount, upiId);
      res.json(paymentIntent);
    } catch (error) {
      console.error("Error creating UPI payment:", error);
      res.status(500).json({ message: "Failed to create UPI payment" });
    }
  });

  app.post("/api/payments/netbanking", isAuthenticated, async (req: any, res) => {
    try {
      const { amount, bankCode } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Valid amount is required" });
      }

      if (!bankCode) {
        return res.status(400).json({ message: "Bank code is required" });
      }

      const paymentIntent = await paymentService.createNetBankingPayment(amount, bankCode);
      res.json(paymentIntent);
    } catch (error) {
      console.error("Error creating net banking payment:", error);
      res.status(500).json({ message: "Failed to create net banking payment" });
    }
  });

  // Wearable integration routes
  app.get("/api/wearables/providers", async (req, res) => {
    try {
      const providers = wearableService.getSupportedProviders();
      const config = providers.map(provider => ({
        name: provider,
        configured: wearableService.isConfigured(provider),
      }));
      res.json(config);
    } catch (error) {
      console.error("Error getting wearable providers:", error);
      res.status(500).json({ message: "Failed to get wearable providers" });
    }
  });

  app.get("/api/wearables/auth/:provider", isAuthenticated, async (req: any, res) => {
    try {
      const { provider } = req.params;
      const { redirectUri } = req.query;

      if (!redirectUri) {
        return res.status(400).json({ message: "Redirect URI is required" });
      }

      let authUrl: string;

      switch (provider) {
        case 'fitbit':
          authUrl = wearableService.generateFitbitAuthUrl(redirectUri as string);
          break;
        case 'google_fit':
          authUrl = wearableService.generateGoogleFitAuthUrl(redirectUri as string);
          break;
        default:
          return res.status(400).json({ message: "Unsupported provider" });
      }

      res.json({ authUrl });
    } catch (error) {
      console.error("Error generating auth URL:", error);
      res.status(500).json({ message: "Failed to generate authorization URL" });
    }
  });

  app.post("/api/wearables/auth/callback/:provider", isAuthenticated, async (req: any, res) => {
    try {
      const { provider } = req.params;
      const { code, redirectUri } = req.body;
      const userId = req.user.claims.sub;

      if (!code || !redirectUri) {
        return res.status(400).json({ message: "Authorization code and redirect URI are required" });
      }

      let tokens: any;

      switch (provider) {
        case 'fitbit':
          tokens = await wearableService.exchangeFitbitCode(code, redirectUri);
          break;
        case 'google_fit':
          tokens = await wearableService.exchangeGoogleFitCode(code, redirectUri);
          break;
        default:
          return res.status(400).json({ message: "Unsupported provider" });
      }

      // Store tokens securely (in production, encrypt and store in database)
      // For now, we'll just acknowledge the connection
      console.log(`Wearable ${provider} connected for user ${userId}`);

      res.json({
        success: true,
        provider,
        connected: true,
        message: `${provider} connected successfully`,
      });
    } catch (error) {
      console.error("Error processing wearable auth callback:", error);
      res.status(500).json({ message: "Failed to connect wearable device" });
    }
  });

  app.post("/api/wearables/sync/:provider", isAuthenticated, async (req: any, res) => {
    try {
      const { provider } = req.params;
      const { date } = req.body;
      const userId = req.user.claims.sub;

      if (!date) {
        return res.status(400).json({ message: "Date is required" });
      }

      let wearableData: any;

      switch (provider) {
        case 'fitbit':
          // In production, you'd retrieve stored access token
          // For demo, we'll simulate data
          wearableData = {
            provider: 'fitbit',
            userId,
            data: {
              steps: Math.floor(Math.random() * 10000) + 5000,
              heartRate: Math.floor(Math.random() * 40) + 60,
              weight: Math.floor(Math.random() * 20) + 60,
              sleepHours: Math.floor(Math.random() * 4) + 6,
            },
            recordedAt: new Date(date),
          };
          break;
        default:
          return res.status(400).json({ message: "Unsupported provider" });
      }

      await wearableService.syncWearableData(userId, wearableData);

      res.json({
        success: true,
        message: `Data synced from ${provider}`,
        syncedData: wearableData.data,
      });
    } catch (error) {
      console.error("Error syncing wearable data:", error);
      res.status(500).json({ message: "Failed to sync wearable data" });
    }
  });

  app.post("/api/wearables/sync-all", isAuthenticated, async (req: any, res) => {
    try {
      await wearableService.syncAllUsersWearableData();
      res.json({
        success: true,
        message: "Wearable data sync completed for all users",
      });
    } catch (error) {
      console.error("Error syncing all wearable data:", error);
      res.status(500).json({ message: "Failed to sync wearable data" });
    }
  });

  // Digital signature routes
  app.post("/api/prescriptions/:id/sign", isAuthenticated, async (req: any, res) => {
    try {
      const prescriptionId = parseInt(req.params.id);
      const userId = req.user.claims.sub;

      // Verify the user is a doctor and owns this prescription
      const doctor = await storage.getDoctorByUserId(userId);
      if (!doctor) {
        return res.status(403).json({ message: "Only doctors can sign prescriptions" });
      }

      const prescription = await storage.getPrescription(prescriptionId);
      if (!prescription || prescription.doctorId !== doctor.id) {
        return res.status(403).json({ message: "Prescription not found or access denied" });
      }

      // Generate key pair (in production, use stored keys)
      const { privateKey } = await digitalSignatureService.generateKeyPair();

      // Sign the prescription
      const signature = await digitalSignatureService.signPrescription(prescriptionId, doctor.id, privateKey);

      // Create audit entry
      await digitalSignatureService.createPrescriptionAuditEntry(prescriptionId, 'signed', userId, {
        signatureId: signature.prescriptionId,
        algorithm: signature.algorithm,
      });

      res.json({
        success: true,
        signature,
        message: "Prescription signed successfully",
      });
    } catch (error) {
      console.error("Error signing prescription:", error);
      res.status(500).json({ message: "Failed to sign prescription" });
    }
  });

  app.get("/api/prescriptions/:id/signature", isAuthenticated, async (req: any, res) => {
    try {
      const prescriptionId = parseInt(req.params.id);

      const status = await digitalSignatureService.getPrescriptionSignatureStatus(prescriptionId);

      res.json(status);
    } catch (error) {
      console.error("Error getting prescription signature status:", error);
      res.status(500).json({ message: "Failed to get signature status" });
    }
  });

  app.post("/api/prescriptions/:id/verify", isAuthenticated, async (req: any, res) => {
    try {
      const prescriptionId = parseInt(req.params.id);

      const verification = await digitalSignatureService.verifyPrescriptionSignature(prescriptionId);

      res.json(verification);
    } catch (error) {
      console.error("Error verifying prescription signature:", error);
      res.status(500).json({ message: "Failed to verify prescription signature" });
    }
  });

  app.post("/api/doctors/certificate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      const doctor = await storage.getDoctorByUserId(userId);
      if (!doctor) {
        return res.status(403).json({ message: "Doctor profile not found" });
      }

      const certificate = await digitalSignatureService.createDoctorCertificate(doctor.id);

      res.json({
        certificate,
        doctorId: doctor.id,
        message: "Certificate created successfully",
      });
    } catch (error) {
      console.error("Error creating doctor certificate:", error);
      res.status(500).json({ message: "Failed to create certificate" });
    }
  });

  app.post("/api/doctors/certificate/validate", isAuthenticated, async (req: any, res) => {
    try {
      const { doctorId, certificate } = req.body;

      if (!doctorId || !certificate) {
        return res.status(400).json({ message: "Doctor ID and certificate are required" });
      }

      const isValid = await digitalSignatureService.validateDoctorCertificate(doctorId, certificate);

      res.json({
        isValid,
        doctorId,
        message: isValid ? "Certificate is valid" : "Certificate is invalid or expired",
      });
    } catch (error) {
      console.error("Error validating doctor certificate:", error);
      res.status(500).json({ message: "Failed to validate certificate" });
    }
  });

  // MFA routes
  app.get("/api/mfa/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      // In development mode, return mock MFA status
      if (process.env.NODE_ENV !== "production") {
        console.log("Server: Returning mock MFA status");
        return res.json({
          enabled: false,
          availableMethods: ['totp', 'sms', 'hardware'],
        });
      }

      const hasMFA = await mfaService.hasMFAEnabled(userId);
      const availableMethods = mfaService.getAvailableMethods(userId);

      res.json({
        enabled: hasMFA,
        availableMethods,
      });
    } catch (error) {
      console.error("Error getting MFA status:", error);
      res.status(500).json({ message: "Failed to get MFA status" });
    }
  });

  app.post("/api/mfa/setup", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { method, phoneNumber } = req.body;

      if (!['totp', 'sms', 'hardware'].includes(method)) {
        return res.status(400).json({ message: "Invalid MFA method" });
      }

      const result = await mfaService.setupMFA(userId, method, phoneNumber);

      res.json({
        success: true,
        method,
        setup: result,
        message: `${method.toUpperCase()} MFA setup initiated`,
      });
    } catch (error) {
      console.error("Error setting up MFA:", error);
      res.status(500).json({ message: "Failed to setup MFA" });
    }
  });

  app.post("/api/mfa/verify", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { code, method } = req.body;

      if (!code || !method) {
        return res.status(400).json({ message: "Code and method are required" });
      }

      // Check rate limiting
      if (!mfaService.checkRateLimit(userId)) {
        return res.status(429).json({ message: "Too many MFA attempts. Please try again later." });
      }

      const verification = await mfaService.verifyMFA(userId, code, method);

      if (verification.isValid) {
        res.json({
          success: true,
          method: verification.method,
          message: "MFA verification successful",
        });
      } else {
        res.status(401).json({
          success: false,
          method: verification.method,
          message: verification.error || "MFA verification failed",
        });
      }
    } catch (error) {
      console.error("Error verifying MFA:", error);
      res.status(500).json({ message: "Failed to verify MFA" });
    }
  });

  app.post("/api/mfa/disable", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const success = await mfaService.disableMFA(userId);

      if (success) {
        res.json({
          success: true,
          message: "MFA disabled successfully",
        });
      } else {
        res.status(500).json({ message: "Failed to disable MFA" });
      }
    } catch (error) {
      console.error("Error disabling MFA:", error);
      res.status(500).json({ message: "Failed to disable MFA" });
    }
  });

  app.post("/api/mfa/recovery-codes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const codes = await mfaService.generateRecoveryCodes(userId);

      res.json({
        success: true,
        recoveryCodes: codes,
        message: "Recovery codes generated successfully",
      });
    } catch (error) {
      console.error("Error generating recovery codes:", error);
      res.status(500).json({ message: "Failed to generate recovery codes" });
    }
  });

  app.post("/api/mfa/verify-recovery", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({ message: "Recovery code is required" });
      }

      const isValid = await mfaService.validateRecoveryCode(userId, code);

      if (isValid) {
        res.json({
          success: true,
          message: "Recovery code accepted",
        });
      } else {
        res.status(401).json({
          success: false,
          message: "Invalid recovery code",
        });
      }
    } catch (error) {
      console.error("Error verifying recovery code:", error);
      res.status(500).json({ message: "Failed to verify recovery code" });
    }
  });

  // Appointment workflow routes

  // Doctor status management
  app.get("/api/doctor/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const doctor = await storage.getDoctorByUserId(userId);
      if (!doctor) {
        return res.status(403).json({ message: "Not authorized as doctor" });
      }

      const status = await storage.getDoctorStatus(doctor.id);
      res.json(status || { status: "offline", doctorId: doctor.id });
    } catch (error) {
      console.error("Error getting doctor status:", error);
      res.status(500).json({ message: "Failed to get doctor status" });
    }
  });

  app.patch("/api/doctor/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const doctor = await storage.getDoctorByUserId(userId);
      if (!doctor) {
        return res.status(403).json({ message: "Not authorized as doctor" });
      }

      const { status, currentPatientId, currentAppointmentId, statusMessage } = req.body;

      const updatedStatus = await storage.updateDoctorStatus(doctor.id, {
        status,
        currentPatientId,
        currentAppointmentId,
        statusMessage
      });

      res.json(updatedStatus);
    } catch (error) {
      console.error("Error updating doctor status:", error);
      res.status(500).json({ message: "Failed to update doctor status" });
    }
  });

  // Get doctor status for patients
  app.get("/api/doctors/:id/status", isAuthenticated, async (req, res) => {
    try {
      const doctorId = parseInt(req.params.id);
      const status = await storage.getDoctorStatus(doctorId);
      res.json(status || { status: "offline", doctorId });
    } catch (error) {
      console.error("Error getting doctor status:", error);
      res.status(500).json({ message: "Failed to get doctor status" });
    }
  });

  // Appointment queue management
  app.get("/api/appointments/queue/:doctorId", isAuthenticated, async (req: any, res) => {
    try {
      const doctorId = parseInt(req.params.doctorId);
      const userId = req.user.claims.sub;

      // Check if user is the doctor or a patient with an appointment
      const doctor = await storage.getDoctorByUserId(userId);
      const isDoctor = doctor && doctor.id === doctorId;

      if (!isDoctor) {
        // Check if patient has appointment with this doctor today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const patientAppointments = await storage.getAppointments(userId);
        const hasAppointmentToday = patientAppointments.some(apt =>
          apt.doctorId === doctorId &&
          new Date(apt.appointmentDate) >= today &&
          new Date(apt.appointmentDate) < tomorrow
        );

        if (!hasAppointmentToday) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      const queue = await storage.getAppointmentQueue(doctorId);
      res.json(queue);
    } catch (error) {
      console.error("Error getting appointment queue:", error);
      res.status(500).json({ message: "Failed to get appointment queue" });
    }
  });

  // Check-in for appointment
  app.post("/api/appointments/:id/checkin", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;

      const appointment = await storage.getAppointment(id);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      if (appointment.patientId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedAppointment = await storage.updateAppointment(id, {
        status: "waiting",
        checkInTime: new Date()
      });

      // Update queue position
      await storage.updateAppointmentQueuePosition(id);

      res.json(updatedAppointment);
    } catch (error) {
      console.error("Error checking in appointment:", error);
      res.status(500).json({ message: "Failed to check in" });
    }
  });

  // Start appointment (doctor only)
  app.post("/api/appointments/:id/start", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.claims.sub;

      const doctor = await storage.getDoctorByUserId(userId);
      if (!doctor) {
        return res.status(403).json({ message: "Not authorized as doctor" });
      }

      const appointment = await storage.getAppointment(id);
      if (!appointment || appointment.doctorId !== doctor.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedAppointment = await storage.updateAppointment(id, {
        status: "in_progress",
        startedAt: new Date()
      });

      // Update doctor status
      await storage.updateDoctorStatus(doctor.id, {
        status: "with_patient",
        currentPatientId: appointment.patientId,
        currentAppointmentId: id
      });

      res.json(updatedAppointment);
    } catch (error) {
      console.error("Error starting appointment:", error);
      res.status(500).json({ message: "Failed to start appointment" });
    }
  });

  // Get next appointments for patient
  app.get("/api/appointments/next", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const nextAppointments = await storage.getNextAppointments(userId, 2);
      res.json(nextAppointments);
    } catch (error) {
      console.error("Error getting next appointments:", error);
      res.status(500).json({ message: "Failed to get next appointments" });
    }
  });

  // Send 15-minute reminder notifications
  app.post("/api/appointments/send-reminders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const doctor = await storage.getDoctorByUserId(userId);
      if (!doctor) {
        return res.status(403).json({ message: "Not authorized as doctor" });
      }

      // Get appointments in next 15 minutes
      const now = new Date();
      const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);

      const upcomingAppointments = await storage.getAppointmentsInTimeRange(now, fifteenMinutesFromNow);

      let sentCount = 0;
      for (const appointment of upcomingAppointments) {
        // Send notification to patient
        await notificationService.sendNotificationToUser(appointment.patientId, {
          title: "Appointment Reminder",
          message: `Your appointment with Dr. ${doctor.user?.firstName} ${doctor.user?.lastName} is in 15 minutes (${appointment.appointmentTime})`,
          type: "appointment_15min",
          priority: "high"
        });

        // Send notification to doctor
        await notificationService.sendNotificationToUser(doctor.userId, {
          title: "Upcoming Appointment",
          message: `Appointment with ${appointment.patient?.firstName} ${appointment.patient?.lastName} in 15 minutes (${appointment.appointmentTime})`,
          type: "appointment_15min",
          priority: "medium"
        });

        sentCount++;
      }

      res.json({ message: `Sent ${sentCount} reminder notifications` });
    } catch (error) {
      console.error("Error sending reminders:", error);
      res.status(500).json({ message: "Failed to send reminders" });
    }
  });

  // Financial management routes
  app.post("/api/payments/cash/:billId", isAuthenticated, async (req: any, res) => {
    try {
      const billId = parseInt(req.params.billId);
      const { amount, receivedBy, notes } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Valid amount is required" });
      }

      if (!receivedBy) {
        return res.status(400).json({ message: "Received by is required" });
      }

      const result = await paymentService.processCashPayment(billId, amount, receivedBy, notes);
      res.json(result);
    } catch (error) {
      console.error("Error processing cash payment:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to process cash payment" });
    }
  });

  app.get("/api/financial/summary", isAuthenticated, async (req: any, res) => {
    try {
      const { dateFrom, dateTo } = req.query;
      const dateFromObj = dateFrom ? new Date(dateFrom as string) : undefined;
      const dateToObj = dateTo ? new Date(dateTo as string) : undefined;

      const summary = await paymentService.getFinancialSummary(dateFromObj, dateToObj);
      res.json(summary);
    } catch (error) {
      console.error("Error getting financial summary:", error);
      res.status(500).json({ message: "Failed to get financial summary" });
    }
  });

  app.get("/api/financial/revenue-by-doctor", isAuthenticated, async (req: any, res) => {
    try {
      const { dateFrom, dateTo } = req.query;
      const dateFromObj = dateFrom ? new Date(dateFrom as string) : undefined;
      const dateToObj = dateTo ? new Date(dateTo as string) : undefined;

      const revenue = await paymentService.getRevenueByDoctor(dateFromObj, dateToObj);
      res.json(revenue);
    } catch (error) {
      console.error("Error getting revenue by doctor:", error);
      res.status(500).json({ message: "Failed to get revenue by doctor" });
    }
  });

  app.get("/api/financial/payment-methods", isAuthenticated, async (req: any, res) => {
    try {
      const { dateFrom, dateTo } = req.query;
      const dateFromObj = dateFrom ? new Date(dateFrom as string) : undefined;
      const dateToObj = dateTo ? new Date(dateTo as string) : undefined;

      const breakdown = await paymentService.getPaymentMethodBreakdown(dateFromObj, dateToObj);
      res.json(breakdown);
    } catch (error) {
      console.error("Error getting payment method breakdown:", error);
      res.status(500).json({ message: "Failed to get payment method breakdown" });
    }
  });

  app.get("/api/financial/cash-transactions", isAuthenticated, async (req: any, res) => {
    try {
      const { dateFrom, dateTo, receivedBy, type } = req.query;
      const filters = {
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
        receivedBy: receivedBy as string,
        type: type as string,
      };

      const transactions = await paymentService.getCashTransactions(filters);
      res.json(transactions);
    } catch (error) {
      console.error("Error getting cash transactions:", error);
      res.status(500).json({ message: "Failed to get cash transactions" });
    }
  });

  app.get("/api/financial/outstanding-bills", isAuthenticated, async (req: any, res) => {
    try {
      // Get all bills and filter for outstanding ones
      const allBills = await storage.getBills('');
      const outstandingBills = allBills
        .filter(bill => bill.status === 'pending')
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      // If no outstanding bills from storage, return mock data
      if (outstandingBills.length === 0) {
        const mockOutstandingBills = [
          {
            id: 2,
            patientId: "dev-user",
            appointmentId: 2,
            amount: "300.00",
            description: "Cardiac consultation and ECG",
            status: "pending",
            paymentMethod: null,
            paidAt: null,
            createdAt: new Date("2024-12-20")
          },
          {
            id: 5,
            patientId: "dev-user",
            appointmentId: null,
            amount: "275.00",
            description: "CT scan - Chest",
            status: "pending",
            paymentMethod: null,
            paidAt: null,
            createdAt: new Date("2024-12-24")
          },
          {
            id: 13,
            patientId: "patient-3",
            appointmentId: null,
            amount: "85.00",
            description: "Allergy testing",
            status: "pending",
            paymentMethod: null,
            paidAt: null,
            createdAt: new Date("2025-01-10")
          },
          {
            id: 19,
            patientId: "dev-user",
            appointmentId: null,
            amount: "275.00",
            description: "CT scan - Chest",
            status: "pending",
            paymentMethod: null,
            paidAt: null,
            createdAt: new Date("2024-12-24")
          }
        ];
        res.json(mockOutstandingBills);
      } else {
        res.json(outstandingBills);
      }
    } catch (error) {
      console.error("Error getting outstanding bills:", error);
      res.status(500).json({ message: "Failed to get outstanding bills" });
    }
  });

  app.get("/api/financial/recent-transactions", isAuthenticated, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;

      // Get recent bills (both paid and pending)
      const allBills = await storage.getBills('');
      const recentTransactions = allBills
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit)
        .map(bill => ({
          ...bill,
          transactionType: bill.status === 'paid' ? 'payment' : 'bill_created',
          paymentMethod: bill.paymentMethod || 'pending'
        }));

      // If no transactions from storage, return mock data
      if (recentTransactions.length === 0) {
        const mockRecentTransactions = [
          {
            id: 1,
            patientId: "dev-user",
            appointmentId: 1,
            amount: "150.00",
            description: "General consultation and blood pressure check",
            status: "paid",
            paymentMethod: "credit_card",
            paidAt: new Date("2024-12-16"),
            createdAt: new Date("2024-12-15"),
            transactionType: "payment",
          },
          {
            id: 3,
            patientId: "patient-2",
            appointmentId: 5,
            amount: "450.00",
            description: "Orthopedic consultation and knee X-ray",
            status: "paid",
            paymentMethod: "insurance",
            paidAt: new Date("2024-12-19"),
            createdAt: new Date("2024-12-18"),
            transactionType: "payment",
          },
          {
            id: 7,
            patientId: "patient-1",
            appointmentId: null,
            amount: "120.00",
            description: "Dental cleaning and checkup",
            status: "paid",
            paymentMethod: "cash",
            paidAt: new Date("2024-11-15"),
            createdAt: new Date("2024-11-12"),
            transactionType: "payment",
          },
          {
            id: 10,
            patientId: "patient-2",
            appointmentId: null,
            amount: "280.00",
            description: "Sports medicine consultation",
            status: "paid",
            paymentMethod: "wallet",
            paidAt: new Date("2024-12-01"),
            createdAt: new Date("2024-11-28"),
            transactionType: "payment",
          },
          {
            id: 2,
            patientId: "dev-user",
            appointmentId: 2,
            amount: "300.00",
            description: "Cardiac consultation and ECG",
            status: "pending",
            paymentMethod: null,
            paidAt: null,
            createdAt: new Date("2024-12-20"),
            transactionType: "bill_created",
          },
          {
            id: 5,
            patientId: "dev-user",
            appointmentId: null,
            amount: "275.00",
            description: "CT scan - Chest",
            status: "pending",
            paymentMethod: null,
            paidAt: null,
            createdAt: new Date("2024-12-24"),
            transactionType: "bill_created",
          },
          {
            id: 13,
            patientId: "patient-3",
            appointmentId: null,
            amount: "85.00",
            description: "Allergy testing",
            status: "pending",
            paymentMethod: null,
            paidAt: null,
            createdAt: new Date("2025-01-10"),
            transactionType: "bill_created",
          },
          {
            id: 19,
            patientId: "dev-user",
            appointmentId: null,
            amount: "275.00",
            description: "CT scan - Chest",
            status: "pending",
            paymentMethod: null,
            paidAt: null,
            createdAt: new Date("2024-12-24"),
            transactionType: "bill_created",
          }
        ].slice(0, limit);

        res.json(mockRecentTransactions);
      } else {
        res.json(recentTransactions);
      }
    } catch (error) {
      console.error("Error getting recent transactions:", error);
      res.status(500).json({ message: "Failed to get recent transactions" });
    }
  });

  // Invoice generation route
  app.get("/api/financial/invoice/:billId", isAuthenticated, async (req: any, res) => {
    try {
      const billId = parseInt(req.params.billId);
      const allBills = await storage.getBills('');
      const bill = allBills.find(b => b.id === billId);

      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }

      // Get patient info
      const patient = await storage.getUser(bill.patientId);

      // Generate invoice number
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(billId).padStart(5, '0')}`;

      const invoice = {
        invoiceNumber,
        billId: bill.id,
        date: new Date(),
        patient: patient ? {
          name: `${patient.firstName} ${patient.lastName}`,
          email: patient.email,
          phone: patient.phone,
          address: patient.address
        } : {
          name: "Unknown Patient",
          email: "",
          phone: "",
          address: ""
        },
        hospital: {
          name: "HealthConnect Hospital",
          address: "123 Medical Plaza, Healthcare City, HC 12345",
          phone: "+1 (555) 123-4567",
          email: "contact@healthconnect.com"
        },
        description: bill.description,
        amount: parseFloat(bill.amount.toString()),
        status: bill.status,
        paymentMethod: bill.paymentMethod,
        paidAt: bill.paidAt,
        createdAt: bill.createdAt
      };

      res.json(invoice);
    } catch (error) {
      console.error("Error generating invoice:", error);
      res.status(500).json({ message: "Failed to generate invoice" });
    }
  });

  return httpServer;
}