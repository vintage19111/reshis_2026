const routeForm = document.querySelector("#route-form");
const originSelect = document.querySelector("#origin");
const destinationSelect = document.querySelector("#destination");
const flightDateSelect = document.querySelector("#flight-date");
const calculateButton = document.querySelector("#calculate-button");
const dataStatus = document.querySelector("#data-status");
const resultsSection = document.querySelector("#results");
const routeTitle = document.querySelector("#route-title");
const resultDate = document.querySelector("#result-date");
const seatsValue = document.querySelector("#seats-value");
const demandValue = document.querySelector("#demand-value");
const flownValue = document.querySelector("#flown-value");
const daysTableBody = document.querySelector("#days-table-body");
const daysNote = document.querySelector("#days-note");
const themeToggle = document.querySelector("#theme-toggle");
const themeStorageKey = "reshis-theme";
const routeStorageKey = "reshis-route-selection";
const forecastFile = "Салтыков_Михаил_Дмитриевич_my_forecast.csv";

const cityNames = {
  MOW: "Москва",
  AER: "Сочи",
  KGD: "Калининград",
  LED: "Санкт-Петербург",
  MRV: "Минеральные Воды",
  OVB: "Новосибирск",
};

const numberFormat = new Intl.NumberFormat("ru-RU");
let forecastRows = [];

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

function formatFlightDate(value, options = { day: "numeric", month: "long", year: "numeric" }) {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("ru-RU", options).format(
    new Date(year, month - 1, day, 12),
  );
}

function parseForecast(csvText) {
  const [headerLine, ...dataLines] = csvText.trim().split(/\r?\n/);
  const headers = headerLine.replace(/^\uFEFF/, "").split(",");
  const routeIndex = headers.indexOf("route");
  const dateIndex = headers.indexOf("date");
  const seatsIndex = headers.indexOf("seats");
  const medianDemandIndex = headers.indexOf("0.5_base_demand");

  if ([routeIndex, dateIndex, seatsIndex, medianDemandIndex].some((index) => index < 0)) {
    throw new Error("В CSV не найдены нужные колонки маршрута, даты, мест и P50 спроса.");
  }

  return dataLines
    .filter((line) => line.trim())
    .map((line) => {
      const fields = line.split(",");
      return {
        route: fields[routeIndex]?.trim(),
        date: fields[dateIndex]?.trim(),
        seats: Number(fields[seatsIndex]),
        medianDemand: Number(fields[medianDemandIndex]),
      };
    })
    .filter((row) =>
      row.route &&
      /^\d{4}-\d{2}-\d{2}$/.test(row.date) &&
      Number.isFinite(row.seats) &&
      Number.isFinite(row.medianDemand),
    );
}

function getCityName(code) {
  return cityNames[code] ?? code;
}

function updateCalculateButton() {
  calculateButton.disabled = !(
    originSelect.value &&
    destinationSelect.value &&
    flightDateSelect.value
  );
}

function saveRouteSelection() {
  try {
    localStorage.setItem(routeStorageKey, JSON.stringify({
      origin: originSelect.value,
      destination: destinationSelect.value,
      date: flightDateSelect.value,
    }));
  } catch {
    // Форма продолжает работать, даже если браузер не разрешает хранение.
  }
}

function readRouteSelection() {
  try {
    return JSON.parse(localStorage.getItem(routeStorageKey) ?? "null");
  } catch {
    return null;
  }
}

function restoreRouteSelection() {
  const saved = readRouteSelection();
  if (!saved) return;

  const originExists = [...originSelect.options].some((option) => option.value === saved.origin);
  if (!originExists) return;

  originSelect.value = saved.origin;
  populateDestinations();

  const destinationExists = [...destinationSelect.options].some(
    (option) => option.value === saved.destination,
  );
  if (!destinationExists) return;

  destinationSelect.value = saved.destination;
  populateDates();

  const dateExists = [...flightDateSelect.options].some((option) => option.value === saved.date);
  if (dateExists) flightDateSelect.value = saved.date;
  updateCalculateButton();
}

function showDependencyHint(select, dependencyIsMissing, message) {
  const showHint = (event) => {
    if (!dependencyIsMissing()) return;
    event.preventDefault();
    dataStatus.textContent = message;
  };

  select.addEventListener("pointerdown", showHint);
  select.addEventListener("keydown", (event) => {
    if (["Enter", " ", "ArrowDown"].includes(event.key)) showHint(event);
  });
}

function hideResults() {
  resultsSection.classList.remove("is-visible");
  resultsSection.hidden = true;
  document.body.classList.remove("has-results");
}

function populateOrigins() {
  const originCodes = [...new Set(forecastRows.map(({ route }) => route.split("-")[0]))].sort();
  addPlaceholder(originSelect, "Выберите город");

  originCodes.forEach((code) => {
    originSelect.add(new Option(getCityName(code), code));
  });

  originSelect.disabled = originCodes.length === 0;
  addPlaceholder(destinationSelect, "Сначала: Откуда");
  addPlaceholder(flightDateSelect, "Сначала: Куда");
  destinationSelect.disabled = false;
  flightDateSelect.disabled = false;
  destinationSelect.setAttribute("aria-disabled", "true");
  flightDateSelect.setAttribute("aria-disabled", "true");
  dataStatus.textContent = originCodes.length ? "" : "В файле нет доступных маршрутов.";
  restoreRouteSelection();
}

