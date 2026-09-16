/**
 * THE BLINDS WORKSHOP LTD — HULL & EAST YORKSHIRE
 * Interactive Web Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initEstimator();
  initLightSimulator();
  initProductFilter();
  initCoverageChecker();
  initBookingModal();
  initTradeForm();
});

/* ==========================================================================
   1. Navigation & Mobile Drawer
   ========================================================================== */
function initNavigation() {
  const header = document.querySelector('.site-header');
  const toggleBtn = document.querySelector('.mobile-menu-toggle');
  const drawer = document.querySelector('.mobile-nav-drawer');
  const navLinks = document.querySelectorAll('.mobile-nav-link');

  // Sticky header scroll elevation
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (toggleBtn && drawer) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = drawer.classList.contains('open');
      if (isOpen) {
        drawer.classList.remove('open');
        toggleBtn.classList.remove('active');
        document.body.style.overflow = '';
      } else {
        drawer.classList.add('open');
        toggleBtn.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('open');
        toggleBtn.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }
}

/* ==========================================================================
   2. Interactive Window Blinds & Shutters Price Estimator
   ========================================================================== */
function initEstimator() {
  const roomBtns = document.querySelectorAll('[data-calc-room]');
  const styleBtns = document.querySelectorAll('[data-calc-style]');
  const widthSlider = document.getElementById('calc-width');
  const dropSlider = document.getElementById('calc-drop');
  const widthValDisplay = document.getElementById('calc-width-val');
  const dropValDisplay = document.getElementById('calc-drop-val');
  const addonBlackout = document.getElementById('addon-blackout');
  const addonMotorised = document.getElementById('addon-motorised');
  const addonThermal = document.getElementById('addon-thermal');

  // Summary display fields
  const summaryRoom = document.getElementById('summary-room');
  const summaryStyle = document.getElementById('summary-style');
  const summaryDims = document.getElementById('summary-dims');
  const summaryOptions = document.getElementById('summary-options');
  const priceDisplay = document.getElementById('summary-price-display');
  const bookEstimateBtn = document.getElementById('btn-book-with-estimate');

  let currentRoom = 'Living Room';
  let currentStyle = 'Roller Blinds';
  let styleBaseSqM = 55; // Base price per square meter
  let widthCm = parseInt(widthSlider?.value || 120, 10);
  let dropCm = parseInt(dropSlider?.value || 140, 10);

  // Style pricing lookup (guide prices based on Hull market research)
  const styleRates = {
    'Roller Blinds': { rate: 58, name: 'Made-to-Measure Roller Blinds' },
    'Plantation Shutters': { rate: 195, name: 'Sandringham Plantation Shutters' },
    'Wooden Venetian': { rate: 95, name: 'Real Basswood Venetian Blinds' },
    'Perfect Fit': { rate: 82, name: 'Drill-Free Perfect Fit Blinds' },
    'Roman Blinds': { rate: 110, name: 'Hand-Tailored Roman Blinds' },
    'Vertical Blinds': { rate: 48, name: 'Bespoke Vertical Blinds' }
  };

  // Room buttons selection
  roomBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      roomBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentRoom = btn.getAttribute('data-calc-room');
      updateCalculation();
    });
  });

  // Style buttons selection
  styleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      styleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const styleKey = btn.getAttribute('data-calc-style');
      if (styleRates[styleKey]) {
        currentStyle = styleKey;
        styleBaseSqM = styleRates[styleKey].rate;
      }
      updateCalculation();
    });
  });

  // Dimension sliders
  if (widthSlider && widthValDisplay) {
    widthSlider.addEventListener('input', (e) => {
      widthCm = parseInt(e.target.value, 10);
      widthValDisplay.textContent = `${widthCm} cm`;
      updateCalculation();
    });
  }

  if (dropSlider && dropValDisplay) {
    dropSlider.addEventListener('input', (e) => {
      dropCm = parseInt(e.target.value, 10);
      dropValDisplay.textContent = `${dropCm} cm`;
      updateCalculation();
    });
  }

  // Addon Checkboxes
  [addonBlackout, addonMotorised, addonThermal].forEach(box => {
    if (box) {
      box.addEventListener('change', updateCalculation);
    }
  });

  function updateCalculation() {
    // Area in square meters (minimum billable area 0.8 sqm)
    const areaSqM = Math.max(0.8, (widthCm / 100) * (dropCm / 100));
    
    // Core manufacturing cost
    let calculatedBase = areaSqM * styleBaseSqM;

    // Room context multiplier (Bay windows require bespoke angle joints)
    if (currentRoom.includes('Bay')) {
      calculatedBase *= 1.35;
    }

    // Addons
    const activeAddons = [];
    if (addonBlackout && addonBlackout.checked) {
      calculatedBase += 22;
      activeAddons.push('Blackout Lining');
    }
    if (addonThermal && addonThermal.checked) {
      calculatedBase += 18;
      activeAddons.push('Thermal Energy-Saver');
    }
    if (addonMotorised && addonMotorised.checked) {
      calculatedBase += 85;
      activeAddons.push('Smart Motorisation (Remote)');
    }

    // Produce realistic estimate band
    const lowEst = Math.round(calculatedBase * 0.92);
    const highEst = Math.round(calculatedBase * 1.08);

    // Update Summary Card
    if (summaryRoom) summaryRoom.textContent = currentRoom;
    if (summaryStyle) summaryStyle.textContent = currentStyle;
    if (summaryDims) summaryDims.textContent = `${widthCm}cm × ${dropCm}cm (~${areaSqM.toFixed(1)}m²)`;
    if (summaryOptions) {
      summaryOptions.textContent = activeAddons.length > 0 ? activeAddons.join(', ') : 'Standard Louvolite / Eclipse Fabric';
    }
    if (priceDisplay) {
      priceDisplay.textContent = `£${lowEst} – £${highEst}`;
    }

    // Update the Book Button data attributes
    if (bookEstimateBtn) {
      bookEstimateBtn.setAttribute('data-prefill-room', currentRoom);
      bookEstimateBtn.setAttribute('data-prefill-style', currentStyle);
      bookEstimateBtn.setAttribute('data-prefill-price', `£${lowEst} – £${highEst}`);
    }
  }

  // Initial Calculation Run
  updateCalculation();

  // Book with Estimate click handler
  if (bookEstimateBtn) {
    bookEstimateBtn.addEventListener('click', () => {
      const room = bookEstimateBtn.getAttribute('data-prefill-room') || currentRoom;
      const style = bookEstimateBtn.getAttribute('data-prefill-style') || currentStyle;
      const price = bookEstimateBtn.getAttribute('data-prefill-price') || 'Estimated Guide Price';
      
      openBookingModal({
        notes: `Online Estimator Quote: ${room}, ${style} (${widthCm}cm x ${dropCm}cm). Guide Price: ${price}. Free Home Measure requested.`
      });
    });
  }
}

