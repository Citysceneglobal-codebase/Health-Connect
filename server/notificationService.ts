import { storage } from "./storage";

// Notification service interfaces
interface SMSConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

interface EmailConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

interface PushConfig {
  serverKey: string;
  projectId: string;
}

export class NotificationService {
  private smsConfig?: SMSConfig;
  private emailConfig?: EmailConfig;
  private pushConfig?: PushConfig;

  constructor() {
    // Initialize configs from environment variables
    this.initializeConfigs();
  }

  private initializeConfigs() {
    // SMS Configuration (Twilio)
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_NUMBER) {
      this.smsConfig = {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        fromNumber: process.env.TWILIO_FROM_NUMBER,
      };
    }

    // Email Configuration (SendGrid)
    if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL) {
      this.emailConfig = {
        apiKey: process.env.SENDGRID_API_KEY,
        fromEmail: process.env.SENDGRID_FROM_EMAIL,
        fromName: process.env.SENDGRID_FROM_NAME || "Health Connect",
      };
    }

    // Push Notification Configuration (Firebase)
    if (process.env.FIREBASE_SERVER_KEY && process.env.FIREBASE_PROJECT_ID) {
      this.pushConfig = {
        serverKey: process.env.FIREBASE_SERVER_KEY,
        projectId: process.env.FIREBASE_PROJECT_ID,
      };
    }
  }

  async sendSMS(to: string, message: string): Promise<boolean> {
    if (!this.smsConfig) {
      console.warn("SMS service not configured");
      return false;
    }

    try {
      // In production, use Twilio SDK
      // const twilio = require('twilio');
      // const client = twilio(this.smsConfig.accountSid, this.smsConfig.authToken);
      // await client.messages.create({
      //   body: message,
      //   from: this.smsConfig.fromNumber,
      //   to: to
      // });

      console.log(`SMS sent to ${to}: ${message}`);
      return true;
    } catch (error) {
      console.error("Error sending SMS:", error);
      return false;
    }
  }

  async sendEmail(to: string, subject: string, htmlContent: string, textContent?: string): Promise<boolean> {
    if (!this.emailConfig) {
      console.warn("Email service not configured");
      return false;
    }

    try {
      // In production, use SendGrid SDK
      // const sgMail = require('@sendgrid/mail');
      // sgMail.setApiKey(this.emailConfig.apiKey);
      // await sgMail.send({
      //   to: to,
      //   from: {
      //     email: this.emailConfig.fromEmail,
      //     name: this.emailConfig.fromName
      //   },
      //   subject: subject,
      //   text: textContent,
      //   html: htmlContent,
      // });

      console.log(`Email sent to ${to}: ${subject}`);
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  }

  async sendPushNotification(token: string, title: string, body: string, data?: any): Promise<boolean> {
    if (!this.pushConfig) {
      console.warn("Push notification service not configured");
      return false;
    }

    try {
      // In production, use Firebase Admin SDK
      // const admin = require('firebase-admin');
      // await admin.messaging().send({
      //   token: token,
      //   notification: {
      //     title: title,
      //     body: body,
      //   },
      //   data: data,
      // });

      console.log(`Push notification sent to ${token}: ${title} - ${body}`);
      return true;
    } catch (error) {
      console.error("Error sending push notification:", error);
      return false;
    }
  }

  async sendNotificationToUser(userId: string, notification: {
    title: string;
    message: string;
    type: string;
    priority?: 'low' | 'medium' | 'high';
  }) {
    try {
      // Get user preferences
      const preferences = await storage.getNotificationPreferences(userId);
      const user = await storage.getUser(userId);

      if (!user) {
        console.error("User not found for notification");
        return;
      }

      // Create notification record
      await storage.createNotification({
        userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        priority: notification.priority || 'medium',
      });

      // Send based on preferences (default to email enabled if no preferences)
      const emailEnabled = preferences?.emailEnabled ?? true;
      const smsEnabled = preferences?.smsEnabled ?? false;
      const pushEnabled = preferences?.pushEnabled ?? true;

      // Send based on preferences
      const results = await Promise.allSettled([
        emailEnabled && user.email ? this.sendEmail(
          user.email,
          notification.title,
          `<p>${notification.message}</p>`,
          notification.message
        ) : Promise.resolve(true),

        smsEnabled && user.phone ? this.sendSMS(
          user.phone,
          `${notification.title}: ${notification.message}`
        ) : Promise.resolve(true),

        pushEnabled && user.pushToken ? this.sendPushNotification(
          user.pushToken,
          notification.title,
          notification.message,
          { type: notification.type }
        ) : Promise.resolve(true),
      ]);

      // Log results
      results.forEach((result, index) => {
        const channel = ['email', 'sms', 'push'][index];
        if (result.status === 'rejected') {
          console.error(`Failed to send ${channel} notification:`, result.reason);
        }
      });

    } catch (error) {
      console.error("Error sending notification to user:", error);
    }
  }

  // Specific notification methods
  async notifyAppointmentBooked(userId: string, appointmentDetails: any) {
    await this.sendNotificationToUser(userId, {
      title: "Appointment Booked",
      message: `Your appointment with ${appointmentDetails.doctorName} is confirmed for ${appointmentDetails.dateTime}`,
      type: "appointment",
      priority: "high",
    });
  }

  async notifyAppointmentReminder(userId: string, appointmentDetails: any) {
    await this.sendNotificationToUser(userId, {
      title: "Appointment Reminder",
      message: `You have an appointment with ${appointmentDetails.doctorName} in 1 hour`,
      type: "reminder",
      priority: "high",
    });
  }

  async notifyReportReady(userId: string, reportType: string) {
    await this.sendNotificationToUser(userId, {
      title: "Medical Report Ready",
      message: `Your ${reportType} report is now available in your records`,
      type: "report",
      priority: "medium",
    });
  }

  async notifyPrescriptionAdded(userId: string, doctorName: string) {
    await this.sendNotificationToUser(userId, {
      title: "New Prescription",
      message: `Dr. ${doctorName} has added a new prescription to your records`,
      type: "prescription",
      priority: "medium",
    });
  }

  async notifyVitalAdded(patientId: string, vitalType: string, value: string, unit: string) {
    // Get all doctors who have appointments with this patient
    try {
      const { db } = await import("./db");
      const { appointments, doctors, users } = await import("./schema-sqlite");
      const { eq, and, gte } = await import("drizzle-orm");

      // Get recent appointments (last 30 days) for this patient
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentAppointments = await db
        .select({
          doctorId: appointments.doctorId,
          doctorUserId: doctors.userId,
          doctorName: users.firstName,
          doctorLastName: users.lastName
        })
        .from(appointments)
        .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
        .leftJoin(users, eq(doctors.userId, users.id))
        .where(and(
          eq(appointments.patientId, patientId),
          gte(appointments.appointmentDate, thirtyDaysAgo.toISOString().split('T')[0])
        ));

      // Remove duplicates
      const uniqueDoctors = recentAppointments.filter((appointment, index, self) =>
        index === self.findIndex(a => a.doctorId === appointment.doctorId)
      );

      // Notify each doctor
      for (const appointment of uniqueDoctors) {
        if (appointment.doctorUserId) {
          await this.sendNotificationToUser(appointment.doctorUserId, {
            title: "Patient Vital Updated",
            message: `Your patient has recorded a new ${vitalType} reading: ${value}${unit ? ' ' + unit : ''}`,
            type: "vital",
            priority: "low",
          });
        }
      }
    } catch (error) {
      console.error("Error notifying doctors about vital:", error);
    }
  }

  async notifyPaymentSuccess(userId: string, amount: number) {
    await this.sendNotificationToUser(userId, {
      title: "Payment Successful",
      message: `Your payment of ₹${amount} has been processed successfully`,
      type: "payment",
      priority: "medium",
    });
  }

  async notifyPaymentFailed(userId: string, amount: number) {
    await this.sendNotificationToUser(userId, {
      title: "Payment Failed",
      message: `Your payment of ₹${amount} could not be processed. Please try again.`,
      type: "payment",
      priority: "high",
    });
  }

  async notifyAppointmentCompleted(patientId: string, doctorId: number) {
    // Notify patient
    await this.sendNotificationToUser(patientId, {
      title: "Appointment Completed",
      message: "Your appointment has been marked as completed",
      type: "appointment",
      priority: "medium",
    });

    // Notify doctor
    const doctor = await storage.getDoctor(doctorId);
    if (doctor) {
      await this.sendNotificationToUser(doctor.userId, {
        title: "Appointment Completed",
        message: "An appointment has been marked as completed",
        type: "appointment",
        priority: "low",
      });
    }

    // Notify admins (query users table directly since no getUsersByRole method)
    try {
      const { db } = await import("./db");
      const { users } = await import("./schema-sqlite");
      const { eq } = await import("drizzle-orm");

      const admins = await db.select().from(users).where(eq(users.role, 'admin'));
      for (const admin of admins) {
        await this.sendNotificationToUser(admin.id, {
          title: "Appointment Completed",
          message: `Appointment completed for patient ${patientId} with doctor ${doctorId}`,
          type: "appointment",
          priority: "low",
        });
      }
    } catch (error) {
      console.error("Error notifying admins:", error);
    }
  }

  async notifyAppointmentCancelled(patientId: string, doctorId: number) {
    // Notify patient
    await this.sendNotificationToUser(patientId, {
      title: "Appointment Cancelled",
      message: "Your appointment has been cancelled",
      type: "appointment",
      priority: "high",
    });

    // Notify doctor
    const doctor = await storage.getDoctor(doctorId);
    if (doctor) {
      await this.sendNotificationToUser(doctor.userId, {
        title: "Appointment Cancelled",
        message: "An appointment has been cancelled",
        type: "appointment",
        priority: "medium",
      });
    }

    // Notify admins
    try {
      const { db } = await import("./db");
      const { users } = await import("./schema-sqlite");
      const { eq } = await import("drizzle-orm");

      const admins = await db.select().from(users).where(eq(users.role, 'admin'));
      for (const admin of admins) {
        await this.sendNotificationToUser(admin.id, {
          title: "Appointment Cancelled",
          message: `Appointment cancelled for patient ${patientId} with doctor ${doctorId}`,
          type: "appointment",
          priority: "medium",
        });
      }
    } catch (error) {
      console.error("Error notifying admins:", error);
    }
  }

  async notifyAppointmentNoShow(patientId: string, doctorId: number) {
    // Notify patient
    await this.sendNotificationToUser(patientId, {
      title: "Appointment No-Show",
      message: "You missed your appointment. Please reschedule if needed.",
      type: "appointment",
      priority: "medium",
    });

    // Notify doctor
    const doctor = await storage.getDoctor(doctorId);
    if (doctor) {
      await this.sendNotificationToUser(doctor.userId, {
        title: "Patient No-Show",
        message: "A patient did not show up for their appointment",
        type: "appointment",
        priority: "low",
      });
    }

    // Notify admins
    try {
      const { db } = await import("./db");
      const { users } = await import("./schema-sqlite");
      const { eq } = await import("drizzle-orm");

      const admins = await db.select().from(users).where(eq(users.role, 'admin'));
      for (const admin of admins) {
        await this.sendNotificationToUser(admin.id, {
          title: "Patient No-Show",
          message: `Patient ${patientId} did not show up for appointment with doctor ${doctorId}`,
          type: "appointment",
          priority: "low",
        });
      }
    } catch (error) {
      console.error("Error notifying admins:", error);
    }
  }

  async notifyAppointmentDeleted(patientId: string, doctorId: number) {
    // Notify patient
    await this.sendNotificationToUser(patientId, {
      title: "Appointment Deleted",
      message: "Your appointment has been deleted",
      type: "appointment",
      priority: "high",
    });

    // Notify doctor
    const doctor = await storage.getDoctor(doctorId);
    if (doctor) {
      await this.sendNotificationToUser(doctor.userId, {
        title: "Appointment Deleted",
        message: "An appointment has been deleted",
        type: "appointment",
        priority: "medium",
      });
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();