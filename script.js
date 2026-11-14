const routeForm = document.querySelector("#route-form");
const originSelect = document.querySelector("#origin");
const destinationSelect = document.querySelector("#destination");
const flightDateSelect = document.querySelector("#flight-date");
const ticketPriceInput = document.querySelector("#ticket-price");
const calculateButton = document.querySelector("#calculate-button");
const resetButton = document.querySelector("#reset-form");
const brandHome = document.querySelector("#brand-home");
const dataStatus = document.querySelector("#data-status");
const resultsSection = document.querySelector("#results");
const routeTitle = document.querySelector("#route-title");
const resultDate = document.querySelector("#result-date");
const seatsValue = document.querySelector("#seats-value");
const demandValue = document.querySelector("#demand-value");
const flownValue = document.querySelector("#flown-value");
const demandLabel = document.querySelector("#demand-label");
const quantileChart = document.querySelector("#quantile-chart");
const quantileValues = document.querySelector("#quantile-values");
const daysTableBody = document.querySelector("#days-table-body");
const daysNote = document.querySelector("#days-note");
const daysDescription = document.querySelector("#days-description");
const themeToggle = document.querySelector("#theme-toggle");
const themeStorageKey = "reshis-theme";
const routeStorageKey = "reshis-route-selection";
const forecastFile = "Салтыков_Михаил_Дмитриевич_my_forecast.csv";
const routesFile = "routes.csv";

const cityNames = {
  MOW: "Москва",
  AER: "Сочи",
  KGD: "Калининград",
  LED: "Санкт-Петербург",
  MRV: "Минеральные Воды",
  OVB: "Новосибирск",
};

const numberFormat = new Intl.NumberFormat("ru-RU");
const passengerFormat = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });
const quantileLevels = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
const currencyFormat = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});
let forecastRows = [];
let routeParameters = new Map();
let activeQuantileChart = null;
let activeResult = null;
let selectedQuantileLevel = 0.5;

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
  const quantileColumns = quantileLevels.map((level) => {
    const formattedLevel = level.toFixed(1);
    return {
      level,
      demandIndex: headers.indexOf(formattedLevel + "_base_demand"),
    };
  });

  if (
    [routeIndex, dateIndex, seatsIndex].some((index) => index < 0) ||
    quantileColumns.some(({ demandIndex }) => demandIndex < 0)
  ) {
    throw new Error("В CSV не найдены маршрут, дата, места и все девять квантилей спроса.");
  }

  return dataLines
    .filter((line) => line.trim())
    .map((line) => {
      const fields = line.split(",");
      const quantiles = quantileColumns.map(({ level, demandIndex }) => ({
        level,
        baseDemand: Number(fields[demandIndex]),
      }));
      return {
        route: fields[routeIndex]?.trim(),
        date: fields[dateIndex]?.trim(),
        seats: Number(fields[seatsIndex]),
        medianDemand: quantiles.find(({ level }) => level === 0.5)?.baseDemand,
        quantiles,
      };
    })
    .filter((row) =>
      row.route &&
      /^\d{4}-\d{2}-\d{2}$/.test(row.date) &&
      Number.isFinite(row.seats) &&
      Number.isFinite(row.medianDemand) &&
      row.quantiles.every(({ baseDemand }) => Number.isFinite(baseDemand)),
    );
}

function parseCsvLine(line) {
  const fields = [];
  let field = "";
  let isQuoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"') {
      if (isQuoted && line[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        isQuoted = !isQuoted;
      }
    } else if (character === "," && !isQuoted) {
      fields.push(field);
      field = "";
    } else {
      field += character;
    }
  }

  fields.push(field);
  return fields;
}