/* ==========================================================================
   3. Day / Night Light Control Simulator
   ========================================================================== */
function initLightSimulator() {
  const pills = document.querySelectorAll('.mode-pill');
  const stage = document.getElementById('sim-stage');
  const overlay = document.getElementById('sim-overlay');
  const slats = document.querySelectorAll('.louver-slat');
  const descTitle = document.getElementById('sim-mode-title');
  const descText = document.getElementById('sim-mode-desc');

  const modes = {
    day: {
      title: 'Full Natural Daylight Mode (Open Slat)',
      desc: '100% natural Yorkshire sunlight enters your living space. Louvers are tilted fully open, giving you maximum panoramic garden or street views while preserving sleek window aesthetics.',
      overlayBg: 'rgba(0, 0, 0, 0.0)',
      stageFilter: 'brightness(1.05) contrast(1.02)',
      slatTransform: 'rotateX(0deg) scaleY(0.4)',
      slatOpacity: '0.6'
    },
    privacy: {
      title: 'Diffused Daylight & Daytime Privacy (Angled Slat)',
      desc: 'Louvers angled at 45° gently diffuse harsh UV glare while preventing onlookers on the street from seeing into your home. Ideal for home offices, ground-floor living rooms, and sunny conservatories.',
      overlayBg: 'rgba(20, 32, 26, 0.25)',
      stageFilter: 'brightness(0.92) contrast(1.05)',
      slatTransform: 'rotateX(45deg) scaleY(0.75)',
      slatOpacity: '0.85'
    },
    blackout: {
      title: 'Total Blackout & Thermal Room Darkening (Closed Slat)',
      desc: 'Louvers fully closed flush with interlocking closure seals. Blocks up to 99% of ambient street lamps and morning light, significantly reducing bedroom heat loss in winter and solar overheating in summer.',
      overlayBg: 'rgba(12, 18, 15, 0.78)',
      stageFilter: 'brightness(0.5) contrast(1.15)',
      slatTransform: 'rotateX(82deg) scaleY(1.0)',
      slatOpacity: '1.0'
    }
  };

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const modeKey = pill.getAttribute('data-mode');
      const config = modes[modeKey];
      if (!config) return;

      if (overlay) overlay.style.backgroundColor = config.overlayBg;
      if (stage) stage.style.filter = config.stageFilter;
      if (descTitle) descTitle.textContent = config.title;
      if (descText) descText.textContent = config.desc;

      slats.forEach(slat => {
        slat.style.transform = config.slatTransform;
        slat.style.opacity = config.slatOpacity;
      });
    });
  });
}

