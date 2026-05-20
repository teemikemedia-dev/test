import {
  browserLocalPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {
  ref,
  serverTimestamp,
  update
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";

import {
  auth,
  database
} from "./firebase-config.js";

const loginForm =
  document.getElementById(
    "client-login-form"
  );

const resetButton =
  document.getElementById(
    "forgot-password-btn"
  );

const messageBox =
  document.getElementById(
    "client-auth-message"
  );

function showMessage(message, type = "info"){

  if(!messageBox){
    return;
  }

  messageBox.textContent =
    message;

  messageBox.className =
    `client-auth-message show ${type}`;

}

function friendlyAuthError(error){

  const code =
    error && error.code
      ? error.code
      : "";

  if(code.includes("invalid-credential")){
    return "The email or password is incorrect. Please check your details and try again.";
  }

  if(code.includes("user-not-found")){
    return "No dashboard account was found for this email address.";
  }

  if(code.includes("wrong-password")){
    return "The password is incorrect. Please try again.";
  }

  if(code.includes("too-many-requests")){
    return "Too many attempts. Please wait a little while before trying again.";
  }

  if(code.includes("network-request-failed")){
    return "Network error. Please check your internet connection and try again.";
  }

  return "Login failed. Please try again.";

}

onAuthStateChanged(
  auth,
  (user) => {

    if(
      user &&
      window.location.pathname.endsWith(
        "/login.html"
      )
    ){

      window.location.href =
        "dashboard.html";

    }

  }
);

if(loginForm){

  loginForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      const emailInput =
        document.getElementById(
          "client-email"
        );

      const passwordInput =
        document.getElementById(
          "client-password"
        );

      const rememberInput =
        document.getElementById(
          "remember-client"
        );

      const submitButton =
        loginForm.querySelector(
          "button[type='submit']"
        );

      if(!loginForm.checkValidity()){
        loginForm.reportValidity();
        return;
      }

      if(submitButton){
        submitButton.disabled = true;
        submitButton.textContent =
          "Signing In...";
      }

      showMessage(
        "Checking your dashboard access...",
        "info"
      );

      try{

        await setPersistence(
          auth,
          rememberInput && rememberInput.checked
            ? browserLocalPersistence
            : browserSessionPersistence
        );

        const credential =
          await signInWithEmailAndPassword(
            auth,
            emailInput.value.trim(),
            passwordInput.value
          );

        await update(
          ref(
            database,
            `clients/${credential.user.uid}/account`
          ),
          {
            email:credential.user.email,
            lastLogin:serverTimestamp()
          }
        );

        showMessage(
          "Access confirmed. Opening your dashboard...",
          "success"
        );

        window.location.href =
          "dashboard.html";

      } catch(error){

        showMessage(
          friendlyAuthError(error),
          "error"
        );

      } finally {

        if(submitButton){
          submitButton.disabled = false;
          submitButton.textContent =
            "Access Dashboard";
        }

      }

    }
  );

}

if(resetButton){

  resetButton.addEventListener(
    "click",
    async () => {

      const emailInput =
        document.getElementById(
          "client-email"
        );

      const email =
        emailInput
          ? emailInput.value.trim()
          : "";

      if(email === ""){

        showMessage(
          "Enter your email address first, then click forgot password.",
          "error"
        );

        if(emailInput){
          emailInput.focus();
        }

        return;

      }

      try{

        await sendPasswordResetEmail(
          auth,
          email
        );

        showMessage(
          "Password reset email sent. Please check your inbox.",
          "success"
        );

      } catch(error){

        showMessage(
          friendlyAuthError(error),
          "error"
        );

      }

    }
  );

}
