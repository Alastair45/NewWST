// --- 1. PLANT DATA MODEL (MOCK DATABASE) ---
// This defines the optimal conditions and duration for each crop type and stage.
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

// --- 2. LOCAL STORAGE MANAGEMENT (To persist user selection) ---

function saveProfile(cropName, startDate) {
    if (!cropName || !startDate) {
        alert("Please select a crop and a start date.");
        return false;
    }
    const profile = { cropName, startDate, lastUpdated: new Date().toISOString() };
    localStorage.setItem('hydro_crop_profile', JSON.stringify(profile));
    console.log("Crop profile saved:", profile);
    return true;
}

function loadProfile() {
    const profileJson = localStorage.getItem('hydro_crop_profile');
    return profileJson ? JSON.parse(profileJson) : null;
}

// --- 3. STAGE CALCULATION LOGIC ---

function calculateCurrentStage(profile) {
    if (!profile) return null;

    const cropData = PLANT_PROFILES[profile.cropName];
    if (!cropData) return null;

    const start = new Date(profile.startDate);
    const today = new Date();
    // Calculate difference in days
    const diffTime = today.getTime() - start.getTime();
    const currentDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (currentDay < 0) {
        return { stage: "Pre-Start", dayInStage: 0, totalDay: 0, totalDuration: 0, optimal: null };
    }

    let accumulatedDays = 0;
    let totalDuration = 0;
    
    // Determine the current stage
    for (let i = 0; i < cropData.stages.length; i++) {
        const stage = cropData.stages[i];
        totalDuration += stage.duration;

        if (currentDay <= accumulatedDays + stage.duration) {
            return {
                stage: stage.name,
                dayInStage: currentDay - accumulatedDays,
                totalDay: currentDay,
                totalDuration: totalDuration,
                optimal: stage
            };
        }
        accumulatedDays += stage.duration;
    }

    // If cycle is complete
    return { 
        stage: "Cycle Complete (Harvested)", 
        dayInStage: currentDay - accumulatedDays, 
        totalDay: currentDay, 
        totalDuration: totalDuration, 
        optimal: cropData.stages[cropData.stages.length - 1] // Keep last stage optimal data
    };
}

// --- 4. RENDER UI ---

function renderProfilePage() {
    const currentProfile = loadProfile();
    const stageInfo = calculateCurrentStage(currentProfile);
    
    // Get UI elements
    const displayCrop = document.getElementById('displayCrop');
    const displayStage = document.getElementById('displayStage');
    const displayDay = document.getElementById('displayDay');
    const displayTotalDays = document.getElementById('displayTotalDays');
    const targetTemp = document.getElementById('targetTemp');
    const targetPH = document.getElementById('targetPH');
    const targetLight = document.getElementById('targetLight');
    const cropNameSelect = document.getElementById('cropName');
    const startDateInput = document.getElementById('startDate');
    const stageTableContainer = document.getElementById('stageTableContainer');

    if (currentProfile) {
        // Update input fields to reflect saved profile
        cropNameSelect.value = currentProfile.cropName;
        startDateInput.value = currentProfile.startDate;
        
        // Update stage tracker display
        if (stageInfo && stageInfo.optimal) {
            displayCrop.textContent = currentProfile.cropName;
            displayStage.textContent = stageInfo.stage;
            displayDay.textContent = `Day ${stageInfo.totalDay}`;
            displayTotalDays.textContent = `Total Days ${stageInfo.totalDuration}`;
            
            // Update optimal conditions
            targetTemp.textContent = stageInfo.optimal.temp;
            targetPH.textContent = stageInfo.optimal.ph;
            targetLight.textContent = `${stageInfo.optimal.lightHours} hours/day`;
            
            // Render the detailed stage table
            renderStageTable(currentProfile.cropName, stageTableContainer);
            
        } else {
            displayCrop.textContent = currentProfile.cropName;
            displayStage.textContent = "Error: Data model missing or date invalid.";
        }
    } else {
         // Default state if no profile is saved
         displayCrop.textContent = "None Selected";
         displayStage.textContent = "Please select a crop and start date above.";
    }
}

function renderStageTable(cropName, container) {
    const stages = PLANT_PROFILES[cropName].stages;
    let tableHTML = `
        <table class="data-table" style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
                <tr>
                    <th>Stage</th>
                    <th>Duration (Days)</th>
                    <th>Optimal Temperature</th>
                    <th>Optimal pH</th>
                    <th>Light Hours</th>
                </tr>
            </thead>
            <tbody>
    `;

    stages.forEach(stage => {
        tableHTML += `
            <tr>
                <td>${stage.name}</td>
                <td>${stage.duration}</td>
                <td>${stage.temp}</td>
                <td>${stage.ph}</td>
                <td>${stage.lightHours}</td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;
    container.innerHTML = tableHTML;
}


// --- 5. INITIALIZATION ---

document.addEventListener("DOMContentLoaded", () => {
    // 5.1 Handle Save Button Click
    const btnSave = document.getElementById('btnSaveProfile');
    const cropNameSelect = document.getElementById('cropName');
    const startDateInput = document.getElementById('startDate');

    if (btnSave) {
        btnSave.addEventListener('click', () => {
            const cropName = cropNameSelect.value;
            const startDate = startDateInput.value;
            if (saveProfile(cropName, startDate)) {
                renderProfilePage(); // Re-render the display after saving
                alert(`Crop profile for ${cropName} saved successfully!`);
            }
        });
    }

    // 5.2 Initial Render
    renderProfilePage();
});