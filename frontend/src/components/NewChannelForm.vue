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
    <form @submit.prevent='checkInputs()'>
      <h2>New channel</h2>

      <label class="subtitle" for='name'>Channel name:*</label>
      <input required type="text" name='name' id='name' placeholder='My Cool Channel' minlength="1" maxlength="200" v-model="channelName" @input="checkName()">
      
      <div class="channelAccessContainer">
        <label class="subtitle">Channel access:*</label>
        <label class='radioContainer'  title='A public channel is visible and accessible to any member' id='public'>
          <input type='radio' class='radioUnit' id='public' name='unit' value='public' v-model="channelType">Public
        </label>
        <label class='radioContainer'  title='An invite-only channel is only accessible to members who have been invited to join by a channel member' id='Private (invite-only)'>
          <input type='radio' class='radioUnit' id='private' name='unit' value='private' v-model="channelType">Private (invite-only)
        </label>
        <label class='radioContainer'  title='A password-protected channel is accessible to any member who possesses the channel password set by the admin' id='Private (password-protected)'>
          <input type='radio' class='radioUnit' id='password-protected' name='unit' value='password-protected' v-model="channelType">Private (password-protected)
        </label>
      </div>

      <div v-if="channelType === 'password-protected'">
        <label for='password'>Channel password:*</label>
        <input required type="text" name='password' id='password' placeholder="Password" minlength="8" maxlength="20" v-model="channelPassword" @input="checkPassword()">
        <label for='passwordConfirmation'>Please confirm the channel password:*</label>
        <input required type="text" name='passwordConfirmation' id='passwordConfirmation' placeholder="Password" v-model="channelPasswordConf" @input="checkPasswordConf()">
      </div>

      <div v-if="errors.length" class="errorsContainer">
        <b>Please correct the following error(s):</b>
        <ul class="errors">
          <li class="error" v-for="error in errors" :key="error">{{ error }}</li>
        </ul>
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
      console.log(channelName)
      api.getChannelByName(channelName.value)
      .then(() => { 
        if (validName) {
          errors.push(channelName.value + " already exists")
        }
        validName = false;
      })
      .catch(() => {
        errors.splice(errors.indexOf(channelName.value + " already exists"), 1);
        validName = true;
      })
    }

    const checkPassword = () => {
      if (!/^[-_*-+/a-zA-Z0-9]*$/.test(channelPassword.value)) {
        if (validPassword)
          errors.push("Channel password must be 8-20 characters long and only contain letters, numbers, or the following symbols -_*-+/");
        validPassword = false;
      } else if (!validPassword) {
        errors.splice(errors.indexOf("Channel password must be 8-20 characters long and only contain letters, numbers, or the following symbols -_*-+/"), 1)
        validPassword = true;
      }
      if (channelPasswordConf.value)
        checkPasswordConf();
    }

    const checkPasswordConf = () => {
      if (channelPasswordConf.value !== channelPassword.value) {
        if (validPasswordConf)
          errors.push("Password and password confirmation don't match");
        validPasswordConf = false;
      } else if (!validPasswordConf) {
        errors.splice(errors.indexOf("Password and password confirmation don't match"), 1);
        validPasswordConf = true;
      }
    }
    
    const checkInputs = () => {
 
      if (errors.length)
        return;
      console.log(channelName.value, channelType.value, channelPassword.value)
      api.saveChannel({
        name: channelName.value,
        // ownerId: api.getCurrentUserId
        ownerId: 1, // API MUST FETCH THE PROPER USER ID
        type: channelType.value,
        password: channelPassword.value
      })
      // socket.emit('createRoom', {
      //     name: channelName.value,
      //     // ownerId: api.getCurrentUserId
      //     ownerId: 1, // API MUST FETCH THE PROPER USER ID
      //     type: channelType.value,
      //     password: channelPassword.value
      // })
    }

    return {
      channelName,
      channelType,
      channelPassword,
      channelPasswordConf,
      checkName,
      checkPassword,
      checkPasswordConf,
      checkInputs,
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