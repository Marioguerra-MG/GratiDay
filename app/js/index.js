let username = "";
let currentDay = 1;
let history = [];
let lastCompletion = null;
let points = 0;
let badges = [];
let pwaInstalled = false;

// --- Overlay de carregando ---
const loadingOverlay = document.createElement("div");
loadingOverlay.id = "loadingOverlay";
loadingOverlay.style.cssText = `
  position: fixed; top:0; left:0; right:0; bottom:0;
  background: rgba(0,0,0,0.7); color: white;
  display: flex; justify-content:center; align-items:center;
  font-size: 22px; font-weight:bold; z-index: 9999;
  display: none;
`;
loadingOverlay.innerText = "⏳ Instalando GratiDay...";
document.body.appendChild(loadingOverlay);

// --- Tasks ---
const tasks = [
  "Escreva 3 coisas pelas quais você é grato.",
  "Faça 5 respirações profundas e reflita sobre o dia.",
  "Liste 3 conquistas de hoje, mesmo que pequenas.",
  "Envie uma mensagem de gratidão para alguém.",
  "Escreva uma frase motivacional para você.",
  "Faça algo gentil por alguém.",
  "Liste 3 coisas que você gosta em você mesmo.",
  "Reserve 10 minutos para meditar.",
  "Organize sua mesa ou quarto.",
  "Escreva uma pequena meta para amanhã.",
  "Desconecte-se das redes por 1 hora.",
  "Faça uma caminhada e observe ao redor.",
  "Agradeça mentalmente a algo ou alguém.",
  "Faça algo criativo: desenhe, escreva ou toque música.",
  "Relembre um momento feliz do passado.",
  "Planeje seu dia de amanhã com intenção.",
  "Leia algo inspirador por 10 minutos.",
  "Pratique um pequeno ato de autocuidado.",
  "Liste 3 coisas que aprendeu nesta semana.",
  "Compartilhe algo positivo nas suas redes.",
  "Revise seus progressos e celebre suas vitórias."
];

// --- Inicialização ---
function initUserData() {
  const savedDay = parseInt(localStorage.getItem(username + "_day")) || 1;
  const savedHistory = JSON.parse(localStorage.getItem(username + "_history") || "[]");
  const savedDate = localStorage.getItem(username + "_lastDate") || null;
  const savedPoints = parseInt(localStorage.getItem(username + "_points")) || 0;
  const savedBadges = JSON.parse(localStorage.getItem(username + "_badges") || "[]");

  currentDay = savedDay;
  history = savedHistory;
  lastCompletion = savedDate;
  points = savedPoints;
  badges = savedBadges;
}

// --- Login ---
function login() {
  username = document.getElementById("username").value.trim();
  if (!username) return showToast("⚠️ Digite seu nome!");
  localStorage.setItem("gratiday_username", username); // salva o nome

  if (!pwaInstalled) {
    showToast("📲 Instale o GratiDay para desbloquear o dashboard!");
    return;
  }

  document.getElementById("login").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
  document.getElementById("userName").innerText = username;

  initUserData();
  updateAllUI();
}

// --- Logout (opcional) ---
function logout() {
  localStorage.removeItem("gratiday_username");
  location.reload();
}

// --- Atualiza UI ---
function updateAllUI() {
  renderBadges();
  checkDailyLock();
  renderDays();
  updateTask();
  updateHistory();
  updateProgress();
  updateAchievements();
}

// --- Concluir dia ---
function completeDay() {
  const today = new Date().toDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (lastCompletion === today) return showToast("⏳ Já completou o dia de hoje!");
  if (currentDay !== 1 && lastCompletion !== yesterday.toDateString())
    return showToast("⏳ Complete os dias anteriores primeiro!");

  history.push({ task: tasks[currentDay - 1], note: "" });
  lastCompletion = today;

  if (currentDay < 21) currentDay++;

  saveData();
  addPoints(10);
  checkBadgeUnlock();
  updateAllUI();

  showToast(`🎉 Tarefa do dia ${currentDay - 1} concluída!`);
}

