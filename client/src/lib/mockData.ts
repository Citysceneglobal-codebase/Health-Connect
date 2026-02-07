// Shared mock data for the entire Health-Connect portal
// This ensures data consistency across all components and roles

import type { User, Doctor, Department, Document, Appointment, Medicine, Bill, Notification } from "@shared/schema";

// Mock Users (Patients, Doctors, Admins)
export const mockUsers: User[] = [
  // Patients
  {
    id: "patient-1",
    email: "john.doe@example.com",
    firstName: "John",
    lastName: "Doe",
    profileImageUrl: "",
    role: "patient",
    phone: "+1 (555) 123-4567",
    dateOfBirth: "1985-06-15",
    gender: "male",
    address: "123 Main St, Springfield",
    pushToken: null,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15")
  },
  {
    id: "patient-2",
    email: "jane.smith@example.com",
    firstName: "Jane",
    lastName: "Smith",
    profileImageUrl: "",
    role: "patient",
    phone: "+1 (555) 234-5678",
    dateOfBirth: "1990-03-22",
    gender: "female",
    address: "456 Oak Ave, Springfield",
    pushToken: null,
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01")
  },
  {
    id: "patient-3",
    email: "bob.wilson@example.com",
    firstName: "Bob",
    lastName: "Wilson",
    profileImageUrl: "",
    role: "patient",
    phone: "+1 (555) 345-6789",
    dateOfBirth: "1975-11-08",
    gender: "male",
    address: "789 Pine St, Springfield",
    pushToken: null,
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-02-15")
  },
  {
    id: "patient-4",
    email: "alice.brown@example.com",
    firstName: "Alice",
    lastName: "Brown",
    profileImageUrl: "",
    role: "patient",
    phone: "+1 (555) 456-7890",
    dateOfBirth: "1982-09-30",
    gender: "female",
    address: "321 Elm St, Springfield",
    pushToken: null,
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-03-01")
  },
  {
    id: "patient-5",
    email: "charlie.davis@example.com",
    firstName: "Charlie",
    lastName: "Davis",
    profileImageUrl: "",
    role: "patient",
    phone: "+1 (555) 567-8901",
    dateOfBirth: "1995-12-12",
    gender: "male",
    address: "654 Maple Ave, Springfield",
    pushToken: null,
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2024-03-15")
  },
  {
    id: "patient-6",
    email: "diana.evans@example.com",
    firstName: "Diana",
    lastName: "Evans",
    profileImageUrl: "",
    role: "patient",
    phone: "+1 (555) 678-9012",
    dateOfBirth: "1988-07-25",
    gender: "female",
    address: "987 Cedar St, Springfield",
    pushToken: null,
    createdAt: new Date("2024-04-01"),
    updatedAt: new Date("2024-04-01")
  },
  {
    id: "patient-7",
    email: "frank.garcia@example.com",
    firstName: "Frank",
    lastName: "Garcia",
    profileImageUrl: "",
    role: "patient",
    phone: "+1 (555) 789-0123",
    dateOfBirth: "1970-04-18",
    gender: "male",
    address: "147 Birch Ln, Springfield",
    pushToken: null,
    createdAt: new Date("2024-04-15"),
    updatedAt: new Date("2024-04-15")
  },
  {
    id: "patient-8",
    email: "grace.taylor@example.com",
    firstName: "Grace",
    lastName: "Taylor",
    profileImageUrl: "",
    role: "patient",
    phone: "+1 (555) 890-1234",
    dateOfBirth: "1992-01-05",
    gender: "female",
    address: "258 Spruce St, Springfield",
    pushToken: null,
    createdAt: new Date("2024-05-01"),
    updatedAt: new Date("2024-05-01")
  },
  {
    id: "patient-9",
    email: "henry.brown@example.com",
    firstName: "Henry",
    lastName: "Brown",
    profileImageUrl: "",
    role: "patient",
    phone: "+1 (555) 901-2345",
    dateOfBirth: "1980-08-14",
    gender: "male",
    address: "369 Willow Ave, Springfield",
    pushToken: null,
    createdAt: new Date("2024-05-15"),
    updatedAt: new Date("2024-05-15")
  },
  {
    id: "patient-10",
    email: "iris.chen@example.com",
    firstName: "Iris",
    lastName: "Chen",
    profileImageUrl: "",
    role: "patient",
    phone: "+1 (555) 012-3456",
    dateOfBirth: "1998-06-20",
    gender: "female",
    address: "741 Poplar St, Springfield",
    pushToken: null,
    createdAt: new Date("2024-06-01"),
    updatedAt: new Date("2024-06-01")
  },

  // Doctors
  {
    id: "user-doctor-1",
    email: "dr.smith@hospital.com",
    firstName: "Sarah",
    lastName: "Smith",
    profileImageUrl: "",
    role: "doctor",
    phone: "+1 (555) 111-2222",
    dateOfBirth: "1980-01-10",
    gender: "female",
    address: "Medical Center, Springfield",
    pushToken: null,
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01")
  },
  {
    id: "user-doctor-2",
    email: "dr.johnson@hospital.com",
    firstName: "Michael",
    lastName: "Johnson",
    profileImageUrl: "",
    role: "doctor",
    phone: "+1 (555) 333-4444",
    dateOfBirth: "1975-05-20",
    gender: "male",
    address: "Medical Center, Springfield",
    pushToken: null,
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01")
  },
  {
    id: "user-doctor-3",
    email: "dr.williams@hospital.com",
    firstName: "Emily",
    lastName: "Williams",
    profileImageUrl: "",
    role: "doctor",
    phone: "+1 (555) 555-6666",
    dateOfBirth: "1978-03-15",
    gender: "female",
    address: "Medical Center, Springfield",
    pushToken: null,
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01")
  },
  {
    id: "user-doctor-4",
    email: "dr.chen@hospital.com",
    firstName: "David",
    lastName: "Chen",
    profileImageUrl: "",
    role: "doctor",
    phone: "+1 (555) 777-8888",
    dateOfBirth: "1970-08-22",
    gender: "male",
    address: "Medical Center, Springfield",
    pushToken: null,
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01")
  },
  {
    id: "user-doctor-5",
    email: "dr.wilson@hospital.com",
    firstName: "Lisa",
    lastName: "Wilson",
    profileImageUrl: "",
    role: "doctor",
    phone: "+1 (555) 999-0000",
    dateOfBirth: "1982-11-30",
    gender: "female",
    address: "Medical Center, Springfield",
    pushToken: null,
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01")
  },

  // Admins
  {
    id: "user-admin-1",
    email: "admin@hospital.com",
    firstName: "Admin",
    lastName: "User",
    profileImageUrl: "",
    role: "admin",
    phone: "+1 (555) 000-0000",
    dateOfBirth: "1985-01-01",
    gender: "other",
    address: "Hospital Administration, Springfield",
    pushToken: null,
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01")
  }
];

