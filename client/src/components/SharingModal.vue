<template>
  <div class="modal-backdrop" @click.self="close">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="share-title">
      <div class="modal-header">
        <div>
          <h2 id="share-title">Invite teammates</h2>
          <p class="modal-subtitle">Share the link or scan the QR code</p>
        </div>
        <button class="close-btn" @click="close" aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <div class="modal-body">
        <div v-if="!showQRCode" class="share-options">
          <button class="share-option" @click="copyLink">
            <div class="option-icon">
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M4.16667 12.5C3.39167 12.5 2.64833 12.1917 2.10167 11.645C1.555 11.0983 1.24667 10.355 1.24667 9.58C1.24667 8.805 1.555 8.06167 2.10167 7.515C2.64833 6.96833 3.39167 6.66 4.16667 6.66H7.5V8.33H4.16667C3.83167 8.33 3.51 8.46333 3.27333 8.7C3.03667 8.93667 2.90333 9.25833 2.90333 9.59333C2.90333 9.92833 3.03667 10.25 3.27333 10.4867C3.51 10.7233 3.83167 10.8567 4.16667 10.8567H7.5V12.5267H4.16667V12.5ZM5.83333 10.4167V8.75H14.1667V10.4167H5.83333ZM12.5 12.5V10.8333H15.8333C16.1683 10.8333 16.49 10.7 16.7267 10.4633C16.9633 10.2267 17.0967 9.905 17.0967 9.57C17.0967 9.235 16.9633 8.91333 16.7267 8.67667C16.49 8.44 16.1683 8.30667 15.8333 8.30667H12.5V6.66667H15.8333C16.6083 6.66667 17.3517 6.975 17.8983 7.52167C18.445 8.06833 18.7533 8.81167 18.7533 9.58667C18.7533 10.3617 18.445 11.105 17.8983 11.6517C17.3517 12.1983 16.6083 12.5067 15.8333 12.5067H12.5V12.5Z" fill="currentColor"/>
              </svg>
            </div>
            <div class="option-text">
              <span class="option-title">Copy link</span>
              <span class="option-desc">Share via your favorite app</span>
            </div>
          </button>

          <button class="share-option" @click="showQR">
            <div class="option-icon">
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M2.5 7.5V3.33333C2.5 2.89131 2.67559 2.46738 2.98816 2.15482C3.30072 1.84226 3.72464 1.66667 4.16667 1.66667H7.5V3.33333H4.16667V7.5H2.5Z" fill="currentColor"/>
                <path d="M2.5 16.6667V12.5H4.16667V16.6667H7.5V18.3333H4.16667C3.72464 18.3333 3.30072 18.1577 2.98816 17.8452C2.67559 17.5326 2.5 17.1087 2.5 16.6667Z" fill="currentColor"/>
                <path d="M15.8333 18.3333H12.5V16.6667H15.8333V12.5H17.5V16.6667C17.5 17.1087 17.3244 17.5326 17.0118 17.8452C16.6993 18.1577 16.2754 18.3333 15.8333 18.3333Z" fill="currentColor"/>
                <path d="M17.5 7.5H15.8333V3.33333H12.5V1.66667H15.8333C16.2754 1.66667 16.6993 1.84226 17.0118 2.15482C17.3244 2.46738 17.5 2.89131 17.5 3.33333V7.5Z" fill="currentColor"/>
                <path d="M5.83333 5.83333H9.16667V9.16667H5.83333V5.83333Z" fill="currentColor"/>
                <path d="M10.8333 5.83333H14.1667V9.16667H10.8333V5.83333Z" fill="currentColor"/>
                <path d="M5.83333 10.8333H9.16667V14.1667H5.83333V10.8333Z" fill="currentColor"/>
                <path d="M10.8333 10.8333H14.1667V14.1667H10.8333V10.8333Z" fill="currentColor"/>
              </svg>
            </div>
            <div class="option-text">
              <span class="option-title">Show QR code</span>
              <span class="option-desc">Scan from another device</span>
            </div>
          </button>

          <button v-if="canShare" class="share-option" @click="nativeShare">
            <div class="option-icon">
              <svg viewBox="0 0 20 20" fill="none">
                <path d="M15 6.66667C16.3807 6.66667 17.5 5.54738 17.5 4.16667C17.5 2.78595 16.3807 1.66667 15 1.66667C13.6193 1.66667 12.5 2.78595 12.5 4.16667C12.5 5.54738 13.6193 6.66667 15 6.66667Z" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M5 12.5C6.38071 12.5 7.5 11.3807 7.5 10C7.5 8.61929 6.38071 7.5 5 7.5C3.61929 7.5 2.5 8.61929 2.5 10C2.5 11.3807 3.61929 12.5 5 12.5Z" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M15 18.3333C16.3807 18.3333 17.5 17.214 17.5 15.8333C17.5 14.4526 16.3807 13.3333 15 13.3333C13.6193 13.3333 12.5 14.4526 12.5 15.8333C12.5 17.214 13.6193 18.3333 15 18.3333Z" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M7.15833 11.2583L12.85 14.575" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12.8417 5.425L7.15833 8.74167" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="option-text">
              <span class="option-title">Share</span>
              <span class="option-desc">Use system share menu</span>
            </div>
          </button>
        </div>

        <div v-else class="qr-view">
          <div class="qr-container">
            <qrcode-vue :value="qrValue" :level="level" :render-as="renderAs" :size="180"/>
          </div>
          <button class="back-btn" @click="showQRCode = false">
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M15.8333 10H4.16667M4.16667 10L10 15.8333M4.16667 10L10 4.16667" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Back to options
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import QrcodeVue, { Level, RenderAs } from 'qrcode.vue';

const qrValue = ref('')
const showQRCode = ref(false);
const level = ref<Level>("H")
const renderAs = ref<RenderAs>('svg')

const emit = defineEmits(['dismissModal'])

const canShare = computed(() => typeof navigator.share === 'function');

function showQR() {
  qrValue.value = window.location.href
  showQRCode.value = true;
}

function close() {
  showQRCode.value = false;
  emit('dismissModal')
}

async function copyLink() {
  await navigator.clipboard.writeText(window.location.href);
  close();
}

async function nativeShare() {
  try {
    await navigator.share({
      title: "Join my planning session",
      url: window.location.href,
    });
  } catch (err) {
    console.error(`There was an issue sharing: ${err}`);
  }
  close();
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
  z-index: 1100;
}

.modal {
  width: 100%;
  max-width: 400px;
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

.share-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.share-option {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px;
  border: 1px solid var(--gray-200, #EAECF0);
  border-radius: var(--radius-lg, 12px);
  background: #fff;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;

  &:hover {
    border-color: var(--gray-300, #D0D5DD);
    background: var(--gray-50, #F9FAFB);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0px 0px 0px 4px var(--gray-100, #F2F4F7);
  }
}

.option-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md, 8px);
  background: var(--gray-100, #F2F4F7);
  color: var(--gray-600, #475467);
  flex-shrink: 0;

  svg {
    width: 20px;
    height: 20px;
  }
}

.option-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.option-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--gray-700, #344054);
}

.option-desc {
  font-size: 13px;
  color: var(--gray-500, #667085);
}

.qr-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.qr-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--gray-50, #F9FAFB);
  border: 1px solid var(--gray-200, #EAECF0);
  border-radius: var(--radius-lg, 12px);
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid var(--gray-300, #D0D5DD);
  border-radius: var(--radius-md, 8px);
  background: #fff;
  color: var(--gray-700, #344054);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background: var(--gray-50, #F9FAFB);
  }
}
</style>
