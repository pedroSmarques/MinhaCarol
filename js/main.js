"use strict";

const AUDIO_STORAGE_KEY = "anossa-historia-audio-state";

const APP_CONFIG = {
  relationshipStart: "2021-02-14T00:00:00",
  letterText: `Carol,

Eu fiquei pensando em como escrever isso.

E a verdade é que eu nunca fui muito bom com palavras.

Sempre fui melhor demonstrando do que explicando.

Mas hoje eu queria tentar.

Sei que em alguns momentos eu não fui a melhor versão de mim.

Sei que existiram situações em que eu poderia ter sido mais presente, mais atento e até mais paciente.

Não vou fingir que acertei sempre.

Porque não acertei.

Mas existe uma coisa que nunca mudou dentro de mim:

O que eu sinto por você.

Talvez hoje a nossa história esteja em um capítulo diferente daquele que imaginamos.

Mas eu continuo acreditando que ainda existem páginas bonitas esperando para serem escritas.

Quando penso no futuro, não penso apenas em voltar.

Penso em voltar melhor.

Mais maduro.

Mais preparado.

Mais capaz de construir aquilo que sempre sonhamos juntos.

E sim...

Eu ainda penso na Maite.

Ainda penso no Bryan.

Ainda penso na casa.

Nas viagens.

Nas conquistas.

Nas pequenas coisas do dia a dia que pareciam simples, mas que faziam todo sentido quando eu imaginava você ao meu lado.

Essa música que escolhi talvez nem seja exatamente a nossa música.

Mas toda vez que ela toca, alguma lembrança sua aparece junto.

E eu acabo sorrindo sozinho igual um maluco.

Você já sabe que eu não sou o melhor escritor do mundo.

Então não vou tentar parecer poeta.

Vou apenas ser sincero.

Eu te amo.

E continuo torcendo por nós.

Não por quem éramos.

Mas por quem ainda podemos nos tornar.

Feliz Dia dos Namorados, minha chatinha.

E saiba que este site não foi feito para qualquer pessoa.

Foi feito para você.

Com carinho,

Pedro Henrique.`,
  cinemaLines: [
    "Todo mundo erra.",
    "Todo mundo aprende.",
    "Todo mundo cresce quando encara a própria verdade.",
    "Algumas histórias mudam a forma como a gente enxerga a vida.",
    "A nossa fez isso comigo.",
    "Eu não voltaria para apagar o que vivemos.",
    "Eu voltaria só para te abraçar de novo."
  ],
  finalLines: [
    "Ah...",
    "E antes que eu esqueça...",
    "FELIZ DIA DOS NAMORADOS CARAI KKKKKKKKK ❤️",
    "Te amo, Carol."
  ],
  featuredPhoto: "assets/images/perfil.jpeg",
  fallbackMusic: [
    {
      file: "vemca.mp3",
      title: "Nossa trilha"
    }
  ],

  galleryChapters: [
    {
      id: "carol",
      title: "A garota que bagunçou minha vida",
      description: "Os retratos que carregam o seu jeito, a sua beleza e aquilo que só quem te conhece de perto consegue enxergar.",
      prefix: "carol-",
      files: []
    },
    {
      id: "nos",
      title: "Nós",
      description: "O que aconteceu quando dois mundos passaram a caber no mesmo enquadramento.",
      prefix: "nos-",
      files: []
    },
    {
      id: "maluquices",
      title: "As nossas maluquices",
      description: "O lado espontâneo, engraçado e completamente nosso. Batom, brincadeiras e momentos que não precisavam fazer sentido para mais ninguém.",
      prefix: "maluquices-",
      files: []
    },
    {
      id: "dias",
      title: "Dias que eu guardo comigo",
      description: "Praia, passeios e instantes que continuam com cheiro de vida boa.",
      prefix: "dias-",
      files: []
    }
  ],
  fallbackVideos: []
};

