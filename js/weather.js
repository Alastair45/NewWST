document.addEventListener("DOMContentLoaded", () => {
  const weatherMessage = document.getElementById("weatherMessage");

  const lat = 14.044;
  const lon = 121.157;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`;

  const icons = {
    0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
    45: "🌫️", 51: "🌦️", 61: "🌧️", 63: "🌧️",
    65: "🌧️", 80: "🌦️", 95: "⛈️"
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
            <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:8px;text-align:center;">
              ${days.map((day, i) => {
                const { weekday, dayNum } = formatDay(day);
                const isToday = i === 0; // first column is today
                return `
                  <div style="padding:6px;${isToday ? 'background:#e0f7fa;border:2px solid #00796b;border-radius:6px;' : ''}">
                    <div style="font-size:14px;font-weight:600;">
                      ${weekday} ${isToday ? '(Today)' : ''}
                    </div>
                    <div style="font-size:12px;color:#555;">${dayNum}</div>
                    <div style="font-size:24px;">${icons[codes[i]] || "❓"}</div>
                    <div style="font-size:13px;">${minTemps[i]}°–${maxTemps[i]}°C</div>
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
