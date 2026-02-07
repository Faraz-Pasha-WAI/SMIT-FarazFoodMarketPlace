import { auth } from "./firebase.js";
import { signOut } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

window.logout = function () {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  }).catch((error) => {
    alert(error.message);
  });
};
