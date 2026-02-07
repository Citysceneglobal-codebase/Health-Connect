import { sql, relations } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  real,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles enum
export type UserRole = "patient" | "doctor" | "admin";

// Users table - supports all three roles
export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  role: text("role").$type<UserRole>().default("patient").notNull(),
  phone: text("phone"),
  dateOfBirth: text("date_of_birth"), // Store as ISO string
  gender: text("gender"),
  address: text("address"),
  pushToken: text("push_token"), // For push notifications
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Departments table
export const departments = sqliteTable("departments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Doctors table - extends user with doctor-specific info
export const doctors = sqliteTable("doctors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").references(() => users.id).notNull(),
  departmentId: integer("department_id").references(() => departments.id),
  specialty: text("specialty"),
  qualification: text("qualification"),
  experience: integer("experience"),
  consultationFee: real("consultation_fee"),
  bio: text("bio"),
  isAvailable: integer("is_available", { mode: 'boolean' }).default(true),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Doctor schedules
export const doctorSchedules = sqliteTable("doctor_schedules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  doctorId: integer("doctor_id").references(() => doctors.id).notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday-Saturday)
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  slotDuration: integer("slot_duration").default(30), // in minutes
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
});

// Doctor status tracking
export const doctorStatus = sqliteTable("doctor_status", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  doctorId: integer("doctor_id").references(() => doctors.id).notNull(),
  status: text("status").$type<"offline" | "available" | "busy" | "with_patient" | "break" | "away">().default("offline").notNull(),
  currentPatientId: text("current_patient_id").references(() => users.id), // Patient currently being seen
  currentAppointmentId: integer("current_appointment_id").references(() => appointments.id),
  lastUpdated: integer("last_updated", { mode: 'timestamp' }).$defaultFn(() => new Date()),
  statusMessage: text("status_message"), // Optional message like "On break until 2 PM"
});

