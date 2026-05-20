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

async function sendClientNotification({
  clientUid,
  clientName,
  clientEmail,
  updateType,
  title,
  detail,
  actionUrl = "dashboard.html"
}){

  const adminUser =
    auth.currentUser;

  if(!adminUser){
    return false;
  }

  const token =
    await adminUser.getIdToken();

  const formData =
    new FormData();

  formData.append("id_token", token);
  formData.append("client_uid", clientUid || "");
  formData.append("client_name", clientName || "");
  formData.append("client_email", clientEmail || "");
  formData.append("update_type", updateType || "Project Update");
  formData.append("title", title || "Your client dashboard has been updated");
  formData.append("detail", detail || "A new update has been published inside your Teemikemedia Agency client dashboard.");
  formData.append("action_url", actionUrl);

  try{

    const response =
      await fetch(
        "notification-handler.php",
        {
          method:"POST",
          body:formData,
          headers:{
            "Accept":"application/json"
          }
        }
      );

    const result =
      await response.json();

    return response.ok && result.success;

  } catch(error){

    return false;

  }

}

async function notifySelectedClient(updateType, title, detail, actionUrl = "dashboard.html"){

  const client =
    clientsCache[selectedClientUid] || {};

  const account =
    client.account || {};

  return sendClientNotification({
    clientUid:selectedClientUid,
    clientName:account.name || "Client",
    clientEmail:account.email || "",
    updateType,
    title,
    detail,
    actionUrl
  });

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
      await sendClientNotification({
        clientUid:credential.user.uid,
        clientName:name,
        clientEmail:email,
        updateType:"Client Portal Access",
        title:"Your Teemikemedia Agency client portal is ready",
        detail:"Your secure project dashboard has been created. Log in to view project progress, timeline updates, meetings, and support information.",
        actionUrl:"login.html"
      });
      createClientForm.reset();
      showMessage("Client account created, connected to the dashboard, and notified by email.", "success");
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
    const projectPhaseValue = document.getElementById("admin-project-phase").value.trim();
    const progressFocusValue = document.getElementById("admin-progress-focus").value.trim();
    const nextStepValue = document.getElementById("admin-next-step").value.trim();
    await update(ref(database, `clients/${uid}/overview`), {
      projectPhase:projectPhaseValue,
      progressFocus:progressFocusValue,
      nextStep:nextStepValue,
      updatedAt:serverTimestamp()
    });
    const notified = await notifySelectedClient(
      "Project Overview Update",
      `Project phase updated: ${projectPhaseValue}`,
      `Progress focus: ${progressFocusValue}\nNext step: ${nextStepValue}`,
      "dashboard.html"
    );
    overviewForm.reset();
    showMessage(notified ? "Client overview updated and email notification sent." : "Client overview updated. Email notification could not be sent.", notified ? "success" : "error");
  });
}

const projectForm = document.getElementById("admin-project-form");
if(projectForm){
  projectForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const uid = getSelectedClientOrWarn();
    if(!uid) return;
    const projectTitleValue = document.getElementById("admin-project-title").value.trim();
    const projectPhaseValue = document.getElementById("admin-project-card-phase").value.trim();
    const projectProgressValue = Number(document.getElementById("admin-project-progress").value || 0);
    const projectSummaryValue = document.getElementById("admin-project-summary").value.trim();
    await push(ref(database, `clients/${uid}/projects`), {
      title:projectTitleValue,
      phase:projectPhaseValue,
      progress:projectProgressValue,
      summary:projectSummaryValue,
      updatedAt:serverTimestamp()
    });
    const notified = await notifySelectedClient(
      "Project Progress Update",
      `${projectTitleValue} is now ${projectProgressValue}% complete`,
      `${projectPhaseValue}\n\n${projectSummaryValue}`,
      "dashboard.html#projects"
    );
    projectForm.reset();
    showMessage(notified ? "Project progress card added and email notification sent." : "Project progress card added. Email notification could not be sent.", notified ? "success" : "error");
  });
}

const timelineForm = document.getElementById("admin-timeline-form");
if(timelineForm){
  timelineForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const uid = getSelectedClientOrWarn();
    if(!uid) return;
    const timelineDateValue = document.getElementById("admin-timeline-date").value.trim();
    const timelineTitleValue = document.getElementById("admin-timeline-title").value.trim();
    const timelineDetailValue = document.getElementById("admin-timeline-detail").value.trim();
    await push(ref(database, `clients/${uid}/timeline`), {
      date:timelineDateValue,
      title:timelineTitleValue,
      detail:timelineDetailValue,
      createdAt:serverTimestamp()
    });
    const notified = await notifySelectedClient(
      "Project Timeline Update",
      timelineTitleValue,
      `${timelineDateValue}\n\n${timelineDetailValue}`,
      "dashboard.html#timeline"
    );
    timelineForm.reset();
    showMessage(notified ? "Project timeline item added and email notification sent." : "Project timeline item added. Email notification could not be sent.", notified ? "success" : "error");
  });
}

const supportForm = document.getElementById("admin-support-form");
if(supportForm){
  supportForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const uid = getSelectedClientOrWarn();
    if(!uid) return;
    const supportTitleValue = document.getElementById("admin-support-title").value.trim();
    const supportDetailValue = document.getElementById("admin-support-detail").value.trim();
    const supportLabelValue = document.getElementById("admin-support-label").value.trim();
    const supportUrlValue = document.getElementById("admin-support-url").value.trim();
    await update(ref(database, `clients/${uid}/support`), {
      title:supportTitleValue,
      detail:supportDetailValue,
      label:supportLabelValue,
      url:supportUrlValue,
      calendlyUrl:"https://calendly.com/teemikemedia/45mins",
      zoomUrl:"https://us05web.zoom.us/j/84637837475?pwd=NnY1MFVDZmFjM2Y1YThIWmRtQUtkZz09",
      googleMeetUrl:"https://meet.google.com/jpc-shhv-ucb",
      updatedAt:serverTimestamp()
    });
    const notified = await notifySelectedClient(
      "Support Information Update",
      supportTitleValue,
      `${supportDetailValue}\n\nAction: ${supportLabelValue}`,
      supportUrlValue || "support.html"
    );
    supportForm.reset();
    showMessage(notified ? "Support information updated and email notification sent." : "Support information updated. Email notification could not be sent.", notified ? "success" : "error");
  });
}

const assetForm = document.getElementById("admin-asset-form");
if(assetForm){
  assetForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const uid = getSelectedClientOrWarn();
    if(!uid) return;
    const assetTitleValue = document.getElementById("admin-asset-title").value.trim();
    const assetUrlValue = document.getElementById("admin-asset-url").value.trim();
    const assetTypeValue = document.getElementById("admin-asset-type").value.trim();
    await push(ref(database, `clients/${uid}/assets`), {
      title:assetTitleValue,
      url:assetUrlValue,
      type:assetTypeValue,
      createdAt:serverTimestamp()
    });
    const notified = await notifySelectedClient(
      "Project Resource Added",
      assetTitleValue,
      `A new ${assetTypeValue || "project resource"} has been added to your project record.\n\n${assetUrlValue}`,
      assetUrlValue || "dashboard.html"
    );
    assetForm.reset();
    showMessage(notified ? "Project link or file reference added and email notification sent." : "Project link or file reference added. Email notification could not be sent.", notified ? "success" : "error");
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
