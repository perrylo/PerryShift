// https://firebase.google.com/docs/functions/local-emulator
// To Emulate locally: firebase emulators:start --only functions
// EMULATOR: http://$HOST:$PORT/$PROJECT/$REGION/$NAME
// http://localhost:5001/yummyfy-8fe3e/us-central1/perrytest

// Firebase services: https://www.npmjs.com/package/firebase
const functions = require("firebase-functions")
const { initializeApp } = require("firebase-admin/app")
const { getAuth } = require("firebase-admin/auth")
const { getFirestore } = require("firebase-admin/firestore")

const app = initializeApp({
  apiKey: "AIzaSyCmM-UaO0L4A03GlMyf2ZniP7EDhXNTxck",
  authDomain: "perryshift.firebaseapp.com",
  projectId: "perryshift",
  storageBucket: "perryshift.appspot.com",
  messagingSenderId: "356287566166",
  appId: "1:356287566166:web:ab01a272351443efbc86f7",
})
const auth = getAuth(app)
const db = getFirestore(app)

exports.getUsers = functions.https.onCall( async (data, context) => {
  if (!context.auth || !context.auth.token.admin) return []

  const users = await auth.listUsers(100)
  return users
})

// Admin Users can only perform CRUD on users via Firebase Admin-SDK
// (ie via server-side only)
// Firebase Admin-SDK:Manage Users - https://firebase.google.com/docs/auth/admin/manage-users
// Firebase Admin-SDK:Custom Claims - https://firebase.google.com/docs/auth/admin/custom-claims
exports.saveUser = functions.https.onCall( async (data, context) => {
  if (!context.auth || !context.auth.token.admin) return []

  const {uid, name, email, password, isAdmin=false} = data

  const payloadToSave = {
    displayName: name,
    email: email,
  }
  // Don't include password key if there is no value to save
  // ie we're not changing existing password
  if (password) {
    payloadToSave.password = data.password
  }

  // We're either updating an existing user or creating a new user
  if (uid) {
    // User exists - update
    await auth.setCustomUserClaims(uid, {admin: isAdmin})
    const updatedUser = await auth.updateUser(uid, payloadToSave)

    return updatedUser
  } else {
    // User does not exist - create
    // TODO catch error if email exists
    const newUser = await auth.createUser(payloadToSave)
    await auth.setCustomUserClaims(newUser.uid, {admin: isAdmin}).then(() => {
      newUser.customClaims = {admin: isAdmin}
    })

    // Create new document for this user's shifts
    const newUserShiftDoc = {
      uid: newUser.uid,
      shifts: []
    }
    db.collection('userShifts').add(newUserShiftDoc)

    return newUser
  }
})

exports.deleteUser = functions.https.onCall( async (uid, context) => {
  if (!context.auth || !context.auth.token.admin) return []

  // Delete Firebase user
  await auth.deleteUser(uid)

  // Delete associated user-shifts document
  db.collection('userShifts')
    .where('uid', '==', uid)
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        db.collection('userShifts').doc(doc.id).delete()
      })
    })

  return true
})