import type {
  User,
  Doctor,
  Appointment,
  Prescription,
  PrescriptionItem,
  Vital,
  Allergy,
  FamilyMember,
  Document,
  Bill,
  Favorite,
  Notification,
  Vaccination,
  Medicine,
  Department
} from "./schema-sqlite";

// Comprehensive mock data for testing all portal functionality

export const mockDepartments: Department[] = [
  { id: 1, name: "Cardiology", description: "Heart and cardiovascular system care", icon: "heart", createdAt: new Date("2024-01-01") },
  { id: 2, name: "Dermatology", description: "Skin care and treatment", icon: "skin", createdAt: new Date("2024-01-01") },
  { id: 3, name: "Pediatrics", description: "Children's health care", icon: "baby", createdAt: new Date("2024-01-01") },
  { id: 4, name: "Neurology", description: "Brain and nervous system care", icon: "brain", createdAt: new Date("2024-01-01") },
  { id: 5, name: "Orthopedics", description: "Bone and muscle care", icon: "bone", createdAt: new Date("2024-01-01") },
  { id: 6, name: "Gynecology", description: "Women's reproductive health", icon: "female", createdAt: new Date("2024-01-01") },
  { id: 7, name: "Ophthalmology", description: "Eye care and vision", icon: "eye", createdAt: new Date("2024-01-01") },
  { id: 8, name: "Psychiatry", description: "Mental health care", icon: "brain", createdAt: new Date("2024-01-01") },
  { id: 9, name: "Urology", description: "Urinary system care", icon: "kidney", createdAt: new Date("2024-01-01") },
  { id: 10, name: "Endocrinology", description: "Hormone and metabolic disorders", icon: "gland", createdAt: new Date("2024-01-01") },
];

