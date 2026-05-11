<template>
  <component :is="iconComponent" v-bind="$attrs" />
</template>

<script setup lang="ts">
import {
  BarChart2,
  BookOpen,
  FileText,
  Github,
  Globe,
  Grid3x3,
  Hash,
  Image,
  Lightbulb,
  Mail,
  MessageSquare,
  Music2,
  Rocket,
  Search,
  Send,
  TrendingUp,
  Tv,
  Users,
  Video,
  Youtube,
} from "lucide-vue-next";
import { computed } from "vue";

const props = defineProps<{
  name: string;
}>();

const iconMap = {
  BarChart2,
  BookOpen,
  FileText,
  Github,
  Globe,
  Grid3x3,
  Hash,
  Image,
  Lightbulb,
  Mail,
  MessageSquare,
  Music2,
  Rocket,
  Search,
  Send,
  TrendingUp,
  Tv,
  Users,
  Video,
  Youtube,
};

const iconComponent = computed(() => iconMap[props.name as keyof typeof iconMap] ?? Globe);
</script>