function parseRoutes(csvText) {
  const [headerLine, ...dataLines] = csvText.trim().split(/\r?\n/);
  const headers = parseCsvLine(headerLine.replace(/^\uFEFF/, ""));
  const requiredColumns = ["route", "base_price", "price_sensitivity", "price_min", "price_max"];
  const indexes = Object.fromEntries(requiredColumns.map((column) => [column, headers.indexOf(column)]));

  if (requiredColumns.some((column) => indexes[column] < 0)) {
    throw new Error("В routes.csv не найдены параметры цены для маршрутов.");
  }

  const parameters = new Map();
  dataLines
    .filter((line) => line.trim())
    .forEach((line) => {
      const fields = parseCsvLine(line);
      const route = fields[indexes.route]?.trim();
      const basePrice = Number(fields[indexes.base_price]);
      const priceSensitivity = Number(fields[indexes.price_sensitivity]);
      const priceMin = Number(fields[indexes.price_min]);
      const priceMax = Number(fields[indexes.price_max]);

      if (
        route &&
        [basePrice, priceSensitivity, priceMin, priceMax].every(Number.isFinite) &&
        priceMin <= basePrice &&
        basePrice <= priceMax
      ) {
        parameters.set(route, { basePrice, priceSensitivity, priceMin, priceMax });
      }
    });

  if (parameters.size === 0) throw new Error("В routes.csv нет корректных ценовых параметров.");
  return parameters;
}

function getCityName(code) {
  return cityNames[code] ?? code;
}

function updateCalculateButton() {
  const route = originSelect.value + "-" + destinationSelect.value;
  const parameters = routeParameters.get(route);
  const price = Number(ticketPriceInput.value);
  const priceIsValid = Boolean(
    parameters &&
    ticketPriceInput.value.trim() &&
    ticketPriceInput.validity.valid &&
    Number.isFinite(price) &&
    price >= parameters.priceMin &&
    price <= parameters.priceMax,
  );

  calculateButton.disabled = !(
    originSelect.value &&
    destinationSelect.value &&
    flightDateSelect.value &&
    priceIsValid
  );
}

function configurePriceInput(route, preferredPrice = "") {
  const parameters = routeParameters.get(route);
  if (!parameters) {
    ticketPriceInput.value = "";
    ticketPriceInput.disabled = true;
    ticketPriceInput.removeAttribute("min");
    ticketPriceInput.removeAttribute("max");
    return;
  }

  ticketPriceInput.disabled = false;
  ticketPriceInput.min = String(parameters.priceMin);
  ticketPriceInput.max = String(parameters.priceMax);
  ticketPriceInput.step = "1";

  const requestedPrice = String(preferredPrice).trim() ? Number(preferredPrice) : NaN;
  const priceIsInRange = Number.isFinite(requestedPrice) &&
    requestedPrice >= parameters.priceMin &&
    requestedPrice <= parameters.priceMax;
  ticketPriceInput.value = String(priceIsInRange ? requestedPrice : parameters.basePrice);
}

function updatePriceStatus() {
  const route = originSelect.value + "-" + destinationSelect.value;
  const parameters = routeParameters.get(route);
  if (!parameters) {
    dataStatus.textContent = "";
    return;
  }

  const price = Number(ticketPriceInput.value);
  if (!ticketPriceInput.value.trim() || !Number.isFinite(price) ||
      !ticketPriceInput.validity.valid ||
      price < parameters.priceMin || price > parameters.priceMax) {
    dataStatus.textContent = "Введите целую цену от " + currencyFormat.format(parameters.priceMin) +
      " до " + currencyFormat.format(parameters.priceMax) + ".";
    return;
  }

  dataStatus.textContent = "Цена за билет · допустимо " +
    currencyFormat.format(parameters.priceMin) + "–" +
    currencyFormat.format(parameters.priceMax) + ".";
}