export const mockUsers: User[] = [
  // Dev users for testing different roles
  {
    id: "dev-user",
    email: "dev@localhost",
    firstName: "Dev",
    lastName: "User",
    profileImageUrl: "",
    role: "patient",
    phone: "+1 (555) 123-4567",
    dateOfBirth: "1985-06-15",
    gender: "Male",
    address: "123 Main St, City, State 12345",
    pushToken: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "dev-doctor",
    email: "dr.dev@hospital.com",
    firstName: "Dr. Dev",
    lastName: "User",
    profileImageUrl: "",
    role: "doctor",
    phone: "+1 (555) 111-2222",
    dateOfBirth: "1980-01-15",
    gender: "Female",
    address: "456 Medical Ave, Health City, HC 56789",
    pushToken: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "dev-admin",
    email: "admin@hospital.com",
    firstName: "Admin",
    lastName: "User",
    profileImageUrl: "",
    role: "admin",
    phone: "+1 (555) 777-8888",
    dateOfBirth: "1975-12-10",
    gender: "Other",
    address: "789 Admin Plaza, System City, SC 98765",
    pushToken: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  // Regular patients with diverse demographics
  {
    id: "patient-1",
    email: "john.doe@example.com",
    firstName: "John",
    lastName: "Doe",
    profileImageUrl: "",
    role: "patient",
    phone: "+1 (555) 234-5678",
    dateOfBirth: "1978-03-22",
    gender: "Male",
    address: "456 Oak St, Springfield, IL 62701",
    pushToken: null,
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01")
  },
  {
    id: "patient-2",
    email: "jane.smith@example.com",
    firstName: "Jane",
    lastName: "Smith",
    profileImageUrl: "",
    role: "patient",
    phone: "+1 (555) 345-6789",
    dateOfBirth: "1982-11-08",
    gender: "Female",
    address: "789 Pine St, Austin, TX 73301",
    pushToken: null,
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-02-15")
  },
  {
    id: "patient-3",
    email: "mike.johnson@example.com",
    firstName: "Mike",
    lastName: "Johnson",
    profileImageUrl: "",
    role: "patient",
    phone: "+1 (555) 456-7890",
    dateOfBirth: "1990-07-14",
    gender: "Male",
    address: "321 Elm St, Seattle, WA 98101",
    pushToken: null,
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-03-01")
  },
  {
    id: "patient-4",
    email: "sarah.wilson@example.com",
    firstName: "Sarah",
    lastName: "Wilson",
    profileImageUrl: "",
    role: "patient",
    phone: "+1 (555) 567-8901",
    dateOfBirth: "1965-12-03",
    gender: "Female",
    address: "654 Maple Ave, Boston, MA 02101",
    pushToken: null,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15")
  },
  {
    id: "patient-5",
    email: "david.brown@example.com",
    firstName: "David",
    lastName: "Brown",
    profileImageUrl: "",
    role: "patient",
    phone: "+1 (555) 678-9012",
    dateOfBirth: "1988-05-17",
    gender: "Male",
    address: "987 Cedar Ln, Denver, CO 80201",
    pushToken: null,
    createdAt: new Date("2024-03-10"),
    updatedAt: new Date("2024-03-10")
  },
  {
    id: "patient-6",
    email: "lisa.davis@example.com",
    firstName: "Lisa",
    lastName: "Davis",
    profileImageUrl: "",
    role: "patient",
    phone: "+1 (555) 789-0123",
    dateOfBirth: "1972-09-25",
    gender: "Female",
    address: "147 Birch St, Miami, FL 33101",
    pushToken: null,
    createdAt: new Date("2024-02-20"),
    updatedAt: new Date("2024-02-20")
  },
  {
    id: "patient-7",
    email: "robert.miller@example.com",
    firstName: "Robert",
    lastName: "Miller",
    profileImageUrl: "",
    role: "patient",
    phone: "+1 (555) 890-1234",
    dateOfBirth: "1958-01-30",
    gender: "Male",
    address: "258 Spruce Dr, Chicago, IL 60601",
    pushToken: null,
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-05")
  },
  {
    id: "patient-8",
    email: "maria.garcia@example.com",
    firstName: "Maria",
    lastName: "Garcia",
    profileImageUrl: "",
    role: "patient",
    phone: "+1 (555) 901-2345",
    dateOfBirth: "1995-06-12",
    gender: "Female",
    address: "369 Willow Way, Los Angeles, CA 90001",
    pushToken: null,
    createdAt: new Date("2024-04-01"),
    updatedAt: new Date("2024-04-01")
  },
  {
    id: "patient-9",
    email: "james.anderson@example.com",
    firstName: "James",
    lastName: "Anderson",
    profileImageUrl: "",
    role: "patient",
    phone: "+1 (555) 012-3456",
    dateOfBirth: "1981-08-19",
    gender: "Male",
    address: "741 Poplar St, Phoenix, AZ 85001",
    pushToken: null,
    createdAt: new Date("2024-03-15"),
    updatedAt: new Date("2024-03-15")
  },
  {
    id: "patient-10",
    email: "anna.martinez@example.com",
    firstName: "Anna",
    lastName: "Martinez",
    profileImageUrl: "",
    role: "patient",
    phone: "+1 (555) 123-4567",
    dateOfBirth: "1992-04-08",
    gender: "Female",
    address: "852 Ash Blvd, San Francisco, CA 94101",
    pushToken: null,
    createdAt: new Date("2024-04-10"),
    updatedAt: new Date("2024-04-10")
  },
  // Doctor users across all specialties
  {
    id: "doctor-1-user",
    email: "dr.sarah.smith@hospital.com",
    firstName: "Sarah",
    lastName: "Smith",
    profileImageUrl: "",
    role: "doctor",
    phone: "+1 (555) 111-2222",
    dateOfBirth: "1975-08-20",
    gender: "Female",
    address: "123 Hospital Dr, Medical City, MC 12345",
    pushToken: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "doctor-2-user",
    email: "dr.michael.johnson@hospital.com",
    firstName: "Michael",
    lastName: "Johnson",
    profileImageUrl: "",
    role: "doctor",
    phone: "+1 (555) 333-4444",
    dateOfBirth: "1970-05-15",
    gender: "Male",
    address: "456 Clinic Ave, Health Town, HT 67890",
    pushToken: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "doctor-3-user",
    email: "dr.emily.brown@hospital.com",
    firstName: "Emily",
    lastName: "Brown",
    profileImageUrl: "",
    role: "doctor",
    phone: "+1 (555) 555-6666",
    dateOfBirth: "1978-12-03",
    gender: "Female",
    address: "789 Medical Plaza, Wellness City, WC 54321",
    pushToken: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "doctor-4-user",
    email: "dr.robert.wilson@hospital.com",
    firstName: "Robert",
    lastName: "Wilson",
    profileImageUrl: "",
    role: "doctor",
    phone: "+1 (555) 777-8888",
    dateOfBirth: "1968-11-12",
    gender: "Male",
    address: "321 Health Center, Care City, CC 45678",
    pushToken: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "doctor-5-user",
    email: "dr.lisa.davis@hospital.com",
    firstName: "Lisa",
    lastName: "Davis",
    profileImageUrl: "",
    role: "doctor",
    phone: "+1 (555) 999-0000",
    dateOfBirth: "1973-04-25",
    gender: "Female",
    address: "654 Wellness Blvd, Healthy Town, HT 78901",
    pushToken: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "doctor-6-user",
    email: "dr.david.miller@hospital.com",
    firstName: "David",
    lastName: "Miller",
    profileImageUrl: "",
    role: "doctor",
    phone: "+1 (555) 222-3333",
    dateOfBirth: "1965-07-08",
    gender: "Male",
    address: "987 Medical Park, Doctor City, DC 23456",
    pushToken: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "doctor-7-user",
    email: "dr.jennifer.garcia@hospital.com",
    firstName: "Jennifer",
    lastName: "Garcia",
    profileImageUrl: "",
    role: "doctor",
    phone: "+1 (555) 444-5555",
    dateOfBirth: "1977-02-14",
    gender: "Female",
    address: "147 Care Lane, Healing City, HC 34567",
    pushToken: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "doctor-8-user",
    email: "dr.mark.anderson@hospital.com",
    firstName: "Mark",
    lastName: "Anderson",
    profileImageUrl: "",
    role: "doctor",
    phone: "+1 (555) 666-7777",
    dateOfBirth: "1971-09-30",
    gender: "Male",
    address: "258 Therapy St, Recovery Town, RT 56789",
    pushToken: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "doctor-9-user",
    email: "dr.amanda.martinez@hospital.com",
    firstName: "Amanda",
    lastName: "Martinez",
    profileImageUrl: "",
    role: "doctor",
    phone: "+1 (555) 888-9999",
    dateOfBirth: "1980-12-05",
    gender: "Female",
    address: "369 Vision Ave, Eye City, EC 67890",
    pushToken: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "doctor-10-user",
    email: "dr.chris.taylor@hospital.com",
    firstName: "Chris",
    lastName: "Taylor",
    profileImageUrl: "",
    role: "doctor",
    phone: "+1 (555) 000-1111",
    dateOfBirth: "1974-06-18",
    gender: "Male",
    address: "741 Hormone St, Balance City, BC 78901",
    pushToken: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  }
];

export const mockDoctors: Doctor[] = [
  {
    id: 1,
    userId: "dev-doctor",
    departmentId: 1,
    specialty: "General Medicine",
    qualification: "MD",
    experience: 10,
    consultationFee: "500.00",
    bio: "Experienced general physician with over 10 years of practice",
    isAvailable: true,
    createdAt: new Date("2024-01-01")
  },
  {
    id: 2,
    userId: "doctor-1-user",
    departmentId: 1,
    specialty: "Cardiology",
    qualification: "MD, FACC",
    experience: 15,
    consultationFee: "800.00",
    bio: "Board-certified cardiologist specializing in heart disease prevention and treatment",
    isAvailable: true,
    createdAt: new Date("2024-01-01")
  },
  {
    id: 3,
    userId: "doctor-2-user",
    departmentId: 5,
    specialty: "Orthopedic Surgery",
    qualification: "MD, MS Ortho",
    experience: 12,
    consultationFee: "900.00",
    bio: "Specialized in joint replacements and sports medicine",
    isAvailable: true,
    createdAt: new Date("2024-01-01")
  },
  {
    id: 4,
    userId: "doctor-3-user",
    departmentId: 2,
    specialty: "Dermatology",
    qualification: "MD, FAAD",
    experience: 8,
    consultationFee: "600.00",
    bio: "Expert in skin disorders and cosmetic dermatology",
    isAvailable: true,
    createdAt: new Date("2024-01-01")
  },
  {
    id: 5,
    userId: "doctor-4-user",
    departmentId: 3,
    specialty: "Pediatrics",
    qualification: "MD, FAAP",
    experience: 18,
    consultationFee: "450.00",
    bio: "Dedicated pediatrician specializing in child development and preventive care",
    isAvailable: true,
    createdAt: new Date("2024-01-01")
  },
  {
    id: 6,
    userId: "doctor-5-user",
    departmentId: 4,
    specialty: "Neurology",
    qualification: "MD, PhD",
    experience: 15,
    consultationFee: "750.00",
    bio: "Neurologist with expertise in neurodegenerative diseases and epilepsy",
    isAvailable: true,
    createdAt: new Date("2024-01-01")
  },
  {
    id: 7,
    userId: "doctor-6-user",
    departmentId: 6,
    specialty: "Gynecology",
    qualification: "MD, FACOG",
    experience: 22,
    consultationFee: "550.00",
    bio: "Board-certified gynecologist with focus on women's health and wellness",
    isAvailable: true,
    createdAt: new Date("2024-01-01")
  },
  {
    id: 8,
    userId: "doctor-7-user",
    departmentId: 7,
    specialty: "Ophthalmology",
    qualification: "MD, FACS",
    experience: 12,
    consultationFee: "650.00",
    bio: "Ophthalmologist specializing in cataract surgery and glaucoma treatment",
    isAvailable: true,
    createdAt: new Date("2024-01-01")
  },
  {
    id: 9,
    userId: "doctor-8-user",
    departmentId: 8,
    specialty: "Psychiatry",
    qualification: "MD, DLFAPA",
    experience: 16,
    consultationFee: "500.00",
    bio: "Psychiatrist providing comprehensive mental health care and therapy",
    isAvailable: true,
    createdAt: new Date("2024-01-01")
  },
  {
    id: 10,
    userId: "doctor-9-user",
    departmentId: 9,
    specialty: "Urology",
    qualification: "MD, FACS",
    experience: 14,
    consultationFee: "700.00",
    bio: "Urologist specializing in minimally invasive procedures and kidney stones",
    isAvailable: true,
    createdAt: new Date("2024-01-01")
  },
  {
    id: 11,
    userId: "doctor-10-user",
    departmentId: 10,
    specialty: "Endocrinology",
    qualification: "MD, FACE",
    experience: 19,
    consultationFee: "625.00",
    bio: "Endocrinologist managing diabetes, thyroid disorders, and hormonal imbalances",
    isAvailable: true,
    createdAt: new Date("2024-01-01")
  }
];

export const mockMedicines: Medicine[] = [
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
  },
  {
    id: 6,
    name: "Amoxicillin",
    genericName: "Amoxicillin",
    description: "Broad-spectrum antibiotic",
    category: "Antibiotic",
    manufacturer: "Various",
    dosageForm: "capsule",
    strength: "250mg, 500mg",
    createdAt: new Date("2024-01-01")
  },
  {
    id: 7,
    name: "Omeprazole",
    genericName: "Omeprazole",
    description: "Proton pump inhibitor for acid reflux",
    category: "Gastrointestinal",
    manufacturer: "Various",
    dosageForm: "capsule",
    strength: "20mg, 40mg",
    createdAt: new Date("2024-01-01")
  },
  {
    id: 8,
    name: "Simvastatin",
    genericName: "Simvastatin",
    description: "Statin for cholesterol management",
    category: "Cardiovascular",
    manufacturer: "Various",
    dosageForm: "tablet",
    strength: "10mg, 20mg, 40mg",
    createdAt: new Date("2024-01-01")
  },
  {
    id: 9,
    name: "Levothyroxine",
    genericName: "Levothyroxine",
    description: "Thyroid hormone replacement",
    category: "Endocrine",
    manufacturer: "Various",
    dosageForm: "tablet",
    strength: "25mcg, 50mcg, 75mcg, 100mcg",
    createdAt: new Date("2024-01-01")
  },
  {
    id: 10,
    name: "Albuterol",
    genericName: "Albuterol",
    description: "Bronchodilator for asthma",
    category: "Respiratory",
    manufacturer: "Various",
    dosageForm: "inhaler",
    strength: "90mcg/actuation",
    createdAt: new Date("2024-01-01")
  },
  {
    id: 11,
    name: "Prednisone",
    genericName: "Prednisone",
    description: "Corticosteroid for inflammation",
    category: "Anti-inflammatory",
    manufacturer: "Various",
    dosageForm: "tablet",
    strength: "5mg, 10mg, 20mg",
    createdAt: new Date("2024-01-01")
  },
  {
    id: 12,
    name: "Warfarin",
    genericName: "Warfarin",
    description: "Anticoagulant for blood clot prevention",
    category: "Cardiovascular",
    manufacturer: "Various",
    dosageForm: "tablet",
    strength: "1mg, 2mg, 5mg",
    createdAt: new Date("2024-01-01")
  },
  {
    id: 13,
    name: "Gabapentin",
    genericName: "Gabapentin",
    description: "Anticonvulsant for nerve pain",
    category: "Neurological",
    manufacturer: "Various",
    dosageForm: "capsule",
    strength: "100mg, 300mg, 400mg",
    createdAt: new Date("2024-01-01")
  },
  {
    id: 14,
    name: "Citalopram",
    genericName: "Citalopram",
    description: "SSRI antidepressant",
    category: "Psychiatric",
    manufacturer: "Various",
    dosageForm: "tablet",
    strength: "10mg, 20mg, 40mg",
    createdAt: new Date("2024-01-01")
  },
  {
    id: 15,
    name: "Furosemide",
    genericName: "Furosemide",
    description: "Diuretic for fluid retention",
    category: "Cardiovascular",
    manufacturer: "Various",
    dosageForm: "tablet",
    strength: "20mg, 40mg",
    createdAt: new Date("2024-01-01")
  }
];

