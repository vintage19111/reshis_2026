const originSelect = document.querySelector("#origin");
const destinationSelect = document.querySelector("#destination");
const flightDateSelect = document.querySelector("#flight-date");
const dataStatus = document.querySelector("#data-status");
const themeToggle = document.querySelector("#theme-toggle");
const themeStorageKey = "reshis-theme";
const forecastFile = "Салтыков_Михаил_Дмитриевич_my_forecast.csv";

const cityNames = {
  MOW: "Москва",
  AER: "Сочи",
  KGD: "Калининград",
  LED: "Санкт-Петербург",
  MRV: "Минеральные Воды",
  OVB: "Новосибирск",
};

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

themeToggle.addEventListener("click", () => {
  setTheme(document.documentElement.dataset.theme !== "dark");
});

function addPlaceholder(select, label) {
  select.replaceChildren(new Option(label, ""));
}

function formatFlightDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day, 12));
}

function parseForecast(csvText) {
  const [headerLine, ...dataLines] = csvText.trim().split(/\r?\n/);
  const headers = headerLine.split(",");
  const routeIndex = headers.indexOf("route");
  const dateIndex = headers.indexOf("date");

  if (routeIndex < 0 || dateIndex < 0) {
    throw new Error("В CSV не найдены колонки route и date.");
  }

  return dataLines
    .filter((line) => line.trim())
    .map((line) => {
      const fields = line.split(",");
      return {
        route: fields[routeIndex]?.trim(),
        date: fields[dateIndex]?.trim(),
      };
    })
    .filter((row) => row.route && row.date);
}

function getCityName(code) {
  return cityNames[code] ?? code;
}

function populateOrigins(rows) {
  const originCodes = [...new Set(rows.map(({ route }) => route.split("-")[0]))].sort();
  addPlaceholder(originSelect, "Выберите город");

  originCodes.forEach((code) => {
    originSelect.add(new Option(getCityName(code), code));
  });

  originSelect.disabled = originCodes.length === 0;
  dataStatus.textContent = "";
}

function populateDestinations(rows) {
  addPlaceholder(destinationSelect, "Выберите город");
  addPlaceholder(flightDateSelect, "Сначала выберите направление");
  destinationSelect.disabled = true;
  flightDateSelect.disabled = true;

  const originCode = originSelect.value;
  if (!originCode) return;

  const destinations = [...new Set(
    rows
      .filter(({ route }) => route.split("-")[0] === originCode)
      .map(({ route }) => route.split("-")[1]),
  )].sort();

  destinations.forEach((code) => {
    destinationSelect.add(new Option(getCityName(code), code));
  });

  destinationSelect.disabled = destinations.length === 0;
  dataStatus.textContent = "";
}

function populateDates(rows) {
  addPlaceholder(flightDateSelect, "Выберите дату");
  flightDateSelect.disabled = true;

  const route = `${originSelect.value}-${destinationSelect.value}`;
  const dates = [...new Set(
    rows.filter((row) => row.route === route).map((row) => row.date),
  )].sort();

  dates.forEach((date) => {
    flightDateSelect.add(new Option(formatFlightDate(date), date));
  });

  flightDateSelect.disabled = dates.length === 0;
  dataStatus.textContent = "";
}

originSelect.addEventListener("change", () => populateDestinations(forecastRows));
destinationSelect.addEventListener("change", () => populateDates(forecastRows));

let forecastRows = [];

async function loadForecast() {
  dataStatus.textContent = "Загружаем прогноз…";

  try {
    const forecastUrl = new URL(forecastFile, window.location.href);
    const response = await fetch(forecastUrl);

    if (!response.ok) {
      throw new Error(`Не удалось загрузить файл (${response.status}).`);
    }

    forecastRows = parseForecast(await response.text());
    if (forecastRows.length === 0) {
      throw new Error("В файле не найдено строк прогноза.");
    }

    populateOrigins(forecastRows);
  } catch (error) {
    originSelect.disabled = true;
    destinationSelect.disabled = true;
    flightDateSelect.disabled = true;
    dataStatus.textContent = `${error.message} Откройте страницу через локальный веб-сервер, а не как file://.`;
  }
}

loadForecast();
