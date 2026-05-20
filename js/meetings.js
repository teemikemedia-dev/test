import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import {
  onValue,
  ref
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";
import {
  auth,
  database
} from "./firebase-config.js";

const logoutButton = document.getElementById("client-logout");
const clientName = document.getElementById("client-name");
const supportDetail = document.getElementById("meeting-support-detail");
const calendlyLink = document.getElementById("meeting-calendly-link");
const zoomLink = document.getElementById("meeting-zoom-link");
const meetLink = document.getElementById("meeting-google-link");

const defaults = {
  calendlyUrl:"https://calendly.com/teemikemedia/45mins",
  zoomUrl:"https://us05web.zoom.us/j/84637837475?pwd=NnY1MFVDZmFjM2Y1YThIWmRtQUtkZz09",
  googleMeetUrl:"https://meet.google.com/jpc-shhv-ucb",
  detail:"Book a project call, join an approved meeting room, or contact Teemikemedia Agency for project support."
};

function setLink(element, url){
  if(element){
    element.href = url;
  }
}

function render(user, data = {}){
  const account = data.account || {};
  const support = data.support || {};

  if(clientName){
    clientName.textContent = account.name || user.displayName || "Client";
  }

  if(supportDetail){
    supportDetail.textContent = support.detail || defaults.detail;
  }

  setLink(calendlyLink, support.calendlyUrl || defaults.calendlyUrl);
  setLink(zoomLink, support.zoomUrl || defaults.zoomUrl);
  setLink(meetLink, support.googleMeetUrl || defaults.googleMeetUrl);
}

onAuthStateChanged(auth, (user) => {
  if(!user){
    window.location.href = "login.html";
    return;
  }

  render(user);

  onValue(ref(database, `clients/${user.uid}`), (snapshot) => {
    render(user, snapshot.val() || {});
  });
});

if(logoutButton){
  logoutButton.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
  });
}
