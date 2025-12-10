<template>
  <div>
    <h1 class="screen-reader-only">Planfree.dev game lobby</h1>
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
    <div v-if="!modal && !settings && !showShareModal" class="home">

      <div class="top-buttons">
        <button class="edit-name-button" @click="modal = true">
          <div>{{ name }}</div>
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000">
              <path d="M0 0h24v24H0V0z" fill="none"/>
              <path
                  d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z"/>
            </svg>
          </div>
        </button>
        <button v-if="!showCopiedToClipboard" class="button invite" @click="copyToClipboard()">
          <div>{{ "Invite players" }}</div>
          <div>
            <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none"
                 xmlns="http://www.w3.org/2000/svg">
              <path
                  d="M9 12C9 13.3807 7.88071 14.5 6.5 14.5C5.11929 14.5 4 13.3807 4 12C4 10.6193 5.11929 9.5 6.5 9.5C7.88071 9.5 9 10.6193 9 12Z"
                  stroke="#1C274C" stroke-width="1.5"/>
              <path d="M14 6.5L9 10" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"/>
              <path d="M14 17.5L9 14" stroke="#1C274C" stroke-width="1.5" stroke-linecap="round"/>
              <path
                  d="M19 18.5C19 19.8807 17.8807 21 16.5 21C15.1193 21 14 19.8807 14 18.5C14 17.1193 15.1193 16 16.5 16C17.8807 16 19 17.1193 19 18.5Z"
                  stroke="#1C274C" stroke-width="1.5"/>
              <path
                  d="M19 5.5C19 6.88071 17.8807 8 16.5 8C15.1193 8 14 6.88071 14 5.5C14 4.11929 15.1193 3 16.5 3C17.8807 3 19 4.11929 19 5.5Z"
                  stroke="#1C274C" stroke-width="1.5"/>
            </svg>
          </div>
        </button>
        <button v-if="!modal && showCopiedToClipboard" class="button invite copied no-hover">
          <div>{{ ("copy_to_clip") }}</div>
          <div></div>
        </button>
        <button class="fib-button" @click="toggleTickets">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
            <path
                d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h440l200 200v440q0 33-23.5 56.5T760-120H200Zm0-80h560v-400H600v-160H200v560Zm80-80h400v-80H280v80Zm0-320h200v-80H280v80Zm0 160h400v-80H280v80Zm-80-320v160-160 560-560Z"/>
          </svg>
        </button>
        <button v-if="isPRAMode" class="fib-button reset-button" @click="resetPRASession" title="Reset PRA Session">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
            <path d="M440-122q-121-15-200.5-105.5T160-440q0-66 26-126.5T260-672l57 57q-38 34-57.5 79T240-440q0 88 56 155.5T440-202v80Zm80 0v-80q87-16 143.5-83T720-440q0-100-70-170t-170-70h-3l44 44-56 56-140-140 140-140 56 56-44 44h3q134 0 227 93t93 227q0 121-79.5 211.5T520-122Z"/>
          </svg>
        </button>
      </div>

      <div class="top-left">
        <PFLittleButton type="github" popover-text="Open repo" @clicked="goToGithub()"></PFLittleButton>
        <PFLittleButton type="pwa" popover-text="Install as app" @clicked="installPWA()"></PFLittleButton>
        <PFLittleButton type="settings" popover-text="Settings" @clicked="()=>{settings = true;}"></PFLittleButton>
        <div class="voting-on" v-if="votingOnName || isPRAMode">
          <p class="voting-on-label" v-if="votingOnName">Voting on: <b>{{ votingOnName }}</b></p>
          <p class="voting-on-label pra-phase" v-if="isPRAMode">
            <b>{{ praPhaseLabel }}</b>
          </p>
        </div>
      </div>

      <button v-if="!playerHasVoted() && !showVotes" class="button no-hover">
        <span>Cast your votes</span>
      </button>
      <button v-if="playerHasVoted() && !showVotes" class="button" @click="showVotesClicked()">
        <span>Show votes!</span>
      </button>
      <button
          v-if="showVotes && countdown === 0"
          class="button start"
          @click="startNewGame()"
      >
        <span>{{ startGameMessage }}</span>
      </button>
      <button v-if="showVotes && countdown > 0" class="button no-hover">
        <span>{{ countdown }}</span>
      </button>

      <div class="players" v-for="player in players" :key="player.id">
        <div class="player" :class="{ voted: player.vote }">
          <span v-if="showVotes && countdown === 0">{{ player.vote }}</span>
        </div>
        <div class="name">
          <span>{{ player.name }}</span>
        </div>
      </div>

      <div class="options" v-if="!showVotes || (showVotes && countdown !== 0)">
        <button
            v-for="vote in gameFormat?.values"
            :key="`vote-${vote}`"
            class="fib-button"
            :class="{ current: currentVote === vote }"
            @click="performVote(vote)"
            :disabled="currentVote === vote || countdown > 0"
        >
          <span>{{ vote }}</span>
        </button>
      </div>
      <div class="results-container" v-if="showVotes && countdown === 0">
        <!-- Normal voting results (non-PRA) -->
        <div class="results" v-if="!isPRAMode">
          <div class="average">Average: {{ averageValue }}</div>
          <div class="popular">Closest: {{ closestValue }}</div>
        </div>

        <!-- PRA Phase 1 Results -->
        <div class="results pra-results" v-if="isPRAMode && praPhase === 1 && closestValue !== null">
          <div class="pra-result-row">
            <span class="pra-label">Vote Average:</span>
            <span class="pra-value">{{ averageValue }}</span>
          </div>
          <div class="pra-result-row">
            <span class="pra-label">Vote Closest:</span>
            <span class="pra-value">{{ closestValue }}</span>
          </div>
          <div class="pra-result-row final-selection">
            <span class="pra-label">Final Chance of Failure:</span>
            <select v-model="selectedFinalScore" @change="updateFinalResult" class="final-score-select">
              <option v-for="score in [1, 2, 3, 4, 5]" :key="score" :value="score">
                {{ score }}
              </option>
            </select>
          </div>
        </div>

        <!-- PRA Phase 2 Results -->
        <div class="results pra-results" v-if="isPRAMode && praPhase === 2 && praRiskScore !== null">
          <div class="pra-result-row">
            <span class="pra-label">Vote Average:</span>
            <span class="pra-value">{{ averageValue }}</span>
          </div>
          <div class="pra-result-row">
            <span class="pra-label">Vote Closest:</span>
            <span class="pra-value">{{ closestValue }}</span>
          </div>
          <div class="pra-result-row final-selection">
            <span class="pra-label">Final Impact:</span>
            <select v-model="selectedFinalScore" @change="updateFinalResult" class="final-score-select">
              <option v-for="score in [1, 2, 3, 4, 5]" :key="score" :value="score">
                {{ score }}
              </option>
            </select>
          </div>
        </div>
      </div>
      <div class="tickets" v-show="showTickets">
        <Tickets></Tickets>
      </div>

      <!-- PRA Progress Panel (Right Side) -->
      <div class="pra-progress" v-if="isPRAMode">
        <h3>PRA Progress</h3>
        <div class="progress-section">
          <div class="progress-phase" :class="{ active: praPhase === 1 && praChanceOfFailure === null, completed: praChanceOfFailure !== null && countdown === 0 }">
            <div class="phase-header">
              <span class="phase-number">1</span>
              <span class="phase-title">Chance of Failure</span>
            </div>
            <div class="phase-result" v-if="praChanceOfFailure !== null && countdown === 0">
              <span class="result-label">Result:</span>
              <span class="result-value">{{ praChanceOfFailure }}</span>
            </div>
            <div class="phase-status" v-else-if="praPhase === 1 && praChanceOfFailure === null">
              In Progress...
            </div>
          </div>

          <div class="progress-arrow">↓</div>

          <div class="progress-phase" :class="{ active: praPhase === 2 && praImpact === null, completed: praImpact !== null && countdown === 0 }">
            <div class="phase-header">
              <span class="phase-number">2</span>
              <span class="phase-title">Impact</span>
            </div>
            <div class="phase-result" v-if="praImpact !== null && countdown === 0">
              <span class="result-label">Result:</span>
              <span class="result-value">{{ praImpact }}</span>
            </div>
            <div class="phase-status" v-else-if="praPhase === 2 && praImpact === null">
              In Progress...
            </div>
            <div class="phase-status pending" v-else-if="praChanceOfFailure === null">
              Pending...
            </div>
          </div>

          <div class="progress-arrow" v-if="praRiskScore !== null && countdown === 0">↓</div>

          <div class="final-risk" v-if="praRiskScore !== null && countdown === 0">
            <div class="risk-score-display">
              <span class="risk-label">Risk Score:</span>
              <span class="risk-score">{{ praRiskScore }}</span>
            </div>
            <div class="risk-class-display" :class="'risk-' + praRiskClass?.toLowerCase()">
              {{ praRiskClass }}
            </div>
          </div>
        </div>
      </div>

      <!-- PRA Legend (Left Side) -->
      <div class="pra-legend" v-if="isPRAMode">
        <div class="legend-section">
          <h3>Chance of Failure</h3>
          <p class="legend-formula">Chance of error + Frequency / 2</p>
          <div class="legend-item">
            <span class="legend-number">1</span>
            <span class="legend-text"><strong>Highly Unlikely:</strong> Probability is extremely low.</span>
          </div>
          <div class="legend-item">
            <span class="legend-number">2</span>
            <span class="legend-text"><strong>Unlikely:</strong> Small probability this risk may occur.</span>
          </div>
          <div class="legend-item">
            <span class="legend-number">3</span>
            <span class="legend-text"><strong>Possible:</strong> Moderate likelihood; may or may not happen.</span>
          </div>
          <div class="legend-item">
            <span class="legend-number">4</span>
            <span class="legend-text"><strong>Likely:</strong> Significant probability this will occur.</span>
          </div>
          <div class="legend-item">
            <span class="legend-number">5</span>
            <span class="legend-text"><strong>Almost Certain:</strong> Expected to occur with near certainty.</span>
          </div>
        </div>

        <div class="legend-section">
          <h3>Impact</h3>
          <div class="legend-item">
            <span class="legend-number">1</span>
            <span class="legend-text"><strong>Negligible:</strong> Little to no impact.</span>
          </div>
          <div class="legend-item">
            <span class="legend-number">2</span>
            <span class="legend-text"><strong>Low:</strong> Only efficiency or administrative processes affected.</span>
          </div>
          <div class="legend-item">
            <span class="legend-number">3</span>
            <span class="legend-text"><strong>Moderate:</strong> Some inconvenience. Few parcels affected with workaround.</span>
          </div>
          <div class="legend-item">
            <span class="legend-number">4</span>
            <span class="legend-text"><strong>Significant:</strong> Visible business impact. Parcels delayed or need workaround. One or few depot(s) affected.</span>
          </div>
          <div class="legend-item">
            <span class="legend-number">5</span>
            <span class="legend-text"><strong>Critical:</strong> Immediate operational halt. Depot(s) can't function. Several depots or nationwide impact.</span>
          </div>
        </div>

        <div class="legend-section risk-ranges">
          <h3>Risk Classification Ranges</h3>
          <div class="risk-range-item risk-low">
            <span class="range-label">LOW</span>
            <span class="range-value">1-6</span>
          </div>
          <div class="risk-range-item risk-middle">
            <span class="range-label">MIDDLE</span>
            <span class="range-value">7-12</span>
          </div>
          <div class="risk-range-item risk-high">
            <span class="range-label">HIGH</span>
            <span class="range-value">13-25</span>
          </div>
        </div>
      </div>
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
    const route = useRoute();
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
</script>

