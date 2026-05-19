// ── PRELOADER ──────────────────────────────────────────────────────────────
const preloader = document.getElementById('preloader');
const prePoster = document.getElementById('prePoster');
const video     = document.getElementById('preVideo-el');

const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.toggle('reduce-motion', isReducedMotion);

// Music initialization
const songPath = 'assets/Ramy.mp3';
const audio = new Audio(songPath);
audio.loop = true;
audio.preload = 'metadata';
let musicStarted = false;

document.body.classList.add('no-scroll');

document.querySelectorAll('img').forEach(img => {
  if (!img.hasAttribute('loading')) {
    img.loading = 'lazy';
  }
});

function setMusicState() {
  const musicBtn = document.getElementById('music');
  if (!musicBtn) return;
  musicBtn.setAttribute('aria-pressed', String(!audio.paused));
}

function dismissPreloader() {
  preloader.classList.add('done');
  document.body.classList.remove('no-scroll');
  document.querySelectorAll('.reveal, .reveal-photo').forEach(el => {
    const d = isReducedMotion ? 0 : parseInt(el.dataset.delay || '0', 10);
    setTimeout(() => el.classList.add('in'), d);
  });
}

// Preload video silently in background
video.load();

// Click poster → hide it, show & play video
prePoster.addEventListener('click', () => {
  prePoster.classList.add('hidden');
  video.classList.add('active');
  video.muted = true;
  video.play().catch(() => {});
  
  // Start background music
  if (!musicStarted) {
    audio.play().catch(err => console.log('Audio play failed:', err));
    musicStarted = true;
  }
});

// Video ends → dismiss
video.addEventListener('ended', dismissPreloader);
video.addEventListener('error', () => setTimeout(dismissPreloader, 500));





// Split text into chars with stagger
document.querySelectorAll('.title .word').forEach((word, wi) => {
  const text = word.dataset.text || '';
  word.innerHTML = '';
  [...text].forEach((c, i) => {
    const s = document.createElement('span');
    s.className = 'char';
    s.textContent = c;
    s.style.animationDelay = (1.6 + wi * 0.4 + i * 0.06) + 's';
    word.appendChild(s);
  });
});




// IntersectionObserver for in-view animations
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.in-view, .g-item, .count-cell, .std-poster').forEach(el => io.observe(el));

// Countdown
const TARGET = new Date(2026, 4, 21, 20, 0, 0).getTime();

const cells = [
  { l: 'days' },
  { l: 'hours' },
  { l: 'minutes' },
  { l: 'seconds' }
];

const grid = document.getElementById('countGrid');
if (grid) {
  cells.forEach((c, i) => {
    const el = document.createElement('div');

    el.className = 'count-cell in-view';
    el.style.transitionDelay = (0.2 + i * 0.08) + 's';

    el.innerHTML = `
      <div class="num" data-k="${c.l}">00</div>
      <div class="lbl">${c.l}</div>
    `;

    grid.appendChild(el);
    io.observe(el);
  });
}

const countdownElements = {
  days: document.querySelector('[data-k="days"]'),
  hours: document.querySelector('[data-k="hours"]'),
  minutes: document.querySelector('[data-k="minutes"]'),
  seconds: document.querySelector('[data-k="seconds"]')
};

function updateCountdown() {
  const now = Date.now();
  const distance = TARGET - now;

  if (distance <= 0) {
    clearInterval(countdownTimer);
    Object.values(countdownElements).forEach(el => {
      if (el) el.textContent = '00';
    });
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  if (countdownElements.days) countdownElements.days.textContent = String(days).padStart(2, '0');
  if (countdownElements.hours) countdownElements.hours.textContent = String(hours).padStart(2, '0');
  if (countdownElements.minutes) countdownElements.minutes.textContent = String(minutes).padStart(2, '0');
  if (countdownElements.seconds) countdownElements.seconds.textContent = String(seconds).padStart(2, '0');
}

updateCountdown();

const countdownTimer = setInterval(updateCountdown, 1000);

// Venue parallax
const venueBg = document.querySelector('[data-parallax]');
if (venueBg) {
  window.addEventListener('scroll', () => {
    const r = venueBg.parentElement.getBoundingClientRect();
    const p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
    venueBg.style.transform = `translateY(${p * -40}px)`;
  }, { passive: true });
}

// Music toggle
const musicBtn = document.getElementById('music');
if (musicBtn) {
  setMusicState();

  audio.addEventListener('play', () => {
    musicBtn.classList.add('playing');
    setMusicState();
  });

  audio.addEventListener('pause', () => {
    musicBtn.classList.remove('playing');
    setMusicState();
  });

  musicBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().catch(err => console.log('Audio play failed:', err));
    } else {
      audio.pause();
    }
  });
}
