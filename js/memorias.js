"use strict";

const AUDIO_STORAGE_KEY = "anossa-historia-audio-state";

const MEMORY_SECTIONS = [
  { key: "carol", title: "Carol", prefixes: ["carol-"] },
  { key: "nos", title: "Nós", prefixes: ["nos-", "dias-", "memorias-", "especiais-"] },
  { key: "maluquices", title: "Nossas Maluquices", prefixes: ["maluquices-"] }
];

const state = {
  galleryItems: [],
  currentLightboxIndex: 0,
  currentScale: 1,
  wasAudioPlayingBeforeVideo: false
};

const elements = {
  body: document.body,
  particles: document.getElementById("memories-particles"),
  butterflies: document.getElementById("memories-butterflies"),
  audio: document.getElementById("memories-audio"),
  audioPill: document.getElementById("memories-audio-pill"),
  videoGrid: document.getElementById("memories-videos-grid"),
  lightbox: document.getElementById("memories-lightbox"),
  lightboxImage: document.getElementById("memories-lightbox-image"),
  lightboxCaption: document.getElementById("memories-lightbox-caption"),
  lightboxClose: document.getElementById("memories-lightbox-close"),
  lightboxPrev: document.getElementById("memories-lightbox-prev"),
  lightboxNext: document.getElementById("memories-lightbox-next"),
  videoModal: document.getElementById("memories-video-modal"),
  videoClose: document.getElementById("memories-video-close"),
  videoPlayer: document.getElementById("memories-video-player")
};

document.addEventListener("DOMContentLoaded", async () => {
  setupLightbox();
  setupAudioContinuation();
  drawParticles();
  spawnButterflies();
  window.addEventListener("resize", drawParticles);

  await Promise.all([
    loadImages(),
    loadVideos()
  ]);
});

async function loadImages() {
  const manifest = await loadMediaManifest();
  const sections = {
    carol: (manifest?.images?.carol || []).map((f) => `assets/images/${f}`),
    nos: (manifest?.images?.nos || []).map((f) => `assets/images/${f}`),
    maluquices: (manifest?.images?.maluquices || []).map((f) => `assets/images/${f}`)
  };

  MEMORY_SECTIONS.forEach((section) => {
    const container = document.getElementById(`grid-${section.key}`);
    const items = sections[section.key] || [];

    if (!items.length) {
      container.appendChild(createEmptyState("Adicione imagens em assets/images/ para preencher esta parte da galeria."));
      return;
    }

    items.forEach((src, index) => {
      const article = document.createElement("article");

      state.galleryItems.push({ src, caption: "" });
      const galleryIndex = state.galleryItems.length - 1;

      article.className = "memory-card";
      article.setAttribute("role", "button");
      article.setAttribute("tabindex", "0");
      article.setAttribute("aria-label", "Ampliar foto");
      article.innerHTML = `
        <img src="${src}" alt="" loading="lazy">
      `;

      article.addEventListener("click", () => openLightbox(galleryIndex));
      article.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openLightbox(galleryIndex);
        }
      });
      article.querySelector("img").addEventListener("error", () => {
        article.replaceWith(createEmptyState(`Arquivo não encontrado: ${src}`));
      });

      container.appendChild(article);
      observeAnimatedNode(article, index * 60);
    });
  });
}

async function loadMediaManifest() {
  try {
    const response = await fetch("data/media-sections.json");
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    return null;
  }
}

async function loadVideos() {
  const manifest = await loadMediaManifest();
  const files = (manifest?.videosMemorias || []).filter(Boolean);



  if (!files.length) {
    elements.videoGrid.appendChild(createEmptyState("Adicione vídeos em assets/videos/ para ativar esta seção."));
    return;
  }

  files.forEach((file, index) => {
    const src = normalizeAssetPath(file, "assets/videos/");
    const article = document.createElement("article");
    article.className = "memory-video-card";
    article.setAttribute("role", "button");
    article.setAttribute("tabindex", "0");
    article.setAttribute("aria-label", "Abrir vídeo");
    article.innerHTML = `
      <video autoplay muted loop playsinline preload="metadata">
        <source src="${src}" type="video/mp4">
      </video>
    `;

    article.addEventListener("click", () => openVideoModal(src));
    article.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openVideoModal(src);
      }
    });

    const video = article.querySelector("video");
    video.addEventListener("error", () => {
      article.replaceWith(createEmptyState(`Vídeo não encontrado: ${src}`));
    });
    // garante o autoplay mesmo quando o vídeo é inserido dinamicamente
    video.play().catch(() => {});

    elements.videoGrid.appendChild(article);
    observeAnimatedNode(article, index * 70);
  });
}