// --- Salvar dados ---
function saveData() {
  localStorage.setItem(username + "_day", currentDay);
  localStorage.setItem(username + "_history", JSON.stringify(history));
  localStorage.setItem(username + "_lastDate", lastCompletion);
  localStorage.setItem(username + "_points", points);
  localStorage.setItem(username + "_badges", JSON.stringify(badges));
}

// --- Bloqueio diário ---
function checkDailyLock() {
  const today = new Date().toDateString();
  const completeBtn = document.getElementById("completeBtn");
  if (!completeBtn) return;

  if (lastCompletion === today) {
    completeBtn.onclick = () => showToast("⏳ Já completou o dia de hoje!");
    completeBtn.innerText = "Concluir Dia ✅";
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    completeBtn.onclick = (currentDay === 1 || lastCompletion === yesterdayStr)
      ? completeDay
      : () => showToast("⏳ Dia não disponível ainda!");
    completeBtn.innerText = (currentDay === 1 || lastCompletion === yesterdayStr)
      ? "Concluir Dia ✅"
      : "Aguarde o dia certo ⏳";
  }
}

// --- Atualizações ---
function updateTask() {
  const taskElem = document.getElementById("dayTask");
  if (!taskElem) return;
  taskElem.innerText = (lastCompletion === new Date().toDateString())
    ? "⏳ Aguarde o próximo dia para a nova tarefa!"
    : `Dia ${currentDay} - ${tasks[currentDay - 1]}`;
}

function updateProgress() {
  const progressCircle = document.getElementById("progressCircle");
  const progressText = document.getElementById("progressTextCircle");
  if (!progressCircle || !progressText) return;

  const percent = Math.floor((currentDay / 21) * 100);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  progressCircle.style.strokeDashoffset = circumference - (percent / 100) * circumference;
  progressText.innerText = `${percent}%`;
}

function updateAchievements() {
  const achievements = [];
  if (currentDay >= 3) achievements.push("🥉 3 dias!");
  if (currentDay >= 7) achievements.push("🥈 7 dias!");
  if (currentDay >= 14) achievements.push("🏅 14 dias!");
  if (currentDay === 21) achievements.push("🥇 Desafio concluído!");
  const achElem = document.getElementById("achievements");
  if (achElem) achElem.innerText = achievements.join(" ");
}

