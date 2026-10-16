
const searchForm = document.querySelector("#searchForm");
const cityInput = document.querySelector("#cityInput");
const searchButton = document.querySelector("#searchButton");
const statusMessage = document.querySelector("#statusMessage");
const weatherCard = document.querySelector("#weatherCard");

const cityName = document.querySelector("#cityName");
const weatherDescription = document.querySelector("#weatherDescription");
const weatherIcon = document.querySelector("#weatherIcon");
const temperature = document.querySelector("#temperature");
const feelsLike = document.querySelector("#feelsLike");
const humidity = document.querySelector("#humidity");
const windSpeed = document.querySelector("#windSpeed");
const updatedTime = document.querySelector("#updatedTime");

const weatherCodes = {
  0: { description: "Clear sky", icon: "☀️" },
  1: { description: "Mainly clear", icon: "🌤️" },
  2: { description: "Partly cloudy", icon: "⛅" },
  3: { description: "Overcast", icon: "☁️" },
  45: { description: "Fog", icon: "🌫️" },
  48: { description: "Depositing rime fog", icon: "🌫️" },
  51: { description: "Light drizzle", icon: "🌦️" },
  53: { description: "Moderate drizzle", icon: "🌦️" },
  55: { description: "Dense drizzle", icon: "🌧️" },
  56: { description: "Light freezing drizzle", icon: "🌧️" },
  57: { description: "Dense freezing drizzle", icon: "🌧️" },
  61: { description: "Slight rain", icon: "🌦️" },
  63: { description: "Moderate rain", icon: "🌧️" },
  65: { description: "Heavy rain", icon: "🌧️" },
  66: { description: "Light freezing rain", icon: "🌧️" },
  67: { description: "Heavy freezing rain", icon: "🌧️" },
  71: { description: "Slight snowfall", icon: "🌨️" },
  73: { description: "Moderate snowfall", icon: "🌨️" },
  75: { description: "Heavy snowfall", icon: "❄️" },
  77: { description: "Snow grains", icon: "❄️" },
  80: { description: "Slight rain showers", icon: "🌦️" },
  81: { description: "Moderate rain showers", icon: "🌧️" },
  82: { description: "Violent rain showers", icon: "⛈️" },
  85: { description: "Slight snow showers", icon: "🌨️" },
  86: { description: "Heavy snow showers", icon: "❄️" },
  95: { description: "Thunderstorm", icon: "⛈️" },
  96: { description: "Thunderstorm with hail", icon: "⛈️" },
  99: { description: "Thunderstorm with heavy hail", icon: "⛈️" }
};

function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("error", isError);
}

function getWeatherInfo(code) {
  return weatherCodes[code] || {
    description: "Weather information unavailable",
    icon: "🌍"
  };
}

async function getCityCoordinates(city) {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");

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

async function getWeather(latitude, longitude) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");

  url.search = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "is_day",
      "weather_code",
      "wind_speed_10m"
    ].join(","),
    timezone: "auto"
  }).toString();

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Could not load weather data. Please try again.");
  }

  return response.json();
}

function displayWeather(location, data) {
  const current = data.current;

  if (!current) {
    throw new Error("Weather data is unavailable for this city.");
  }

  const info = getWeatherInfo(current.weather_code);

  const region = location.admin1
    ? `${location.name}, ${location.admin1}, ${location.country}`
    : `${location.name}, ${location.country}`;

  cityName.textContent = region;
  weatherDescription.textContent = info.description;
  weatherIcon.textContent = info.icon;

  temperature.textContent = Math.round(current.temperature_2m);
  feelsLike.textContent =
    `${Math.round(current.apparent_temperature)} °C`;

  humidity.textContent = `${current.relative_humidity_2m}%`;
  windSpeed.textContent = `${current.wind_speed_10m} km/h`;

  updatedTime.textContent =
    `Weather time: ${current.time.replace("T", " ")}`;

  weatherCard.hidden = false;
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
  weatherCard.hidden = true;
  showStatus(`Searching weather for ${city}...`);

  try {
    const location = await getCityCoordinates(city);

    const data = await getWeather(
      location.latitude,
      location.longitude
    );

    displayWeather(location, data);
    showStatus("Weather loaded successfully!");
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
