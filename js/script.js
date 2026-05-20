/* =========================
SLIDE-IN MOBILE MENU
========================= */

const menuToggle =
  document.getElementById(
    "menu-toggle"
  );

const navLinks =
  document.getElementById(
    "nav-links"
  );

const menuOverlay =
  document.getElementById(
    "menu-overlay"
  );

function closeMobileMenu(){

  navLinks.classList.remove(
    "active"
  );

  menuOverlay.classList.remove(
    "active"
  );

  document
    .querySelectorAll(
      ".nav-dropdown.open"
    )
    .forEach((dropdown) => {

      dropdown.classList.remove(
        "open"
      );

    });

  menuToggle.innerHTML =
    '<i class="fa-solid fa-bars"></i>';

}

menuToggle.addEventListener(
  "click",
  () => {

    navLinks.classList.toggle(
      "active"
    );

    menuOverlay.classList.toggle(
      "active"
    );

    /* CHANGE ICON */

    if(
      navLinks.classList.contains(
        "active"
      )
    ){

      menuToggle.innerHTML =
        '<i class="fa-solid fa-xmark"></i>';

    } else {

      closeMobileMenu();

    }

  }
);


/* =========================
CLOSE MENU ON OVERLAY CLICK
========================= */

menuOverlay.addEventListener(
  "click",
  closeMobileMenu
);


/* =========================
MOBILE DROPDOWN TOGGLES
========================= */

const navDropdownToggles =
  document.querySelectorAll(
    ".nav-dropdown-toggle"
  );

navDropdownToggles.forEach((toggle) => {

  toggle.addEventListener(
    "click",
    (event) => {

      if(window.innerWidth > 768){
        return;
      }

      event.preventDefault();

      const dropdown =
        toggle.closest(
          ".nav-dropdown"
        );

      if(!dropdown){
        return;
      }

      const isOpen =
        dropdown.classList.contains(
          "open"
        );

      document
        .querySelectorAll(
          ".nav-dropdown.open"
        )
        .forEach((openDropdown) => {

          if(openDropdown !== dropdown){

            openDropdown.classList.remove(
              "open"
            );

          }

        });

      dropdown.classList.toggle(
        "open",
        !isOpen
      );

    }
  );

});


/* =========================
AUTO CLOSE MOBILE MENU
========================= */

const navItems =
  document.querySelectorAll(
    ".nav-links a"
  );

navItems.forEach((link) => {

  link.addEventListener(
    "click",
    (event) => {

      if(window.innerWidth <= 768){

        if(
          link.classList.contains(
            "nav-dropdown-toggle"
          )
        ){
          return;
        }

        closeMobileMenu();

      }

    }
  );

});


/* =========================
NAVBAR SHADOW ON SCROLL
========================= */

window.addEventListener(
  "scroll",
  () => {

    const navbar =
      document.querySelector(
        ".navbar"
      );

    if(window.scrollY > 50){

      navbar.style.boxShadow =
        "0 10px 30px rgba(0,0,0,0.25)";

      navbar.style.background =
        "rgba(2,26,48,0.96)";

    } else {

      navbar.style.boxShadow =
        "none";

      navbar.style.background =
        "rgba(2,26,48,0.92)";

    }

  }
);


/* =========================
PARTNER LOGO MARQUEE
========================= */

const partnersGrids =
  document.querySelectorAll(
    ".partners-grid"
  );

partnersGrids.forEach((grid) => {

  const partnerCards =
    Array.from(
      grid.children
    );

  if(partnerCards.length === 0){
    return;
  }

  const midpoint =
    Math.ceil(
      partnerCards.length / 2
    );

  const rows = [
    partnerCards.slice(0, midpoint),
    partnerCards.slice(midpoint)
  ];

  grid.innerHTML = "";

  rows.forEach((cards, index) => {

    const row =
      document.createElement(
        "div"
      );

    row.className =
      index === 0
        ? "partners-row"
        : "partners-row partners-row-reverse";

    const track =
      document.createElement(
        "div"
      );

    track.className =
      "partners-track";

    [...cards, ...cards].forEach((card) => {

      track.appendChild(
        card.cloneNode(true)
      );

    });

    row.appendChild(
      track
    );

    grid.appendChild(
      row
    );

  });

});


