<template>
  <div>
    <h1 class="sr-only">Planfree.dev game lobby</h1>
    <Modal
        v-if="modal"
        title="Choose your display name"
        @completed="enteredName"
    ></Modal>
    <Settings
        v-if="settings"
        title="Settings"
        @saveSettings="saveSettings"
        @close="settings = false"
    ></Settings>
    <Sharing v-if="showShareModal" title='share_modal_title' subTitle='share_modal_subtitle'
             @dismissModal="dismissModal"></Sharing>
    <div v-if="!modal && !settings && !showShareModal" class="lobby-page">
      <div class="lobby-shell">
        <header class="lobby-header">
          <div class="brand">
            <span class="brand-mark">Pf</span>
            <div class="brand-copy">
              <p class="brand-title">Planfree</p>
              <p class="brand-subtitle">Planning poker for modern teams</p>
            </div>
          </div>
          <div class="header-actions">
            <div class="live-pill">
              <span class="dot"></span>
              Live lobby
            </div>
            <button
                v-if="!showCopiedToClipboard"
                class="primary-button"
                @click="copyToClipboard()"
            >
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M10 4v12m6-6H4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              </svg>
              Invite players
            </button>
            <button
                v-else
                class="secondary-button no-pointer"
            >
              {{ ("copy_to_clip") }}
            </button>
            <div class="quick-links">
              <PFLittleButton type="github" popover-text="Open repo" @clicked="goToGithub()"></PFLittleButton>
              <PFLittleButton type="pwa" popover-text="Install as app" @clicked="installPWA()"></PFLittleButton>
              <PFLittleButton type="settings" popover-text="Settings" @clicked="()=>{settings = true;}"></PFLittleButton>
            </div>
          </div>
        </header>

        <section class="room-card">
          <div class="room-text">
            <p class="eyebrow">Current room</p>
            <div class="room-heading">
              <h2>{{ roomTitle }}</h2>
              <span class="room-chip">
                <span class="dot"></span>
                {{ gameFormat?.name || 'Fibonacci deck' }}
              </span>
            </div>
            <p class="room-description">
              Share the invite link, let teammates pick a card, and reveal together. Everything stays in sync.
            </p>
            <dl class="room-stats">
              <div>
                <dt>Room code</dt>
                <dd>{{ roomCode }}</dd>
              </div>
              <div>
                <dt>Players</dt>
                <dd>{{ players?.length || 0 }}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd v-if="votingOnName">Voting on {{ votingOnName }}</dd>
                <dd v-else>Waiting for next story</dd>
              </div>
            </dl>
          </div>
          <div class="room-actions">
            <button class="outline-button" @click="modal = true">Edit room name</button>
            <button class="outline-button" @click="copyToClipboard()">Copy invite link</button>
          </div>
        </section>

        <section class="content-grid">
          <article class="panel">
            <div class="panel-header">
              <div>
                <h3>Players</h3>
                <p>See who is ready to vote.</p>
              </div>
            </div>
            <div class="player-list" v-if="players && players.length">
              <div
                  class="player-row"
                  v-for="(player, index) in players"
                  :key="player.id"
                  :style="{ animationDelay: `${index * 60}ms` }"
              >
                <div class="avatar" :class="{ reveal: showVotes && countdown === 0 }">
                  <span v-if="showVotes && countdown === 0">{{ player.vote }}</span>
                  <span v-else>{{ getInitial(player.name) }}</span>
                </div>
                <div class="player-copy">
                  <p>{{ player.name }}</p>
                  <small v-if="player.vote">Ready</small>
                  <small v-else>Waiting…</small>
                </div>
                <span class="status-chip" :class="{ ready: player.vote }">
                  {{ player.vote ? 'Ready' : 'Waiting' }}
                </span>
              </div>
            </div>
            <div class="empty-state" v-else>
              Waiting for players to join. Share the invite link to bring your team in.
            </div>
          </article>

          <article class="panel">
            <div class="panel-header">
              <div>
                <h3>Round details</h3>
                <p>Pick a story and align your estimates.</p>
              </div>
            </div>
            <div class="round-body">
              <div class="inline-actions">
                <button class="ghost-button" @click="toggleTickets">Toggle tickets</button>
                <button v-if="isPRAMode" class="ghost-button danger" @click="resetPRASession">Reset PRA session</button>
              </div>
              <div class="cta-stack">
                <button
                    v-if="!playerHasVoted() && !showVotes"
                    class="primary-button"
                    disabled
                >
                  Cast your votes
                </button>
                <button
                    v-if="playerHasVoted() && !showVotes"
                    class="primary-button"
                    @click="showVotesClicked()"
                >
                  Show votes
                </button>
                <button
                    v-if="showVotes && countdown === 0"
                    class="primary-button"
                    @click="startNewGame()"
                >
                  {{ startGameMessage }}
                </button>
                <div v-if="showVotes && countdown > 0" class="countdown-pill">
                  Revealing in {{ countdown }}
                </div>
              </div>
            </div>
          </article>
        </section>

        <section class="panel vote-panel" v-if="gameFormat?.values">
          <div class="panel-header">
            <div>
              <h3>Your vote</h3>
              <p>Choose a card. You can update it until reveal.</p>
            </div>
          </div>
          <div class="vote-cards">
            <button
                v-for="vote in gameFormat?.values"
                :key="`vote-${vote}`"
                class="vote-chip"
                :class="{ selected: currentVote === vote }"
                @click="performVote(vote)"
                :disabled="showVotes && countdown === 0"
            >
              {{ vote }}
            </button>
          </div>
          <p class="helper-text">
            Keyboard: 1–9 to pick · Space to reveal · Esc to reset
          </p>
          <div class="tickets-panel" v-show="showTickets">
            <Tickets></Tickets>
          </div>
        </section>

        <section class="panel results-panel" v-if="showVotes && countdown === 0">
          <div class="panel-header">
            <div>
              <h3>Results</h3>
              <p>Share the outcome with your team.</p>
            </div>
          </div>
          <div class="results-grid">
            <div class="results-card" v-if="!isPRAMode">
              <p class="results-label">Average</p>
              <p class="results-value">{{ averageValue }}</p>
              <p class="results-label">Closest</p>
              <p class="results-value">{{ closestValue }}</p>
            </div>
            <div class="results-card" v-if="isPRAMode && praPhase === 1 && closestValue !== null">
              <div class="pra-row">
                <span>Vote average</span>
                <strong>{{ averageValue }}</strong>
              </div>
              <div class="pra-row">
                <span>Vote closest</span>
                <strong>{{ closestValue }}</strong>
              </div>
              <div class="pra-row select-row">
                <span>Final chance of failure</span>
                <select v-model="selectedFinalScore" @change="updateFinalResult">
                  <option v-for="score in [1,2,3,4,5]" :key="score" :value="score">{{ score }}</option>
                </select>
              </div>
            </div>
            <div class="results-card" v-if="isPRAMode && praPhase === 2 && praRiskScore !== null">
              <div class="pra-row">
                <span>Vote average</span>
                <strong>{{ averageValue }}</strong>
              </div>
              <div class="pra-row">
                <span>Vote closest</span>
                <strong>{{ closestValue }}</strong>
              </div>
              <div class="pra-row select-row">
                <span>Final impact</span>
                <select v-model="selectedFinalScore" @change="updateFinalResult">
                  <option v-for="score in [1,2,3,4,5]" :key="score" :value="score">{{ score }}</option>
                </select>
              </div>
            </div>
          </div>
        </section>
      </div>

      <aside v-if="isPRAMode" class="pra-panel">
        <section class="panel">
          <div class="panel-header">
            <div>
              <h3>PRA progress</h3>
              <p>Two-phase review</p>
            </div>
          </div>
          <div class="progress-section">
            <div class="progress-phase" :class="{ active: praPhase === 1 && praChanceOfFailure === null, completed: praChanceOfFailure !== null && countdown === 0 }">
              <div class="phase-header">
                <span class="phase-number">1</span>
                <span class="phase-title">Chance of failure</span>
              </div>
              <div class="phase-status" v-if="praChanceOfFailure === null">In progress…</div>
              <div class="phase-result" v-else>
                <span>Result</span>
                <strong>{{ praChanceOfFailure }}</strong>
              </div>
            </div>
            <div class="progress-phase" :class="{ active: praPhase === 2 && praImpact === null, completed: praImpact !== null && countdown === 0 }">
              <div class="phase-header">
                <span class="phase-number">2</span>
                <span class="phase-title">Impact</span>
              </div>
              <div class="phase-status" v-if="praPhase === 2 && praImpact === null">
                In progress…
              </div>
              <div class="phase-status" v-else-if="praChanceOfFailure === null">
                Pending phase 1
              </div>
              <div class="phase-result" v-else-if="praImpact !== null">
                <span>Result</span>
                <strong>{{ praImpact }}</strong>
              </div>
            </div>
            <div class="final-risk" v-if="praRiskScore !== null && countdown === 0">
              <div class="risk-score">
                <span>Risk score</span>
                <strong>{{ praRiskScore }}</strong>
              </div>
              <div class="risk-class" :class="'risk-' + (praRiskClass || '').toLowerCase()">
                {{ praRiskClass }}
              </div>
            </div>
          </div>
        </section>

        <section class="panel legend-panel">
          <div class="panel-header">
            <div>
              <h3>Legend</h3>
              <p>Chance vs impact at a glance</p>
            </div>
          </div>
          <div class="legend-section">
            <h4>Chance of failure</h4>
            <p class="legend-formula">Chance of error + Frequency / 2</p>
            <div class="legend-list">
              <div class="legend-item" v-for="(label, index) in chanceLegend" :key="`chance-${label}`">
                <span class="legend-number">{{ index + 1 }}</span>
                <span class="legend-text">{{ label }}</span>
              </div>
            </div>
          </div>
          <div class="legend-section">
            <h4>Impact</h4>
            <div class="legend-list">
              <div class="legend-item" v-for="(label, index) in impactLegend" :key="`impact-${label}`">
                <span class="legend-number">{{ index + 1 }}</span>
                <span class="legend-text">{{ label }}</span>
              </div>
            </div>
          </div>
          <div class="legend-section risk-ranges">
            <h4>Risk classification</h4>
            <div
                class="risk-range-item"
                v-for="item in riskLegend"
                :key="item.label"
                :class="`risk-${item.variant}`"
            >
              <span>{{ item.label }}</span>
              <strong>{{ item.range }}</strong>
            </div>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import Modal from "@/components/Modal.vue";
