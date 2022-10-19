export default {
  async onAuthStateChanged({ commit }, { authUser, claims }) {
    await commit('SET_AUTH_USER', { authUser, claims })
  },

  setUsers({ commit }, users) {
    commit('SET_USERS', users)
  },

  updateUserInUsers({ commit }, user) {
    commit('UPDATE_USER_IN_USERS', user)
  },

  deleteUserFromUsers({ commit }, uid) {
    commit('DELETE_USER_FROM_USERS', uid)
  },

  setUser({ commit }, user) {
    commit('SET_USER', user)
  }
}
