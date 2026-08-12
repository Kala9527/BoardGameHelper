import type { PersistedGameState } from '@/types/game';

const STORAGE_KEY = 'board-game-helper:state:v1';

export function loadPersistedState(): PersistedGameState | null {
  let raw: string | null = null;

  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as PersistedGameState;
    return parsed.version === 1 ? parsed : null;
  } catch {
    return null;
  }
}

export function savePersistedState(state: PersistedGameState): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function clearPersistedState(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    undefined;
  }
}