/* =========================
SCROLL REVEAL ANIMATION
========================= */

const revealElements =
  document.querySelectorAll(
    ".service-card, .service-detail-card, .deliverable-card, .service-step, .faq-card, .about-story-card, .about-stat-card, .about-value-card, .about-approach-item, .portfolio-project-card, .portfolio-result-card, .project-type-item, .reviews-card, .google-review-card, .home-two-value-visual, .home-two-checks span, .home-two-service-card, .home-two-process-step, .home-two-project-card, .home-two-testimonial-card, .momentum-card, .audit-copy, .audit-form, .contact-option-card, .contact-form, .contact-step-card, .why-card, .process-card, .portfolio-item, .testimonial-card, .stat-box, .value-item"
  );

function revealOnScroll(){

  const triggerBottom =
    window.innerHeight * 0.85;

  revealElements.forEach((element) => {

    const elementTop =
      element.getBoundingClientRect().top;

    if(elementTop < triggerBottom){

      element.style.opacity = "1";

      element.style.transform =
        "translateY(0px)";

    }

  });

}

window.addEventListener(
  "scroll",
  revealOnScroll
);


/* =========================
INITIAL REVEAL STATE
========================= */

revealElements.forEach((element) => {

  element.style.opacity = "0";

  element.style.transform =
    "translateY(40px)";

  element.style.transition =
    "all 0.8s ease";

});

revealOnScroll();


/* =========================
HERO IMAGE FLOAT EFFECT
========================= */

const heroImage =
  document.querySelector(
    ".hero-image img"
  );

window.addEventListener(
  "mousemove",
  (e) => {

    if(
      window.innerWidth > 768 &&
      heroImage
    ){

      const x =
        (window.innerWidth / 2 - e.pageX) / 60;

      const y =
        (window.innerHeight / 2 - e.pageY) / 60;

      heroImage.style.transform =
        `translate(${x}px, ${y}px)`;

    }

  }
);


/* =========================
PORTFOLIO HOVER EFFECT
========================= */

const portfolioItems =
  document.querySelectorAll(
    ".portfolio-item"
  );

portfolioItems.forEach((item) => {

  item.addEventListener(
    "mouseenter",
    () => {

      item.style.boxShadow =
        "0 25px 50px rgba(114,183,218,0.25)";

      item.style.transform =
        "translateY(-8px)";

    }
  );

  item.addEventListener(
    "mouseleave",
    () => {

      item.style.boxShadow =
        "none";

      item.style.transform =
        "translateY(0px)";

    }
  );

});


/* =========================
BUTTON HOVER EFFECT
========================= */

const buttons =
  document.querySelectorAll(
    ".primary-btn, .secondary-btn"
  );

buttons.forEach((button) => {

  button.addEventListener(
    "mouseenter",
    () => {

      button.style.transform =
        "translateY(-4px) scale(1.02)";

    }
  );

  button.addEventListener(
    "mouseleave",
    () => {

      button.style.transform =
        "translateY(0px) scale(1)";

    }
  );

});


/* =========================
CONTACT FORM SUBMISSION
========================= */

const contactForms =
  document.querySelectorAll(
    "[data-contact-form]"
  );

