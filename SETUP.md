# Health-Connect Portal Setup Guide

## Prerequisites

1. Node.js (v18 or higher)
2. PostgreSQL database
3. Git

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd Health-Connect
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Database Setup

1. Install PostgreSQL if you haven't already
2. Create a new database:
   ```sql
   CREATE DATABASE healthconnect;
   ```

3. Update the `.env` file with your database connection string:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/healthconnect
   ```

4. Run database migrations:
   ```
   npm run db:push
   ```

## Adding Mock Data

To populate the database with mock data:

```
npm run seed
```

This will add sample data including:
- Departments (Cardiology, Orthopedics, Pediatrics)
- Users (patients, doctors, admins)
- Doctors with specialties
- Appointments
- Medicines
- Prescriptions
- Vitals
- Allergies
- Documents
- Bills

## Running the Application

Start the development server:
```
npm run dev
```

The application will be available at `http://localhost:5005`

## Mock Data in UI

Even without a database connection, the portal displays mock data in:
- Patient Dashboard
- Doctor Dashboard
- Admin Dashboard
- Appointments page
- Vitals page
- Allergies page

This ensures users can explore the interface even when the database is not configured.