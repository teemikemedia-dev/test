import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import {
  get,
  onValue,
  push,
  ref,
  remove,
  serverTimestamp,
  set,
  update
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";
import {
  auth,
  database,
  firebaseConfig
} from "./firebase-config.js";

const adminLogout =
  document.getElementById("admin-logout");
const clientList =
  document.getElementById("admin-client-list");
const clientSearch =
  document.getElementById("admin-client-search");
const adminMessage =
  document.getElementById("admin-action-message");
const selectedClientLabel =
  document.getElementById("selected-client-label");
const statsClients =
  document.getElementById("stats-clients");
const statsProjects =
  document.getElementById("stats-projects");
const statsActive =
  document.getElementById("stats-active");

let clientsCache = {};
let selectedClientUid = "";

function showMessage(message, type = "info"){
  if(!adminMessage) return;
  adminMessage.textContent = message;
  adminMessage.className = `client-auth-message show ${type}`;
}

function escapeHtml(value){
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function asList(value){
  if(Array.isArray(value)) return value;
  if(value && typeof value === "object") return Object.values(value);
  return [];
}

async function verifyAdmin(user){
  const snapshot = await get(ref(database, `admins/${user.uid}`));
  const adminRecord = snapshot.val();
  return adminRecord === true ||
    (
      adminRecord &&
      adminRecord.approved === true
    );
}

function setSelectedClient(uid){
  selectedClientUid = uid;
  const client = clientsCache[uid] || {};
  const account = client.account || {};

  if(selectedClientLabel){
    selectedClientLabel.textContent = account.name
      ? `${account.name} selected`
      : "Client selected";
  }

  document.querySelectorAll("[data-client-required]").forEach((element) => {
    element.disabled = !selectedClientUid;
  });

  document.querySelectorAll(".admin-client-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.uid === uid);
  });
}

function renderStats(clients){
  const entries = Object.values(clients);
  const projectCount = entries.reduce((total, client) => {
    return total + asList(client.projects).length;
  }, 0);
  const activeCount = entries.filter((client) => {
    const status = String(client.account?.status || "").toLowerCase();
    return status.includes("active") || status.includes("progress");
  }).length;

  if(statsClients) statsClients.textContent = entries.length;
  if(statsProjects) statsProjects.textContent = projectCount;
  if(statsActive) statsActive.textContent = activeCount;
}

function renderClientList(){
  if(!clientList) return;
  const query = clientSearch ? clientSearch.value.trim().toLowerCase() : "";
  const entries = Object.entries(clientsCache).filter(([, client]) => {
    const account = client.account || {};
    return `${account.name || ""} ${account.email || ""}`.toLowerCase().includes(query);
  });

  if(entries.length === 0){
    clientList.innerHTML = `
      <article class="client-empty-state">
        <i class="fa-solid fa-user-plus"></i>
        <h3>No client records found</h3>
        <p>Create a client account or adjust your search term.</p>
      </article>
    `;
    return;
  }

  clientList.innerHTML = entries.map(([uid, client]) => {
    const account = client.account || {};
    const overview = client.overview || {};
    return `
      <button type="button" class="admin-client-item ${uid === selectedClientUid ? "active" : ""}" data-uid="${uid}">
        <strong>${escapeHtml(account.name || "Unnamed Client")}</strong>
        <span>${escapeHtml(account.email || "No email saved")}</span>
        <small>${escapeHtml(overview.projectPhase || account.status || "Awaiting project phase")}</small>
      </button>
    `;
  }).join("");

  clientList.querySelectorAll(".admin-client-item").forEach((button) => {
    button.addEventListener("click", () => setSelectedClient(button.dataset.uid));
  });
}

function getSelectedClientOrWarn(){
  if(!selectedClientUid){
    showMessage("Select a client before adding project information.", "error");
    return "";
  }
  return selectedClientUid;
}

onAuthStateChanged(auth, async (user) => {
  if(!user){
    window.location.href = "admin-login.html";
    return;
  }

  if(!(await verifyAdmin(user))){
    await signOut(auth);
    window.location.href = "admin-login.html";
    return;
  }

  onValue(ref(database, "clients"), (snapshot) => {
    clientsCache = snapshot.val() || {};
    renderStats(clientsCache);
    renderClientList();

    if(selectedClientUid && !clientsCache[selectedClientUid]){
      setSelectedClient("");
    }
  });
});

if(clientSearch){
  clientSearch.addEventListener("input", renderClientList);
}

if(adminLogout){
  adminLogout.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "admin-login.html";
  });
}

