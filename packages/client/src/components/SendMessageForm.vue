<template>
  <form class="send-message-form" @submit.prevent="emit('submit-form')">
    <div class="send-message-form__user">
      <label for="user">User:</label>
      <input type="text" id="user" v-model="form.user" required />
    </div>
    <div class="send-message-form__message">
      <label for="message">Message:</label>
      <input type="text" id="message" v-model="form.message" required />
    </div>
    <button type="submit">Add message</button>
  </form>
</template>

<script setup lang="ts">
import { Form } from '../types';

defineProps<{ form: Form }>();
const emit = defineEmits(['submit-form']);
</script>

<style scoped lang="scss">
.send-message-form {
  display: flex;
  gap: 15px;
}
</style>
