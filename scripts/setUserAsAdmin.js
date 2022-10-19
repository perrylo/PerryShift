const admin = require("firebase-admin");
const {getAuth} = require("firebase-admin/auth");
const serviceAccount = require("./perryshift-firebase-adminsdk-iqzah-9dcafa0793.json");

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const auth = getAuth(app);

auth.setCustomUserClaims("IbQ0izwT4QYioQfYhJ58e6lsYCf1", { admin: true })

