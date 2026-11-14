const routeForm = document.querySelector("#route-form");
const originInput = document.querySelector("#origin");
const destinationInput = document.querySelector("#destination");
const flightDateInput = document.querySelector("#flight-date");
const resultsSection = document.querySelector("#results");
const routeTitle = document.querySelector("#route-title");
const resultDate = document.querySelector("#result-date");
const themeToggle = document.querySelector("#theme-toggle");
const themeStorageKey = "reshis-theme";

function setTheme(isDark) {
  if (isDark) {
    document.documentElement.dataset.theme = "dark";
  } else {
    document.documentElement.removeAttribute("data-theme");
  }

  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Включить светлую тему" : "Включить тёмную тему",
  );

  try {
    localStorage.setItem(themeStorageKey, isDark ? "dark" : "light");
  } catch {
    // Переключение работает и без сохранения настройки.
  }
}

try {
  setTheme(localStorage.getItem(themeStorageKey) === "dark");
} catch {
  setTheme(false);
}

function formatFlightDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function hideResults() {
  resultsSection.hidden = true;
  document.body.classList.remove("has-results");
}

routeForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const origin = originInput.value.trim();
  const destination = destinationInput.value.trim();

  if (!origin || !destination || !flightDateInput.value) {
    routeForm.reportValidity();
    return;
  }

  routeTitle.textContent = `${origin} — ${destination}`;
  resultDate.textContent = `Прогноз спроса на ${formatFlightDate(flightDateInput.value)}`;
  resultsSection.hidden = false;
  document.body.classList.add("has-results");

  if (window.matchMedia("(max-width: 640px)").matches) {
    resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

routeForm.addEventListener("input", () => {
  if (!resultsSection.hidden) {
    hideResults();
  }
});

themeToggle.addEventListener("click", () => {
  const isDark = document.documentElement.dataset.theme === "dark";
  setTheme(!isDark);
});
