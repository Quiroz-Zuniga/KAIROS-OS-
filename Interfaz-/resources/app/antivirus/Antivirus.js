const scanBtn = document.getElementById("scanBtn");
const status = document.getElementById("status");
const log = document.getElementById("log");

status.textContent = 'Sin motor de análisis configurado. No se ha realizado ningún escaneo.';
scanBtn.disabled = true;

// Tabs
const tabs = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    tabContents.forEach(content => content.style.display = "none");
    document.getElementById(tab.dataset.tab + "Tab").style.display = "block";
  });
});
