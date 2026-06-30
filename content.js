(async function () {
  const syncData = await chrome.storage.sync.get([
    "blockedSites",
    "theme",
    "opacity"
  ]);

  const localData = await chrome.storage.local.get([
    "wallpaperBase64"
  ]);

  const data = {
    ...syncData,
    ...localData
  };

  const blockedSites = Array.isArray(data.blockedSites) ? data.blockedSites : [];
  if (!blockedSites.length) return;

  function normalizarUrl(url) {
    try {
      const u = new URL(url);
      return u.hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  }

  function hexToRgba(hex, alpha) {
    const clean = hex.replace("#", "");
    const bigint = parseInt(clean, 16);

    let r, g, b;

    if (clean.length === 6) {
      r = (bigint >> 16) & 255;
      g = (bigint >> 8) & 255;
      b = bigint & 255;
    } else {
      return hex;
    }

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  const siteAtual = normalizarUrl(window.location.href);
  if (!siteAtual) return;

  const currentBlock = blockedSites.find(item => {
    const siteSalvo = normalizarUrl(item.targetUrl || "");
    return siteSalvo && siteSalvo === siteAtual;
  });

  if (!currentBlock) return;

  function getTheme(theme) {
    switch (theme) {
      case "dark":
        return {
          cardBg: "#1f1f22",
          cardText: "#f4f4f4",
          title: "#ffffff",
          section: "#d07a7a",
          boxBg: "#2a2a2e",
          boxBorder: "#4a4040",
          boxText: "#e8e8e8",
          divider: "rgba(208,122,122,0.25)",
          ghostBtnBg: "#2c2c31",
          ghostBtnText: "#f4f4f4",
          ghostBtnBorder: "#444"
        };
      case "light":
        return {
          cardBg: "#ffffff",
          cardText: "#231f20",
          title: "#231f20",
          section: "#b25c5c",
          boxBg: "#fafafa",
          boxBorder: "#e5dede",
          boxText: "#4d4444",
          divider: "rgba(178,92,92,0.18)",
          ghostBtnBg: "#ffffff",
          ghostBtnText: "#5b5454",
          ghostBtnBorder: "#d6d4cf"
        };
      case "danger":
        return {
          cardBg: "#2a1d1d",
          cardText: "#f8eaea",
          title: "#fff4f4",
          section: "#e07a7a",
          boxBg: "#382727",
          boxBorder: "#6d4a4a",
          boxText: "#f3dddd",
          divider: "rgba(224,122,122,0.22)",
          ghostBtnBg: "#3b2c2c",
          ghostBtnText: "#ffe5e5",
          ghostBtnBorder: "#6d4a4a"
        };
      default:
        return {
          cardBg: "#f5f1ec",
          cardText: "#231f20",
          title: "#231f20",
          section: "#b25c5c",
          boxBg: "#ffffff",
          boxBorder: "#e4c9c9",
          boxText: "#4d4444",
          divider: "rgba(178,92,92,0.22)",
          ghostBtnBg: "#ffffff",
          ghostBtnText: "#5b5454",
          ghostBtnBorder: "#d6d4cf"
        };
    }
  }

  const theme = getTheme(data.theme || "soft");
  const opacity = Number(data.opacity ?? 60) / 100;

  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.zIndex = "2147483647";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.padding = "24px";
  overlay.style.boxSizing = "border-box";
  overlay.style.backdropFilter = "blur(8px)";

  if (data.wallpaperBase64) {
    overlay.style.backgroundImage = `url(${data.wallpaperBase64})`;
    overlay.style.backgroundSize = "cover";
    overlay.style.backgroundPosition = "center";
    overlay.style.backgroundRepeat = "no-repeat";
  } else {
    overlay.style.background = "rgba(0,0,0,0.55)";
  }

  const card = document.createElement("div");
  card.style.background = hexToRgba(theme.cardBg, opacity);
  card.style.color = theme.cardText;
  card.style.borderRadius = "28px";
  card.style.padding = "38px";
  card.style.width = "1120px";
  card.style.maxWidth = "96vw";
  card.style.minHeight = "620px";
  card.style.boxShadow = "0 24px 70px rgba(0,0,0,0.35)";
  card.style.fontFamily = "'Segoe UI', Arial, sans-serif";
  card.style.display = "grid";
  card.style.gridTemplateColumns = "1.2fr 0.9fr";
  card.style.gap = "30px";
  card.style.boxSizing = "border-box";
  card.style.backdropFilter = "blur(10px)";
  card.style.webkitBackdropFilter = "blur(10px)";

  const left = document.createElement("div");
  left.style.display = "flex";
  left.style.flexDirection = "column";

  const editorTitle = document.createElement("div");
  editorTitle.textContent = "EDITOR";
  editorTitle.style.color = theme.section;
  editorTitle.style.fontSize = "21px";
  editorTitle.style.fontWeight = "700";
  editorTitle.style.letterSpacing = "3px";
  editorTitle.style.marginBottom = "8px";

  const editorSubtitle = document.createElement("div");
  editorSubtitle.textContent = "Editar bloqueio";
  editorSubtitle.style.fontSize = "48px";
  editorSubtitle.style.fontWeight = "800";
  editorSubtitle.style.color = theme.title;
  editorSubtitle.style.marginBottom = "26px";
  editorSubtitle.style.lineHeight = "1.05";

  const urlLabel = document.createElement("div");
  urlLabel.textContent = "URL bloqueada";
  urlLabel.style.fontSize = "18px";
  urlLabel.style.fontWeight = "600";
  urlLabel.style.color = theme.cardText;
  urlLabel.style.marginBottom = "10px";

  const urlBox = document.createElement("div");
  urlBox.textContent = currentBlock.targetUrl;
  urlBox.style.padding = "16px 18px";
  urlBox.style.borderRadius = "16px";
  urlBox.style.border = `2px solid ${theme.boxBorder}`;
  urlBox.style.background = hexToRgba(theme.boxBg, Math.min(opacity + 0.15, 1));
  urlBox.style.fontSize = "17px";
  urlBox.style.color = theme.boxText;
  urlBox.style.marginBottom = "22px";
  urlBox.style.boxShadow = "0 2px 10px rgba(0,0,0,0.04)";
  urlBox.style.wordBreak = "break-word";

  const messageLabel = document.createElement("div");
  messageLabel.textContent = "Abusos";
  messageLabel.style.fontSize = "18px";
  messageLabel.style.fontWeight = "600";
  messageLabel.style.color = theme.cardText;
  messageLabel.style.marginBottom = "10px";

  const messageBox = document.createElement("div");
  messageBox.textContent = currentBlock.message || "Esse site foi bloqueado.";
  messageBox.style.padding = "22px";
  messageBox.style.borderRadius = "18px";
  messageBox.style.background = hexToRgba(theme.boxBg, Math.min(opacity + 0.15, 1));
  messageBox.style.minHeight = "270px";
  messageBox.style.fontSize = "18px";
  messageBox.style.lineHeight = "1.6";
  messageBox.style.color = theme.boxText;
  messageBox.style.overflow = "auto";
  messageBox.style.whiteSpace = "pre-wrap";
  messageBox.style.boxShadow = "0 2px 10px rgba(0,0,0,0.04)";
  messageBox.style.marginBottom = "28px";
  messageBox.style.boxSizing = "border-box";

  const buttonRow = document.createElement("div");
  buttonRow.style.display = "flex";
  buttonRow.style.gap = "14px";
  buttonRow.style.flexWrap = "wrap";
  buttonRow.style.alignItems = "center";

  const proceedBtn = document.createElement("button");
  proceedBtn.textContent = "Tem certeza que quer ver isso?";
  proceedBtn.style.padding = "16px 30px";
  proceedBtn.style.borderRadius = "18px";
  proceedBtn.style.border = "none";
  proceedBtn.style.background = "linear-gradient(180deg, #d96565 0%, #c84f4f 100%)";
  proceedBtn.style.color = "#fff";
  proceedBtn.style.fontSize = "18px";
  proceedBtn.style.fontWeight = "700";
  proceedBtn.style.cursor = "pointer";
  proceedBtn.style.boxShadow = "0 10px 22px rgba(200,79,79,0.25)";
  proceedBtn.style.transition = "transform 0.15s ease, box-shadow 0.15s ease";

  proceedBtn.onmouseenter = () => {
    proceedBtn.style.transform = "translateY(-1px)";
    proceedBtn.style.boxShadow = "0 14px 26px rgba(200,79,79,0.32)";
  };
  proceedBtn.onmouseleave = () => {
    proceedBtn.style.transform = "translateY(0)";
    proceedBtn.style.boxShadow = "0 10px 22px rgba(200,79,79,0.25)";
  };

  const refugeBtn = document.createElement("button");
  refugeBtn.textContent = currentBlock.refugeButtonText || "Isso aqui é mais legal";
  refugeBtn.style.padding = "16px 30px";
  refugeBtn.style.borderRadius = "18px";
  refugeBtn.style.border = `1px solid ${theme.ghostBtnBorder}`;
  refugeBtn.style.background = hexToRgba(theme.ghostBtnBg, Math.min(opacity + 0.2, 1));
  refugeBtn.style.color = theme.ghostBtnText;
  refugeBtn.style.fontSize = "18px";
  refugeBtn.style.fontWeight = "700";
  refugeBtn.style.cursor = "pointer";
  refugeBtn.style.boxShadow = "0 8px 18px rgba(0,0,0,0.06)";
  refugeBtn.style.transition = "transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease";

  refugeBtn.onmouseenter = () => {
    refugeBtn.style.transform = "translateY(-1px)";
    refugeBtn.style.filter = "brightness(0.98)";
    refugeBtn.style.boxShadow = "0 12px 22px rgba(0,0,0,0.10)";
  };
  refugeBtn.onmouseleave = () => {
    refugeBtn.style.transform = "translateY(0)";
    refugeBtn.style.filter = "none";
    refugeBtn.style.boxShadow = "0 8px 18px rgba(0,0,0,0.06)";
  };

  left.appendChild(editorTitle);
  left.appendChild(editorSubtitle);
  left.appendChild(urlLabel);
  left.appendChild(urlBox);
  left.appendChild(messageLabel);
  left.appendChild(messageBox);

  buttonRow.appendChild(proceedBtn);

  if (currentBlock.refugeUrl && currentBlock.refugeUrl.trim()) {
    buttonRow.appendChild(refugeBtn);
  }

  left.appendChild(buttonRow);

  const right = document.createElement("div");
  right.style.display = "flex";
  right.style.flexDirection = "column";
  right.style.paddingLeft = "30px";
  right.style.borderLeft = `1.5px solid ${theme.divider}`;

  const blockTitle = document.createElement("div");
  blockTitle.textContent = "BLOQUEIOS";
  blockTitle.style.color = theme.section;
  blockTitle.style.fontSize = "21px";
  blockTitle.style.fontWeight = "700";
  blockTitle.style.letterSpacing = "3px";
  blockTitle.style.marginBottom = "8px";

  const blockSubtitle = document.createElement("div");
  blockSubtitle.textContent = "Sites bloqueados";
  blockSubtitle.style.fontSize = "34px";
  blockSubtitle.style.fontWeight = "800";
  blockSubtitle.style.color = theme.title;
  blockSubtitle.style.marginBottom = "22px";
  blockSubtitle.style.lineHeight = "1.1";

  const blockBox = document.createElement("div");
  blockBox.style.background = hexToRgba(theme.boxBg, Math.min(opacity + 0.15, 1));
  blockBox.style.padding = "24px";
  blockBox.style.borderRadius = "20px";
  blockBox.style.boxShadow = "0 2px 10px rgba(0,0,0,0.04)";
  blockBox.style.display = "flex";
  blockBox.style.flexDirection = "column";
  blockBox.style.gap = "14px";
  blockBox.style.maxHeight = "460px";
  blockBox.style.overflow = "auto";

  blockedSites.forEach(item => {
    const itemBox = document.createElement("div");
    itemBox.style.padding = "12px 14px";
    itemBox.style.borderRadius = "14px";
    itemBox.style.background = hexToRgba(theme.cardBg, Math.min(opacity + 0.08, 1));
    itemBox.style.border = `1px solid ${theme.boxBorder}`;
    itemBox.style.fontSize = "15px";
    itemBox.style.color = theme.boxText;
    itemBox.style.wordBreak = "break-word";
    itemBox.textContent = item.targetUrl || "(sem link)";
    blockBox.appendChild(itemBox);
  });

  right.appendChild(blockTitle);
  right.appendChild(blockSubtitle);
  right.appendChild(blockBox);

  card.appendChild(left);
  card.appendChild(right);
  overlay.appendChild(card);
  document.documentElement.appendChild(overlay);

  function abrirConfirmacao() {
    const confirmOverlay = document.createElement("div");
    confirmOverlay.style.position = "fixed";
    confirmOverlay.style.inset = "0";
    confirmOverlay.style.background = "rgba(0,0,0,0.34)";
    confirmOverlay.style.zIndex = "2147483648";
    confirmOverlay.style.display = "flex";
    confirmOverlay.style.alignItems = "center";
    confirmOverlay.style.justifyContent = "center";
    confirmOverlay.style.padding = "20px";
    confirmOverlay.style.boxSizing = "border-box";

    const confirmBox = document.createElement("div");
    confirmBox.style.width = "560px";
    confirmBox.style.maxWidth = "94vw";
    confirmBox.style.background = "#fff";
    confirmBox.style.borderRadius = "24px";
    confirmBox.style.padding = "30px";
    confirmBox.style.boxShadow = "0 18px 45px rgba(0,0,0,0.25)";
    confirmBox.style.fontFamily = "'Segoe UI', Arial, sans-serif";
    confirmBox.style.textAlign = "center";
    confirmBox.style.boxSizing = "border-box";

    const gif = document.createElement("img");
    gif.src = currentBlock.gifUrl && currentBlock.gifUrl.trim()
      ? currentBlock.gifUrl.trim()
      : "https://media.giphy.com/media/ROF8OQvDmxytW/giphy.gif";

    gif.style.width = "220px";
    gif.style.maxWidth = "100%";
    gif.style.maxHeight = "180px";
    gif.style.objectFit = "cover";
    gif.style.borderRadius = "14px";
    gif.style.marginBottom = "18px";

    gif.onerror = () => {
      gif.src = "https://media.giphy.com/media/ROF8OQvDmxytW/giphy.gif";
    };

    const confirmTitle = document.createElement("div");
    confirmTitle.textContent = "Confirmar acesso";
    confirmTitle.style.fontSize = "32px";
    confirmTitle.style.fontWeight = "800";
    confirmTitle.style.color = "#231f20";
    confirmTitle.style.marginBottom = "12px";

    const confirmText = document.createElement("div");
    confirmText.textContent = "Você deseja mesmo prosseguir e ver este conteúdo?";
    confirmText.style.fontSize = "19px";
    confirmText.style.lineHeight = "1.55";
    confirmText.style.color = "#4a4242";
    confirmText.style.marginBottom = "26px";

    const confirmActions = document.createElement("div");
    confirmActions.style.display = "flex";
    confirmActions.style.justifyContent = "center";
    confirmActions.style.gap = "14px";
    confirmActions.style.flexWrap = "wrap";

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancelar";
    cancelBtn.style.padding = "13px 24px";
    cancelBtn.style.borderRadius = "14px";
    cancelBtn.style.border = "1px solid #ded6d6";
    cancelBtn.style.background = "#f7f4f2";
    cancelBtn.style.color = "#5a5353";
    cancelBtn.style.fontSize = "16px";
    cancelBtn.style.fontWeight = "700";
    cancelBtn.style.cursor = "pointer";
    cancelBtn.style.transition = "all 0.15s ease";

    cancelBtn.onmouseenter = () => {
      cancelBtn.style.background = "#f0ece9";
    };
    cancelBtn.onmouseleave = () => {
      cancelBtn.style.background = "#f7f4f2";
    };

    const confirmBtn = document.createElement("button");
    confirmBtn.textContent = "Prosseguir";
    confirmBtn.style.padding = "13px 24px";
    confirmBtn.style.borderRadius = "14px";
    confirmBtn.style.border = "none";
    confirmBtn.style.background = "linear-gradient(180deg, #d96565 0%, #c84f4f 100%)";
    confirmBtn.style.color = "#fff";
    confirmBtn.style.fontSize = "16px";
    confirmBtn.style.fontWeight = "700";
    confirmBtn.style.cursor = "pointer";
    confirmBtn.style.boxShadow = "0 10px 22px rgba(200,79,79,0.22)";
    confirmBtn.style.transition = "transform 0.15s ease, box-shadow 0.15s ease";

    confirmBtn.onmouseenter = () => {
      confirmBtn.style.transform = "translateY(-1px)";
      confirmBtn.style.boxShadow = "0 14px 26px rgba(200,79,79,0.28)";
    };
    confirmBtn.onmouseleave = () => {
      confirmBtn.style.transform = "translateY(0)";
      confirmBtn.style.boxShadow = "0 10px 22px rgba(200,79,79,0.22)";
    };

    cancelBtn.onclick = () => confirmOverlay.remove();
    confirmBtn.onclick = () => {
      confirmOverlay.remove();
      overlay.remove();
    };

    confirmActions.appendChild(cancelBtn);
    confirmActions.appendChild(confirmBtn);

    confirmBox.appendChild(gif);
    confirmBox.appendChild(confirmTitle);
    confirmBox.appendChild(confirmText);
    confirmBox.appendChild(confirmActions);

    confirmOverlay.appendChild(confirmBox);
    document.documentElement.appendChild(confirmOverlay);
  }

  proceedBtn.onclick = abrirConfirmacao;

  if (currentBlock.refugeUrl && currentBlock.refugeUrl.trim()) {
    refugeBtn.onclick = () => {
      window.location.href = currentBlock.refugeUrl.trim();
    };
  }

  btnEdit.onclick = () => {
    alert("Você pode editar esse bloqueio na página de opções da extensão.");
  };

  btnDelete.onclick = async () => {
    const ok = confirm("Deseja excluir este bloqueio?");
    if (!ok) return;

    const novosBloqueios = blockedSites.filter(item => {
      return normalizarUrl(item.targetUrl || "") !== normalizarUrl(currentBlock.targetUrl || "");
    });

    await chrome.storage.sync.set({
      blockedSites: novosBloqueios
    });

    overlay.remove();
  };
})();