function updateHistory() {
  const list = document.getElementById("historyList");
  if (!list) return;
  list.innerHTML = "";
  history.forEach((entry, index) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>Dia ${index + 1}:</strong> ${entry.task}<br><em>${entry.note ? "Nota: " + entry.note : ""}</em>`;
    list.appendChild(li);
  });
}

// --- Notas ---
function saveNote() {
  const noteInput = document.getElementById("noteInput");
  if (!noteInput) return;
  const note = noteInput.value.trim();
  if (!note) return showToast("Digite algo antes de salvar!");
  if (!history.length) return showToast("Nenhum dia concluído para adicionar nota!");

  history[history.length - 1].note = note;
  saveData();
  updateHistory();
  noteInput.value = "";
  showToast("📝 Reflexão salva!");
}

// --- Pontos e badges ---
function addPoints(amount) {
  points += amount;
  saveData();
  const pointsDisplay = document.getElementById("pointsDisplay");
  if (pointsDisplay) pointsDisplay.innerText = `🏆 Pontos: ${points}`;
}

function checkBadgeUnlock() {
  const thresholds = [
    { points: 30, name: "🥉 Bronze" },
    { points: 70, name: "🥈 Prata" },
    { points: 140, name: "🏅 Ouro" },
    { points: 210, name: "🌟 Platina" }
  ];

  thresholds.forEach(b => {
    if(points >= b.points && !badges.includes(b.name)) {
      badges.push(b.name);
      saveData();
      showToast(`🏆 Badge desbloqueado: ${b.name}!`);
      renderBadges();
    }
  });
}

function renderBadges() {
  const container = document.getElementById("badgesContainer");
  if (!container) return;
  container.innerHTML = "";
  badges.forEach(b => {
    const span = document.createElement("span");
    span.className = "badge";
    span.innerText = b;
    container.appendChild(span);
  });
}

// --- Render dias (mostrar só 4 dias) ---
function renderDays() {
  const container = document.getElementById("daysContainer");
  if (!container) return;
  container.innerHTML = "";

  const totalDaysToShow = 4;

  for (let i = 0; i < totalDaysToShow; i++) {
    const dayBox = document.createElement("div");
    dayBox.className = "day-box";

    if(i + 1 < currentDay) dayBox.classList.add("completed");
    else if(i + 1 === currentDay) dayBox.classList.add("current");
    else dayBox.classList.add("locked");

    dayBox.innerText = i + 1;
    dayBox.onclick = () => {
      if(i + 1 === currentDay) showToast(`🌟 Dia ${currentDay} disponível!`);
      else if(i + 1 < currentDay) showToast(`✅ Já completou o dia ${i + 1}!`);
      else showToast(`⏳ Dia ${i + 1} bloqueado.`);
    };
    container.appendChild(dayBox);
  }
}

// --- Toast ---
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// --- Compartilhar ---
function shareProgress() {
  const message = `Hoje completei o desafio do dia ${currentDay - 1}! 🌟 #Desafio21Dias`;
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
}

// --- PWA / Instalação ---
let deferredPrompt;
const installBanner = document.createElement("div");
installBanner.id = "install-banner";
installBanner.style.cssText = `
  position: fixed; top: 0; left: 0; right: 0;
  background: #4CAF50; color: white; padding: 15px;
  text-align: center; font-weight: bold; font-size: 16px; z-index:1000;
  display: none;
`;
installBanner.innerHTML = `📲 Instale o GratiDay para desbloquear o dashboard!
  <button id="install-btn" style="margin-left:10px;padding:5px 10px;font-weight:bold;border-radius:6px;cursor:pointer;">👉 Instalar para um esprecienca melhor</button>`;
document.body.appendChild(installBanner);

const installBtn = document.getElementById("install-btn");

// Bloqueia dashboard até instalação
function checkAppAccess() {
  if (!pwaInstalled) {
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("login").style.display = "block";
  }
}

// Detecta se já tem usuário salvo e loga automaticamente
const savedUser = localStorage.getItem("gratiday_username");
if (savedUser) {
  username = savedUser;
  pwaInstalled = window.matchMedia('(display-mode: standalone)').matches;
  initUserData();
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("login").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    document.getElementById("userName").innerText = username;
    updateAllUI();
  });
}

// Detecta se está rodando como PWA (standalone)
if (window.matchMedia('(display-mode: standalone)').matches) {
  pwaInstalled = true;
  installBanner.style.display = "none";
}
checkAppAccess();

// Evento de beforeinstallprompt
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBanner.style.display = "block";
});

// Clique no botão instalar
installBtn.addEventListener("click", async () => {
  if (deferredPrompt) {
    loadingOverlay.style.display = "flex"; // mostra overlay
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    loadingOverlay.style.display = "none"; // oculta overlay

    if (choice.outcome === "accepted") {
      pwaInstalled = true;
      installBanner.style.display = "none";
      showToast("🎉 Obrigado por instalar! Aguarde a tela inicial...");

      // Delay de 60 segundos antes de liberar dashboard
      setTimeout(() => {
        document.getElementById("login").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
        showToast(`🎉 Bem-vindo, ${username}!`);
      }, 60000);
    } else {
      showToast("ℹ️ Instalação cancelada.");
    }
    deferredPrompt = null;
  }
});

// Detecta instalação concluída
window.addEventListener("appinstalled", () => {
  pwaInstalled = true;
  installBanner.style.display = "none";
  showToast("✅ GratiDay instalado com sucesso!");
  checkAppAccess();
});

// --- Service Worker ---
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js")
      .then(reg => console.log("Service Worker registrado!", reg))
      .catch(err => console.log("Falha ao registrar SW", err));
  });
}


// Atualiza SW automaticamente
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js")
      .then(reg => {
        console.log("Service Worker registrado!", reg);
        // Forçar atualização quando muda versão
        if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.log("Nova versão disponível! Recarregando...");
                window.location.reload();
              }
            }
          });
        });
      })
      .catch(err => console.log("Falha ao registrar SW", err));
  });
}

// Mensagem do SW para forçar skipWaiting
navigator.serviceWorker.addEventListener('controllerchange', () => {
  console.log("SW ativo e assumiu controle.");
});