function setupAudioContinuation() {
  const raw = localStorage.getItem(AUDIO_STORAGE_KEY);
  if (!raw) {
    return;
  }

  let saved;
  try {
    saved = JSON.parse(raw);
  } catch (error) {
    localStorage.removeItem(AUDIO_STORAGE_KEY);
    return;
  }

  if (!saved || !saved.src) return;

  elements.audio.src = saved.src;
  elements.audioPill.textContent = saved.title || "Trilha em andamento";

  // mantém a posição exata da faixa (espera os metadados quando necessário)
  const applySavedTime = () => {
    const time = Number(saved.currentTime) || 0;
    if (Number.isFinite(time) && time > 0) {
      try {
        elements.audio.currentTime = time;
      } catch (error) {
        /* navegador ainda não aceita seek; será aplicado no loadedmetadata */
      }
    }
  };

  if (elements.audio.readyState >= 1) {
    applySavedTime();
  } else {
    elements.audio.addEventListener("loadedmetadata", applySavedTime, { once: true });
  }

  elements.audio.addEventListener("timeupdate", persistAudioState);
  elements.audio.addEventListener("pause", persistAudioState);
  elements.audio.addEventListener("play", persistAudioState);
  window.addEventListener("pagehide", persistAudioState);

  if (!saved.paused) {
    // tenta continuar imediatamente; se o navegador bloquear o autoplay,
    // retoma do mesmo ponto no primeiro toque/rolagem do usuário
    elements.audio.play().catch(() => resumeAudioOnFirstGesture());
  }
}

function resumeAudioOnFirstGesture() {
  const resume = () => {
    elements.audio.play().catch(() => {});
    ["pointerdown", "touchstart", "click", "keydown", "scroll"].forEach((evt) => {
      window.removeEventListener(evt, resume);
    });
  };

  ["pointerdown", "touchstart", "click", "keydown", "scroll"].forEach((evt) => {
    window.addEventListener(evt, resume, { passive: true });
  });
}

function persistAudioState() {
  if (!elements.audio.src) return;

  const payload = {
    src: elements.audio.currentSrc || elements.audio.src,
    title: elements.audioPill.textContent,
    currentTime: Number.isFinite(elements.audio.currentTime) ? elements.audio.currentTime : 0,
    paused: elements.audio.paused
  };

  localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(payload));
}

function setupLightbox() {
  let startX = 0;

  elements.lightboxClose.addEventListener("click", closeLightbox);
  elements.lightboxPrev.addEventListener("click", () => openLightbox(state.currentLightboxIndex - 1));
  elements.lightboxNext.addEventListener("click", () => openLightbox(state.currentLightboxIndex + 1));
  elements.videoClose.addEventListener("click", closeVideoModal);

  document.addEventListener("keydown", (event) => {
    if (elements.lightbox.classList.contains("is-open")) {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") openLightbox(state.currentLightboxIndex - 1);
      if (event.key === "ArrowRight") openLightbox(state.currentLightboxIndex + 1);
    }

    if (elements.videoModal.classList.contains("is-open") && event.key === "Escape") {
      closeVideoModal();
    }
  });

  elements.lightbox.addEventListener("click", (event) => {
    if (event.target === elements.lightbox) closeLightbox();
  });

  elements.videoModal.addEventListener("click", (event) => {
    if (event.target === elements.videoModal) closeVideoModal();
  });

  elements.lightboxImage.addEventListener("dblclick", () => {
    state.currentScale = state.currentScale === 1 ? 1.8 : 1;
    elements.lightboxImage.style.transform = `scale(${state.currentScale})`;
  });

  elements.lightbox.addEventListener("touchstart", (event) => {
    startX = event.changedTouches[0].clientX;
  }, { passive: true });

  elements.lightbox.addEventListener("touchend", (event) => {
    const endX = event.changedTouches[0].clientX;
    const delta = endX - startX;
    if (Math.abs(delta) < 40) return;
    openLightbox(state.currentLightboxIndex + (delta < 0 ? 1 : -1));
  }, { passive: true });
}

function openLightbox(index) {
  if (!state.galleryItems.length) return;
  state.currentLightboxIndex = (index + state.galleryItems.length) % state.galleryItems.length;
  const item = state.galleryItems[state.currentLightboxIndex];
  state.currentScale = 1;
  elements.lightboxImage.style.transform = "scale(1)";
  elements.lightboxImage.src = item.src;
  elements.lightboxImage.alt = item.caption;
  elements.lightboxCaption.textContent = item.caption;
  elements.lightbox.classList.add("is-open");
  elements.lightbox.setAttribute("aria-hidden", "false");
  elements.body.classList.add("no-scroll");
}

