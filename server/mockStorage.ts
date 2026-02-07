import type { IStorage } from "./storage";
import { mockDoctors } from "../client/src/pages/mockDoctors";
import { comprehensiveMockData } from "./comprehensiveMockData";
import fs from "fs";
import path from "path";

export class MockStorage implements IStorage {
  private dataFile = path.join(process.cwd(), "mock-data.json");
  private appointments: any[] = [];
  private prescriptions: any[] = [];
  private prescriptionItems: any[] = [];
  private vitals: any[] = [];
  private allergies: any[] = [];
  private familyMembers: any[] = [];
  private documents: any[] = [];
  private bills: any[] = [];
  private favorites: any[] = [];
  private notifications: any[] = [];
  private medicines: any[] = [];
  private messages: any[] = [];
  private doctors: any[] = [];
  private users: any[] = [];
  private doctorSchedules: any[] = [];

  constructor() {
    this.loadData();
  }

  private loadData() {
    try {
      if (fs.existsSync(this.dataFile)) {
        const data = JSON.parse(fs.readFileSync(this.dataFile, "utf-8"));
        this.appointments = data.appointments || [...comprehensiveMockData.appointments];
        this.prescriptions = data.prescriptions || [...comprehensiveMockData.prescriptions];
        this.prescriptionItems = data.prescriptionItems || [...comprehensiveMockData.prescriptionItems];
        this.vitals = data.vitals || [...comprehensiveMockData.vitals];
        this.allergies = data.allergies || [...comprehensiveMockData.allergies];
        this.familyMembers = data.familyMembers || [...comprehensiveMockData.familyMembers];
        this.documents = data.documents || [...comprehensiveMockData.documents];
        this.bills = data.bills || [...comprehensiveMockData.bills];
        this.favorites = data.favorites || [...comprehensiveMockData.favorites];
        this.notifications = data.notifications || [...comprehensiveMockData.notifications];
        this.medicines = data.medicines || [...comprehensiveMockData.medicines];
        this.messages = data.messages || [...comprehensiveMockData.messages];
        this.doctors = data.doctors || [...comprehensiveMockData.doctors];
        this.users = data.users || [...comprehensiveMockData.users];
        this.doctorSchedules = data.doctorSchedules || [...comprehensiveMockData.doctorSchedules];
      } else {
        // Initialize with mock data
        this.appointments = [...comprehensiveMockData.appointments];
        this.prescriptions = [...comprehensiveMockData.prescriptions];
        this.prescriptionItems = [...comprehensiveMockData.prescriptionItems];
        this.vitals = [...comprehensiveMockData.vitals];
        this.allergies = [...comprehensiveMockData.allergies];
        this.familyMembers = [...comprehensiveMockData.familyMembers];
        this.documents = [...comprehensiveMockData.documents];
        this.bills = [...comprehensiveMockData.bills];
        this.favorites = [...comprehensiveMockData.favorites];
        this.notifications = [...comprehensiveMockData.notifications];
        this.medicines = [...comprehensiveMockData.medicines];
        this.messages = [...comprehensiveMockData.messages];
        this.doctors = [...comprehensiveMockData.doctors];
        this.users = [...comprehensiveMockData.users];
        this.doctorSchedules = [...comprehensiveMockData.doctorSchedules];
        this.saveData();
      }
    } catch (error) {
      console.error("Error loading mock data:", error);
      // Fall back to mock data
      this.appointments = [...comprehensiveMockData.appointments];
      this.prescriptions = [...comprehensiveMockData.prescriptions];
      this.prescriptionItems = [...comprehensiveMockData.prescriptionItems];
      this.vitals = [...comprehensiveMockData.vitals];
      this.allergies = [...comprehensiveMockData.allergies];
      this.familyMembers = [...comprehensiveMockData.familyMembers];
      this.documents = [...comprehensiveMockData.documents];
      this.bills = [...comprehensiveMockData.bills];
      this.favorites = [...comprehensiveMockData.favorites];
      this.notifications = [...comprehensiveMockData.notifications];
      this.medicines = [...comprehensiveMockData.medicines];
      this.messages = [...comprehensiveMockData.messages];
      this.doctors = [...comprehensiveMockData.doctors];
      this.users = [...comprehensiveMockData.users];
      this.doctorSchedules = [...comprehensiveMockData.doctorSchedules];
    }
  }