const state = {
  galleryItems: [],
  currentLightboxIndex: 0,
  currentScale: 1,
  introEntered: false,
  letterTyped: false,
  cinemaStarted: false,
  finalSequenceStarted: false
};

const elements = {
  body: document.body,
  intro: document.getElementById("intro-screen"),
  enterButton: document.getElementById("enter-button"),
  chapters: document.getElementById("chapters"),
  timelineTrack: document.getElementById("timeline-track"),
  galleryStory: document.getElementById("gallery-story"),
  videoStoryboard: document.getElementById("video-storyboard"),
  letterBody: document.getElementById("letter-body"),
  cinemaLines: document.getElementById("cinema-lines"),
  endingMessage: document.getElementById("ending-message"),
  finalSequence: document.getElementById("final-sequence"),
  secretEpilogue: document.getElementById("secret-epilogue"),
  heartButton: document.getElementById("heart-button"),
  particleField: document.getElementById("particle-field"),
  canvas: document.getElementById("particles-canvas"),
  butterflyLayer: document.getElementById("butterfly-layer"),
  featuredPhotoImage: document.getElementById("featured-photo-image"),
  featuredPhoto: document.getElementById("featured-photo"),
  audio: document.getElementById("background-audio"),
  musicToggle: document.getElementById("music-toggle"),
  musicProgress: document.getElementById("music-progress"),
  trackTitle: document.getElementById("track-title"),
  trackStatus: document.getElementById("track-status"),
  audioPill: document.getElementById("audio-pill"),
  lightbox: document.getElementById("lightbox"),
  lightboxImage: document.getElementById("lightbox-image"),
  lightboxCaption: document.getElementById("lightbox-caption"),
  lightboxClose: document.getElementById("lightbox-close"),
  lightboxPrev: document.getElementById("lightbox-prev"),
  lightboxNext: document.getElementById("lightbox-next")
};

document.addEventListener("DOMContentLoaded", async () => {
  elements.body.classList.add("no-scroll");
  setupIntro();
  setupObservers();
  setupCounter();
  setupLetter();
  setupCinemaLines();
  setupHeartEnding();
  setupLightbox();
  setupAudio();
  setupFeaturedPhoto();
  drawParticles();
  spawnButterflies();
  window.addEventListener("resize", drawParticles);

  await Promise.all([
    loadTimeline(),
    loadGallery(),
    loadVideos()
  ]);
});

function setupIntro() {
  elements.enterButton.addEventListener("click", () => {
    if (state.introEntered) return;
    state.introEntered = true;
    elements.intro.classList.add("is-hidden");
    elements.chapters.classList.add("is-visible");
    elements.chapters.setAttribute("aria-hidden", "false");
    elements.body.classList.remove("no-scroll");
    setTimeout(() => {
      document.getElementById("chapter-hero")?.scrollIntoView({ behavior: "smooth" });
    }, 260);
  });
}

function setupObservers() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in-view");

      if (entry.target.id === "chapter-letter" && !state.letterTyped) {
        typeLetter();
      }

      if (entry.target.id === "chapter-timeback" && !state.cinemaStarted) {
        startCinemaSequence();
      }
    });
  }, { threshold: 0.18 });

  document.querySelectorAll(".chapter-heading, .counter-grid, .letter-paper, .sky-orbit, .chapter, .featured-photo, .reflection-grid").forEach((node) => {
    observer.observe(node);
  });
}

async function loadTimeline() {
  try {
    const response = await fetch("data/timeline.json");
    const events = await response.json();
    elements.timelineTrack.innerHTML = "";

    events.forEach((event, index) => {
      const article = document.createElement("article");
      article.className = "timeline-event";
      article.innerHTML = `
        <div class="event-copy">
          <span class="event-date">${event.date}</span>
          <h3 class="event-title">${event.title}</h3>
          <p class="event-description">${event.description}</p>
        </div>
        <div class="event-media">
          ${event.photo ? `<img src="${event.photo}" alt="${event.title}" loading="lazy">` : `<div class="event-placeholder">Adicione uma foto deste momento em <code>assets/images/</code>.</div>`}
        </div>
      `;

      const image = article.querySelector("img");
      if (image) {
        image.addEventListener("error", () => {
          image.replaceWith(createPlaceholder("A imagem deste trecho ainda não foi adicionada."));
        });
      }

      elements.timelineTrack.appendChild(article);
      observeAnimatedNode(article, index * 70);
    });
  } catch (error) {
    elements.timelineTrack.innerHTML = "";
    elements.timelineTrack.appendChild(createPlaceholder("Não foi possível carregar a linha do tempo. Verifique o arquivo data/timeline.json."));
  }
}