function populateDestinations() {
  const originCode = originSelect.value;
  addPlaceholder(destinationSelect, originCode ? "Выберите город" : "Сначала: Откуда");
  addPlaceholder(flightDateSelect, "Сначала: Куда");
  destinationSelect.disabled = false;
  flightDateSelect.disabled = false;
  hideResults();

  flightDateSelect.setAttribute("aria-disabled", "true");
  destinationSelect.setAttribute("aria-disabled", String(!originCode));
  if (!originCode) {
    dataStatus.textContent = "";
    updateCalculateButton();
    return;
  }

  const destinations = [...new Set(
    forecastRows
      .filter(({ route }) => route.split("-")[0] === originCode)
      .map(({ route }) => route.split("-")[1]),
  )].sort();

  destinations.forEach((code) => {
    destinationSelect.add(new Option(getCityName(code), code));
  });

  destinationSelect.setAttribute("aria-disabled", String(destinations.length === 0));
  dataStatus.textContent = "";
  updateCalculateButton();
}

function populateDates() {
  const hasRoute = Boolean(originSelect.value && destinationSelect.value);
  addPlaceholder(flightDateSelect, hasRoute ? "Выберите дату" : "Сначала: Куда");
  flightDateSelect.disabled = false;
  flightDateSelect.setAttribute("aria-disabled", String(!hasRoute));
  hideResults();

  if (!hasRoute) {
    dataStatus.textContent = "";
    updateCalculateButton();
    return;
  }

  const route = `${originSelect.value}-${destinationSelect.value}`;
  const dates = [...new Set(
    forecastRows.filter((row) => row.route === route).map((row) => row.date),
  )].sort();

  dates.forEach((date) => {
    flightDateSelect.add(new Option(formatFlightDate(date), date));
  });

  flightDateSelect.setAttribute("aria-disabled", String(dates.length === 0));
  dataStatus.textContent = "";
  updateCalculateButton();
}

function renderSummary(row) {
  const [originCode, destinationCode] = row.route.split("-");
  routeTitle.textContent = `${getCityName(originCode)} — ${getCityName(destinationCode)}`;
  resultDate.textContent = formatFlightDate(row.date);
  seatsValue.textContent = numberFormat.format(row.seats);
  demandValue.textContent = numberFormat.format(row.medianDemand);
  flownValue.textContent = numberFormat.format(Math.min(row.seats, Math.max(0, row.medianDemand)));

  const routeRows = forecastRows
    .filter((item) => item.route === row.route)
    .sort((first, second) => first.date.localeCompare(second.date));
  const selectedIndex = routeRows.findIndex((item) => item.date === row.date);
  const startIndex = Math.max(0, selectedIndex - 3);
  const endIndex = Math.min(routeRows.length, selectedIndex + 4);
  const nearbyRows = routeRows.slice(startIndex, endIndex);

  daysTableBody.replaceChildren();
  nearbyRows.forEach((item) => {
    const isSelectedDay = item.date === row.date;
    const tableRow = document.createElement("tr");
    tableRow.classList.toggle("is-current", isSelectedDay);
    if (isSelectedDay) tableRow.setAttribute("aria-current", "date");

    const dateCell = document.createElement("th");
    dateCell.scope = "row";
    dateCell.textContent = formatFlightDate(item.date, {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

    const seatsCell = document.createElement("td");
    seatsCell.textContent = numberFormat.format(item.seats);

    const demandCell = document.createElement("td");
    demandCell.textContent = numberFormat.format(item.medianDemand);

    const flownCell = document.createElement("td");
    flownCell.textContent = numberFormat.format(Math.min(item.seats, Math.max(0, item.medianDemand)));

    tableRow.append(dateCell, seatsCell, demandCell, flownCell);
    daysTableBody.append(tableRow);
  });

  const availableDays = nearbyRows.length;
  daysNote.hidden = availableDays === 7;
  daysNote.textContent = `В пределах дат файла доступно ${availableDays} из 7 дней.`;
}

function showResults(row) {
  renderSummary(row);
  resultsSection.hidden = false;
  document.body.classList.add("has-results");

  requestAnimationFrame(() => {
    resultsSection.classList.add("is-visible");
  });

  if (window.matchMedia("(max-width: 640px)").matches) {
    window.setTimeout(() => {
      resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }
}

originSelect.addEventListener("change", () => {
  populateDestinations();
  saveRouteSelection();
});
destinationSelect.addEventListener("change", () => {
  populateDates();
  saveRouteSelection();
});
flightDateSelect.addEventListener("change", () => {
  hideResults();
  updateCalculateButton();
  saveRouteSelection();
});

showDependencyHint(
  destinationSelect,
  () => !originSelect.value,
  "Сначала выберите город отправления.",
);
showDependencyHint(
  flightDateSelect,
  () => !destinationSelect.value,
  "Сначала выберите город назначения.",
);

routeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (calculateButton.disabled) return;

  const route = `${originSelect.value}-${destinationSelect.value}`;
  const row = forecastRows.find((item) => item.route === route && item.date === flightDateSelect.value);

  if (!row) {
    dataStatus.textContent = "Для выбранного маршрута и даты нет прогноза в файле.";
    return;
  }

  dataStatus.textContent = "";
  showResults(row);
});

async function loadForecast() {
  dataStatus.textContent = "Загружаем прогноз…";

  try {
    const forecastUrl = new URL(forecastFile, window.location.href);
    const response = await fetch(forecastUrl);
    if (!response.ok) throw new Error(`Не удалось загрузить файл (${response.status}).`);

    forecastRows = parseForecast(await response.text());
    if (forecastRows.length === 0) throw new Error("В файле не найдено строк прогноза.");

    populateOrigins();
  } catch (error) {
    originSelect.disabled = true;
    destinationSelect.disabled = true;
    flightDateSelect.disabled = true;
    calculateButton.disabled = true;
    dataStatus.textContent = `${error.message} Откройте страницу через локальный веб-сервер, а не как file://.`;
  }
}

loadForecast();