  private saveData() {
    try {
      const data = {
        appointments: this.appointments,
        prescriptions: this.prescriptions,
        prescriptionItems: this.prescriptionItems,
        vitals: this.vitals,
        allergies: this.allergies,
        familyMembers: this.familyMembers,
        documents: this.documents,
        bills: this.bills,
        favorites: this.favorites,
        notifications: this.notifications,
        medicines: this.medicines,
        messages: this.messages,
        doctors: this.doctors,
        users: this.users,
        doctorSchedules: this.doctorSchedules,
      };
      fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Error saving mock data:", error);
    }
  }
  // User operations
  async getUser(id: string) {
    return this.users.find(u => u.id === id);
  }
  async upsertUser(user: any) {
    const existingIndex = this.users.findIndex(u => u.id === user.id);
    if (existingIndex >= 0) {
      this.users[existingIndex] = { ...this.users[existingIndex], ...user };
      this.saveData();
      return this.users[existingIndex];
    } else {
      this.users.push(user);
      this.saveData();
      return user;
    }
  }
  async updateUserRole(id, role) {
    const user = this.users.find(u => u.id === id);
    if (user) {
      user.role = role;
      return user;
    }
    return undefined;
  }

  // Department operations
  async getDepartments() {
    return comprehensiveMockData.departments;
  }
  async getDepartment(id: number) { return undefined; }
  async createDepartment(department) { return department as any; }
  async updateDepartment(id, department) { return undefined; }
  async deleteDepartment(id) { return true; }

  // Doctor operations
  async getDoctors() {
    // Return stored doctors if any, otherwise fall back to mock data
    if (this.doctors.length > 0) {
      return this.doctors.map(doc => ({
        ...doc,
        user: this.users.find(u => u.id === doc.userId) || {
          firstName: 'Unknown',
          lastName: 'Doctor',
          email: 'unknown@hospital.com',
          profileImageUrl: "",
        },
        department: { name: 'General' }
      }));
    }

    // Fall back to mock doctors
    return mockDoctors.map(doc => ({
      id: doc.id,
      specialty: doc.specialty,
      experience: doc.experience,
      isAvailable: doc.available,
      department: { name: doc.department },
      user: {
        firstName: doc.name.split(" ")[1] || "Doctor",
        lastName: doc.name.split(" ")[2] || "",
        email: doc.email,
        profileImageUrl: "",
      },
    }));
  }
  async getDoctor(id: number) {
    const doctor = this.doctors.find(d => d.id === id);
    if (!doctor) return undefined;

    return {
      ...doctor,
      user: this.users.find(u => u.id === doctor.userId),
      department: { name: 'General' } // Mock department
    };
  }
  async getDoctorByUserId(userId: string) {
    return this.doctors.find(d => d.userId === userId);
  }
  async getDoctorsByDepartment(departmentId: number) {
    return this.doctors
      .filter(d => d.departmentId === departmentId)
      .map(d => ({
        ...d,
        user: this.users.find(u => u.id === d.userId),
        department: { name: 'General' }
      }));
  }
  async createDoctor(doctor) {
    const newDoctor = { ...doctor, id: Date.now() };
    this.doctors.push(newDoctor);
    return newDoctor;
  }
  async updateDoctor(id, doctor) {
    const index = this.doctors.findIndex(d => d.id === id);
    if (index === -1) return undefined;

    this.doctors[index] = { ...this.doctors[index], ...doctor };
    return this.doctors[index];
  }

  // Doctor Schedule operations
  async getDoctorSchedules(doctorId: number) { return []; }
  async createDoctorSchedule(schedule) { return schedule as any; }
  async updateDoctorSchedule(id, schedule) { return undefined; }
  async deleteDoctorSchedule(id) { return true; }