import Player from "@/view-models/player";
import {io} from "socket.io-client";
import {computed, onMounted, ref} from "vue";
import {useRoute} from "vue-router";
import Tickets from "@/components/Tickets.vue";
import {useTickets} from "@/composables/useTickets";
import {useGameEngine} from "@/composables/useGameEngine";
import PFLittleButton from "@/components/LittleButton.vue";
import Settings from "../components/SettingsModal.vue";
import Sharing from "../components/SharingModal.vue";
import GameFormat from "@/view-models/gameFormat";

let showInstallPwa = ref(false);
const modal = ref(true);
const settings = ref(false)
const showCopiedToClipboard = ref(false);
const name = ref("");
const showTickets = ref(false);
const {votingOnName, tickets} = useTickets();
const {
  socket,
  setSocket,
  players,
  showVotes,
  countdown,
  currentVote,
  gameFormat,
  closestValue,
  averageValue,
  praSession,
  praPhase,
  praChanceOfFailure,
  praImpact,
  praRiskScore,
  praRiskClass
} = useGameEngine();
const showShareModal = ref(false);
const route = useRoute();

const chanceLegend = ['Highly unlikely', 'Unlikely', 'Possible', 'Likely', 'Almost certain'];
const impactLegend = ['Negligible', 'Low', 'Moderate', 'Significant', 'Critical'];
const riskLegend = [
  {label: 'Low', range: '1-6', variant: 'low'},
  {label: 'Medium', range: '7-12', variant: 'middle'},
  {label: 'High', range: '13-25', variant: 'high'}
];
const roomCode = computed(() => {
  const raw = route.params?.id;
  return raw ? raw.toString().toUpperCase() : '----';
});
const roomTitle = computed(() => {
  if (name.value) {
    return `${name.value}'s planning session`;
  }
  return 'Planfree planning session';
});

