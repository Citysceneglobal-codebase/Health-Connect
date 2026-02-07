import { db } from "./db";
import { 
  users, departments, doctors, doctorSchedules, doctorStatus,
  appointments, medicines, prescriptions, prescriptionItems,
  vitals, allergies, familyMembers, documents, bills, favorites,
  notifications, notificationPreferences, messages, vaccinations
} from "./schema-sqlite";
import { sql } from "drizzle-orm";

async function setupDatabase() {
  console.log("Setting up database tables...");
  
  try {
    // Create all tables
    await db.run(sql`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      firstName TEXT,
      lastName TEXT,
      profileImageUrl TEXT,
      role TEXT NOT NULL DEFAULT 'patient',
      phone TEXT,
      dateOfBirth TEXT,
      gender TEXT,
      address TEXT,
      pushToken TEXT,
      createdAt INTEGER,
      updatedAt INTEGER
    )`);
    
    await db.run(sql`CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      createdAt INTEGER
    )`);
    
    await db.run(sql`CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL REFERENCES users(id),
      departmentId INTEGER REFERENCES departments(id),
      specialty TEXT,
      qualification TEXT,
      experience INTEGER,
      consultationFee REAL,
      bio TEXT,
      isAvailable INTEGER DEFAULT 1,
      createdAt INTEGER
    )`);
    
    await db.run(sql`CREATE TABLE IF NOT EXISTS doctor_schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doctorId INTEGER NOT NULL REFERENCES doctors(id),
      dayOfWeek INTEGER NOT NULL,
      startTime TEXT NOT NULL,
      endTime TEXT NOT NULL,
      slotDuration INTEGER DEFAULT 30,
      isActive INTEGER DEFAULT 1
    )`);
    
    await db.run(sql`CREATE TABLE IF NOT EXISTS doctor_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doctorId INTEGER NOT NULL REFERENCES doctors(id),
      status TEXT NOT NULL DEFAULT 'offline',
      currentPatientId TEXT REFERENCES users(id),
      currentAppointmentId INTEGER REFERENCES appointments(id),
      lastUpdated INTEGER,
      statusMessage TEXT
    )`);
    
    await db.run(sql`CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patientId TEXT NOT NULL REFERENCES users(id),
      doctorId INTEGER NOT NULL REFERENCES doctors(id),
      appointmentDate TEXT NOT NULL,
      appointmentTime TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      reason TEXT,
      notes TEXT,
      queuePosition INTEGER,
      estimatedWaitTime INTEGER,
      checkInTime INTEGER,
      startedAt INTEGER,
      completedAt INTEGER,
      createdAt INTEGER,
      updatedAt INTEGER
    )`);
    
    await db.run(sql`CREATE TABLE IF NOT EXISTS medicines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      genericName TEXT,
      category TEXT,
      manufacturer TEXT,
      dosageForm TEXT,
      strength TEXT,
      description TEXT,
      createdAt INTEGER
    )`);
    
    await db.run(sql`CREATE TABLE IF NOT EXISTS prescriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      appointmentId INTEGER REFERENCES appointments(id),
      patientId TEXT NOT NULL REFERENCES users(id),
      doctorId INTEGER NOT NULL REFERENCES doctors(id),
      diagnosis TEXT,
      notes TEXT,
      createdAt INTEGER
    )`);
    
    await db.run(sql`CREATE TABLE IF NOT EXISTS prescription_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prescriptionId INTEGER NOT NULL REFERENCES prescriptions(id),
      medicineId INTEGER NOT NULL REFERENCES medicines(id),
      dosage TEXT,
      frequency TEXT,
      duration TEXT,
      instructions TEXT
    )`);
    
    await db.run(sql`CREATE TABLE IF NOT EXISTS vitals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patientId TEXT NOT NULL REFERENCES users(id),
      type TEXT NOT NULL,
      value TEXT NOT NULL,
      unit TEXT,
      recordedAt INTEGER,
      notes TEXT
    )`);
    
    await db.run(sql`CREATE TABLE IF NOT EXISTS allergies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patientId TEXT NOT NULL REFERENCES users(id),
      type TEXT NOT NULL,
      allergen TEXT NOT NULL,
      severity TEXT DEFAULT 'moderate',
      reaction TEXT,
      createdAt INTEGER
    )`);
    
    await db.run(sql`CREATE TABLE IF NOT EXISTS family_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      primaryUserId TEXT NOT NULL REFERENCES users(id),
      memberId TEXT NOT NULL REFERENCES users(id),
      relationship TEXT NOT NULL,
      createdAt INTEGER
    )`);
    
    await db.run(sql`CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patientId TEXT NOT NULL REFERENCES users(id),
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      fileUrl TEXT,
      uploadedBy TEXT REFERENCES users(id),
      appointmentId INTEGER REFERENCES appointments(id),
      createdAt INTEGER
    )`);
    
    await db.run(sql`CREATE TABLE IF NOT EXISTS bills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patientId TEXT NOT NULL REFERENCES users(id),
      appointmentId INTEGER REFERENCES appointments(id),
      amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      paymentMethod TEXT,
      description TEXT,
      createdAt INTEGER,
      paidAt INTEGER
    )`);
    
    await db.run(sql`CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patientId TEXT NOT NULL REFERENCES users(id),
      doctorId INTEGER NOT NULL REFERENCES doctors(id),
      createdAt INTEGER
    )`);
    
    await db.run(sql`CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL REFERENCES users(id),
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      isRead INTEGER DEFAULT 0,
      priority TEXT DEFAULT 'medium',
      data TEXT,
      createdAt INTEGER
    )`);
    
    await db.run(sql`CREATE TABLE IF NOT EXISTS notification_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL REFERENCES users(id),
      emailEnabled INTEGER DEFAULT 1,
      smsEnabled INTEGER DEFAULT 0,
      pushEnabled INTEGER DEFAULT 1,
      appointmentReminders INTEGER DEFAULT 1,
      reportNotifications INTEGER DEFAULT 1,
      paymentReminders INTEGER DEFAULT 1,
      marketingEmails INTEGER DEFAULT 0,
      createdAt INTEGER,
      updatedAt INTEGER
    )`);
    
    await db.run(sql`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      senderId TEXT NOT NULL REFERENCES users(id),
      receiverId TEXT NOT NULL REFERENCES users(id),
      appointmentId INTEGER REFERENCES appointments(id),
      subject TEXT NOT NULL,
      content TEXT NOT NULL,
      isRead INTEGER DEFAULT 0,
      priority TEXT DEFAULT 'medium',
      expiresAt INTEGER,
      createdAt INTEGER
    )`);
    
    await db.run(sql`CREATE TABLE IF NOT EXISTS vaccinations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patientId TEXT NOT NULL REFERENCES users(id),
      vaccineName TEXT NOT NULL,
      vaccineType TEXT,
      doseNumber INTEGER,
      totalDoses INTEGER,
      administeredDate TEXT NOT NULL,
      administeredBy TEXT,
      batchNumber TEXT,
      nextDueDate TEXT,
      notes TEXT,
      createdAt INTEGER
    )`);
    
    console.log("All tables created successfully!");
  } catch (error) {
    console.error("Error creating tables:", error);
    throw error;
  }
}

setupDatabase()
  .then(() => {
    console.log("Database setup complete!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Database setup failed:", err);
    process.exit(1);
  });
