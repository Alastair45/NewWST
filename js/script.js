let chart = null;
let xmlData = [];
let chartReady = false;
let chartVisible = false;

/* ------------------------------
   Element References
--------------------------------*/
const dateSelect        = document.getElementById("dateSelect");
const btnFilterDate     = document.getElementById("btnFilterDate");
const btnClearDate      = document.getElementById("btnClearDate");
const tableStatus       = document.getElementById("tableStatus");

const chartDateSelect   = document.getElementById("chartDateSelect");
const btnFilterChart    = document.getElementById("btnFilterChart");
const btnClearChart     = document.getElementById("btnClearChart");
const chartStatus       = document.getElementById("chartStatus");

const avgLightEl        = document.getElementById("avgLight");
const avgTempEl         = document.getElementById("avgTemp");
const avgHumEl          = document.getElementById("avgHum");
const avgMoistEl        = document.getElementById("avgMoist");
const avgPHEl           = document.getElementById("avgPH");
const todayCountEl      = document.getElementById("todayCount");
const homeUpdatedEl     = document.getElementById("homeUpdated");

const tableBody         = document.querySelector("#dataTable tbody");
const sections          = document.querySelectorAll(".content-section");

/* ------------------------------
   Init
--------------------------------*/
document.addEventListener("DOMContentLoaded", () => {
  loadXMLData();
  showSection("article-section");
});

/* ------------------------------
   Section Display
--------------------------------*/
function showSection(id) {
  sections.forEach(s => s.classList.add("hidden"));

  const section = document.getElementById(id);
  if (section) section.classList.remove("hidden");

  chartVisible = id === "chart-section";

  if (id === "table-section") applyDateFilter();
  if (chartVisible && chartReady) applyChartDateFilter();
}

/* ------------------------------
   Load XML
--------------------------------*/
function loadXMLData() {
  fetch("getxml.php?file=" + encodeURIComponent("xml/data.xml"), { cache: "no-store" })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    })
    .then(xmlText => {
      const parser = new DOMParser();
      const xml = parser.parseFromString(xmlText, "application/xml");

      xmlData = Array.from(xml.getElementsByTagName("entry")).map(e => ({
        time:        e.getElementsByTagName("time")[0]?.textContent || "",
        date:        e.getElementsByTagName("date")[0]?.textContent || "",
        light:       parseFloat(e.getElementsByTagName("light")[0]?.textContent || 0),
        temperature: parseFloat(e.getElementsByTagName("temperature")[0]?.textContent || 0),
        humidity:    parseFloat(e.getElementsByTagName("humidity")[0]?.textContent || 0),
        moisture:    parseFloat(e.getElementsByTagName("moisture")[0]?.textContent || 0),
        ph:          parseFloat(e.getElementsByTagName("ph")[0]?.textContent || 0)
      }));

      fillTable(xmlData);

      const today = new Date().toISOString().slice(0, 10);
      if (dateSelect) dateSelect.value = today;
      if (chartDateSelect) chartDateSelect.value = today;

      applyDateFilter();
      updateHomeAverages();

      chartReady = true;
      if (chartVisible) applyChartDateFilter();
    })
    .catch(err => console.error("Error loading XML:", err));
}

/* ------------------------------
   Table Filtering
--------------------------------*/
function applyDateFilter(showAlert = false) {
  if (!dateSelect) {
    fillTable(xmlData);
    return;
  }

  const selected = dateSelect.value;
  if (!selected) {
    fillTable(xmlData);
    if (tableStatus) tableStatus.textContent = "";
    return;
  }

  const filtered = xmlData.filter(d => getDateKey(d.date) === selected);

  if (!filtered.length) {
    if (showAlert) alert("No records to display.");
    fillTable([]);
    return;
  }

  fillTable(filtered);
}

