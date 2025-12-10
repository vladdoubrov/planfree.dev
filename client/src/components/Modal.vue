<template>
  <div class="modal-backdrop" @click.self="$emit('completed', '')">
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal-header">
        <h2 id="modal-title">{{ title }}</h2>
        <p class="modal-subtitle">Enter your name to join the session</p>
      </div>
      <div class="modal-body">
        <PFInput v-model="name" @completed="completed" :max-length="25" placeholder="Your name"></PFInput>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import PFInput from "@/components/Input.vue";

defineProps<{
  title: string
}>()

const emit = defineEmits(['completed'])

const name = ref('');
onMounted(() => {
  const input = document.getElementById('selectNameInput');
  if (input) {
    input.focus();
  }
})

function completed() {
  if (name.value && name.value.trim()) {
    emit('completed', name.value);
  }
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
  max-width: 400px;
  background: #fff;
  border-radius: var(--radius-xl, 16px);
  box-shadow: var(--shadow-xl, 0px 20px 24px -4px rgba(16, 24, 40, 0.08), 0px 8px 8px -4px rgba(16, 24, 40, 0.03));
  overflow: hidden;
}

.modal-header {
  padding: 24px 24px 0;
}

.modal-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--gray-900, #101828);
  margin: 0 0 4px;
}

.modal-subtitle {
  font-size: 14px;
  color: var(--gray-600, #475467);
  margin: 0;
}

.modal-body {
  padding: 20px 24px 24px;
}
</style>