let mediaManifestPromise = null;

async function loadMediaManifest() {
  if (mediaManifestPromise) return mediaManifestPromise;

  mediaManifestPromise = (async () => {
    try {
      const response = await fetch("data/media-sections.json");
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      return null;
    }
  })();

  return mediaManifestPromise;
}

async function loadGallery() {
  const manifest = await loadMediaManifest();

  // Capítulo 5 mostra apenas a Carol (1 ou 2 fotos). As demais fotos
  // ("nós" e "maluquices") vivem somente na página de memórias.
  const carolItems = (manifest?.images?.carol || [])
    .slice(0, 2)
    .map((f) => ({ src: normalizeAssetPath(f, "assets/images/") }));

  const chapters = [
    { id: "carol", title: "A garota que bagunçou minha vida", description: APP_CONFIG.galleryChapters[0].description, items: carolItems, chapterTagIndex: 5 }
  ].filter((c) => c.items.length);

  if (!chapters.length) {
    elements.galleryStory.innerHTML = "";
    elements.galleryStory.appendChild(createPlaceholder("Adicione imagens em assets/images/ para preencher a galeria."));
    return;
  }

  elements.galleryStory.innerHTML = "";
  state.galleryItems = [];

  chapters.forEach((chapter, chapterIndex) => {
    const section = document.createElement("section");
    section.className = "gallery-chapter";

    const ribbon = document.createElement("div");
    ribbon.className = "gallery-ribbon";

    section.innerHTML = `
      <div class="gallery-chapter-header">
        <div>
          <span class="chapter-tag">Capítulo ${chapter.chapterTagIndex}</span>
          <h3>${chapter.title}</h3>
        </div>
        <p>${chapter.description}</p>
      </div>
    `;

    chapter.items.forEach((item, itemIndex) => {
      state.galleryItems.push({ src: item.src, caption: "" });
      const lightboxIndex = state.galleryItems.length - 1;

      const article = document.createElement("article");
      const layout = itemIndex % 5 === 0 ? "wide" : itemIndex % 3 === 0 ? "tall" : "square";
      article.className = `gallery-item ${layout}`;
      article.setAttribute("role", "button");
      article.setAttribute("tabindex", "0");
      article.setAttribute("aria-label", "Ampliar foto");
      article.innerHTML = `
        <div class="gallery-media">
          <img src="${item.src}" alt="" loading="lazy">
        </div>
      `;

      article.addEventListener("click", () => openLightbox(lightboxIndex));
      article.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openLightbox(lightboxIndex);
        }
      });
      article.querySelector("img").addEventListener("error", () => {
        article.replaceWith(createPlaceholder(`Arquivo não encontrado: ${item.src}`));
      });

      ribbon.appendChild(article);
    });

    section.appendChild(ribbon);
    elements.galleryStory.appendChild(section);
    observeAnimatedNode(section, chapterIndex * 90);
  });
}


