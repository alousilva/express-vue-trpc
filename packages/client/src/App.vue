<template>
  <div class="trpc-example">
    <h1>Vue 3 + vue-query + tRPC example</h1>
    <Error
      v-if="getMessagesHasError"
      error-message="Something went wrong - cannot fetch data"
      cta-text="Refetch data"
      @click="refetch()"
    />
    <Error
      v-if="addMessageHasError"
      error-message="Something went wrong - cannot submit message"
      cta-text="Reset error"
      @click="reset"
    />
    <div v-if="showFormAndMessages" class="trpc-example__container">
      <SendMessageForm :form="form" @submit-form="handleSubmitForm" />
      <h2 v-if="isLoading">Data is being loaded</h2>
      <Message v-for="chatMessage in data" :key="chatMessage.id" :chat-message="chatMessage" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import Message from './components/Message.vue';
import SendMessageForm from './components/SendMessageForm.vue';
import Error from './components/Error.vue';
import { useQuery, useMutation, useQueryClient } from 'vue-query';
import { trpc } from './api/trpc';
import { Form } from './types';

const queryClient = useQueryClient();

const form = reactive({
  user: '',
  message: '',
});

const getMessages = () => trpc.query('getMessages');
const {
  isError: getMessagesHasError,
  isLoading,
  data,
  refetch,
} = useQuery('getMessages', getMessages, {
  refetchOnWindowFocus: false,
});

const addMessage = (form: Form) => trpc.mutation('addMessage', form);
const { error: addMessageHasError, mutate, reset } = useMutation('addMessage', addMessage);

const handleSubmitForm = () => {
  mutate(form, {
    onSuccess: () => {
      queryClient.invalidateQueries('getMessages');
    },
  });
};

const showFormAndMessages = computed(() => {
  return !getMessagesHasError.value && !addMessageHasError.value;
});
</script>

<style scoped lang="scss">
@import './style.css';

.trpc-example {
  max-width: 800px;

  &__container {
    text-align: left;
  }
}
</style>