contactForms.forEach((form) => {

  const startedAt =
    form.querySelector(
      ".form-started-at"
    );

  const messageBox =
    form.querySelector(
      ".form-message"
    );

  const submitButton =
    form.querySelector(
      ".form-submit-btn"
    );

  const submitButtonText =
    submitButton
      ? submitButton.textContent.trim()
      : "Send Inquiry";

  if(startedAt){

    startedAt.value =
      Math.floor(Date.now() / 1000);

  }

  form.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      if(!form.checkValidity()){

        form.reportValidity();
        return;

      }

      if(messageBox){

        messageBox.className =
          "form-message";

        messageBox.textContent =
          "";

      }

      if(submitButton){

        submitButton.disabled = true;
        submitButton.textContent =
          "Sending...";

      }

      try{

        const response =
          await fetch(
            form.action,
            {
              method:"POST",
              body:new FormData(form),
              headers:{
                "Accept":"application/json"
              }
            }
          );

        const responseText =
          await response.text();

        let result = {};

        try{

          result =
            responseText
              ? JSON.parse(responseText)
              : {};

        } catch(parseError){

          throw new Error(
            "The form handler did not return valid JSON. Check that the PHP file exists at " +
            form.action +
            " and that PHP is enabled on the server."
          );

        }

        if(!response.ok || !result.success){

          throw new Error(
            result.message ||
            "Something went wrong. Please try again."
          );

        }

        if(messageBox){

          messageBox.textContent =
            result.message;

          messageBox.className =
            "form-message show success";

        }

        form.reset();

        if(startedAt){

          startedAt.value =
            Math.floor(Date.now() / 1000);

        }

      } catch(error){

        if(messageBox){

          const isNetworkError =
            error instanceof TypeError;

          messageBox.textContent =
            isNetworkError
              ? "The form handler could not be reached. Make sure form-handler.php is uploaded to the site root and the page is opened through your domain, not directly as a file."
              : error.message ||
                "Something went wrong. Please try again.";

          messageBox.className =
            "form-message show error";

        }

      } finally {

        if(submitButton){

          submitButton.disabled = false;
          submitButton.textContent =
            submitButtonText;

        }

      }

    }
  );

});


/* =========================
NAV LINK HOVER EFFECT
========================= */

navItems.forEach((link) => {

  link.addEventListener(
    "mouseenter",
    () => {

      link.style.opacity = "0.7";

    }
  );

  link.addEventListener(
    "mouseleave",
    () => {

      link.style.opacity = "1";

    }
  );

});


/* =========================
SMOOTH SECTION FADE-IN
========================= */

const sections =
  document.querySelectorAll(
    "section"
  );

const sectionObserver =
  new IntersectionObserver(

    (entries) => {

      entries.forEach((entry) => {

        if(entry.isIntersecting){

          entry.target.style.opacity =
            "1";

          entry.target.style.transform =
            "translateY(0px)";

        }

      });

    },

    {
      threshold:0.1
    }

  );

sections.forEach((section) => {

  section.style.opacity = "0";

  section.style.transform =
    "translateY(50px)";

  section.style.transition =
    "all 1s ease";

  sectionObserver.observe(section);

});


/* =========================
TECH BACKGROUND PARALLAX
========================= */

const techBg =
  document.querySelector(
    ".tech-bg"
  );

window.addEventListener(
  "mousemove",
  (e) => {

    if(
      window.innerWidth > 768 &&
      techBg
    ){

      const moveX =
        (e.clientX / window.innerWidth) * 15;

      const moveY =
        (e.clientY / window.innerHeight) * 15;

      techBg.style.transform =
        `translate(${moveX}px, ${moveY}px)`;

    }

  }
);


/* =========================
ACTIVE NAVIGATION
========================= */

const currentLocation =
  location.href;

const menuItem =
  document.querySelectorAll(
    ".nav-links a"
  );

menuItem.forEach((item) => {

  if(item.href === currentLocation){

    item.classList.add(
      "active-link"
    );

  }

});


/* =========================
BACK TO TOP
========================= */

const backToTopButton =
  document.getElementById(
    "back-to-top"
  );

window.addEventListener(
  "scroll",
  () => {

    if(!backToTopButton){
      return;
    }

    if(window.scrollY > 500){

      backToTopButton.classList.add(
        "active"
      );

    } else {

      backToTopButton.classList.remove(
        "active"
      );

    }

  }
);

if(backToTopButton){

  backToTopButton.addEventListener(
    "click",
    () => {

      window.scrollTo({
        top:0,
        behavior:"smooth"
      });

    }
  );

}


/* =========================
HOME 2 CANVAS HERO
========================= */

