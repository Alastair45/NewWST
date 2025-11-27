// --- 1. PLANT DATA MODEL ---
const PLANT_PROFILES = {
  "Lettuce": {
    stages: [
      { name: "Seedling", duration: 14, temp: "18°C - 22°C", ph: "5.5 - 6.0", lightHours: 14 },
      { name: "Vegetative", duration: 25, temp: "20°C - 24°C", ph: "5.8 - 6.2", lightHours: 16 },
      { name: "Harvest/Finish", duration: 7, temp: "18°C - 22°C", ph: "6.0 - 6.5", lightHours: 16 }
    ]
  },
  "Tomato": {
    stages: [
      { name: "Seedling", duration: 21, temp: "22°C - 26°C", ph: "5.5 - 6.5", lightHours: 16 },
      { name: "Vegetative", duration: 40, temp: "21°C - 28°C", ph: "5.8 - 6.3", lightHours: 18 },
      { name: "Flowering/Fruiting", duration: 90, temp: "20°C - 26°C", ph: "6.0 - 6.5", lightHours: 18 }
    ]
  },
  "Basil": {
    stages: [
      { name: "Seedling", duration: 10, temp: "20°C - 25°C", ph: "5.5 - 6.0", lightHours: 14 },
      { name: "Continuous Harvest", duration: 999, temp: "20°C - 25°C", ph: "5.8 - 6.3", lightHours: 16 }
    ]
  }
};

// --- 2. LOCAL STORAGE (multi-profile support) ---
function saveProfile(cropName, startDate) {
  if (!cropName || !startDate) {
    alert("Please select a crop and a start date.");
    return false;
  }
  const newProfile = { cropName, startDate, lastUpdated: new Date().toISOString() };

  const profilesJson = localStorage.getItem("hydro_crop_profiles");
  const profiles = profilesJson ? JSON.parse(profilesJson) : [];

  profiles.push(newProfile);
  localStorage.setItem("hydro_crop_profiles", JSON.stringify(profiles));
  return true;
}

function loadProfiles() {
  const profilesJson = localStorage.getItem("hydro_crop_profiles");
  return profilesJson ? JSON.parse(profilesJson) : [];
}

function removeProfile(index) {
  const profiles = loadProfiles();
  if (index >= 0 && index < profiles.length) {
    profiles.splice(index, 1);
    localStorage.setItem("hydro_crop_profiles", JSON.stringify(profiles));
    renderProfilesTable();
  }
}

// --- 3. CALCULATE CURRENT STAGE ---
function calculateCurrentStage(profile) {
  if (!profile) return null;
  const cropData = PLANT_PROFILES[profile.cropName];
  if (!cropData) return null;

  const start = new Date(profile.startDate);
  const today = new Date();
  const diffDays = Math.ceil((today - start) / (1000 * 60 * 60 * 24));

  let accumulated = 0;
  let totalDuration = 0;

  for (const stage of cropData.stages) {
    totalDuration += stage.duration;
    if (diffDays <= accumulated + stage.duration) {
      return {
        stage: stage.name,
        dayInStage: diffDays - accumulated,
        totalDay: diffDays,
        totalDuration,
        optimal: stage
      };
    }
    accumulated += stage.duration;
  }

  return {
    stage: "Cycle Complete (Harvested)",
    dayInStage: diffDays - accumulated,
    totalDay: diffDays,
    totalDuration,
    optimal: cropData.stages[cropData.stages.length - 1]
  };
}

// --- 4. RENDER UI ---
function renderProfilePage() {
  const profiles = loadProfiles();
  const activeProfile = profiles.length ? profiles[profiles.length - 1] : null; // last saved profile
  const stageInfo = calculateCurrentStage(activeProfile);

  if (activeProfile && stageInfo) {
    document.getElementById("displayCrop").textContent = activeProfile.cropName;
    document.getElementById("displayStage").textContent = stageInfo.stage;
    document.getElementById("displayDay").textContent = `Day ${stageInfo.totalDay}`;
    document.getElementById("displayTotalDays").textContent = `Total Days ${stageInfo.totalDuration}`;
    document.getElementById("targetTemp").textContent = stageInfo.optimal.temp;
    document.getElementById("targetPH").textContent = stageInfo.optimal.ph;
    document.getElementById("targetLight").textContent = `${stageInfo.optimal.lightHours} hours/day`;

    renderStageDefinitions(activeProfile.cropName);
  } else {
    document.getElementById("displayCrop").textContent = "None Selected";
    document.getElementById("displayStage").textContent = "Please select a crop and start date.";
    document.getElementById("displayDay").textContent = "Day —";
    document.getElementById("displayTotalDays").textContent = "Total Days —";
    document.getElementById("targetTemp").textContent = "—";
    document.getElementById("targetPH").textContent = "—";
    document.getElementById("targetLight").textContent = "—";
    document.getElementById("stageDefinitionContainer").innerHTML = "";
  }

  renderProfilesTable();
}

function renderStageDefinitions(cropName) {
  const stages = PLANT_PROFILES[cropName].stages;
  const container = document.getElementById("stageDefinitionContainer");

  let html = `
    <table class="data-table" style="width:100%; border-collapse:collapse; margin-top:15px;">
      <thead>
        <tr>
          <th>Stage</th>
          <th>Duration (Days)</th>
          <th>Optimal Temp</th>
          <th>Optimal pH</th>
          <th>Light Hours</th>
        </tr>
      </thead>
      <tbody>
  `;

  stages.forEach(stage => {
    html += `
      <tr>
        <td>${stage.name}</td>
        <td>${stage.duration}</td>
        <td>${stage.temp}</td>
        <td>${stage.ph}</td>
        <td>${stage.lightHours}</td>
      </tr>
    `;
  });

  html += "</tbody></table>";
  container.innerHTML = html;
}

function renderProfilesTable() {
  const profiles = loadProfiles();
  const container = document.getElementById("profilesTableContainer");

  if (!profiles.length) {
    container.innerHTML = "<p>No profiles saved yet.</p>";
    return;
  }

  let html = `
    <table class="data-table" style="width:100%; border-collapse:collapse; margin-top:15px;">
      <thead>
        <tr>
          <th>Crop</th>
          <th>Start Date</th>
          <th>Stage</th>
          <th>Last Updated</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
  `;

  profiles.forEach((p, index) => {
    const stageInfo = calculateCurrentStage(p);
    const stageName = stageInfo ? stageInfo.stage : "—";

    html += `
      <tr>
        <td>${p.cropName}</td>
        <td>${p.startDate}</td>
        <td>${stageName}</td>
        <td>${new Date(p.lastUpdated).toLocaleString()}</td>
        <td><button onclick="removeProfile(${index})">Remove</button></td>
      </tr>
    `;
  });

  html += "</tbody></table>";
  container.innerHTML = html;
}

// --- 5. INIT ---
document.addEventListener("DOMContentLoaded", () => {
  const btnSave = document.getElementById("btnSaveProfile");
  const cropNameSelect = document.getElementById("cropName");
  const startDateInput = document.getElementById("startDate");

  if (btnSave) {
    btnSave.addEventListener("click", () => {
      const cropName = cropNameSelect.value;
      const startDate = startDateInput.value;
      if (saveProfile(cropName, startDate)) {
        renderProfilePage();
        alert(`Profile for ${cropName} saved!`);
      }
    });
  }

  renderProfilePage();
});
