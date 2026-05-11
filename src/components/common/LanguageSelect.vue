<template>
  <div ref="rootRef" class="language-select">
    <button class="language-select__trigger" type="button" @click="open = !open">
      <span class="language-select__value">{{ modelValue }}</span>
      <ChevronDown :class="{ rotated: open }" :size="14" class="language-select__icon" />
    </button>
    <div v-if="open" class="language-select__menu">
      <button
        v-for="item in options"
        :key="item"
        class="language-select__option"
        :class="{ active: item === modelValue }"
        type="button"
        @click="handleSelect(item)"
      >
        {{ item }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronDown } from "lucide-vue-next";
import { onBeforeUnmount, onMounted, ref } from "vue";

defineProps<{
  modelValue: string;
  options: string[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const open = ref(false);
const rootRef = ref<HTMLElement | null>(null);

const handleSelect = (value: string) => {
  emit("update:modelValue", value);
  open.value = false;
};

const handleOutside = (event: MouseEvent) => {
  if (rootRef.value && !rootRef.value.contains(event.target as Node)) {
    open.value = false;
  }
};

onMounted(() => {
  document.addEventListener("mousedown", handleOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", handleOutside);
});
</script>

<style scoped>
.language-select {
  position: relative;
}

.language-select__trigger {
  display: flex;
  min-width: 120px;
  align-items: center;
  gap: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #ffffff;
  padding: 8px 16px;
  color: #374151;
  font-size: 13px;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.language-select__trigger:hover {
  border-color: #d1d5db;
}

.language-select__value {
  flex: 1;
  text-align: left;
}

.language-select__icon {
  color: #9ca3af;
  transition: transform 0.2s ease;
}

.rotated {
  transform: rotate(180deg);
}

.language-select__menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 50;
  min-width: 160px;
  max-height: 320px;
  overflow-y: auto;
  border: 1px solid #f3f4f6;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.12);
}

.language-select__option {
  width: 100%;
  padding: 8px 16px;
  color: #374151;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.language-select__option:hover {
  background: #f9fafb;
}

.language-select__option.active {
  background: #f5f3ff;
  color: #6c63ff;
  font-weight: 600;
}
</style>
