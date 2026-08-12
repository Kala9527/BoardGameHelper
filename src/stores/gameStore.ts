import { defineStore } from 'pinia';

import templates from '@/data/gameTemplates.json';
import type {
  GameSession,
  GameTemplate,
  PersistedGameState,
  PlayerState,
  RandomLogEntry,
  VoteRecord
} from '@/types/game';
import { loadPersistedState, savePersistedState } from '@/utils/storage';
import { createSeed, makeId, makeRandomLog, shuffleWithSeed, splitIntoTeams } from '@/utils/random';

interface CreateSessionPayload {
  name: string;
  templateId: string;
  playerNames: string[];
  customRoles?: string[];
}

interface GameState {
  templates: GameTemplate[];
  sessions: GameSession[];
  currentSessionId: string;
  toolLog: RandomLogEntry[];
  hydrated: boolean;
}

function nowIso(): string {
  return new Date().toISOString();
}

function findRolePool(template: GameTemplate, playerCount: number, customRoles?: string[]): string[] {
  if (customRoles?.length) {
    return normalizeRoleCount(customRoles, playerCount);
  }

  const exact = template.rolePresets.find((preset) => preset.players === playerCount);

  if (exact) {
    return normalizeRoleCount(exact.roles, playerCount);
  }

  const nearest = [...template.rolePresets]
    .filter((preset) => preset.players <= playerCount)
    .sort((first, second) => second.players - first.players)[0];

  if (nearest) {
    return normalizeRoleCount(nearest.roles, playerCount);
  }

  return [];
}

function normalizeRoleCount(roles: string[], playerCount: number): string[] {
  const normalized = roles.slice(0, playerCount);
  const source = [...normalized];

  if (source.length === 0) {
    return [];
  }

  while (normalized.length < playerCount) {
    normalized.push(source[normalized.length % source.length]);
  }

  return normalized;
}

function touch(session: GameSession): void {
  session.updatedAt = nowIso();
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isPlayerState(value: unknown): value is PlayerState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const player = value as PlayerState;
  return (
    isString(player.id) &&
    isString(player.name) &&
    isNumber(player.seat) &&
    isNumber(player.score) &&
    isString(player.status)
  );
}

function isGameSession(value: unknown): value is GameSession {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const session = value as GameSession;
  return (
    isString(session.id) &&
    isString(session.name) &&
    isString(session.templateId) &&
    Array.isArray(session.players) &&
    session.players.every(isPlayerState) &&
    Array.isArray(session.rolesPool) &&
    session.rolesPool.every(isString) &&
    isNumber(session.phaseIndex) &&
    isNumber(session.turnIndex) &&
    Boolean(session.timer) &&
    isNumber(session.timer.duration) &&
    isNumber(session.timer.remaining) &&
    Array.isArray(session.votes) &&
    Array.isArray(session.randomLog)
  );
}

