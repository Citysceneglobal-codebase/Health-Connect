# Healthcare Portal Design Guidelines

## Design Approach: Utility-First Healthcare System

**Selected Approach**: Professional Healthcare Design System
Drawing inspiration from modern healthcare platforms like Epic MyChart, Zocdoc, and Practo, prioritizing accessibility, clarity, and workflow efficiency over visual flair.

**Core Principles**:
- Clarity over cleverness - every interaction must be immediately understood
- Accessibility-first - elderly-friendly with WCAG AAA compliance
- Trust through professionalism - clean, medical-grade interface
- Role-specific optimization - each portal tailored to its user's workflow

---

## Typography System

**Font Families** (via Google Fonts CDN):
- Primary: Inter (body text, UI elements) - weights: 400, 500, 600
- Accent: Plus Jakarta Sans (headings, buttons) - weights: 600, 700

**Type Scale**:
- Hero/Page Titles: text-4xl (36px) font-bold
- Section Headers: text-2xl (24px) font-semibold
- Card Titles: text-lg (18px) font-semibold  
- Body Text: text-base (16px) font-normal
- Helper Text: text-sm (14px) font-normal
- Buttons: text-base (16px) font-semibold

**Accessibility**: Minimum 16px body text, 1.6 line-height for readability

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **4, 6, 8, 12, 16** (as in p-4, gap-6, mt-8, etc.)

**Container Strategy**:
- Page wrapper: max-w-7xl mx-auto px-4
- Content cards: max-w-4xl for focused content
- Dashboards: Full-width with internal max-w-7xl
- Forms: max-w-2xl centered

**Grid Patterns**:
- Appointment cards: grid-cols-1 md:grid-cols-2 gap-6
- Doctor listings: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Admin tables: Full-width responsive tables
- Vital stats: grid-cols-2 md:grid-cols-4 gap-4

---

## Component Library

### Navigation
**Patient App**: Bottom navigation (mobile) with 4 icons - Home, Appointments, Records, Profile
**Doctor Portal**: Top horizontal nav with logo left, user menu right
**Admin Portal**: Left sidebar navigation (collapsible on mobile) with grouped sections

### Core UI Elements

**Buttons**:
- Primary: Rounded-lg (8px), px-6 py-3, font-semibold
- Secondary: Outlined variant with 2px border
- Danger: For cancel/delete actions
- Icon buttons: Square (44px minimum touch target)

**Cards**:
- Standard: Rounded-xl (12px), shadow-sm, p-6
- Appointment cards: Border-l-4 accent for status indication
- Medical record cards: Subtle hover lift (shadow-md transition)

**Forms**:
- Input fields: Rounded-lg, px-4 py-3, text-base, border-2
- Labels: text-sm font-medium, mb-2 spacing
- Error states: Border-red with text-sm helper below
- Search bars: Leading icon (magnifying glass), rounded-full for prominence

**Data Display**:
- Tables: Alternating row backgrounds, sticky headers
- Stat cards: Large numbers (text-3xl), icon, label, trend indicator
- Timeline: Vertical line connector for visit history
- Charts: Use Chart.js for vitals visualization (line graphs, bar charts)

**Overlays**:
- Modals: max-w-2xl, rounded-2xl, backdrop blur
- Sidepanels: Slide-in from right for patient details (doctor view)
- Alerts: Toast notifications (top-right), auto-dismiss 5s

### Healthcare-Specific Components

**Appointment Card Structure**:
- Doctor photo (rounded-full, 48px)
- Doctor name + specialty
- Date/time prominent (text-lg font-semibold)
- Status badge (rounded-full pill)
- Action buttons (Join Video, Reschedule, Cancel)

**Medical Record Viewer**:
- Document icon + type (Lab, X-ray, Prescription)
- Issue date
- Doctor name
- Download/view buttons
- PDF preview modal on click

**Prescription Display**:
- Medicine name (text-lg font-semibold)
- Dosage + frequency in readable format
- Duration badge
- Doctor notes in subtle gray box

**Allergy Alert**:
- Prominent red-bordered card in doctor view
- Alert icon (exclamation triangle)
- List of allergies with type indicators
- Always visible above prescription entry

---

## Page Layouts

### Patient Dashboard
- Welcome header with patient name + quick stats (upcoming appointments, pending reports)
- Quick action cards: Book Appointment, View Reports, Track Vitals (grid-cols-1 md:grid-cols-3)
- Upcoming appointments timeline
- Recent documents section

### Doctor Dashboard  
- Today's schedule timeline (left column)
- Next patient card (prominent, right column)
- Quick search bar for patient lookup
- Statistics row: Today's patients, Pending prescriptions, Alerts

### Admin Portal
- Left sidebar: Doctors, Patients, Appointments, Reports, Billing, Settings
- Main content: Data tables with search, filter, export
- Top bar: Breadcrumbs, notifications, user menu

### Appointment Booking Flow
1. Search page: Large search bar, filter chips (specialty, date range)
2. Doctor grid: Photo, name, specialty, rating, availability slots
3. Time slot picker: Calendar view + available time buttons
4. Confirmation: Summary card + payment integration
5. Success: Confirmation with appointment details + calendar add

---

## Visual Treatment Notes

**Borders & Shadows**:
- Cards: border border-gray-200 shadow-sm (subtle depth)
- Focus states: ring-2 ring-offset-2 (keyboard navigation)
- Elevated elements: shadow-lg for modals

**Status Indicators**:
- Confirmed: Green badge
- Pending: Yellow/amber badge  
- Cancelled: Red badge
- Completed: Blue/gray badge

**Icons**: Use Heroicons (outline for general UI, solid for active states)

---

## Images

**Hero Image**: No large hero - healthcare portals prioritize immediate functionality over marketing visuals

**Inline Images**:
- Doctor profile photos: Circular thumbnails (48px cards, 96px detail views)
- Department icons: 64px illustrative medical icons (stethoscope, heart, brain scans)
- Empty states: 200px centered illustrations ("No appointments scheduled")

**Medical Document Thumbnails**: PDF icon with document type, no actual preview thumbnails for privacy

---

## Accessibility Implementation

- Minimum 44px touch targets for all interactive elements
- ARIA labels on all icon-only buttons
- Form field associations with proper label/input pairing
- Keyboard navigation support with visible focus indicators
- Screen reader announcements for appointment status changes
- Skip navigation links on all portals

---

## Animation Guidelines

**Minimal, Purposeful Only**:
- Page transitions: Simple fade (150ms)
- Modal entry: Fade + slight scale (200ms)
- Toast notifications: Slide-in from top-right (250ms)
- Loading states: Skeleton screens (no spinners)

**No animations on**: Button hovers, data updates, table sorting