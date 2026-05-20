import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {
  get,
  ref
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";

import {
  auth,
  database
} from "./firebase-config.js";

const adminLoginForm =
  document.getElementById(
    "admin-login-form"
  );

const adminMessage =
  document.getElementById(
    "admin-auth-message"
  );

function showAdminMessage(message, type = "info"){

  if(!adminMessage){
    return;
  }

  adminMessage.textContent =
    message;

  adminMessage.className =
    `client-auth-message show ${type}`;

}

async function isAdminUser(uid){

  const snapshot =
    await get(
      ref(
        database,
        `admins/${uid}`
      )
    );

  const adminRecord =
    snapshot.val();

  return adminRecord === true ||
    (
      adminRecord &&
      adminRecord.approved === true
    );

}

onAuthStateChanged(
  auth,
  async (user) => {

    if(!user){
      return;
    }

    try{

      if(await isAdminUser(user.uid)){

        window.location.href =
          "admin-dashboard.html";

      } else {

        await signOut(auth);

        showAdminMessage(
          "This account is not approved for admin access.",
          "error"
        );

      }

    } catch(error){

      showAdminMessage(
        "Admin verification failed. Please try again.",
        "error"
      );

    }

  }
);

if(adminLoginForm){

  adminLoginForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      const emailInput =
        document.getElementById(
          "admin-email"
        );

      const passwordInput =
        document.getElementById(
          "admin-password"
        );

      const submitButton =
        adminLoginForm.querySelector(
          "button[type='submit']"
        );

      if(!adminLoginForm.checkValidity()){
        adminLoginForm.reportValidity();
        return;
      }

      if(submitButton){
        submitButton.disabled = true;
        submitButton.textContent =
          "Verifying Admin...";
      }

      showAdminMessage(
        "Checking secure admin access...",
        "info"
      );

      try{

        await setPersistence(
          auth,
          browserLocalPersistence
        );

        const credential =
          await signInWithEmailAndPassword(
            auth,
            emailInput.value.trim(),
            passwordInput.value
          );

        if(!(await isAdminUser(credential.user.uid))){

          await signOut(auth);

          showAdminMessage(
            "This account is not approved for admin access.",
            "error"
          );

          return;

        }

        showAdminMessage(
          "Admin access confirmed. Opening workspace...",
          "success"
        );

        window.location.href =
          "admin-dashboard.html";

      } catch(error){

        showAdminMessage(
          "Admin login failed. Please check your email and password.",
          "error"
        );

      } finally {

        if(submitButton){
          submitButton.disabled = false;
          submitButton.textContent =
            "Access Admin Workspace";
        }

      }

    }
  );

}
