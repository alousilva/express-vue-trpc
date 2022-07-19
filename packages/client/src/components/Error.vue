<template>
  <h2 class="error">
    {{ errorMessage }}
  </h2>
  <button @click="emit('click')">{{ ctaText }}</button>
</template>

<script setup lang="ts">

defineProps<{ ctaText: string, errorMessage: string }>();
const emit = defineEmits(['click']);
</script>

<style scoped lang="scss">
.error {
  color: red;
}
</style>
