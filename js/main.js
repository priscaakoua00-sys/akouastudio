// ── CONVERSION TRACKING ──
function trackEvent(name, params) {
  try {
    if (typeof gtag === 'function') gtag('event', name, params || {});
  } catch (e) {}
}

// ── SUPABASE CONFIG ──
const SUPA_URL = 'https://cbvbvyudwstcbkhjcqav.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNidmJ2eXVkd3N0Y2JraGpjcWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NTczNjksImV4cCI6MjA5MzIzMzM2OX0.jVfyvEgcmT8ettrjl65eyS1P-WPSGHc1tPanH6jlFOA';
let supa = null;
try { supa = window.supabase ? window.supabase.createClient(SUPA_URL, SUPA_KEY) : null; } catch(e) {}

async function saveToSupabase(data) {
  if (!supa) return;
  try {
    await supa.from('bookings').insert([{
      name: data.name, email: data.email, phone: data.phone,
      package: data.package, price: data.price, duration: data.duration,
      date: data.date, time: data.time, addons: data.addons,
      message: data.message, status: 'pending',
      created_at: new Date().toISOString()
    }]);
  } catch(e) { console.log('Supabase save error:', e); }
}

// ═══════════════════════════════════════
// AKOUA STUDIO — Main JS
// ═══════════════════════════════════════

// ── NAVBAR SCROLL ──
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ── HAMBURGER ──
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  hamburger.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
  });
});

