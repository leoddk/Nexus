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

export interface User {
  id: string;
  email?: string;
}