export const mockAppointments: Appointment[] = [
  // Dev user appointments
  {
    id: 1,
    patientId: "dev-user",
    doctorId: 1,
    appointmentDate: "2024-12-15",
    appointmentTime: "10:00",
    reason: "Regular checkup",
    status: "completed",
    notes: "Patient reports feeling well. Blood pressure normal.",
    queuePosition: null,
    estimatedWaitTime: null,
    checkInTime: null,
    startedAt: new Date("2024-12-15T10:00:00"),
    completedAt: new Date("2024-12-15T10:30:00"),
    createdAt: new Date("2024-12-10"),
    updatedAt: new Date("2024-12-15")
  },
  {
    id: 2,
    patientId: "dev-user",
    doctorId: 2,
    appointmentDate: "2025-01-10",
    appointmentTime: "14:30",
    reason: "Cardiac consultation",
    status: "confirmed",
    notes: "Follow-up for hypertension management",
    queuePosition: null,
    estimatedWaitTime: null,
    checkInTime: null,
    startedAt: null,
    completedAt: null,
    createdAt: new Date("2024-12-20"),
    updatedAt: new Date("2024-12-20")
  },
  {
    id: 3,
    patientId: "dev-user",
    doctorId: 1,
    appointmentDate: "2025-02-05",
    appointmentTime: "09:00",
    reason: "Annual physical",
    status: "pending",
    notes: "Routine annual examination",
    queuePosition: null,
    estimatedWaitTime: null,
    checkInTime: null,
    startedAt: null,
    completedAt: null,
    createdAt: new Date("2024-12-25"),
    updatedAt: new Date("2024-12-25")
  },
  // Other patient appointments
  {
    id: 4,
    patientId: "patient-1",
    doctorId: 1,
    appointmentDate: "2024-12-20",
    appointmentTime: "11:00",
    reason: "Follow-up consultation",
    status: "confirmed",
    notes: "Checking medication effectiveness",
    queuePosition: null,
    estimatedWaitTime: null,
    checkInTime: null,
    startedAt: null,
    completedAt: null,
    createdAt: new Date("2024-12-15"),
    updatedAt: new Date("2024-12-15")
  },
  {
    id: 5,
    patientId: "patient-2",
    doctorId: 3,
    appointmentDate: "2024-12-18",
    appointmentTime: "15:00",
    reason: "Knee pain evaluation",
    status: "completed",
    notes: "Patient experiencing knee pain after sports injury",
    queuePosition: null,
    estimatedWaitTime: null,
    checkInTime: null,
    startedAt: new Date("2024-12-18T15:00:00"),
    completedAt: new Date("2024-12-18T15:45:00"),
    createdAt: new Date("2024-12-12"),
    updatedAt: new Date("2024-12-18")
  },
  {
    id: 6,
    patientId: "patient-3",
    doctorId: 4,
    appointmentDate: "2025-01-15",
    appointmentTime: "10:30",
    reason: "Skin rash consultation",
    status: "confirmed",
    notes: "Persistent skin rash on arms and legs",
    queuePosition: null,
    estimatedWaitTime: null,
    checkInTime: null,
    startedAt: null,
    completedAt: null,
    createdAt: new Date("2024-12-22"),
    updatedAt: new Date("2024-12-22")
  },
  {
    id: 7,
    patientId: "patient-4",
    doctorId: 5,
    appointmentDate: "2024-12-16",
    appointmentTime: "09:00",
    reason: "Child wellness check",
    status: "completed",
    notes: "6-month checkup - growth and development normal",
    queuePosition: null,
    estimatedWaitTime: null,
    checkInTime: null,
    startedAt: new Date("2024-12-16T09:00:00"),
    completedAt: new Date("2024-12-16T09:30:00"),
    createdAt: new Date("2024-12-10"),
    updatedAt: new Date("2024-12-16")
  },
  {
    id: 8,
    patientId: "patient-5",
    doctorId: 6,
    appointmentDate: "2024-12-17",
    appointmentTime: "14:00",
    reason: "Migraine consultation",
    status: "completed",
    notes: "Chronic migraine - prescribed preventive medication",
    queuePosition: null,
    estimatedWaitTime: null,
    checkInTime: null,
    startedAt: new Date("2024-12-17T14:00:00"),
    completedAt: new Date("2024-12-17T14:45:00"),
    createdAt: new Date("2024-12-12"),
    updatedAt: new Date("2024-12-17")
  },
  {
    id: 9,
    patientId: "patient-6",
    doctorId: 7,
    appointmentDate: "2024-12-19",
    appointmentTime: "11:15",
    reason: "Annual gynecological exam",
    status: "confirmed",
    notes: "Routine annual examination and Pap smear",
    queuePosition: null,
    estimatedWaitTime: null,
    checkInTime: null,
    startedAt: null,
    completedAt: null,
    createdAt: new Date("2024-12-14"),
    updatedAt: new Date("2024-12-14")
  },
  {
    id: 10,
    patientId: "patient-7",
    doctorId: 8,
    appointmentDate: "2024-12-21",
    appointmentTime: "16:00",
    reason: "Eye examination",
    status: "confirmed",
    notes: "Comprehensive eye exam and vision screening",
    queuePosition: null,
    estimatedWaitTime: null,
    checkInTime: null,
    startedAt: null,
    completedAt: null,
    createdAt: new Date("2024-12-16"),
    updatedAt: new Date("2024-12-16")
  },
  {
    id: 11,
    patientId: "patient-8",
    doctorId: 9,
    appointmentDate: "2025-01-05",
    appointmentTime: "13:30",
    reason: "Therapy session",
    status: "confirmed",
    notes: "Follow-up therapy session for anxiety management",
    queuePosition: null,
    estimatedWaitTime: null,
    checkInTime: null,
    startedAt: null,
    completedAt: null,
    createdAt: new Date("2024-12-20"),
    updatedAt: new Date("2024-12-20")
  },
  {
    id: 12,
    patientId: "patient-9",
    doctorId: 10,
    appointmentDate: "2025-01-08",
    appointmentTime: "10:00",
    reason: "Kidney stone evaluation",
    status: "confirmed",
    notes: "Evaluation of recurrent kidney stones",
    queuePosition: null,
    estimatedWaitTime: null,
    checkInTime: null,
    startedAt: null,
    completedAt: null,
    createdAt: new Date("2024-12-25"),
    updatedAt: new Date("2024-12-25")
  },
  {
    id: 13,
    patientId: "patient-10",
    doctorId: 11,
    appointmentDate: "2025-01-12",
    appointmentTime: "15:00",
    reason: "Thyroid function follow-up",
    status: "pending",
    notes: "Monitoring thyroid hormone levels post-treatment",
    queuePosition: null,
    estimatedWaitTime: null,
    checkInTime: null,
    startedAt: null,
    completedAt: null,
    createdAt: new Date("2024-12-28"),
    updatedAt: new Date("2024-12-28")
  },
  {
    id: 14,
    patientId: "patient-1",
    doctorId: 1,
    appointmentDate: "2025-02-01",
    appointmentTime: "08:30",
    reason: "Diabetes management",
    status: "pending",
    notes: "Quarterly diabetes checkup and medication adjustment",
    queuePosition: null,
    estimatedWaitTime: null,
    checkInTime: null,
    startedAt: null,
    completedAt: null,
    createdAt: new Date("2025-01-15"),
    updatedAt: new Date("2025-01-15")
  },
  {
    id: 15,
    patientId: "patient-2",
    doctorId: 3,
    appointmentDate: "2025-02-10",
    appointmentTime: "11:00",
    reason: "Physical therapy follow-up",
    status: "pending",
    notes: "Progress evaluation after knee surgery",
    queuePosition: null,
    estimatedWaitTime: null,
    checkInTime: null,
    startedAt: null,
    completedAt: null,
    createdAt: new Date("2025-01-20"),
    updatedAt: new Date("2025-01-20")
  },
  // Test appointment for today to verify doctor dashboard
  {
    id: 16,
    patientId: "dev-user",
    doctorId: 1,
    appointmentDate: "2025-12-29",
    appointmentTime: "10:00:00",
    reason: "Test appointment for dashboard",
    status: "confirmed",
    notes: "Testing doctor dashboard appointment display",
    queuePosition: null,
    estimatedWaitTime: null,
    checkInTime: null,
    startedAt: null,
    completedAt: null,
    createdAt: new Date("2025-12-28"),
    updatedAt: new Date("2025-12-28")
  },
  // January 1st appointment for prescription testing
  {
    id: 17,
    patientId: "dev-user",
    doctorId: 1,
    appointmentDate: "2025-01-01",
    appointmentTime: "11:00",
    reason: "New Year checkup",
    status: "completed",
    notes: "Annual checkup and prescription renewal",
    queuePosition: null,
    estimatedWaitTime: null,
    checkInTime: null,
    startedAt: new Date("2025-01-01T11:00:00"),
    completedAt: new Date("2025-01-01T11:30:00"),
    createdAt: new Date("2024-12-30"),
    updatedAt: new Date("2025-01-01")
  }
];