const homeTwoCanvas =
  document.getElementById(
    "home-two-canvas"
  );

if(homeTwoCanvas){

  const homeTwoContext =
    homeTwoCanvas.getContext(
      "2d"
    );

  let homeTwoParticles = [];

  function resizeHomeTwoCanvas(){

    homeTwoCanvas.width =
      homeTwoCanvas.offsetWidth *
      window.devicePixelRatio;

    homeTwoCanvas.height =
      homeTwoCanvas.offsetHeight *
      window.devicePixelRatio;

    homeTwoContext.setTransform(
      window.devicePixelRatio,
      0,
      0,
      window.devicePixelRatio,
      0,
      0
    );

    const particleCount =
      window.innerWidth < 768 ? 46 : 86;

    homeTwoParticles =
      Array.from(
        {
          length:particleCount
        },
        () => ({
          x:Math.random() * homeTwoCanvas.offsetWidth,
          y:Math.random() * homeTwoCanvas.offsetHeight,
          vx:(Math.random() - 0.5) * 0.38,
          vy:(Math.random() - 0.5) * 0.38,
          size:Math.random() * 2 + 1
        })
      );

  }

  function drawHomeTwoCanvas(){

    const width =
      homeTwoCanvas.offsetWidth;

    const height =
      homeTwoCanvas.offsetHeight;

    homeTwoContext.clearRect(
      0,
      0,
      width,
      height
    );

    homeTwoParticles.forEach((particle, index) => {

      particle.x += particle.vx;
      particle.y += particle.vy;

      if(
        particle.x < 0 ||
        particle.x > width
      ){
        particle.vx *= -1;
      }

      if(
        particle.y < 0 ||
        particle.y > height
      ){
        particle.vy *= -1;
      }

      homeTwoContext.beginPath();
      homeTwoContext.arc(
        particle.x,
        particle.y,
        particle.size,
        0,
        Math.PI * 2
      );
      homeTwoContext.fillStyle =
        "rgba(114,183,218,0.78)";
      homeTwoContext.fill();

      for(
        let nextIndex = index + 1;
        nextIndex < homeTwoParticles.length;
        nextIndex++
      ){

        const nextParticle =
          homeTwoParticles[nextIndex];

        const distance =
          Math.hypot(
            particle.x - nextParticle.x,
            particle.y - nextParticle.y
          );

        if(distance < 130){

          homeTwoContext.beginPath();
          homeTwoContext.moveTo(
            particle.x,
            particle.y
          );
          homeTwoContext.lineTo(
            nextParticle.x,
            nextParticle.y
          );
          homeTwoContext.strokeStyle =
            `rgba(114,183,218,${(1 - distance / 130) * 0.22})`;
          homeTwoContext.lineWidth = 1;
          homeTwoContext.stroke();

        }

      }

    });

    requestAnimationFrame(
      drawHomeTwoCanvas
    );

  }

  resizeHomeTwoCanvas();

  window.addEventListener(
    "resize",
    resizeHomeTwoCanvas
  );

  drawHomeTwoCanvas();

}


/* =========================
WEBSITE PERFORMANCE CHECKER
========================= */

const performanceCheckerForm =
  document.getElementById(
    "performance-checker-form"
  );

