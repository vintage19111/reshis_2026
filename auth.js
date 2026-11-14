const themeToggle = document.querySelector("#auth-theme-toggle");
const modeButtons = document.querySelectorAll("[data-auth-mode]");
const loginForm = document.querySelector("#login-form");
const registerForm = document.querySelector("#register-form");
const loginSwitch = document.querySelector("#login-switch");
const registerSwitch = document.querySelector("#register-switch");
const tabButtons = document.querySelectorAll(".auth-tab[data-auth-mode]");
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
    // Тема продолжит переключаться и без доступа к localStorage.
  }
}

try {
  setTheme(localStorage.getItem(themeStorageKey) === "dark");
} catch {
  setTheme(false);
}

themeToggle.addEventListener("click", () => {
  setTheme(document.documentElement.dataset.theme !== "dark");
});

function setAuthMode(mode) {
  const isRegister = mode === "register";

  loginForm.hidden = isRegister;
  registerForm.hidden = !isRegister;
  loginSwitch.hidden = isRegister;
  registerSwitch.hidden = !isRegister;
  document.title = isRegister ? "Регистрация — Решись Авиа" : "Вход — Решись Авиа";

  tabButtons.forEach((button) => {
    const isActive = button.dataset.authMode === mode;
    button.classList.toggle("auth-tab--active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => setAuthMode(button.dataset.authMode));
});
