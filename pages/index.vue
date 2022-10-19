<template>
  <v-container>
    <v-snackbar
      v-model="loginErrorSnackbar"
      :timeout="4000"
      color="error"
      top
    >
      Oops, there was a login error.  Please check your email and password and try again.

      <template #action="{ attrs }">
        <v-btn
          text
          v-bind="attrs"
          @click="loginErrorSnackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>

    <div class="block--center">
      <p class="headline my-5">Login</p>

      <v-form ref="form" lazy-validation class="loginForm">
        <EmailField v-model="email" outlined></EmailField>
        <PasswordField v-model="password" outlined></PasswordField>

        <div class="block--center">
          <v-btn large color="primary" @click="login">Sign In</v-btn>
        </div>
      </v-form>
    </div>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex'
import PasswordField from '../components/formFields/PasswordField.vue'
import EmailField from '../components/formFields/EmailField.vue'

export default {
  name: 'Login',
  components: { EmailField, PasswordField },
  data() {
    return {
      loginErrorSnackbar: false,

      email: '',
      password: '',
    }
  },
  computed: {
    ...mapGetters(['isAdmin']),
  },
  methods: {
    login() {
      if (this.$refs.form.validate()) {
        this.$fireModule
          .auth()
          .signInWithEmailAndPassword(this.email, this.password)
          .then(this.handleSuccessfulLogin, this.handleFailedLogin)
      }
    },
    async handleSuccessfulLogin(r) {
      const claims = await this.$fireModule
        .auth()
        .currentUser
        .getIdTokenResult()
        .then(r => r.claims)
      this.$store.commit('SET_AUTH_USER', { authUser: r.user, claims })

      // Admin should land at users list, while Employee should land at his schedule
      if (this.isAdmin) {
        this.$router.push('/users')
      } else {
        this.$router.push('/viewSchedule')
      }
    },
    handleFailedLogin(err) {
      this.loginErrorSnackbar = true
      console.error('login fail', err)
    },
  },
}
</script>

<style scoped>
.block--center {
  display: grid;
  place-items: center;
}
.loginForm {
  width: 500px;
}
</style>