if(performanceCheckerForm){

  const checkerUrlInput =
    document.getElementById(
      "checker-url"
    );

  const checkerEmailInput =
    document.getElementById(
      "checker-email"
    );

  const checkerStartedAt =
    performanceCheckerForm.querySelector(
      ".checker-started-at"
    );

  const checkerMessage =
    document.getElementById(
      "checker-message"
    );

  const checkerResult =
    document.getElementById(
      "checker-result"
    );

  const checkerScoreValue =
    document.getElementById(
      "checker-score-value"
    );

  const checkerScoreLabel =
    document.getElementById(
      "checker-score-label"
    );

  const checkerNormalizedUrl =
    document.getElementById(
      "checker-normalized-url"
    );

  const checkerResultTitle =
    document.getElementById(
      "checker-result-title"
    );

  const checkerResultSummary =
    document.getElementById(
      "checker-result-summary"
    );

  const checkerRecommendations =
    document.getElementById(
      "checker-recommendations"
    );

  const checkerQuestions =
    performanceCheckerForm.querySelectorAll(
      "[data-checker-question]"
    );

  const checkerSubmitButton =
    performanceCheckerForm.querySelector(
      ".form-submit-btn"
    );

  const checkerSubmitText =
    checkerSubmitButton
      ? checkerSubmitButton.textContent.trim()
      : "Calculate Website Score";

  if(checkerStartedAt){

    checkerStartedAt.value =
      Math.floor(Date.now() / 1000);

  }

  function normalizeCheckerUrl(value){

    const trimmedValue =
      value.trim();

    if(trimmedValue === ""){
      return "";
    }

    if(/^https?:\/\//i.test(trimmedValue)){
      return trimmedValue;
    }

    return `https://${trimmedValue}`;

  }

  function getCheckerRating(score){

    if(score >= 85){
      return {
        label:"Strong",
        title:"Your website has a strong foundation.",
        summary:"Your answers suggest the website already has many important performance, trust, SEO, and conversion elements in place. A deeper audit can still uncover smaller improvements."
      };
    }

    if(score >= 70){
      return {
        label:"Good",
        title:"Your website is good, but it can perform better.",
        summary:"Your website appears to have a useful foundation, but a few areas may be limiting trust, search visibility, or conversion."
      };
    }

    if(score >= 50){
      return {
        label:"Needs Attention",
        title:"Your website needs focused improvements.",
        summary:"Your answers suggest the website may be losing visitors because of gaps in usability, SEO, trust signals, or conversion flow."
      };
    }

    return {
      label:"Needs Urgent Improvement",
      title:"Your website may be holding your business back.",
      summary:"Several key areas need attention. Improving structure, speed, mobile experience, trust, and calls to action could help the website generate better results."
    };

  }

  performanceCheckerForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      checkerMessage.textContent = "";
      checkerMessage.classList.remove(
        "is-error"
      );

      const normalizedUrl =
        normalizeCheckerUrl(
          checkerUrlInput.value
        );

      if(
        normalizedUrl === "" ||
        /\s/.test(normalizedUrl)
      ){

        checkerMessage.textContent =
          "Please enter your website link. You can type it with or without https://";

        checkerMessage.classList.add(
          "is-error"
        );

        return;

      }

      if(
        !checkerEmailInput ||
        !checkerEmailInput.validity.valid
      ){

        checkerMessage.textContent =
          "Please enter a valid email address so we can send your website score report.";

        checkerMessage.classList.add(
          "is-error"
        );

        if(checkerEmailInput){
          checkerEmailInput.focus();
        }

        return;

      }

      let scoreTotal = 0;
      let answeredQuestions = 0;
      const recommendations = [];
      const checkerAnswers = [];

      checkerQuestions.forEach((question) => {

        const value =
          Number(question.value);

        if(question.value !== ""){

          answeredQuestions += 1;
          scoreTotal += value;

          const label =
            performanceCheckerForm.querySelector(
              `label[for="${question.id}"]`
            );

          const selectedOption =
            question.options[question.selectedIndex];

          checkerAnswers.push(
            `${label ? label.textContent : question.id}: ${selectedOption ? selectedOption.textContent : question.value}`
          );

          if(value < 2){

            recommendations.push(
              question.dataset.rec
            );

          }

        }

      });

      if(answeredQuestions !== checkerQuestions.length){

        checkerMessage.textContent =
          "Please answer every checklist question so your score is accurate.";

        checkerMessage.classList.add(
          "is-error"
        );

        return;

      }

      const maxScore =
        checkerQuestions.length * 2;

      const percentage =
        Math.round(
          (scoreTotal / maxScore) * 100
        );

      const rating =
        getCheckerRating(
          percentage
        );

      checkerScoreValue.textContent =
        `${percentage}%`;

      checkerScoreLabel.textContent =
        rating.label;

      checkerNormalizedUrl.textContent =
        normalizedUrl;

      checkerResultTitle.textContent =
        rating.title;

      checkerResultSummary.textContent =
        rating.summary;

      checkerRecommendations.innerHTML = "";

      const visibleRecommendations =
        recommendations.length > 0
          ? recommendations
          : [
            "Your answers suggest a strong foundation. Request a free website audit to identify smaller improvements in SEO, messaging, speed, and conversion."
          ];

      visibleRecommendations.forEach((recommendation) => {

        const item =
          document.createElement(
            "li"
          );

        item.textContent =
          recommendation;

        checkerRecommendations.appendChild(
          item
        );

      });

      checkerResult.hidden = false;

      checkerMessage.textContent =
        "Your website score is ready. Sending the report to your email now...";

      checkerResult.scrollIntoView({
        behavior:"smooth",
        block:"nearest"
      });

      if(checkerSubmitButton){

        checkerSubmitButton.disabled = true;
        checkerSubmitButton.textContent =
          "Sending Report...";

      }

      try{

        const checkerFormData =
          new FormData(
            performanceCheckerForm
          );

        checkerFormData.append(
          "full_name",
          "Website Performance Checker Visitor"
        );

        checkerFormData.append(
          "performance_score",
          `${percentage}%`
        );

        checkerFormData.append(
          "performance_rating",
          rating.label
        );

        checkerFormData.append(
          "performance_title",
          rating.title
        );

        checkerFormData.append(
          "performance_summary",
          rating.summary
        );

        checkerFormData.append(
          "performance_answers",
          checkerAnswers.join("\n")
        );

        checkerFormData.append(
          "performance_recommendations",
          visibleRecommendations.join("\n")
        );

        const response =
          await fetch(
            performanceCheckerForm.action,
            {
              method:"POST",
              body:checkerFormData,
              headers:{
                "Accept":"application/json"
              }
            }
          );

        const responseText =
          await response.text();

        let result = {};

        try{

          result =
            responseText
              ? JSON.parse(responseText)
              : {};

        } catch(parseError){

          throw new Error(
            "The form handler did not return valid JSON. Make sure form-handler.php is uploaded to the site root and PHP is enabled."
          );

        }

        if(!response.ok || !result.success){

          throw new Error(
            result.message ||
            "Your score was calculated, but the email report could not be sent."
          );

        }

        checkerMessage.textContent =
          result.message ||
          "Your score is ready and the report has been sent to your email.";

        if(checkerStartedAt){

          checkerStartedAt.value =
            Math.floor(Date.now() / 1000);

        }

      } catch(error){

        checkerMessage.textContent =
          error.message ||
          "Your score was calculated, but the email report could not be sent right now.";

        checkerMessage.classList.add(
          "is-error"
        );

      } finally {

        if(checkerSubmitButton){

          checkerSubmitButton.disabled = false;
          checkerSubmitButton.textContent =
            checkerSubmitText;

        }

      }

    }
  );

}


/* =========================
FOOTER SOCIAL ICON EFFECT
========================= */

const socialIcons =
  document.querySelectorAll(
    ".footer-socials a"
  );

socialIcons.forEach((icon) => {

  icon.addEventListener(
    "mouseenter",
    () => {

      icon.style.transform =
        "translateY(-6px) scale(1.08)";

    }
  );

  icon.addEventListener(
    "mouseleave",
    () => {

      icon.style.transform =
        "translateY(0px) scale(1)";

    }
  );

});


/* =========================
PRELOADER
========================= */

const preloader =
  document.getElementById(
    "preloader"
  );

document.body.classList.add(
  "loading"
);

window.addEventListener(
  "load",
  () => {

    setTimeout(
      () => {

        if(preloader){

          preloader.classList.add(
            "hide"
          );

        }

        document.body.classList.remove(
          "loading"
        );

      },
      350
    );

  }
);


/* =========================
SCROLL TO TOP ON REFRESH
========================= */

window.onbeforeunload =
  function () {

    window.scrollTo(0, 0);

  };