// ── DESKTOP LANGUAGE DROPDOWN ──
const langSwitch = document.getElementById('lang-switch');
const langSwitchBtn = document.getElementById('lang-switch-btn');
if (langSwitch && langSwitchBtn) {
  langSwitchBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = langSwitch.classList.toggle('open');
    langSwitchBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
  document.addEventListener('click', (e) => {
    if (!langSwitch.contains(e.target)) {
      langSwitch.classList.remove('open');
      langSwitchBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

// ── PARTICLES ──
function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${Math.random()*100}%;
      top: ${Math.random()*100}%;
      animation-duration: ${4 + Math.random()*6}s;
      animation-delay: ${Math.random()*6}s;
      width: ${1 + Math.random()*3}px;
      height: ${1 + Math.random()*3}px;
      opacity: ${0.2 + Math.random()*0.5};
    `;
    container.appendChild(p);
  }
}
createParticles();

// ── SCROLL REVEAL ──
const reveals = document.querySelectorAll('section > .container, .quote-band, .social-bar');
reveals.forEach(el => el.classList.add('reveal'));

const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// ── FAQ ──
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const answer = item.querySelector('.faq-a');
    const isOpen = btn.classList.contains('open');
    // Close all
    document.querySelectorAll('.faq-q.open').forEach(b => {
      b.classList.remove('open');
      b.closest('.faq-item').querySelector('.faq-a').classList.remove('open');
    });
    if (!isOpen) {
      btn.classList.add('open');
      answer.classList.add('open');
    }
  });
});

// ── MOLLIE PAYMENT LINKS ──
const mollieLinks = {
  'Essential':     'https://payment-links.mollie.com/payment/KKJeADh7BYr4cbPqu3tH9',
  'Signature':     'https://payment-links.mollie.com/payment/KuARFwrqvdMjGujBzJ9zY',
  'Full Day':      'https://payment-links.mollie.com/payment/udPD3wcsiMLSVF9VoDN8v',
  'Pack Créateur': null, // via WhatsApp
  'Pro':           'https://payment-links.mollie.com/payment/K3Z8Qakj5qeLFJBdLA28M',
  'Unlimited':     'https://payment-links.mollie.com/payment/JZbKbnCHAnojC253g2MgS',
};

// ── BOOKING MODAL ──
let currentPackage = {};

function openBooking(name, price, duration) {
  currentPackage = { name, price, duration };
  document.getElementById('modal-badge').textContent = `${name} · ${duration}`;
  document.getElementById('modal-title').textContent = name;
  document.getElementById('modal-price').textContent = `€${price}`;
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('form-date').min = today;
  document.getElementById('modal-overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
  trackEvent('booking_open', { package: name, price, duration });
  const dateInput = document.getElementById('form-date');
  const timeInput = document.getElementById('form-time');
  if (dateInput && !dateInput.dataset.tracked) {
    dateInput.dataset.tracked = '1';
    dateInput.addEventListener('change', () => trackEvent('date_selected', { package: currentPackage.name }));
  }
  if (timeInput && !timeInput.dataset.tracked) {
    timeInput.dataset.tracked = '1';
    timeInput.addEventListener('change', () => trackEvent('time_selected', { package: currentPackage.name }));
  }
}

function closeBooking() {
  document.getElementById('modal-overlay').classList.remove('active');
  document.body.style.overflow = '';
}

async function submitBooking() {
  const name = document.getElementById('form-name').value.trim();
  const email = document.getElementById('form-email').value.trim();
  const tel = document.getElementById('form-tel').value.trim();
  const date = document.getElementById('form-date').value;
  const time = document.getElementById('form-time').value;
  const msg = document.getElementById('form-msg').value.trim();

  if (!name || !email || !date) {
    alert(currentLang === 'nl' ? 'Vul naam, email en datum in.' :
          currentLang === 'en' ? 'Please fill in name, email and date.' :
          currentLang === 'fr' ? 'Veuillez remplir nom, email et date.' :
          'Por favor completa nombre, email y fecha.');
    return;
  }

  // Collect add-ons
  const addons = [];
  document.querySelectorAll('.addons-check input[type="checkbox"]:checked').forEach(cb => {
    addons.push(cb.value);
  });

  // 1. Save to Supabase automatically
  await saveToSupabase({
    name, email,
    phone: tel,
    package: currentPackage.name,
    price: currentPackage.price,
    duration: currentPackage.duration,
    date, time,
    addons: addons.join(', '),
    message: msg
  });

  // 2. Send email to Akoua (fire in background, never blocks the redirect)
  const subject = encodeURIComponent(`🌟 NIEUWE RESERVERING — ${currentPackage.name} — Akoua Studio`);
  const body = encodeURIComponent(
    `NIEUWE RESERVERING — AKOUA STUDIO\n\n` +
    `Pakket: ${currentPackage.name} (${currentPackage.duration}) — €${currentPackage.price}\n` +
    `Naam: ${name}\n` +
    `Email: ${email}\n` +
    `Tel: ${tel}\n` +
    `Datum: ${date}\n` +
    `Tijd: ${time}\n` +
    (addons.length ? `Add-ons: ${addons.join(', ')}\n` : '') +
    (msg ? `\nProject: ${msg}` : '')
  );
  const mailLink = `mailto:akouastudio@gmail.com?subject=${subject}&body=${body}`;
  try {
    const hiddenFrame = document.createElement('iframe');
    hiddenFrame.style.display = 'none';
    hiddenFrame.src = mailLink;
    document.body.appendChild(hiddenFrame);
    setTimeout(() => hiddenFrame.remove(), 3000);
  } catch(e) { console.log('Mail trigger error:', e); }

  // 3. Show success message immediately
  closeBooking();
  showSuccess(name);

  // 4. Redirect to Mollie payment link IMMEDIATELY (same tab, synchronous with the click)
  //    Delayed/new-tab redirects get silently blocked by mobile browsers — this was
  //    very likely causing real bookings to be lost without anyone noticing.
  const mollieUrl = mollieLinks[currentPackage.name];
  if (mollieUrl) {
    trackEvent('checkout_start', { package: currentPackage.name, price: currentPackage.price });
    window.location.href = mollieUrl;
  }
}

function showSuccess(name) {
  const t = translations[currentLang];
  const msgs = {
    nl: `Beste ${name}, welkom in de wereld van Akoua Studio ✨\n\nJe wordt nu direct doorgestuurd naar de beveiligde betaalpagina om je reservering af te ronden.`,
    en: `Dear ${name}, welcome to the world of Akoua Studio ✨\n\nYou're now being redirected to the secure payment page to complete your booking.`,
    fr: `Chère/Cher ${name}, bienvenue dans le monde d'Akoua Studio ✨\n\nVous allez être redirigé(e) directement vers la page de paiement sécurisée pour finaliser votre réservation.`,
    es: `Estimado/a ${name}, bienvenido/a al mundo de Akoua Studio ✨\n\nSerás redirigido/a ahora mismo a la página de pago segura para completar tu reserva.`
  };
  document.getElementById('success-msg').textContent = msgs[currentLang] || msgs.nl;
  document.getElementById('success-overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeSuccess() {
  document.getElementById('success-overlay').classList.remove('active');
  document.body.style.overflow = '';
  // Clear form
  ['form-name','form-email','form-tel','form-date','form-time','form-msg'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.querySelectorAll('.addons-check input[type="checkbox"]').forEach(cb => cb.checked = false);
}

// ── ABONNEMENT MODAL ──
let currentAbo = {};

function openAbo(name, price) {
  currentAbo = { name, price };
  document.getElementById('abo-badge').textContent = name;
  document.getElementById('abo-title').textContent = name;
  document.getElementById('abo-price').textContent = `€${price}`;
  document.getElementById('abo-overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeAbo() {
  document.getElementById('abo-overlay').classList.remove('active');
  document.body.style.overflow = '';
}

async function submitAbo() {
  const name = document.getElementById('abo-name').value.trim();
  const email = document.getElementById('abo-email').value.trim();
  const tel = document.getElementById('abo-tel').value.trim();
  const msg = document.getElementById('abo-msg').value.trim();

  if (!name || !email) {
    alert('Vul naam en email in.');
    return;
  }

  // Save to Supabase
  if (typeof saveToSupabase === 'function') {
    await saveToSupabase({
      name, email,
      phone: tel,
      package: currentAbo.name,
      price: currentAbo.price,
      duration: 'Abonnement',
      date: new Date().toISOString().split('T')[0],
      time: '',
      addons: '',
      message: msg
    });
  }

  // 2. Send email to Akoua (fire in background, never blocks the redirect)
  const subject = encodeURIComponent(`🌟 NIEUW ABONNEMENT — ${currentAbo.name} — Akoua Studio`);
  const body = encodeURIComponent(
    `NIEUW ABONNEMENT — AKOUA STUDIO\n\n` +
    `Abonnement: ${currentAbo.name} — €${currentAbo.price}/maand\n` +
    `Naam: ${name}\n` +
    `Email: ${email}\n` +
    `Tel: ${tel}\n` +
    (msg ? `\nProject/doelen: ${msg}` : '')
  );
  const mailLink = `mailto:akouastudio@gmail.com?subject=${subject}&body=${body}`;
  try {
    const hiddenFrame = document.createElement('iframe');
    hiddenFrame.style.display = 'none';
    hiddenFrame.src = mailLink;
    document.body.appendChild(hiddenFrame);
    setTimeout(() => hiddenFrame.remove(), 3000);
  } catch(e) { console.log('Mail trigger error:', e); }

  // 3. Show success message immediately
  closeAbo();
  showSuccess(name);

  // 4. Redirect to Mollie payment link IMMEDIATELY (same tab, synchronous with the click)
  //    Delayed/new-tab redirects get silently blocked by mobile browsers — this was
  //    very likely causing real subscriptions to be lost without anyone noticing.
  const mollieAbo = {
    'Pro': 'https://payment-links.mollie.com/payment/K3Z8Qakj5qeLFJBdLA28M',
    'Unlimited': 'https://payment-links.mollie.com/payment/JZbKbnCHAnojC253g2MgS',
  };
  const mollieUrl = mollieAbo[currentAbo.name];
  if (mollieUrl) {
    trackEvent('checkout_start', { package: currentAbo.name, price: currentAbo.price });
    window.location.href = mollieUrl;
  }
}

// ── CHATBOT ──
function toggleChat() {
  const box = document.getElementById('chatbot-box');
  const isOpening = !box.classList.contains('open');
  box.classList.toggle('open');
  if (isOpening) trackEvent('ai_open', {});
}

const chatAnswers = {
  nl: {
    tarieven: '🌟 Essential €60 (1u) · Signature €170 (3u) · Full Day €399 (8u) · Pack Créateur €150',
    reserveer: '📅 Klik op "Boeken" in het menu, kies je pakket en vul het formulier in.',
    inbegrepen: '✅ Volledige studiotoegang · Professionele verlichting · Wifi & koffie · Alle 5 zones',
    locatie: '📍 Keulsveld 17, kantoor 4 · 4705 RS Roosendaal · Gratis parkeren voor de deur',
    betaling: '💳 Veilig via Mollie: iDEAL · Kaart · Apple Pay',
    max: '👥 Max 10 personen voor events · 6-7 voor vergaderingen · 1-3 voor foto/video'
  },
  en: {
    tarieven: '🌟 Essential €60 (1h) · Signature €170 (3h) · Full Day €399 (8h) · Pack Créateur €150',
    reserveer: '📅 Click "Book" in the menu, choose your package and fill in the form.',
    inbegrepen: '✅ Full studio access · Professional lighting · Wifi & coffee · All 5 zones',
    locatie: '📍 Keulsveld 17, office 4 · 4705 RS Roosendaal · Free parking at the door',
    betaling: '💳 Secure via Mollie: iDEAL · Card · Apple Pay',
    max: '👥 Max 10 people for events · 6-7 for meetings · 1-3 for photo/video'
  },
  fr: {
    tarieven: '🌟 Essential €60 (1h) · Signature €170 (3h) · Full Day €399 (8h) · Pack Créateur €150',
    reserveer: '📅 Cliquez sur "Réserver" dans le menu, choisissez votre forfait et remplissez le formulaire.',
    inbegrepen: '✅ Accès complet au studio · Éclairage professionnel · Wifi & café · Les 5 zones',
    locatie: '📍 Keulsveld 17, bureau 4 · 4705 RS Roosendaal · Parking gratuit à la porte',
    betaling: '💳 Paiement sécurisé via Mollie: iDEAL · Carte · Apple Pay',
    max: '👥 Max 10 personnes pour événements · 6-7 pour réunions · 1-3 pour photo/vidéo'
  },
  es: {
    tarieven: '🌟 Essential €60 (1h) · Signature €170 (3h) · Full Day €399 (8h) · Pack Créateur €150',
    reserveer: '📅 Haz clic en "Reservar" en el menú, elige tu paquete y rellena el formulario.',
    inbegrepen: '✅ Acceso completo al estudio · Iluminación profesional · Wifi & café · Las 5 zonas',
    locatie: '📍 Keulsveld 17, oficina 4 · 4705 RS Roosendaal · Parking gratuito en la puerta',
    betaling: '💳 Pago seguro via Mollie: iDEAL · Tarjeta · Apple Pay',
    max: '👥 Máx 10 personas para eventos · 6-7 para reuniones · 1-3 para foto/vídeo'
  }
};

function chatAnswer(key) {
  const answers = chatAnswers[currentLang] || chatAnswers.nl;
  const el = document.getElementById('chat-answer');
  el.textContent = answers[key] || '';
  el.classList.add('visible');
  trackEvent('ai_question', { topic: key });
}

// ── CONVERSION FUNNEL TRACKING ──
document.addEventListener('click', (e) => {
  const waLink = e.target.closest('a[href*="wa.me"]');
  if (waLink) trackEvent('whatsapp_click', { page: location.pathname });
  const heroBookBtn = e.target.closest('.hero-btns .btn-gold');
  if (heroBookBtn) trackEvent('hero_book_click', {});
});

const pricingSection = document.getElementById('tarieven');
if (pricingSection && 'IntersectionObserver' in window) {
  let pricingSeen = false;
  const pricingObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !pricingSeen) {
        pricingSeen = true;
        trackEvent('pricing_view', {});
        pricingObserver.disconnect();
      }
    });
  }, { threshold: 0.4 });
  pricingObserver.observe(pricingSection);
}
document.querySelectorAll('.price-card, .book-opt').forEach(card => {
  card.addEventListener('click', () => {
    trackEvent('package_view', { label: card.textContent.trim().slice(0, 40) });
  }, { once: false });
});