/* ==========================================================================
   4. Product Gallery Filter
   ========================================================================== */
function initProductFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.getAttribute('data-filter');

      productCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (category === 'all' || cardCategory === category || cardCategory.includes(category)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   5. East Yorkshire Coverage & Postcode Checker
   ========================================================================== */
function initCoverageChecker() {
  const input = document.getElementById('postcode-input');
  const checkBtn = document.getElementById('postcode-check-btn');
  const resultBox = document.getElementById('coverage-result');

  // Covered postcodes / area names in Hull and East Riding of Yorkshire
  const serviceAreas = [
    { prefix: 'HU1', name: 'Hull City Centre / Marina' },
    { prefix: 'HU2', name: 'Hull Central / Wincolmlee' },
    { prefix: 'HU3', name: 'Hessle Road / Anlaby Road' },
    { prefix: 'HU4', name: 'Gipsyville / Boothferry' },
    { prefix: 'HU5', name: 'Newland Avenue / The Avenues' },
    { prefix: 'HU6', name: 'Inglemire / Orchard Park' },
    { prefix: 'HU7', name: 'Kingswood / Bransholme / Sutton' },
    { prefix: 'HU8', name: 'Garden Village / Sutton / Summergangs' },
    { prefix: 'HU9', name: 'New Bridge Road (Showroom) / Marfleet / Holderness Road' },
    { prefix: 'HU10', name: 'Anlaby / Kirk Ella / West Ella' },
    { prefix: 'HU11', name: 'Bilton / Preston / Coniston' },
    { prefix: 'HU12', name: 'Hedon / Paull / Thorngumbald / Withernsea' },
    { prefix: 'HU13', name: 'Hessle' },
    { prefix: 'HU14', name: 'North Ferriby / Swanland' },
    { prefix: 'HU15', name: 'Brough / Elloughton / South Cave' },
    { prefix: 'HU16', name: 'Cottingham' },
    { prefix: 'HU17', name: 'Beverley / Molescroft / Tickton' },
    { prefix: 'YO25', name: 'Driffield' },
    { prefix: 'YO42', name: 'Pocklington' }
  ];

  function runCheck() {
    if (!input || !resultBox) return;
    const cleanInput = input.value.trim().toUpperCase().replace(/\s+/g, '');
    
    if (cleanInput.length < 2) {
      resultBox.className = 'coverage-result-box active';
      resultBox.style.backgroundColor = '#FDF2F2';
      resultBox.style.color = '#9B1C1C';
      resultBox.style.border = '1px solid #F8B4B4';
      resultBox.innerHTML = '<strong>Please enter a valid UK postcode</strong> (e.g. HU9 2LR, HU17, HU16).';
      return;
    }

    // Match prefix or exact string
    const match = serviceAreas.find(area => cleanInput.startsWith(area.prefix));

    resultBox.className = 'coverage-result-box active success';
    if (match) {
      resultBox.innerHTML = `<strong>✅ Great news! We cover ${match.name} (${match.prefix}) with our Free Home Measuring Service.</strong><br>Our mobile showroom van brings over 800+ fabric swatches directly to your doorstep with 100% free fitting included.`;
    } else if (cleanInput.startsWith('HU') || cleanInput.startsWith('YO')) {
      resultBox.innerHTML = `<strong>✅ Yes, we service East Yorkshire!</strong><br>Your postcode is in our standard home measure and free installation catchment. Call us on <strong>01482 701236</strong> to schedule your slot.`;
    } else {
      resultBox.innerHTML = `<strong>ℹ️ Postcode noted:</strong> We regularly travel across East Yorkshire and surrounding North Lincolnshire areas. Give David a quick ring on <strong>01482 701236</strong> to confirm your slot!`;
    }
  }

  if (checkBtn) checkBtn.addEventListener('click', runCheck);
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') runCheck();
    });
  }
}

