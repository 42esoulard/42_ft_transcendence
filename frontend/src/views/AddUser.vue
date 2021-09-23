<template>
  <div v-if="!responseData">
    <h1>ADD USER</h1>
    <form @submit.prevent="handleSubmit">
      <label>Name</label>
      <input type="text" v-model="firstname" />
      <label>Lastname</label>
      <input type="text" v-model="lastname" />
      <label>Password</label>
      <input type="text" v-model="password" />
      <div>
        <button>Save User</button>
      </div>
    </form>
  </div>
  <div v-else>
    <SubmitSuccess :name="firstname" :surname="lastname" />
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, ref } from "vue";
// import axios from "axios";
import SubmitSuccess from "@/components/SubmitSuccess.vue";
import { DefaultApi } from "sdk-client";


export default defineComponent({
  components: {
    SubmitSuccess,
  },
  setup() {
    // const api = inject("api") as any;
    const firstname = ref("");
    const lastname = ref("");
    const password = ref("");
    const responseData = ref(null);
    const api = new DefaultApi();

    const handleSubmit = async () => {
      await api.saveUser({
          firstname: firstname.value,
          lastname: lastname.value,
          password: password.value,
        })
        .then((res: any) => (responseData.value = res.data))
        .catch((err: any) => console.log(err.message));

      // await axios
      //   .post("http://localhost:3000/users", {
      //     firstname: firstname.value,
      //     lastname: lastname.value,
      //     password: password.value,
      //   })
      //   .then((response) => (responseData.value = response.data))
      //   .catch((error) => {});
    };

    return { firstname, lastname, password, responseData, handleSubmit };
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
  border-radius: 20px;
}
.submit {
  text-align: center;
}
.error {
  color: #ff0062;
  margin-top: 10px;
  font-size: 0.8em;
  font-weight: bold;
}
</style>
