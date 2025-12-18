// JS corregido y optimizado

// ============================
//      UTILIDADES GENERALES
// ============================
const $ = (id) => document.getElementById(id);
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const load = (key, def = null) => JSON.parse(localStorage.getItem(key)) ?? def;

// ============================
//      VARIABLES GLOBALES
// ============================
let missions = [];
let completedMissions = load("completedMissions", 0);
let totalMissions = 0;
let level = load("level", 1);
let xp = load("xp", 0);
let weeklyTimerInterval;

// ============================
//      SISTEMA DE LOGROS
// ============================
let achievements = load("achievements", {
    firstMission: { unlocked: false, name: "Primera misión", desc: "Completa tu primera misión" },
    level5: { unlocked: false, name: "Nivel 5", desc: "Alcanza nivel 5" }
});

function unlockAchievement(key) {
    if (!achievements[key].unlocked) {
        achievements[key].unlocked = true;
        save("achievements", achievements);
        alert(`¡Logro desbloqueado: ${achievements[key].name}!`);
    }
}

// ============================
//      SISTEMA DE XP
// ============================
function addXP(amount) {
    xp += amount;
    if (xp >= 100) {
        xp -= 100;
        level++;
        unlockAchievement("level5");
    }
    save("xp", xp);
    save("level", level);
    updateXPBar();
}

function updateXPBar() {
    const progress = (xp / 100) * 100;
    $("xp-progress").style.width = progress + "%";
    $("level").textContent = "Nivel " + level;
}

// ============================
//      MISIONES DIARIAS
// ============================
const dailyPlan = {
    lunes: ["Leer 10 minutos", "Beber agua", "Salir a caminar"],
    martes: ["Meditar 5 minutos", "Organizar tu escritorio"],
    miercoles: ["Hacer 10 flexiones", "Leer un artículo útil"],
    jueves: ["Aprender algo nuevo", "Evitar redes 1 hora"],
    viernes: ["Planear tu fin de semana", "Salir a caminar"],
    sabado: ["Tarea libre", "Limpiar habitación"],
    domingo: ["Descanso", "Reflexión semanal"]
};

function getTodayKey() {
    const dias = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
    return dias[new Date().getDay()];
}

function loadDailyMissions() {
    missions = [...dailyPlan[getTodayKey()]];
    renderMissions();
    loadMissionProgress();
}

// ============================
//      RENDER DE MISIONES
// ============================
function renderMissions() {
    const cont = $("missions");
    cont.innerHTML = "";

    totalMissions = missions.length;
    missions.forEach((m, i) => {
        const div = document.createElement("div");
        div.className = "mission";
        div.id = "mission_" + i;
        div.innerHTML = `
            <span>${m}</span>
            <button onclick="completeMission(${i})">Completar</button>
        `;
        cont.appendChild(div);
    });

    updateCounter();
}

// ============================
//      COMPLETAR MISIONES
// ============================
function completeMission(id) {
    const missionDiv = $("mission_" + id);
    missionDiv.classList.add("completed");
    missionDiv.querySelector("button").disabled = true;

    completedMissions++;
    save("completedMissions", completedMissions);

    addXP(20);
    unlockAchievement("firstMission");

    updateCounter();
    saveMissionProgress(id);
}

// ============================
//      GUARDAR PROGRESO
// ============================
function saveMissionProgress(id) {
    let progress = load("missionProgress", {});
    progress[id] = true;
    save("missionProgress", progress);
}

function loadMissionProgress() {
    const progress = load("missionProgress", {});
    Object.keys(progress).forEach(id => {
        if ($("mission_" + id)) {
            $("mission_" + id).classList.add("completed");
            $("mission_" + id).querySelector("button").disabled = true;
        }
    });
}

// ============================
//      CONTADOR
// ============================
function updateCounter() {
    $("counter").textContent = `${completedMissions}/${totalMissions}`;
}

// ============================
//      TIMER SEMANAL
// ============================
function startWeeklyTimer() {
    let end = load("weeklyEnd", Date.now() + 7 * 24 * 60 * 60 * 1000);
    save("weeklyEnd", end);

    weeklyTimerInterval = setInterval(() => {
        const now = Date.now();
        const diff = end - now;

        if (diff <= 0) {
            clearInterval(weeklyTimerInterval);
            resetWeekly();
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        $("weekly-timer").textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }, 1000);
}

function resetWeekly() {
    save("weeklyEnd", Date.now() + 7 * 24 * 60 * 60 * 1000);
    save("missionProgress", {});
    completedMissions = 0;
    save("completedMissions", 0);
    loadDailyMissions();
    startWeeklyTimer();
}

// ============================
//      INICIO
// ============================
window.onload = () => {
    updateXPBar();
    loadDailyMissions();
    startWeeklyTimer();
};
