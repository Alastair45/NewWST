document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggleSidebar");
  const sidebar   = document.getElementById("sidebar");

  if (!toggleBtn || !sidebar) return;

  /* ------------------------------
     Toggle Sidebar
  --------------------------------*/
  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("sidebar-visible");
    toggleBtn.classList.toggle("active");
  });

  /* ------------------------------
     Close when clicking outside
  --------------------------------*/
  document.addEventListener("click", (e) => {
    const isOpen = sidebar.classList.contains("sidebar-visible");
    const clickedOutside =
      !sidebar.contains(e.target) && !toggleBtn.contains(e.target);

    if (isOpen && clickedOutside) {
      sidebar.classList.remove("sidebar-visible");
      toggleBtn.classList.remove("active");
    }
  });
});
