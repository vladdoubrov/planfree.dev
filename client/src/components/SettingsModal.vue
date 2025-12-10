<template>
  <div class="modal-backdrop" @click.self="close">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div class="modal-header">
        <div>
          <h2 id="settings-title">Settings</h2>
          <p class="modal-subtitle">Choose your voting scale</p>
        </div>
        <button class="close-btn" @click="close" aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <div class="modal-body">
        <div class="options-grid">
          <button
              v-for="format in gameFormats"
              :key="`format-${format.name}`"
              class="option-card"
              @click="() => saveSettings(format)"
          >
            <span class="option-name">{{ format.name }}</span>
            <span class="option-values">{{ format.values?.slice(0, 5).join(', ') }}{{ format.values?.length > 5 ? '...' : '' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import GameFormat from '@/view-models/gameFormat';
import { defineEmits } from 'vue';

let gameFormats = JSON.parse(localStorage.getItem('gameTypes') || '[]');

const emit = defineEmits(['saveSettings', 'close'])

function saveSettings(vote: GameFormat) {
  emit('saveSettings', vote);
}

function close() {
  emit('close');
}
</script>

<style scoped lang="scss">
.modal-backdrop {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(16, 24, 40, 0.7);
  backdrop-filter: blur(4px);
  padding: 16px;
  z-index: 1000;
}

.modal {
  width: 100%;
  max-width: 480px;
  background: #fff;
  border-radius: var(--radius-xl, 16px);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 24px 0;
  gap: 16px;
}

.modal-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--gray-900, #101828);
  margin: 0;
}

.modal-subtitle {
  font-size: 14px;
  color: var(--gray-600, #475467);
  margin: 4px 0 0;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: var(--radius-md, 8px);
  background: transparent;
  color: var(--gray-500, #667085);
  cursor: pointer;
  transition: all 0.15s ease;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background: var(--gray-100, #F2F4F7);
    color: var(--gray-700, #344054);
  }
}

.modal-body {
  padding: 20px 24px 24px;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.option-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 16px;
  border: 1px solid var(--gray-200, #EAECF0);
  border-radius: var(--radius-lg, 12px);
  background: #fff;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;

  &:hover {
    border-color: var(--primary-300, #A4BCFD);
    background: var(--primary-25, #F5F8FF);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0px 0px 0px 4px var(--primary-100, #E0EAFF);
  }
}

.option-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-900, #101828);
}

.option-values {
  font-size: 13px;
  color: var(--gray-500, #667085);
}

@media (max-width: 480px) {
  .options-grid {
    grid-template-columns: 1fr;
  }
}
</style>
