const TOTAL_FRAMES = 96;
const frameCache = [];
const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');
const loadingScreen = document.getElementById('loading-screen');
const navbar = document.getElementById('navbar');
const textBlocks = document.querySelectorAll('.text-block');

// Frame Paths (Assuming we use 1 to 150)
const getFramePath = (index) => {
  const paddedIndex = index.toString().padStart(4, '0');
  return `frames/frame_${paddedIndex}.jpg`;
};

// Canvas Setup
canvas.width = 1280;
canvas.height = 2274;

let currentFrame = -1;
let loadedFrames = 0;
let isFirstBatchLoaded = false;

// Render function
function renderFrame(index) {
  if (index === currentFrame) return;
  const img = frameCache[index];
  if (img && img.complete) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
    const x = (canvas.width / 2) - (img.width / 2) * scale;
    const y = (canvas.height / 2) - (img.height / 2) * scale;
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    currentFrame = index;
  }
}

// Text animation logic
function updateTextBlocks(frameIndex) {
  textBlocks.forEach(block => {
    const start = parseInt(block.dataset.frameStart);
    const end = parseInt(block.dataset.frameEnd);
    
    if (frameIndex < start) {
      block.style.opacity = 0;
      block.style.transform = `translateY(30px)`;
    } else if (frameIndex > end) {
      block.style.opacity = 0;
      block.style.transform = `translateY(-30px)`;
    } else {
      const midpoint = start + (end - start) / 2;
      let ratio = 0;
      let transformY = 0;

      if (frameIndex <= midpoint) {
        ratio = (frameIndex - start) / (midpoint - start);
        transformY = 30 * (1 - ratio);
      } else {
        ratio = 1 - ((frameIndex - midpoint) / (end - midpoint));
        transformY = -30 * (1 - ratio);
      }

      block.style.opacity = ratio;
      if (block.classList.contains('mob-center')) {
        block.style.transform = `translateY(calc(-50% + ${transformY}px))`;
      } else {
        block.style.transform = `translateY(${transformY}px)`;
      }
    }
  });
}

// Scroll Handler
function handleScroll() {
  const scrollTop = window.scrollY;
  // Calculate progress based only on the scroll driver height (600vh)
  const maxScroll = window.innerHeight * 6;
  const progress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
  
  const frameIndex = Math.floor(progress * (TOTAL_FRAMES - 1)) + 1;
  
  requestAnimationFrame(() => {
    renderFrame(frameIndex);
    updateTextBlocks(frameIndex);
  });

  if (scrollTop > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

// Preloader
function preloadFrames() {
  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    const img = new Image();
    img.src = getFramePath(i);
    img.onload = () => {
      loadedFrames++;

      if (loadedFrames >= 30 && !isFirstBatchLoaded) {
        isFirstBatchLoaded = true;
        loadingScreen.style.opacity = 0;
        setTimeout(() => {
          loadingScreen.style.display = 'none';
        }, 800);
        
        renderFrame(1);
        updateTextBlocks(1);
      }
    };
    frameCache[i] = img;
  }
}

// ==========================================================================
// REMAINING 70% LOGIC
// ==========================================================================

// 1. Hamburger Drawer
const hamburgerBtn = document.getElementById('hamburger-btn');
const drawerClose = document.getElementById('drawer-close');
const navDrawer = document.getElementById('nav-drawer');
const drawerOverlay = document.getElementById('drawer-overlay');

function openDrawer() {
  navDrawer.classList.add('open');
  drawerOverlay.classList.add('visible');
  document.body.style.overflow = 'hidden';
}
function closeDrawer() {
  navDrawer.classList.remove('open');
  drawerOverlay.classList.remove('visible');
  document.body.style.overflow = '';
}

hamburgerBtn.addEventListener('click', openDrawer);
drawerClose.addEventListener('click', closeDrawer);
drawerOverlay.addEventListener('click', closeDrawer);

// 2. USP Section Animation
const uspObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);
      uspObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.usp-card').forEach(c => uspObserver.observe(c));

// 3. Products Grid & Wishlist
const products = [
  { id:1, name:"Bouquet Keychain",  price:899, rating:4.2, img:"assets/p1.jpg" },
  { id:2, name:"Tulip Charm",       price:749, rating:5.0, img:"assets/p2.jpg" },
  { id:3, name:"Daisy Bundle",      price:649, rating:4.5, img:"assets/p3.jpg" },
  { id:4, name:"Rose Wrap",         price:599, rating:3.2, img:"assets/p4.jpg" },
];

function renderStars(rating) {
  let stars = '';
  const full = Math.floor(rating);
  for(let i=0; i<5; i++) {
    if (i < full) stars += '★';
    else stars += '☆';
  }
  return stars;
}

function toggleWishlist(id) {
  let saved = JSON.parse(localStorage.getItem('wishlist') || '[]');
  if (saved.includes(id)) {
    saved = saved.filter(item => item !== id);
  } else {
    saved.push(id);
  }
  localStorage.setItem('wishlist', JSON.stringify(saved));
}

function renderProducts() {
  const grid = document.getElementById('product-grid');
  if(!grid) return;
  grid.innerHTML = products.map(p => `
    <div class="product-card" data-id="${p.id}">
      <div class="card-img-wrap">
        <img src="${p.img}" alt="${p.name}" loading="lazy">
        <button class="wishlist-btn" data-id="${p.id}" aria-label="Wishlist">
          <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        </button>
      </div>
      <div class="card-info">
        <div class="stars">${renderStars(p.rating)}</div>
        <p class="card-name">${p.name}</p>
        <p class="card-price">₹ ${p.price}</p>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    const id = parseInt(btn.dataset.id);
    const saved = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (saved.includes(id)) btn.classList.add('wishlisted');
    
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      btn.classList.toggle('wishlisted');
      toggleWishlist(id);
      btn.animate([
        {transform:'scale(1)'},
        {transform:'scale(1.4)'},
        {transform:'scale(1)'}
      ], {duration:300, easing:'ease'});
    });
  });
}

// 4. Newsletter
const newsletterForm = document.getElementById('newsletter-form');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = newsletterForm.querySelector('button');
    const input = newsletterForm.querySelector('input');
    btn.textContent = 'Subscribed! ✅';
    btn.style.background = 'var(--sage)';
    input.value = '';
    setTimeout(() => {
      btn.textContent = 'Subscribe →';
      btn.style.background = 'var(--gold)';
    }, 3000);
  });
}

// 5. Bottom Nav Active State
const bnItems = document.querySelectorAll('.bn-item');
bnItems.forEach(item => {
  item.addEventListener('click', () => {
    bnItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
  });
});


// Init
window.addEventListener('scroll', handleScroll, { passive: true });
window.addEventListener('resize', handleScroll);
preloadFrames();
renderProducts();
