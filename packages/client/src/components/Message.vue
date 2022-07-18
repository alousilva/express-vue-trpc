<template>
  <div class="message">
    <span class="message__user">{{ chatMessage.user }}: </span>
    <span class="message__text">{{ chatMessage.message }}</span>
  </div>
</template>

<script setup lang="ts">
import { ChatMessage } from 'api-server/router/app';

defineProps<{ chatMessage: ChatMessage }>();
</script>

<style scoped lang="scss">
.message {
  &__user {
    font-weight: bold;
  }
}
</style>
