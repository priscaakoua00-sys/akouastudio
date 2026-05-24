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

  // 2. Send email to Akoua
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
  // Send email notification
  const mailLink = `mailto:akouastudio@gmail.com?subject=${subject}&body=${body}`;
  const mailWindow = window.open(mailLink, '_blank');
  if (!mailWindow) window.location.href = mailLink;

  // 2. Redirect to Mollie payment link
  const mollieUrl = mollieLinks[currentPackage.name];
  setTimeout(() => {
    if (mollieUrl) {
      window.open(mollieUrl, '_blank');
    }
  }, 1500);

  // 3. Show success message
  closeBooking();
  showSuccess(name);
}

function showSuccess(name) {
  const t = translations[currentLang];
  const msgs = {
    nl: `Beste ${name}, welkom in de wereld van Akoua Studio ✨\n\nJouw reserveringsaanvraag is verzonden via WhatsApp. Wij bevestigen zo snel mogelijk en kijken ernaar uit jou te verwelkomen.`,
    en: `Dear ${name}, welcome to the world of Akoua Studio ✨\n\nYour booking request has been sent via WhatsApp. We will confirm as soon as possible and look forward to welcoming you.`,
    fr: `Chère/Cher ${name}, bienvenue dans le monde d'Akoua Studio ✨\n\nVotre demande de réservation a été envoyée via WhatsApp. Nous confirmerons dès que possible et avons hâte de vous accueillir.`,
    es: `Estimado/a ${name}, bienvenido/a al mundo de Akoua Studio ✨\n\nTu solicitud de reserva ha sido enviada por WhatsApp. Confirmaremos lo antes posible y esperamos darte la bienvenida.`
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

  // Send email to Akoua
  const subject = encodeURIComponent(`🌟 NIEUW ABONNEMENT — ${currentAbo.name} — Akoua Studio`);
  const body = encodeURIComponent(
    `NIEUW ABONNEMENT — AKOUA STUDIO\n\n` +
    `Abonnement: ${currentAbo.name} — €${currentAbo.price}/maand\n` +
    `Naam: ${name}\n` +
    `Email: ${email}\n` +
    `Tel: ${tel}\n` +
    (msg ? `\nProject/doelen: ${msg}` : '')
  );
  // Send email notification
  const mailLink = `mailto:akouastudio@gmail.com?subject=${subject}&body=${body}`;
  const mailWindow = window.open(mailLink, '_blank');
  if (!mailWindow) window.location.href = mailLink;

  // Redirect to Mollie
  const mollieAbo = {
    'Pro': 'https://payment-links.mollie.com/payment/K3Z8Qakj5qeLFJBdLA28M',
    'Unlimited': 'https://payment-links.mollie.com/payment/JZbKbnCHAnojC253g2MgS',
  };
  setTimeout(() => {
    if (mollieAbo[currentAbo.name]) {
      window.open(mollieAbo[currentAbo.name], '_blank');
    }
  }, 1500);

  closeAbo();
  showSuccess(name);
}

// ── CHATBOT ──
function toggleChat() {
  document.getElementById('chatbot-box').classList.toggle('open');
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
}

// ── SMOOTH SCROLL ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
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
