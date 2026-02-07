# Health-Connect Portal Demo

## Overview

This healthcare portal demonstrates a complete patient-doctor-admin system with mock data for all components. Even without a database connection, users can explore the full functionality of the application.

## Features Demonstrated with Mock Data

### Patient Dashboard
- Shows upcoming appointments with doctors
- Displays recent vital signs (blood pressure, heart rate, weight, BMI)
- Lists known allergies with severity levels
- Provides quick access to booking appointments, viewing records, and tracking vitals

### Doctor Dashboard
- Displays today's appointment schedule
- Shows confirmed and completed appointments
- Highlights the next patient in queue
- Provides quick access to patient management, prescriptions, and schedule

### Admin Dashboard
- Shows system statistics (doctors, departments, appointments)
- Displays today's appointments across all departments
- Provides system overview with operational status
- Offers quick access to all administrative functions

### Appointments System
- View upcoming, past, and cancelled appointments
- See detailed appointment information including doctor details and reasons
- Ability to view details, reschedule, or cancel appointments

### Vitals Tracking
- Record and track various health metrics
- Visualize trends with charts
- View historical readings with trend indicators
- Track blood pressure, heart rate, weight, BMI, and temperature

### Allergies Management
- Record and manage known allergies
- Categorize by type (medicine, food, other)
- Set severity levels (mild, moderate, severe)
- Add detailed reaction descriptions

## How to Experience the Demo

1. Start the development server:
   ```
   npm run dev
   ```

2. Open your browser to `http://localhost:5005`

3. Navigate through the different sections to see mock data in action:
   - Patient Dashboard (default view)
   - Doctor Dashboard (click "Doctor Login" on landing page)
   - Admin Dashboard (click "Admin Login" on landing page)
   - Individual sections like Appointments, Vitals, Allergies

## Without Database Connection

When the database is not available (as in this demo), the application gracefully falls back to mock data:

- Authentication bypasses database in development mode
- All data fetching returns realistic mock data
- Forms appear to work normally (though data isn't persisted)
- All UI components display properly with sample content

## With Database Connection

To use with a real database:

1. Install PostgreSQL
2. Create a database named `healthconnect`
3. Update the `.env` file with your database credentials
4. Run database migrations: `npm run db:push`
5. Seed the database with sample data: `npm run seed`
6. Restart the development server

The same UI will now display real data from the database instead of mock data.