// ── SMART BOOKING NUDGE (real engagement signals only, once per session) ──
(function () {
  const nudge = document.getElementById('booking-nudge');
  if (!nudge) return;
  const NUDGE_SESSION_KEY = 'akoua_nudge_shown';
  if (sessionStorage.getItem(NUDGE_SESSION_KEY)) return;

  const nudgeText = document.getElementById('booking-nudge-text');
  const nudgeBtn = document.getElementById('booking-nudge-btn');
  const nudgeClose = document.getElementById('booking-nudge-close');

  const nudgeLabels = {
    nl: { text: 'Heb je gevonden wat je zocht? Bekijk de beschikbaarheid in een paar seconden.', btn: 'Bekijk beschikbaarheid' },
    fr: { text: "Vous avez trouvé ce qu'il vous faut ? Vérifiez les disponibilités en quelques secondes.", btn: 'Voir les disponibilités' },
    en: { text: 'Found what you need? Check availability in a few seconds.', btn: 'View availability' },
    es: { text: '¿Encontraste lo que necesitas? Consulta la disponibilidad en unos segundos.', btn: 'Ver disponibilidad' }
  };

  let galleryNavClicks = 0;
  let shown = false;
  const pageLoadTime = Date.now();
  const MIN_DELAY_MS = 15000;

  function showNudge() {
    if (shown || sessionStorage.getItem(NUDGE_SESSION_KEY)) return;
    const elapsed = Date.now() - pageLoadTime;
    if (elapsed < MIN_DELAY_MS) { setTimeout(showNudge, MIN_DELAY_MS - elapsed); return; }
    shown = true;
    sessionStorage.setItem(NUDGE_SESSION_KEY, '1');
    const lang = (typeof currentLang !== 'undefined' && nudgeLabels[currentLang]) ? currentLang : 'nl';
    nudgeText.textContent = nudgeLabels[lang].text;
    nudgeBtn.textContent = nudgeLabels[lang].btn;
    nudge.classList.add('visible');
    trackEvent('booking_nudge_shown', { lang });
  }

  try {
    if (localStorage.getItem('akoua_welcome_seen_at')) setTimeout(showNudge, MIN_DELAY_MS);
  } catch (e) {}

  const pricingSection = document.getElementById('tarieven');
  if (pricingSection && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) { showNudge(); obs.disconnect(); } });
    }, { threshold: 0.4 });
    obs.observe(pricingSection);
  }

  const chatBtn = document.getElementById('chatbot-btn');
  if (chatBtn) chatBtn.addEventListener('click', () => setTimeout(showNudge, 3000));

  document.addEventListener('click', (e) => {
    if (e.target.closest('.gallery-nav')) {
      galleryNavClicks++;
      if (galleryNavClicks >= 3) showNudge();
    }
  });

  document.querySelectorAll('.price-card, .book-opt, .usage-card').forEach(el => {
    el.addEventListener('click', () => setTimeout(showNudge, 2000));
  });

  if (nudgeClose) nudgeClose.addEventListener('click', () => {
    nudge.classList.remove('visible');
    trackEvent('booking_nudge_dismiss', {});
  });
  if (nudgeBtn) nudgeBtn.addEventListener('click', () => {
    nudge.classList.remove('visible');
    trackEvent('booking_nudge_click', {});
  });
})();

// ── SMOOTH SCROLL ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href.length < 2) return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── ACTIVE NAV ON SCROLL ──
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY + 100;
  sections.forEach(sec => {
    const top = sec.offsetTop;
    const h = sec.offsetHeight;
    const id = sec.getAttribute('id');
    const link = document.querySelector(`.nav-links a[href="#${id}"]`);
    if (link) {
      link.style.color = scrollY >= top && scrollY < top + h
        ? 'var(--gold)' : '';
    }
  });
}, { passive: true });
