<template>
  <div class="input-group">
    <input
        type="text"
        id="selectNameInput"
        v-model="model"
        @input="updateValue"
        class="input"
        :maxlength="props.maxLength"
        minlength="1"
        :placeholder="placeholder"
        @keypress.enter="completed"
    />
    <button class="submit-btn" type="submit" aria-label="Submit" @click="completed">
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M7.5 4.5L13 10L7.5 15.5" stroke="currentColor" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  maxLength: {
    type: Number,
    default: 100
  }
})

let model = ref(props.modelValue);

const emit = defineEmits(['update:modelValue', 'completed']);

const updateValue = (event: any) => {
  emit('update:modelValue', event.target.value);
};

const completed = () => {
  if (model.value.length > 0) {
    emit('completed');
  }
  model.value = '';
}
</script>

<style scoped lang="scss">
.input-group {
  display: flex;
  align-items: stretch;
  gap: 8px;
}

.input {
  flex: 1;
  height: 44px;
  padding: 0 14px;
  border: 1px solid var(--gray-300, #D0D5DD);
  border-radius: var(--radius-md, 8px);
  background: #fff;
  font-size: 14px;
  font-family: inherit;
  color: var(--gray-900, #101828);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &::placeholder {
    color: var(--gray-400, #98A2B3);
  }

  &:hover {
    border-color: var(--gray-400, #98A2B3);
  }

  &:focus {
    outline: none;
    border-color: var(--primary-300, #A4BCFD);
    box-shadow: 0px 0px 0px 4px var(--primary-100, #E0EAFF), 0px 1px 2px 0px rgba(16, 24, 40, 0.05);
  }
}

.submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 1px solid var(--primary-600, #444CE7);
  border-radius: var(--radius-md, 8px);
  background: var(--primary-600, #444CE7);
  color: #fff;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background: var(--primary-700, #3538CD);
    border-color: var(--primary-700, #3538CD);
  }

  &:focus-visible {
    box-shadow: 0px 0px 0px 4px var(--primary-100, #E0EAFF), 0px 1px 2px 0px rgba(16, 24, 40, 0.05);
  }

  &:active {
    background: var(--primary-800, #2D31A6);
    border-color: var(--primary-800, #2D31A6);
  }
}
</style>