export const mockPrescriptions: Prescription[] = [
  {
    id: 1,
    patientId: "dev-user",
    doctorId: 1,
    diagnosis: "Hypertension",
    notes: "Patient to monitor blood pressure daily",
    appointmentId: 1,
    createdAt: new Date("2024-12-15")
  },
  {
    id: 2,
    patientId: "patient-2",
    doctorId: 3,
    diagnosis: "Knee sprain",
    notes: "Rest and ice for first 48 hours",
    appointmentId: 5,
    createdAt: new Date("2024-12-18")
  },
  {
    id: 3,
    patientId: "patient-4",
    doctorId: 5,
    diagnosis: "Well child visit",
    notes: "Developmental milestones met, vaccinations up to date",
    appointmentId: 7,
    createdAt: new Date("2024-12-16")
  },
  {
    id: 4,
    patientId: "patient-5",
    doctorId: 6,
    diagnosis: "Chronic migraine",
    notes: "Initiating prophylactic therapy",
    appointmentId: 8,
    createdAt: new Date("2024-12-17")
  },
  {
    id: 5,
    patientId: "patient-6",
    doctorId: 7,
    diagnosis: "Routine gynecological exam",
    notes: "Normal findings, Pap smear ordered",
    appointmentId: 9,
    createdAt: new Date("2024-12-19")
  },
  {
    id: 6,
    patientId: "patient-7",
    doctorId: 8,
    diagnosis: "Cataract evaluation",
    notes: "Early cataracts detected, monitoring recommended",
    appointmentId: 10,
    createdAt: new Date("2024-12-21")
  },
  {
    id: 7,
    patientId: "patient-8",
    doctorId: 9,
    diagnosis: "Generalized anxiety disorder",
    notes: "Starting cognitive behavioral therapy",
    appointmentId: 11,
    createdAt: new Date("2025-01-05")
  },
  {
    id: 8,
    patientId: "patient-9",
    doctorId: 10,
    diagnosis: "Nephrolithiasis",
    notes: "Kidney stone disease, dietary modifications recommended",
    appointmentId: 12,
    createdAt: new Date("2025-01-08")
  },
  {
    id: 9,
    patientId: "patient-10",
    doctorId: 11,
    diagnosis: "Hypothyroidism",
    notes: "Initiating thyroid hormone replacement therapy",
    appointmentId: 13,
    createdAt: new Date("2025-01-12")
  },
  {
    id: 10,
    patientId: "dev-user",
    doctorId: 1,
    diagnosis: "Hypertension follow-up",
    notes: "Blood pressure medication renewal",
    appointmentId: 17,
    createdAt: new Date("2025-01-01")
  }
];

