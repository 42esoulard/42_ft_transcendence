<template>
  <!-- 
    - Name? [check it doesn't exist yet in db]
    - Type [radio buttons]: public? Private (newcomers must be invited by a member)?
    password-protected (newcomers can join provided they know the room password)?
    - If password-protected: [check regex OK, check password match]
      1) please enter a password for the room (a-zA-Z0-9/*-+_):
      2) please re-enter the password:
  -->
  <div class='formContainer'>
    <form @submit.prevent='submitInputs()'>
      <h2>New channel</h2>

      <label class="subtitle" for='name'>Channel name:*</label>
      <input required type="text" name='name' id='chanName' placeholder='My Cool Channel' minlength="1" maxlength="200" v-model="channelName" @input="checkName()">
      
      <div class="channelAccessContainer">
        <label class="subtitle">Channel access:*</label>
        <label class='radioContainer'  title='A public channel is visible and accessible to any member' id='public'>
          <input type='radio' class='radioUnit' id='chanPublic' name='unit' value='public' v-model="channelType">Public
        </label>
        <label class='radioContainer'  title='An invite-only channel is only accessible to members who have been invited to join by a channel member' id='Private (invite-only)'>
          <input type='radio' class='radioUnit' id='chanPrivate' name='unit' value='private' v-model="channelType">Private (invite-only)
        </label>
        <label class='radioContainer'  title='A password-protected channel is accessible to any member who possesses the channel password set by the admin' id='Private (password-protected)'>
          <input type='radio' class='radioUnit' id='chanPassword-protected' name='unit' value='password-protected' v-model="channelType">Private (password-protected)
        </label>
      </div>

      <div v-if="channelType === 'password-protected'">
        <label for='password'>Channel password:*</label>
        <input required type="text" name='password' id='password' placeholder="Password" minlength="8" maxlength="20" v-model="channelPassword" @input="checkPassword()">
        <label for='passwordConfirmation'>Please confirm the channel password:*</label>
        <input required type="text" name='passwordConfirmation' id='passwordConfirmation' placeholder="Password" v-model="channelPasswordConf" @input="checkPasswordConf()">
      </div>

      <button type='submit'>Submit</button>
    </form>
  </div>
</template>

<script lang="ts">
import { ref } from "vue"
import { defineComponent } from "vue";
import { Socket, io } from "socket.io-client"
import { DefaultApi } from "@/../sdk/typescript-axios-client-generated";
import { socket } from "./ChatComponent.vue"
 
export default defineComponent({
  name: 'NewChannelForm',
  setup() {
    const api = new DefaultApi();

    const channelName = ref('');
    const channelType = ref('public');
    const channelPassword = ref('');
    const channelPasswordConf = ref('');

    let validName = true;
    let validPassword = true;
    let validPasswordConf = true;

    const errors: Array<string> = [];

    const checkName = () => {
      const nameInput =  <HTMLInputElement>document.querySelector('input[id=\'chanName\']')!;

      api.getChannelByName(channelName.value)
      .then(() => { 
        nameInput.setCustomValidity("A channel named [" + channelName.value + "] already exists")
        validName = false;
      })
      .catch(() => {
        nameInput.setCustomValidity('');
        validName = true;
        console.log(channelName.value + "not found")
      })
    }

    const checkPassword = () => {
      const passwordInput = <HTMLInputElement>document.querySelector('input#password')!;

      if (!/^[-_*-+/a-zA-Z0-9]*$/.test(channelPassword.value)) {
        passwordInput.setCustomValidity("Channel password must be 8-20 characters long and only contain letters, numbers, or the following symbols -_*-+/");
        validPassword = false;
      } else if (!validPassword) {
        passwordInput.setCustomValidity('');
        validPassword = true;
      }
      if (channelPasswordConf.value)
        checkPasswordConf();
    }

    const checkPasswordConf = () => {
      const passwordConfirmationInput = <HTMLInputElement>document.querySelector('input#passwordConfirmation')!;

      if (channelPasswordConf.value !== channelPassword.value) {
        passwordConfirmationInput.setCustomValidity("Password and password confirmation don't match");
        validPasswordConf = false;
      } else if (!validPasswordConf) {
        passwordConfirmationInput.setCustomValidity('');
        validPasswordConf = true;
      }
    }
    
    const submitInputs = () => {
 
      checkName();
      if (channelType.value === 'password-protected') {
        checkPassword();
        checkPasswordConf();
        if (!validPassword || !validPasswordConf)
          return;
      }
      if (!validName)
        return;
      console.log(channelName.value, channelType.value, channelPassword.value)
      const newChannel = api.saveChannel({
        name: channelName.value,
        // ownerId: api.getCurrentUserId
        ownerId: 1, // API MUST FETCH THE CURRENT USER ID
        type: channelType.value,
        password: channelPassword.value
      })
      .then((res) => {
        console.log("in createRoom res", res)
        socket.emit('createRoom', res.data)
        // console.log("AAA", res.data)
        // console.log("BBB", res.data.ownerId)
      //   api.saveChannelMember({
      //     channelId: res.data.id,
      //     userId: res.data.ownerId, // API MUST FETCH THE CURRENT USER ID
      //     isAdmin: true
      //   })
      //   .then(() => {
      //     socket.emit('createRoom', {
      //     name: channelName.value,
      //     // ownerId: api.getCurrentUserId
      //     ownerId: 1, // API MUST FETCH THE PROPER USER ID
      //     type: channelType.value,
      //     password: channelPassword.value
      // })
      //   })
      //   .catch((err) => console.log('Failed to join channel' + channelName.value + ':' + err));
        // socket.emit('createRoom', channelName.value)
      })
      .catch((err) => console.log("Failed to create channel: ", err))

      
    }

    return {
      channelName,
      channelType,
      channelPassword,
      channelPasswordConf,
      checkName,
      checkPassword,
      checkPasswordConf,
      submitInputs,
      errors

    }
  }
});
</script>

<style scoped>
.formContainer {
  position: absolute;
  background-color: rgba(36, 36, 36, 0.897);
  color:white;
  width: 300px;
  padding: 15px;
  left: 50%;
  top:50%;
  margin-top: -150px;
  margin-left: -150px;
}
form {
  font-size: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.radioContainer {
  margin-left: 10px;
  align-self: left;
}
label {
  margin-top: 10px;
  display: block;
  align-self: left;
}
.subtitle {
  font-size: 17px;
}
h2 {
  background-color: rgba(122, 122, 122, 0.658);
  padding: 5px;
  width: 100%;
}
input#name {
  width: 150px;
  display: block;
}
.errorsContainer {
  background-color: rgba(207, 11, 50, 0.705);
  padding: 5px;
  margin:5px;
}
.errors {
  list-style: none;
  padding: 0;
}
/* .error {

} */
</style>