import { db } from "../server/db.js";
import { departments, users, doctors, doctorSchedules, appointments, medicines, prescriptions, prescriptionItems, vitals, allergies, familyMembers, documents, bills, favorites, notifications, messages, vaccinations } from "../server/schema-sqlite.js";
import { comprehensiveMockData } from "../server/comprehensiveMockData.js";

// Use comprehensive mock data for seeding
const mockDepartments = comprehensiveMockData.departments;
const mockUsers = comprehensiveMockData.users;
const mockDoctors = comprehensiveMockData.doctors;
const mockAppointments = comprehensiveMockData.appointments;
const mockMedicines = comprehensiveMockData.medicines;
const mockPrescriptions = comprehensiveMockData.prescriptions;
const mockPrescriptionItems = comprehensiveMockData.prescriptionItems;
const mockVitals = comprehensiveMockData.vitals;
const mockAllergies = comprehensiveMockData.allergies;
const mockDocuments = comprehensiveMockData.documents;
const mockBills = comprehensiveMockData.bills;

async function seed() {
  console.log("🌱 Seeding database with mock data...");

  try {
    // Insert departments
    console.log("🏥 Inserting departments...");
    for (const dept of mockDepartments) {
      await db.insert(departments).values(dept);
    }
  } catch (error) {
    console.log("Departments insert failed, skipping:", error.message);
  }

  try {
    // Insert users
    console.log("👥 Inserting users...");
    for (const user of mockUsers) {
      await db.insert(users).values(user);
    }
  } catch (error) {
    console.log("Users insert failed, skipping:", error.message);
  }

  try {
    // Insert doctors
    console.log("👨‍⚕️ Inserting doctor profiles...");
    for (const doctor of mockDoctors) {
      await db.insert(doctors).values(doctor);
    }
  } catch (error) {
    console.log("Doctors insert failed, skipping:", error.message);
  }

  try {
    // Insert medicines
    console.log("💊 Inserting medicines...");
    for (const medicine of mockMedicines) {
      await db.insert(medicines).values(medicine);
    }
  } catch (error) {
    console.log("Medicines insert failed, skipping:", error.message);
  }

  console.log("✅ Database seeding completed!");
}

seed();
