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

const logoutButton =
  document.getElementById(
    "client-logout"
  );

const clientName =
  document.getElementById(
    "client-name"
  );

const clientEmail =
  document.getElementById(
    "client-email"
  );

const statusPill =
  document.getElementById(
    "client-status-pill"
  );

const projectPhase =
  document.getElementById(
    "project-phase"
  );

const progressFocus =
  document.getElementById(
    "progress-focus"
  );

const nextStep =
  document.getElementById(
    "next-step"
  );

const projectGrid =
  document.getElementById(
    "project-progress-grid"
  );

const timelineList =
  document.getElementById(
    "client-timeline"
  );

const supportTitle =
  document.getElementById(
    "support-title"
  );

const supportDetail =
  document.getElementById(
    "support-detail"
  );

const supportLink =
  document.getElementById(
    "support-link"
  );

const mobileSidebarButton =
  document.getElementById(
    "client-sidebar-toggle"
  );

const dashboardShell =
  document.querySelector(
    ".client-dashboard-shell"
  );

function escapeHtml(value){

  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}

function asList(value){

  if(Array.isArray(value)){
    return value;
  }

  if(value && typeof value === "object"){
    return Object.values(value);
  }

  return [];

}

function setText(element, value, fallback){

  if(!element){
    return;
  }

  element.textContent =
    value || fallback;

}

function renderEmptyState(target, title, detail){

  if(!target){
    return;
  }

  target.innerHTML = `
    <article class="client-empty-state">
      <i class="fa-solid fa-circle-info"></i>
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(detail)}</p>
    </article>
  `;

}

function renderProjects(projects){

  if(!projectGrid){
    return;
  }

  const items =
    asList(projects);

  if(items.length === 0){

    renderEmptyState(
      projectGrid,
      "Project progress will appear here",
      "Your client dashboard is connected. Teemikemedia Agency will publish live project progress once your onboarding details are confirmed."
    );

    return;

  }

  projectGrid.innerHTML =
    items.map((project) => {

      const progress =
        Math.max(
          0,
          Math.min(
            100,
            Number(project.progress || 0)
          )
        );

      return `
        <article class="client-progress-card">
          <div class="client-card-top">
            <span>${escapeHtml(project.phase || project.status || "Project Update")}</span>
            <strong>${progress}%</strong>
          </div>
          <h3>${escapeHtml(project.title || "Website Project")}</h3>
          <p>${escapeHtml(project.summary || project.note || "A project update has been added to your dashboard.")}</p>
          <div class="client-progress-track" aria-label="${progress}% complete">
            <i style="width:${progress}%"></i>
          </div>
        </article>
      `;

    }).join("");

}

function renderTimeline(timeline){

  if(!timelineList){
    return;
  }

  const items =
    asList(timeline);

  if(items.length === 0){

    renderEmptyState(
      timelineList,
      "Timeline updates will appear here",
      "Your project timeline will be published when milestones, review dates, deliverables, and launch actions are scheduled."
    );

    return;

  }

  timelineList.innerHTML =
    items.map((item) => {

      return `
        <article class="client-timeline-item">
          <span>${escapeHtml(item.date || item.stage || "Milestone")}</span>
          <div>
            <h3>${escapeHtml(item.title || "Project Milestone")}</h3>
            <p>${escapeHtml(item.detail || item.description || "Milestone details will be shared here.")}</p>
          </div>
        </article>
      `;

    }).join("");

}

function renderSupport(support = {}){

  setText(
    supportTitle,
    support.title,
    "Project Support"
  );

  setText(
    supportDetail,
    support.detail,
    "For project questions, content updates, approvals, or technical support, contact Teemikemedia Agency through the approved project support channel."
  );

  if(supportLink){

    supportLink.href =
      support.url || "contact/";

    supportLink.textContent =
      support.label || "Contact Support";

  }

}

function renderClientData(user, data = {}){

  const account =
    data.account || {};

  const overview =
    data.overview || {};

  setText(
    clientName,
    account.name || user.displayName,
    "Client"
  );

  setText(
    clientEmail,
    account.email || user.email,
    ""
  );

  setText(
    statusPill,
    account.status,
    "Authenticated Client Portal"
  );

  setText(
    projectPhase,
    overview.projectPhase || overview.phase,
    "Awaiting Project Phase"
  );

  setText(
    progressFocus,
    overview.progressFocus || overview.focus,
    "Awaiting Progress Focus"
  );

  setText(
    nextStep,
    overview.nextStep,
    "Awaiting Next Step"
  );

  renderProjects(
    data.projects
  );

  renderTimeline(
    data.timeline
  );

  renderSupport(
    data.support || {}
  );

}

onAuthStateChanged(
  auth,
  (user) => {

    if(!user){

      window.location.href =
        "login.html";

      return;

    }

    renderClientData(
      user
    );

    onValue(
      ref(
        database,
        `clients/${user.uid}`
      ),
      (snapshot) => {

        renderClientData(
          user,
          snapshot.val() || {}
        );

      }
    );

  }
);

if(logoutButton){

  logoutButton.addEventListener(
    "click",
    async () => {

      await signOut(
        auth
      );

      window.location.href =
        "login.html";

    }
  );

}

if(mobileSidebarButton && dashboardShell){

  mobileSidebarButton.addEventListener(
    "click",
    () => {

      dashboardShell.classList.toggle(
        "sidebar-open"
      );

    }
  );

  document
    .querySelectorAll(
      ".client-sidebar-nav a"
    )
    .forEach((link) => {

      link.addEventListener(
        "click",
        () => {

          dashboardShell.classList.remove(
            "sidebar-open"
          );

        }
      );

    });

}
