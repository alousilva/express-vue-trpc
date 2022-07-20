## Table of contents
- [Introduction](#introduction)
- [Setup](#setup)
  - [Project folder structure](#project-folder-structure)
  - [Server script](#server-script)
  - [Router](#router)
  - [Vue Query initialization](#vue-query-initialization)
  - [tRPC Client](#trpc-client)
  - [App component](#app-component)
- [App and examples](#app-and-examples)
- [More useful links](#more-useful-links)

## Introduction
Recently I was googling about trends in web dev to update myself on modern tools/libs/frameworks and I stumbled upon tRPC.

tRPC stands for **TypeScript remote procedure call**, and as you can read on its homepage, its purpose is to easily have End-to-end typesafe APIs. Essentially allows you to expose server functions that are callable from your client, your frontend, using all the goodies from TS.

Official [tRPC website](https://trpc.io/), a nice [collection of examples](https://trpc.io/docs/awesome-trpc) and its [docs](https://trpc.io/docs).

tRPC is another way of ensuring a correct communication between client and server (via api calls). You might be already thinking about GraphQL to do so, but with tRPC you don't need to learn a new language, nor it is a schema. Whereas GraphQL is a schema and a language, that you use to detail the "shape" of the functions you can call from the server.

**The experiment**: Why not give it a shot using the latest **Vue** version, **Vite**, **TypeScript** and trying to plug in **tRPC** and see how it goes?
I tried to search for Vue based projects using tRPC and the vast majority of my hits were about React/Next.js based ones... So I decided to just start with a React based one and then experiment from that point on.

_**Notes**:_
_- I will link all the relevant resources throughout the article_
_- This is just an experimental idea, to plug in several modern packages and create a very simplistic project_
_- This article is more towards people that have already some experience in web dev, however I'll try to provide some additional explanations_

## Setup
As a starting point I watched [Jack Herrington](https://twitter.com/jherr)'s great video on "[tRPC: Smart and Easy APIs](https://youtu.be/Lam0cYOEst8)", followed his steps and wondered how hard would it be to use Vue 3 and [Vue Query](https://github.com/DamianOsipiuk/vue-query), instead of React and React Query, respectively.

The next section shows how the final folder structure looks like, based on Jack's steps and after modifying it to use Vue.

### Project folder structure
![folder structure](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/w7ig8il0vr24e8qkxntj.png)

It's a monorepo that uses yarn workspaces.
The server project is in the **api-server** folder and the frontend project is in the **client** folder.

Both server and client start up by running `yarn start` on the root dir, as you can see in the package.json in the root folder:
`"start": "concurrently \"wsrun --parallel start\""`

### Server script
This is the server code, where we create our express app and tell it to use cors (to allow the calls from port 3000 to 8080) and also to use the trpcExpress middleware and register the router.

```js
// packages\api-server\index.ts
import express from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from './router/app';
import cors from 'cors';

const main = async () => {
  const app = express();
  app.use(cors());
  const port = 8080;

  app.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext: () => null,
    })
  );

  app.listen(port, () => {
    console.log(`api-server listening at http://localhost:${port}`);
  });
};

main();
```

### Router
The following code shows the router, which contains the access points:
- 2 query endpoints (similar to a rest GET endpoint):
  - **greetings**
  - **getMessages**
- 1 mutation endpoint (similar to a rest POST endpoint):
  - **addMessage**

You can also see that I'm using [zod](https://github.com/colinhacks/zod), which is a "TypeScript-first schema declaration and validation library".

This package is going to be used to validate my inputs for queries/mutations (If needed, those validations can even throw validation messages).

_**Note**: And you can also use zod to infer types from zod objects, storing them as types and reusing them anywhere_:
```js
z.string().uuid({ message: "Invalid UUID" });
```

```js
// packages\api-server\router\app.ts
import * as trpc from '@trpc/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

export interface ChatMessage {
  id: string;
  user: string;
  message: string;
}

const messages: ChatMessage[] = [
  { id: uuidv4(), user: 'User1', message: 'This is my the first message!' },
  { id: uuidv4(), user: 'User2', message: 'Hello there 🎉' },
];

export const appRouter = trpc
  .router()
  .query('greetings', {
    resolve() {
      return {
        message: 'Greetings from /trpc/greetings:)',
      };
    },
  })
  .query('getMessages', {
    input: z.number().default(10),
    resolve({ input }) {
      return messages.slice(-input);
    },
  })
  .mutation('addMessage', {
    input: z.object({
      user: z.string(),
      message: z.string(),
    }),
    resolve({ input }) {
      const newMessage: ChatMessage = {
        id: uuidv4(),
        ...input,
      };
      messages.push(newMessage);
      return input;
    },
  });

export type AppRouter = typeof appRouter;
```
The **messages** will be only stored in memory in this case, because I'm not using a DB to do that. (and makes it quicker to demo something).
It is also possible to create different routers which will contain different queries/mutations and then you can merge the routers to easily access a particular query from a router, on the client.

### Vue Query initialization
This is how you initialize vue-query through VueQueryPlugin, in the main.ts file, which then gets used by the Vue application instance:

```js
// packages\client\src\main.ts
import { createApp } from 'vue';
import { VueQueryPlugin } from 'vue-query';
import './style.css';
import App from './App.vue';

createApp(App).use(VueQueryPlugin).mount('#app');
```

Why using Vue Query in the first place, you might ask?
_"I could have done all the api calls using fetch/axios, right?"_

True, however, this package offers neat features out of the box, such as caching, retry, refetch, infinite query (for infinite scroll), etc. Here are some challenges that might arise in your project with the increase of its complexity (Taken from the [official docs](https://vue-query.vercel.app/#/)):

- Caching... (possibly the hardest thing to do in programming)
- Deduping multiple requests for the same data into a single request
- Updating "out of date" data in the background
- Knowing when data is "out of date"
- Reflecting updates to data as quickly as possible
- Performance optimizations like pagination and lazy loading data
- Managing memory and garbage collection of server state
- Memoizing query results with structural sharing

And the hooks offer a set of standard props/functions for you to use in your app. Example of the useQuery hook:
![Example of useQuery](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ty7mduntr3iq2r1asayb.png)
_**Note**: The data that you need to access is in the, conviniently named, **data** prop._

### tRPC client
Here we are stating what is the url that we need to use from our tRPC client calls and also the types that we can use, coming from AppRouter. (Later on we will import this trpc const in the App.vue component):

```js
// packages\client\src\api\trpc.ts
import { createTRPCClient } from '@trpc/client';
import { AppRouter } from 'api-server/router/app';

export const trpc = createTRPCClient<AppRouter>({
  url: 'http://localhost:8080/trpc',
});
```

### App component
For simplicity sake, this is the component where I decided to execute the tRPC client calls.
_**Note**: I'm using Vue's script setup and having fun with it so far :)_

```vue
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
import { Form } from '../types';

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
```

## App and examples
The best way to interact with this project is, obviously, by running it locally and see what you can do with it. But here are some examples:

This is how the client looks like (yes, I know, the UI looks fabulous!):
![client running on localhost:3000](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/4ar50q36c17ly43njreo.png)

Data coming from /trpc/greetings:
![greetings example data](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/5250s4hjtqo9efz3xm72.png)
 
Data coming from /trpc/getMessages:
![getMessages example data](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/qf8oqnbr5nhgci1uap64.png)

Examples of changing server side functions and observing TS safety checks on the client:
![Ts safety 1](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/r223lhfxuhy93kmvti5p.gif)![Ts safety 2](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/vgguekeect4b1ybdkqoa.gif)

You can also rename your server functions from the client (for some reason I was not able to rename the symbol from the server):
![Ts safety](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/fpjbweq9ttkgd6m5i6ug.gif) 

Example of blocking a query request and see the refetch and retries in action:
![Refetch](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ba09zz8mp2nm9d9gap9h.gif)

Example of blocking a mutation request and see the reset in action. This resets the error state:
![Reset error](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/t7kr3r1m8bda86mpbz6e.gif)

## More useful links
- My repo: https://github.com/alousilva/express-vue-trpc
- Alex, the creator of tRPC: https://twitter.com/alexdotjs
- Theo - ping․gg, interview with Alex: https://www.youtube.com/watch?v=Mm3Z5c1Linw (btw, Theo has a ton of interesting contents on his youtube channel)
- Learn with Jason, interview with Alex: https://www.youtube.com/watch?v=GryES84SSEU

I might create another repo to explore a more realistic project using Nuxt, tRPC, Vue Query, where I connect to a database and use the ORM Prisma, similarly to what Alex did in this pretty neat starter repo: https://github.com/trpc/examples-next-prisma-starter

Hope you found this article useful and that it allowed you to discover something today :)