const createClientForm = document.getElementById("admin-create-client-form");
if(createClientForm){
  createClientForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = document.getElementById("new-client-name").value.trim();
    const email = document.getElementById("new-client-email").value.trim();
    const password = document.getElementById("new-client-password").value;

    if(!createClientForm.checkValidity()){
      createClientForm.reportValidity();
      return;
    }

    const secondaryApp = initializeApp(firebaseConfig, `client-create-${Date.now()}`);
    const secondaryAuth = getAuth(secondaryApp);

    try{
      const credential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      await set(ref(database, `clients/${credential.user.uid}`), {
        account:{
          name,
          email,
          status:"Website Project Onboarding",
          createdAt:serverTimestamp()
        },
        overview:{
          projectPhase:"Onboarding And Discovery",
          progressFocus:"Project goals, content requirements, and access details",
          nextStep:"Complete onboarding details and submit website content"
        },
        support:{
          title:"Project Support",
          detail:"Use the Meetings & Support area to book project calls or access approved meeting links.",
          label:"Open Meetings & Support",
          url:"meetings.html",
          calendlyUrl:"https://calendly.com/teemikemedia/45mins",
          zoomUrl:"https://us05web.zoom.us/j/84637837475?pwd=NnY1MFVDZmFjM2Y1YThIWmRtQUtkZz09",
          googleMeetUrl:"https://meet.google.com/jpc-shhv-ucb"
        }
      });
      createClientForm.reset();
      showMessage("Client account created and connected to the dashboard.", "success");
    } catch(error){
      showMessage(error.message || "Client account could not be created.", "error");
    } finally {
      await deleteApp(secondaryApp);
    }
  });
}

const overviewForm = document.getElementById("admin-overview-form");
if(overviewForm){
  overviewForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const uid = getSelectedClientOrWarn();
    if(!uid) return;
    await update(ref(database, `clients/${uid}/overview`), {
      projectPhase:document.getElementById("admin-project-phase").value.trim(),
      progressFocus:document.getElementById("admin-progress-focus").value.trim(),
      nextStep:document.getElementById("admin-next-step").value.trim(),
      updatedAt:serverTimestamp()
    });
    overviewForm.reset();
    showMessage("Client overview updated.", "success");
  });
}

const projectForm = document.getElementById("admin-project-form");
if(projectForm){
  projectForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const uid = getSelectedClientOrWarn();
    if(!uid) return;
    await push(ref(database, `clients/${uid}/projects`), {
      title:document.getElementById("admin-project-title").value.trim(),
      phase:document.getElementById("admin-project-card-phase").value.trim(),
      progress:Number(document.getElementById("admin-project-progress").value || 0),
      summary:document.getElementById("admin-project-summary").value.trim(),
      updatedAt:serverTimestamp()
    });
    projectForm.reset();
    showMessage("Project progress card added.", "success");
  });
}

const timelineForm = document.getElementById("admin-timeline-form");
if(timelineForm){
  timelineForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const uid = getSelectedClientOrWarn();
    if(!uid) return;
    await push(ref(database, `clients/${uid}/timeline`), {
      date:document.getElementById("admin-timeline-date").value.trim(),
      title:document.getElementById("admin-timeline-title").value.trim(),
      detail:document.getElementById("admin-timeline-detail").value.trim(),
      createdAt:serverTimestamp()
    });
    timelineForm.reset();
    showMessage("Project timeline item added.", "success");
  });
}

const supportForm = document.getElementById("admin-support-form");
if(supportForm){
  supportForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const uid = getSelectedClientOrWarn();
    if(!uid) return;
    await update(ref(database, `clients/${uid}/support`), {
      title:document.getElementById("admin-support-title").value.trim(),
      detail:document.getElementById("admin-support-detail").value.trim(),
      label:document.getElementById("admin-support-label").value.trim(),
      url:document.getElementById("admin-support-url").value.trim(),
      calendlyUrl:"https://calendly.com/teemikemedia/45mins",
      zoomUrl:"https://us05web.zoom.us/j/84637837475?pwd=NnY1MFVDZmFjM2Y1YThIWmRtQUtkZz09",
      googleMeetUrl:"https://meet.google.com/jpc-shhv-ucb",
      updatedAt:serverTimestamp()
    });
    supportForm.reset();
    showMessage("Support information updated.", "success");
  });
}

const assetForm = document.getElementById("admin-asset-form");
if(assetForm){
  assetForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const uid = getSelectedClientOrWarn();
    if(!uid) return;
    await push(ref(database, `clients/${uid}/assets`), {
      title:document.getElementById("admin-asset-title").value.trim(),
      url:document.getElementById("admin-asset-url").value.trim(),
      type:document.getElementById("admin-asset-type").value.trim(),
      createdAt:serverTimestamp()
    });
    assetForm.reset();
    showMessage("Project link or file reference added.", "success");
  });
}

const noteForm = document.getElementById("admin-note-form");
if(noteForm){
  noteForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const uid = getSelectedClientOrWarn();
    if(!uid) return;
    await push(ref(database, `clients/${uid}/internalNotes`), {
      note:document.getElementById("admin-internal-note").value.trim(),
      createdAt:serverTimestamp()
    });
    noteForm.reset();
    showMessage("Internal note added for agency records.", "success");
  });
}
