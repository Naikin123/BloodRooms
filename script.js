
const btn = document.getElementById("nextBtn");

btn.addEventListener("click", () => {
  document.body.style.background = "#000";
  btn.textContent = "NO HAY REGRESO";

  setTimeout(() => {
    alert("Registro incompleto.\nLa habitación no estaba vacía.");
  }, 1000);
});