<style scoped lang="scss">
.players {
  user-select: none;
  position: relative;
  top: 5em;
  width: 320px;
  height: 320px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  .player {
    border-radius: 26px;
    border: none;
    cursor: default;
    width: 64px;
    height: 80px;
    background: #f3f0f1;
    box-shadow: -6px -6px 10px rgba(255, 255, 255, 0.8),
    6px 6px 10px rgba(0, 0, 0, 0.2);
    color: #161b1f;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .name {
    margin-top: 1em;
    text-align: center;
    font-size: 26px;
  }

  .voted {
    background: #54e8dd;
  }
}

.home {
  display: flex;
  justify-content: center;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
}

.button {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 45%;
  width: 320px;
  height: 80px;
  background: #f3f0f1;
  border-radius: 32px;
  text-align: center;
  border: none;
  cursor: pointer;
  transition: all 0.1s ease-in-out;
  box-shadow: -6px -6px 10px rgba(255, 255, 255, 0.8),
  6px 6px 10px rgba(0, 0, 0, 0.2);
  color: #161b1f;

  &:hover {
    opacity: 0.3;
    box-shadow: -6px -6px 10px rgba(255, 255, 255, 0.8),
    6px 6px 10px rgba(0, 0, 0, 0.2);
  }

  &:active {
    opacity: 1;
    box-shadow: inset -4px -4px 8px rgba(255, 255, 255, 0.5),
    inset 8px 8px 16px rgba(0, 0, 0, 0.1);
  }

}

