export default {
  isLoggedIn: state => !!state.authUser?.uid,

  isAdmin: state => state.authUser?.claims?.admin || false,

  authUser: state => state.authUser,
  authUserUid: state => state.authUser?.uid,

  user: state => state.user,

  users: state => state.users,

  reservedEmails: state => state.users.map(u => u.email)
}
