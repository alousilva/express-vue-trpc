<script setup lang="ts">
import { reactive } from 'vue';
import Message from './components/Message.vue';
import { useQuery, useMutation, useQueryClient } from 'vue-query';
import { trpc } from './api/trpc';

const queryClient = useQueryClient();

const getMessages = () => trpc.query('getMessages');
const {
  isError: getMessagesHasError,
  isLoading,
  data,
  refetch,
} = useQuery('getMessages', getMessages, {
  refetchOnWindowFocus: false,
});

const addMessage = (form: { user: string; message: string }) =>
  trpc.mutation('addMessage', form);
const {
  error: addMessageHasError,
  mutate,
  reset,
} = useMutation('addMessage', addMessage);

const handleSubmit = () => {
  mutate(form, {
    onSuccess: () => {
      queryClient.invalidateQueries('getMessages');
    },
  });
};

const form = reactive({
  user: '',
  message: '',
});
</script>

<template>
  <div class="trpc-example">
    <h1 v-if="getMessagesHasError" class="trpc-example__error">
      Something went wrong - cannot fetch data
      <button @click="refetch()">Refetch data</button>
    </h1>
    <h1 v-if="addMessageHasError" class="trpc-example__error">
      Something went wrong - cannot submit message
      <button @click="reset">Reset error</button>
    </h1>
    <div
      v-if="!getMessagesHasError && !addMessageHasError"
      class="trpc-example__container"
    >
      <form @submit.prevent="handleSubmit" class="trpc-example__form">
        <div class="trpc-example__form-user">
          <label for="user">User:</label>
          <input type="text" id="user" v-model="form.user" required />
        </div>
        <div class="trpc-example__form-message">
          <label for="message">Message:</label>
          <input type="text" id="message" v-model="form.message" required />
        </div>
        <button type="submit">Add message</button>
      </form>
      <h2 v-if="isLoading">Data is being loaded</h2>
      <Message
        v-for="chatMessage in data"
        :key="chatMessage.id"
        :chat-message="chatMessage"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
@import './style.css';

.trpc-example {
  max-width: 500px;

  &__error {
    color: red;
  }

  &__container {
    text-align: left;
  }

  &__form {
    display: flex;
  }
}
</style>