export const useGameStore = defineStore('game', {
  state: (): GameState => ({
    templates: templates as GameTemplate[],
    sessions: [],
    currentSessionId: '',
    toolLog: [],
    hydrated: false
  }),

  getters: {
    currentSession(state): GameSession | undefined {
      return state.sessions.find((session) => session.id === state.currentSessionId);
    },
    activeSessions(state): GameSession[] {
      return state.sessions.filter((session) => session.status === 'active');
    },
    finishedSessions(state): GameSession[] {
      return state.sessions.filter((session) => session.status === 'finished');
    }
  },

  actions: {
    hydrate() {
      if (this.hydrated) {
        return;
      }

      const persisted = loadPersistedState();

      if (persisted) {
        this.sessions = persisted.sessions;
        this.currentSessionId = persisted.currentSessionId;
        this.toolLog = persisted.toolLog;
      }

      this.hydrated = true;
      this.persist();
    },

    persist() {
      const payload: PersistedGameState = {
        version: 1,
        savedAt: nowIso(),
        currentSessionId: this.currentSessionId,
        sessions: this.sessions,
        toolLog: this.toolLog
      };

      savePersistedState(payload);
    },

    exportJson(): string {
      const payload: PersistedGameState = {
        version: 1,
        savedAt: nowIso(),
        currentSessionId: this.currentSessionId,
        sessions: this.sessions,
        toolLog: this.toolLog
      };

      return JSON.stringify(payload, null, 2);
    },

    importJson(raw: string) {
      const parsed = JSON.parse(raw) as PersistedGameState;

      if (
        parsed.version !== 1 ||
        !Array.isArray(parsed.sessions) ||
        !parsed.sessions.every(isGameSession)
      ) {
        throw new Error('无法识别的桌游助手 JSON 档案');
      }

      this.sessions = parsed.sessions;
      this.currentSessionId = this.sessions.some((session) => session.id === parsed.currentSessionId)
        ? parsed.currentSessionId
        : (this.sessions[0]?.id ?? '');
      this.toolLog = Array.isArray(parsed.toolLog) ? parsed.toolLog : [];
      this.persist();
    },

    recordToolLog(log: RandomLogEntry) {
      this.toolLog.unshift(log);
      this.toolLog = this.toolLog.slice(0, 40);
      this.persist();
    },

    createSession(payload: CreateSessionPayload): GameSession {
      const template = this.templates.find((item) => item.id === payload.templateId) ?? this.templates[0];
      const playerNames = payload.playerNames.slice(0, template.maxPlayers);
      const players: PlayerState[] = playerNames.map((name, index) => ({
        id: makeId('player'),
        name,
        seat: index + 1,
        score: 0,
        status: template.statuses[0] ?? '在场'
      }));

      const session: GameSession = {
        id: makeId('session'),
        name: payload.name || `${template.name} ${new Date().toLocaleDateString('zh-CN')}`,
        templateId: template.id,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        status: 'active',
        players,
        rolesPool: findRolePool(template, players.length, payload.customRoles),
        phaseIndex: 0,
        turnIndex: 0,
        timer: {
          duration: template.defaultTimer,
          remaining: template.defaultTimer,
          running: false
        },
        votes: [],
        randomLog: [],
        resultNote: ''
      };

      this.sessions.unshift(session);
      this.currentSessionId = session.id;
      this.persist();
      return session;
    },

    selectSession(sessionId: string) {
      this.currentSessionId = sessionId;
      this.persist();
    },

    deleteSession(sessionId: string) {
      this.sessions = this.sessions.filter((session) => session.id !== sessionId);

      if (this.currentSessionId === sessionId) {
        this.currentSessionId = this.sessions[0]?.id ?? '';
      }

      this.persist();
    },

    finishSession(sessionId: string, note: string) {
      const session = this.sessions.find((item) => item.id === sessionId);

      if (!session) {
        return;
      }

      session.status = 'finished';
      session.resultNote = note;
      session.timer.running = false;
      touch(session);
      this.persist();
    },

    reopenSession(sessionId: string) {
      const session = this.sessions.find((item) => item.id === sessionId);

      if (!session) {
        return;
      }

      session.status = 'active';
      touch(session);
      this.currentSessionId = sessionId;
      this.persist();
    },

    assignRoles(sessionId: string) {
      const session = this.sessions.find((item) => item.id === sessionId);

      if (!session) {
        return;
      }

      const seed = createSeed(`roles-${session.id}`);
      const roles = shuffleWithSeed(session.rolesPool, seed);

      session.players.forEach((player, index) => {
        player.role = roles[index] ?? '玩家';
      });

      const log = makeRandomLog(
        '身份分配',
        seed,
        session.players.map((player) => player.name).join(' / '),
        session.players.map((player) => `${player.name}=已分配`).join(' / ')
      );

      session.randomLog.unshift(log);
      touch(session);
      this.persist();
    },

    randomizeSeats(sessionId: string) {
      const session = this.sessions.find((item) => item.id === sessionId);

      if (!session) {
        return;
      }

      const seed = createSeed(`seats-${session.id}`);
      const shuffled = shuffleWithSeed(session.players, seed);

      shuffled.forEach((player, index) => {
        player.seat = index + 1;
      });

      session.players = [...session.players].sort((first, second) => first.seat - second.seat);
      session.turnIndex = 0;
      session.randomLog.unshift(
        makeRandomLog(
          '随机座位',
          seed,
          session.players.map((player) => player.name).join(' / '),
          session.players.map((player) => `${player.seat}.${player.name}`).join(' / ')
        )
      );
      touch(session);
      this.persist();
    },

    splitTeams(sessionId: string, teamCount: number) {
      const session = this.sessions.find((item) => item.id === sessionId);

      if (!session) {
        return;
      }

      const seed = createSeed(`teams-${session.id}`);
      const teams = splitIntoTeams(session.players, teamCount, seed);

      teams.forEach((team, teamIndex) => {
        team.forEach((player) => {
          player.team = `${teamIndex + 1}队`;
        });
      });

      session.randomLog.unshift(
        makeRandomLog(
          '随机分组',
          seed,
          session.players.map((player) => player.name).join(' / '),
          teams
            .map((team, index) => `${index + 1}队:${team.map((player) => player.name).join(',')}`)
            .join(' / ')
        )
      );
      touch(session);
      this.persist();
    },

    setPhase(sessionId: string, direction: 1 | -1) {
      const session = this.sessions.find((item) => item.id === sessionId);
      const template = this.templates.find((item) => item.id === session?.templateId);

      if (!session || !template) {
        return;
      }

      session.phaseIndex =
        (session.phaseIndex + direction + template.phases.length) % template.phases.length;
      touch(session);
      this.persist();
    },

    nextTurn(sessionId: string) {
      const session = this.sessions.find((item) => item.id === sessionId);

      if (!session || session.players.length === 0) {
        return;
      }

      session.turnIndex = (session.turnIndex + 1) % session.players.length;
      touch(session);
      this.persist();
    },

    previousTurn(sessionId: string) {
      const session = this.sessions.find((item) => item.id === sessionId);

      if (!session || session.players.length === 0) {
        return;
      }

      session.turnIndex = (session.turnIndex - 1 + session.players.length) % session.players.length;
      touch(session);
      this.persist();
    },

    setPlayerStatus(sessionId: string, playerId: string, status: string) {
      const session = this.sessions.find((item) => item.id === sessionId);
      const player = session?.players.find((item) => item.id === playerId);

      if (!session || !player) {
        return;
      }

      player.status = status;
      touch(session);
      this.persist();
    },

    adjustScore(sessionId: string, playerId: string, delta: number) {
      const session = this.sessions.find((item) => item.id === sessionId);
      const player = session?.players.find((item) => item.id === playerId);

      if (!session || !player) {
        return;
      }

      player.score += delta;
      touch(session);
      this.persist();
    },

    addVote(sessionId: string, playerId: string) {
      const session = this.sessions.find((item) => item.id === sessionId);
      const player = session?.players.find((item) => item.id === playerId);

      if (!session || !player) {
        return;
      }

      const vote: VoteRecord = {
        id: makeId('vote'),
        targetId: player.id,
        targetName: player.name,
        createdAt: nowIso()
      };

      session.votes.push(vote);
      touch(session);
      this.persist();
    },

    clearVotes(sessionId: string) {
      const session = this.sessions.find((item) => item.id === sessionId);

      if (!session) {
        return;
      }

      session.votes = [];
      touch(session);
      this.persist();
    },

    setTimer(sessionId: string, seconds: number) {
      const session = this.sessions.find((item) => item.id === sessionId);

      if (!session) {
        return;
      }

      const nextSeconds = Math.max(5, Math.floor(seconds));
      session.timer.duration = nextSeconds;
      session.timer.remaining = nextSeconds;
      session.timer.running = false;
      delete session.timer.lastStartedAt;
      touch(session);
      this.persist();
    },

    startTimer(sessionId: string) {
      const session = this.sessions.find((item) => item.id === sessionId);

      if (!session || session.timer.remaining <= 0) {
        return;
      }

      session.timer.running = true;
      session.timer.lastStartedAt = Date.now();
      touch(session);
      this.persist();
    },

    pauseTimer(sessionId: string) {
      const session = this.sessions.find((item) => item.id === sessionId);

      if (!session) {
        return;
      }

      this.syncTimer(sessionId);
      session.timer.running = false;
      delete session.timer.lastStartedAt;
      touch(session);
      this.persist();
    },

    resetTimer(sessionId: string) {
      const session = this.sessions.find((item) => item.id === sessionId);

      if (!session) {
        return;
      }

      session.timer.remaining = session.timer.duration;
      session.timer.running = false;
      delete session.timer.lastStartedAt;
      touch(session);
      this.persist();
    },

    syncTimer(sessionId: string) {
      const session = this.sessions.find((item) => item.id === sessionId);

      if (!session?.timer.running || !session.timer.lastStartedAt) {
        return;
      }

      const elapsed = Math.floor((Date.now() - session.timer.lastStartedAt) / 1000);
      session.timer.remaining = Math.max(0, session.timer.remaining - elapsed);
      session.timer.lastStartedAt = Date.now();

      if (session.timer.remaining === 0) {
        session.timer.running = false;
        delete session.timer.lastStartedAt;
      }
    }
  }
});
