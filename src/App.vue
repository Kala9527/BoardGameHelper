<template>
  <div class="app-shell">
    <header class="top-cover">
      <img class="cover-art" :src="coverUrl" alt="" />
      <div class="brand-strip">
        <div>
          <p class="eyebrow">离线优先 / 本地 JSON</p>
          <h1>桌游助手</h1>
        </div>
        <button class="stamp-button" type="button" @click="activeTab = 'create'">
          <AppIcon name="plus" />
          开局
        </button>
      </div>
    </header>

    <main class="phone-frame">
      <section v-if="activeTab === 'home'" class="screen-stack">
        <div class="metric-grid">
          <button class="metric-tile yellow" type="button" @click="activeTab = 'tools'">
            <AppIcon name="dice" />
            <strong>随机工具</strong>
            <span>骰子 / 座位 / 分组</span>
          </button>
          <button class="metric-tile cyan" type="button" @click="activeTab = 'create'">
            <AppIcon name="card" />
            <strong>身份开局</strong>
            <span>单设备秘密分配</span>
          </button>
          <button class="metric-tile red" type="button" @click="openCurrentOrCreate">
            <AppIcon name="clock" />
            <strong>继续对局</strong>
            <span>{{ store.activeSessions.length }} 个进行中</span>
          </button>
          <button class="metric-tile blue" type="button" @click="activeTab = 'history'">
            <AppIcon name="trophy" />
            <strong>历史档案</strong>
            <span>{{ store.finishedSessions.length }} 个已结算</span>
          </button>
        </div>

        <div class="section-heading">
          <h2>首批模板</h2>
          <span>{{ store.templates.length }} 套</span>
        </div>
        <div class="template-list">
          <button
            v-for="template in store.templates"
            :key="template.id"
            class="template-row"
            type="button"
            :style="{ '--accent': template.accent }"
            @click="selectTemplate(template.id)"
          >
            <span class="template-icon"><AppIcon :name="template.icon" /></span>
            <span>
              <strong>{{ template.name }}</strong>
              <small>{{ template.subtitle }}</small>
            </span>
          </button>
        </div>
      </section>

      <section v-else-if="activeTab === 'tools'" class="screen-stack">
        <div class="section-heading">
          <h2>随机工具</h2>
          <span>可复核种子</span>
        </div>

        <div class="tool-panel yellow-panel">
          <div class="panel-title">
            <AppIcon name="dice" />
            <h3>数字 / 骰子 / 硬币</h3>
          </div>
          <div class="inline-controls">
            <label>
              最小
              <input v-model.number="numberMin" type="number" inputmode="numeric" />
            </label>
            <label>
              最大
              <input v-model.number="numberMax" type="number" inputmode="numeric" />
            </label>
            <button class="ink-button" type="button" @click="rollNumber">生成</button>
          </div>
          <output class="big-output">{{ numberResult ?? '—' }}</output>
          <div class="inline-controls">
            <label>
              个数
              <input v-model.number="diceCount" type="number" min="1" max="12" />
            </label>
            <label>
              面数
              <input v-model.number="diceSides" type="number" min="2" max="100" />
            </label>
            <button class="ink-button" type="button" @click="rollDice">掷骰</button>
            <button class="ink-button ghost" type="button" @click="flipCoin">硬币</button>
          </div>
          <p class="result-line">{{ diceResultText }}</p>
        </div>

        <div class="tool-panel cyan-panel">
          <div class="panel-title">
            <AppIcon name="wheel" />
            <h3>转盘 / 抽签</h3>
          </div>
          <textarea v-model="wheelText" rows="4" />
          <div class="inline-controls">
            <button class="ink-button" type="button" @click="pickWheel">转盘</button>
            <button class="ink-button ghost" type="button" @click="drawLot">抽签</button>
          </div>
          <output class="big-output">{{ wheelResult || '—' }}</output>
        </div>

        <div class="tool-panel red-panel">
          <div class="panel-title">
            <AppIcon name="shuffle" />
            <h3>排序 / 座位 / 分组</h3>
          </div>
          <textarea v-model="toolPlayersText" rows="5" />
          <div class="inline-controls">
            <label>
              队伍
              <input v-model.number="teamCount" type="number" min="1" max="12" />
            </label>
            <button class="ink-button" type="button" @click="shufflePlayers">排序</button>
            <button class="ink-button ghost" type="button" @click="makeSeats">座位</button>
            <button class="ink-button ghost" type="button" @click="makeTeams">分组</button>
          </div>
          <div class="result-list">
            <p v-for="line in arrangementResult" :key="line">{{ line }}</p>
          </div>
        </div>

        <div class="audit-strip">
          <h3>最近随机</h3>
          <article v-for="log in store.toolLog.slice(0, 4)" :key="log.id">
            <strong>{{ log.type }}</strong>
            <span>{{ log.result }}</span>
            <small>{{ log.seed }}</small>
          </article>
        </div>
      </section>

      <section v-else-if="activeTab === 'create'" class="screen-stack">
        <div class="section-heading">
          <h2>创建对局</h2>
          <span>无需注册</span>
        </div>

        <div class="template-picker">
          <button
            v-for="template in store.templates"
            :key="template.id"
            class="template-chip"
            :class="{ active: selectedTemplateId === template.id }"
            type="button"
            @click="selectedTemplateId = template.id"
          >
            <AppIcon :name="template.icon" />
            {{ template.name }}
          </button>
        </div>

        <div class="form-panel">
          <label>
            对局名称
            <input v-model="gameName" maxlength="24" />
          </label>
          <label>
            玩家名单
            <textarea v-model="newPlayersText" rows="8" />
          </label>
          <label>
            自定义身份池
            <textarea v-model="customRolesText" rows="4" />
          </label>
          <p class="form-alert" v-if="createError">{{ createError }}</p>
          <button class="primary-action" type="button" @click="createGame">
            <AppIcon name="play" />
            创建并进入
          </button>
        </div>
      </section>

      <section v-else-if="activeTab === 'session'" class="screen-stack">
        <template v-if="currentSession && currentTemplate">
          <div class="session-head" :style="{ '--accent': currentTemplate.accent }">
            <div>
              <p>{{ currentTemplate.name }}</p>
              <h2>{{ currentSession.name }}</h2>
            </div>
            <button class="stamp-button dark" type="button" @click="finishCurrent">
              <AppIcon name="trophy" />
              结算
            </button>
          </div>

          <div class="phase-board">
            <button class="square-button" type="button" @click="store.setPhase(currentSession.id, -1)">
              ‹
            </button>
            <div>
              <span>流程</span>
              <strong>{{ currentPhase }}</strong>
            </div>
            <button class="square-button" type="button" @click="store.setPhase(currentSession.id, 1)">
              ›
            </button>
          </div>

          <div class="timer-board">
            <div class="timer-face" :style="{ '--timer': `${timerPercent}%` }">
              <strong>{{ formattedTimer }}</strong>
              <span>{{ currentSession.timer.running ? '计时中' : '暂停' }}</span>
            </div>
            <div class="timer-controls">
              <label>
                秒
                <input v-model.number="timerDraft" type="number" min="5" />
              </label>
              <button class="icon-button" type="button" @click="store.setTimer(currentSession.id, timerDraft)">
                <AppIcon name="save" />
              </button>
              <button
                class="icon-button"
                type="button"
                @click="
                  currentSession.timer.running
                    ? store.pauseTimer(currentSession.id)
                    : store.startTimer(currentSession.id)
                "
              >
                <AppIcon :name="currentSession.timer.running ? 'pause' : 'play'" />
              </button>
              <button class="icon-button" type="button" @click="store.resetTimer(currentSession.id)">
                ↺
              </button>
            </div>
          </div>

          <div class="action-grid">
            <button type="button" @click="store.assignRoles(currentSession.id)">
              <AppIcon name="card" />
              分配身份
            </button>
            <button type="button" @click="store.randomizeSeats(currentSession.id)">
              <AppIcon name="shuffle" />
              随机座位
            </button>
            <button type="button" @click="store.splitTeams(currentSession.id, sessionTeamCount)">
              <AppIcon name="users" />
              随机分组
            </button>
            <label>
              队伍数
              <input v-model.number="sessionTeamCount" type="number" min="1" />
            </label>
          </div>

          <div class="secret-strip">
            <div class="section-heading compact">
              <h2>秘密身份</h2>
              <span>{{ assignedCount }}/{{ currentSession.players.length }}</span>
            </div>
            <div class="reveal-list">
              <button
                v-for="player in currentSession.players"
                :key="player.id"
                class="reveal-chip"
                type="button"
                @pointerdown="revealRole(player.id)"
                @pointerup="hideRole"
                @pointerleave="hideRole"
              >
                <span>{{ player.name }}</span>
                <strong>{{ revealedPlayerId === player.id ? player.role || '未分配' : '•••' }}</strong>
              </button>
            </div>
          </div>

          <div class="turn-board">
            <button class="square-button" type="button" @click="store.previousTurn(currentSession.id)">‹</button>
            <div>
              <span>当前回合</span>
              <strong>{{ currentTurnPlayer?.name || '—' }}</strong>
            </div>
            <button class="square-button" type="button" @click="store.nextTurn(currentSession.id)">›</button>
          </div>

          <div class="player-list">
            <article
              v-for="player in currentSession.players"
              :key="player.id"
              class="player-row"
              :class="{ current: currentTurnPlayer?.id === player.id }"
            >
              <div class="player-main">
                <span class="seat-no">{{ player.seat }}</span>
                <div>
                  <strong>{{ player.name }}</strong>
                  <small>{{ player.team || '未分组' }} · {{ player.status }}</small>
                </div>
              </div>
              <div class="score-tools">
                <button type="button" @click="store.adjustScore(currentSession.id, player.id, -1)">−</button>
                <strong>{{ player.score }}</strong>
                <button type="button" @click="store.adjustScore(currentSession.id, player.id, 1)">+</button>
              </div>
              <div class="status-tools">
                <button
                  v-for="status in currentTemplate.statuses.slice(0, 5)"
                  :key="status"
                  type="button"
                  :class="{ active: player.status === status }"
                  @click="store.setPlayerStatus(currentSession.id, player.id, status)"
                >
                  {{ status }}
                </button>
              </div>
            </article>
          </div>

          <div class="vote-board">
            <div class="panel-title">
              <AppIcon name="vote" />
              <h3>投票</h3>
            </div>
            <select v-model="voteTargetId">
              <option value="">选择玩家</option>
              <option v-for="player in currentSession.players" :key="player.id" :value="player.id">
                {{ player.name }}
              </option>
            </select>
            <div class="inline-controls">
              <button class="ink-button" type="button" @click="voteCurrent">记一票</button>
              <button class="ink-button ghost" type="button" @click="store.clearVotes(currentSession.id)">
                清票
              </button>
            </div>
            <div class="result-list">
              <p v-for="line in voteLines" :key="line">{{ line }}</p>
            </div>
          </div>

          <div class="audit-strip">
            <h3>对局随机记录</h3>
            <article v-for="log in currentSession.randomLog.slice(0, 5)" :key="log.id">
              <strong>{{ log.type }}</strong>
              <span>{{ log.result }}</span>
              <small>{{ log.seed }}</small>
            </article>
          </div>
        </template>

        <div v-else class="empty-panel">
          <AppIcon name="card" />
          <h2>还没有进行中的对局</h2>
          <button class="primary-action" type="button" @click="activeTab = 'create'">创建对局</button>
        </div>
      </section>

      <section v-else-if="activeTab === 'history'" class="screen-stack">
        <div class="section-heading">
          <h2>档案</h2>
          <span>JSON 本地</span>
        </div>

        <div class="archive-actions">
          <button class="ink-button" type="button" @click="downloadJson">
            <AppIcon name="download" />
            导出
          </button>
          <label class="ink-button ghost file-button">
            <AppIcon name="upload" />
            导入
            <input type="file" accept="application/json,.json" @change="importJson" />
          </label>
        </div>

        <p class="form-alert" v-if="archiveMessage">{{ archiveMessage }}</p>

        <div class="archive-list">
          <article v-for="session in store.sessions" :key="session.id" class="archive-row">
            <div>
              <strong>{{ session.name }}</strong>
              <small>{{ templateName(session.templateId) }} · {{ session.status === 'active' ? '进行中' : '已结算' }}</small>
            </div>
            <div class="archive-buttons">
              <button type="button" @click="resumeSession(session.id)">
                <AppIcon name="play" />
              </button>
              <button type="button" @click="store.deleteSession(session.id)">
                <AppIcon name="trash" />
              </button>
            </div>
          </article>
        </div>
      </section>
    </main>

    <nav class="bottom-nav">
      <button :class="{ active: activeTab === 'home' }" type="button" @click="activeTab = 'home'">
        <AppIcon name="home" />
        首页
      </button>
      <button :class="{ active: activeTab === 'tools' }" type="button" @click="activeTab = 'tools'">
        <AppIcon name="dice" />
        工具
      </button>
      <button :class="{ active: activeTab === 'create' }" type="button" @click="activeTab = 'create'">
        <AppIcon name="plus" />
        开局
      </button>
      <button :class="{ active: activeTab === 'session' }" type="button" @click="activeTab = 'session'">
        <AppIcon name="clock" />
        对局
      </button>
      <button :class="{ active: activeTab === 'history' }" type="button" @click="activeTab = 'history'">
        <AppIcon name="save" />
        档案
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import coverUrl from '@/assets/cover-board.svg';
import AppIcon from '@/components/AppIcon.vue';
import { useGameStore } from '@/stores/gameStore';
import type { GameTemplate } from '@/types/game';
import { createSeed, makeRandomLog, parseList, randomInt, shuffleWithSeed, splitIntoTeams } from '@/utils/random';

