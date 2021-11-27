<template>
  <div v-if="!responseData">
    <h1>ADD USER</h1>
    <form @submit.prevent="handleSubmit">
      <label>username</label>
      <input type="text" v-model="username" />
      <div>
        <button>Save User</button>
      </div>
    </form>
  </div>
  <div v-else>
    <SubmitSuccess :name="username" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import SubmitSuccess from "@/components/SubmitSuccess.vue";
import { useUserApi } from "@/plugins/api.plugin";

export default defineComponent({
  components: {
    SubmitSuccess,
  },
  setup() {
    const username = ref("");
    const responseData = ref(null);
    const api = useUserApi();

    const handleSubmit = async () => {
      await api
        .saveUser({
          username: username.value,
          two_fa_enabled: false,
          forty_two_login: username.value,
        })
        .then((res: any) => (responseData.value = res.data))
        .catch((err: any) => console.log(err.response.data.message));
    };

    return { username, responseData, handleSubmit };
  },
});
</script>
<style scoped>
form {
  max-width: 420px;
  margin: 15px auto;
  background: white;
  text-align: left;
  padding: 15px;
  border-radius: 10px;
}
label {
  color: #aaa;
  display: inline-block;
  margin: 0 0 10px 0;
  font-size: 0.8em;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: bold;
}
input {
  display: block;
  padding: 10px 6px;
  margin-bottom: 40px;
  width: 100%;
  box-sizing: border-box;
  border: none;
  border-bottom: 1px solid #ddd;
  color: #555;
}
button {
  border: 0;
  padding: 10px 20px;
  margin-top: 20px;
  border-radius: 10px;
}
.submit {
  text-align: center;
}
</style>
