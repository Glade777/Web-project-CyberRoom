const menu = document.querySelector(".menu");
const menuBtn = document.querySelector(".burger-icon");
const body = document.body;

if (menu && menuBtn) {
  menuBtn.addEventListener("click", () => {
    menu.classList.toggle("active");
    menuBtn.classList.toggle("active");
    body.classList.toggle("lock");
  });
}

document.querySelectorAll("nav a").forEach((link) => {
  link.addEventListener("click", () => {
    if (menu) {
      menu.classList.remove("active");
    }
    if (menuBtn) {
      menuBtn.classList.remove("active");
    }
    body.classList.remove("lock");
  });
});
