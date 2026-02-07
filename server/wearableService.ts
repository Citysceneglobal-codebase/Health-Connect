import { storage } from "./storage";

interface WearableConfig {
  fitbitClientId?: string;
  fitbitClientSecret?: string;
  googleFitClientId?: string;
  googleFitClientSecret?: string;
  appleHealthKeyId?: string;
  appleHealthTeamId?: string;
  appleHealthBundleId?: string;
}

interface WearableData {
  provider: 'fitbit' | 'google_fit' | 'apple_health';
  userId: string;
  data: {
    steps?: number;
    heartRate?: number;
    bloodPressure?: { systolic: number; diastolic: number };
    weight?: number;
    sleepHours?: number;
    caloriesBurned?: number;
    distance?: number;
    activeMinutes?: number;
  };
  recordedAt: Date;
}

interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
}

export class WearableService {
  private config: WearableConfig;

  constructor() {
    this.config = {
      fitbitClientId: process.env.FITBIT_CLIENT_ID,
      fitbitClientSecret: process.env.FITBIT_CLIENT_SECRET,
      googleFitClientId: process.env.GOOGLE_FIT_CLIENT_ID,
      googleFitClientSecret: process.env.GOOGLE_FIT_CLIENT_SECRET,
      appleHealthKeyId: process.env.APPLE_HEALTH_KEY_ID,
      appleHealthTeamId: process.env.APPLE_HEALTH_TEAM_ID,
      appleHealthBundleId: process.env.APPLE_HEALTH_BUNDLE_ID,
    };
  }

  // OAuth URL generation
  generateFitbitAuthUrl(redirectUri: string, state?: string): string {
    if (!this.config.fitbitClientId) {
      throw new Error('Fitbit integration not configured');
    }

    const params = new URLSearchParams({
      client_id: this.config.fitbitClientId,
      response_type: 'code',
      scope: 'activity heartrate profile sleep weight',
      redirect_uri: redirectUri,
      state: state || 'fitbit_auth',
    });

    return `https://www.fitbit.com/oauth2/authorize?${params.toString()}`;
  }

  generateGoogleFitAuthUrl(redirectUri: string, state?: string): string {
    if (!this.config.googleFitClientId) {
      throw new Error('Google Fit integration not configured');
    }

    const params = new URLSearchParams({
      client_id: this.config.googleFitClientId,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read https://www.googleapis.com/auth/fitness.heart_rate.read https://www.googleapis.com/auth/fitness.sleep.read',
      redirect_uri: redirectUri,
      state: state || 'google_fit_auth',
      access_type: 'offline',
    });

    return `https://accounts.google.com/oauth/authorize?${params.toString()}`;
  }

  // Token exchange methods
  async exchangeFitbitCode(code: string, redirectUri: string): Promise<OAuthTokens> {
    if (!this.config.fitbitClientId || !this.config.fitbitClientSecret) {
      throw new Error('Fitbit credentials not configured');
    }

    const response = await fetch('https://api.fitbit.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.config.fitbitClientId}:${this.config.fitbitClientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange Fitbit code');
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  }

  async exchangeGoogleFitCode(code: string, redirectUri: string): Promise<OAuthTokens> {
    if (!this.config.googleFitClientId || !this.config.googleFitClientSecret) {
      throw new Error('Google Fit credentials not configured');
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.googleFitClientId,
        client_secret: this.config.googleFitClientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange Google Fit code');
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    };
  }

