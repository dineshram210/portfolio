// Utility: clamp
const clamp = (min, val, max) => Math.max(min, Math.min(val, max));

document.addEventListener('DOMContentLoaded', () => {
  // Current year
  document.getElementById('year').textContent = new Date().getFullYear();

  // Mobile nav + header height var for anchor offset
  const header = document.querySelector('.glass-nav');
  const menuBtn = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');

  function updateHeaderHeight() {
    const h = header?.offsetHeight || 68;
    document.documentElement.style.setProperty('--headerH', h + 'px');
  }
  updateHeaderHeight();
  window.addEventListener('resize', updateHeaderHeight);

  menuBtn?.addEventListener('click', () => header.classList.toggle('open'));
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => header.classList.remove('open')));

  // Active nav link on scroll
  const links = document.querySelectorAll('.nav-link');
  const sections = [...document.querySelectorAll('section.section')];
  const setActive = () => {
    const fromTop = window.scrollY + (header?.offsetHeight || 0) + 40;
    let current = sections[0]?.id;
    for (const sec of sections) {
      if (sec.offsetTop <= fromTop) current = sec.id;
    }
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${current}`));
  };
  setActive();
  document.addEventListener('scroll', setActive);

  // Reveal on scroll
  const reveals = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view'); });
  }, { threshold: 0.12 });
  reveals.forEach(r => io.observe(r));

  // Animate skill bars when visible
  const skillBars = document.querySelectorAll('.skill-bar');
  const skillIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const fill = e.target.querySelector('.fill');
        const val = Number(e.target.dataset.value || 0);
        fill.style.width = `${clamp(0, val, 100)}%`;
        skillIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  skillBars.forEach(b => skillIO.observe(b));

  // Back to top
  const toTop = document.querySelector('.to-top');
  const toggleTop = () => {
    if (window.scrollY > 400) toTop.classList.add('show');
    else toTop.classList.remove('show');
  };
  toggleTop();
  window.addEventListener('scroll', toggleTop);
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Card tilt
  const tiltCards = document.querySelectorAll('[data-tilt]');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  tiltCards.forEach(card => {
    if (prefersReduced) return;
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const rx = (0.5 - y) * 8; // rotate up/down
      const ry = (x - 0.5) * 8; // rotate left/right
      card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'rotateX(0) rotateY(0)';
    });
  });

  // Particles background (geometric nodes)
  initParticles();
});

// Particles
function initParticles() {
  const canvas = document.getElementById('bg');
  const ctx = canvas.getContext('2d', { alpha: true });
  let w, h, dpr, nodes, rafId;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    w = canvas.width = Math.floor(window.innerWidth * dpr);
    h = canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    createNodes();
  }

  function createNodes() {
    const base = prefersReduced ? 35 : 70;
    const density = (w * h) / (1920 * 1080);
    const count = Math.round(base * density);
    nodes = new Array(count).fill(0).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.15 * dpr,
      vy: (Math.random() - 0.5) * 0.15 * dpr,
      r: (Math.random() * 1.2 + 0.6) * dpr,
    }));
  }

  function step() {
    ctx.clearRect(0, 0, w, h);

    // glow style
    const grad1 = ctx.createLinearGradient(0, 0, w, h);
    grad1.addColorStop(0, 'rgba(0,229,255,0.9)');
    grad1.addColorStop(0.5, 'rgba(124,77,255,0.9)');
    grad1.addColorStop(1, 'rgba(0,209,255,0.9)');

    // update nodes
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      n.x += n.vx; n.y += n.vy;

      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
    }

    // draw connections
    const maxDist = Math.min(w, h) * 0.08;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < maxDist) {
          const alpha = 1 - dist / maxDist;
          ctx.strokeStyle = `rgba(0,229,255,${0.15 * alpha})`;
          ctx.lineWidth = dpr * 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // draw nodes
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      ctx.beginPath();
      ctx.fillStyle = grad1;
      ctx.shadowColor = 'rgba(0,229,255,0.35)';
      ctx.shadowBlur = 10 * dpr;
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    rafId = requestAnimationFrame(step);
  }

  window.addEventListener('resize', () => {
    cancelAnimationFrame(rafId);
    resize();
    step();
  });

  resize();
  step();

  
  
}