// Appointments
export const appointments = sqliteTable("appointments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  patientId: text("patient_id").references(() => users.id).notNull(),
  doctorId: integer("doctor_id").references(() => doctors.id).notNull(),
  appointmentDate: text("appointment_date").notNull(), // Store as YYYY-MM-DD
  appointmentTime: text("appointment_time").notNull(), // Store as HH:MM
  status: text("status").$type<"pending" | "confirmed" | "cancelled" | "completed" | "no_show" | "in_progress" | "waiting">().default("pending").notNull(),
  reason: text("reason"),
  notes: text("notes"),
  queuePosition: integer("queue_position"), // Position in queue for the day
  estimatedWaitTime: integer("estimated_wait_time"), // in minutes
  checkInTime: integer("check_in_time", { mode: 'timestamp' }), // When patient checked in
  startedAt: integer("started_at", { mode: 'timestamp' }), // When consultation started
  completedAt: integer("completed_at", { mode: 'timestamp' }), // When consultation completed
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Medicines warehouse
export const medicines = sqliteTable("medicines", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  genericName: text("generic_name"),
  category: text("category"),
  manufacturer: text("manufacturer"),
  dosageForm: text("dosage_form"), // tablet, capsule, syrup, etc.
  strength: text("strength"),
  description: text("description"),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Prescriptions
export const prescriptions = sqliteTable("prescriptions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  patientId: text("patient_id").references(() => users.id).notNull(),
  doctorId: integer("doctor_id").references(() => doctors.id).notNull(),
  diagnosis: text("diagnosis"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Prescription items (medicines in a prescription)
export const prescriptionItems = sqliteTable("prescription_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  prescriptionId: integer("prescription_id").references(() => prescriptions.id).notNull(),
  medicineId: integer("medicine_id").references(() => medicines.id).notNull(),
  dosage: text("dosage"),
  frequency: text("frequency"), // e.g., "twice daily", "every 8 hours"
  duration: text("duration"), // e.g., "7 days", "2 weeks"
  instructions: text("instructions"),
});

// Patient vitals
export const vitals = sqliteTable("vitals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  patientId: text("patient_id").references(() => users.id).notNull(),
  type: text("type").$type<"bp" | "glucose" | "heart_rate" | "weight" | "bmi" | "temperature">().notNull(),
  value: text("value").notNull(),
  unit: text("unit"),
  recordedAt: integer("recorded_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
  notes: text("notes"),
});

// Patient allergies
export const allergies = sqliteTable("allergies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  patientId: text("patient_id").references(() => users.id).notNull(),
  type: text("type").$type<"medicine" | "food" | "other">().notNull(),
  allergen: text("allergen").notNull(),
  severity: text("severity").$type<"mild" | "moderate" | "severe">().default("moderate"),
  reaction: text("reaction"),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Family members
export const familyMembers = sqliteTable("family_members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  primaryUserId: text("primary_user_id").references(() => users.id).notNull(),
  memberId: text("member_id").references(() => users.id).notNull(),
  relationship: text("relationship").notNull(), // spouse, child, parent, sibling
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Medical documents
export const documents = sqliteTable("documents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  patientId: text("patient_id").references(() => users.id).notNull(),
  type: text("type").$type<"lab_report" | "radiology" | "prescription" | "discharge_summary" | "visit_summary" | "other">().notNull(),
  title: text("title").notNull(),
  description: text("description"),
  fileUrl: text("file_url"),
  uploadedBy: text("uploaded_by").references(() => users.id),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Billing/Payments
export const bills = sqliteTable("bills", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  patientId: text("patient_id").references(() => users.id).notNull(),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  amount: real("amount").notNull(),
  status: text("status").$type<"pending" | "paid" | "refunded">().default("pending").notNull(),
  paymentMethod: text("payment_method"),
  description: text("description"),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
  paidAt: integer("paid_at", { mode: 'timestamp' }),
});

// Favorites (patients can mark preferred doctors)
export const favorites = sqliteTable("favorites", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  patientId: text("patient_id").references(() => users.id).notNull(),
  doctorId: integer("doctor_id").references(() => doctors.id).notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Notifications
export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").references(() => users.id).notNull(),
  type: text("type").$type<"appointment_reminder" | "appointment_15min" | "queue_position" | "your_turn" | "doctor_available" | "report_ready" | "prescription_added" | "payment_due" | "appointment_confirmed" | "appointment_cancelled" | "general">().notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: integer("is_read", { mode: 'boolean' }).default(false),
  priority: text("priority").$type<"low" | "medium" | "high">().default("medium"),
  data: text("data", { mode: 'json' }), // Additional data like appointment ID, etc.
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Notification preferences
export const notificationPreferences = sqliteTable("notification_preferences", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").references(() => users.id).notNull(),
  emailEnabled: integer("email_enabled", { mode: 'boolean' }).default(true),
  smsEnabled: integer("sms_enabled", { mode: 'boolean' }).default(false),
  pushEnabled: integer("push_enabled", { mode: 'boolean' }).default(true),
  appointmentReminders: integer("appointment_reminders", { mode: 'boolean' }).default(true),
  reportNotifications: integer("report_notifications", { mode: 'boolean' }).default(true),
  paymentReminders: integer("payment_reminders", { mode: 'boolean' }).default(true),
  marketingEmails: integer("marketing_emails", { mode: 'boolean' }).default(false),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Secure messaging
export const messages = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  senderId: text("sender_id").references(() => users.id).notNull(),
  receiverId: text("receiver_id").references(() => users.id).notNull(),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  isRead: integer("is_read", { mode: 'boolean' }).default(false),
  priority: text("priority").$type<"low" | "medium" | "high">().default("medium"),
  expiresAt: integer("expires_at", { mode: 'timestamp' }), // For auto-expiry (24 hours for consultations)
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Vaccinations
export const vaccinations = sqliteTable("vaccinations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  patientId: text("patient_id").references(() => users.id).notNull(),
  vaccineName: text("vaccine_name").notNull(),
  vaccineType: text("vaccine_type"), // e.g., COVID-19, Flu, MMR
  doseNumber: integer("dose_number"),
  totalDoses: integer("total_doses"),
  administeredDate: text("administered_date").notNull(), // Store as YYYY-MM-DD
  administeredBy: text("administered_by"), // doctor or clinic name
  batchNumber: text("batch_number"),
  nextDueDate: text("next_due_date"), // Store as YYYY-MM-DD
  notes: text("notes"),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  doctorProfile: one(doctors, {
    fields: [users.id],
    references: [doctors.userId],
  }),
  appointments: many(appointments),
  vitals: many(vitals),
  allergies: many(allergies),
  documents: many(documents),
  bills: many(bills),
}));

export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  user: one(users, {
    fields: [doctors.userId],
    references: [users.id],
  }),
  department: one(departments, {
    fields: [doctors.departmentId],
    references: [departments.id],
  }),
  schedules: many(doctorSchedules),
  status: one(doctorStatus, {
    fields: [doctors.id],
    references: [doctorStatus.doctorId],
  }),
  appointments: many(appointments),
  prescriptions: many(prescriptions),
}));

export const departmentsRelations = relations(departments, ({ many }) => ({
  doctors: many(doctors),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  patient: one(users, {
    fields: [appointments.patientId],
    references: [users.id],
  }),
  doctor: one(doctors, {
    fields: [appointments.doctorId],
    references: [doctors.id],
  }),
}));

export const prescriptionsRelations = relations(prescriptions, ({ one, many }) => ({
  patient: one(users, {
    fields: [prescriptions.patientId],
    references: [users.id],
  }),
  doctor: one(doctors, {
    fields: [prescriptions.doctorId],
    references: [doctors.id],
  }),
  appointment: one(appointments, {
    fields: [prescriptions.appointmentId],
    references: [appointments.id],
  }),
  items: many(prescriptionItems),
}));

export const prescriptionItemsRelations = relations(prescriptionItems, ({ one }) => ({
  prescription: one(prescriptions, {
    fields: [prescriptionItems.prescriptionId],
    references: [prescriptions.id],
  }),
  medicine: one(medicines, {
    fields: [prescriptionItems.medicineId],
    references: [medicines.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDepartmentSchema = createInsertSchema(departments).omit({ id: true, createdAt: true });
export const insertDoctorSchema = createInsertSchema(doctors).omit({ id: true, createdAt: true });
export const insertDoctorScheduleSchema = createInsertSchema(doctorSchedules).omit({ id: true });
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true, createdAt: true, updatedAt: true, completedAt: true });
export const insertDoctorStatusSchema = createInsertSchema(doctorStatus).omit({ id: true, lastUpdated: true });
export const insertMedicineSchema = createInsertSchema(medicines).omit({ id: true, createdAt: true });
export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({ id: true, createdAt: true });
export const insertPrescriptionItemSchema = createInsertSchema(prescriptionItems).omit({ id: true });
export const insertVitalSchema = createInsertSchema(vitals).omit({ id: true, recordedAt: true });
export const insertAllergySchema = createInsertSchema(allergies).omit({ id: true, createdAt: true });
export const insertFamilyMemberSchema = createInsertSchema(familyMembers).omit({ id: true, createdAt: true });
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, createdAt: true });
export const insertBillSchema = createInsertSchema(bills).omit({ id: true, createdAt: true, paidAt: true });
export const insertFavoriteSchema = createInsertSchema(favorites).omit({ id: true, createdAt: true });
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export const insertNotificationPreferenceSchema = createInsertSchema(notificationPreferences).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertVaccinationSchema = createInsertSchema(vaccinations).omit({ id: true, createdAt: true });

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Doctor = typeof doctors.$inferSelect;
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type DoctorSchedule = typeof doctorSchedules.$inferSelect;
export type InsertDoctorSchedule = z.infer<typeof insertDoctorScheduleSchema>;
export type DoctorStatus = typeof doctorStatus.$inferSelect;
export type InsertDoctorStatus = z.infer<typeof insertDoctorStatusSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Medicine = typeof medicines.$inferSelect;
export type InsertMedicine = z.infer<typeof insertMedicineSchema>;
export type Prescription = typeof prescriptions.$inferSelect;
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;
export type PrescriptionItem = typeof prescriptionItems.$inferSelect;
export type InsertPrescriptionItem = z.infer<typeof insertPrescriptionItemSchema>;
export type Vital = typeof vitals.$inferSelect;
export type InsertVital = z.infer<typeof insertVitalSchema>;
export type Allergy = typeof allergies.$inferSelect;
export type InsertAllergy = z.infer<typeof insertAllergySchema>;
export type FamilyMember = typeof familyMembers.$inferSelect;
export type InsertFamilyMember = z.infer<typeof insertFamilyMemberSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Bill = typeof bills.$inferSelect;
export type InsertBill = z.infer<typeof insertBillSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = z.infer<typeof insertNotificationPreferenceSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Vaccination = typeof vaccinations.$inferSelect;
export type InsertVaccination = z.infer<typeof insertVaccinationSchema>;

// Extended types for frontend use
export type DoctorWithUser = Doctor & { user: User; department?: Department };
export type AppointmentWithDetails = Appointment & {
  doctor: DoctorWithUser;
  patient: User;
};
export type PrescriptionWithDetails = Prescription & {
  items: (PrescriptionItem & { medicine: Medicine })[];
  doctor: DoctorWithUser;
};

// Export all schema tables for migrations
export const schema = {
  users,
  departments,
  doctors,
  doctorSchedules,
  doctorStatus,
  appointments,
  medicines,
  prescriptions,
  prescriptionItems,
  vitals,
  allergies,
  familyMembers,
  documents,
  bills,
  favorites,
  notifications,
  notificationPreferences,
  messages,
  vaccinations,
};