type TabName = 'home' | 'tools' | 'create' | 'session' | 'history';

const store = useGameStore();
const activeTab = ref<TabName>('home');

const numberMin = ref(1);
const numberMax = ref(100);
const numberResult = ref<number | null>(null);
const diceCount = ref(2);
const diceSides = ref(6);
const diceResultText = ref('等待掷骰');
const wheelText = ref('先手\n后手\n左边玩家\n右边玩家');
const wheelResult = ref('');
const toolPlayersText = ref('阿青\n小白\n老周\n可可\n小林\n十一');
const teamCount = ref(2);
const arrangementResult = ref<string[]>([]);

const selectedTemplateId = ref('werewolf');
const gameName = ref('周末桌游局');
const newPlayersText = ref('阿青\n小白\n老周\n可可\n小林\n十一\n桃子\n南瓜');
const customRolesText = ref('');
const createError = ref('');

const timerDraft = ref(60);
const sessionTeamCount = ref(2);
const revealedPlayerId = ref('');
const voteTargetId = ref('');
const archiveMessage = ref('');
let timerHandle = 0;

const currentSession = computed(() => store.currentSession);
const currentTemplate = computed<GameTemplate | undefined>(() =>
  store.templates.find((template) => template.id === currentSession.value?.templateId)
);
const currentPhase = computed(() => {
  if (!currentSession.value || !currentTemplate.value) {
    return '—';
  }

  return currentTemplate.value.phases[currentSession.value.phaseIndex] ?? '—';
});
const currentTurnPlayer = computed(() => {
  if (!currentSession.value) {
    return undefined;
  }

  return currentSession.value.players[currentSession.value.turnIndex];
});
const assignedCount = computed(
  () => currentSession.value?.players.filter((player) => Boolean(player.role)).length ?? 0
);
const formattedTimer = computed(() => {
  const remaining = currentSession.value?.timer.remaining ?? 0;
  const minutes = Math.floor(remaining / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (remaining % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
});
const timerPercent = computed(() => {
  const timer = currentSession.value?.timer;

  if (!timer || timer.duration === 0) {
    return 0;
  }

  return Math.max(0, Math.min(100, (timer.remaining / timer.duration) * 100));
});
const voteLines = computed(() => {
  const session = currentSession.value;

  if (!session) {
    return [];
  }

  const tally = new Map<string, number>();
  session.votes.forEach((vote) => {
    tally.set(vote.targetName, (tally.get(vote.targetName) ?? 0) + 1);
  });

  return [...tally.entries()]
    .sort((first, second) => second[1] - first[1])
    .map(([name, count]) => `${name}: ${count}票`);
});

onMounted(() => {
  store.hydrate();
  timerHandle = window.setInterval(() => {
    if (currentSession.value?.timer.running) {
      store.syncTimer(currentSession.value.id);
    }
  }, 1000);
});

onBeforeUnmount(() => {
  window.clearInterval(timerHandle);
});

watch(
  () => currentSession.value?.id,
  () => {
    if (currentSession.value) {
      timerDraft.value = currentSession.value.timer.duration;
      voteTargetId.value = '';
      revealedPlayerId.value = '';
    }
  }
);

function selectTemplate(templateId: string) {
  selectedTemplateId.value = templateId;
  activeTab.value = 'create';
}

function openCurrentOrCreate() {
  activeTab.value = store.currentSession ? 'session' : 'create';
}

function rollNumber() {
  const seed = createSeed('number');
  const value = randomInt(numberMin.value, numberMax.value, seed);
  numberResult.value = value;
  store.recordToolLog(
    makeRandomLog('随机数', seed, `${numberMin.value}-${numberMax.value}`, value.toString())
  );
}

function rollDice() {
  const count = Math.max(1, Math.min(12, diceCount.value));
  const sides = Math.max(2, Math.min(100, diceSides.value));
  const seed = createSeed('dice');
  const rolls = Array.from({ length: count }, (_, index) => randomInt(1, sides, `${seed}:${index}`));
  const total = rolls.reduce((sum, value) => sum + value, 0);
  diceResultText.value = `${rolls.join(' + ')} = ${total}`;
  store.recordToolLog(makeRandomLog('骰子', seed, `${count}d${sides}`, diceResultText.value));
}

function flipCoin() {
  const seed = createSeed('coin');
  const value = randomInt(0, 1, seed) === 0 ? '正面' : '反面';
  diceResultText.value = value;
  store.recordToolLog(makeRandomLog('硬币', seed, '正面/反面', value));
}

function pickWheel() {
  const options = parseList(wheelText.value);

  if (options.length === 0) {
    wheelResult.value = '没有选项';
    return;
  }

  const seed = createSeed('wheel');
  wheelResult.value = options[randomInt(0, options.length - 1, seed)];
  store.recordToolLog(makeRandomLog('转盘', seed, options.join(' / '), wheelResult.value));
}

function drawLot() {
  const options = parseList(wheelText.value);

  if (options.length === 0) {
    wheelResult.value = '没有签';
    return;
  }

  const seed = createSeed('lot');
  wheelResult.value = options[randomInt(0, options.length - 1, seed)];
  store.recordToolLog(makeRandomLog('抽签', seed, options.join(' / '), wheelResult.value));
}

function shufflePlayers() {
  const names = parseList(toolPlayersText.value);
  const seed = createSeed('shuffle');
  arrangementResult.value = shuffleWithSeed(names, seed).map((name, index) => `${index + 1}. ${name}`);
  store.recordToolLog(makeRandomLog('随机排序', seed, names.join(' / '), arrangementResult.value.join(' / ')));
}

function makeSeats() {
  const names = parseList(toolPlayersText.value);
  const seed = createSeed('seats');
  arrangementResult.value = shuffleWithSeed(names, seed).map((name, index) => `${index + 1}号位: ${name}`);
  store.recordToolLog(makeRandomLog('随机座位', seed, names.join(' / '), arrangementResult.value.join(' / ')));
}

function makeTeams() {
  const names = parseList(toolPlayersText.value);
  const seed = createSeed('teams');
  const teams = splitIntoTeams(names, Math.max(1, teamCount.value), seed);
  arrangementResult.value = teams.map((team, index) => `${index + 1}队: ${team.join('、')}`);
  store.recordToolLog(makeRandomLog('随机分组', seed, names.join(' / '), arrangementResult.value.join(' / ')));
}

function createGame() {
  const template = store.templates.find((item) => item.id === selectedTemplateId.value);
  const players = parseList(newPlayersText.value);
  const roles = parseList(customRolesText.value);

  if (!template) {
    createError.value = '请选择模板';
    return;
  }

  if (players.length < template.minPlayers) {
    createError.value = `至少需要 ${template.minPlayers} 名玩家`;
    return;
  }

  if (players.length > template.maxPlayers) {
    createError.value = `最多支持 ${template.maxPlayers} 名玩家`;
    return;
  }

  createError.value = '';
  const session = store.createSession({
    name: gameName.value,
    templateId: selectedTemplateId.value,
    playerNames: players,
    customRoles: roles
  });
  store.assignRoles(session.id);
  activeTab.value = 'session';
}

function revealRole(playerId: string) {
  revealedPlayerId.value = playerId;
}

function hideRole() {
  revealedPlayerId.value = '';
}

function voteCurrent() {
  if (!currentSession.value || !voteTargetId.value) {
    return;
  }

  store.addVote(currentSession.value.id, voteTargetId.value);
}

function finishCurrent() {
  if (!currentSession.value) {
    return;
  }

  const topScore = [...currentSession.value.players].sort((first, second) => second.score - first.score)[0];
  store.finishSession(currentSession.value.id, topScore ? `最高分: ${topScore.name} ${topScore.score}` : '已结算');
  activeTab.value = 'history';
}

function resumeSession(sessionId: string) {
  store.reopenSession(sessionId);
  activeTab.value = 'session';
}

function templateName(templateId: string) {
  return store.templates.find((template) => template.id === templateId)?.name ?? '自定义';
}

function downloadJson() {
  const blob = new Blob([store.exportJson()], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `桌游助手-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
  archiveMessage.value = '已导出 JSON 档案';
}

function importJson(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      store.importJson(String(reader.result));
      archiveMessage.value = '已导入 JSON 档案';
    } catch (error) {
      archiveMessage.value = error instanceof Error ? error.message : '导入失败';
    } finally {
      input.value = '';
    }
  };
  reader.readAsText(file);
}
</script>
