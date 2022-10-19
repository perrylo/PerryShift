<template>
  <v-dialog
    v-model="dialog"
    max-width="500px"
  >
    <template #activator="{ on, attrs }">
      <div v-bind="attrs" style="display:inline-block" v-on="on">
        <slot></slot>
      </div>
    </template>

    <v-card v-if="isSavingInProgress" height="420">
      <v-card-text style="height:100%">
        <div style="width: 100%; height:100%; display:grid; place-items: center">
          <v-progress-circular indeterminate color="primary" size="100"></v-progress-circular>
        </div>
      </v-card-text>
    </v-card >

    <v-card v-else height="420">
      <v-card-title>
        <span class="text-h5">{{ formTitle }}</span>
        <v-spacer></v-spacer>
        <span v-if="userId" class="caption">ID: {{ userId }}</span>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" lazy-validation>
          <v-text-field
            v-model="userName"
            label="Name"
            :rules="[rules.isRequired]"
          ></v-text-field>

          <EmailField
            v-model="userEmail"
            :extra-validation="checkReservedEmail"
          ></EmailField>

          <!--
            When creating a new user Password is required
            When updating an existing user Password is optional
          -->
          <PasswordField
            v-model="userPassword"
            :messages="!!user ? 'Optional - leave this blank to keep current password' : ''"
            :is-optional="!!user"
          ></PasswordField>

          <!-- Admin users CANNOT self-remove admin role -->
          <v-checkbox
            v-model="userIsAdmin"
            label="Is Admin"
            :disabled="isAdmin && userId===authUserUid"
          ></v-checkbox>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="blue darken-1"
          text
          @click="dialog = false"
        >
          Cancel
        </v-btn>
        <v-btn
          color="blue darken-1"
          text
          @click="save"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import EmailField from '../components/formFields/EmailField.vue'
import PasswordField from './formFields/PasswordField.vue'

export default {
  name: 'EditUser',
  components: { EmailField, PasswordField },
  props: {
    user: {
      type: Object,
      default: () => null
    },
  },
  data(){
    return {
      dialog: false,

      isSavingInProgress: false,

      userId: this.user?.uid || undefined,
      userName: this.user?.displayName || undefined,
      userEmail: this.user?.email || undefined,
      userPassword: undefined,
      userIsAdmin: this.user?.customClaims?.admin || undefined,

      rules: {
        isRequired: (value) => !!value || 'Required',
      },
    }
  },
  computed: {
    ...mapGetters(['authUserUid','isAdmin','reservedEmails']),
    formTitle () {
      // This view is simultaneously used for New and Edit users
      return this.user ? 'Edit User' : 'New User'
    },
  },
  methods: {
    // Special validation function passed as email validation rule
    // New users cannot use an existing email
    // Existing users can only use their original email or a brand new email
    checkReservedEmail(email){
      if (this.user) {
        return (!this.reservedEmails.includes(email) || email===this.user.email) ||  'Email already taken, please use another'
      } else {
        return !this.reservedEmails.includes(email) || 'Email already taken, please use another'
      }
    },

    async save() {
      if (this.$refs.form.validate()) {
        this.isSavingInProgress = true

        const updateUser = this.$fire.functions.httpsCallable('saveUser')
        const response = await updateUser({
          uid: this.userId,
          name: this.userName,
          email: this.userEmail,
          password: this.userPassword,
          isAdmin: this.userIsAdmin
        })

        this.$store.dispatch('updateUserInUsers', response.data)

        this.$emit('updatedUsers')

        this.dialog = false

        // Transition to close dialog is slower than state update, so we wait half
        // a second for transition to complete before updating the view,
        // so it looks nice
        setTimeout(() => {
          this.isSavingInProgress = false
        }, 500)
      }
    }
  }
}
</script>