export const mockPrescriptionItems: PrescriptionItem[] = [
  {
    id: 1,
    prescriptionId: 1,
    medicineId: 1,
    dosage: "10mg",
    frequency: "Once daily",
    duration: "30 days",
    instructions: "Take with food in the morning"
  },
  {
    id: 2,
    prescriptionId: 1,
    medicineId: 2,
    dosage: "20mg",
    frequency: "Once daily",
    duration: "30 days",
    instructions: "Take at bedtime"
  },
  {
    id: 3,
    prescriptionId: 2,
    medicineId: 5,
    dosage: "400mg",
    frequency: "Every 6 hours as needed",
    duration: "7 days",
    instructions: "Take with food, not to exceed 2400mg per day"
  },
  {
    id: 4,
    prescriptionId: 3,
    medicineId: 1,
    dosage: "81mg",
    frequency: "Once daily",
    duration: "Ongoing",
    instructions: "Take with breakfast for cardiovascular protection"
  },
  {
    id: 5,
    prescriptionId: 4,
    medicineId: 13,
    dosage: "100mg",
    frequency: "Three times daily",
    duration: "30 days",
    instructions: "Take with meals, may cause drowsiness"
  },
  {
    id: 6,
    prescriptionId: 5,
    medicineId: 6,
    dosage: "500mg",
    frequency: "Three times daily",
    duration: "10 days",
    instructions: "Take with food, complete full course"
  },
  {
    id: 7,
    prescriptionId: 6,
    medicineId: 1,
    dosage: "81mg",
    frequency: "Once daily",
    duration: "Ongoing",
    instructions: "Take with breakfast"
  },
  {
    id: 8,
    prescriptionId: 7,
    medicineId: 14,
    dosage: "20mg",
    frequency: "Once daily",
    duration: "30 days",
    instructions: "Take in morning, may take 2-4 weeks for full effect"
  },
  {
    id: 9,
    prescriptionId: 8,
    medicineId: 15,
    dosage: "20mg",
    frequency: "Once daily",
    duration: "Ongoing",
    instructions: "Take in morning, monitor blood pressure"
  },
  {
    id: 10,
    prescriptionId: 9,
    medicineId: 9,
    dosage: "50mcg",
    frequency: "Once daily",
    duration: "Ongoing",
    instructions: "Take on empty stomach, monitor thyroid levels"
  },
  {
    id: 11,
    prescriptionId: 10,
    medicineId: 2,
    dosage: "10mg",
    frequency: "Once daily",
    duration: "90 days",
    instructions: "Take with food in the morning, monitor blood pressure"
  },
  {
    id: 12,
    prescriptionId: 10,
    medicineId: 1,
    dosage: "81mg",
    frequency: "Once daily",
    duration: "90 days",
    instructions: "Take with breakfast for cardiovascular protection"
  }
];

export const mockVitals: Vital[] = [
  {
    id: 1,
    patientId: "dev-user",
    type: "bp",
    value: "140/90",
    unit: "mmHg",
    recordedAt: new Date("2024-12-15T10:00:00"),
    notes: "Taken during routine checkup"
  },
  {
    id: 2,
    patientId: "dev-user",
    type: "heart_rate",
    value: "72",
    unit: "bpm",
    recordedAt: new Date("2024-12-15T10:00:00"),
    notes: "Taken during routine checkup"
  },
  {
    id: 3,
    patientId: "dev-user",
    type: "weight",
    value: "180",
    unit: "lbs",
    recordedAt: new Date("2024-12-15T10:00:00"),
    notes: "Taken during routine checkup"
  },
  {
    id: 4,
    patientId: "dev-user",
    type: "bp",
    value: "135/85",
    unit: "mmHg",
    recordedAt: new Date("2024-12-20T14:30:00"),
    notes: "Follow-up measurement"
  },
  {
    id: 5,
    patientId: "patient-1",
    type: "bp",
    value: "120/80",
    unit: "mmHg",
    recordedAt: new Date("2024-12-18T11:00:00"),
    notes: "Pre-operative vitals"
  },
  {
    id: 6,
    patientId: "patient-4",
    type: "weight",
    value: "35",
    unit: "lbs",
    recordedAt: new Date("2024-12-16T09:00:00"),
    notes: "6-month well child visit"
  },
  {
    id: 8,
    patientId: "patient-5",
    type: "bp",
    value: "118/76",
    unit: "mmHg",
    recordedAt: new Date("2024-12-17T14:00:00"),
    notes: "Neurology consultation"
  },
  {
    id: 9,
    patientId: "patient-6",
    type: "temperature",
    value: "98.6",
    unit: "°F",
    recordedAt: new Date("2024-12-19T11:15:00"),
    notes: "Gynecology exam"
  },
  {
    id: 10,
    patientId: "patient-7",
    type: "glucose",
    value: "95",
    unit: "mg/dL",
    recordedAt: new Date("2024-12-21T16:00:00"),
    notes: "Fasting blood glucose"
  },
  {
    id: 11,
    patientId: "patient-8",
    type: "heart_rate",
    value: "78",
    unit: "bpm",
    recordedAt: new Date("2025-01-05T13:30:00"),
    notes: "Therapy session vitals"
  },
  {
    id: 12,
    patientId: "patient-9",
    type: "bp",
    value: "142/88",
    unit: "mmHg",
    recordedAt: new Date("2025-01-08T10:00:00"),
    notes: "Urology consultation"
  },
  {
    id: 13,
    patientId: "patient-10",
    type: "weight",
    value: "145",
    unit: "lbs",
    recordedAt: new Date("2025-01-12T15:00:00"),
    notes: "Endocrinology follow-up"
  },
  {
    id: 14,
    patientId: "patient-10",
    type: "bmi",
    value: "22.1",
    unit: "kg/m²",
    recordedAt: new Date("2025-01-12T15:00:00"),
    notes: "Calculated BMI"
  }
];

export const mockAllergies: Allergy[] = [
  {
    id: 1,
    patientId: "dev-user",
    type: "medicine",
    allergen: "Penicillin",
    severity: "severe",
    reaction: "Anaphylaxis",
    createdAt: new Date("2024-01-01")
  },
  {
    id: 2,
    patientId: "dev-user",
    type: "food",
    allergen: "Shellfish",
    severity: "moderate",
    reaction: "Hives, nausea",
    createdAt: new Date("2024-01-01")
  },
  {
    id: 3,
    patientId: "patient-2",
    type: "other",
    allergen: "Latex",
    severity: "mild",
    reaction: "Contact dermatitis",
    createdAt: new Date("2024-02-15")
  },
  {
    id: 4,
    patientId: "patient-4",
    type: "food",
    allergen: "Peanuts",
    severity: "severe",
    reaction: "Anaphylaxis",
    createdAt: new Date("2024-01-15")
  },
  {
    id: 5,
    patientId: "patient-5",
    type: "medicine",
    allergen: "Codeine",
    severity: "moderate",
    reaction: "Nausea, vomiting",
    createdAt: new Date("2024-03-10")
  },
  {
    id: 6,
    patientId: "patient-6",
    type: "other",
    allergen: "Dust mites",
    severity: "moderate",
    reaction: "Allergic rhinitis",
    createdAt: new Date("2024-02-20")
  },
  {
    id: 7,
    patientId: "patient-7",
    type: "food",
    allergen: "Shellfish",
    severity: "severe",
    reaction: "Anaphylactic shock",
    createdAt: new Date("2024-01-05")
  },
  {
    id: 8,
    patientId: "patient-8",
    type: "medicine",
    allergen: "Sulfa drugs",
    severity: "moderate",
    reaction: "Skin rash, fever",
    createdAt: new Date("2024-04-01")
  },
  {
    id: 9,
    patientId: "patient-9",
    type: "other",
    allergen: "Pollen",
    severity: "mild",
    reaction: "Seasonal allergies",
    createdAt: new Date("2024-03-15")
  },
  {
    id: 10,
    patientId: "patient-10",
    type: "food",
    allergen: "Dairy",
    severity: "moderate",
    reaction: "Lactose intolerance",
    createdAt: new Date("2024-04-10")
  }
];

