let username = "";
let currentDay = 1;
let history = [];
let lastCompletion = null;
let points = 0;

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

// --- Login ---
function login() {
  username = document.getElementById("username").value.trim();
  if (!username) return showToast("⚠️ Digite seu nome!");

  document.getElementById("login").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
  document.getElementById("userName").innerText = username;

  const savedDay = localStorage.getItem(username + "_day");
  const savedHistory = localStorage.getItem(username + "_history");
  const savedDate = localStorage.getItem(username + "_lastDate");
  const savedPoints = localStorage.getItem(username + "_points");

  currentDay = savedDay ? parseInt(savedDay) : 1;
  history = savedHistory ? JSON.parse(savedHistory) : [];
  lastCompletion = savedDate ? new Date(savedDate).toDateString() : null;
  points = savedPoints ? parseInt(savedPoints) : 0;

  document.getElementById("pointsDisplay").innerText = `🏆 Pontos: ${points}`;
  checkDailyLock();
  renderDays();
  updateTask();
  notifyDailyTask();
}

// --- Iniciar desafio ---
function startChallenge() {
  document.getElementById("challenge").style.display = "block";
  updateTask();
  updateProgress();
  updateAchievements();
  updateHistory();
  renderDays();
  notifyDailyTask();
}

// --- Concluir dia ---
function completeDay() {
  const today = new Date().toDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  if (lastCompletion === today) {
    showToast("⏳ Você já completou o dia de hoje. Aguarde o próximo dia!");
    return;
  }

  if (currentDay !== 1 && lastCompletion !== yesterdayStr) {
    showToast("⏳ Você ainda não completou o dia anterior. Complete os dias na ordem!");
    return;
  }

  // Concluir tarefa do dia
  const todayTask = tasks[currentDay - 1];
  history.push({ task: todayTask, note: "" });
  localStorage.setItem(username + "_history", JSON.stringify(history));

  lastCompletion = today;
  localStorage.setItem(username + "_lastDate", lastCompletion);

  if (currentDay < 21) currentDay++;
  localStorage.setItem(username + "_day", currentDay);

  addPoints(10); // Pontos por dia concluído
  updateTask();
  updateProgress();
  updateAchievements();
  updateHistory();
  checkDailyLock();
  renderDays();

  showToast(`🎉 Tarefa do dia ${currentDay - 1} concluída!`);

  if (currentDay === 21) document.getElementById("downloadCertBtn").style.display = "inline-block";
}

// --- Bloqueio diário ---
function checkDailyLock() {
  const today = new Date().toDateString();
  const completeBtn = document.getElementById("completeBtn");

  if (lastCompletion === today) {
    completeBtn.disabled = false;
    completeBtn.onclick = () => showToast("⏳ Você já completou o dia de hoje. Aguarde o próximo dia!");
    completeBtn.innerText = "Concluir Dia ✅";
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (currentDay === 1 || lastCompletion === yesterdayStr) {
      completeBtn.disabled = false;
      completeBtn.onclick = completeDay;
      completeBtn.innerText = "Concluir Dia ✅";
    } else {
      completeBtn.disabled = false;
      completeBtn.onclick = () => showToast("⏳ Ainda não chegou o dia certo para continuar!");
      completeBtn.innerText = "Aguarde o dia certo ⏳";
    }
  }
}

// --- Atualizações ---
function updateTask() {
  const taskElem = document.getElementById("dayTask");
  const today = new Date().toDateString();

  if (lastCompletion === today) {
    taskElem.innerText = "⏳ Aguarde o próximo dia para a nova tarefa!";
  } else {
    taskElem.innerText = `Dia ${currentDay} - ${tasks[currentDay - 1]}`;
  }
}

function updateProgress() {
  const percent = Math.floor((currentDay / 21) * 100);
  const progressCircle = document.getElementById("progressCircle");
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  progressCircle.style.strokeDashoffset = offset;
  document.getElementById("progressTextCircle").innerText = `${percent}%`;
}

function updateAchievements() {
  const achievements = [];
  if (currentDay >= 3) achievements.push("🥉 3 dias!");
  if (currentDay >= 7) achievements.push("🥈 7 dias!");
  if (currentDay >= 14) achievements.push("🏅 14 dias!");
  if (currentDay === 21) achievements.push("🥇 Desafio concluído!");
  document.getElementById("achievements").innerText = achievements.join(" ");
}

function updateHistory() {
  const list = document.getElementById("historyList");
  list.innerHTML = "";
  history.forEach((entry, index) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>Dia ${index + 1}:</strong> ${entry.task}<br>
                    <em>${entry.note ? "Nota: " + entry.note : ""}</em>`;
    list.appendChild(li);
  });
}

// --- Adicionar nota ---
function saveNote() {
  const noteInput = document.getElementById("noteInput").value.trim();
  if (!noteInput) return showToast("Digite algo antes de salvar!");
  history[currentDay - 2].note = noteInput; // adiciona nota ao dia concluído
  localStorage.setItem(username + "_history", JSON.stringify(history));
  updateHistory();
  document.getElementById("noteInput").value = "";
  showToast("📝 Reflexão salva!");
}

// --- Adicionar pontos ---
function addPoints(amount) {
  points += amount;
  localStorage.setItem(username + "_points", points);
  document.getElementById("pointsDisplay").innerText = `🏆 Pontos: ${points}`;
}

// --- Render dias ---
function renderDays() {
  const container = document.getElementById("daysContainer");
  container.innerHTML = "";

  let startDay = currentDay - 1;
  if (startDay < 0) startDay = 0;
  let endDay = startDay + 4;
  if (endDay > 21) endDay = 21;

  for (let i = startDay; i < endDay; i++) {
    const dayBox = document.createElement("div");
    dayBox.className = "day-box";

    if (i + 1 < currentDay) {
      dayBox.classList.add("completed");
    } else if (i + 1 === currentDay) {
      dayBox.classList.add("current");
    } else {
      dayBox.classList.add("locked");
    }

    dayBox.innerText = i + 1;

    dayBox.onclick = () => {
      if (i + 1 === currentDay) {
        showToast(`🌟 O dia ${currentDay} do desafio está disponível! Conclua a tarefa.`);
      } else if (i + 1 < currentDay) {
        showToast(`✅ Você já completou o dia ${i + 1}!`);
      } else {
        showToast(`⏳ Ainda não chegou o dia ${i + 1}. Complete os dias anteriores primeiro.`);
      }
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

  const audio = new Audio("https://www.soundjay.com/buttons/sounds/button-09.mp3");
  audio.play();
}

// --- Notificação diária ---
function notifyDailyTask() {
  const today = new Date().toDateString();
  if (lastCompletion !== today) {
    showToast(`🌟 O dia ${currentDay} do desafio está disponível!`);
  }
}

// --- Compartilhar progresso ---
function shareProgress() {
  const message = `Hoje completei o desafio do dia ${currentDay - 1}! 🌟 #Desafio21Dias`;
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

// --- PDF Certificado ---
function downloadCertificate() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(26);
  doc.setTextColor("#4f46e5");
  doc.text("Certificado de Conclusão", 105, 50, null, null, "center");
  doc.setFontSize(16);
  doc.setTextColor("#111827");
  doc.text(`${username} concluiu o desafio:`, 105, 70, null, null, "center");
  doc.setFontSize(18);
  doc.text(`"Desafio 21 Dias de Gratidão"`, 105, 90, null, null, "center");
  doc.save(`${username}_certificado.pdf`);
}
