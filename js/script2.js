document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggleSidebar");
  const sidebar = document.getElementById("sidebar");

  if (!toggleBtn || !sidebar) return;

  toggleBtn.addEventListener("click", () => {
    // Toggle sidebar visibility
    sidebar.classList.toggle("sidebar-visible");

    // Toggle hamburger → X
    toggleBtn.classList.toggle("active");
  });

  // Optional: close sidebar when clicking outside
  document.addEventListener("click", (e) => {
    if (
      sidebar.classList.contains("sidebar-visible") &&
      !sidebar.contains(e.target) &&
      !toggleBtn.contains(e.target)
    ) {
      sidebar.classList.remove("sidebar-visible");
      toggleBtn.classList.remove("active");
    }
  });
});