// Mock Departments
export const mockDepartments: Department[] = [
  {
    id: 1,
    name: "Cardiology",
    description: "Heart and cardiovascular system care",
    icon: "heart",
    createdAt: new Date("2023-01-01")
  },
  {
    id: 2,
    name: "Dermatology",
    description: "Skin care and treatment",
    icon: "skin",
    createdAt: new Date("2023-01-01")
  },
  {
    id: 3,
    name: "Neurology",
    description: "Brain and nervous system care",
    icon: "brain",
    createdAt: new Date("2023-01-01")
  },
  {
    id: 4,
    name: "Orthopedics",
    description: "Bone and muscle care",
    icon: "bone",
    createdAt: new Date("2023-01-01")
  },
  {
    id: 5,
    name: "Pediatrics",
    description: "Children's health care",
    icon: "baby",
    createdAt: new Date("2023-01-01")
  },
  {
    id: 6,
    name: "Gynecology",
    description: "Women's reproductive health",
    icon: "female",
    createdAt: new Date("2023-01-01")
  },
  {
    id: 7,
    name: "Ophthalmology",
    description: "Eye care and vision",
    icon: "eye",
    createdAt: new Date("2023-01-01")
  },
  {
    id: 8,
    name: "Psychiatry",
    description: "Mental health care",
    icon: "brain",
    createdAt: new Date("2023-01-01")
  },
  {
    id: 9,
    name: "Urology",
    description: "Urinary system care",
    icon: "kidney",
    createdAt: new Date("2023-01-01")
  },
  {
    id: 10,
    name: "Endocrinology",
    description: "Hormone and metabolic disorders",
    icon: "gland",
    createdAt: new Date("2023-01-01")
  }
];

// Mock Doctors (with user references)
export const mockDoctors: Doctor[] = [
  {
    id: 1,
    userId: "user-doctor-1",
    departmentId: 1,
    specialty: "Cardiologist",
    qualification: "MD, FACC",
    experience: 10,
    consultationFee: "150.00",
    bio: "Board-certified cardiologist specializing in heart failure and arrhythmias",
    isAvailable: true,
    createdAt: new Date("2023-01-01")
  },
  {
    id: 2,
    userId: "user-doctor-2",
    departmentId: 4,
    specialty: "Orthopedic Surgeon",
    qualification: "MD, MS Ortho",
    experience: 8,
    consultationFee: "200.00",
    bio: "Specialized in joint replacements and sports medicine",
    isAvailable: true,
    createdAt: new Date("2023-01-01")
  },
  {
    id: 3,
    userId: "user-doctor-3",
    departmentId: 2,
    specialty: "Dermatologist",
    qualification: "MD, FAAD",
    experience: 12,
    consultationFee: "120.00",
    bio: "Specialized in skin disorders and cosmetic dermatology",
    isAvailable: true,
    createdAt: new Date("2023-01-01")
  },
  {
    id: 4,
    userId: "user-doctor-4",
    departmentId: 3,
    specialty: "Neurologist",
    qualification: "MD, PhD",
    experience: 15,
    consultationFee: "180.00",
    bio: "Expert in neurological disorders and brain health",
    isAvailable: true,
    createdAt: new Date("2023-01-01")
  },
  {
    id: 5,
    userId: "user-doctor-5",
    departmentId: 5,
    specialty: "Pediatrician",
    qualification: "MD, FAAP",
    experience: 9,
    consultationFee: "100.00",
    bio: "Dedicated to children's health and development",
    isAvailable: true,
    createdAt: new Date("2023-01-01")
  }
];

