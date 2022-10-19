export default {
  SET_AUTH_USER: (state, { authUser, claims }) => {
    if (!authUser) {
      state.authUser = null
    } else {
      // NEVER inject firebase user object directly into state, as this object reference
      // can be updated without warning by firebase which will bork vuex
      // https://firebase.nuxtjs.org/service-options/auth
      const { uid, email } = authUser
      state.authUser = { uid, email, claims }
    }
  },

  SET_USERS: (state, users) => { state.users = users },

  UPDATE_USER_IN_USERS: (state, user) => {
    const existingIndex = state.users.findIndex(u => u.uid === user.uid)
    if (existingIndex === -1) {
      state.users.push(user)
    } else {
      state.users.splice(existingIndex, 1, user)
    }

    // Edge case: If update user is current authUser then also update authUser
    // Minor issure - The values to be updated are only for show, we do this
    // to keep data/view tidy and in sync
    if (user.uid === state.authUser.uid) {
      state.authUser.email = user.email
      state.authUser.claims.email = user.email
      state.authUser.claims.name = user.displayName
    }
  },

  DELETE_USER_FROM_USERS: (state, uid) => {
    const existingIndex = state.users.findIndex(u => u.uid === uid)
    if (existingIndex !== -1) {
      state.users.splice(existingIndex, 1)
    }
  },

  SET_USER: (state, user) => { state.user = user }
}
