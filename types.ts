
export interface VehicleData {
  kjennemerke: string;
  vin?: string;
  merke?: string;
  modell?: string;
  eu_kontroll_sist?: string;
  eu_frister?: string;
  motoreffekt?: string;
  vekt?: string;
  dekk_felg?: string;
  first_reg_date?: string;
}

export interface OwnerData {
  navn: string;
  kommune: string;
  timestamp: string;
}

export interface UserState {
  isLoggedIn: boolean;
  email?: string;
  hasSubscription: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  regnrHash: string;
  type: 'public' | 'owner';
}

export interface PluginSettings {
  svvApiKey: string;
  maskinportenClientId: string;
  maskinportenPrivateKey: string;
  issuer: string;
  audience: string;
  scope: string;
  cacheTtl: number;
  dailyQuota: number;
  subscriptionProductId: string;
  svvOwnerEndpoint: string;
  ownerCacheTtl: number;
}