function saveRouteSelection() {
  try {
    localStorage.setItem(routeStorageKey, JSON.stringify({
      origin: originSelect.value,
      destination: destinationSelect.value,
      date: flightDateSelect.value,
      price: ticketPriceInput.value,
      quantile: selectedQuantileLevel,
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
  const savedQuantile = Number(saved.quantile);
  if (quantileLevels.includes(savedQuantile)) selectedQuantileLevel = savedQuantile;

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
  if (saved.price) configurePriceInput(saved.origin + "-" + saved.destination, saved.price);
  updatePriceStatus();
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

function resetSelection() {
  originSelect.value = "";
  addPlaceholder(destinationSelect, "Сначала: Откуда");
  addPlaceholder(flightDateSelect, "Сначала: Куда");
  destinationSelect.disabled = false;
  flightDateSelect.disabled = false;
  destinationSelect.setAttribute("aria-disabled", "true");
  flightDateSelect.setAttribute("aria-disabled", "true");
  configurePriceInput("");

  selectedQuantileLevel = 0.5;
  activeResult = null;
  activeQuantileChart = null;
  hideResults();
  quantileChart.replaceChildren();
  quantileValues.replaceChildren();
  daysTableBody.replaceChildren();
  daysNote.hidden = true;
  daysNote.textContent = "";

  routeTitle.textContent = "Прогноз спроса";
  resultDate.textContent = "";
  seatsValue.textContent = "—";
  demandValue.textContent = "—";
  flownValue.textContent = "—";
  demandLabel.textContent = "Спрос за день · P50";
  daysDescription.textContent = "Три дня до и после выбранной даты · сценарий P50";
  dataStatus.textContent = "";
  updateCalculateButton();

  try {
    localStorage.removeItem(routeStorageKey);
  } catch {
    // Очистка формы работает и без доступа к localStorage.
  }
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
  configurePriceInput("");
  dataStatus.textContent = originCodes.length ? "" : "В файле нет доступных маршрутов.";
  restoreRouteSelection();
}

function populateDestinations() {
  const originCode = originSelect.value;
  addPlaceholder(destinationSelect, originCode ? "Выберите город" : "Сначала: Откуда");
  addPlaceholder(flightDateSelect, "Сначала: Куда");
  configurePriceInput("");
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
  configurePriceInput(route);
  const dates = [...new Set(
    forecastRows.filter((row) => row.route === route).map((row) => row.date),
  )].sort();

  dates.forEach((date) => {
    flightDateSelect.add(new Option(formatFlightDate(date), date));
  });

  flightDateSelect.setAttribute("aria-disabled", String(dates.length === 0));
  updatePriceStatus();
  updateCalculateButton();
}

function calculateDemand(baseDemand, price, parameters) {
  return Math.max(
    0,
    baseDemand - parameters.priceSensitivity * (price - parameters.basePrice),
  );
}

function createSvgElement(name, attributes = {}, textContent = "") {
  const element = document.createElementNS("http://www.w3.org/2000/svg", name);
  Object.entries(attributes).forEach(([attribute, value]) => {
    element.setAttribute(attribute, String(value));
  });
  if (textContent !== "") element.textContent = textContent;
  return element;
}

function renderQuantileValues(points) {
  quantileValues.replaceChildren();

  points.forEach(({ level, demand }) => {
    const isSelected = level === selectedQuantileLevel;
    const isMedian = level === 0.5;
    const card = document.createElement("button");
    card.type = "button";
    card.className = "quantile-card";
    card.dataset.quantile = String(level);
    card.setAttribute("aria-pressed", String(isSelected));
    card.setAttribute(
      "aria-label",
      "P" + Math.round(level * 100) + ": " + passengerFormat.format(demand) +
        " пассажиров. " + (isMedian ? "Медиана. " : "") + "Выбрать квантиль.",
    );
    if (isMedian) card.classList.add("quantile-card--median");
    if (isSelected) card.classList.add("quantile-card--selected");

    const label = document.createElement("span");
    label.textContent = "P" + Math.round(level * 100);

    const value = document.createElement("strong");
    value.textContent = passengerFormat.format(demand);

    card.append(label, value);
    quantileValues.append(card);
  });
}

function getChartTickStep(maxValue) {
  const roughStep = maxValue / 4;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep || 1));
  const normalizedStep = roughStep / magnitude;
  const preferredStep = normalizedStep <= 1 ? 1 : normalizedStep <= 2 ? 2 : normalizedStep <= 5 ? 5 : 10;
  return preferredStep * magnitude;
}

function addOverCapacityAreas(svg, points, seats, yForDemand, capacityY) {
  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index];
    const end = points[index + 1];
    const startIsOver = start.demand > seats;
    const endIsOver = end.demand > seats;
    if (!startIsOver && !endIsOver) continue;

    let path;
    if (startIsOver && endIsOver) {
      path = "M " + start.x + " " + capacityY +
        " L " + start.x + " " + yForDemand(start.demand) +
        " L " + end.x + " " + yForDemand(end.demand) +
        " L " + end.x + " " + capacityY + " Z";
    } else {
      const crossingX = start.x +
        ((seats - start.demand) / (end.demand - start.demand)) * (end.x - start.x);

      if (startIsOver) {
        path = "M " + start.x + " " + capacityY +
          " L " + start.x + " " + yForDemand(start.demand) +
          " L " + crossingX + " " + capacityY + " Z";
      } else {
        path = "M " + crossingX + " " + capacityY +
          " L " + end.x + " " + yForDemand(end.demand) +
          " L " + end.x + " " + capacityY + " Z";
      }
    }

    svg.append(createSvgElement("path", {
      d: path,
      class: "chart-area--shortage",
    }));
  }
}

function drawQuantileChart() {
  if (!activeQuantileChart) return;

  const bounds = quantileChart.getBoundingClientRect();
  const width = Math.round(bounds.width);
  const height = Math.round(bounds.height);
  if (!width || !height) return;

  const chart = activeQuantileChart;
  const margin = { top: 30, right: 18, bottom: 34, left: 52 };
  const plotLeft = margin.left;
  const plotRight = width - margin.right;
  const plotTop = margin.top;
  const plotBottom = height - margin.bottom;
  const plotHeight = plotBottom - plotTop;
  const maxValue = Math.max(chart.seats, ...chart.points.map(({ demand }) => demand), 1) * 1.12;
  const tickStep = getChartTickStep(maxValue);
  const yMaximum = Math.ceil(maxValue / tickStep) * tickStep;
  const yForDemand = (demand) => plotBottom - (demand / yMaximum) * plotHeight;
  const capacityY = yForDemand(chart.seats);
  const points = chart.points.map((point, index) => ({
    ...point,
    x: plotLeft + (index / (chart.points.length - 1)) * (plotRight - plotLeft),
  }));
  const linePath = points
    .map((point, index) => (index === 0 ? "M " : "L ") + point.x + " " + yForDemand(point.demand))
    .join(" ");
  const areaPath = "M " + points[0].x + " " + plotBottom + " " +
    points.map((point) => "L " + point.x + " " + yForDemand(point.demand)).join(" ") +
    " L " + points[points.length - 1].x + " " + plotBottom + " Z";

  quantileChart.setAttribute("viewBox", "0 0 " + width + " " + height);
  quantileChart.setAttribute("preserveAspectRatio", "none");
  quantileChart.replaceChildren();
  quantileChart.append(
    createSvgElement("title", {}, "Прогноз спроса по квантилям"),
    createSvgElement(
      "desc",
      {},
      "Значения спроса от P10 до P90 при выбранной цене. Пунктирная линия показывает вместимость самолёта.",
    ),
  );

  for (let tick = 0; tick <= yMaximum; tick += tickStep) {
    const y = yForDemand(tick);
    quantileChart.append(
      createSvgElement("line", {
        x1: plotLeft,
        y1: y,
        x2: plotRight,
        y2: y,
        class: "chart-gridline",
      }),
      createSvgElement("text", {
        x: plotLeft - 9,
        y: y + 4,
        "text-anchor": "end",
        class: "chart-tick",
      }, numberFormat.format(tick)),
    );
  }

  quantileChart.append(createSvgElement("path", {
    d: areaPath,
    class: "chart-area--demand",
  }));
  addOverCapacityAreas(quantileChart, points, chart.seats, yForDemand, capacityY);

  const medianPoint = points.find(({ level }) => level === 0.5);
  const selectedPoint = points.find(({ level }) => level === chart.selectedLevel);
  if (medianPoint) {
    quantileChart.append(createSvgElement("line", {
      x1: medianPoint.x,
      y1: plotTop,
      x2: medianPoint.x,
      y2: plotBottom,
      class: "chart-median",
    }));
  }
  if (selectedPoint) {
    quantileChart.append(createSvgElement("line", {
      x1: selectedPoint.x,
      y1: plotTop,
      x2: selectedPoint.x,
      y2: plotBottom,
      class: "chart-selection",
    }));
  }

  quantileChart.append(
    createSvgElement("line", {
      x1: plotLeft,
      y1: capacityY,
      x2: plotRight,
      y2: capacityY,
      class: "chart-limit",
    }),
    createSvgElement("line", {
      x1: plotLeft,
      y1: plotTop,
      x2: plotLeft,
      y2: plotBottom,
      class: "chart-axis",
    }),
    createSvgElement("line", {
      x1: plotLeft,
      y1: plotBottom,
      x2: plotRight,
      y2: plotBottom,
      class: "chart-axis",
    }),
    createSvgElement("path", {
      d: linePath,
      class: "chart-curve",
    }),
  );

  points.forEach((point) => {
    const isMedian = point.level === 0.5;
    const isSelected = point.level === chart.selectedLevel;
    const pointClasses = ["chart-point"];
    if (isMedian) pointClasses.push("chart-point--median");
    if (isSelected) pointClasses.push("chart-point--selected");
    const circle = createSvgElement("circle", {
      cx: point.x,
      cy: yForDemand(point.demand),
      r: isSelected ? 7 : isMedian ? 5 : 4,
      class: pointClasses.join(" "),
    });
    circle.append(createSvgElement(
      "title",
      {},
      "P" + Math.round(point.level * 100) + ": " + passengerFormat.format(point.demand) + " пассажиров",
    ));
    quantileChart.append(circle);
    const tickClasses = ["chart-tick"];
    if (isMedian) tickClasses.push("chart-tick--median");
    if (isSelected) tickClasses.push("chart-tick--selected");
    quantileChart.append(createSvgElement("text", {
      x: point.x,
      y: height - 9,
      "text-anchor": "middle",
      class: tickClasses.join(" "),
    }, "P" + Math.round(point.level * 100)));
  });
}

function renderQuantileChart(row, price, parameters) {
  const points = row.quantiles.map(({ level, baseDemand }) => ({
    level,
    demand: calculateDemand(baseDemand, price, parameters),
  }));

  activeQuantileChart = { points, seats: row.seats, selectedLevel: selectedQuantileLevel };
  renderQuantileValues(points);
}

function renderSummary(row, price, parameters) {
  activeResult = { row, price, parameters };
  const [originCode, destinationCode] = row.route.split("-");
  routeTitle.textContent = getCityName(originCode) + " — " + getCityName(destinationCode);
  resultDate.textContent = formatFlightDate(row.date) + " · билет " + currencyFormat.format(price);
  const selectedScenario = row.quantiles.find(({ level }) => level === selectedQuantileLevel);
  const selectedBaseDemand = selectedScenario?.baseDemand ?? row.medianDemand;
  const selectedDemand = calculateDemand(selectedBaseDemand, price, parameters);
  const selectedLabel = "P" + Math.round(selectedQuantileLevel * 100);
  demandLabel.textContent = "Спрос за день · " + selectedLabel;
  daysDescription.textContent = "Три дня до и после выбранной даты · сценарий " + selectedLabel;
  seatsValue.textContent = numberFormat.format(row.seats);
  demandValue.textContent = passengerFormat.format(selectedDemand);
  flownValue.textContent = passengerFormat.format(Math.min(row.seats, selectedDemand));
  renderQuantileChart(row, price, parameters);

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

    const scenario = item.quantiles.find(({ level }) => level === selectedQuantileLevel);
    const baseDemand = scenario?.baseDemand ?? item.medianDemand;
    const demand = calculateDemand(baseDemand, price, parameters);
    const demandCell = document.createElement("td");
    demandCell.textContent = passengerFormat.format(demand);

    const flownCell = document.createElement("td");
    flownCell.textContent = passengerFormat.format(Math.min(item.seats, demand));

    tableRow.append(dateCell, seatsCell, demandCell, flownCell);
    daysTableBody.append(tableRow);
  });

  const availableDays = nearbyRows.length;
  daysNote.hidden = availableDays === 7;
  daysNote.textContent = `В пределах дат файла доступно ${availableDays} из 7 дней.`;
}