let deferredPrompt: any;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallPwa.value = true;
});

function saveSettings(gameType: GameFormat) {
  settings.value = false;
  socket.value.emit("gameTypeChanged", gameType);
}

async function dismissModal() {
  showShareModal.value = false;
}

function installPWA() {
  deferredPrompt.prompt();
}

onMounted(() => {
  if (joiningAGame()) {
    const newSocket = io(process.env.VUE_APP_SERVER, {
      query: {
        roomId: route.params.id,
      },
    });
    setSocket(newSocket);
  }

  const storedName = localStorage.getItem("name");
  if (storedName) {
    enteredName(storedName);
  }
});

const startGameMessage = computed(() => {
  if (gameFormat.value?.isPRA) {
    if (praPhase.value === 1 && praChanceOfFailure.value !== null) {
      return 'Vote on Impact!';
    } else if (praPhase.value === 2 && praImpact.value !== null) {
      if (!tickets.value || tickets.value.every(t => t.score)) {
        return 'Start new PRA session!';
      } else {
        return 'Vote next issue!';
      }
    }
  }
  if (!tickets.value || tickets.value.every(t => t.score)) {
    return 'Start new game!'
  } else {
    return 'Vote next issue!'
  }
});

const praPhaseLabel = computed(() => {
  if (!gameFormat.value?.isPRA) return '';
  return praPhase.value === 1 ? 'Phase 1: Chance of Failure' : 'Phase 2: Impact';
});

