export interface RolePreset {
  players: number;
  roles: string[];
}

export interface GameTemplate {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  accent: string;
  minPlayers: number;
  maxPlayers: number;
  defaultTimer: number;
  tags: string[];
  phases: string[];
  statuses: string[];
  rolePresets: RolePreset[];
}

export interface PlayerState {
  id: string;
  name: string;
  seat: number;
  team?: string;
  score: number;
  status: string;
  role?: string;
  notes?: string;
}

export interface TimerState {
  duration: number;
  remaining: number;
  running: boolean;
  lastStartedAt?: number;
}

export interface VoteRecord {
  id: string;
  targetId: string;
  targetName: string;
  createdAt: string;
}

export interface RandomLogEntry {
  id: string;
  type: string;
  seed: string;
  algorithm: string;
  input: string;
  result: string;
  createdAt: string;
}

export type SessionStatus = 'active' | 'finished';

export interface GameSession {
  id: string;
  name: string;
  templateId: string;
  createdAt: string;
  updatedAt: string;
  status: SessionStatus;
  players: PlayerState[];
  rolesPool: string[];
  phaseIndex: number;
  turnIndex: number;
  timer: TimerState;
  votes: VoteRecord[];
  randomLog: RandomLogEntry[];
  resultNote: string;
}

export interface PersistedGameState {
  version: 1;
  savedAt: string;
  currentSessionId: string;
  sessions: GameSession[];
  toolLog: RandomLogEntry[];
}
