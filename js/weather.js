document.addEventListener("DOMContentLoaded", () => {
  const weatherMessage = document.getElementById("weatherMessage");
  const btnReload = document.getElementById("btnReloadWeather");
  const loader = document.getElementById("loader"); // loader element in HTML

  const lat = 14.044;
  const lon = 121.157;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;

  const icons = {

    0: "sunny.png",
    1: "partial-sunny.png",
    2: "dim.png",
    3: "cloudy.png",


    45: "windy.png",

    51: "light-rain.png",
    53: "light-rain.png",
    55: "light-rain.png",


    61: "shower.png",
    62: "shower.png",


    63: "rain.png",
    65: "rain.png",
    66: "rain.png",

    80: "heavy-rain.png",
    81: "heavy-rain.png",
    82: "heavy-rain.png",

    95: "storm.png",
    96: "storm.png",
    99: "storm.png"
  };

  function getIcon(weatherCode) {
    // First check direct lookup
    if (icons[weatherCode]) {
      return icons[weatherCode];
    }

    // Then check ranges
    if (weatherCode >= 51 && weatherCode <= 55) return "light-rain.png";
    if (weatherCode >= 61 && weatherCode <= 62) return "shower.png";
    if (weatherCode >= 63 && weatherCode <= 66) return "rain.png";
    if (weatherCode >= 80 && weatherCode <= 82) return "heavy-rain.png";
    if (weatherCode >= 95 && weatherCode <= 99) return "storm.png";

    // Default fallback
    return "sunny.png";
  }

  function formatDay(dateStr) {
    const date = new Date(dateStr);
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
    const dayNum = date.getDate();
    return { weekday, dayNum };
  }

  function loadForecast() {
    // Show loader
    if (loader) loader.classList.remove("hidden");
    weatherMessage.textContent = "";

    fetch(url)
      .then(res => res.json())
      .then(data => {
        // Hide loader
        if (loader) loader.classList.add("hidden");

        if (data && data.daily) {
          const days = data.daily.time;
          const maxTemps = data.daily.temperature_2m_max;
          const minTemps = data.daily.temperature_2m_min;
          const codes = data.daily.weathercode;

          weatherMessage.innerHTML = `
            <div class="forecast-grid">
              ${days.map((day, i) => {
            const { weekday, dayNum } = formatDay(day);
            const isToday = i === 0;
            const iconFile = icons[codes[i]] || "unknown.png";
            return `
                  <div class="forecast-day${isToday ? ' today-highlight' : ''}">
                    <div class="forecast-label">${weekday} ${isToday ? '(Today)' : ''}</div>
                    <div class="forecast-date">${dayNum}</div>
                    <img src="images/${iconFile}" alt="Weather icon" onerror="this.style.display='none'">
                    <div class="forecast-temp">${minTemps[i]}°–${maxTemps[i]}°C</div>
                  </div>
                `;
          }).join("")}
            </div>
          `;
        } else {
          weatherMessage.textContent = "No forecast data available.";
        }
      })
      .catch(err => {
        // Hide loader
        if (loader) loader.classList.add("hidden");
        console.error("Forecast fetch error:", err);
        weatherMessage.textContent = "An error occurred. Please check your internet connection and reload.";
      });
  }

  // Initial load + auto refresh
  loadForecast();
  setInterval(loadForecast, 1800000);

  // Reload button
  if (btnReload) {
    btnReload.addEventListener("click", () => {
      loadForecast();
    });
  }
});
