const API_BASE =
  "https://api.omar-thing.site/?key=wu0Jy4kzJXm9dlgJ&type=following&username=";
const STORAGE_KEY = "omarApiLocalData";
const META_KEY = "omarApiLocalMeta";

const elements = {
  username: document.getElementById("username"),
  fetchData: document.getElementById("fetch-data"),
  loadLocal: document.getElementById("load-local"),
  clearLocal: document.getElementById("clear-local"),
  status: document.getElementById("status"),
  dataPreview: document.getElementById("data-preview"),
  recordCount: document.getElementById("record-count"),
  lastUpdated: document.getElementById("last-updated"),
  importFile: document.getElementById("import-file"),
  exportData: document.getElementById("export-data"),
};

const state = {
  data: null,
  meta: null,
};

function setStatus(message, tone = "") {
  elements.status.textContent = message;
  elements.status.dataset.tone = tone;
}

function updatePreview() {
  if (!state.data) {
    elements.dataPreview.textContent = "";
    elements.recordCount.textContent = "No data loaded.";
    elements.lastUpdated.textContent = "";
    elements.exportData.disabled = true;
    return;
  }

  const pretty = JSON.stringify(state.data, null, 2);
  elements.dataPreview.textContent = pretty;
  const recordCount = Array.isArray(state.data)
    ? state.data.length
    : Object.keys(state.data || {}).length;
  elements.recordCount.textContent = `Records: ${recordCount}`;
  elements.lastUpdated.textContent = state.meta?.updatedAt
    ? `Last updated: ${new Date(state.meta.updatedAt).toLocaleString()}`
    : "";
  elements.exportData.disabled = false;
}

function saveToLocal(data, meta) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

function loadFromLocal() {
  const raw = localStorage.getItem(STORAGE_KEY);
  const rawMeta = localStorage.getItem(META_KEY);
  if (!raw) {
    return { data: null, meta: null };
  }
  try {
    return {
      data: JSON.parse(raw),
      meta: rawMeta ? JSON.parse(rawMeta) : null,
    };
  } catch (error) {
    setStatus("Local data was corrupted. Please clear and fetch again.", "error");
    return { data: null, meta: null };
  }
}

function loadStateFromLocal() {
  const { data, meta } = loadFromLocal();
  state.data = data;
  state.meta = meta;
  updatePreview();
}

function markFetched(meta) {
  elements.fetchData.disabled = true;
  elements.username.disabled = true;
  if (meta?.username) {
    elements.username.value = meta.username;
  }
}

function resetFetchState() {
  elements.fetchData.disabled = false;
  elements.username.disabled = false;
}

async function fetchOnce() {
  const username = elements.username.value.trim();
  if (!username) {
    setStatus("Please enter a username first.", "error");
    return;
  }

  if (state.meta?.fetchedOnce) {
    setStatus(
      "This app only allows one API call per dataset. Clear local data to fetch again.",
      "warn",
    );
    return;
  }

  setStatus("Fetching data…");
  elements.fetchData.disabled = true;
  try {
    const response = await fetch(`${API_BASE}${encodeURIComponent(username)}`);
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const data = await response.json();
    const meta = {
      username,
      fetchedOnce: true,
      updatedAt: new Date().toISOString(),
    };
    state.data = data;
    state.meta = meta;
    saveToLocal(data, meta);
    setStatus("Data fetched and saved locally.", "success");
    updatePreview();
    markFetched(meta);
  } catch (error) {
    setStatus(`Fetch failed: ${error.message}`, "error");
    elements.fetchData.disabled = false;
  }
}

function clearLocal() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(META_KEY);
  state.data = null;
  state.meta = null;
  resetFetchState();
  setStatus("Local data cleared.", "success");
  updatePreview();
}

function handleImport(event) {
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const meta = {
        username: state.meta?.username || "imported",
        fetchedOnce: true,
        updatedAt: new Date().toISOString(),
      };
      state.data = parsed;
      state.meta = meta;
      saveToLocal(parsed, meta);
      setStatus("Import complete. Data saved locally.", "success");
      updatePreview();
      markFetched(meta);
    } catch (error) {
      setStatus("Import failed. Please upload valid JSON.", "error");
    }
  };
  reader.readAsText(file);
}

function handleExport() {
  if (!state.data) {
    setStatus("No data to export.", "error");
    return;
  }
  const blob = new Blob([JSON.stringify(state.data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `omar-api-data-${state.meta?.username || "export"}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  setStatus("Export ready.", "success");
}

function init() {
  loadStateFromLocal();
  if (state.meta?.fetchedOnce) {
    markFetched(state.meta);
  }

  elements.fetchData.addEventListener("click", fetchOnce);
  elements.loadLocal.addEventListener("click", () => {
    loadStateFromLocal();
    if (state.data) {
      setStatus("Loaded local data.", "success");
    } else {
      setStatus("No local data found.", "warn");
    }
  });
  elements.clearLocal.addEventListener("click", clearLocal);
  elements.importFile.addEventListener("change", handleImport);
  elements.exportData.addEventListener("click", handleExport);

  if (!state.data) {
    setStatus("Ready. Fetch once or import a saved JSON file.");
  }
}

init();