function fillTable(data) {
  if (!tableBody) return;

  tableBody.innerHTML = "";

  if (!data.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;color:#666;">No records to display.</td>
      </tr>`;
    return;
  }

  data.forEach(row => {
    tableBody.insertAdjacentHTML("beforeend", `
      <tr>
        <td>${row.time}</td>
        <td>${row.light}</td>
        <td>${row.temperature}</td>
        <td>${row.humidity}</td>
        <td>${row.moisture}</td>
        <td>${row.ph}</td>
      </tr>
    `);
  });
}

/* ------------------------------
   Date Helpers
--------------------------------*/
function normalizeDateStr(s) {
  if (!s) return null;

  const match = String(s).trim().match(/(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];

  const d = new Date(s);
  return !isNaN(d) ? d.toISOString().slice(0, 10) : null;
}

function getDateKey(str) {
  return normalizeDateStr(str);
}

/* ------------------------------
   Chart Filtering
--------------------------------*/
function applyChartDateFilter(showAlert = false) {
  const selected = chartDateSelect?.value?.trim() ?? "";
  const dataToUse = selected
    ? xmlData.filter(d => normalizeDateStr(d.date) === selected)
    : xmlData;

  if (!dataToUse.length) {
    if (chart) chart.destroy();
    chart = null;

    if (chartContainer) {
      chartContainer.innerHTML = `
        <div class="chart-empty"
             style="display:flex;align-items:center;justify-content:center;height:400px;color:#666;font-weight:600;">
          No data for selected day.
        </div>`;
    }

    if (showAlert) alert("No data for selected day.");
    return;
  }

  if (chartContainer) chartContainer.innerHTML = "";
  drawChart(parameterSelect.value, chartTypeSelect.value, dataToUse);
}

/* ------------------------------
   Chart Rendering
--------------------------------*/
function drawChart(parameter = "all", chartType = "line", dataArr = xmlData) {
  if (!chartContainer) return;

  if (chart) chart.destroy();
  chart = null;
  chartContainer.innerHTML = "";

  const labels = dataArr.map(d => d.time);
  const params = ["light", "temperature", "humidity", "moisture", "ph"];

  const colors = ["#078080", "#f45d48", "#4e9f3d", "#6a4c93", "#e4a788"];

  const series = parameter === "all"
    ? params.map(p => ({
        name: p[0].toUpperCase() + p.slice(1),
        data: dataArr.map(d => d[p])
      }))
    : [{
        name: parameter[0].toUpperCase() + parameter.slice(1),
        data: dataArr.map(d => d[parameter])
      }];

  const options = {
    chart: { type: chartType, height: 400, background: "#f8f5f2" },
    series,
    colors,
    xaxis: { categories: labels },
    legend: { position: "top" }
  };

  chart = new ApexCharts(chartContainer, options);
  chart.render();

  updateAnalysis(parameter);
}

/* ------------------------------
   Home Averages
--------------------------------*/
function updateHomeAverages(useYesterday = false) {
  if (!xmlData.length) {
    [avgLightEl, avgTempEl, avgHumEl, avgMoistEl, avgPHEl].forEach(el => el.textContent = "—");
    todayCountEl.textContent = "0";
    homeUpdatedEl.textContent = "No data available";
    return;
  }

  const d = new Date();
  if (useYesterday) d.setDate(d.getDate() - 1);

  const key = d.toISOString().slice(0, 10);
  let rows = xmlData.filter(r => getDateKey(r.date) === key).slice(0, 24);

  const avg = arr => arr.length ? +(arr.reduce((s, v) => s + Number(v), 0) / arr.length).toFixed(2) : "—";

  avgLightEl.textContent = avg(rows.map(r => r.light));
  avgTempEl.textContent  = avg(rows.map(r => r.temperature));
  avgHumEl.textContent   = avg(rows.map(r => r.humidity));
  avgMoistEl.textContent = avg(rows.map(r => r.moisture));
  avgPHEl.textContent    = avg(rows.map(r => r.ph));

  todayCountEl.textContent = rows.length.toString();

  const now = new Date();
  const formatted = now.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  });
  homeUpdatedEl.textContent = `Last Update: ${formatted}`;
}

/* ------------------------------
   Utility
--------------------------------*/
function todayLocalISO() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0")
  ].join("-");
}

const today = todayLocalISO();
