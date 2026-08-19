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
  document.body.style.overflow = isOpening ? 'hidden' : '';
  if (isOpening) trackEvent('ai_open', {});
}

function toggleMoreQuestions() {
  const more = document.getElementById('chat-btns-more');
  const btn = document.getElementById('chat-more-btn');
  const isVisible = more.classList.toggle('visible');
  const labels = {
    nl: { more: 'Meer vragen ▾', less: 'Minder vragen ▴' },
    fr: { more: 'Plus de questions ▾', less: 'Moins de questions ▴' },
    en: { more: 'More questions ▾', less: 'Fewer questions ▴' },
    es: { more: 'Más preguntas ▾', less: 'Menos preguntas ▴' }
  };
  const lang = (typeof currentLang !== 'undefined' && labels[currentLang]) ? currentLang : 'nl';
  btn.textContent = isVisible ? labels[lang].less : labels[lang].more;
}

const chatAnswers = {
  nl: {
    gebruik: "Heel veel eigenlijk. De studio is een flexibele ruimte met 5 zones, helemaal van jou zodra je reserveert: je kunt er werken, klanten ontvangen, foto's en video's maken, een podcast opnemen, of een meeting of kleine workshop houden. Geen gedeelde ruimte, dus je gebruikt het helemaal naar eigen inzicht.",
    keuze: 'Dat hangt vooral af van hoeveel tijd je nodig hebt. Voor een korte sessie van een uur is Essential (€60) ideaal. Heb je wat meer tijd nodig, bijvoorbeeld voor een fotoshoot of een langere opname, dan is Signature (€170, 3 uur) de populairste keuze. Voor een volledige dag is er Full Day (€399, 8 uur), inclusief lunch en snacks. En als je vooral content wilt maken voor social media, is het Pack Créateur (€150) speciaal daarvoor gemaakt. Vertel gerust wat je precies wilt doen, dan denk ik met je mee.',
    klant: 'Ja, natuurlijk. Zodra je reserveert, is de studio helemaal van jou, exclusief voor jouw boeking, geen gedeelde ruimte en geen wachtrij. Je kunt je klant dus in alle rust en professionaliteit ontvangen, zonder dat er iemand anders aanwezig is.',
    podcast: 'Zeker, de studio heeft een aparte Content Zone die speciaal is ingericht voor podcasts en video content, inclusief verticale opstelling voor TikTok, Reels en YouTube. Alle pakketten geven toegang tot deze zone.',
    fotovideo: "Ja, dat is zelfs een van de dingen waar de studio het meest voor gebruikt wordt. Er is een aparte Studio Photo & Video zone met verwisselbare achtergronden, ring light en softboxes, alles staat klaar. Als je vooral content voor social media wilt maken, is het Pack Créateur (€150) daar specifiek op gericht.",
    personen: 'De studio biedt plaats aan maximaal 15 personen. Of je nu alleen komt werken of met een groep voor een meeting of workshop, de ruimte past zich aan jouw aantal aan.',
    inbegrepen: 'Bij elk pakket krijg je volledige toegang tot de studio, professionele verlichting, wifi en koffie, en alle 5 zones. Bij Signature komt daar de VIP lounge bij, en bij Full Day ook nog koffie, thee, water, snacks en een lunch sandwich, zodat je de hele dag niets tekort komt.',
    bezichtiging: 'Absoluut, dat kan zelfs gratis. Stuur ons een berichtje via WhatsApp om een vrijblijvende bezichtiging in te plannen, dan zie je de ruimte zelf voordat je iets boekt.',
    parkeren: 'Parkeren is gratis en vlak voor de deur, op Keulsveld 17 in Roosendaal. Je hoeft je daar dus geen zorgen over te maken.',
    snelheid: 'Heel snel. Kies gewoon het pakket dat bij je past, vul je gegevens en gewenste datum in, en je reservering staat direct vast na betaling. Meestal ben je in minder dan twee minuten klaar.',
    tarieven: 'Onze tarieven zijn Essential €60 voor 1 uur, Signature €170 voor 3 uur, Full Day €399 voor een hele dag, en het Pack Créateur voor €150 als je vooral content wilt maken. Alle prijzen zijn inclusief btw.',
    betaling: 'Betalen gaat volledig veilig via Mollie, met iDEAL, kaart of Apple Pay. Je rondt je reservering meteen af na het invullen van het formulier.'
  },
  fr: {
    gebruik: "Beaucoup de choses en réalité. C'est un espace flexible avec 5 zones, entièrement à vous dès que vous réservez : vous pouvez y travailler, recevoir des clients, faire des photos ou des vidéos, enregistrer un podcast, ou organiser une réunion ou un petit atelier. Aucun espace partagé, vous l'utilisez exactement comme vous le souhaitez.",
    keuze: "Cela dépend surtout du temps dont vous avez besoin. Pour une courte session d'une heure, Essential (60€) est idéal. Si vous avez besoin d'un peu plus de temps, par exemple pour une séance photo ou un enregistrement plus long, Signature (170€, 3 heures) est le choix le plus populaire. Pour une journée complète, il y a Full Day (399€, 8 heures), déjeuner et collations inclus. Et si vous voulez surtout créer du contenu pour les réseaux sociaux, le Pack Créateur (150€) est fait pour ça. N'hésitez pas à me dire ce que vous voulez faire exactement, je peux vous orienter.",
    klant: "Oui, bien sûr. Dès que vous réservez, le studio est entièrement à vous, réservé exclusivement pour vous, il n'y a pas d'espace partagé ni d'attente. Vous pouvez donc recevoir votre client en toute tranquillité et professionnalisme, sans personne d'autre présent.",
    podcast: 'Tout à fait, le studio a une Content Zone dédiée, spécialement aménagée pour les podcasts et le contenu vidéo, avec une configuration verticale pour TikTok, Reels et YouTube. Tous les forfaits donnent accès à cette zone.',
    fotovideo: "Oui, c'est même l'un des usages les plus fréquents. Il y a une zone Studio Photo & Vidéo dédiée avec des fonds interchangeables, une ring light et des softboxes, tout est prêt à l'emploi. Si vous voulez surtout créer du contenu pour les réseaux sociaux, le Pack Créateur (150€) est pensé exactement pour ça.",
    personen: "Le studio accueille jusqu'à 15 personnes. Que vous veniez seul(e) pour travailler ou en groupe pour une réunion ou un atelier, l'espace s'adapte à votre nombre.",
    inbegrepen: "Chaque forfait inclut l'accès complet au studio, un éclairage professionnel, le wifi et le café, ainsi que les 5 zones. Avec Signature, la lounge VIP est incluse en plus, et avec Full Day, vous avez aussi café, thé, eau, collations et un sandwich pour le déjeuner, pour ne manquer de rien de la journée.",
    bezichtiging: "Bien sûr, et c'est même gratuit. Envoyez-nous un message WhatsApp pour planifier une visite sans engagement, vous verrez l'espace par vous-même avant de réserver quoi que ce soit.",
    parkeren: "Le parking est gratuit et juste devant la porte, au Keulsveld 17 à Roosendaal. Vous n'avez donc pas à vous en soucier.",
    snelheid: "Très rapidement. Choisissez simplement le forfait qui vous convient, indiquez vos coordonnées et la date souhaitée, et votre réservation est confirmée directement après le paiement. En général, ça prend moins de deux minutes.",
    tarieven: "Nos tarifs sont Essential 60€ pour 1 heure, Signature 170€ pour 3 heures, Full Day 399€ pour une journée complète, et le Pack Créateur à 150€ si vous voulez surtout créer du contenu. Tous les prix sont TTC.",
    betaling: "Le paiement se fait de manière entièrement sécurisée via Mollie, par iDEAL, carte ou Apple Pay. Votre réservation est confirmée immédiatement après avoir rempli le formulaire."
  },
  en: {
    gebruik: "Quite a lot, really. It's a flexible space with 5 zones, entirely yours once you book: you can work, meet clients, take photos or shoot video, record a podcast, or hold a meeting or small workshop there. No shared space, so you can use it exactly the way you want.",
    keuze: "That mostly depends on how much time you need. For a short one-hour session, Essential (€60) is perfect. If you need a bit more time, for a photoshoot or a longer recording, Signature (€170, 3 hours) is the most popular choice. For a full day, there's Full Day (€399, 8 hours), lunch and snacks included. And if you mainly want to create social media content, the Pack Créateur (€150) is made exactly for that. Feel free to tell me what you're planning, I can help you figure out what fits.",
    klant: "Yes, absolutely. Once you book, the studio is entirely yours for your session, there's no shared space and no waiting around. You can meet your client with complete peace of mind and professionalism, with no one else around.",
    podcast: 'Definitely, the studio has a dedicated Content Zone set up specifically for podcasts and video content, with a vertical setup for TikTok, Reels and YouTube. Every package includes access to this zone.',
    fotovideo: "Yes, it's actually one of the most common uses. There's a dedicated Studio Photo & Video zone with interchangeable backgrounds, a ring light and softboxes, everything is ready to go. If you're mainly creating content for social media, the Pack Créateur (€150) is built exactly for that.",
    personen: "The studio fits up to 15 people. Whether you're coming alone to work or with a group for a meeting or workshop, the space adapts to your numbers.",
    inbegrepen: "Every package includes full studio access, professional lighting, wifi and coffee, and all 5 zones. Signature also includes the VIP lounge, and Full Day adds coffee, tea, water, snacks and a lunch sandwich, so you're covered for the whole day.",
    bezichtiging: "Of course, and it's free. Send us a message on WhatsApp to plan a no-obligation visit, so you can see the space for yourself before booking anything.",
    parkeren: "Parking is free and right outside the door, at Keulsveld 17 in Roosendaal. So that's one less thing to worry about.",
    snelheid: "Very fast. Just pick the package that suits you, fill in your details and preferred date, and your booking is confirmed right after payment. It usually takes less than two minutes.",
    tarieven: "Our rates are Essential €60 for 1 hour, Signature €170 for 3 hours, Full Day €399 for a full day, and the Pack Créateur at €150 if you're mainly creating content. All prices include VAT.",
    betaling: "Payment is fully secure through Mollie, via iDEAL, card or Apple Pay. Your booking is confirmed immediately after filling in the form."
  },
  es: {
    gebruik: "Bastantes cosas, la verdad. Es un espacio flexible con 5 zonas, totalmente tuyo en cuanto reservas: puedes trabajar, recibir clientes, hacer fotos o grabar vídeo, grabar un podcast, o hacer una reunión o un pequeño taller. Sin espacio compartido, lo usas exactamente como quieras.",
    keuze: 'Depende sobre todo del tiempo que necesites. Para una sesión corta de una hora, Essential (60€) es perfecto. Si necesitas un poco más de tiempo, por ejemplo para una sesión de fotos o una grabación más larga, Signature (170€, 3 horas) es la opción más popular. Para un día completo está Full Day (399€, 8 horas), con almuerzo y snacks incluidos. Y si sobre todo quieres crear contenido para redes sociales, el Pack Créateur (150€) está pensado exactamente para eso. Cuéntame qué tienes en mente y te ayudo a elegir.',
    klant: 'Sí, por supuesto. En cuanto reservas, el estudio es completamente tuyo para tu reserva, no hay espacio compartido ni esperas. Puedes recibir a tu cliente con total tranquilidad y profesionalidad, sin nadie más presente.',
    podcast: 'Claro que sí, el estudio tiene una Content Zone dedicada, preparada especialmente para podcasts y contenido en vídeo, con una configuración vertical para TikTok, Reels y YouTube. Todos los paquetes incluyen acceso a esta zona.',
    fotovideo: 'Sí, de hecho es uno de los usos más frecuentes. Hay una zona Studio Photo & Vídeo dedicada con fondos intercambiables, ring light y softboxes, todo listo para usar. Si sobre todo quieres crear contenido para redes sociales, el Pack Créateur (150€) está pensado exactamente para eso.',
    personen: 'El estudio tiene capacidad para hasta 15 personas. Ya vengas solo/a para trabajar o en grupo para una reunión o taller, el espacio se adapta a vuestro número.',
    inbegrepen: 'Cada paquete incluye acceso completo al estudio, iluminación profesional, wifi y café, y las 5 zonas. Con Signature además tienes la lounge VIP, y con Full Day también café, té, agua, snacks y un sándwich para el almuerzo, para que no te falte nada en todo el día.',
    bezichtiging: 'Claro, y además es gratis. Escríbenos por WhatsApp para planear una visita sin compromiso, así ves el espacio tú mismo/a antes de reservar nada.',
    parkeren: 'El parking es gratuito y está justo en la puerta, en Keulsveld 17, Roosendaal. Así que no tienes que preocuparte por eso.',
    snelheid: 'Muy rápido. Solo elige el paquete que te convenga, rellena tus datos y la fecha que prefieras, y tu reserva queda confirmada justo después del pago. Normalmente tarda menos de dos minutos.',
    tarieven: 'Nuestras tarifas son Essential 60€ por 1 hora, Signature 170€ por 3 horas, Full Day 399€ por un día completo, y el Pack Créateur a 150€ si sobre todo quieres crear contenido. Todos los precios incluyen IVA.',
    betaling: 'El pago es totalmente seguro a través de Mollie, con iDEAL, tarjeta o Apple Pay. Tu reserva queda confirmada justo después de rellenar el formulario.'
  }
};

