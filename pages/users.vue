<template>
  <v-container>
    <!-- Snackbar: Save/Delete success -->
    <v-snackbar
      v-model="snackbar"
      :timeout="3000"
      :color="snackbarColor"
      top
    >
      {{snackbarMessage}}
      <template #action="{ attrs }">
        <v-btn
          text
          v-bind="attrs"
          @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Dialog: Confirm User Delete -->
    <v-dialog v-model="dialogDelete" max-width="500px">
      <v-card v-if="isDeletingInProgress" height="220">
        <v-card-text style="height:100%">
          <div class="progressContainer">
            <v-progress-circular indeterminate color="primary" size="100"></v-progress-circular>
          </div>
        </v-card-text>
      </v-card >

      <v-card v-else height="220">
        <v-card-title class="text-h5" style="overflow-wrap: break-word;">Confirm delete {{userToDelete?.displayName}}?</v-card-title>
        <v-card-text>This cannot be undone</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey lighten-3"  @click="dialogDelete=false">Cancel</v-btn>
          <v-btn color="red lighten-1" dark  @click="deleteUser">Delete User</v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <template>
      <!-- Toolbar: Title and New button -->
      <v-toolbar elevation="1">
        <h1>Staff List</h1>
        <v-spacer/>
        <edit-user :key="keyCounter" @updatedUsers="handleSaveSuccess">
          <v-btn
            color="green"
            dark
          >
            <v-icon left>mdi-plus</v-icon>
            New User
          </v-btn>
        </edit-user>
      </v-toolbar>

      <!-- Data-Table: User List -->
      <v-data-table
        :headers="headers"
        :items="users"
        class="elevation-2"
        sort-by="displayName"
      >
        <template #[`item.customClaims.admin`]="{ item }">
          <v-chip v-if="item.customClaims?.admin" color="primary" outlined x-small>ADMIN</v-chip>
        </template>

        <template #[`item.calendar`]="{ item }">
          <v-btn color="primary" text @click="editUserSchedule(item)">
            <v-icon left>mdi-calendar</v-icon>
            Edit Schedule
          </v-btn>
        </template>

        <template #[`item.actions`]="{ item }">
          <edit-user :key="item.uid+'-'+keyCounter" :user="item" @updatedUsers="handleSaveSuccess">
            <v-icon class="mr-2">mdi-pencil</v-icon>
          </edit-user>

          <!-- Admin users CANNOT self-delete -->
          <v-icon v-if="item.uid !== authUserUid" @click="confirmDeleteUser(item)">
            mdi-delete
          </v-icon>
        </template>
      </v-data-table>
    </template>

  </v-container>
</template>

<script>
import { mapGetters } from 'vuex'
import EditUser from '~/components/EditUser.vue'

export default {
  name: 'UsersPage',
  components: { EditUser },
  async asyncData({ $fire, store, redirect }) {
    // Fetch all users
    const getUsers = $fire.functions.httpsCallable('getUsers')

    const data = await getUsers().then(r => r.data)
    store.dispatch('setUsers', [...data.users])
  },
  data(){
    return {
      headers: [
        { text: 'Admin', value: 'customClaims.admin' },
        { text: 'Name', align: 'start', value: 'displayName', },
        { text: 'Email', align: 'start', value: 'email' },
        { text: 'UID', align: 'start', value: 'uid' },
        { value: 'calendar' },
        { value: 'actions' },
      ],

      dialogDelete: false,
      userToDelete: undefined,
      isDeletingInProgress: false,

      snackbar: false,
      snackbarMessage: '',
      snackbarColor: '',

      keyCounter: 0,
    }
  },
  computed: {
    ...mapGetters(['authUserUid', 'users']),
  },
  methods: {
    async editUserSchedule(user){
      await this.$store.dispatch('setUser', user)
      this.$router.push(`/editSchedule`)
    },
    handleSaveSuccess() {
      this.keyCounter++

      this.snackbarMessage = 'User succesfully saved'
      this.snackbarColor = 'success'
      this.snackbar = true
    },
    confirmDeleteUser(user) {
      this.userToDelete = user
      this.dialogDelete = true
    },
    async deleteUser() {
      this.isDeletingInProgress = true

      const deleteUser = this.$fire.functions.httpsCallable('deleteUser')
      await deleteUser(this.userToDelete.uid)

      this.$store.dispatch('deleteUserFromUsers', this.userToDelete.uid)

      this.dialogDelete = false
      // Transition to close dialog is slower than state update, so we wait half
      // a second for transition to complete before updating the view,
      // so it looks nice
      setTimeout(() => {
        this.isDeletingInProgress = false
      }, 500)

      this.snackbarMessage = 'User succesfully deleted'
      this.snackbarColor = 'warn'
      this.snackbar = true
    }
  }
}
</script>

<style scoped>
.progressContainer {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
}
</style>