function selectQuantile(level) {
  if (!quantileLevels.includes(level) || !activeResult) return;

  selectedQuantileLevel = level;
  renderSummary(activeResult.row, activeResult.price, activeResult.parameters);
  drawQuantileChart();
  saveRouteSelection();
}

function showResults(row, price, parameters) {
  renderSummary(row, price, parameters);
  resultsSection.hidden = false;
  document.body.classList.add("has-results");

  requestAnimationFrame(() => {
    drawQuantileChart();
    resultsSection.classList.add("is-visible");
  });

  if (window.matchMedia("(max-width: 640px)").matches) {
    window.setTimeout(() => {
      resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }
}

window.addEventListener("resize", () => {
  if (activeQuantileChart) drawQuantileChart();
});

quantileValues.addEventListener("click", (event) => {
  const quantileButton = event.target.closest("button[data-quantile]");
  if (!quantileButton) return;
  selectQuantile(Number(quantileButton.dataset.quantile));
});

resetButton.addEventListener("click", resetSelection);
brandHome.addEventListener("click", resetSelection);

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
ticketPriceInput.addEventListener("input", () => {
  hideResults();
  updatePriceStatus();
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

  const parameters = routeParameters.get(route);
  const price = Number(ticketPriceInput.value);
  if (!parameters || !Number.isFinite(price)) {
    dataStatus.textContent = "Проверьте цену билета для выбранного маршрута.";
    return;
  }

  dataStatus.textContent = "";
  showResults(row, price, parameters);
});

async function loadForecast() {
  dataStatus.textContent = "Загружаем прогноз…";

  try {
    const [forecastResponse, routesResponse] = await Promise.all([
      fetch(new URL(forecastFile, window.location.href)),
      fetch(new URL(routesFile, window.location.href)),
    ]);

    if (!forecastResponse.ok) {
      throw new Error("Не удалось загрузить прогноз (" + forecastResponse.status + ").");
    }
    if (!routesResponse.ok) {
      throw new Error("Не удалось загрузить параметры маршрутов (" + routesResponse.status + ").");
    }

    const [forecastText, routesText] = await Promise.all([
      forecastResponse.text(),
      routesResponse.text(),
    ]);
    forecastRows = parseForecast(forecastText);
    routeParameters = parseRoutes(routesText);
    if (forecastRows.length === 0) throw new Error("В файле не найдено строк прогноза.");

    populateOrigins();
  } catch (error) {
    originSelect.disabled = true;
    destinationSelect.disabled = true;
    flightDateSelect.disabled = true;
    ticketPriceInput.disabled = true;
    calculateButton.disabled = true;
    dataStatus.textContent = `${error.message} Откройте страницу через локальный веб-сервер, а не как file://.`;
  }
}

loadForecast();
