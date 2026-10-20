
const projects = [
  {
    day: 29,
    title: "GitHub Profile Finder",
    description: "Search for a GitHub user and explore their profile and recent public repositories.",
    tags: ["JavaScript", "GitHub API", "Fetch"],
    folder: "Day-29-github-profile-finder"
  },
  {
    day: 28,
    title: "Password Generator",
    description: "Generate random passwords with selectable character types and length.",
    tags: ["JavaScript", "DOM", "Security"],
    folder: "Day-28-password-generator"
  },
  {
    day: 27,
    title: "Notes App",
    description: "Create, search, edit and delete notes saved in browser local storage.",
    tags: ["JavaScript", "Local Storage"],
    folder: "Day-27-notes-app"
  },
  {
    day: 26,
    title: "Pomodoro Timer",
    description: "Manage focus and break sessions with a simple productivity timer.",
    tags: ["JavaScript", "Timer", "DOM"],
    folder: "Day-26-pomodoro-timer"
  },
  {
    day: 25,
    title: "Interactive Quiz App",
    description: "Answer multiple-choice questions and check your final score.",
    tags: ["JavaScript", "Arrays", "Events"],
    folder: "Day-25-quiz-app"
  },
  {
    day: 24,
    title: "Currency Converter",
    description: "A practice project for currency conversion and user interaction.",
    tags: ["HTML", "CSS", "JavaScript"],
    folder: "Day-24-currency-converter"
  },
  {
    day: 23,
    title: "7-Day Weather Forecast",
    description: "A weather learning project focused on displaying forecast information.",
    tags: ["HTML", "CSS", "JavaScript"],
    folder: "Day-23-weather-forecast"
  },
  {
    day: 22,
    title: "Weather App",
    description: "A practice app for searching weather information.",
    tags: ["JavaScript", "API"],
    folder: "Day-22-weather-app"
  },
  {
    day: 21,
    title: "Personal Expense Tracker",
    description: "Track expenses and practice organizing spending data.",
    tags: ["JavaScript", "Data"],
    folder: "Day-21-expense-tracker"
  }
];

const projectGrid = document.querySelector("#project-grid");
const themeToggle = document.querySelector("#theme-toggle");
const menuToggle = document.querySelector("#menu-toggle");
const navLinks = document.querySelector("#nav-links");

// Render project cards.
projects.forEach((project) => {
  const card = document.createElement("article");
  card.className = "project-card";

  const number = document.createElement("span");
  number.className = "project-number";
  number.textContent = `DAY ${String(project.day).padStart(2, "0")}`;

  const title = document.createElement("h3");
  title.textContent = project.title;

  const description = document.createElement("p");
  description.textContent = project.description;

  const tags = document.createElement("div");
  tags.className = "project-tags";

  project.tags.forEach((tagName) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = tagName;
    tags.appendChild(tag);
  });

  const link = document.createElement("a");
  link.className = "project-link";
  link.href =
    `https://github.com/lipumehedi/web-projects-30-days/tree/main/${project.folder}`;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "View project on GitHub ↗";
  link.setAttribute("aria-label", `View ${project.title} on GitHub`);

  card.append(number, title, description, tags, link);
  projectGrid.appendChild(card);
});

// Dark/light theme toggle.
themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark");

  themeToggle.textContent = isDark ? "☀ Light mode" : "☾ Dark mode";
  themeToggle.setAttribute("aria-pressed", String(isDark));
});

// Mobile navigation.
menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");

  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute(
    "aria-label",
    isOpen ? "Close navigation menu" : "Open navigation menu"
  );
  menuToggle.textContent = isOpen ? "✕" : "☰";
});

// Close the mobile menu after selecting a section.
navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    menuToggle.textContent = "☰";
  });
});

// Automatically update the footer year.
document.querySelector("#year").textContent = new Date().getFullYear();