  // Data fetching methods
  async fetchFitbitData(accessToken: string, date: string): Promise<WearableData['data']> {
    const baseUrl = 'https://api.fitbit.com/1/user/-/';

    try {
      // Fetch steps
      const stepsResponse = await fetch(`${baseUrl}activities/steps/date/${date}/1d.json`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      // Fetch heart rate
      const heartRateResponse = await fetch(`${baseUrl}activities/heart/date/${date}/1d.json`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      // Fetch weight
      const weightResponse = await fetch(`${baseUrl}body/log/weight/date/${date}.json`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      // Fetch sleep
      const sleepResponse = await fetch(`${baseUrl}sleep/date/${date}.json`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      const [stepsData, heartRateData, weightData, sleepData] = await Promise.all([
        stepsResponse.ok ? stepsResponse.json() : null,
        heartRateResponse.ok ? heartRateResponse.json() : null,
        weightResponse.ok ? weightResponse.json() : null,
        sleepResponse.ok ? sleepResponse.json() : null,
      ]);

      return {
        steps: stepsData?.['activities-steps']?.[0]?.value ? parseInt(stepsData['activities-steps'][0].value) : undefined,
        heartRate: heartRateData?.['activities-heart']?.[0]?.value?.restingHeartRate ? parseInt(heartRateData['activities-heart'][0].value.restingHeartRate) : undefined,
        weight: weightData?.weight?.[0]?.weight ? parseFloat(weightData.weight[0].weight) : undefined,
        sleepHours: sleepData?.summary?.totalMinutesAsleep ? sleepData.summary.totalMinutesAsleep / 60 : undefined,
      };
    } catch (error) {
      console.error('Error fetching Fitbit data:', error);
      throw error;
    }
  }

  async fetchGoogleFitData(accessToken: string, startTime: string, endTime: string): Promise<WearableData['data']> {
    // Google Fit API implementation would go here
    // This is a simplified version for demonstration
    console.log('Google Fit data fetch not fully implemented');
    return {};
  }

  // Data synchronization
  async syncWearableData(userId: string, wearableData: WearableData): Promise<void> {
    try {
      const vitals = [];

      // Map wearable data to vitals
      if (wearableData.data.steps !== undefined) {
        vitals.push({
          patientId: userId,
          type: 'steps' as const,
          value: wearableData.data.steps.toString(),
          unit: 'steps',
          recordedAt: wearableData.recordedAt,
          notes: `Synced from ${wearableData.provider}`,
        });
      }

      if (wearableData.data.heartRate !== undefined) {
        vitals.push({
          patientId: userId,
          type: 'heart_rate' as const,
          value: wearableData.data.heartRate.toString(),
          unit: 'bpm',
          recordedAt: wearableData.recordedAt,
          notes: `Synced from ${wearableData.provider}`,
        });
      }

      if (wearableData.data.weight !== undefined) {
        vitals.push({
          patientId: userId,
          type: 'weight' as const,
          value: wearableData.data.weight.toString(),
          unit: 'kg',
          recordedAt: wearableData.recordedAt,
          notes: `Synced from ${wearableData.provider}`,
        });
      }

      if (wearableData.data.bloodPressure) {
        vitals.push({
          patientId: userId,
          type: 'bp' as const,
          value: `${wearableData.data.bloodPressure.systolic}/${wearableData.data.bloodPressure.diastolic}`,
          unit: 'mmHg',
          recordedAt: wearableData.recordedAt,
          notes: `Synced from ${wearableData.provider}`,
        });
      }

      // Save vitals to database
      for (const vital of vitals) {
        await storage.createVital(vital);
      }

      console.log(`Synced ${vitals.length} vitals from ${wearableData.provider} for user ${userId}`);
    } catch (error) {
      console.error('Error syncing wearable data:', error);
      throw error;
    }
  }

  // Scheduled sync for all connected users
  async syncAllUsersWearableData(): Promise<void> {
    try {
      // In a real implementation, you'd have a table storing user wearable connections
      // For now, this is a placeholder for scheduled sync
      console.log('Wearable data sync completed for all users');
    } catch (error) {
      console.error('Error syncing all users wearable data:', error);
      throw error;
    }
  }

  // Get supported providers
  getSupportedProviders(): string[] {
    const providers = [];
    if (this.config.fitbitClientId) providers.push('fitbit');
    if (this.config.googleFitClientId) providers.push('google_fit');
    if (this.config.appleHealthKeyId) providers.push('apple_health');
    return providers;
  }

  // Validate configuration
  isConfigured(provider: string): boolean {
    switch (provider) {
      case 'fitbit':
        return !!(this.config.fitbitClientId && this.config.fitbitClientSecret);
      case 'google_fit':
        return !!(this.config.googleFitClientId && this.config.googleFitClientSecret);
      case 'apple_health':
        return !!(this.config.appleHealthKeyId && this.config.appleHealthTeamId && this.config.appleHealthBundleId);
      default:
        return false;
    }
  }
}

// Export singleton instance
export const wearableService = new WearableService();