export const mockFamilyMembers: FamilyMember[] = [
  {
    id: 1,
    primaryUserId: "dev-user",
    memberId: "family-member-1",
    relationship: "Spouse",
    createdAt: new Date("2024-01-01")
  },
  {
    id: 2,
    primaryUserId: "dev-user",
    memberId: "family-member-2",
    relationship: "Child",
    createdAt: new Date("2024-01-01")
  },
  {
    id: 3,
    primaryUserId: "patient-1",
    memberId: "family-member-3",
    relationship: "Spouse",
    createdAt: new Date("2024-02-01")
  }
];

export const mockDocuments: Document[] = [
  {
    id: 1,
    patientId: "dev-user",
    title: "Blood Test Results - Dec 2024",
    type: "lab_report",
    description: "Complete blood count and metabolic panel",
    fileUrl: "/documents/blood-test-2024-12.pdf",
    uploadedBy: "dev-doctor",
    appointmentId: 1,
    createdAt: new Date("2024-12-15")
  },
  {
    id: 2,
    patientId: "dev-user",
    title: "ECG Report",
    type: "other",
    description: "Electrocardiogram results from cardiac consultation",
    fileUrl: "/documents/ecg-report-2024-12.pdf",
    uploadedBy: "doctor-1-user",
    appointmentId: 2,
    createdAt: new Date("2024-12-20")
  },
  {
    id: 3,
    patientId: "patient-2",
    title: "X-Ray Report - Left Knee",
    type: "radiology",
    description: "X-ray imaging of left knee joint",
    fileUrl: "/documents/knee-xray-2024-12.pdf",
    uploadedBy: "doctor-2-user",
    appointmentId: 5,
    createdAt: new Date("2024-12-18")
  }
];

export const mockBills: Bill[] = [
  // Dev user bills
  {
    id: 1,
    patientId: "dev-user",
    appointmentId: 1,
    amount: "150.00",
    description: "General consultation and blood pressure check",
    status: "paid",
    paymentMethod: "credit_card",
    paidAt: new Date("2025-12-16"),
    createdAt: new Date("2025-12-15")
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
    createdAt: new Date("2025-12-20")
  },
  {
    id: 3,
    patientId: "dev-user",
    appointmentId: null,
    amount: "75.00",
    description: "Follow-up medication consultation",
    status: "paid",
    paymentMethod: "cash",
    paidAt: new Date("2025-12-10"),
    createdAt: new Date("2025-12-08")
  },
  {
    id: 4,
    patientId: "dev-user",
    appointmentId: null,
    amount: "200.00",
    description: "Laboratory tests - Complete blood count",
    status: "paid",
    paymentMethod: "upi",
    paidAt: new Date("2025-12-05"),
    createdAt: new Date("2025-12-03")
  },
  {
    id: 5,
    patientId: "dev-user",
    appointmentId: null,
    amount: "350.00",
    description: "MRI scan - Brain",
    status: "pending",
    paymentMethod: null,
    paidAt: null,
    createdAt: new Date("2025-12-22")
  },
  // Patient 1 bills
  {
    id: 6,
    patientId: "patient-1",
    appointmentId: 4,
    amount: "180.00",
    description: "Internal medicine consultation",
    status: "paid",
    paymentMethod: "credit_card",
    paidAt: new Date("2025-12-21"),
    createdAt: new Date("2025-12-20")
  },
  {
    id: 7,
    patientId: "patient-1",
    appointmentId: null,
    amount: "120.00",
    description: "Dental cleaning and checkup",
    status: "paid",
    paymentMethod: "cash",
    paidAt: new Date("2025-12-15"),
    createdAt: new Date("2025-12-12")
  },
  {
    id: 8,
    patientId: "patient-1",
    appointmentId: null,
    amount: "95.00",
    description: "Physical therapy session",
    status: "pending",
    paymentMethod: null,
    paidAt: null,
    createdAt: new Date("2025-12-18")
  },
  // Patient 2 bills
  {
    id: 9,
    patientId: "patient-2",
    appointmentId: 5,
    amount: "450.00",
    description: "Orthopedic consultation and knee X-ray",
    status: "paid",
    paymentMethod: "insurance",
    paidAt: new Date("2025-12-19"),
    createdAt: new Date("2025-12-18")
  },
  {
    id: 10,
    patientId: "patient-2",
    appointmentId: null,
    amount: "280.00",
    description: "Sports medicine consultation",
    status: "paid",
    paymentMethod: "wallet",
    paidAt: new Date("2025-12-01"),
    createdAt: new Date("2025-11-28")
  },
  {
    id: 11,
    patientId: "patient-2",
    appointmentId: null,
    amount: "150.00",
    description: "Rehabilitation therapy",
    status: "paid",
    paymentMethod: "upi",
    paidAt: new Date("2025-12-20"),
    createdAt: new Date("2025-12-18")
  },
  // Patient 3 bills
  {
    id: 12,
    patientId: "patient-3",
    appointmentId: 6,
    amount: "220.00",
    description: "Dermatology consultation and skin biopsy",
    status: "paid",
    paymentMethod: "credit_card",
    paidAt: new Date("2025-12-16"),
    createdAt: new Date("2025-12-15")
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
    createdAt: new Date("2025-12-10")
  },
  {
    id: 14,
    patientId: "patient-3",
    appointmentId: null,
    amount: "175.00",
    description: "Immunotherapy treatment",
    status: "paid",
    paymentMethod: "cash",
    paidAt: new Date("2025-12-15"),
    createdAt: new Date("2025-12-12")
  },
  // Additional bills for better financial data
  {
    id: 15,
    patientId: "dev-user",
    appointmentId: null,
    amount: "425.00",
    description: "Emergency room visit",
    status: "paid",
    paymentMethod: "credit_card",
    paidAt: new Date("2025-12-01"),
    createdAt: new Date("2025-12-01")
  },
  {
    id: 16,
    patientId: "patient-1",
    appointmentId: null,
    amount: "320.00",
    description: "Colonoscopy procedure",
    status: "paid",
    paymentMethod: "insurance",
    paidAt: new Date("2025-12-02"),
    createdAt: new Date("2025-11-28")
  },
  {
    id: 17,
    patientId: "patient-2",
    appointmentId: null,
    amount: "195.00",
    description: "Physical therapy - 6 sessions",
    status: "paid",
    paymentMethod: "upi",
    paidAt: new Date("2025-12-08"),
    createdAt: new Date("2025-12-01")
  },
  {
    id: 18,
    patientId: "patient-3",
    appointmentId: null,
    amount: "145.00",
    description: "Vaccination series",
    status: "paid",
    paymentMethod: "wallet",
    paidAt: new Date("2025-12-05"),
    createdAt: new Date("2025-12-01")
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
    createdAt: new Date("2025-12-17")
  },
  {
    id: 20,
    patientId: "patient-1",
    appointmentId: null,
    amount: "90.00",
    description: "Nutrition counseling",
    status: "paid",
    paymentMethod: "cash",
    paidAt: new Date("2025-12-12"),
    createdAt: new Date("2025-12-10")
  }
];