async function loadVideos() {
  const manifest = await loadMediaManifest();
  const files = (manifest?.videosIndex || []).filter(Boolean);

  // fallback: se o manifest não carregar, usa os vídeos reais existentes
  const resolvedFiles = files.length ? files : await getVideosFromAssets();


  const finalFiles = resolvedFiles;

  if (!finalFiles.length) {
    elements.videoStoryboard.innerHTML = "";
    elements.videoStoryboard.appendChild(createPlaceholder("Adicione vídeos em assets/videos/ para compor esta parte da narrativa."));
    return;
  }

  elements.videoStoryboard.innerHTML = "";
  finalFiles.forEach((file, index) => {
    const path = normalizeAssetPath(file, "assets/videos/");
    const card = document.createElement("article");
    card.className = "video-card";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", "Abrir vídeo");
    card.innerHTML = `
      <video autoplay muted loop playsinline preload="metadata">
        <source src="${path}" type="video/mp4">
        Seu navegador não conseguiu abrir este vídeo.
      </video>
      <div>
        <p>Nossos momentos também mereciam continuar vivos. Algumas lembranças ficam ainda mais bonitas quando podem ser vistas em movimento.</p>
      </div>
    `;

    const video = card.querySelector("video");
    const openCard = () => {
      if (!video) return;
      openIndexVideoModal(path);
    };
    card.addEventListener("click", openCard);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openCard();
      }
    });

    if (video) {
      video.addEventListener("error", () => {
        card.replaceWith(createPlaceholder(`Vídeo não encontrado: ${path}`));
      });
      // garante o autoplay mesmo quando o vídeo é inserido dinamicamente
      video.play().catch(() => {});
    }

    elements.videoStoryboard.appendChild(card);
    observeAnimatedNode(card, index * 80);
  });
}

