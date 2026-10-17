
const searchForm = document.querySelector("#searchForm");
const cityInput = document.querySelector("#cityInput");
const searchButton = document.querySelector("#searchButton");
const statusMessage = document.querySelector("#statusMessage");

const forecastSection = document.querySelector("#forecastSection");
const cityName = document.querySelector("#cityName");
const todayDate = document.querySelector("#todayDate");
const currentIcon = document.querySelector("#currentIcon");
const currentTemperature = document.querySelector("#currentTemperature");
const currentDescription = document.querySelector("#currentDescription");
const forecastList = document.querySelector("#forecastList");

const weatherCodes = {
  0: ["Clear sky", "☀️"],
  1: ["Mainly clear", "🌤️"],
  2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁️"],
  45: ["Fog", "🌫️"],
  48: ["Rime fog", "🌫️"],
  51: ["Light drizzle", "🌦️"],
  53: ["Drizzle", "🌦️"],
  55: ["Heavy drizzle", "🌧️"],
  56: ["Freezing drizzle", "🌧️"],
  57: ["Heavy freezing drizzle", "🌧️"],
  61: ["Slight rain", "🌦️"],
  63: ["Moderate rain", "🌧️"],
  65: ["Heavy rain", "🌧️"],
  66: ["Freezing rain", "🌧️"],
  67: ["Heavy freezing rain", "🌧️"],
  71: ["Slight snow", "🌨️"],
  73: ["Moderate snow", "🌨️"],
  75: ["Heavy snow", "❄️"],
  77: ["Snow grains", "❄️"],
  80: ["Rain showers", "🌦️"],
  81: ["Moderate showers", "🌧️"],
  82: ["Heavy showers", "⛈️"],
  85: ["Snow showers", "🌨️"],
  86: ["Heavy snow showers", "❄️"],
  95: ["Thunderstorm", "⛈️"],
  96: ["Thunderstorm with hail", "⛈️"],
  99: ["Thunderstorm with heavy hail", "⛈️"]
};

function getWeatherInfo(code) {
  return weatherCodes[code] || ["Unknown conditions", "🌍"];
}

function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("error", isError);
}

async function getCity(city) {
  const url = new URL(
    "https://geocoding-api.open-meteo.com/v1/search"
  );

  url.search = new URLSearchParams({
    name: city,
    count: "1",
    language: "en",
    format: "json"
  }).toString();

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Could not search for this city.");
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("City not found. Please check the spelling.");
  }

  return data.results[0];
}

async function getForecast(latitude, longitude) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");

  url.search = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "temperature_2m,weather_code",
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "wind_speed_10m_max"
    ].join(","),
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    timezone: "auto",
    forecast_days: "7"
  }).toString();

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Could not load forecast. Please try again.");
  }

  return response.json();
}

function formatDate(dateString, options) {
  // Add noon to avoid date shifts from timezone conversion.
  const date = new Date(`${dateString}T12:00:00`);

  return new Intl.DateTimeFormat("en-US", {
    ...options,
    timeZone: "UTC"
  }).format(date);
}

function displayForecast(location, data) {
  if (!data.current || !data.daily || !data.daily.time) {
    throw new Error("Weather forecast data is unavailable.");
  }

  const daily = data.daily;

  const region = location.admin1
    ? `${location.name}, ${location.admin1}, ${location.country}`
    : `${location.name}, ${location.country}`;

  cityName.textContent = region;

  todayDate.textContent =
    `Today: ${formatDate(daily.time[0], {
      weekday: "long",
      month: "long",
      day: "numeric"
    })}`;

  const currentInfo = getWeatherInfo(data.current.weather_code);

  currentIcon.textContent = currentInfo[1];
  currentTemperature.textContent =
    `${Math.round(data.current.temperature_2m)}°C`;
  currentDescription.textContent = currentInfo[0];

  // Clear the previous city's forecast.
  forecastList.replaceChildren();

  daily.time.forEach((date, index) => {
    const info = getWeatherInfo(daily.weather_code[index]);

    const card = document.createElement("article");
    card.className = "forecast-card";

    const day = document.createElement("p");
    day.className = "forecast-day";
    day.textContent = index === 0
      ? "Today"
      : formatDate(date, { weekday: "short" });

    const dateLabel = document.createElement("p");
    dateLabel.className = "forecast-date";
    dateLabel.textContent = formatDate(date, {
      month: "short",
      day: "numeric"
    });

    const icon = document.createElement("div");
    icon.className = "forecast-icon";
    icon.textContent = info[1];
    icon.setAttribute("aria-label", info[0]);

    const description = document.createElement("p");
    description.className = "forecast-description";
    description.textContent = info[0];

    const temperatures = document.createElement("div");
    temperatures.className = "temperatures";

    const maxTemp = document.createElement("span");
    maxTemp.className = "temp-max";
    maxTemp.textContent =
      `${Math.round(daily.temperature_2m_max[index])}°`;

    const minTemp = document.createElement("span");
    minTemp.className = "temp-min";
    minTemp.textContent =
      `${Math.round(daily.temperature_2m_min[index])}°`;

    temperatures.append(maxTemp, minTemp);

    const wind = document.createElement("p");
    wind.className = "wind";
    wind.textContent =
      `💨 ${Math.round(daily.wind_speed_10m_max[index])} km/h wind`;

    card.append(day, dateLabel, icon, description, temperatures, wind);
    forecastList.appendChild(card);
  });

  forecastSection.hidden = false;
}

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (!city) {
    showStatus("Please enter a city name.", true);
    return;
  }

  searchButton.disabled = true;
  searchButton.textContent = "Loading...";
  forecastSection.hidden = true;
  showStatus(`Loading 7-day forecast for ${city}...`);

  try {
    const location = await getCity(city);

    const data = await getForecast(
      location.latitude,
      location.longitude
    );

    displayForecast(location, data);
    showStatus("7-day forecast loaded successfully!");
  } catch (error) {
    showStatus(
      error.message || "Something went wrong. Please try again.",
      true
    );
  } finally {
    searchButton.disabled = false;
    searchButton.textContent = "Search";
  }
});