.top-left {
  display: flex;
  flex-direction: row;
  left: 20px;
  top: 35px;
  position: absolute;
  gap: 5px;

  .voting-on {
    font-family: "Montserrat", sans-serif;
    margin-left: 20px;
    font-size: 20px;
    display: flex;
    align-items: center;
    word-wrap: break-word;
    white-space: normal;
    overflow: auto;
    max-width: 40vw;
    text-align: left;
  }
}

@media only screen and (max-width: 700px) {
  .top-left {
    visibility: hidden;
  }
}

.top-buttons {
  display: flex;
  flex-direction: row;
  width: 100%;
  position: absolute;
  justify-content: flex-end;
  top: 2%;
  right: 2%;
  gap: 20px;

  .invite {
    position: relative;
    user-select: none;
    gap: 10px;
    width: 300px;
    height: 70px;
    font-size: 26px;

    svg {
      position: relative;
      left: 2px;
      top: 3px;
    }
  }

  .edit-name-button {
    position: relative;
    user-select: none;
    height: 70px;
    font-size: 26px;
    background: #f3f0f1;
    border-radius: 32px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    opacity: 0.5;
    cursor: pointer;

    &:hover {
      opacity: 1;
    }

    &:hover::before {
      transform: scaleX(1);
    }

    &:before {
      content: "";
      position: absolute;
      display: block;
      width: 100%;
      height: 2px;
      bottom: 10px;
      right: 10px;
      background-color: #000;
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }

    svg {
      position: relative;
      left: 2px;
      top: 3px;
    }
  }
}

