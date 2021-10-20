<template>
<!-- THIS FILE IS NOT USES ANYMORE. IT IS THE PAGE VERSION OF THE 2FA INPUT
    KEPT HERE IN CASE WE WOULD LIKE TO NOT USE THE MODAL VERSION.
    COULD BE DELETED IF NOT
 -->
  <div class="twofa-grid tac br15">
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
      <img class="br15" :src="qrcodeURL" alt="[QR code]" />
    </div>
    <div class="tal">
      <h3 class="twofa-h3">Scan the QR code</h3>
      <p>
        Open your Authentication app and scan the following QR code with your
        phone's camera
      </p>
    </div>
    <hr class="twofa-hr" />
    <OtpInput :codeSendToUrl="codeSendToUrl" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import OtpInput from "@/components/OtpInput.vue";

export default defineComponent({
  name: "InitTwoFactor",
  components: { OtpInput },
  setup() {
    const qrcodeURL = ref("http://localhost:3000/auth/2fa/generate");
    const codeSendToUrl = ref("http://localhost:3000/auth/2fa/turn-on");
    return {
      qrcodeURL,
      codeSendToUrl,
    };
  },
});
</script>