/* ==========================================================================
   6. Lead Capture & Free Home Measure Booking Modal
   ========================================================================== */
function initBookingModal() {
  const overlay = document.getElementById('bookingModal');
  const closeBtn = document.getElementById('modalCloseBtn');
  const openTriggers = document.querySelectorAll('[data-open-modal]');
  const form = document.getElementById('freeMeasureForm');
  const notesField = document.getElementById('modal-notes');

  openTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openBookingModal();
    });
  });

  if (closeBtn && overlay) {
    closeBtn.addEventListener('click', closeBookingModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeBookingModal();
    });
  }

  // Handle escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay && overlay.classList.contains('open')) {
      closeBookingModal();
    }
  });

  // Booking Form Submission
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('lead-name')?.value;
      const phone = document.getElementById('lead-phone')?.value;
      const postcode = document.getElementById('lead-postcode')?.value;

      // Simulate instant lead confirmation
      closeBookingModal();
      showToast(`Thank you ${name}! Your Free Measure request for ${postcode} has been logged. David or Kerry will call you on ${phone} within 2 business hours.`);
      form.reset();
    });
  }
}

window.openBookingModal = function(options = {}) {
  const overlay = document.getElementById('bookingModal');
  const notesField = document.getElementById('modal-notes');
  if (overlay) {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (options.notes && notesField) {
      notesField.value = options.notes;
    }
  }
};

window.closeBookingModal = function() {
  const overlay = document.getElementById('bookingModal');
  if (overlay) {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
};

/* ==========================================================================
   7. Commercial & Trade Form
   ========================================================================== */
function initTradeForm() {
  const tradeForm = document.getElementById('tradeForm');
  if (tradeForm) {
    tradeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const compName = document.getElementById('trade-company')?.value || 'your team';
      showToast(`Commercial enquiry received for ${compName}. Our contract blinds estimator will send trade pricing schedules shortly.`);
      tradeForm.reset();
    });
  }
}

/* ==========================================================================
   8. Toast Notification Utility
   ========================================================================== */
function showToast(message) {
  let toast = document.querySelector('.toast-msg');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-msg';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    <span>${message}</span>
  `;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 6500);
}