.screen-reader-only {
  position: absolute;
  width: 0px;
  overflow: hidden;
}

.copied {
  background: #54e8dd;
}

.no-hover {
  pointer-events: none;
}

span {
  font-family: "Montserrat", sans-serif;
  font-size: 26px;
  font-weight: semibold;
  color: #161b1f;
  user-select: none;
}

.results-container {
  display: flex;
  justify-content: center;
  position: absolute;
  flex-wrap: wrap;
  height: 200px;
  gap: 30px;
  width: 90%;
  bottom: 5%;
  font-size: 20px;
  color: #54e8dd;

  .results {
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: #161b1f;
    border-radius: 26px;
    border: none;
    width: 250px;
    height: 100px;
    transition: all 0.1s ease-in-out;
    box-shadow: -6px -6px 10px rgba(255, 255, 255, 0.8),
    6px 6px 10px rgba(0, 0, 0, 0.2);

    user-select: none;
    font-family: "Montserrat", sans-serif;
    font-weight: semibold;

    &:focus {
      outline: none;
    }

    .average {
      padding: 4px;
    }
  }

  .pra-results {
    width: 350px;
    height: auto;
    padding: 20px;
    gap: 10px;

    .pra-result-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid rgba(84, 232, 221, 0.2);

      &:last-child {
        border-bottom: none;
      }

      &.pra-classification {
        margin-top: 10px;
        padding-top: 15px;
        border-top: 2px solid rgba(84, 232, 221, 0.4);
        font-size: 22px;
        font-weight: bold;
      }

      .pra-label {
        color: #54e8dd;
        opacity: 0.8;
      }

      .pra-value {
        color: #54e8dd;
        font-weight: bold;
      }

      &.risk-low .pra-value {
        color: #4ade80;
      }

      &.risk-middle .pra-value {
        color: #fbbf24;
      }

      &.risk-high .pra-value {
        color: #f87171;
      }
    }
  }
}

