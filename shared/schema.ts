import { sql, relations } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  real,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles enum
export type UserRole = "patient" | "doctor" | "admin";

// Users table - supports all three roles
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").$type<UserRole>().default("patient").notNull(),
  phone: varchar("phone"),
  dateOfBirth: date("date_of_birth"),
  gender: varchar("gender"),
  address: text("address"),
  pushToken: varchar("push_token"), // For push notifications
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Departments table
export const departments = pgTable("departments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name").notNull(),
  description: text("description"),
  icon: varchar("icon"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Doctors table - extends user with doctor-specific info
export const doctors = pgTable("doctors", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  departmentId: integer("department_id").references(() => departments.id),
  specialty: varchar("specialty"),
  qualification: varchar("qualification"),
  experience: integer("experience"),
  consultationFee: decimal("consultation_fee", { precision: 10, scale: 2 }),
  bio: text("bio"),
  isAvailable: boolean("is_available").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Doctor schedules
export const doctorSchedules = pgTable("doctor_schedules", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  doctorId: integer("doctor_id").references(() => doctors.id).notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday-Saturday)
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  slotDuration: integer("slot_duration").default(30), // in minutes
  isActive: boolean("is_active").default(true),
});

// Doctor status tracking
export const doctorStatus = pgTable("doctor_status", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  doctorId: integer("doctor_id").references(() => doctors.id).notNull(),
  status: varchar("status").$type<"offline" | "available" | "busy" | "with_patient" | "break" | "away">().default("offline").notNull(),
  currentPatientId: varchar("current_patient_id").references(() => users.id), // Patient currently being seen
  currentAppointmentId: integer("current_appointment_id").references(() => appointments.id),
  lastUpdated: timestamp("last_updated").defaultNow(),
  statusMessage: text("status_message"), // Optional message like "On break until 2 PM"
});

