<template>
  <div
    class="avatar"
    :class="{ clickable }"
    :style="avatarStyle"
    @click="handleClick"
  >
    <slot>{{ initials }}</slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(defineProps<{
  initials: string;
  size?: number;
  color?: string;
  rounded?: string;
  clickable?: boolean;
}>(), {
  size: 32,
  color: "#6C63FF",
  rounded: "999px",
  clickable: false,
});

const emit = defineEmits<{
  click: [];
}>();

const avatarStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  borderRadius: props.rounded,
  background: `linear-gradient(135deg, ${props.color} 0%, ${props.color}bb 100%)`,
  fontSize: `${props.size * 0.38}px`,
}));

const handleClick = () => {
  if (props.clickable) {
    emit("click");
  }
};
</script>

<style scoped>
.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #ffffff;
  font-weight: 700;
  user-select: none;
}

.clickable {
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.clickable:hover {
  opacity: 0.82;
}
</style>
