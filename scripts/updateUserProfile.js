const admin = require("firebase-admin");
const {getAuth} = require("firebase-admin/auth");
const serviceAccount = require("./perryshift-firebase-adminsdk-iqzah-9dcafa0793.json");

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const auth = getAuth(app);

const uid = "T0AiLLXTKAVZjIKIZUq5Wg14YZ83"

auth.updateUser(uid, {
  displayName: 'John Doe'
})