.pra-phase {
  color: #54e8dd;
  font-size: 18px;
  margin-top: 5px;
}

.pra-legend {
  position: fixed;
  left: 20px;
  top: 120px;
  width: 300px;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
  background: #f3f0f1;
  border-radius: 20px;
  padding: 20px;
  box-shadow: -6px -6px 10px rgba(255, 255, 255, 0.8),
  6px 6px 10px rgba(0, 0, 0, 0.2);
  font-family: "Montserrat", sans-serif;
  font-size: 12px;
  z-index: 100;

  h3 {
    font-size: 16px;
    margin: 0 0 10px 0;
    color: #161b1f;
    font-weight: bold;
  }

  .legend-section {
    margin-bottom: 25px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .legend-formula {
    font-size: 11px;
    font-style: italic;
    color: #666;
    margin: -5px 0 10px 0;
  }

  .legend-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 8px;
    gap: 8px;

    .legend-number {
      flex-shrink: 0;
      width: 22px;
      height: 22px;
      background: #54e8dd;
      color: #161b1f;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 12px;
    }

    .legend-text {
      flex: 1;
      line-height: 1.4;
      color: #161b1f;
      font-size: 12px;

      strong {
        color: #000;
      }
    }
  }

  .risk-ranges {
    .risk-range-item {
      display: flex;
      justify-content: space-between;
      padding: 10px 15px;
      border-radius: 10px;
      margin-bottom: 8px;
      font-weight: bold;
      font-size: 14px;

      &.risk-low {
        background: #4ade80;
        color: #fff;
      }

      &.risk-middle {
        background: #fbbf24;
        color: #000;
      }

      &.risk-high {
        background: #f87171;
        color: #fff;
      }

      .range-label {
        font-weight: bold;
      }

      .range-value {
        opacity: 0.9;
      }
    }
  }
}

@media only screen and (max-width: 1200px) {
  .pra-legend {
    right: auto;
    left: 20px;
    width: 280px;
    font-size: 11px;
  }
}

@media only screen and (max-width: 900px) {
  .pra-legend {
    display: none;
  }
}