export const mockFavorites: Favorite[] = [
  {
    id: 1,
    patientId: "dev-user",
    doctorId: 2,
    createdAt: new Date("2024-12-01")
  },
  {
    id: 2,
    patientId: "dev-user",
    doctorId: 4,
    createdAt: new Date("2024-12-05")
  },
  {
    id: 3,
    patientId: "patient-1",
    doctorId: 1,
    createdAt: new Date("2024-12-10")
  }
];

export const mockNotifications: Notification[] = [
  {
    id: 1,
    userId: "dev-user",
    title: "Appointment Reminder",
    message: "You have an appointment with Dr. Sarah Smith tomorrow at 2:30 PM",
    type: "appointment_reminder",
    priority: "high",
    isRead: false,
    data: { appointmentId: 2 },
    createdAt: new Date("2024-12-19T10:00:00")
  },
  {
    id: 2,
    userId: "dev-user",
    title: "Prescription Ready",
    message: "Your prescription from Dr. Dev User is now available for pickup",
    type: "prescription_added",
    priority: "medium",
    isRead: true,
    data: { prescriptionId: 1 },
    createdAt: new Date("2024-12-15T14:00:00")
  },
  {
    id: 3,
    userId: "dev-user",
    title: "Bill Payment Due",
    message: "Your bill for $300.00 is due on January 15, 2025",
    type: "payment_due",
    priority: "medium",
    isRead: false,
    data: { billId: 2 },
    createdAt: new Date("2024-12-20T09:00:00")
  },
  {
    id: 4,
    userId: "dev-doctor",
    title: "New Appointment Booked",
    message: "John Doe has booked an appointment for December 20, 2024 at 11:00 AM",
    type: "appointment_confirmed",
    priority: "high",
    isRead: false,
    data: { appointmentId: 4 },
    createdAt: new Date("2024-12-15T16:00:00")
  },
  {
    id: 5,
    userId: "patient-1",
    title: "Appointment Reminder",
    message: "You have an appointment with Dr. Dev User tomorrow at 11:00 AM",
    type: "appointment_reminder",
    priority: "high",
    isRead: false,
    data: { appointmentId: 4 },
    createdAt: new Date("2024-12-19T10:00:00")
  },
  {
    id: 6,
    userId: "patient-2",
    title: "Prescription Ready",
    message: "Your prescription from Dr. Michael Johnson is now available for pickup",
    type: "prescription_added",
    priority: "medium",
    isRead: true,
    data: { prescriptionId: 2 },
    createdAt: new Date("2024-12-18T14:00:00")
  },
  {
    id: 7,
    userId: "patient-4",
    title: "Vaccination Due",
    message: "Your child is due for their 6-month vaccinations",
    type: "general",
    priority: "high",
    isRead: false,
    data: { patientId: "patient-4" },
    createdAt: new Date("2024-12-10T09:00:00")
  },
  {
    id: 8,
    userId: "patient-5",
    title: "Lab Results Available",
    message: "Your blood test results are now available in your patient portal",
    type: "report_ready",
    priority: "medium",
    isRead: false,
    data: { patientId: "patient-5" },
    createdAt: new Date("2024-12-16T11:00:00")
  },
  {
    id: 9,
    userId: "doctor-5-user",
    title: "Patient Message",
    message: "New message from patient Lisa Davis regarding medication side effects",
    type: "general",
    priority: "medium",
    isRead: false,
    data: { patientId: "patient-6" },
    createdAt: new Date("2024-12-18T15:30:00")
  },
  {
    id: 10,
    userId: "patient-7",
    title: "Bill Payment Due",
    message: "Your bill for $200.00 is due on January 5, 2025",
    type: "payment_due",
    priority: "medium",
    isRead: false,
    data: { billId: 10 },
    createdAt: new Date("2024-12-20T09:00:00")
  }
];

export const mockVaccinations: Vaccination[] = [
  {
    id: 1,
    patientId: "dev-user",
    vaccineName: "COVID-19 Vaccine",
    vaccineType: "Pfizer-BioNTech",
    doseNumber: 2,
    totalDoses: 2,
    administeredDate: "2021-03-15",
    administeredBy: "CVS Pharmacy",
    nextDueDate: null,
    batchNumber: "PF123456",
    notes: "Second dose completed",
    createdAt: new Date("2021-03-15")
  },
  {
    id: 2,
    patientId: "dev-user",
    vaccineName: "Flu Vaccine",
    vaccineType: "Influenza",
    doseNumber: 1,
    totalDoses: 1,
    administeredDate: "2024-10-15",
    administeredBy: "City Hospital",
    nextDueDate: "2025-10-15",
    batchNumber: "FL789012",
    notes: "Annual flu shot",
    createdAt: new Date("2024-10-15")
  },
  {
    id: 3,
    patientId: "patient-3",
    vaccineName: "Hepatitis B",
    vaccineType: "Hepatitis B Vaccine",
    doseNumber: 3,
    totalDoses: 3,
    administeredDate: "2024-11-20",
    administeredBy: "County Health Clinic",
    nextDueDate: null,
    batchNumber: "HB345678",
    notes: "Complete vaccination series",
    createdAt: new Date("2024-11-20")
  }
];