function chatAnswer(key) {
  const answers = chatAnswers[currentLang] || chatAnswers.nl;
  const el = document.getElementById('chat-answer');
  el.textContent = answers[key] || '';
  el.classList.add('visible');
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  trackEvent('ai_question', { topic: key });
}

const chatKeywords = {
  nl: {
    gebruik: ['wat kan', 'gebruik', 'mogelijk', 'doen in'],
    keuze: ['welke', 'wat past', 'beste voor', 'kies', 'aanraden'],
    klant: ['klant', 'cliënt'],
    podcast: ['podcast'],
    fotovideo: ['foto', 'video', 'shoot', 'opname maken'],
    personen: ['personen', 'mensen', 'hoeveel zijn', 'capaciteit', 'groep'],
    inbegrepen: ['inbegrepen', 'inclusief', 'krijg ik'],
    bezichtiging: ['bezichtig', 'komen kijken', 'bezoek', 'rondleid'],
    parkeren: ['park'],
    snelheid: ['hoe snel', 'hoe lang duurt', 'wanneer kan'],
    tarieven: ['tarie', 'prijs', 'kost', 'euro', '€'],
    betaling: ['betal', 'mollie', 'ideal', 'kaart', 'apple pay']
  },
  fr: {
    gebruik: ['que puis', 'faire dans', 'possible', 'utiliser'],
    keuze: ['quelle formule', 'quel forfait', 'me convient', 'conseil', 'recommand'],
    klant: ['client'],
    podcast: ['podcast'],
    fotovideo: ['photo', 'vidéo', 'shooting', 'tournage'],
    personen: ['personnes', 'combien', 'capacité', 'groupe'],
    inbegrepen: ['inclus', 'compris'],
    bezichtiging: ['visite', 'venir voir', 'visiter'],
    parkeren: ['parking', 'garer', 'se garer'],
    snelheid: ['combien de temps', 'rapide', 'quand'],
    tarieven: ['tarif', 'prix', 'coût', 'euro', '€'],
    betaling: ['paiement', 'payer', 'mollie', 'ideal', 'carte']
  },
  en: {
    gebruik: ['what can i', 'can i do', 'possible', 'use the studio'],
    keuze: ['which package', 'which option', 'best for', 'recommend', 'suits me'],
    klant: ['client'],
    podcast: ['podcast'],
    fotovideo: ['photo', 'video', 'shoot', 'shooting'],
    personen: ['people', 'how many', 'capacity', 'group'],
    inbegrepen: ['included', 'include', 'do i get'],
    bezichtiging: ['visit', 'take a look', 'come see', 'tour'],
    parkeren: ['park'],
    snelheid: ['how fast', 'how long', 'how quickly', 'when can'],
    tarieven: ['rate', 'price', 'cost', 'euro', '€'],
    betaling: ['payment', 'pay', 'mollie', 'ideal', 'card']
  },
  es: {
    gebruik: ['qué puedo', 'hacer en', 'posible', 'usar el estudio'],
    keuze: ['qué opción', 'qué paquete', 'mejor para', 'recomien', 'conviene'],
    klant: ['cliente'],
    podcast: ['podcast'],
    fotovideo: ['foto', 'vídeo', 'video', 'sesión'],
    personen: ['personas', 'cuántas', 'capacidad', 'grupo'],
    inbegrepen: ['incluye', 'incluido'],
    bezichtiging: ['visita', 'venir a ver', 'visitar'],
    parkeren: ['aparcar', 'parking'],
    snelheid: ['qué tan rápido', 'cuánto tarda', 'cuándo puedo'],
    tarieven: ['tarifa', 'precio', 'coste', 'euro', '€'],
    betaling: ['pago', 'pagar', 'mollie', 'ideal', 'tarjeta']
  }
};

