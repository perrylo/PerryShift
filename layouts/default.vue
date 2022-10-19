<template>
  <v-app style="background: #f0f0f0">
    <v-app-bar dark fixed app color="primary">
      <span class="text-h4">
        PerryShift
      </span>
      <template v-if="isLoggedIn">
        <v-spacer />
        <span class="text-h5 mr-15">Hello <span class="yellow--text ">{{authUser?.claims?.name || ''}}</span></span>
        <v-btn v-if="isAdmin" text x-large to="/users">
          Staff List
          <v-icon right>mdi-account-multiple</v-icon>
        </v-btn>
        <v-btn text x-large @click="doLogout">
          Log out
          <v-icon right>mdi-logout</v-icon>
        </v-btn>
      </template>
    </v-app-bar>

    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'DefaultLayout',
  computed: {
    ...mapGetters(['authUser','isLoggedIn', 'isAdmin']),
  },
  methods: {
    doLogout() {
      this.$fireModule
        .auth()
        .signOut()
        .then((r) => {
          this.$router.push('/')
        })
        .catch((err) => {
          console.error('Problem logging out', err)
        })
    },
  },
}
</script>