const isPRAMode = computed(() => gameFormat.value?.isPRA === true);

const selectedFinalScore = ref<number | null>(null);

function updateFinalResult() {
  if (selectedFinalScore.value !== null) {
    socket.value.emit('praSetFinalResult', { finalScore: selectedFinalScore.value });
  }
}

// Watch for PRA value changes to set default selection in dropdown
import { watch } from 'vue';

// For Phase 1: initialize from closestValue (Chance of Failure)
watch(closestValue, (newValue) => {
  if (isPRAMode.value && praPhase.value === 1 && newValue !== null) {
    selectedFinalScore.value = newValue;
  }
});

// For Phase 2: initialize from impact (closestValue in Phase 2)
watch([praImpact, praPhase], ([newImpact, newPhase]) => {
  if (isPRAMode.value && newPhase === 2 && newImpact !== null) {
    selectedFinalScore.value = newImpact;
  }
});

// Reset selection when PRA state is reset
watch([praChanceOfFailure, praImpact], ([cof, impact]) => {
  if (cof === null && impact === null) {
    selectedFinalScore.value = null;
  }
});

function showVotesClicked() {
  socket.value.emit("show");
}

function performVote(vote: string) {
  socket.value.emit("vote", vote);
  currentVote.value = vote;
}

function startNewGame() {
  socket.value.emit("restart");
}

function resetPRASession() {
  socket.value.emit("resetPRASession");
}

function emitName(name: string) {
  socket.value.emit("name", name);
}

function enteredName(updatedName: string) {
  name.value = updatedName;
  emitName(updatedName);
  localStorage.setItem("name", updatedName);
  modal.value = false;
}