const chatFallback = {
  nl: 'Goede vraag! Dat kan ik nu nog niet automatisch beantwoorden, maar stuur het gerust via WhatsApp, dan helpt Prisca je persoonlijk verder.',
  fr: "Bonne question ! Je ne peux pas encore y répondre automatiquement, mais envoyez-la simplement via WhatsApp, Prisca vous aidera personnellement.",
  en: "Good question! I can't answer that automatically yet, but feel free to send it via WhatsApp, Prisca will help you personally.",
  es: '¡Buena pregunta! Todavía no puedo responder eso automáticamente, pero envíala por WhatsApp, Prisca te ayudará personalmente.'
};

function submitFreeText() {
  const input = document.getElementById('chat-freetext');
  const raw = input.value.trim();
  if (!raw) return;
  const text = raw.toLowerCase();
  const lang = (typeof currentLang !== 'undefined' && chatKeywords[currentLang]) ? currentLang : 'nl';
  const kw = chatKeywords[lang];
  let matchedKey = null;
  for (const key in kw) {
    if (kw[key].some(k => text.includes(k))) { matchedKey = key; break; }
  }
  input.value = '';
  if (matchedKey) {
    chatAnswer(matchedKey);
  } else {
    trackEvent('ai_question', { topic: 'unmatched' });
    const el = document.getElementById('chat-answer');
    const waUrl = 'https://wa.me/31627374813?text=' + encodeURIComponent(raw);
    el.innerHTML = (chatFallback[lang] || chatFallback.nl) + ' <a href="' + waUrl + '" target="_blank" class="chat-wa-link">WhatsApp →</a>';
    el.classList.add('visible');
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}
const freeTextInput = document.getElementById('chat-freetext');
if (freeTextInput) {
  freeTextInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitFreeText(); });
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
