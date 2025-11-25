/* --------------------------------------
   Element References
---------------------------------------*/
const toggleSidebar    = document.getElementById("toggleSidebar");
const sidebar          = document.getElementById("sidebar");
const btnTable         = document.getElementById("btnTable");
const btnChart         = document.getElementById("btnChart");
const parameterSelect  = document.getElementById("parameterSelect");
const chartTypeSelect  = document.getElementById("chartType");
const analysisText     = document.getElementById("analysisText");
const chartContainer   = document.getElementById("dataChart");

/* --------------------------------------
   Buttons.js Logic
---------------------------------------*/
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

  /* ------------------------------
     Section Buttons
  ------------------------------*/
  btnArticle?.addEventListener("click", () => showSection("article-section"));
  btnTable?.addEventListener("click", () => showSection("table-section"));
  btnChart?.addEventListener("click", () => showSection("chart-section"));

  /* ------------------------------
     Chart Parameter Controls
  ------------------------------*/
  parameterSelect?.addEventListener("change", () => {
    if (chartReady) applyChartDateFilter();
  });

  chartTypeSelect?.addEventListener("change", () => {
    if (chartReady) applyChartDateFilter();
  });

  /* ------------------------------
     Table Date Filter Buttons
  ------------------------------*/
  btnFilterDate?.addEventListener("click", () => applyDateFilter(true));

  btnClearDate?.addEventListener("click", () => {
    const today = new Date().toISOString().slice(0, 10);
    if (dateSelect) dateSelect.value = today;
    applyDateFilter(false);
  });

  /* ------------------------------
     Chart Date Filter Buttons
  ------------------------------*/
  btnFilterChart?.addEventListener("click", () => applyChartDateFilter(true));

  btnClearChart?.addEventListener("click", () => {
    const today = new Date().toISOString().slice(0, 10);
    if (chartDateSelect) chartDateSelect.value = today;
    applyChartDateFilter(false);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const btnNotifications = document.getElementById("btnNotifications");
  const dropdown = document.getElementById("notificationDropdown");
  const notifCount = document.getElementById("notifCount");

  // Example notification data
  let notifications = [
    { id: 1, text: "XML Data Fetch Complete", link: "#", read: true },
    { id: 2, text: "Multiple Parameter Thresholds Exceeded", link: "html/notifications.html", read: false },
    { id: 3, text: "Reminder: Water plants today", link: "#", read: false }
  ];

  function renderNotifications() {
    dropdown.innerHTML = notifications.map(n => `
      <li class="${n.read ? '' : 'unread'}">
        <a href="${n.link}" data-id="${n.id}">${n.text}</a>
      </li>
    `).join("");

    // Update badge count
    const unreadCount = notifications.filter(n => !n.read).length;
    notifCount.textContent = unreadCount;
    notifCount.style.display = unreadCount > 0 ? "inline-block" : "none";
  }

  // Toggle dropdown
  btnNotifications.addEventListener("click", (e) => {
    e.preventDefault();
    dropdown.classList.toggle("hidden");
  });

  // Mark notification as read when clicked
  dropdown.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      const id = parseInt(e.target.dataset.id);
      const notif = notifications.find(n => n.id === id);
      if (notif) notif.read = true;
      renderNotifications();
    }
  });

  // Close dropdown if clicking outside
  document.addEventListener("click", (e) => {
    if (!btnNotifications.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add("hidden");
    }
  });

  // Initial render
  renderNotifications();
});