// Mock Medicines (100 items)
export const mockMedicines: Medicine[] = [
  // Analgesics & NSAIDs
  {
    id: 1,
    name: "Paracetamol",
    genericName: "Acetaminophen",
    category: "Analgesic",
    manufacturer: "PharmaCorp",
    dosageForm: "Tablet",
    strength: "500mg",
    description: "Pain relief and fever reducer",
    createdAt: new Date()
  },
  {
    id: 2,
    name: "Ibuprofen",
    genericName: "Ibuprofen",
    category: "NSAID",
    manufacturer: "HealthPharm",
    dosageForm: "Tablet",
    strength: "200mg",
    description: "Anti-inflammatory and pain relief",
    createdAt: new Date()
  },
  {
    id: 3,
    name: "Aspirin",
    genericName: "Acetylsalicylic Acid",
    category: "Analgesic",
    manufacturer: "MediCorp",
    dosageForm: "Tablet",
    strength: "81mg",
    description: "Blood thinner and pain relief",
    createdAt: new Date()
  },
  {
    id: 4,
    name: "Naproxen",
    genericName: "Naproxen",
    category: "NSAID",
    manufacturer: "HealthPharm",
    dosageForm: "Tablet",
    strength: "500mg",
    description: "Arthritis pain relief",
    createdAt: new Date()
  },
  {
    id: 5,
    name: "Tramadol",
    genericName: "Tramadol",
    category: "Opioid Analgesic",
    manufacturer: "PainMed",
    dosageForm: "Tablet",
    strength: "50mg",
    description: "Moderate to severe pain relief",
    createdAt: new Date()
  },

  // Antibiotics
  {
    id: 6,
    name: "Amoxicillin",
    genericName: "Amoxicillin",
    category: "Antibiotic",
    manufacturer: "MediLabs",
    dosageForm: "Capsule",
    strength: "250mg",
    description: "Broad-spectrum antibiotic",
    createdAt: new Date()
  },
  {
    id: 7,
    name: "Ciprofloxacin",
    genericName: "Ciprofloxacin",
    category: "Antibiotic",
    manufacturer: "MediLabs",
    dosageForm: "Tablet",
    strength: "500mg",
    description: "Broad-spectrum bacterial infection treatment",
    createdAt: new Date()
  },
  {
    id: 8,
    name: "Doxycycline",
    genericName: "Doxycycline",
    category: "Antibiotic",
    manufacturer: "MediLabs",
    dosageForm: "Capsule",
    strength: "100mg",
    description: "Acne and infection treatment",
    createdAt: new Date()
  },
  {
    id: 9,
    name: "Azithromycin",
    genericName: "Azithromycin",
    category: "Antibiotic",
    manufacturer: "MediLabs",
    dosageForm: "Tablet",
    strength: "250mg",
    description: "Bacterial infection treatment",
    createdAt: new Date()
  },
  {
    id: 10,
    name: "Cephalexin",
    genericName: "Cephalexin",
    category: "Antibiotic",
    manufacturer: "MediLabs",
    dosageForm: "Capsule",
    strength: "500mg",
    description: "Skin and soft tissue infections",
    createdAt: new Date()
  },

  // Cardiovascular
  {
    id: 11,
    name: "Lisinopril",
    genericName: "Lisinopril",
    category: "ACE Inhibitor",
    manufacturer: "CardioMed",
    dosageForm: "Tablet",
    strength: "10mg",
    description: "Blood pressure medication",
    createdAt: new Date()
  },
  {
    id: 12,
    name: "Amlodipine",
    genericName: "Amlodipine",
    category: "Calcium Channel Blocker",
    manufacturer: "CardioMed",
    dosageForm: "Tablet",
    strength: "5mg",
    description: "Hypertension and angina treatment",
    createdAt: new Date()
  },
  {
    id: 13,
    name: "Atorvastatin",
    genericName: "Atorvastatin",
    category: "Statin",
    manufacturer: "CholMed",
    dosageForm: "Tablet",
    strength: "10mg",
    description: "Cholesterol and triglyceride reduction",
    createdAt: new Date()
  },
  {
    id: 14,
    name: "Metoprolol",
    genericName: "Metoprolol",
    category: "Beta Blocker",
    manufacturer: "CardioMed",
    dosageForm: "Tablet",
    strength: "25mg",
    description: "Hypertension and angina treatment",
    createdAt: new Date()
  },
  {
    id: 15,
    name: "Warfarin",
    genericName: "Warfarin",
    category: "Anticoagulant",
    manufacturer: "BloodMed",
    dosageForm: "Tablet",
    strength: "5mg",
    description: "Blood clot prevention",
    createdAt: new Date()
  },

  // Respiratory
  {
    id: 16,
    name: "Albuterol",
    genericName: "Albuterol",
    category: "Bronchodilator",
    manufacturer: "RespiraMed",
    dosageForm: "Inhaler",
    strength: "90mcg",
    description: "Asthma and COPD treatment",
    createdAt: new Date()
  },
  {
    id: 17,
    name: "Montelukast",
    genericName: "Montelukast",
    category: "Leukotriene Inhibitor",
    manufacturer: "RespiraMed",
    dosageForm: "Tablet",
    strength: "10mg",
    description: "Asthma and allergy treatment",
    createdAt: new Date()
  },
  {
    id: 18,
    name: "Fluticasone",
    genericName: "Fluticasone",
    category: "Corticosteroid",
    manufacturer: "RespiraMed",
    dosageForm: "Nasal Spray",
    strength: "50mcg",
    description: "Allergic rhinitis treatment",
    createdAt: new Date()
  },
  {
    id: 19,
    name: "Ipratropium",
    genericName: "Ipratropium",
    category: "Anticholinergic",
    manufacturer: "RespiraMed",
    dosageForm: "Inhaler",
    strength: "20mcg",
    description: "COPD treatment",
    createdAt: new Date()
  },
  {
    id: 20,
    name: "Budesonide",
    genericName: "Budesonide",
    category: "Corticosteroid",
    manufacturer: "RespiraMed",
    dosageForm: "Inhaler",
    strength: "160mcg",
    description: "Asthma treatment",
    createdAt: new Date()
  },

  // Diabetes & Endocrine
  {
    id: 21,
    name: "Metformin",
    genericName: "Metformin",
    category: "Antidiabetic",
    manufacturer: "DiabCare",
    dosageForm: "Tablet",
    strength: "500mg",
    description: "Type 2 diabetes treatment",
    createdAt: new Date()
  },
  {
    id: 22,
    name: "Insulin Glargine",
    genericName: "Insulin Glargine",
    category: "Long-Acting Insulin",
    manufacturer: "DiabCare",
    dosageForm: "Injection",
    strength: "100IU/mL",
    description: "Diabetes blood sugar control",
    createdAt: new Date()
  },
  {
    id: 23,
    name: "Levothyroxine",
    genericName: "Levothyroxine",
    category: "Thyroid Hormone",
    manufacturer: "EndoMed",
    dosageForm: "Tablet",
    strength: "50mcg",
    description: "Hypothyroidism treatment",
    createdAt: new Date()
  },
  {
    id: 24,
    name: "Glipizide",
    genericName: "Glipizide",
    category: "Sulfonylurea",
    manufacturer: "DiabCare",
    dosageForm: "Tablet",
    strength: "5mg",
    description: "Type 2 diabetes treatment",
    createdAt: new Date()
  },
  {
    id: 25,
    name: "Pioglitazone",
    genericName: "Pioglitazone",
    category: "Thiazolidinedione",
    manufacturer: "DiabCare",
    dosageForm: "Tablet",
    strength: "15mg",
    description: "Type 2 diabetes treatment",
    createdAt: new Date()
  },

  // Gastrointestinal
  {
    id: 26,
    name: "Omeprazole",
    genericName: "Omeprazole",
    category: "Proton Pump Inhibitor",
    manufacturer: "GastroMed",
    dosageForm: "Capsule",
    strength: "20mg",
    description: "Acid reflux treatment",
    createdAt: new Date()
  },
  {
    id: 27,
    name: "Pantoprazole",
    genericName: "Pantoprazole",
    category: "Proton Pump Inhibitor",
    manufacturer: "GastroMed",
    dosageForm: "Tablet",
    strength: "40mg",
    description: "GERD and ulcer treatment",
    createdAt: new Date()
  },
  {
    id: 28,
    name: "Ranitidine",
    genericName: "Ranitidine",
    category: "H2 Blocker",
    manufacturer: "GastroMed",
    dosageForm: "Tablet",
    strength: "150mg",
    description: "Acid reflux and ulcer treatment",
    createdAt: new Date()
  },
  {
    id: 29,
    name: "Ondansetron",
    genericName: "Ondansetron",
    category: "Antiemetic",
    manufacturer: "NauseaMed",
    dosageForm: "Tablet",
    strength: "4mg",
    description: "Nausea and vomiting prevention",
    createdAt: new Date()
  },
  {
    id: 30,
    name: "Loperamide",
    genericName: "Loperamide",
    category: "Antidiarrheal",
    manufacturer: "GastroMed",
    dosageForm: "Tablet",
    strength: "2mg",
    description: "Diarrhea treatment",
    createdAt: new Date()
  },

  // Neurological & Psychiatric
  {
    id: 31,
    name: "Gabapentin",
    genericName: "Gabapentin",
    category: "Anticonvulsant",
    manufacturer: "NeuroMed",
    dosageForm: "Capsule",
    strength: "300mg",
    description: "Neuropathic pain and seizure treatment",
    createdAt: new Date()
  },
  {
    id: 32,
    name: "Sertraline",
    genericName: "Sertraline",
    category: "SSRI",
    manufacturer: "MindMed",
    dosageForm: "Tablet",
    strength: "50mg",
    description: "Antidepressant for anxiety and depression",
    createdAt: new Date()
  },
  {
    id: 33,
    name: "Fluoxetine",
    genericName: "Fluoxetine",
    category: "SSRI",
    manufacturer: "MindMed",
    dosageForm: "Capsule",
    strength: "20mg",
    description: "Depression and OCD treatment",
    createdAt: new Date()
  },
  {
    id: 34,
    name: "Escitalopram",
    genericName: "Escitalopram",
    category: "SSRI",
    manufacturer: "MindMed",
    dosageForm: "Tablet",
    strength: "10mg",
    description: "Depression and anxiety treatment",
    createdAt: new Date()
  },
  {
    id: 35,
    name: "Quetiapine",
    genericName: "Quetiapine",
    category: "Antipsychotic",
    manufacturer: "MindMed",
    dosageForm: "Tablet",
    strength: "25mg",
    description: "Schizophrenia and bipolar disorder treatment",
    createdAt: new Date()
  },

  // Additional medicines to reach 100
  {
    id: 36,
    name: "Losartan",
    genericName: "Losartan",
    category: "ARB",
    manufacturer: "CardioMed",
    dosageForm: "Tablet",
    strength: "50mg",
    description: "Blood pressure and heart failure treatment",
    createdAt: new Date()
  },
  {
    id: 37,
    name: "Hydrochlorothiazide",
    genericName: "Hydrochlorothiazide",
    category: "Diuretic",
    manufacturer: "KidneyMed",
    dosageForm: "Tablet",
    strength: "25mg",
    description: "Hypertension and edema treatment",
    createdAt: new Date()
  },
  {
    id: 38,
    name: "Cetirizine",
    genericName: "Cetirizine",
    category: "Antihistamine",
    manufacturer: "AllergyMed",
    dosageForm: "Tablet",
    strength: "10mg",
    description: "Allergy symptom relief",
    createdAt: new Date()
  },
  {
    id: 39,
    name: "Prednisone",
    genericName: "Prednisone",
    category: "Corticosteroid",
    manufacturer: "SteroidPharm",
    dosageForm: "Tablet",
    strength: "5mg",
    description: "Anti-inflammatory steroid",
    createdAt: new Date()
  },
  {
    id: 40,
    name: "Furosemide",
    genericName: "Furosemide",
    category: "Diuretic",
    manufacturer: "KidneyMed",
    dosageForm: "Tablet",
    strength: "40mg",
    description: "Fluid retention and blood pressure treatment",
    createdAt: new Date()
  },
  {
    id: 41,
    name: "Clonazepam",
    genericName: "Clonazepam",
    category: "Benzodiazepine",
    manufacturer: "NeuroMed",
    dosageForm: "Tablet",
    strength: "0.5mg",
    description: "Anxiety and seizure treatment",
    createdAt: new Date()
  },
  {
    id: 42,
    name: "Venlafaxine",
    genericName: "Venlafaxine",
    category: "SNRI",
    manufacturer: "MindMed",
    dosageForm: "Tablet",
    strength: "37.5mg",
    description: "Depression and anxiety treatment",
    createdAt: new Date()
  },
  {
    id: 43,
    name: "Tamsulosin",
    genericName: "Tamsulosin",
    category: "Alpha Blocker",
    manufacturer: "UroMed",
    dosageForm: "Capsule",
    strength: "0.4mg",
    description: "Benign prostatic hyperplasia treatment",
    createdAt: new Date()
  },
  {
    id: 44,
    name: "Topiramate",
    genericName: "Topiramate",
    category: "Anticonvulsant",
    manufacturer: "NeuroMed",
    dosageForm: "Tablet",
    strength: "25mg",
    description: "Seizure and migraine prevention",
    createdAt: new Date()
  },
  {
    id: 45,
    name: "Valacyclovir",
    genericName: "Valacyclovir",
    category: "Antiviral",
    manufacturer: "ViroMed",
    dosageForm: "Tablet",
    strength: "500mg",
    description: "Herpes virus infection treatment",
    createdAt: new Date()
  },
  {
    id: 46,
    name: "Acyclovir",
    genericName: "Acyclovir",
    category: "Antiviral",
    manufacturer: "ViroMed",
    dosageForm: "Tablet",
    strength: "400mg",
    description: "Herpes simplex treatment",
    createdAt: new Date()
  },
  {
    id: 47,
    name: "Allopurinol",
    genericName: "Allopurinol",
    category: "Xanthine Oxidase Inhibitor",
    manufacturer: "GoutMed",
    dosageForm: "Tablet",
    strength: "100mg",
    description: "Gout and kidney stone prevention",
    createdAt: new Date()
  },
  {
    id: 48,
    name: "Baclofen",
    genericName: "Baclofen",
    category: "Muscle Relaxant",
    manufacturer: "NeuroMed",
    dosageForm: "Tablet",
    strength: "10mg",
    description: "Muscle spasm treatment",
    createdAt: new Date()
  },
  {
    id: 49,
    name: "Bupropion",
    genericName: "Bupropion",
    category: "Antidepressant",
    manufacturer: "MindMed",
    dosageForm: "Tablet",
    strength: "150mg",
    description: "Depression and smoking cessation",
    createdAt: new Date()
  },
  {
    id: 50,
    name: "Carvedilol",
    genericName: "Carvedilol",
    category: "Beta Blocker",
    manufacturer: "CardioMed",
    dosageForm: "Tablet",
    strength: "6.25mg",
    description: "Heart failure and hypertension treatment",
    createdAt: new Date()
  },
  {
    id: 51,
    name: "Citalopram",
    genericName: "Citalopram",
    category: "SSRI",
    manufacturer: "MindMed",
    dosageForm: "Tablet",
    strength: "20mg",
    description: "Depression and anxiety treatment",
    createdAt: new Date()
  },
  {
    id: 52,
    name: "Clopidogrel",
    genericName: "Clopidogrel",
    category: "Antiplatelet",
    manufacturer: "BloodMed",
    dosageForm: "Tablet",
    strength: "75mg",
    description: "Blood clot prevention",
    createdAt: new Date()
  },
  {
    id: 53,
    name: "Diazepam",
    genericName: "Diazepam",
    category: "Benzodiazepine",
    manufacturer: "NeuroMed",
    dosageForm: "Tablet",
    strength: "5mg",
    description: "Anxiety and muscle spasm treatment",
    createdAt: new Date()
  },
  {
    id: 54,
    name: "Enalapril",
    genericName: "Enalapril",
    category: "ACE Inhibitor",
    manufacturer: "CardioMed",
    dosageForm: "Tablet",
    strength: "5mg",
    description: "Hypertension and heart failure treatment",
    createdAt: new Date()
  },
  {
    id: 55,
    name: "Finasteride",
    genericName: "Finasteride",
    category: "5-Alpha Reductase Inhibitor",
    manufacturer: "UroMed",
    dosageForm: "Tablet",
    strength: "5mg",
    description: "Benign prostatic hyperplasia treatment",
    createdAt: new Date()
  },
  {
    id: 56,
    name: "Fluticasone",
    genericName: "Fluticasone",
    category: "Corticosteroid",
    manufacturer: "RespiraMed",
    dosageForm: "Nasal Spray",
    strength: "50mcg",
    description: "Allergic rhinitis treatment",
    createdAt: new Date()
  },
  {
    id: 57,
    name: "Gemfibrozil",
    genericName: "Gemfibrozil",
    category: "Fibrate",
    manufacturer: "CholMed",
    dosageForm: "Tablet",
    strength: "600mg",
    description: "Triglyceride reduction",
    createdAt: new Date()
  },
  {
    id: 58,
    name: "Haloperidol",
    genericName: "Haloperidol",
    category: "Antipsychotic",
    manufacturer: "MindMed",
    dosageForm: "Tablet",
    strength: "2mg",
    description: "Psychotic disorder treatment",
    createdAt: new Date()
  },
  {
    id: 59,
    name: "Hydralazine",
    genericName: "Hydralazine",
    category: "Vasodilator",
    manufacturer: "CardioMed",
    dosageForm: "Tablet",
    strength: "25mg",
    description: "Hypertension treatment",
    createdAt: new Date()
  },
  {
    id: 60,
    name: "Imipramine",
    genericName: "Imipramine",
    category: "Tricyclic Antidepressant",
    manufacturer: "MindMed",
    dosageForm: "Tablet",
    strength: "25mg",
    description: "Depression treatment",
    createdAt: new Date()
  },
  {
    id: 61,
    name: "Indomethacin",
    genericName: "Indomethacin",
    category: "NSAID",
    manufacturer: "HealthPharm",
    dosageForm: "Capsule",
    strength: "25mg",
    description: "Inflammation and pain relief",
    createdAt: new Date()
  },
  {
    id: 62,
    name: "Isosorbide Mononitrate",
    genericName: "Isosorbide Mononitrate",
    category: "Nitrate",
    manufacturer: "CardioMed",
    dosageForm: "Tablet",
    strength: "30mg",
    description: "Angina treatment",
    createdAt: new Date()
  },
  {
    id: 63,
    name: "Labetalol",
    genericName: "Labetalol",
    category: "Beta Blocker",
    manufacturer: "CardioMed",
    dosageForm: "Tablet",
    strength: "100mg",
    description: "Hypertension treatment",
    createdAt: new Date()
  },
  {
    id: 64,
    name: "Lamotrigine",
    genericName: "Lamotrigine",
    category: "Anticonvulsant",
    manufacturer: "NeuroMed",
    dosageForm: "Tablet",
    strength: "25mg",
    description: "Seizure and bipolar disorder treatment",
    createdAt: new Date()
  },
  {
    id: 65,
    name: "Levetiracetam",
    genericName: "Levetiracetam",
    category: "Anticonvulsant",
    manufacturer: "NeuroMed",
    dosageForm: "Tablet",
    strength: "500mg",
    description: "Seizure treatment",
    createdAt: new Date()
  },
  {
    id: 66,
    name: "Lithium",
    genericName: "Lithium Carbonate",
    category: "Mood Stabilizer",
    manufacturer: "MindMed",
    dosageForm: "Capsule",
    strength: "300mg",
    description: "Bipolar disorder treatment",
    createdAt: new Date()
  },
  {
    id: 67,
    name: "Meloxicam",
    genericName: "Meloxicam",
    category: "NSAID",
    manufacturer: "HealthPharm",
    dosageForm: "Tablet",
    strength: "15mg",
    description: "Arthritis pain relief",
    createdAt: new Date()
  },
  {
    id: 68,
    name: "Mirtazapine",
    genericName: "Mirtazapine",
    category: "Antidepressant",
    manufacturer: "MindMed",
    dosageForm: "Tablet",
    strength: "15mg",
    description: "Depression treatment",
    createdAt: new Date()
  },
  {
    id: 69,
    name: "Nifedipine",
    genericName: "Nifedipine",
    category: "Calcium Channel Blocker",
    manufacturer: "CardioMed",
    dosageForm: "Tablet",
    strength: "30mg",
    description: "Hypertension and angina treatment",
    createdAt: new Date()
  },
  {
    id: 70,
    name: "Nitroglycerin",
    genericName: "Nitroglycerin",
    category: "Nitrate",
    manufacturer: "CardioMed",
    dosageForm: "Tablet",
    strength: "0.4mg",
    description: "Acute angina treatment",
    createdAt: new Date()
  },
  {
    id: 71,
    name: "Olanzapine",
    genericName: "Olanzapine",
    category: "Antipsychotic",
    manufacturer: "MindMed",
    dosageForm: "Tablet",
    strength: "5mg",
    description: "Schizophrenia treatment",
    createdAt: new Date()
  },
  {
    id: 72,
    name: "Phenytoin",
    genericName: "Phenytoin",
    category: "Anticonvulsant",
    manufacturer: "NeuroMed",
    dosageForm: "Capsule",
    strength: "100mg",
    description: "Seizure treatment",
    createdAt: new Date()
  },
  {
    id: 73,
    name: "Prazosin",
    genericName: "Prazosin",
    category: "Alpha Blocker",
    manufacturer: "CardioMed",
    dosageForm: "Capsule",
    strength: "1mg",
    description: "Hypertension and PTSD treatment",
    createdAt: new Date()
  },
  {
    id: 74,
    name: "Propranolol",
    genericName: "Propranolol",
    category: "Beta Blocker",
    manufacturer: "CardioMed",
    dosageForm: "Tablet",
    strength: "10mg",
    description: "Anxiety and hypertension treatment",
    createdAt: new Date()
  },
  {
    id: 75,
    name: "Risperidone",
    genericName: "Risperidone",
    category: "Antipsychotic",
    manufacturer: "MindMed",
    dosageForm: "Tablet",
    strength: "1mg",
    description: "Psychotic disorder treatment",
    createdAt: new Date()
  },
  {
    id: 76,
    name: "Ropinirole",
    genericName: "Ropinirole",
    category: "Dopamine Agonist",
    manufacturer: "NeuroMed",
    dosageForm: "Tablet",
    strength: "0.25mg",
    description: "Parkinson's disease treatment",
    createdAt: new Date()
  },
  {
    id: 77,
    name: "Sildenafil",
    genericName: "Sildenafil",
    category: "PDE5 Inhibitor",
    manufacturer: "VitaMed",
    dosageForm: "Tablet",
    strength: "50mg",
    description: "Erectile dysfunction treatment",
    createdAt: new Date()
  },
  {
    id: 78,
    name: "Spironolactone",
    genericName: "Spironolactone",
    category: "Diuretic",
    manufacturer: "KidneyMed",
    dosageForm: "Tablet",
    strength: "25mg",
    description: "Heart failure and hypertension treatment",
    createdAt: new Date()
  },
  {
    id: 79,
    name: "Tolterodine",
    genericName: "Tolterodine",
    category: "Anticholinergic",
    manufacturer: "UroMed",
    dosageForm: "Tablet",
    strength: "2mg",
    description: "Overactive bladder treatment",
    createdAt: new Date()
  },
  {
    id: 80,
    name: "Triamterene",
    genericName: "Triamterene",
    category: "Diuretic",
    manufacturer: "KidneyMed",
    dosageForm: "Tablet",
    strength: "50mg",
    description: "Hypertension treatment",
    createdAt: new Date()
  },
  {
    id: 81,
    name: "Valproic Acid",
    genericName: "Valproic Acid",
    category: "Anticonvulsant",
    manufacturer: "NeuroMed",
    dosageForm: "Capsule",
    strength: "250mg",
    description: "Seizure and bipolar disorder treatment",
    createdAt: new Date()
  },
  {
    id: 82,
    name: "Verapamil",
    genericName: "Verapamil",
    category: "Calcium Channel Blocker",
    manufacturer: "CardioMed",
    dosageForm: "Tablet",
    strength: "80mg",
    description: "Hypertension and arrhythmia treatment",
    createdAt: new Date()
  },
  {
    id: 83,
    name: "Ziprasidone",
    genericName: "Ziprasidone",
    category: "Antipsychotic",
    manufacturer: "MindMed",
    dosageForm: "Capsule",
    strength: "40mg",
    description: "Schizophrenia treatment",
    createdAt: new Date()
  },
  {
    id: 84,
    name: "Zonisamide",
    genericName: "Zonisamide",
    category: "Anticonvulsant",
    manufacturer: "NeuroMed",
    dosageForm: "Capsule",
    strength: "100mg",
    description: "Seizure treatment",
    createdAt: new Date()
  },
  {
    id: 85,
    name: "Acetaminophen with Codeine",
    genericName: "Acetaminophen/Codeine",
    category: "Opioid Analgesic",
    manufacturer: "PainMed",
    dosageForm: "Tablet",
    strength: "300mg/30mg",
    description: "Moderate pain relief",
    createdAt: new Date()
  },
  {
    id: 86,
    name: "Amiodarone",
    genericName: "Amiodarone",
    category: "Antiarrhythmic",
    manufacturer: "CardioMed",
    dosageForm: "Tablet",
    strength: "200mg",
    description: "Arrhythmia treatment",
    createdAt: new Date()
  },
  {
    id: 87,
    name: "Candesartan",
    genericName: "Candesartan",
    category: "ARB",
    manufacturer: "CardioMed",
    dosageForm: "Tablet",
    strength: "8mg",
    description: "Hypertension treatment",
    createdAt: new Date()
  },
  {
    id: 88,
    name: "Dabigatran",
    genericName: "Dabigatran",
    category: "Anticoagulant",
    manufacturer: "BloodMed",
    dosageForm: "Capsule",
    strength: "75mg",
    description: "Blood clot prevention",
    createdAt: new Date()
  },
  {
    id: 89,
    name: "Ezetimibe",
    genericName: "Ezetimibe",
    category: "Cholesterol Absorption Inhibitor",
    manufacturer: "CholMed",
    dosageForm: "Tablet",
    strength: "10mg",
    description: "Cholesterol reduction",
    createdAt: new Date()
  },
  {
    id: 90,
    name: "Flecainide",
    genericName: "Flecainide",
    category: "Antiarrhythmic",
    manufacturer: "CardioMed",
    dosageForm: "Tablet",
    strength: "50mg",
    description: "Arrhythmia treatment",
    createdAt: new Date()
  },
  {
    id: 91,
    name: "Glimepiride",
    genericName: "Glimepiride",
    category: "Sulfonylurea",
    manufacturer: "DiabCare",
    dosageForm: "Tablet",
    strength: "2mg",
    description: "Type 2 diabetes treatment",
    createdAt: new Date()
  },
  {
    id: 92,
    name: "Hydrocodone",
    genericName: "Hydrocodone",
    category: "Opioid Analgesic",
    manufacturer: "PainMed",
    dosageForm: "Tablet",
    strength: "5mg",
    description: "Severe pain relief",
    createdAt: new Date()
  },
  {
    id: 93,
    name: "Ketoconazole",
    genericName: "Ketoconazole",
    category: "Antifungal",
    manufacturer: "FungusMed",
    dosageForm: "Tablet",
    strength: "200mg",
    description: "Fungal infection treatment",
    createdAt: new Date()
  },
  {
    id: 94,
    name: "Methotrexate",
    genericName: "Methotrexate",
    category: "Antimetabolite",
    manufacturer: "OncoMed",
    dosageForm: "Tablet",
    strength: "2.5mg",
    description: "Cancer and autoimmune disease treatment",
    createdAt: new Date()
  },
  {
    id: 95,
    name: "Methylphenidate",
    genericName: "Methylphenidate",
    category: "Stimulant",
    manufacturer: "FocusMed",
    dosageForm: "Tablet",
    strength: "10mg",
    description: "ADHD treatment",
    createdAt: new Date()
  },
  {
    id: 96,
    name: "Moxifloxacin",
    genericName: "Moxifloxacin",
    category: "Antibiotic",
    manufacturer: "MediLabs",
    dosageForm: "Tablet",
    strength: "400mg",
    description: "Bacterial infection treatment",
    createdAt: new Date()
  },
  {
    id: 97,
    name: "Nystatin",
    genericName: "Nystatin",
    category: "Antifungal",
    manufacturer: "FungusMed",
    dosageForm: "Tablet",
    strength: "500000IU",
    description: "Oral thrush treatment",
    createdAt: new Date()
  },
  {
    id: 98,
    name: "Oxycodone",
    genericName: "Oxycodone",
    category: "Opioid Analgesic",
    manufacturer: "PainMed",
    dosageForm: "Tablet",
    strength: "10mg",
    description: "Severe pain management",
    createdAt: new Date()
  },
  {
    id: 99,
    name: "Prednisolone",
    genericName: "Prednisolone",
    category: "Corticosteroid",
    manufacturer: "SteroidPharm",
    dosageForm: "Tablet",
    strength: "5mg",
    description: "Inflammation and immune suppression",
    createdAt: new Date()
  },
  {
    id: 100,
    name: "Trazodone",
    genericName: "Trazodone",
    category: "Antidepressant",
    manufacturer: "MindMed",
    dosageForm: "Tablet",
    strength: "50mg",
    description: "Depression and insomnia treatment",
    createdAt: new Date()
  }
];