.pra-progress {
  position: fixed;
  right: 20px;
  top: 120px;
  width: 280px;
  background: #f3f0f1;
  border-radius: 20px;
  padding: 20px;
  box-shadow: -6px -6px 10px rgba(255, 255, 255, 0.8),
  6px 6px 10px rgba(0, 0, 0, 0.2);
  font-family: "Montserrat", sans-serif;
  z-index: 100;

  h3 {
    font-size: 18px;
    margin: 0 0 20px 0;
    color: #161b1f;
    font-weight: bold;
    text-align: center;
  }

  .progress-section {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .progress-phase {
    background: #fff;
    border-radius: 12px;
    padding: 15px;
    border: 2px solid #e0e0e0;
    transition: all 0.3s ease;

    &.active {
      border-color: #54e8dd;
      background: rgba(84, 232, 221, 0.05);
      box-shadow: 0 0 15px rgba(84, 232, 221, 0.2);
    }

    &.completed {
      border-color: #4ade80;
      background: rgba(74, 222, 128, 0.05);
    }

    .phase-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;

      .phase-number {
        width: 30px;
        height: 30px;
        background: #e0e0e0;
        color: #161b1f;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 16px;
        flex-shrink: 0;
      }

      .phase-title {
        flex: 1;
        font-size: 14px;
        font-weight: 600;
        color: #161b1f;
      }
    }

    &.active .phase-header .phase-number {
      background: #54e8dd;
      color: #161b1f;
    }

    &.completed .phase-header .phase-number {
      background: #4ade80;
      color: #fff;
    }

    .phase-result {
      display: flex;
      justify-content: space-between;
      padding: 8px 12px;
      background: rgba(0, 0, 0, 0.03);
      border-radius: 8px;
      font-size: 13px;

      .result-label {
        color: #666;
      }

      .result-value {
        color: #161b1f;
        font-weight: bold;
      }
    }
  }

  .progress-arrow {
    text-align: center;
    color: #54e8dd;
    font-size: 20px;
    margin: -5px 0;
  }

  .final-risk-display {
    margin-top: 20px;
    padding: 20px;
    background: #161b1f;
    border-radius: 12px;
    text-align: center;

    .risk-label {
      color: #54e8dd;
      font-size: 12px;
      opacity: 0.8;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .risk-value {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 8px;

      &.risk-low {
        color: #4ade80;
      }

      &.risk-middle {
        color: #fbbf24;
      }

      &.risk-high {
        color: #f87171;
      }
    }

    .risk-score {
      color: #54e8dd;
      font-size: 14px;
      opacity: 0.9;
    }
  }
}

@media only screen and (max-width: 1400px) {
  .pra-progress {
    width: 240px;
    padding: 15px;

    h3 {
      font-size: 16px;
    }

    .progress-phase .phase-header .phase-title {
      font-size: 13px;
    }
  }
}

@media only screen and (max-width: 900px) {
  .pra-progress {
    display: none;
  }
}

.final-score-select {
  flex: 1;
  padding: 8px 12px;
  background: #161b1f;
  color: #54e8dd;
  border: 2px solid #54e8dd;
  border-radius: 8px;
  font-family: "Montserrat", sans-serif;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;

  &:hover {
    background: #2a2f35;
  }

  &:focus {
    border-color: #fff;
  }

  option {
    background: #161b1f;
    color: #54e8dd;
    padding: 8px;
  }
}

.final-selection {
  margin-top: 15px;
  padding-top: 15px !important;
  border-top: 2px solid rgba(84, 232, 221, 0.4) !important;
}

.phase-label {
  background: rgba(84, 232, 221, 0.1);
  padding: 12px 0 !important;
  margin-bottom: 10px;
  border-radius: 8px;
}

.options {
  display: flex;
  justify-content: center;
  position: absolute;
  flex-wrap: wrap;
  height: 200px;
  gap: 30px;
  width: 90%;
  bottom: 5%;
  user-select: none;
}

.fib-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f0f1;
  border-radius: 26px;
  text-align: center;
  border: none;
  cursor: pointer;
  width: 64px;
  height: 70px;
  transition: all 0.1s ease-in-out;
  box-shadow: -6px -6px 10px rgba(255, 255, 255, 0.8),
  6px 6px 10px rgba(0, 0, 0, 0.2);
  color: #161b1f;

  &:not(.current) {
    &:hover {
      opacity: 0.3;
      box-shadow: -6px -6px 10px rgba(255, 255, 255, 0.8),
      6px 6px 10px rgba(0, 0, 0, 0.2);
    }

    &:active {
      opacity: 1;
      box-shadow: inset -4px -4px 8px rgba(255, 255, 255, 0.5),
      inset 8px 8px 16px rgba(0, 0, 0, 0.1);
    }
  }

  &.current {
    background: #54e8dd;
  }
}
</style>