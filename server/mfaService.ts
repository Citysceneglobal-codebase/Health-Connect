import crypto from 'crypto';
import { storage } from "./storage";

interface MFASecret {
  userId: string;
  secret: string;
  backupCodes: string[];
  method: 'totp' | 'sms' | 'hardware';
  enabled: boolean;
  createdAt: Date;
  lastUsed?: Date;
}

interface TOTPSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

interface MFAVerification {
  isValid: boolean;
  method: string;
  error?: string;
}

export class MFAService {
  private algorithm = 'sha1';
  private digits = 6;
  private window = 30; // 30 second window

  // Generate TOTP secret and setup data
  async generateTOTPSecret(userId: string): Promise<TOTPSetup> {
    const secret = crypto.randomBytes(32).toString('base64').replace(/=/g, '').substring(0, 32);

    // Generate QR code URL for authenticator apps
    const issuer = 'Health Connect';
    const accountName = `Doctor ${userId}`;
    const qrCodeUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    return {
      secret,
      qrCodeUrl,
      backupCodes,
    };
  }

  // Generate backup codes for account recovery
  private generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }

  // Verify TOTP code
  async verifyTOTP(secret: string, code: string): Promise<boolean> {
    const now = Math.floor(Date.now() / 1000);
    const timeWindow = this.window;

    // Check current time window and adjacent windows for clock skew
    for (let i = -1; i <= 1; i++) {
      const time = now + (i * timeWindow);
      const expectedCode = this.generateTOTP(secret, time);
      if (expectedCode === code) {
        return true;
      }
    }

    return false;
  }

  // Generate TOTP code (for internal use)
  private generateTOTP(secret: string, time: number): string {
    const timeHex = Math.floor(time / this.window).toString(16).padStart(16, '0');
    const timeBuffer = Buffer.from(timeHex, 'hex');

    const secretBuffer = Buffer.from(secret.replace(/ /g, ''), 'base64');
    const hmac = crypto.createHmac(this.algorithm, secretBuffer);
    hmac.update(timeBuffer);
    const hmacResult = hmac.digest();

    const offset = hmacResult[hmacResult.length - 1] & 0xf;
    const code = (hmacResult[offset] & 0x7f) << 24 |
                 (hmacResult[offset + 1] & 0xff) << 16 |
                 (hmacResult[offset + 2] & 0xff) << 8 |
                 (hmacResult[offset + 3] & 0xff);

    return (code % Math.pow(10, this.digits)).toString().padStart(this.digits, '0');
  }

  // Send SMS verification code
  async sendSMSCode(phoneNumber: string): Promise<string> {
    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // In production, send SMS via Twilio or similar service
    console.log(`SMS MFA Code for ${phoneNumber}: ${code}`);

    // Store code temporarily (in production, use Redis or similar)
    // For demo, we'll just return it
    return code;
  }

  // Verify SMS code
  async verifySMSCode(expectedCode: string, providedCode: string): Promise<boolean> {
    return expectedCode === providedCode;
  }

  // Setup MFA for user
  async setupMFA(userId: string, method: 'totp' | 'sms' | 'hardware', phoneNumber?: string): Promise<TOTPSetup | string> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (method === 'sms' && !phoneNumber && !user.phone) {
        throw new Error('Phone number required for SMS MFA');
      }

      if (method === 'totp') {
        const setup = await this.generateTOTPSecret(userId);

        // In production, store the secret securely
        // For demo, we'll just return the setup data
        return setup;
      } else if (method === 'sms') {
        const code = await this.sendSMSCode(phoneNumber || user.phone!);
        return code; // Return code for immediate verification
      } else if (method === 'hardware') {
        // Hardware key setup would involve WebAuthn/FIDO2
        // For demo, return a mock setup
        return 'hardware_key_registered';
      }

      throw new Error('Unsupported MFA method');
    } catch (error) {
      console.error('Error setting up MFA:', error);
      throw error;
    }
  }

  // Verify MFA during login
  async verifyMFA(userId: string, code: string, method: 'totp' | 'sms' | 'hardware' | 'backup'): Promise<MFAVerification> {
    try {
      // In production, retrieve user's MFA settings from database
      // For demo, we'll simulate verification

      if (method === 'totp') {
        // Mock TOTP verification - in production, get secret from database
        const mockSecret = 'JBSWY3DPEHPK3PXP'; // Mock secret
        const isValid = await this.verifyTOTP(mockSecret, code);
        return {
          isValid,
          method: 'totp',
          error: isValid ? undefined : 'Invalid TOTP code',
        };
      } else if (method === 'sms') {
        // Mock SMS verification
        const isValid = code.length === 6 && /^\d{6}$/.test(code);
        return {
          isValid,
          method: 'sms',
          error: isValid ? undefined : 'Invalid SMS code',
        };
      } else if (method === 'hardware') {
        // Mock hardware key verification
        const isValid = code === 'hardware_verified';
        return {
          isValid,
          method: 'hardware',
          error: isValid ? undefined : 'Hardware key verification failed',
        };
      } else if (method === 'backup') {
        // Mock backup code verification
        const isValid = code.length === 8 && /^[A-F0-9]{8}$/.test(code);
        return {
          isValid,
          method: 'backup',
          error: isValid ? undefined : 'Invalid backup code',
        };
      }

      return {
        isValid: false,
        method,
        error: 'Unsupported MFA method',
      };
    } catch (error) {
      console.error('Error verifying MFA:', error);
      return {
        isValid: false,
        method,
        error: 'MFA verification failed',
      };
    }
  }

  // Disable MFA for user
  async disableMFA(userId: string): Promise<boolean> {
    try {
      // In production, update user's MFA settings in database
      console.log(`MFA disabled for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error disabling MFA:', error);
      return false;
    }
  }

  // Check if user has MFA enabled
  async hasMFAEnabled(userId: string): Promise<boolean> {
    try {
      // In production, check database for MFA settings
      // For demo, return false (MFA not enabled by default)
      return false;
    } catch (error) {
      console.error('Error checking MFA status:', error);
      return false;
    }
  }

  // Get MFA methods available for user
  getAvailableMethods(userId: string): string[] {
    // In production, check user's phone number, etc.
    return ['totp', 'sms', 'hardware', 'backup'];
  }

  // Generate recovery codes (backup codes)
  async generateRecoveryCodes(userId: string): Promise<string[]> {
    const codes = this.generateBackupCodes();
    // In production, store hashed versions in database
    console.log(`Recovery codes generated for user ${userId}:`, codes);
    return codes;
  }

  // Validate recovery code
  async validateRecoveryCode(userId: string, code: string): Promise<boolean> {
    // In production, check against stored hashed codes and mark as used
    console.log(`Recovery code ${code} validated for user ${userId}`);
    return true;
  }

  // Rate limiting for MFA attempts
  private mfaAttempts = new Map<string, { count: number; resetTime: number }>();

  checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxAttempts = 5;

    const userAttempts = this.mfaAttempts.get(userId);

    if (!userAttempts || now > userAttempts.resetTime) {
      // Reset or initialize
      this.mfaAttempts.set(userId, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (userAttempts.count >= maxAttempts) {
      return false; // Rate limited
    }

    userAttempts.count++;
    return true;
  }

  // Clean up old rate limit entries
  cleanupRateLimits(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    this.mfaAttempts.forEach((attempts, userId) => {
      if (now > attempts.resetTime) {
        toDelete.push(userId);
      }
    });

    toDelete.forEach(userId => this.mfaAttempts.delete(userId));
  }
}

// Export singleton instance
export const mfaService = new MFAService();

// Clean up rate limits periodically
setInterval(() => {
  mfaService.cleanupRateLimits();
}, 5 * 60 * 1000); // Every 5 minutes