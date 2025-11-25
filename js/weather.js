document.addEventListener("DOMContentLoaded", () => {
  const weatherMessage = document.getElementById("weatherMessage");

  const lat = 14.044;
  const lon = 121.157;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`;

  // Map weather codes to PNG filenames
  const icons = {
    0: "sunny.png",
    1: "partial-sunny.png",
    2: "partial-sunny.png",
    3: "cloudy.png",
    45: "windy.png",
    51: "drizzle.png",
    61: "sunny-shower.png",
    63: "sunny-shower.png",
    65: "drizzle.png",
    80: "sunny-shower.png",
    95: "storm.png"
  };

  function formatDay(dateStr) {
    const date = new Date(dateStr);
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
    const dayNum = date.getDate();
    return { weekday, dayNum };
  }

  function loadForecast() {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data && data.daily) {
          const days = data.daily.time;
          const maxTemps = data.daily.temperature_2m_max;
          const minTemps = data.daily.temperature_2m_min;
          const codes = data.daily.weather_code;

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
        console.error("Forecast fetch error:", err);
        weatherMessage.textContent = "Error fetching forecast.";
      });
  }

  loadForecast();
  setInterval(loadForecast, 1800000);
});