// Appointments
export const appointments = pgTable("appointments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  patientId: varchar("patient_id").references(() => users.id).notNull(),
  doctorId: integer("doctor_id").references(() => doctors.id).notNull(),
  appointmentDate: date("appointment_date").notNull(),
  appointmentTime: time("appointment_time").notNull(),
  status: varchar("status").$type<"pending" | "confirmed" | "cancelled" | "completed" | "no_show" | "in_progress" | "waiting">().default("pending").notNull(),
  reason: text("reason"),
  notes: text("notes"),
  queuePosition: integer("queue_position"), // Position in queue for the day
  estimatedWaitTime: integer("estimated_wait_time"), // in minutes
  checkInTime: timestamp("check_in_time"), // When patient checked in
  startedAt: timestamp("started_at"), // When consultation started
  completedAt: timestamp("completed_at"), // When consultation completed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Medicines warehouse
export const medicines = pgTable("medicines", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name").notNull(),
  genericName: varchar("generic_name"),
  category: varchar("category"),
  manufacturer: varchar("manufacturer"),
  dosageForm: varchar("dosage_form"), // tablet, capsule, syrup, etc.
  strength: varchar("strength"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Prescriptions
export const prescriptions = pgTable("prescriptions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  patientId: varchar("patient_id").references(() => users.id).notNull(),
  doctorId: integer("doctor_id").references(() => doctors.id).notNull(),
  diagnosis: text("diagnosis"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Prescription items (medicines in a prescription)
export const prescriptionItems = pgTable("prescription_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  prescriptionId: integer("prescription_id").references(() => prescriptions.id).notNull(),
  medicineId: integer("medicine_id").references(() => medicines.id).notNull(),
  dosage: varchar("dosage"),
  frequency: varchar("frequency"), // e.g., "twice daily", "every 8 hours"
  duration: varchar("duration"), // e.g., "7 days", "2 weeks"
  instructions: text("instructions"),
});

// Patient vitals
export const vitals = pgTable("vitals", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  patientId: varchar("patient_id").references(() => users.id).notNull(),
  type: varchar("type").$type<"bp" | "glucose" | "heart_rate" | "weight" | "bmi" | "temperature">().notNull(),
  value: varchar("value").notNull(),
  unit: varchar("unit"),
  recordedAt: timestamp("recorded_at").defaultNow(),
  notes: text("notes"),
});

// Patient allergies
export const allergies = pgTable("allergies", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  patientId: varchar("patient_id").references(() => users.id).notNull(),
  type: varchar("type").$type<"medicine" | "food" | "other">().notNull(),
  allergen: varchar("allergen").notNull(),
  severity: varchar("severity").$type<"mild" | "moderate" | "severe">().default("moderate"),
  reaction: text("reaction"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Family members
export const familyMembers = pgTable("family_members", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  primaryUserId: varchar("primary_user_id").references(() => users.id).notNull(),
  memberId: varchar("member_id").references(() => users.id).notNull(),
  relationship: varchar("relationship").notNull(), // spouse, child, parent, sibling
  createdAt: timestamp("created_at").defaultNow(),
});

// Medical documents
export const documents = pgTable("documents", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  patientId: varchar("patient_id").references(() => users.id).notNull(),
  type: varchar("type").$type<"lab_report" | "radiology" | "prescription" | "discharge_summary" | "visit_summary" | "other">().notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  fileUrl: varchar("file_url"),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Billing/Payments
export const bills = pgTable("bills", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  patientId: varchar("patient_id").references(() => users.id).notNull(),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status").$type<"pending" | "paid" | "refunded">().default("pending").notNull(),
  paymentMethod: varchar("payment_method"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  paidAt: timestamp("paid_at"),
});

// Favorites (patients can mark preferred doctors)
export const favorites = pgTable("favorites", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  patientId: varchar("patient_id").references(() => users.id).notNull(),
  doctorId: integer("doctor_id").references(() => doctors.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type").$type<"appointment_reminder" | "appointment_15min" | "queue_position" | "your_turn" | "doctor_available" | "report_ready" | "prescription_added" | "payment_due" | "appointment_confirmed" | "appointment_cancelled" | "general">().notNull(),
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  priority: varchar("priority").$type<"low" | "medium" | "high">().default("medium"),
  data: jsonb("data"), // Additional data like appointment ID, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Notification preferences
export const notificationPreferences = pgTable("notification_preferences", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  emailEnabled: boolean("email_enabled").default(true),
  smsEnabled: boolean("sms_enabled").default(false),
  pushEnabled: boolean("push_enabled").default(true),
  appointmentReminders: boolean("appointment_reminders").default(true),
  reportNotifications: boolean("report_notifications").default(true),
  paymentReminders: boolean("payment_reminders").default(true),
  marketingEmails: boolean("marketing_emails").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Secure messaging
export const messages = pgTable("messages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  senderId: varchar("sender_id").references(() => users.id).notNull(),
  receiverId: varchar("receiver_id").references(() => users.id).notNull(),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  subject: varchar("subject").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  priority: varchar("priority").$type<"low" | "medium" | "high">().default("medium"),
  expiresAt: timestamp("expires_at"), // For auto-expiry (24 hours for consultations)
  createdAt: timestamp("created_at").defaultNow(),
});

// Message attachments
export const messageAttachments = pgTable("message_attachments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  messageId: integer("message_id").references(() => messages.id).notNull(),
  fileName: varchar("file_name").notNull(),
  fileUrl: varchar("file_url").notNull(),
  fileType: varchar("file_type").notNull(),
  fileSize: integer("file_size"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Vaccinations
export const vaccinations = pgTable("vaccinations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  patientId: varchar("patient_id").references(() => users.id).notNull(),
  vaccineName: varchar("vaccine_name").notNull(),
  vaccineType: varchar("vaccine_type"), // e.g., COVID-19, Flu, MMR
  doseNumber: integer("dose_number"),
  totalDoses: integer("total_doses"),
  administeredDate: date("administered_date").notNull(),
  administeredBy: varchar("administered_by"), // doctor or clinic name
  batchNumber: varchar("batch_number"),
  nextDueDate: date("next_due_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
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
export const insertMessageAttachmentSchema = createInsertSchema(messageAttachments).omit({ id: true, createdAt: true });
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
export type MessageAttachment = typeof messageAttachments.$inferSelect;
export type InsertMessageAttachment = z.infer<typeof insertMessageAttachmentSchema>;
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
  patient: User;
  status: "active" | "inactive";
};
