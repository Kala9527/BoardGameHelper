import type { RandomLogEntry } from '@/types/game';

export function makeId(prefix = 'id'): string {
  if (crypto?.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function createSeed(label: string): string {
  const bytes = new Uint32Array(4);

  if (crypto?.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 0xffffffff);
    }
  }

  return `${label}:${Date.now().toString(36)}:${Array.from(bytes)
    .map((value) => value.toString(36))
    .join('-')}`;
}

function xmur3(input: string): () => number {
  let hash = 1779033703 ^ input.length;

  for (let index = 0; index < input.length; index += 1) {
    hash = Math.imul(hash ^ input.charCodeAt(index), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }

  return () => {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
    return (hash ^= hash >>> 16) >>> 0;
  };
}

function mulberry32(seed: number): () => number {
  return () => {
    let next = (seed += 0x6d2b79f5);
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

export function createRng(seed: string): () => number {
  return mulberry32(xmur3(seed)());
}

export function randomInt(min: number, max: number, seed: string): number {
  const low = Math.ceil(Math.min(min, max));
  const high = Math.floor(Math.max(min, max));
  const rng = createRng(seed);
  return Math.floor(rng() * (high - low + 1)) + low;
}

export function shuffleWithSeed<T>(items: T[], seed: string): T[] {
  const rng = createRng(seed);
  const output = [...items];

  for (let index = output.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [output[index], output[swapIndex]] = [output[swapIndex], output[index]];
  }

  return output;
}

export function splitIntoTeams<T>(items: T[], teamCount: number, seed: string): T[][] {
  const count = Math.max(1, Math.min(teamCount, items.length));
  const shuffled = shuffleWithSeed(items, seed);
  const teams: T[][] = Array.from({ length: count }, () => []);

  shuffled.forEach((item, index) => {
    teams[index % count].push(item);
  });

  return teams;
}

export function makeRandomLog(
  type: string,
  seed: string,
  input: string,
  result: string
): RandomLogEntry {
  return {
    id: makeId('log'),
    type,
    seed,
    algorithm: 'xmur3 + mulberry32 + Fisher-Yates',
    input,
    result,
    createdAt: new Date().toISOString()
  };
}

export function parseList(input: string): string[] {
  return input
    .split(/[\n,，;；|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}
