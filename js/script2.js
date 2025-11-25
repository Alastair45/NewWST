document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggleSidebar");
  const sidebarEl = document.getElementById("sidebar");

  /* ------------------------------
     Sidebar Toggle
  ------------------------------*/
  if (toggleBtn && sidebarEl) {
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      sidebarEl.classList.toggle("sidebar-visible");
      toggleBtn.classList.toggle("active");
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
      const isOpen = sidebarEl.classList.contains("sidebar-visible");
      const clickedOutside =
        !sidebarEl.contains(e.target) &&
        !toggleBtn.contains(e.target);

      if (isOpen && clickedOutside) {
        sidebarEl.classList.remove("sidebar-visible");
        toggleBtn.classList.remove("active");
      }
    });
  }
})