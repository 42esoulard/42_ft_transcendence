<template>
  <h1>Welcome to ft_transcendence</h1>
  <div v-if="isTwoFactorEnabled">
    <h2>Please scan the QR code and enter your One Time Password</h2>
    <img :src="qrcodeURL" alt="QR code" />
    <form @submit.prevent="sendTwoFactorCode">
      <label for="code">Enter Code:</label>
      <input v-model="otp" type="text" name="code" v-focus/>
      <div class="otp_submit">
        <button>Validate code</button>
      </div>
    </form>
  </div>
  <div v-else>
    <h2>Please Login</h2>
    <button @click="logInWith42">Login with 42</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, onBeforeMount, onMounted, ref } from "vue";
import { routeLocationKey, useRoute, useRouter } from "vue-router";
import axios from "axios";

export default defineComponent({
  name: "Login",
  setup() {
    const route = useRoute();
    const router = useRouter();

    const isTwoFactorEnabled = ref(false);
    const qrcodeURL = ref("");
    const otp = ref('');

    //To exchange cookie or auth header w/o in every req
    axios.defaults.withCredentials = true;

    onBeforeMount(() => {
      router.replace('/login'); // to remove code from URL: DIRTY ?
      console.log("isTwoFactorEnabled", isTwoFactorEnabled);
      if (route.query.code) {
        const code = route.query.code;
        axios
          .get("http://localhost:3000/auth/42/login", {
            params: {
              code: code,
            },
          })
          .then((res) => {
            console.log("status", res.status);
            if (res.status === 206) {
              isTwoFactorEnabled.value = true;
              getQrCode();
            } else if (res.status === 200) {
              router.push("account"); //find a way to push to requested route, not only account ??
            }
          })
          .catch((err: any) => console.log(err.message));
      }
    });

    const logInWith42 = () => {
      window.location.href = process.env.VUE_APP_42_AUTH_URL;
    };

    const getQrCode = () => {
      if (isTwoFactorEnabled.value) {
        // Should instead append an img to html
        qrcodeURL.value = "http://localhost:3000/auth/2fa/generate";
      }
    };

    const sendTwoFactorCode = async () => {
      console.log(otp.value);
      await axios
        .post("http://localhost:3000/auth/2fa/authenticate", {
          code: otp.value,
        })
        .then((res) => {
          console.log(res);
          router.push("account");
        })
        .catch((error) => console.log(error));
    };

    return {
      logInWith42,
      isTwoFactorEnabled,
      qrcodeURL,
      otp,
      sendTwoFactorCode,
    };
  },
});
</script>

<style scoped>
.user h2 {
  background: #f4f4f4;
  padding: 20px;
  border-radius: 10px;
  margin: 10px auto;
  max-width: 600px;
  cursor: pointer;
  color: #444;
}
.user h2:hover {
  background: #ddd;
}
.user a {
  text-decoration: none;
}
form {
  max-width: 420px;
  margin: 30px auto;
  background: white;
  text-align: left;
  padding: 40px;
  border-radius: 10px;
}
label {
  color: #aaa;
  display: inline-block;
  margin: 25px 0 15px;
  font-size: 0.6em;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: bold;
}
select {
  display: block;
  padding: 10px 6px;
  width: 100%;
  box-sizing: border-box;
  border: none;
  border-bottom: 1px solid #ddd;
  color: #555;
}

.otp_submit > button {
  background: #0b6dff;
  border: 0;
  padding: 10px 20px;
  margin-top: 20px;
  color: white;
  border-radius: 20px;
}
.otp_submit {
  text-align: center;
}
.otp_submit:hover {
  opacity: 0.8;
}
.error {
  color: #ff0062;
  margin-top: 10px;
  font-size: 0.8em;
  font-weight: bold;
}
</style>
