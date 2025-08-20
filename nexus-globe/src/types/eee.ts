// EEE (Exercise, Events, Experiments) Types for LOE 2

export type TaskStatus = 'successful' | 'unsuccessful' | 'in-progress' | 'not-started';
export type ComponentType = 'tool' | 'network' | 'process' | 'communication' | 'personnel' | 'other';

export interface ImplementationComponent {
  id: string;
  name: string;
  type: ComponentType;
  description?: string;
  status: TaskStatus;
  timeToComplete?: number; // in minutes
  tasksCompleted?: number;
  totalTasks?: number;
  lastUpdated: Date;
  notes?: string;
}

export interface MeasureOfEffectiveness {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  components: ImplementationComponent[];
  targetValue?: number;
  currentValue?: number;
  unit?: string; // e.g., "minutes", "tasks", "percentage"
  weight?: number; // importance weight for the parent indicator
  createdAt: Date;
  updatedAt: Date;
}

export interface Indicator {
  id: string;
  name: string;
  description: string;
  status: TaskStatus;
  measures: MeasureOfEffectiveness[];
  priority: 'high' | 'medium' | 'low';
  dueDate?: Date;
  assignedTeam?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EEEEvent {
  id: string;
  name: string;
  type: 'exercise' | 'event' | 'experiment';
  description: string;
  startDate: Date;
  endDate?: Date;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  indicators: Indicator[];
  participants?: string[];
  location?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Statistics and Analytics
export interface EEEStats {
  totalIndicators: number;
  successfulIndicators: number;
  inProgressIndicators: number;
  failedIndicators: number;
  totalMOEs: number;
  totalComponents: number;
  avgTimeToComplete: number;
  mostUsedTools: string[];
  problematicNetworks: string[];
}