function closeLightbox() {
  elements.lightbox.classList.remove("is-open");
  elements.lightbox.setAttribute("aria-hidden", "true");
  elements.body.classList.remove("no-scroll");
}

function openVideoModal(src) {
  // pause player and resume audio at exact time when closing
  state.wasAudioPlayingBeforeVideo = !elements.audio.paused;
  persistAudioState();
  elements.audio.pause();

  elements.videoPlayer.src = src;
  elements.videoPlayer.muted = false;
  elements.videoPlayer.currentTime = 0;

  elements.videoModal.classList.add("is-open");
  elements.videoModal.setAttribute("aria-hidden", "false");
  elements.body.classList.add("no-scroll");

  elements.videoPlayer.play().catch(() => {});
}

function closeVideoModal() {
  elements.videoPlayer.pause();
  elements.videoPlayer.removeAttribute("src");
  elements.videoPlayer.load();
  elements.videoModal.classList.remove("is-open");
  elements.videoModal.setAttribute("aria-hidden", "true");
  elements.body.classList.remove("no-scroll");

  // restore audio exactly where we paused
  if (state.wasAudioPlayingBeforeVideo) {
    const raw = localStorage.getItem(AUDIO_STORAGE_KEY);
    if (raw) {
      try {
        const saved = JSON.parse(raw);
        if (saved && saved.src) {
          elements.audio.src = saved.src;
          elements.audio.currentTime = Number(saved.currentTime) || 0;
        }
      } catch (e) {
        // ignore
      }
    }

    elements.audio.play().catch(() => {});
  }

  persistAudioState();
}



async function discoverMediaFiles(directory, extensions) {
  try {
    const response = await fetch(directory);
    const contentType = response.headers.get("content-type") || "";
    if (!response.ok || !contentType.includes("text/html")) return [];

    const html = await response.text();
    const parser = new DOMParser();
    const documentNode = parser.parseFromString(html, "text/html");
    const links = [...documentNode.querySelectorAll("a[href]")];

    return links
      .map((link) => decodeURIComponent(link.getAttribute("href") || ""))
      .filter((href) => extensions.some((extension) => href.toLowerCase().endsWith(extension)))
      .map((href) => href.replace(/^\/+/, ""))
      .map((href) => href.startsWith(directory) ? href.slice(directory.length) : href);
  } catch (error) {
    return [];
  }
}

function normalizeAssetPath(file, baseDirectory) {
  if (!file) return "";
  if (/^(https?:)?\/\//.test(file) || file.startsWith("data:")) return file;
  if (file.startsWith(baseDirectory)) return file;
  return `${baseDirectory}${file}`;
}

function getFileName(filePath) {
  return filePath.split("/").pop() || filePath;
}

function createEmptyState(text) {
  const item = document.createElement("div");
  item.className = "memory-empty";
  item.textContent = text;
  return item;
}

function observeAnimatedNode(node, delay = 0) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      setTimeout(() => entry.target.classList.add("in-view"), delay);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14 });

  observer.observe(node);
}

function drawParticles() {
  const canvas = elements.particles;
  const context = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, width, height);

  const particles = Array.from({ length: Math.min(180, Math.floor(width / 7)) }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 2 + 0.4,
    alpha: Math.random() * 0.45 + 0.08
  }));

  particles.forEach((particle) => {
    context.beginPath();
    context.fillStyle = `rgba(183, 146, 230, ${particle.alpha})`;
    context.shadowBlur = 12;
    context.shadowColor = "rgba(255,255,255,0.6)";
    context.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
    context.fill();
  });
}

function spawnButterflies() {
  setInterval(() => {
    const butterfly = document.createElement("span");
    butterfly.className = "butterfly";
    butterfly.style.left = `${Math.random() * 100}%`;
    butterfly.style.top = `${20 + Math.random() * 60}%`;
    butterfly.style.setProperty("--travel-x", `${-120 + Math.random() * 240}px`);
    butterfly.style.setProperty("--travel-y", `${-100 - Math.random() * 120}px`);
    butterfly.style.animationDuration = `${10000 + Math.random() * 6000}ms`;
    elements.butterflies.appendChild(butterfly);

    setTimeout(() => {
      butterfly.remove();
    }, 17000);
  }, 4200);
}
