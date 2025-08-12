export interface NexusPoint {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  status: 'green' | 'yellow' | 'red';
  created_by?: string;
  updated_at: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  role: 'admin' | 'viewer';
  created_at: string;
}

export interface MilitaryHub extends NexusPoint {
  type: 'air-base' | 'naval-base' | 'army-base' | 'space-command' | 'intelligence' | 'early-warning' | 'strategic';
  country: string;
  branch?: 'air-force' | 'navy' | 'army' | 'marines' | 'space-force' | 'joint' | 'nato';
  classification: 'public' | 'restricted' | 'classified';
}

export interface StatusCount {
  green: number;
  yellow: number;
  red: number;
  total: number;
}

export interface GlobeSettings {
  autoRotate: boolean;
  showLabels: boolean;
  showPaths: boolean;
  nightMode: boolean;
}