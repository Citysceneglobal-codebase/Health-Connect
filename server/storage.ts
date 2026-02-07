import { db } from "./db";
import { eq, and, or, desc, gte, lte, sql } from "drizzle-orm";
import {
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
  vaccinations,
  messages,
  type User,
  type UpsertUser,
  type Department,
  type InsertDepartment,
  type Doctor,
  type InsertDoctor,
  type DoctorSchedule,
  type InsertDoctorSchedule,
  type DoctorStatus,
  type InsertDoctorStatus,
  type Appointment,
  type InsertAppointment,
  type Medicine,
  type InsertMedicine,
  type Prescription,
  type InsertPrescription,
  type PrescriptionItem,
  type InsertPrescriptionItem,
  type Vital,
  type InsertVital,
  type Allergy,
  type InsertAllergy,
  type FamilyMember,
  type InsertFamilyMember,
  type Document,
  type InsertDocument,
  type Bill,
  type InsertBill,
  type Favorite,
  type InsertFavorite,
  type Notification,
  type InsertNotification,
  type NotificationPreference,
  type InsertNotificationPreference,
  type Vaccination,
  type InsertVaccination,
  type Message,
  type InsertMessage,
  type DoctorWithUser,
  type AppointmentWithDetails,
  type PrescriptionWithDetails,
} from "./schema-sqlite";
import { MockStorage } from "./mockStorage";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(id: string, role: "patient" | "doctor" | "admin"): Promise<User | undefined>;

  // Department operations
  getDepartments(): Promise<Department[]>;
  getDepartment(id: number): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  updateDepartment(id: number, department: Partial<InsertDepartment>): Promise<Department | undefined>;
  deleteDepartment(id: number): Promise<boolean>;

  // Doctor operations
  getDoctors(): Promise<DoctorWithUser[]>;
  getDoctor(id: number): Promise<DoctorWithUser | undefined>;
  getDoctorByUserId(userId: string): Promise<Doctor | undefined>;
  getDoctorsByDepartment(departmentId: number): Promise<DoctorWithUser[]>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
  updateDoctor(id: number, doctor: Partial<InsertDoctor>): Promise<Doctor | undefined>;

  // Doctor Schedule operations
  getDoctorSchedules(doctorId: number): Promise<DoctorSchedule[]>;
  createDoctorSchedule(schedule: InsertDoctorSchedule): Promise<DoctorSchedule>;
  updateDoctorSchedule(id: number, schedule: Partial<InsertDoctorSchedule>): Promise<DoctorSchedule | undefined>;
  deleteDoctorSchedule(id: number): Promise<boolean>;

  // Blocked Slots operations
  getBlockedSlots(doctorId: number, startDate?: Date, endDate?: Date): Promise<any[]>;
  createBlockedSlot(slot: { doctorId: number; date: Date; reason: string; type: string }): Promise<any>;
  deleteBlockedSlot(id: number): Promise<boolean>;

  // Appointment operations
  getAppointments(patientId: string): Promise<AppointmentWithDetails[]>;
  getAppointmentsByDoctor(doctorId: number): Promise<AppointmentWithDetails[]>;
  getAppointment(id: number): Promise<AppointmentWithDetails | undefined>;
  getAllAppointments(): Promise<AppointmentWithDetails[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<boolean>;
  getAllAppointmentsForDate(startDate: Date, endDate: Date): Promise<AppointmentWithDetails[]>;
  getDoctorAppointmentsForDate(doctorId: number, startDate: Date, endDate: Date): Promise<AppointmentWithDetails[]>;

  // Medicine operations
  getMedicines(): Promise<Medicine[]>;
  getMedicine(id: number): Promise<Medicine | undefined>;
  searchMedicines(query: string): Promise<Medicine[]>;
  createMedicine(medicine: InsertMedicine): Promise<Medicine>;
  updateMedicine(id: number, medicine: Partial<InsertMedicine>): Promise<Medicine | undefined>;
  deleteMedicine(id: number): Promise<boolean>;

  // Prescription operations
  getPrescriptions(patientId: string): Promise<PrescriptionWithDetails[]>;
  getPrescription(id: number): Promise<PrescriptionWithDetails | undefined>;
  getPrescriptionsByAppointment(appointmentId: number): Promise<PrescriptionWithDetails[]>;
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;
  updatePrescription(id: number, prescription: Partial<InsertPrescription>): Promise<Prescription | undefined>;
  deletePrescription(id: number): Promise<boolean>;
  addPrescriptionItem(item: InsertPrescriptionItem): Promise<PrescriptionItem>;
  getDoctorPrescriptions(doctorId: number): Promise<PrescriptionWithDetails[]>;

  // Vital operations
  getVitals(patientId: string): Promise<Vital[]>;
  createVital(vital: InsertVital): Promise<Vital>;
  deleteVital(id: number): Promise<boolean>;

  // Allergy operations
  getAllergies(patientId: string): Promise<Allergy[]>;
  createAllergy(allergy: InsertAllergy): Promise<Allergy>;
  deleteAllergy(id: number): Promise<boolean>;

  // Family Member operations
  getFamilyMembers(primaryUserId: string): Promise<FamilyMember[]>;
  createFamilyMember(member: InsertFamilyMember): Promise<FamilyMember>;
  deleteFamilyMember(id: number): Promise<boolean>;

  // Document operations
  getDocuments(patientId: string): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: number): Promise<boolean>;

  // Encrypted document operations
  encryptDocument(content: string, key?: string): Promise<string>;
  decryptDocument(encryptedContent: string, key?: string): Promise<string>;
  storeEncryptedDocument(document: InsertDocument, content: string): Promise<Document>;
  retrieveEncryptedDocument(id: number): Promise<{ document: Document; content: string }>;

  // Bill operations
  getBills(patientId: string): Promise<Bill[]>;
  createBill(bill: InsertBill): Promise<Bill>;
  updateBill(id: number, bill: Partial<InsertBill>): Promise<Bill | undefined>;

  // Favorite operations
  getFavorites(patientId: string): Promise<Favorite[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(patientId: string, doctorId: number): Promise<boolean>;

  // Notification operations
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  getNotificationPreferences(userId: string): Promise<NotificationPreference | undefined>;
  updateNotificationPreferences(userId: string, preferences: Partial<InsertNotificationPreference>): Promise<NotificationPreference | undefined>;
  getVaccinations(userId: string): Promise<Vaccination[]>;
  createVaccination(vaccination: InsertVaccination): Promise<Vaccination>;
  updateVaccination(id: number, vaccination: Partial<InsertVaccination>): Promise<Vaccination | undefined>;
  deleteVaccination(id: number): Promise<void>;

  // Doctor status operations
  getDoctorStatus(doctorId: number): Promise<any>;
  updateDoctorStatus(doctorId: number, status: any): Promise<any>;

  // Appointment queue operations
  getAppointmentQueue(doctorId: number): Promise<any[]>;
  updateAppointmentQueuePosition(appointmentId: number): Promise<void>;
  getNextAppointments(patientId: string, limit: number): Promise<AppointmentWithDetails[]>;
  getAppointmentsInTimeRange(startTime: Date, endTime: Date): Promise<AppointmentWithDetails[]>;

  // Message operations
  getMessages(userId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserRole(id: string, role: "patient" | "doctor" | "admin"): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Department operations
  async getDepartments(): Promise<Department[]> {
    return db.select().from(departments).orderBy(departments.name);
  }

  async getDepartment(id: number): Promise<Department | undefined> {
    const [department] = await db.select().from(departments).where(eq(departments.id, id));
    return department;
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const [created] = await db.insert(departments).values(department).returning();
    return created;
  }

  async updateDepartment(id: number, department: Partial<InsertDepartment>): Promise<Department | undefined> {
    const [updated] = await db
      .update(departments)
      .set(department)
      .where(eq(departments.id, id))
      .returning();
    return updated;
  }

  async deleteDepartment(id: number): Promise<boolean> {
    const result = await db.delete(departments).where(eq(departments.id, id));
    return true;
  }

  // Doctor operations
  async getDoctors(): Promise<DoctorWithUser[]> {
    const result = await db
      .select()
      .from(doctors)
      .leftJoin(users, eq(doctors.userId, users.id))
      .leftJoin(departments, eq(doctors.departmentId, departments.id));

    return result.map(row => ({
      ...row.doctors,
      user: row.users!,
      department: row.departments || undefined,
    }));
  }

  async getDoctor(id: number): Promise<DoctorWithUser | undefined> {
    const [result] = await db
      .select()
      .from(doctors)
      .leftJoin(users, eq(doctors.userId, users.id))
      .leftJoin(departments, eq(doctors.departmentId, departments.id))
      .where(eq(doctors.id, id));

    if (!result) return undefined;

    return {
      ...result.doctors,
      user: result.users!,
      department: result.departments || undefined,
    };
  }

  async getDoctorByUserId(userId: string): Promise<Doctor | undefined> {
    const [doctor] = await db.select().from(doctors).where(eq(doctors.userId, userId));
    return doctor;
  }

  async getDoctorsByDepartment(departmentId: number): Promise<DoctorWithUser[]> {
    const result = await db
      .select()
      .from(doctors)
      .leftJoin(users, eq(doctors.userId, users.id))
      .leftJoin(departments, eq(doctors.departmentId, departments.id))
      .where(eq(doctors.departmentId, departmentId));

    return result.map(row => ({
      ...row.doctors,
      user: row.users!,
      department: row.departments || undefined,
    }));
  }

  async createDoctor(doctor: InsertDoctor): Promise<Doctor> {
    const [created] = await db.insert(doctors).values(doctor).returning();
    return created;
  }

  async updateDoctor(id: number, doctor: Partial<InsertDoctor>): Promise<Doctor | undefined> {
    const [updated] = await db
      .update(doctors)
      .set(doctor)
      .where(eq(doctors.id, id))
      .returning();
    return updated;
  }

  // Doctor Schedule operations
  async getDoctorSchedules(doctorId: number): Promise<DoctorSchedule[]> {
    return db.select().from(doctorSchedules).where(eq(doctorSchedules.doctorId, doctorId));
  }

  async createDoctorSchedule(schedule: InsertDoctorSchedule): Promise<DoctorSchedule> {
    const [created] = await db.insert(doctorSchedules).values(schedule).returning();
    return created;
  }

  async updateDoctorSchedule(id: number, schedule: Partial<InsertDoctorSchedule>): Promise<DoctorSchedule | undefined> {
    const [updated] = await db
      .update(doctorSchedules)
      .set(schedule)
      .where(eq(doctorSchedules.id, id))
      .returning();
    return updated;
  }

  async deleteDoctorSchedule(id: number): Promise<boolean> {
    await db.delete(doctorSchedules).where(eq(doctorSchedules.id, id));
    return true;
  }

  // Appointment operations
  async getAppointments(patientId: string): Promise<AppointmentWithDetails[]> {
    const result = await db
      .select()
      .from(appointments)
      .where(eq(appointments.patientId, patientId))
      .orderBy(desc(appointments.appointmentDate));

    const appointmentsWithDetails: AppointmentWithDetails[] = [];
    for (const row of result) {
      const doctorData = await this.getDoctor(row.doctorId);
      const patientData = await this.getUser(patientId);

      appointmentsWithDetails.push({
        ...row,
        patient: patientData!,
        doctor: doctorData!,
      });
    }
    return appointmentsWithDetails;
  }

  async getAppointmentsByDoctor(doctorId: number): Promise<AppointmentWithDetails[]> {
    const result = await db
      .select()
      .from(appointments)
      .leftJoin(users, eq(appointments.patientId, users.id))
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .where(eq(appointments.doctorId, doctorId))
      .orderBy(desc(appointments.appointmentDate));

    const doctorData = await this.getDoctor(doctorId);
    
    return result.map(row => ({
      ...row.appointments,
      patient: row.users!,
      doctor: doctorData!,
    }));
  }

  async getAppointment(id: number): Promise<AppointmentWithDetails | undefined> {
    const [result] = await db
      .select()
      .from(appointments)
      .leftJoin(users, eq(appointments.patientId, users.id))
      .where(eq(appointments.id, id));

    if (!result) return undefined;

    const doctorData = await this.getDoctor(result.appointments.doctorId);

    return {
      ...result.appointments,
      patient: result.users!,
      doctor: doctorData!,
    };
  }

  async getAllAppointments(): Promise<AppointmentWithDetails[]> {
    const result = await db
      .select()
      .from(appointments)
      .leftJoin(users, eq(appointments.patientId, users.id))
      .orderBy(desc(appointments.appointmentDate));

    const appointmentsWithDetails: AppointmentWithDetails[] = [];
    for (const row of result) {
      const doctorData = await this.getDoctor(row.appointments.doctorId);
      appointmentsWithDetails.push({
        ...row.appointments,
        patient: row.users!,
        doctor: doctorData!,
      });
    }
    return appointmentsWithDetails;
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [created] = await db.insert(appointments).values(appointment).returning();
    return created;
  }

  async updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const [updated] = await db
      .update(appointments)
      .set({ ...appointment, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();
    return updated;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    const result = await db.delete(appointments).where(eq(appointments.id, id));
    return true;
  }

  async getAllAppointmentsForDate(startDate: Date, endDate: Date): Promise<AppointmentWithDetails[]> {
    const startDateStr = startDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    const endDateStr = endDate.toISOString().split('T')[0]; // YYYY-MM-DD format

    const result = await db
      .select()
      .from(appointments)
      .leftJoin(users, eq(appointments.patientId, users.id))
      .where(and(
        gte(appointments.appointmentDate, startDateStr),
        lte(appointments.appointmentDate, endDateStr)
      ))
      .orderBy(appointments.appointmentDate);

    const appointmentsWithDetails: AppointmentWithDetails[] = [];
    for (const row of result) {
      const doctorData = await this.getDoctor(row.appointments.doctorId);
      appointmentsWithDetails.push({
        ...row.appointments,
        patient: row.users!,
        doctor: doctorData!,
      });
    }
    return appointmentsWithDetails;
  }

  async getDoctorAppointmentsForDate(doctorId: number, startDate: Date, endDate: Date): Promise<AppointmentWithDetails[]> {
    const startDateStr = startDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    const endDateStr = endDate.toISOString().split('T')[0]; // YYYY-MM-DD format

    const result = await db
      .select()
      .from(appointments)
      .leftJoin(users, eq(appointments.patientId, users.id))
      .where(and(
        eq(appointments.doctorId, doctorId),
        gte(appointments.appointmentDate, startDateStr),
        lte(appointments.appointmentDate, endDateStr)
      ))
      .orderBy(appointments.appointmentDate);

    const doctorData = await this.getDoctor(doctorId);

    return result.map(row => ({
      ...row.appointments,
      patient: row.users!,
      doctor: doctorData!,
    }));
  }

  // Medicine operations
  async getMedicines(): Promise<Medicine[]> {
    return db.select().from(medicines).orderBy(medicines.name);
  }

  async getMedicine(id: number): Promise<Medicine | undefined> {
    const [medicine] = await db.select().from(medicines).where(eq(medicines.id, id));
    return medicine;
  }

  async searchMedicines(query: string): Promise<Medicine[]> {
    return db
      .select()
      .from(medicines)
      .where(sql`${medicines.name} ILIKE ${'%' + query + '%'} OR ${medicines.genericName} ILIKE ${'%' + query + '%'}`)
      .limit(20);
  }

  async createMedicine(medicine: InsertMedicine): Promise<Medicine> {
    const [created] = await db.insert(medicines).values(medicine).returning();
    return created;
  }

  async updateMedicine(id: number, medicine: Partial<InsertMedicine>): Promise<Medicine | undefined> {
    const [updated] = await db
      .update(medicines)
      .set(medicine)
      .where(eq(medicines.id, id))
      .returning();
    return updated;
  }

  async deleteMedicine(id: number): Promise<boolean> {
    await db.delete(medicines).where(eq(medicines.id, id));
    return true;
  }

  // Prescription operations
  async getPrescriptions(patientId: string): Promise<PrescriptionWithDetails[]> {
    const prescriptionList = await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.patientId, patientId))
      .orderBy(desc(prescriptions.createdAt));

    const result: PrescriptionWithDetails[] = [];

    for (const prescription of prescriptionList) {
      const items = await db
        .select()
        .from(prescriptionItems)
        .leftJoin(medicines, eq(prescriptionItems.medicineId, medicines.id))
        .where(eq(prescriptionItems.prescriptionId, prescription.id));

      const doctorData = await this.getDoctor(prescription.doctorId);

      result.push({
        ...prescription,
        items: items.map(i => ({ ...i.prescription_items, medicine: i.medicines! })),
        doctor: doctorData!,
      });
    }

    return result;
  }

  async getPrescription(id: number): Promise<PrescriptionWithDetails | undefined> {
    const [prescription] = await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.id, id));

    if (!prescription) return undefined;

    const items = await db
      .select()
      .from(prescriptionItems)
      .leftJoin(medicines, eq(prescriptionItems.medicineId, medicines.id))
      .where(eq(prescriptionItems.prescriptionId, id));

    const doctorData = await this.getDoctor(prescription.doctorId);

    return {
      ...prescription,
      items: items.map(i => ({ ...i.prescription_items, medicine: i.medicines! })),
      doctor: doctorData!,
    };
  }

  async getPrescriptionsByAppointment(appointmentId: number): Promise<PrescriptionWithDetails[]> {
    const prescriptionList = await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.appointmentId, appointmentId))
      .orderBy(desc(prescriptions.createdAt));

    const result: PrescriptionWithDetails[] = [];

    for (const prescription of prescriptionList) {
      const items = await db
        .select()
        .from(prescriptionItems)
        .leftJoin(medicines, eq(prescriptionItems.medicineId, medicines.id))
        .where(eq(prescriptionItems.prescriptionId, prescription.id));

      const doctorData = await this.getDoctor(prescription.doctorId);

      result.push({
        ...prescription,
        items: items.map(i => ({ ...i.prescription_items, medicine: i.medicines! })),
        doctor: doctorData!,
      });
    }

    return result;
  }

  async createPrescription(prescription: InsertPrescription): Promise<Prescription> {
    const [created] = await db.insert(prescriptions).values(prescription).returning();
    return created;
  }

  async updatePrescription(id: number, prescription: Partial<InsertPrescription>): Promise<Prescription | undefined> {
    const [updated] = await db
      .update(prescriptions)
      .set({ ...prescription, updatedAt: new Date() })
      .where(eq(prescriptions.id, id))
      .returning();
    return updated;
  }

  async deletePrescription(id: number): Promise<boolean> {
    // First delete associated prescription items
    await db.delete(prescriptionItems).where(eq(prescriptionItems.prescriptionId, id));
    // Then delete the prescription
    await db.delete(prescriptions).where(eq(prescriptions.id, id));
    return true;
  }

  async addPrescriptionItem(item: InsertPrescriptionItem): Promise<PrescriptionItem> {
    const [created] = await db.insert(prescriptionItems).values(item).returning();
    return created;
  }

  async getDoctorPrescriptions(doctorId: number): Promise<PrescriptionWithDetails[]> {
    const doctorData = await this.getDoctor(doctorId);
    if (!doctorData) {
      return [];
    }

    // Single query to get all prescriptions with their items and patient data
    const prescriptionData = await db
      .select()
      .from(prescriptions)
      .leftJoin(prescriptionItems, eq(prescriptions.id, prescriptionItems.prescriptionId))
      .leftJoin(medicines, eq(prescriptionItems.medicineId, medicines.id))
      .leftJoin(users, eq(prescriptions.patientId, users.id))
      .where(eq(prescriptions.doctorId, doctorId))
      .orderBy(desc(prescriptions.createdAt));

    // Group items by prescription
    const prescriptionMap = new Map<number, PrescriptionWithDetails>();

    for (const row of prescriptionData) {
      const prescriptionId = row.prescriptions.id;

      if (!prescriptionMap.has(prescriptionId)) {
        prescriptionMap.set(prescriptionId, {
          ...row.prescriptions,
          items: [],
          doctor: doctorData,
          patient: row.users!,
          status: "active" as const, // Default status since prescriptions table doesn't have status field
        });
      }

      if (row.prescription_items) {
        prescriptionMap.get(prescriptionId)!.items.push({
          ...row.prescription_items,
          medicine: row.medicines!,
        });
      }
    }

    return Array.from(prescriptionMap.values());
  }

  // Vital operations
  async getVitals(patientId: string): Promise<Vital[]> {
    return db
      .select()
      .from(vitals)
      .where(eq(vitals.patientId, patientId))
      .orderBy(desc(vitals.recordedAt));
  }

  async createVital(vital: InsertVital): Promise<Vital> {
    const [created] = await db.insert(vitals).values(vital).returning();
    return created;
  }

  async deleteVital(id: number): Promise<boolean> {
    await db.delete(vitals).where(eq(vitals.id, id));
    return true;
  }

  // Allergy operations
  async getAllergies(patientId: string): Promise<Allergy[]> {
    return db.select().from(allergies).where(eq(allergies.patientId, patientId));
  }

  async createAllergy(allergy: InsertAllergy): Promise<Allergy> {
    const [created] = await db.insert(allergies).values(allergy).returning();
    return created;
  }

  async deleteAllergy(id: number): Promise<boolean> {
    await db.delete(allergies).where(eq(allergies.id, id));
    return true;
  }

  // Family Member operations
  async getFamilyMembers(primaryUserId: string): Promise<FamilyMember[]> {
    return db.select().from(familyMembers).where(eq(familyMembers.primaryUserId, primaryUserId));
  }

  async createFamilyMember(member: InsertFamilyMember): Promise<FamilyMember> {
    const [created] = await db.insert(familyMembers).values(member).returning();
    return created;
  }

  async deleteFamilyMember(id: number): Promise<boolean> {
    await db.delete(familyMembers).where(eq(familyMembers.id, id));
    return true;
  }

  // Document operations
  async getDocuments(patientId: string): Promise<Document[]> {
    return db
      .select()
      .from(documents)
      .where(eq(documents.patientId, patientId))
      .orderBy(desc(documents.createdAt));
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [created] = await db.insert(documents).values(document).returning();
    return created;
  }

  async deleteDocument(id: number): Promise<boolean> {
    await db.delete(documents).where(eq(documents.id, id));
    return true;
  }

  // Bill operations
  async getBills(patientId: string): Promise<Bill[]> {
    return db
      .select()
      .from(bills)
      .where(eq(bills.patientId, patientId))
      .orderBy(desc(bills.createdAt));
  }

  async createBill(bill: InsertBill): Promise<Bill> {
    const [created] = await db.insert(bills).values(bill).returning();
    return created;
  }

  async updateBill(id: number, bill: Partial<InsertBill>): Promise<Bill | undefined> {
    const [updated] = await db
      .update(bills)
      .set(bill)
      .where(eq(bills.id, id))
      .returning();
    return updated;
  }

  // Favorite operations
  async getFavorites(patientId: string): Promise<Favorite[]> {
    return db.select().from(favorites).where(eq(favorites.patientId, patientId));
  }

  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [created] = await db.insert(favorites).values(favorite).returning();
    return created;
  }

  async removeFavorite(patientId: string, doctorId: number): Promise<boolean> {
    await db
      .delete(favorites)
      .where(and(eq(favorites.patientId, patientId), eq(favorites.doctorId, doctorId)));
    return true;
  }

  // Notification operations
  async getNotifications(userId: string): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [created] = await db.insert(notifications).values(notification).returning();
    return created;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const [updated] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return updated;
  }

  async getNotificationPreferences(userId: string): Promise<NotificationPreference | undefined> {
    const [preferences] = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId));
    return preferences;
  }

  async updateNotificationPreferences(userId: string, preferences: Partial<InsertNotificationPreference>): Promise<NotificationPreference | undefined> {
    const [updated] = await db
      .update(notificationPreferences)
      .set({ ...preferences, updatedAt: new Date() })
      .where(eq(notificationPreferences.userId, userId))
      .returning();
    return updated;
  }

  // Vaccination operations
  async getVaccinations(userId: string): Promise<Vaccination[]> {
    return db
      .select()
      .from(vaccinations)
      .where(eq(vaccinations.patientId, userId))
      .orderBy(desc(vaccinations.administeredDate));
  }

  async createVaccination(vaccination: InsertVaccination): Promise<Vaccination> {
    const [created] = await db.insert(vaccinations).values(vaccination).returning();
    return created;
  }

  async updateVaccination(id: number, vaccination: Partial<InsertVaccination>): Promise<Vaccination | undefined> {
    const [updated] = await db
      .update(vaccinations)
      .set(vaccination)
      .where(eq(vaccinations.id, id))
      .returning();
    return updated;
  }

  async deleteVaccination(id: number): Promise<void> {
    await db.delete(vaccinations).where(eq(vaccinations.id, id));
  }

  // Encrypted document operations
  async encryptDocument(content: string, key?: string): Promise<string> {
    // Simple XOR encryption for demonstration (use proper encryption in production)
    const encryptionKey = key || process.env.DOCUMENT_ENCRYPTION_KEY || "default-key";
    let encrypted = "";
    for (let i = 0; i < content.length; i++) {
      encrypted += String.fromCharCode(content.charCodeAt(i) ^ encryptionKey.charCodeAt(i % encryptionKey.length));
    }
    return Buffer.from(encrypted).toString('base64');
  }

  async decryptDocument(encryptedContent: string, key?: string): Promise<string> {
    // Simple XOR decryption for demonstration (use proper decryption in production)
    const encryptionKey = key || process.env.DOCUMENT_ENCRYPTION_KEY || "default-key";
    const encrypted = Buffer.from(encryptedContent, 'base64').toString();
    let decrypted = "";
    for (let i = 0; i < encrypted.length; i++) {
      decrypted += String.fromCharCode(encrypted.charCodeAt(i) ^ encryptionKey.charCodeAt(i % encryptionKey.length));
    }
    return decrypted;
  }

  async storeEncryptedDocument(document: InsertDocument, content: string): Promise<Document> {
    // Encrypt the content before storing
    const encryptedContent = await this.encryptDocument(content);

    // Store document with encrypted content
    const documentWithEncryptedContent = {
      ...document,
      fileUrl: encryptedContent, // Store encrypted content in fileUrl field for demo
    };

    return this.createDocument(documentWithEncryptedContent);
  }

  async retrieveEncryptedDocument(id: number): Promise<{ document: Document; content: string }> {
    const document = await this.getDocument(id);
    if (!document) {
      throw new Error("Document not found");
    }

    // Decrypt the content
    const decryptedContent = await this.decryptDocument(document.fileUrl || "");

    return {
      document,
      content: decryptedContent,
    };
  }

  // Blocked Slots operations (temporary implementation - would need database table)
  async getBlockedSlots(doctorId: number, startDate?: Date, endDate?: Date): Promise<any[]> {
    // TODO: Implement with proper database table
    return [];
  }

  async createBlockedSlot(slot: { doctorId: number; date: Date; reason: string; type: string }): Promise<any> {
    // TODO: Implement with proper database table
    return { id: Date.now(), ...slot };
  }

  async deleteBlockedSlot(id: number): Promise<boolean> {
    // TODO: Implement with proper database table
    return true;
  }

  // Doctor status operations
  async getDoctorStatus(doctorId: number): Promise<any> {
    const [status] = await db.select().from(doctorStatus).where(eq(doctorStatus.doctorId, doctorId));
    return status;
  }

  async updateDoctorStatus(doctorId: number, statusData: any): Promise<any> {
    const [existing] = await db.select().from(doctorStatus).where(eq(doctorStatus.doctorId, doctorId));

    if (existing) {
      const [updated] = await db
        .update(doctorStatus)
        .set({ ...statusData, lastUpdated: new Date() })
        .where(eq(doctorStatus.doctorId, doctorId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(doctorStatus)
        .values({ ...statusData, doctorId, lastUpdated: new Date() })
        .returning();
      return created;
    }
  }

  // Appointment queue operations
  async getAppointmentQueue(doctorId: number): Promise<any[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    const tomorrowStr = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD format

    const queueAppointments = await db
      .select()
      .from(appointments)
      .leftJoin(users, eq(appointments.patientId, users.id))
      .where(and(
        eq(appointments.doctorId, doctorId),
        gte(appointments.appointmentDate, todayStr),
        lte(appointments.appointmentDate, tomorrowStr),
        sql`${appointments.status} IN ('waiting', 'confirmed')`
      ))
      .orderBy(appointments.queuePosition);

    return queueAppointments.map(row => ({
      ...row.appointments,
      patient: row.users,
      estimatedWaitTime: this.calculateEstimatedWaitTime(row.appointments.queuePosition || 0)
    }));
  }

  async updateAppointmentQueuePosition(appointmentId: number): Promise<void> {
    // Get the appointment
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, appointmentId));
    if (!appointment) return;

    // Get all waiting appointments for this doctor today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    const tomorrowStr = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD format

    const waitingAppointments = await db
      .select()
      .from(appointments)
      .where(and(
        eq(appointments.doctorId, appointment.doctorId),
        gte(appointments.appointmentDate, todayStr),
        lte(appointments.appointmentDate, tomorrowStr),
        sql`${appointments.status} IN ('waiting', 'confirmed')`
      ))
      .orderBy(appointments.appointmentTime);

    // Update queue positions
    for (let i = 0; i < waitingAppointments.length; i++) {
      await db
        .update(appointments)
        .set({ queuePosition: i + 1 })
        .where(eq(appointments.id, waitingAppointments[i].id));
    }
  }

  async getNextAppointments(patientId: string, limit: number): Promise<AppointmentWithDetails[]> {
    const now = new Date();
    const result = await db
      .select()
      .from(appointments)
      .where(and(
        eq(appointments.patientId, patientId),
        gte(appointments.appointmentDate, now),
        sql`${appointments.status} IN ('confirmed', 'waiting')`
      ))
      .orderBy(appointments.appointmentDate)
      .limit(limit);

    const appointmentsWithDetails: AppointmentWithDetails[] = [];
    for (const row of result) {
      const doctorData = await this.getDoctor(row.doctorId);
      const patientData = await this.getUser(patientId);

      appointmentsWithDetails.push({
        ...row,
        patient: patientData!,
        doctor: doctorData!,
      });
    }
    return appointmentsWithDetails;
  }

  async getAppointmentsInTimeRange(startTime: Date, endTime: Date): Promise<AppointmentWithDetails[]> {
    const result = await db
      .select()
      .from(appointments)
      .leftJoin(users, eq(appointments.patientId, users.id))
      .where(and(
        gte(sql`CONCAT(${appointments.appointmentDate}, ' ', ${appointments.appointmentTime})`, startTime.toISOString().slice(0, 19).replace('T', ' ')),
        lte(sql`CONCAT(${appointments.appointmentDate}, ' ', ${appointments.appointmentTime})`, endTime.toISOString().slice(0, 19).replace('T', ' '))
      ))
      .orderBy(appointments.appointmentDate);

    const appointmentsWithDetails: AppointmentWithDetails[] = [];
    for (const row of result) {
      const doctorData = await this.getDoctor(row.appointments.doctorId);
      appointmentsWithDetails.push({
        ...row.appointments,
        patient: row.users!,
        doctor: doctorData!,
      });
    }
    return appointmentsWithDetails;
  }

  private calculateEstimatedWaitTime(queuePosition: number): number {
    // Simple estimation: 15 minutes per patient
    return queuePosition * 15;
  }

  // Message operations
  async getMessages(userId: string): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(
        or(
          eq(messages.senderId, userId),
          eq(messages.receiverId, userId)
        )
      )
      .orderBy(desc(messages.createdAt));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    try {
      console.log("createMessage: inserting message", message);
      const result = await db.insert(messages).values(message).returning();
      console.log("createMessage: result", result);
      if (result.length === 0) {
        throw new Error("No rows returned after insert");
      }
      return result[0];
    } catch (error) {
      console.error("createMessage error:", error);
      throw error;
    }
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const [updated] = await db
      .update(messages)
      .set({ isRead: true })
      .where(eq(messages.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
