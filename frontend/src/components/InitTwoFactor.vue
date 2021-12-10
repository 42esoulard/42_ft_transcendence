<template>
  <div class="twofa-grid tac br15">
    <div @click="closeModal()" class="close-cross">&times;</div>
    <h2 class="twofa-h2">Activate Two-Factor Authentication</h2>
    <div>
      <img
        class="google-img"
        src="../assets/google_auth.png"
        alt="Google Authenticator"
      />
    </div>
    <div class="tal">
      <h3 class="twofa-h3">Download an Authentication App</h3>
      <p>
        Download and install a mobile/tablet application like
        <a href="https://play.google.com/store/apps/details?id=com.authy.authy"
          >Authy</a
        >
        or
        <a
          href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
          >Google Authenticator</a
        >
      </p>
    </div>
    <hr class="twofa-hr" />
    <div>
      <img class="br15 qr_code" :src="qrcodeURL" alt="[QR code]" />
    </div>
    <div class="tal">
      <h3 class="twofa-h3">Scan the QR code</h3>
      <p>
        Open your Authentication app and scan the following QR code with your
        phone's camera
      </p>
      <strong>Activation key (manual input)</strong>
      <p>{{ key }}</p>
    </div>
    <hr class="twofa-hr" />
    <OtpInput
      :authApi="authApi"
      :codeSendToUrl="codeSendToUrl"
      @close="closeModal()"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUpdated, ref } from "vue";
import OtpInput from "@/components/OtpInput.vue";
import { useAuthApi } from "@/plugins/api.plugin";
import { store } from "@/store";

export default defineComponent({
  name: "InitTwoFactor",
  components: { OtpInput },
  setup(props, { emit }) {
    const qrcodeURL = ref(
      `${process.env["VUE_APP_API_URL"]}/auth/2fa/generate`
    );
    const codeSendToUrl = ref("turn-on");
    const key = ref("No key available");
    const authApi = useAuthApi();

    const closeModal = () => {
      emit("close");
    };

    onMounted(() => {
      if (key.value == "No key available") {
        getTwoFactorKey();
      }
    });

    const getTwoFactorKey = async () => {
      authApi
        .getKey({ withCredentials: true })
        .then((res: any) => {
          key.value = res.data.key;
        })
        .catch((err) => {
          if (err && err.response)
            store.dispatch("setErrorMessage", err.response.data.message);
        });
    };

    return {
      qrcodeURL,
      codeSendToUrl,
      closeModal,
      key,
      authApi,
    };
  },
});
</script>
