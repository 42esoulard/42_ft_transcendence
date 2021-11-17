<template>
  <h1>SUCCESS</h1>
  <p>
    The new user <strong>{{ name }} {{ surname }}</strong> as been saved to
    database
  </p>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "SubmitSuccess",
  props: ["name", "surname"],
});
</script>