  // Appointment operations
  async getAppointments(patientId: string) {
    return this.appointments
      .filter(apt => apt.patientId === patientId)
      .map(apt => ({
        ...apt,
        patient: this.users.find(u => u.id === apt.patientId) || { id: apt.patientId, firstName: 'Unknown', lastName: 'Patient' },
        doctor: this.doctors.find(d => d.id === apt.doctorId) ? {
          ...this.doctors.find(d => d.id === apt.doctorId),
          user: this.users.find(u => u.id === this.doctors.find(d => d.id === apt.doctorId)?.userId),
          department: { name: 'General' }
        } : { id: apt.doctorId, user: { firstName: 'Unknown', lastName: 'Doctor' } }
      }));
  }
  async getAppointmentsByDoctor(doctorId: number) {
    return this.appointments
      .filter(apt => apt.doctorId === doctorId)
      .map(apt => ({
        ...apt,
        patient: this.users.find(u => u.id === apt.patientId) || { id: apt.patientId, firstName: 'Unknown', lastName: 'Patient' },
        doctor: this.doctors.find(d => d.id === apt.doctorId) || { id: apt.doctorId, user: { firstName: 'Unknown', lastName: 'Doctor' } }
      }));
  }
  async getAppointment(id: number) {
    const appointment = this.appointments.find(apt => apt.id === id);
    if (!appointment) return undefined;

    return {
      ...appointment,
      patient: this.users.find(u => u.id === appointment.patientId) || { id: appointment.patientId, firstName: 'Unknown', lastName: 'Patient' },
      doctor: this.doctors.find(d => d.id === appointment.doctorId) || { id: appointment.doctorId, user: { firstName: 'Unknown', lastName: 'Doctor' } }
    };
  }
  async getAllAppointments() {
    return this.appointments.map(apt => ({
      ...apt,
      patient: this.users.find(u => u.id === apt.patientId) || { id: apt.patientId, firstName: 'Unknown', lastName: 'Patient' },
      doctor: this.doctors.find(d => d.id === apt.doctorId) || { id: apt.doctorId, user: { firstName: 'Unknown', lastName: 'Doctor' } }
    }));
  }
  async createAppointment(appointment) {
    const newAppointment = {
      ...appointment,
      id: Date.now(),
      status: appointment.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.appointments.push(newAppointment);
    this.saveData();
    return newAppointment;
  }
  async updateAppointment(id, appointment) {
    const index = this.appointments.findIndex(apt => apt.id === id);
    if (index === -1) return undefined;

    this.appointments[index] = {
      ...this.appointments[index],
      ...appointment,
      updatedAt: new Date()
    };
    this.saveData();
    return this.appointments[index];
  }
  async deleteAppointment(id: number) {
    const index = this.appointments.findIndex(apt => apt.id === id);
    if (index === -1) return false;

    this.appointments.splice(index, 1);
    return true;
  }
  async getAllAppointmentsForDate(startDate: Date, endDate: Date) {
    return this.appointments
      .filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate >= startDate && aptDate <= endDate;
      })
      .map(apt => ({
        ...apt,
        patient: this.users.find(u => u.id === apt.patientId) || { id: apt.patientId, firstName: 'Unknown', lastName: 'Patient' },
        doctor: this.doctors.find(d => d.id === apt.doctorId) || { id: apt.doctorId, user: { firstName: 'Unknown', lastName: 'Doctor' } }
      }));
  }
  async getDoctorAppointmentsForDate(doctorId: number, startDate: Date, endDate: Date) {
    return this.appointments
      .filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        return apt.doctorId === doctorId && aptDate >= startDate && aptDate <= endDate;
      })
      .map(apt => ({
        ...apt,
        patient: this.users.find(u => u.id === apt.patientId) || { id: apt.patientId, firstName: 'Unknown', lastName: 'Patient' },
        doctor: this.doctors.find(d => d.id === apt.doctorId) || { id: apt.doctorId, user: { firstName: 'Unknown', lastName: 'Doctor' } }
      }));
  }

  // Medicine operations
  async getMedicines() { return this.medicines; }
  async getMedicine(id: number) { return this.medicines.find(m => m.id === id); }
  async searchMedicines(query: string) {
    if (!query) return this.medicines;
    const lowerQuery = query.toLowerCase();
    return this.medicines.filter(m =>
      m.name.toLowerCase().includes(lowerQuery) ||
      m.genericName?.toLowerCase().includes(lowerQuery)
    );
  }
  async createMedicine(medicine) {
    const newMedicine = { ...medicine, id: Date.now() };
    this.medicines.push(newMedicine);
    return newMedicine;
  }
  async updateMedicine(id, medicine) {
    const index = this.medicines.findIndex(m => m.id === id);
    if (index === -1) return undefined;
    this.medicines[index] = { ...this.medicines[index], ...medicine };
    return this.medicines[index];
  }
  async deleteMedicine(id) { return true; }

  // Prescription operations
  async getPrescriptions(patientId: string) {
    return this.prescriptions
      .filter(p => p.patientId === patientId)
      .map(p => {
        const doctor = this.doctors.find(d => d.id === p.doctorId);
        const doctorWithUser = doctor ? {
          ...doctor,
          user: this.users.find(u => u.id === doctor.userId) || { firstName: 'Unknown', lastName: 'Doctor' },
          department: { name: 'General' } // Mock department
        } : { id: p.doctorId, user: { firstName: 'Unknown', lastName: 'Doctor' } };

        // Get prescription items for this prescription
        const items = this.prescriptionItems
          .filter(item => item.prescriptionId === p.id)
          .map(item => ({
            ...item,
            medicine: this.medicines.find(m => m.id === item.medicineId) || { name: 'Unknown Medicine' }
          }));

        return {
          ...p,
          items,
          doctor: doctorWithUser
        };
      });
  }
  async getPrescription(id: number) {
    const prescription = this.prescriptions.find(p => p.id === id);
    if (!prescription) return undefined;

    const doctor = this.doctors.find(d => d.id === prescription.doctorId);
    const doctorWithUser = doctor ? {
      ...doctor,
      user: this.users.find(u => u.id === doctor.userId) || { firstName: 'Unknown', lastName: 'Doctor' },
      department: { name: 'General' } // Mock department
    } : { id: prescription.doctorId, user: { firstName: 'Unknown', lastName: 'Doctor' } };

    // Get prescription items for this prescription
    const items = this.prescriptionItems
      .filter(item => item.prescriptionId === id)
      .map(item => ({
        ...item,
        medicine: this.medicines.find(m => m.id === item.medicineId) || { name: 'Unknown Medicine' }
      }));

    return {
      ...prescription,
      items,
      doctor: doctorWithUser
    };
  }
  async createPrescription(prescription) {
    const newPrescription = {
      ...prescription,
      id: Date.now(),
      createdAt: new Date()
    };
    this.prescriptions.push(newPrescription);
    this.saveData();
    return newPrescription;
  }
  async addPrescriptionItem(item) {
    const newItem = { ...item, id: Date.now() };
    this.prescriptionItems.push(newItem);
    this.saveData();
    return newItem;
  }
  async getDoctorPrescriptions(doctorId: number) {
    return this.prescriptions
      .filter(p => p.doctorId === doctorId)
      .map(p => {
        // Get prescription items for this prescription
        const items = this.prescriptionItems
          .filter(item => item.prescriptionId === p.id)
          .map(item => ({
            ...item,
            medicine: this.medicines.find(m => m.id === item.medicineId) || { name: 'Unknown Medicine' }
          }));

        return {
          ...p,
          items,
          doctor: this.doctors.find(d => d.id === p.doctorId) || { id: p.doctorId, user: { firstName: 'Unknown', lastName: 'Doctor' } }
        };
      });
  }

  async getPrescriptionsByAppointment(appointmentId: number) {
    return this.prescriptions
      .filter(p => p.appointmentId === appointmentId)
      .map(p => {
        const doctor = this.doctors.find(d => d.id === p.doctorId);
        const doctorWithUser = doctor ? {
          ...doctor,
          user: this.users.find(u => u.id === doctor.userId) || { firstName: 'Unknown', lastName: 'Doctor' },
          department: { name: 'General' } // Mock department
        } : { id: p.doctorId, user: { firstName: 'Unknown', lastName: 'Doctor' } };

        // Get prescription items for this prescription
        const items = this.prescriptionItems
          .filter(item => item.prescriptionId === p.id)
          .map(item => ({
            ...item,
            medicine: this.medicines.find(m => m.id === item.medicineId) || { name: 'Unknown Medicine' }
          }));

        return {
          ...p,
          items,
          doctor: doctorWithUser
        };
      });
  }

  // Vital operations
  async getVitals(patientId: string) { return this.vitals.filter(v => v.patientId === patientId); }
  async createVital(vital) {
    const newVital = { ...vital, id: Date.now(), recordedAt: new Date() };
    this.vitals.push(newVital);
    return newVital;
  }
  async deleteVital(id: number) { return true; }

  // Allergy operations
  async getAllergies(patientId: string) { return this.allergies.filter(a => a.patientId === patientId); }
  async createAllergy(allergy) {
    const newAllergy = { ...allergy, id: Date.now(), createdAt: new Date() };
    this.allergies.push(newAllergy);
    return newAllergy;
  }
  async deleteAllergy(id: number) { return true; }

  // Family Member operations
  async getFamilyMembers(primaryUserId: string) { return this.familyMembers.filter(fm => fm.primaryUserId === primaryUserId); }
  async createFamilyMember(member) {
    const newMember = { ...member, id: Date.now(), createdAt: new Date() };
    this.familyMembers.push(newMember);
    return newMember;
  }
  async deleteFamilyMember(id: number) { return true; }

  // Document operations
  async getDocuments(patientId: string) { return this.documents.filter(d => d.patientId === patientId); }
  async createDocument(document) {
    const newDocument = { ...document, id: Date.now(), createdAt: new Date() };
    this.documents.push(newDocument);
    return newDocument;
  }
  async deleteDocument(id: number) { return true; }

  // Bill operations
  async getBills(patientId: string) {
    if (!patientId) {
      return this.bills; // Return all bills if no patientId specified
    }
    return this.bills.filter(b => b.patientId === patientId);
  }
  async createBill(bill) {
    const newBill = { ...bill, id: Date.now(), createdAt: new Date() };
    this.bills.push(newBill);
    return newBill;
  }
  async updateBill(id, bill) {
    const index = this.bills.findIndex(b => b.id === id);
    if (index === -1) return undefined;
    this.bills[index] = { ...this.bills[index], ...bill };
    return this.bills[index];
  }

  // Favorite operations
  async getFavorites(patientId: string) { return this.favorites.filter(f => f.patientId === patientId); }
  async addFavorite(favorite) {
    const newFavorite = { ...favorite, id: Date.now(), createdAt: new Date() };
    this.favorites.push(newFavorite);
    return newFavorite;
  }
  async removeFavorite(patientId: string, doctorId: number) { return true; }

  // Messaging operations
  async getMessages(userId: string) {
    console.log("MockStorage.getMessages - userId:", userId, "total messages:", this.messages.length);
    const filtered = this.messages
      .filter(m => m.senderId === userId || m.receiverId === userId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    console.log("MockStorage.getMessages - filtered messages:", filtered.length);
    return filtered;
  }
  async createMessage(message: any) {
    console.log("MockStorage.createMessage - input:", message);
    const newMsg = {
      id: Date.now(),
      subject: message.subject || "",
      content: message.content,
      senderId: message.senderId,
      receiverId: message.receiverId,
      appointmentId: message.appointmentId || null,
      isRead: false,
      priority: message.priority || "medium",
      expiresAt: message.expiresAt || null,
      createdAt: new Date(),
    };
    this.messages.push(newMsg);
    console.log("MockStorage.createMessage - created message:", newMsg);
    console.log("MockStorage.createMessage - total messages after:", this.messages.length);
    this.saveData();
    return newMsg;
  }
  async markMessageAsRead(id: number) {
    console.log("MockStorage.markMessageAsRead - id:", id);
    const msg = this.messages.find(m => m.id === id);
    if (msg) {
      msg.isRead = true;
      this.saveData();
      console.log("MockStorage.markMessageAsRead - marked as read:", msg);
      return msg;
    }
    console.log("MockStorage.markMessageAsRead - message not found");
    return undefined;
  }

  // Notification operations
  async getNotifications(userId: string) { return this.notifications.filter(n => n.userId === userId); }
  async createNotification(notification) {
    const newNotification = { ...notification, id: Date.now(), createdAt: new Date() };
    this.notifications.push(newNotification);
    return newNotification;
  }
  async markNotificationAsRead(id: number) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.isRead = true;
      return notification;
    }
    return undefined;
  }
  async getNotificationPreferences(userId: string) {
    return {
      id: 1,
      userId,
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      appointmentReminders: true,
      reportNotifications: true,
      paymentReminders: true,
      marketingEmails: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  async updateNotificationPreferences(userId: string, preferences) {
    return { ...preferences, userId, updatedAt: new Date() };
  }

  // Vaccination operations
  async getVaccinations(userId: string) { return comprehensiveMockData.vaccinations.filter(v => v.patientId === userId); }
  async createVaccination(vaccination) {
    const newVaccination = { ...vaccination, id: Date.now(), createdAt: new Date() };
    comprehensiveMockData.vaccinations.push(newVaccination);
    return newVaccination;
  }
  async updateVaccination(id: number, vaccination) {
    const index = comprehensiveMockData.vaccinations.findIndex(v => v.id === id);
    if (index === -1) return undefined;
    comprehensiveMockData.vaccinations[index] = { ...comprehensiveMockData.vaccinations[index], ...vaccination };
    return comprehensiveMockData.vaccinations[index];
  }
  async deleteVaccination(id: number) { return; }

  // Encrypted document operations
  async encryptDocument(content: string, key?: string) {
    // Simple mock encryption
    return Buffer.from(content).toString('base64');
  }
  async decryptDocument(encryptedContent: string, key?: string) {
    // Simple mock decryption
    return Buffer.from(encryptedContent, 'base64').toString();
  }
  async storeEncryptedDocument(document: any, content: string) {
    const encrypted = await this.encryptDocument(content);
    return { ...document, fileUrl: encrypted, id: Date.now() };
  }
  async retrieveEncryptedDocument(id: number) {
    return {
      document: {
        id,
        patientId: "mock-patient",
        type: "other" as const,
        title: "Encrypted Document",
        description: null,
        fileUrl: null,
        uploadedBy: null,
        appointmentId: null,
        createdAt: new Date()
      },
      content: "This is decrypted content"
    };
  }

  // Blocked Slots operations
  async getBlockedSlots(doctorId: number, startDate?: Date, endDate?: Date) { return []; }
  async createBlockedSlot(slot: any) { return { id: Date.now(), ...slot }; }
  async deleteBlockedSlot(id: number) { return true; }

  // Doctor status operations
  async getDoctorStatus(doctorId: number) {
    // Mock doctor status - in real implementation this would be stored
    return {
      doctorId,
      status: "available",
      currentPatientId: null,
      currentAppointmentId: null,
      lastUpdated: new Date(),
      statusMessage: null
    };
  }

  async updateDoctorStatus(doctorId: number, statusData: any) {
    // Mock update - in real implementation this would persist
    return {
      doctorId,
      ...statusData,
      lastUpdated: new Date()
    };
  }

  // Appointment queue operations
  async getAppointmentQueue(doctorId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const queueAppointments = this.appointments
      .filter(apt =>
        apt.doctorId === doctorId &&
        new Date(apt.appointmentDate) >= today &&
        new Date(apt.appointmentDate) < tomorrow &&
        (apt.status === 'waiting' || apt.status === 'confirmed')
      )
      .sort((a, b) => (a.queuePosition || 0) - (b.queuePosition || 0))
      .map(apt => ({
        ...apt,
        patient: this.users.find(u => u.id === apt.patientId),
        estimatedWaitTime: (apt.queuePosition || 0) * 15
      }));

    return queueAppointments;
  }

  async updateAppointmentQueuePosition(appointmentId: number) {
    // Mock implementation - update queue positions
    const appointment = this.appointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const waitingAppointments = this.appointments
      .filter(apt =>
        apt.doctorId === appointment.doctorId &&
        new Date(apt.appointmentDate) >= today &&
        new Date(apt.appointmentDate) < tomorrow &&
        (apt.status === 'waiting' || apt.status === 'confirmed')
      )
      .sort((a, b) => new Date(a.appointmentTime).getTime() - new Date(b.appointmentTime).getTime());

    waitingAppointments.forEach((apt, index) => {
      apt.queuePosition = index + 1;
    });
  }

  async getNextAppointments(patientId: string, limit: number) {
    const now = new Date();
    return this.appointments
      .filter(apt =>
        apt.patientId === patientId &&
        new Date(apt.appointmentDate) >= now &&
        (apt.status === 'confirmed' || apt.status === 'waiting')
      )
      .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
      .slice(0, limit)
      .map(apt => ({
        ...apt,
        patient: this.users.find(u => u.id === apt.patientId) || { id: apt.patientId, firstName: 'Unknown', lastName: 'Patient' },
        doctor: this.doctors.find(d => d.id === apt.doctorId) || { id: apt.doctorId, user: { firstName: 'Unknown', lastName: 'Doctor' } }
      }));
  }

  async getAppointmentsInTimeRange(startTime: Date, endTime: Date) {
    return this.appointments
      .filter(apt => {
        const aptDateTime = new Date(`${apt.appointmentDate}T${apt.appointmentTime}`);
        return aptDateTime >= startTime && aptDateTime <= endTime;
      })
      .map(apt => ({
        ...apt,
        patient: this.users.find(u => u.id === apt.patientId) || { id: apt.patientId, firstName: 'Unknown', lastName: 'Patient' },
        doctor: this.doctors.find(d => d.id === apt.doctorId) || { id: apt.doctorId, user: { firstName: 'Unknown', lastName: 'Doctor' } }
      }));
  }
}
