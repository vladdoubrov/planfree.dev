<template>
  <div class="home">
    <div class="container">
      <div class="logo">
        <span class="logo-mark">Pf</span>
      </div>
      <div class="header">
        <h1>Planfree</h1>
        <p class="tagline">Free planning poker for agile teams</p>
      </div>
      <div class="actions">
        <button
            class="button primary"
            :class="{ loading: clickedStart && !hasStarted }"
            @click="startGame"
            :disabled="clickedStart"
        >
          <span v-if="!clickedStart">Start new session</span>
          <span v-else class="loading-text">
            <svg class="spinner" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-dasharray="31.4 31.4" />
            </svg>
            Connecting...
          </span>
        </button>
      </div>
      <p class="privacy" @click="goToPrivacy">Privacy Policy</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import router from "@/router";
import { io } from "socket.io-client";
import { ref, onMounted } from "vue";
import { useGameEngine } from "@/composables/useGameEngine";
import GameFormat from "@/view-models/gameFormat";

const { socket, setSocket } = useGameEngine();
const clickedStart = ref(false);
const hasStarted = ref(false);

onMounted(() => {
  startGame();
})

function startGame() {
  clickedStart.value = true;
  setTimeout(() => {
    if (!hasStarted.value) {
      alert("Unable to connect to the server. Please check your internet connection or try again later.");
      clickedStart.value = false;
    }
  }, 6000);
  registerSocket();
}

function goToPrivacy() {
  router.push({ path: "/privacy" });
}

function registerSocket() {
  const newSocket = io(process.env.VUE_APP_SERVER);
  setSocket(newSocket);
  socket.value.on("room", (roomId: string) => {
    hasStarted.value = true;
    router.push({ path: `/game/${roomId}` });
  });
  socket.value.on("gameTypes", (gameTypes: GameFormat[]) => {
    localStorage.setItem("gameTypes", JSON.stringify(gameTypes));
  });
}
</script>

<style scoped lang="scss">
.home {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
  background: var(--gray-50, #F9FAFB);
}

.container {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: var(--radius-xl, 16px);
  border: 1px solid var(--gray-200, #EAECF0);
  padding: 40px 32px;
  box-shadow: var(--shadow-lg);
  text-align: center;
}

.logo {
  margin-bottom: 24px;
}

.logo-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg, 12px);
  background: var(--primary-600, #444CE7);
  color: #fff;
  font-size: 20px;
  font-weight: 600;
}

.header {
  margin-bottom: 32px;
}

.header h1 {
  font-size: 24px;
  font-weight: 600;
  color: var(--gray-900, #101828);
  margin: 0 0 8px;
}

.tagline {
  font-size: 15px;
  color: var(--gray-600, #475467);
  margin: 0;
}

.actions {
  margin-bottom: 24px;
}

.button {
  width: 100%;
  padding: 12px 20px;
  border-radius: var(--radius-md, 8px);
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.button.primary {
  background: var(--primary-600, #444CE7);
  color: #fff;
  box-shadow: var(--shadow-xs);
}

.button.primary:hover:not(:disabled) {
  background: var(--primary-700, #3538CD);
}

.button.primary:disabled {
  cursor: default;
}

.button.loading {
  background: var(--primary-600, #444CE7);
}

.loading-text {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.spinner {
  width: 18px;
  height: 18px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.privacy {
  font-size: 13px;
  color: var(--gray-500, #667085);
  cursor: pointer;
  margin: 0;
}

.privacy:hover {
  color: var(--primary-600, #444CE7);
  text-decoration: underline;
}
</style>