function ensureIndexVideoModalElements() {
  // cria sem mexer em layout/estilo: usa o mesmo lightbox existente apenas para vídeo
  if (document.getElementById("index-video-modal")) return;

  const lightbox = elements.lightbox;
  const modal = document.createElement("div");
  modal.id = "index-video-modal";
  modal.className = "lightbox video-modal is-hidden";
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <button class="premium-button lightbox-close" id="index-video-close" type="button" aria-label="Fechar vídeo">Fechar</button>
    <div class="video-modal-shell">
      <video id="index-video-player" controls playsinline preload="metadata"></video>
    </div>
  `;
  // usa o mesmo overlay visual do lightbox
  document.body.appendChild(modal);
}

let indexVideoState = {
  wasAudioPlaying: false
};

function openIndexVideoModal(src) {
  ensureIndexVideoModalElements();
  const modal = document.getElementById("index-video-modal");
  const closeBtn = document.getElementById("index-video-close");
  const player = document.getElementById("index-video-player");

  indexVideoState.wasAudioPlaying = !elements.audio.paused;

  elements.audio.pause();

  player.src = src;
  player.muted = false;
  player.currentTime = 0;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  elements.body.classList.add("no-scroll");

  closeBtn.onclick = () => closeIndexVideoModal();
  modal.onclick = (e) => {
    if (e.target === modal) closeIndexVideoModal();
  };

  player.play().catch(() => {});
}

function closeIndexVideoModal() {
  const modal = document.getElementById("index-video-modal");
  const player = document.getElementById("index-video-player");
  if (!modal || !player) return;

  const pausedAt = player.currentTime;
  player.pause();
  player.removeAttribute("src");
  player.load();

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  elements.body.classList.remove("no-scroll");

  if (indexVideoState.wasAudioPlaying) {
    // retoma exatamente de onde parou via localStorage existente
    restoreAudioState(APP_CONFIG.fallbackMusic[0]?.title || "Nossa trilha");
    elements.audio.play().catch(() => {});
  }
}



function setupFeaturedPhoto() {
  const image = elements.featuredPhotoImage;
  image.src = APP_CONFIG.featuredPhoto;
  image.addEventListener("error", () => {
    elements.featuredPhoto.querySelector(".featured-image-wrap").replaceWith(createPlaceholder("Defina a foto principal da Carol em APP_CONFIG.featuredPhoto."));
  });
}

function setupCounter() {
  const years = document.getElementById("count-years");
  const months = document.getElementById("count-months");
  const days = document.getElementById("count-days");
  const hours = document.getElementById("count-hours");
  const minutes = document.getElementById("count-minutes");
  const seconds = document.getElementById("count-seconds");

  if (!years || !months || !days || !hours || !minutes || !seconds) return;

  // mantém o visual original do contador (mesmos elementos), mas trava em 6 meses
  years.textContent = "";
  months.textContent = "6";
  days.textContent = "";
  hours.textContent = "";
  minutes.textContent = "";
  seconds.textContent = "";

  // Ajusta a seção para não mostrar “anos/meses/dias...” quando os valores estiverem vazios
  // (mantém o layout e o estilo original do card)
  const articles = document.querySelectorAll("#counter-grid article");
  articles.forEach((article) => {
    const strong = article.querySelector("strong");
    const span = article.querySelector("span");
    if (!strong || !span) return;
    const id = strong.id;
    const value = strong.textContent.trim();

    // se estiver vazio, oculta para não conflitar com o texto pedido
    if (!value) {
      article.style.display = "none";
    } else {
      article.style.display = "block";
    }
  });

  // Troca “Meses” pelo texto fixo solicitado
  const monthStrong = document.getElementById("count-months");
  if (monthStrong) {
    const monthSpan = monthStrong.parentElement?.querySelector("span");
    if (monthSpan) {
      monthSpan.textContent = "meses";
    }
  }


  // Insere o texto abaixo do contador, sem alterar layout principal (mantém dentro do mesmo capítulo)
  const counterHeading = document.querySelector("#chapter-counter .chapter-heading p");
  if (counterHeading) {
    counterHeading.innerHTML = "<span style=\"display:block;\">Foram apenas seis meses no calendário.</span><span style=\"display:block; margin-top:8px;\">Mas tempo nenhum consegue medir tudo o que vivemos.</span><span style=\"display:block; margin-top:8px;\">Quem sabe um dia a gente não faz esse número crescer de novo?</span>";
  }
}



function getCalendarDiff(start, end) {
  const cursor = new Date(start);
  let years = 0;
  let months = 0;

  while (new Date(cursor.getFullYear() + 1, cursor.getMonth(), cursor.getDate(), cursor.getHours(), cursor.getMinutes(), cursor.getSeconds()) <= end) {
    cursor.setFullYear(cursor.getFullYear() + 1);
    years += 1;
  }

  while (new Date(cursor.getFullYear(), cursor.getMonth() + 1, cursor.getDate(), cursor.getHours(), cursor.getMinutes(), cursor.getSeconds()) <= end) {
    cursor.setMonth(cursor.getMonth() + 1);
    months += 1;
  }

  let remainder = Math.max(0, end - cursor);
  const days = Math.floor(remainder / 86400000);
  remainder -= days * 86400000;
  const hours = Math.floor(remainder / 3600000);
  remainder -= hours * 3600000;
  const minutes = Math.floor(remainder / 60000);
  remainder -= minutes * 60000;
  const seconds = Math.floor(remainder / 1000);

  return { years, months, days, hours, minutes, seconds };
}

function setupLetter() {
  elements.letterBody.textContent = "";
}

function typeLetter() {
  state.letterTyped = true;
  elements.letterBody.classList.add("typing");
  const text = APP_CONFIG.letterText;
  let index = 0;

  const tick = () => {
    elements.letterBody.textContent = text.slice(0, index);
    index += 1;

    if (index <= text.length) {
      const delay = text[index - 1] === "\n" ? 36 : 22;
      setTimeout(tick, delay);
    } else {
      elements.letterBody.classList.remove("typing");
    }
  };

  tick();
}

function setupCinemaLines() {
  elements.cinemaLines.innerHTML = APP_CONFIG.cinemaLines
    .map((line) => `<p class="cinema-line">${line}</p>`)
    .join("");
}

function startCinemaSequence() {
  state.cinemaStarted = true;
  const lines = [...elements.cinemaLines.querySelectorAll(".cinema-line")];
  lines.forEach((line, index) => {
    setTimeout(() => line.classList.add("visible"), 1150 * index);
  });
}

function setupHeartEnding() {
  elements.heartButton.addEventListener("click", () => {
    createParticles();
    elements.endingMessage.classList.add("visible");

    if (!state.finalSequenceStarted) {
      startFinalSequence();
    }
  });
}

function startFinalSequence() {
  state.finalSequenceStarted = true;
  elements.finalSequence.innerHTML = "";

  APP_CONFIG.finalLines.forEach((line, index) => {
    const paragraph = document.createElement("p");
    paragraph.className = `final-line${index === 2 || index === 3 ? " emphasis" : ""}`;
    paragraph.textContent = line;
    elements.finalSequence.appendChild(paragraph);

    setTimeout(() => {
      paragraph.classList.add("visible");
    }, 1200 * (index + 1));
  });

  setTimeout(() => {
    elements.secretEpilogue.classList.add("visible");
    elements.secretEpilogue.setAttribute("aria-hidden", "false");
  }, 1200 * (APP_CONFIG.finalLines.length + 1));
}

function createParticles() {
  elements.particleField.innerHTML = "";
  for (let i = 0; i < 18; i += 1) {
    const particle = document.createElement("span");
    particle.className = "particle";
    particle.style.left = `${50 + (Math.random() * 36 - 18)}%`;
    particle.style.bottom = "24%";
    particle.style.setProperty("--x", `${Math.random() * 180 - 90}px`);
    particle.style.animationDelay = `${Math.random() * 220}ms`;
    elements.particleField.appendChild(particle);
  }
}

function setupAudio() {
  const tracks = APP_CONFIG.fallbackMusic.filter((track) => track.file);
  if (!tracks.length) {
    elements.trackStatus.textContent = "Nenhuma música foi configurada ainda. Defina um arquivo em APP_CONFIG.fallbackMusic.";
    elements.musicToggle.disabled = true;
    return;
  }

  const currentTrack = tracks[0];
  elements.audio.src = normalizeAssetPath(currentTrack.file, "assets/music/");
  elements.trackTitle.textContent = currentTrack.title;
  elements.trackStatus.textContent = "A trilha segue com você enquanto a experiência avança.";
  elements.audioPill.textContent = currentTrack.title;

  restoreAudioState(currentTrack.title);

  elements.audio.addEventListener("error", () => {
    elements.trackStatus.textContent = "O arquivo de áudio não foi encontrado. Revise APP_CONFIG.fallbackMusic.";
    elements.musicToggle.disabled = true;
  });

  elements.musicToggle.addEventListener("click", async () => {
    try {
      if (elements.audio.paused) {
        await elements.audio.play();
      } else {
        elements.audio.pause();
      }
      persistAudioState(currentTrack.title);
    } catch (error) {
      elements.trackStatus.textContent = "O navegador bloqueou a reprodução automática. Toque novamente para liberar o áudio.";
    }
  });

  elements.audio.addEventListener("timeupdate", () => {
    if (!elements.audio.duration) return;
    elements.musicProgress.value = String((elements.audio.currentTime / elements.audio.duration) * 100);
    persistAudioState(currentTrack.title);
  });

  elements.musicProgress.addEventListener("input", () => {
    if (!elements.audio.duration) return;
    elements.audio.currentTime = (Number(elements.musicProgress.value) / 100) * elements.audio.duration;
    persistAudioState(currentTrack.title);
  });

  elements.audio.addEventListener("play", () => {
    elements.musicToggle.textContent = "Pausar nossa música";
    persistAudioState(currentTrack.title);
  });



  elements.audio.addEventListener("pause", () => {
    elements.musicToggle.textContent = "Tocar nossa música";
    persistAudioState(currentTrack.title);
  });

  window.addEventListener("pagehide", () => persistAudioState(currentTrack.title));
  window.addEventListener("beforeunload", () => persistAudioState(currentTrack.title));
}

function setupLightbox() {
  let startX = 0;

  elements.lightboxClose.addEventListener("click", closeLightbox);
  elements.lightboxPrev.addEventListener("click", () => openLightbox(state.currentLightboxIndex - 1));
  elements.lightboxNext.addEventListener("click", () => openLightbox(state.currentLightboxIndex + 1));

  document.addEventListener("keydown", (event) => {
    if (!elements.lightbox.classList.contains("is-open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") openLightbox(state.currentLightboxIndex - 1);
    if (event.key === "ArrowRight") openLightbox(state.currentLightboxIndex + 1);
  });

  elements.lightbox.addEventListener("click", (event) => {
    if (event.target === elements.lightbox) closeLightbox();
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
  if (state.introEntered) {
    elements.body.classList.remove("no-scroll");
  }
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

async function discoverMediaFiles(directory, fallbackFiles, extensions) {
  const discovered = await fetchDirectoryListing(directory, extensions);
  if (discovered.length) return discovered;
  return fallbackFiles;
}

async function getVideosFromAssets() {
  // fallback estático para ambientes sem listing de diretório
  return [
    "index1.mp4",
    "index2.mp4",
    "index3.mp4"
  ];
}


async function fetchDirectoryListing(directory, extensions) {
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

function flattenGalleryFallbacks() {
  return APP_CONFIG.galleryChapters.flatMap((chapter) => chapter.files.map((file) => `${chapter.prefix}${file}`));
}

function collectGalleryItems(chapter, files) {
  const matchedFiles = files.filter((file) => getFileName(file).toLowerCase().startsWith(chapter.prefix));

  if (matchedFiles.length) {
    return matchedFiles.map((file, index) => ({
      src: normalizeAssetPath(file, "assets/images/"),
      caption: buildGalleryCaption(chapter.title, index)
    }));
  }

  if (chapter.files.length) {
    return chapter.files.map((file, index) => ({
      src: normalizeAssetPath(file, "assets/images/"),
      caption: buildGalleryCaption(chapter.title, index)
    }));
  }

  return [];
}

function buildGalleryCaption(title, index) {
  return `${title} · ${String(index + 1).padStart(2, "0")}`;
}

function getFileName(filePath) {
  return filePath.split("/").pop() || filePath;
}

function normalizeAssetPath(file, baseDirectory) {
  if (!file) return "";
  if (/^(https?:)?\/\//.test(file) || file.startsWith("data:")) return file;
  if (file.startsWith(baseDirectory)) return file;
  return `${baseDirectory}${file}`;
}

function persistAudioState(title) {
  if (!elements.audio.src) return;

  const payload = {
    src: elements.audio.currentSrc || elements.audio.src,
    title,
    currentTime: Number.isFinite(elements.audio.currentTime) ? elements.audio.currentTime : 0,
    paused: elements.audio.paused
  };

  localStorage.setItem(AUDIO_STORAGE_KEY, JSON.stringify(payload));
}

function restoreAudioState(fallbackTitle) {
  const raw = localStorage.getItem(AUDIO_STORAGE_KEY);
  if (!raw) return;

  try {
    const saved = JSON.parse(raw);
    if (!saved.src) return;

    const currentFile = getFileName(elements.audio.src);
    const savedFile = getFileName(saved.src);

    if (currentFile === savedFile) {
      elements.audio.currentTime = Number(saved.currentTime) || 0;
      elements.audioPill.textContent = saved.title || fallbackTitle;
      elements.trackTitle.textContent = saved.title || fallbackTitle;

      if (!saved.paused) {
        elements.audio.play().catch(() => {
          elements.trackStatus.textContent = "Toque para continuar a música de onde ela parou.";
        });
      }
    }
  } catch (error) {
    localStorage.removeItem(AUDIO_STORAGE_KEY);
  }
}

function createPlaceholder(text) {
  const placeholder = document.createElement("div");
  placeholder.className = "event-placeholder";
  placeholder.textContent = text;
  return placeholder;
}

function drawParticles() {
  const canvas = elements.canvas;
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
    elements.butterflyLayer.appendChild(butterfly);

    setTimeout(() => {
      butterfly.remove();
    }, 17000);
  }, 4200);
}