// Doctor schedules
export const mockDoctorSchedules: any[] = [
  // Dev doctor schedule
  { id: 1, doctorId: 1, dayOfWeek: 1, startTime: "09:00", endTime: "17:00", isActive: true },
  { id: 2, doctorId: 1, dayOfWeek: 2, startTime: "09:00", endTime: "17:00", isActive: true },
  { id: 3, doctorId: 1, dayOfWeek: 3, startTime: "09:00", endTime: "17:00", isActive: true },
  { id: 4, doctorId: 1, dayOfWeek: 4, startTime: "09:00", endTime: "17:00", isActive: true },
  { id: 5, doctorId: 1, dayOfWeek: 5, startTime: "09:00", endTime: "17:00", isActive: true },
  // Cardiologist schedule
  { id: 6, doctorId: 2, dayOfWeek: 1, startTime: "08:00", endTime: "16:00", isActive: true },
  { id: 7, doctorId: 2, dayOfWeek: 2, startTime: "08:00", endTime: "16:00", isActive: true },
  { id: 8, doctorId: 2, dayOfWeek: 3, startTime: "08:00", endTime: "16:00", isActive: true },
  { id: 9, doctorId: 2, dayOfWeek: 4, startTime: "08:00", endTime: "16:00", isActive: true },
  { id: 10, doctorId: 2, dayOfWeek: 5, startTime: "08:00", endTime: "16:00", isActive: true },
  // Orthopedic surgeon schedule
  { id: 11, doctorId: 3, dayOfWeek: 1, startTime: "07:00", endTime: "15:00", isActive: true },
  { id: 12, doctorId: 3, dayOfWeek: 2, startTime: "07:00", endTime: "15:00", isActive: true },
  { id: 13, doctorId: 3, dayOfWeek: 3, startTime: "07:00", endTime: "15:00", isActive: true },
  { id: 14, doctorId: 3, dayOfWeek: 4, startTime: "07:00", endTime: "15:00", isActive: true },
  { id: 15, doctorId: 3, dayOfWeek: 5, startTime: "07:00", endTime: "15:00", isActive: true },
  // Dermatologist schedule
  { id: 16, doctorId: 4, dayOfWeek: 1, startTime: "09:00", endTime: "17:00", isActive: true },
  { id: 17, doctorId: 4, dayOfWeek: 2, startTime: "09:00", endTime: "17:00", isActive: true },
  { id: 18, doctorId: 4, dayOfWeek: 3, startTime: "09:00", endTime: "17:00", isActive: true },
  { id: 19, doctorId: 4, dayOfWeek: 4, startTime: "09:00", endTime: "17:00", isActive: true },
  { id: 20, doctorId: 4, dayOfWeek: 5, startTime: "09:00", endTime: "17:00", isActive: true },
  // Pediatrician schedule
  { id: 21, doctorId: 5, dayOfWeek: 1, startTime: "08:00", endTime: "16:00", isActive: true },
  { id: 22, doctorId: 5, dayOfWeek: 2, startTime: "08:00", endTime: "16:00", isActive: true },
  { id: 23, doctorId: 5, dayOfWeek: 3, startTime: "08:00", endTime: "16:00", isActive: true },
  { id: 24, doctorId: 5, dayOfWeek: 4, startTime: "08:00", endTime: "16:00", isActive: true },
  { id: 25, doctorId: 5, dayOfWeek: 5, startTime: "08:00", endTime: "16:00", isActive: true },
  // Neurologist schedule
  { id: 26, doctorId: 6, dayOfWeek: 1, startTime: "09:00", endTime: "17:00", isActive: true },
  { id: 27, doctorId: 6, dayOfWeek: 2, startTime: "09:00", endTime: "17:00", isActive: true },
  { id: 28, doctorId: 6, dayOfWeek: 3, startTime: "09:00", endTime: "17:00", isActive: true },
  { id: 29, doctorId: 6, dayOfWeek: 4, startTime: "09:00", endTime: "17:00", isActive: true },
  { id: 30, doctorId: 6, dayOfWeek: 5, startTime: "09:00", endTime: "17:00", isActive: true },
  // Gynecologist schedule
  { id: 31, doctorId: 7, dayOfWeek: 1, startTime: "08:30", endTime: "16:30", isActive: true },
  { id: 32, doctorId: 7, dayOfWeek: 2, startTime: "08:30", endTime: "16:30", isActive: true },
  { id: 33, doctorId: 7, dayOfWeek: 3, startTime: "08:30", endTime: "16:30", isActive: true },
  { id: 34, doctorId: 7, dayOfWeek: 4, startTime: "08:30", endTime: "16:30", isActive: true },
  { id: 35, doctorId: 7, dayOfWeek: 5, startTime: "08:30", endTime: "16:30", isActive: true },
  // Ophthalmologist schedule
  { id: 36, doctorId: 8, dayOfWeek: 1, startTime: "08:00", endTime: "16:00", isActive: true },
  { id: 37, doctorId: 8, dayOfWeek: 2, startTime: "08:00", endTime: "16:00", isActive: true },
  { id: 38, doctorId: 8, dayOfWeek: 3, startTime: "08:00", endTime: "16:00", isActive: true },
  { id: 39, doctorId: 8, dayOfWeek: 4, startTime: "08:00", endTime: "16:00", isActive: true },
  { id: 40, doctorId: 8, dayOfWeek: 5, startTime: "08:00", endTime: "16:00", isActive: true },
  // Psychiatrist schedule
  { id: 41, doctorId: 9, dayOfWeek: 1, startTime: "09:00", endTime: "17:00", isActive: true },
  { id: 42, doctorId: 9, dayOfWeek: 2, startTime: "09:00", endTime: "17:00", isActive: true },
  { id: 43, doctorId: 9, dayOfWeek: 3, startTime: "09:00", endTime: "17:00", isActive: true },
  { id: 44, doctorId: 9, dayOfWeek: 4, startTime: "09:00", endTime: "17:00", isActive: true },
  { id: 45, doctorId: 9, dayOfWeek: 5, startTime: "09:00", endTime: "17:00", isActive: true },
  // Urologist schedule
  { id: 46, doctorId: 10, dayOfWeek: 1, startTime: "07:30", endTime: "15:30", isActive: true },
  { id: 47, doctorId: 10, dayOfWeek: 2, startTime: "07:30", endTime: "15:30", isActive: true },
  { id: 48, doctorId: 10, dayOfWeek: 3, startTime: "07:30", endTime: "15:30", isActive: true },
  { id: 49, doctorId: 10, dayOfWeek: 4, startTime: "07:30", endTime: "15:30", isActive: true },
  { id: 50, doctorId: 10, dayOfWeek: 5, startTime: "07:30", endTime: "15:30", isActive: true },
  // Endocrinologist schedule
  { id: 51, doctorId: 11, dayOfWeek: 1, startTime: "08:00", endTime: "16:00", isActive: true },
  { id: 52, doctorId: 11, dayOfWeek: 2, startTime: "08:00", endTime: "16:00", isActive: true },
  { id: 53, doctorId: 11, dayOfWeek: 3, startTime: "08:00", endTime: "16:00", isActive: true },
  { id: 54, doctorId: 11, dayOfWeek: 4, startTime: "08:00", endTime: "16:00", isActive: true },
  { id: 55, doctorId: 11, dayOfWeek: 5, startTime: "08:00", endTime: "16:00", isActive: true },
];

// Sample messages for testing
export const mockMessages: any[] = [
  {
    id: 1,
    senderId: "dev-user",
    receiverId: "doctor-1-user",
    subject: "Question about medication",
    content: "Hi Dr. Smith, I have a question about the medication you prescribed last week.",
    isRead: true,
    priority: "medium",
    appointmentId: null,
    expiresAt: null,
    createdAt: new Date("2024-12-29T10:30:00")
  },
  {
    id: 2,
    senderId: "doctor-1-user",
    receiverId: "dev-user",
    subject: "Re: Question about medication",
    content: "Hello! I'd be happy to help. What specific questions do you have about your medication?",
    isRead: true,
    priority: "medium",
    appointmentId: null,
    expiresAt: null,
    createdAt: new Date("2024-12-29T11:00:00")
  },
  {
    id: 3,
    senderId: "dev-user",
    receiverId: "doctor-1-user",
    subject: "Re: Question about medication",
    content: "Thank you! I wanted to know if I should take it with food or on an empty stomach.",
    isRead: false,
    priority: "medium",
    appointmentId: null,
    expiresAt: null,
    createdAt: new Date("2024-12-29T14:20:00")
  }
];

// Export all mock data as a single object for easy access
export const comprehensiveMockData = {
  departments: mockDepartments,
  users: mockUsers,
  doctors: mockDoctors,
  doctorSchedules: mockDoctorSchedules,
  medicines: mockMedicines,
  appointments: mockAppointments,
  prescriptions: mockPrescriptions,
  prescriptionItems: mockPrescriptionItems,
  vitals: mockVitals,
  allergies: mockAllergies,
  familyMembers: mockFamilyMembers,
  documents: mockDocuments,
  bills: mockBills,
  favorites: mockFavorites,
  notifications: mockNotifications,
  vaccinations: mockVaccinations,
  messages: mockMessages
};