function playerHasVoted() {
  return (
      players.value.filter((p: Player) => p.vote !== null && p.vote !== undefined).length > 0
  );
}

function copyToClipboard() {
  showShareModal.value = true;
}

function goToGithub() {
  open("https://github.com/LukeGarrigan/planfree.dev");
}

function joiningAGame() {
  const currentState = socket.value;
  return (
      currentState &&
      Object.keys(currentState).length === 0 &&
      currentState.constructor === Object
  );
}


const toggleTickets = () => showTickets.value = !showTickets.value;

const getInitial = (playerName: string) => {
  if (!playerName) return '?';
  const trimmed = playerName.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
};
</script>

<style scoped lang="scss">
/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

/* Page layout */
.lobby-page {
  min-height: 100vh;
  background: var(--gray-50, #F9FAFB);
  padding: 24px 16px 48px;
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: flex-start;
}

.lobby-shell {
  flex: 1 1 720px;
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pra-panel {
  flex: 1 1 280px;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Header */
.lobby-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-mark {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg, 12px);
  background: var(--primary-600, #444CE7);
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.brand-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-900, #101828);
  margin: 0;
}

.brand-subtitle {
  font-size: 12px;
  color: var(--gray-500, #667085);
  margin: 2px 0 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.live-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: var(--radius-full, 9999px);
  background: var(--success-50, #ECFDF3);
  color: var(--success-700, #027A48);
  font-size: 12px;
  font-weight: 500;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full, 9999px);
  background: currentColor;
}

.quick-links {
  display: inline-flex;
  gap: 8px;
}

/* Buttons */
.primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: var(--radius-md, 8px);
  background: var(--primary-600, #444CE7);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid var(--primary-600, #444CE7);
  box-shadow: var(--shadow-xs);
  cursor: pointer;
  transition: all 0.15s ease;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover:not(:disabled) {
    background: var(--primary-700, #3538CD);
    border-color: var(--primary-700, #3538CD);
  }

  &:disabled {
    background: var(--gray-100, #F2F4F7);
    border-color: var(--gray-200, #EAECF0);
    color: var(--gray-400, #98A2B3);
    cursor: not-allowed;
  }
}

.secondary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: var(--radius-md, 8px);
  background: #fff;
  color: var(--gray-700, #344054);
  font-size: 14px;
  font-weight: 500;
  border: 1px solid var(--gray-300, #D0D5DD);
  box-shadow: var(--shadow-xs);
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: var(--gray-50, #F9FAFB);
  }
}

.no-pointer {
  pointer-events: none;
}

.outline-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 14px;
  border: 1px solid var(--gray-300, #D0D5DD);
  border-radius: var(--radius-md, 8px);
  background: #fff;
  font-size: 14px;
  font-weight: 500;
  color: var(--gray-700, #344054);
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: var(--gray-50, #F9FAFB);
    border-color: var(--gray-300, #D0D5DD);
  }
}

.ghost-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border: 1px solid var(--gray-300, #D0D5DD);
  border-radius: var(--radius-md, 8px);
  background: #fff;
  font-size: 13px;
  font-weight: 500;
  color: var(--gray-600, #475467);
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: var(--gray-50, #F9FAFB);
  }

  &.danger {
    color: var(--error-700, #B42318);
    border-color: var(--error-500, #F04438);
    background: var(--error-50, #FEF3F2);

    &:hover {
      background: #FEE4E2;
    }
  }
}

/* Cards and Panels */
.room-card,
.panel {
  background: #fff;
  border: 1px solid var(--gray-200, #EAECF0);
  border-radius: var(--radius-xl, 16px);
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.room-card {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  align-items: flex-start;
}

.room-text {
  flex: 1 1 60%;
  min-width: 0;
}

.eyebrow {
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--gray-500, #667085);
  margin-bottom: 4px;
}

.room-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.room-heading h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--gray-900, #101828);
  margin: 0;
}

.room-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: var(--radius-full, 9999px);
  background: var(--gray-100, #F2F4F7);
  font-size: 12px;
  font-weight: 500;
  color: var(--gray-700, #344054);
}

.room-description {
  margin: 8px 0 0;
  color: var(--gray-600, #475467);
  font-size: 14px;
  line-height: 1.5;
}

.room-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin: 16px 0 0;
  padding: 0;
}

.room-stats div {
  background: var(--gray-50, #F9FAFB);
  border-radius: var(--radius-lg, 12px);
  padding: 12px;
}

.room-stats dt {
  font-size: 12px;
  font-weight: 500;
  color: var(--gray-500, #667085);
  margin-bottom: 4px;
}

.room-stats dd {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-900, #101828);
}

.room-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Content grid */
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.panel-header {
  margin-bottom: 16px;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--gray-900, #101828);
}

.panel-header p {
  margin: 4px 0 0;
  color: var(--gray-500, #667085);
  font-size: 14px;
}

/* Player list */
.player-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.player-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--gray-200, #EAECF0);
  border-radius: var(--radius-lg, 12px);
  background: #fff;
  animation: fadeIn 0.3s ease forwards;
  opacity: 0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full, 9999px);
  background: var(--primary-600, #444CE7);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar.reveal {
  background: var(--primary-50, #EEF4FF);
  color: var(--primary-700, #3538CD);
}

.player-copy {
  flex: 1;
  min-width: 0;
}

.player-copy p {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--gray-900, #101828);
}

.player-copy small {
  font-size: 12px;
  color: var(--gray-500, #667085);
}

.status-chip {
  padding: 4px 10px;
  border-radius: var(--radius-full, 9999px);
  font-size: 12px;
  font-weight: 500;
  background: var(--gray-100, #F2F4F7);
  color: var(--gray-600, #475467);
}

.status-chip.ready {
  background: var(--success-50, #ECFDF3);
  color: var(--success-700, #027A48);
}

.empty-state {
  padding: 20px;
  border: 1px dashed var(--gray-300, #D0D5DD);
  border-radius: var(--radius-lg, 12px);
  background: var(--gray-50, #F9FAFB);
  color: var(--gray-500, #667085);
  font-size: 14px;
  text-align: center;
}

/* Round details */
.inline-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.cta-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.countdown-pill {
  display: inline-flex;
  align-items: center;
  padding: 10px 16px;
  border-radius: var(--radius-md, 8px);
  border: 1px solid var(--gray-200, #EAECF0);
  background: var(--gray-50, #F9FAFB);
  color: var(--gray-600, #475467);
  font-size: 14px;
  font-weight: 500;
}

/* Vote cards */
.vote-panel .vote-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.vote-chip {
  min-width: 48px;
  height: 44px;
  padding: 0 16px;
  border-radius: var(--radius-md, 8px);
  border: 1px solid var(--gray-300, #D0D5DD);
  background: #fff;
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-700, #344054);
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    border-color: var(--primary-300, #A4BCFD);
    background: var(--primary-25, #F5F8FF);
  }

  &.selected {
    border-color: var(--primary-600, #444CE7);
    background: var(--primary-50, #EEF4FF);
    color: var(--primary-700, #3538CD);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.helper-text {
  margin-top: 12px;
  font-size: 12px;
  color: var(--gray-500, #667085);
}

.tickets-panel {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--gray-200, #EAECF0);
}

/* Results */
.results-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.results-card {
  border: 1px solid var(--gray-200, #EAECF0);
  border-radius: var(--radius-lg, 12px);
  padding: 16px;
  background: var(--gray-50, #F9FAFB);
}

.results-label {
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  color: var(--gray-500, #667085);
}

.results-value {
  margin: 4px 0 12px;
  font-size: 24px;
  font-weight: 600;
  color: var(--gray-900, #101828);
}

/* PRA specific */
.pra-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
  color: var(--gray-700, #344054);

  &:not(:last-child) {
    border-bottom: 1px solid var(--gray-100, #F2F4F7);
  }

  strong {
    font-weight: 600;
    color: var(--gray-900, #101828);
  }
}

.pra-row select {
  padding: 6px 10px;
  border: 1px solid var(--gray-300, #D0D5DD);
  border-radius: var(--radius-md, 8px);
  background: #fff;
  font-size: 14px;
  color: var(--gray-700, #344054);

  &:focus {
    outline: none;
    border-color: var(--primary-300, #A4BCFD);
    box-shadow: 0 0 0 4px var(--primary-100, #E0EAFF);
  }
}

.progress-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-phase {
  border-radius: var(--radius-lg, 12px);
  border: 1px solid var(--gray-200, #EAECF0);
  padding: 12px;
  background: #fff;

  &.active {
    border-color: var(--primary-300, #A4BCFD);
    background: var(--primary-25, #F5F8FF);
  }

  &.completed {
    border-color: var(--success-500, #12B76A);
    background: var(--success-50, #ECFDF3);
  }
}

.phase-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.phase-number {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm, 6px);
  background: var(--primary-100, #E0EAFF);
  color: var(--primary-700, #3538CD);
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.phase-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-900, #101828);
}

.phase-status {
  font-size: 13px;
  color: var(--gray-500, #667085);
}

.phase-result {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--gray-600, #475467);

  strong {
    color: var(--gray-900, #101828);
  }
}

.final-risk {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--gray-200, #EAECF0);
}

.final-risk .risk-score {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  font-weight: 500;
  color: var(--gray-700, #344054);

  strong {
    font-size: 18px;
    color: var(--gray-900, #101828);
  }
}

.final-risk .risk-class {
  margin-top: 8px;
  text-align: center;
  padding: 8px 12px;
  border-radius: var(--radius-md, 8px);
  font-size: 14px;
  font-weight: 600;

  &.risk-low {
    background: var(--success-50, #ECFDF3);
    color: var(--success-700, #027A48);
  }

  &.risk-middle {
    background: var(--warning-50, #FFFAEB);
    color: var(--warning-700, #B54708);
  }

  &.risk-high {
    background: var(--error-50, #FEF3F2);
    color: var(--error-700, #B42318);
  }
}

/* Legend panel */
.legend-section {
  &:not(:last-child) {
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--gray-200, #EAECF0);
  }
}

.legend-panel h4 {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-900, #101828);
}

.legend-formula {
  font-size: 12px;
  color: var(--gray-500, #667085);
  margin-bottom: 12px;
}

.legend-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-number {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full, 9999px);
  background: var(--gray-100, #F2F4F7);
  font-size: 12px;
  font-weight: 600;
  color: var(--gray-700, #344054);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.legend-text {
  font-size: 13px;
  color: var(--gray-600, #475467);
}

.risk-ranges .risk-range-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-radius: var(--radius-md, 8px);
  font-size: 13px;
  font-weight: 500;

  &:not(:last-child) {
    margin-bottom: 6px;
  }

  strong {
    font-weight: 600;
  }

  &.risk-low {
    background: var(--success-50, #ECFDF3);
    color: var(--success-700, #027A48);
  }

  &.risk-middle {
    background: var(--warning-50, #FFFAEB);
    color: var(--warning-700, #B54708);
  }

  &.risk-high {
    background: var(--error-50, #FEF3F2);
    color: var(--error-700, #B42318);
  }
}

/* Animations */
@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 900px) {
  .lobby-page {
    padding: 16px 12px 32px;
  }

  .lobby-header {
    align-items: flex-start;
  }

  .room-card {
    flex-direction: column;
  }

  .room-stats {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }

  .pra-panel {
    max-width: none;
    width: 100%;
  }
}
</style>
