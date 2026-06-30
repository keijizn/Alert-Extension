const targetUrlInput = document.getElementById("targetUrl");
const messageInput = document.getElementById("message");
const gifUrlInput = document.getElementById("gifUrl");
const refugeUrlInput = document.getElementById("refugeUrl");
const refugeButtonTextInput = document.getElementById("refugeButtonText");
const wallpaperFileInput = document.getElementById("wallpaperFile");
const themeInput = document.getElementById("theme");
const opacityInput = document.getElementById("opacity");
const opacityValue = document.getElementById("opacityValue");
const saveBlockBtn = document.getElementById("saveBlockBtn");
const saveVisualBtn = document.getElementById("saveVisualBtn");
const clearFormBtn = document.getElementById("clearFormBtn");
const blockedList = document.getElementById("blockedList");

let wallpaperBase64Temp = "";
let editingIndex = null;

function atualizarOpacityLabel() {
  opacityValue.textContent = `${opacityInput.value}%`;
}

opacityInput.addEventListener("input", atualizarOpacityLabel);

function limparFormulario() {
  targetUrlInput.value = "";
  messageInput.value = "";
  gifUrlInput.value = "";
  refugeUrlInput.value = "";
  refugeButtonTextInput.value = "";
  editingIndex = null;
  saveBlockBtn.textContent = "Adicionar bloqueio";
}

async function obterBloqueios() {
  const data = await chrome.storage.sync.get({
    blockedSites: []
  });
  return Array.isArray(data.blockedSites) ? data.blockedSites : [];
}

async function salvarBloqueios(blockedSites) {
  await chrome.storage.sync.set({ blockedSites });
}

function criarCardBloqueio(item, index) {
  const wrapper = document.createElement("div");
  wrapper.className = "blocked-item";

  const url = document.createElement("div");
  url.className = "blocked-url";
  url.textContent = item.targetUrl || "(sem link)";

  const meta = document.createElement("div");
  meta.className = "blocked-meta";
  meta.textContent = item.message
    ? item.message.slice(0, 100) + (item.message.length > 100 ? "..." : "")
    : "Sem mensagem";

  const actions = document.createElement("div");
  actions.className = "item-actions";

  const editBtn = document.createElement("button");
  editBtn.textContent = "Editar";
  editBtn.className = "btn-edit";
  editBtn.onclick = () => carregarParaEdicao(item, index);

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Excluir";
  deleteBtn.className = "btn-delete";
  deleteBtn.onclick = async () => {
    const blockedSites = await obterBloqueios();
    blockedSites.splice(index, 1);
    await salvarBloqueios(blockedSites);
    await renderizarBloqueios();

    if (editingIndex === index) {
      limparFormulario();
    }
  };

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  wrapper.appendChild(url);
  wrapper.appendChild(meta);
  wrapper.appendChild(actions);

  return wrapper;
}

function carregarParaEdicao(item, index) {
  targetUrlInput.value = item.targetUrl || "";
  messageInput.value = item.message || "";
  gifUrlInput.value = item.gifUrl || "";
  refugeUrlInput.value = item.refugeUrl || "";
  refugeButtonTextInput.value = item.refugeButtonText || "";

  editingIndex = index;
  saveBlockBtn.textContent = "Salvar edição";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function renderizarBloqueios() {
  const blockedSites = await obterBloqueios();
  blockedList.innerHTML = "";

  if (!blockedSites.length) {
    blockedList.innerHTML = "<p>Nenhum site bloqueado ainda.</p>";
    return;
  }

  blockedSites.forEach((item, index) => {
    blockedList.appendChild(criarCardBloqueio(item, index));
  });
}

async function carregarDados() {
  const syncData = await chrome.storage.sync.get({
    blockedSites: [],
    theme: "soft",
    opacity: "60"
  });

  const localData = await chrome.storage.local.get({
    wallpaperBase64: ""
  });

  themeInput.value = syncData.theme || "soft";
  opacityInput.value = String(syncData.opacity ?? "60");
  wallpaperBase64Temp = localData.wallpaperBase64 || "";

  atualizarOpacityLabel();
  await renderizarBloqueios();
}

wallpaperFileInput.addEventListener("change", () => {
  const file = wallpaperFileInput.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (event) {
    wallpaperBase64Temp = event.target.result;
    alert("Wallpaper carregado com sucesso. Agora clique em Salvar configurações visuais.");
  };

  reader.onerror = function () {
    alert("Erro ao carregar o wallpaper.");
  };

  reader.readAsDataURL(file);
});

saveBlockBtn.addEventListener("click", async () => {
  const targetUrl = targetUrlInput.value.trim();

  if (!targetUrl) {
    alert("Informe o link do site.");
    return;
  }

  const novoBloqueio = {
    targetUrl,
    message: messageInput.value.trim(),
    gifUrl: gifUrlInput.value.trim(),
    refugeUrl: refugeUrlInput.value.trim(),
    refugeButtonText: refugeButtonTextInput.value.trim()
  };

  const blockedSites = await obterBloqueios();

  if (editingIndex !== null) {
    blockedSites[editingIndex] = novoBloqueio;
  } else {
    blockedSites.push(novoBloqueio);
  }

  await salvarBloqueios(blockedSites);
  limparFormulario();
  await renderizarBloqueios();
});

saveVisualBtn.addEventListener("click", async () => {
  try {
    await chrome.storage.sync.set({
      theme: themeInput.value,
      opacity: String(opacityInput.value)
    });

    await chrome.storage.local.set({
      wallpaperBase64: wallpaperBase64Temp
    });

    alert("Configurações visuais salvas com sucesso.");
  } catch (error) {
    console.error(error);
    alert("Erro ao salvar configurações visuais.");
  }
});

clearFormBtn.addEventListener("click", () => {
  limparFormulario();
});

carregarDados();