// Mock Appointments
export const mockAppointments: Appointment[] = [
  {
    id: 1,
    patientId: "patient-1",
    doctorId: 1,
    appointmentDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    appointmentTime: "10:30:00",
    status: "confirmed",
    reason: "Annual heart checkup",
    notes: "Regular checkup for hypertension",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    patientId: "patient-2",
    doctorId: 2,
    appointmentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    appointmentTime: "14:00:00",
    status: "completed",
    reason: "Follow-up consultation",
    notes: "Checking medication effectiveness",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 3,
    patientId: "patient-3",
    doctorId: 3,
    appointmentDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    appointmentTime: "09:00:00",
    status: "confirmed",
    reason: "Dermatology consultation",
    notes: "Skin condition evaluation",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 4,
    patientId: "patient-4",
    doctorId: 4,
    appointmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    appointmentTime: "11:30:00",
    status: "pending",
    reason: "Neurology consultation",
    notes: "Headache evaluation",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 5,
    patientId: "patient-5",
    doctorId: 5,
    appointmentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    appointmentTime: "15:30:00",
    status: "completed",
    reason: "Pediatric checkup",
    notes: "Routine child health examination",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 6,
    patientId: "patient-6",
    doctorId: 1,
    appointmentDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    appointmentTime: "13:00:00",
    status: "confirmed",
    reason: "Cardiology follow-up",
    notes: "Post-treatment evaluation",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 7,
    patientId: "patient-7",
    doctorId: 2,
    appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    appointmentTime: "16:00:00",
    status: "confirmed",
    reason: "Orthopedic consultation",
    notes: "Knee pain evaluation",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 8,
    patientId: "patient-8",
    doctorId: 3,
    appointmentDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    appointmentTime: "10:00:00",
    status: "completed",
    reason: "Skin condition follow-up",
    notes: "Treatment effectiveness check",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 9,
    patientId: "patient-9",
    doctorId: 4,
    appointmentDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    appointmentTime: "14:30:00",
    status: "pending",
    reason: "Neurological evaluation",
    notes: "Migraine assessment",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 10,
    patientId: "patient-10",
    doctorId: 5,
    appointmentDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    appointmentTime: "11:00:00",
    status: "confirmed",
    reason: "Well-child visit",
    notes: "Annual pediatric checkup",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Mock Documents/Reports
export const mockDocuments: Document[] = [
  {
    id: 1,
    patientId: "patient-1",
    type: "lab_report",
    title: "Complete Blood Count",
    description: "CBC test results showing normal blood cell counts",
    fileUrl: "#",
    uploadedBy: "user-doctor-1",
    appointmentId: 1,
    createdAt: new Date()
  },
  {
    id: 2,
    patientId: "patient-2",
    type: "radiology",
    title: "Chest X-Ray",
    description: "PA and lateral chest X-ray showing clear lung fields",
    fileUrl: "#",
    uploadedBy: "user-doctor-2",
    appointmentId: 2,
    createdAt: new Date(Date.now() - 86400000)
  },
  {
    id: 3,
    patientId: "patient-3",
    type: "lab_report",
    title: "Lipid Profile",
    description: "Cholesterol and triglyceride levels within normal range",
    fileUrl: "#",
    uploadedBy: "user-doctor-3",
    appointmentId: 3,
    createdAt: new Date(Date.now() - 172800000)
  },
  {
    id: 4,
    patientId: "patient-1",
    type: "prescription",
    title: "Blood Pressure Medication",
    description: "Prescription for hypertension medication",
    fileUrl: "#",
    uploadedBy: "user-doctor-1",
    appointmentId: 4,
    createdAt: new Date(Date.now() - 259200000)
  },
  {
    id: 5,
    patientId: "patient-4",
    type: "lab_report",
    title: "Thyroid Function Test",
    description: "TSH, T3, and T4 levels within normal range",
    fileUrl: "#",
    uploadedBy: "user-doctor-4",
    appointmentId: 5,
    createdAt: new Date(Date.now() - 345600000)
  },
  {
    id: 6,
    patientId: "patient-5",
    type: "radiology",
    title: "MRI Brain Scan",
    description: "Normal brain MRI without any abnormalities",
    fileUrl: "#",
    uploadedBy: "user-doctor-5",
    appointmentId: 6,
    createdAt: new Date(Date.now() - 432000000)
  },
  {
    id: 7,
    patientId: "patient-6",
    type: "prescription",
    title: "Diabetes Medication",
    description: "Prescription for type 2 diabetes management",
    fileUrl: "#",
    uploadedBy: "user-doctor-1",
    appointmentId: 6,
    createdAt: new Date(Date.now() - 518400000)
  },
  {
    id: 8,
    patientId: "patient-7",
    type: "lab_report",
    title: "Liver Function Test",
    description: "ALT, AST, and bilirubin levels normal",
    fileUrl: "#",
    uploadedBy: "user-doctor-2",
    appointmentId: 7,
    createdAt: new Date(Date.now() - 604800000)
  },
  {
    id: 9,
    patientId: "patient-8",
    type: "radiology",
    title: "CT Scan Abdomen",
    description: "Abdominal CT showing no abnormalities",
    fileUrl: "#",
    uploadedBy: "user-doctor-3",
    appointmentId: 8,
    createdAt: new Date(Date.now() - 691200000)
  },
  {
    id: 10,
    patientId: "patient-9",
    type: "prescription",
    title: "Antibiotic Prescription",
    description: "Prescription for bacterial infection treatment",
    fileUrl: "#",
    uploadedBy: "user-doctor-4",
    appointmentId: 9,
    createdAt: new Date(Date.now() - 777600000)
  }
];

// Mock Bills/Payments
export const mockBills: Bill[] = [
  {
    id: 1,
    patientId: "patient-1",
    appointmentId: 1,
    amount: "150.00",
    status: "paid",
    paymentMethod: "Credit Card",
    description: "Cardiology consultation fee",
    createdAt: new Date(),
    paidAt: new Date()
  },
  {
    id: 2,
    patientId: "patient-2",
    appointmentId: 2,
    amount: "200.00",
    status: "paid",
    paymentMethod: "Insurance",
    description: "Orthopedic surgery consultation",
    createdAt: new Date(Date.now() - 86400000),
    paidAt: new Date(Date.now() - 86400000)
  },
  {
    id: 3,
    patientId: "patient-3",
    appointmentId: 3,
    amount: "120.00",
    status: "pending",
    paymentMethod: null,
    description: "Dermatology consultation",
    createdAt: new Date(Date.now() - 172800000),
    paidAt: null
  },
  {
    id: 4,
    patientId: "patient-1",
    appointmentId: 4,
    amount: "75.00",
    status: "paid",
    paymentMethod: "Cash",
    description: "Lab tests - CBC and Lipid Profile",
    createdAt: new Date(Date.now() - 259200000),
    paidAt: new Date(Date.now() - 259200000)
  },
  {
    id: 5,
    patientId: "patient-4",
    appointmentId: 5,
    amount: "180.00",
    status: "paid",
    paymentMethod: "Credit Card",
    description: "Neurology consultation and MRI",
    createdAt: new Date(Date.now() - 345600000),
    paidAt: new Date(Date.now() - 345600000)
  },
  {
    id: 6,
    patientId: "patient-5",
    appointmentId: 6,
    amount: "100.00",
    status: "pending",
    paymentMethod: null,
    description: "Pediatric checkup",
    createdAt: new Date(Date.now() - 432000000),
    paidAt: null
  },
  {
    id: 7,
    patientId: "patient-6",
    appointmentId: 6,
    amount: "300.00",
    status: "paid",
    paymentMethod: "Insurance",
    description: "Cardiac stress test",
    createdAt: new Date(Date.now() - 518400000),
    paidAt: new Date(Date.now() - 518400000)
  },
  {
    id: 8,
    patientId: "patient-7",
    appointmentId: 7,
    amount: "250.00",
    status: "paid",
    paymentMethod: "Credit Card",
    description: "Orthopedic consultation and X-rays",
    createdAt: new Date(Date.now() - 604800000),
    paidAt: new Date(Date.now() - 604800000)
  },
  {
    id: 9,
    patientId: "patient-8",
    appointmentId: 8,
    amount: "90.00",
    status: "pending",
    paymentMethod: null,
    description: "Dermatology follow-up",
    createdAt: new Date(Date.now() - 691200000),
    paidAt: null
  },
  {
    id: 10,
    patientId: "patient-9",
    appointmentId: 9,
    amount: "220.00",
    status: "paid",
    paymentMethod: "Insurance",
    description: "Neurology consultation and CT scan",
    createdAt: new Date(Date.now() - 777600000),
    paidAt: new Date(Date.now() - 777600000)
  }
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 1,
    userId: "patient-1",
    type: "appointment_reminder",
    title: "Appointment Reminder",
    message: "Your appointment with Dr. Smith is tomorrow at 10:30 AM",
    isRead: false,
    priority: "medium",
    data: { appointmentId: 1 },
    createdAt: new Date()
  },
  {
    id: 2,
    userId: "patient-2",
    type: "report_ready",
    title: "Lab Results Available",
    message: "Your blood test results are now available in your records",
    isRead: true,
    priority: "low",
    data: { documentId: 1 },
    createdAt: new Date(Date.now() - 86400000)
  },
  {
    id: 3,
    userId: "patient-3",
    type: "payment_due",
    title: "Payment Due",
    message: "Your bill for dermatology consultation is due in 3 days",
    isRead: false,
    priority: "high",
    data: { billId: 3 },
    createdAt: new Date(Date.now() - 172800000)
  },
  {
    id: 4,
    userId: "patient-1",
    type: "prescription_added",
    title: "New Prescription",
    message: "Dr. Smith has added a new prescription to your records",
    isRead: true,
    priority: "medium",
    data: { prescriptionId: 1 },
    createdAt: new Date(Date.now() - 259200000)
  },
  {
    id: 5,
    userId: "patient-4",
    type: "appointment_confirmed",
    title: "Appointment Confirmed",
    message: "Your neurology appointment has been confirmed",
    isRead: false,
    priority: "low",
    data: { appointmentId: 4 },
    createdAt: new Date(Date.now() - 345600000)
  }
];

// Helper functions to get related data
export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const getDoctorById = (id: number): Doctor | undefined => {
  return mockDoctors.find(doctor => doctor.id === id);
};

export const getDoctorWithUser = (id: number) => {
  const doctor = getDoctorById(id);
  if (!doctor) return undefined;

  const user = getUserById(doctor.userId);
  if (!user) return undefined;

  const department = mockDepartments.find(dept => dept.id === doctor.departmentId);

  return {
    ...doctor,
    user,
    department
  };
};

export const getPatientById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id && user.role === "patient");
};

export const getDepartmentById = (id: number): Department | undefined => {
  return mockDepartments.find(dept => dept.id === id);
};

export const getAppointmentById = (id: number) => {
  const appointment = mockAppointments.find(apt => apt.id === id);
  if (!appointment) return undefined;

  const doctor = getDoctorWithUser(appointment.doctorId);
  const patient = getPatientById(appointment.patientId);

  return {
    ...appointment,
    doctor,
    patient
  };
};

export const getDocumentById = (id: number): Document | undefined => {
  return mockDocuments.find(doc => doc.id === id);
};

export const getBillById = (id: number): Bill | undefined => {
  return mockBills.find(bill => bill.id === id);
};

// Export all data for easy access
export const mockData = {
  users: mockUsers,
  departments: mockDepartments,
  doctors: mockDoctors,
  medicines: mockMedicines,
  appointments: mockAppointments,
  documents: mockDocuments,
  bills: mockBills,
  notifications: mockNotifications
};