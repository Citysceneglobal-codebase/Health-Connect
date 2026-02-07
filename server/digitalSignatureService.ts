import { storage } from "./storage";
import crypto from 'crypto';

interface SignatureData {
  prescriptionId: number;
  doctorId: number;
  signature: string;
  timestamp: Date;
  algorithm: string;
  publicKey?: string;
}

interface VerificationResult {
  isValid: boolean;
  signature?: SignatureData;
  error?: string;
}

export class DigitalSignatureService {
  private algorithm = 'RSA-SHA256';
  private keySize = 2048;

  // Generate a new key pair for a doctor
  async generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
    return new Promise((resolve, reject) => {
      crypto.generateKeyPair('rsa', {
        modulusLength: this.keySize,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      }, (err, publicKey, privateKey) => {
        if (err) {
          reject(err);
        } else {
          resolve({ publicKey, privateKey });
        }
      });
    });
  }

  // Sign prescription data
  async signPrescription(prescriptionId: number, doctorId: number, privateKey: string): Promise<SignatureData> {
    try {
      // Get prescription data
      const prescription = await storage.getPrescription(prescriptionId);
      if (!prescription) {
        throw new Error('Prescription not found');
      }

      // Create data to sign (prescription content + timestamp)
      const dataToSign = {
        prescriptionId,
        doctorId,
        patientId: prescription.patientId,
        diagnosis: prescription.diagnosis,
        notes: prescription.notes,
        timestamp: new Date().toISOString(),
      };

      const dataString = JSON.stringify(dataToSign, Object.keys(dataToSign).sort());

      // Create signature
      const sign = crypto.createSign(this.algorithm);
      sign.update(dataString);
      const signature = sign.sign(privateKey, 'base64');

      // Get public key for storage (in production, this would be stored securely)
      const publicKey = crypto.createPublicKey(privateKey).export({
        type: 'spki',
        format: 'pem'
      }) as string;

      const signatureData: SignatureData = {
        prescriptionId,
        doctorId,
        signature,
        timestamp: new Date(),
        algorithm: this.algorithm,
        publicKey,
      };

      return signatureData;
    } catch (error) {
      console.error('Error signing prescription:', error);
      throw error;
    }
  }

  // Verify prescription signature
  async verifyPrescriptionSignature(prescriptionId: number): Promise<VerificationResult> {
    try {
      // Get prescription
      const prescription = await storage.getPrescription(prescriptionId);
      if (!prescription) {
        return { isValid: false, error: 'Prescription not found' };
      }

      // In a real implementation, you'd retrieve the signature from a secure storage
      // For demo purposes, we'll simulate signature verification
      const mockSignature: SignatureData = {
        prescriptionId,
        doctorId: prescription.doctorId,
        signature: 'mock_signature_' + prescriptionId,
        timestamp: new Date(),
        algorithm: this.algorithm,
        publicKey: 'mock_public_key',
      };

      // Create the same data that was signed
      const dataToVerify = {
        prescriptionId,
        doctorId: prescription.doctorId,
        patientId: prescription.patientId,
        diagnosis: prescription.diagnosis,
        notes: prescription.notes,
        timestamp: mockSignature.timestamp.toISOString(),
      };

      const dataString = JSON.stringify(dataToVerify, Object.keys(dataToVerify).sort());

      // Verify signature (mock verification for demo)
      const isValid = mockSignature.signature.startsWith('mock_signature_');

      return {
        isValid,
        signature: mockSignature,
      };
    } catch (error) {
      console.error('Error verifying prescription signature:', error);
      return { isValid: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Create a certificate for a doctor (simplified)
  async createDoctorCertificate(doctorId: number): Promise<string> {
    try {
      const doctor = await storage.getDoctor(doctorId);
      if (!doctor) {
        throw new Error('Doctor not found');
      }

      // In production, this would create a proper X.509 certificate
      // For demo, we'll create a simple certificate-like structure
      const certificate = {
        subject: `Doctor ${doctorId}`,
        issuer: 'Health Connect Platform',
        validFrom: new Date().toISOString(),
        validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        publicKey: 'mock_public_key_for_' + doctorId,
        serialNumber: 'CERT-' + doctorId + '-' + Date.now(),
      };

      return JSON.stringify(certificate);
    } catch (error) {
      console.error('Error creating doctor certificate:', error);
      throw error;
    }
  }

  // Validate doctor's certificate
  async validateDoctorCertificate(doctorId: number, certificate: string): Promise<boolean> {
    try {
      const certData = JSON.parse(certificate);

      // Check if certificate is valid (not expired)
      const validTo = new Date(certData.validTo);
      const now = new Date();

      if (now > validTo) {
        return false;
      }

      // Check if certificate belongs to the doctor
      return certData.serialNumber.includes(doctorId.toString());
    } catch (error) {
      console.error('Error validating doctor certificate:', error);
      return false;
    }
  }

  // Generate prescription hash for tamper detection
  generatePrescriptionHash(prescription: any): string {
    const hashData = {
      id: prescription.id,
      patientId: prescription.patientId,
      doctorId: prescription.doctorId,
      diagnosis: prescription.diagnosis,
      notes: prescription.notes,
      createdAt: prescription.createdAt,
    };

    const dataString = JSON.stringify(hashData, Object.keys(hashData).sort());
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }

  // Verify prescription integrity
  verifyPrescriptionIntegrity(prescription: any, expectedHash: string): boolean {
    const currentHash = this.generatePrescriptionHash(prescription);
    return crypto.timingSafeEqual(
      Buffer.from(currentHash, 'hex'),
      Buffer.from(expectedHash, 'hex')
    );
  }

  // Create audit trail entry for prescription
  async createPrescriptionAuditEntry(prescriptionId: number, action: string, userId: string, details?: any): Promise<void> {
    try {
      // In a real implementation, this would log to an audit table
      console.log(`Audit: Prescription ${prescriptionId} - ${action} by user ${userId}`, details);
    } catch (error) {
      console.error('Error creating audit entry:', error);
    }
  }

  // Get prescription signature status
  async getPrescriptionSignatureStatus(prescriptionId: number): Promise<{
    isSigned: boolean;
    isVerified: boolean;
    signature?: SignatureData;
    certificate?: string;
  }> {
    try {
      const verification = await this.verifyPrescriptionSignature(prescriptionId);

      return {
        isSigned: !!verification.signature,
        isVerified: verification.isValid,
        signature: verification.signature,
      };
    } catch (error) {
      console.error('Error getting signature status:', error);
      return {
        isSigned: false,
        isVerified: false,
      };
    }
  }
}

// Export singleton instance
export const digitalSignatureService = new DigitalSignatureService();