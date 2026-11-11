document.addEventListener('DOMContentLoaded', () => {
  
  // Set current copyright year in footer if exists
  const currentYearEl = document.getElementById('current-year');
  if (currentYearEl) {
    currentYearEl.textContent = new Date().getFullYear();
  }

  // Mobile navigation menu toggle
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('open');
      menuToggle.textContent = isExpanded ? 'Menu' : 'Close';
    });
  }

  // 1. Fading Hero Carousel
  const carousel = document.getElementById('hero-carousel');
  if (carousel) {
    const items = carousel.querySelectorAll('.hero-carousel-item');
    let currentIndex = 0;
    if (items.length > 1) {
      setInterval(() => {
        items[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % items.length;
        items[currentIndex].classList.add('active');
      }, 5000); // Shift every 5 seconds
    }
  }

  // 2. Scroll Reveal Animations
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Optional: stop observing once revealed
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // 3. Stat Count-Up Animation
  const counterElements = document.querySelectorAll('.counter-val');
  
  const countUp = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(target)) return;

    let start = 0;
    const duration = 2000; // 2 seconds animation
    const stepTime = Math.abs(Math.floor(duration / target));
    const increment = Math.ceil(target / (duration / 16)); // Target 60fps (16ms)

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        el.textContent = target.toLocaleString() + suffix;
        clearInterval(timer);
      } else {
        el.textContent = start.toLocaleString() + suffix;
      }
    }, 16);
  };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        // Check if already animated
        if (!el.classList.contains('animated')) {
          el.classList.add('animated');
          countUp(el);
        }
        counterObserver.unobserve(el);
      }
    });
  }, {
    threshold: 0.5
  });

  counterElements.forEach(el => counterObserver.observe(el));

  // 4. Video Carousel Logic (World Vision Carousel Style)
  const videoSlides = document.querySelectorAll('.video-slide');
  const videoCounter = document.getElementById('video-counter');
  let currentVideoIndex = 0;

  window.changeVideoSlide = (direction) => {
    if (!videoSlides.length) return;

    // Pause/Reset the currently playing iframe if it exists
    const activeSlide = videoSlides[currentVideoIndex];
    const iframe = activeSlide.querySelector('iframe');
    if (iframe) {
      // Re-render placeholder to stop playback
      const videoId = activeSlide.getAttribute('data-video-id');
      const placeholder = document.createElement('div');
      placeholder.className = 'video-placeholder';
      placeholder.setAttribute('onclick', `loadYoutubeVideo(this, '${videoId}')`);
      placeholder.innerHTML = `
        <img src="https://img.youtube.com/vi/${videoId}/maxresdefault.jpg" alt="Babawatoto video thumbnail" class="video-thumbnail" loading="lazy">
        <div class="play-button-outer">
          <div class="play-button-inner">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      `;
      activeSlide.innerHTML = '';
      activeSlide.appendChild(placeholder);
    }

    // Hide active slide
    activeSlide.classList.remove('active');

    // Calculate next index
    currentVideoIndex = (currentVideoIndex + direction + videoSlides.length) % videoSlides.length;

    // Show new active slide
    videoSlides[currentVideoIndex].classList.add('active');

    // Update counter
    if (videoCounter) {
      videoCounter.textContent = `${currentVideoIndex + 1} / ${videoSlides.length}`;
    }
  };

  window.loadYoutubeVideo = (element, videoId) => {
    const slide = element.parentElement;
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    iframe.title = "YouTube video player";
    iframe.frameBorder = "0";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    
    slide.innerHTML = '';
    slide.appendChild(iframe);
  };

  // 5. Navbar Dropdown Menu Mobile Toggle
  const dropdownWrapper = document.querySelector('.nav-dropdown-wrapper');
  if (dropdownWrapper) {
    const dropdownLink = dropdownWrapper.querySelector('a');
    dropdownLink.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        dropdownWrapper.classList.toggle('open');
      }
    });
  }

  // 6. Programs Filtering & Details (Only execute if on programs page)
  const programsGrid = document.getElementById('programs-grid');
  if (programsGrid) {
    // static programs details database
    const programDetails = {
      arts: {
        title: "Social Arts & Culture",
        subtitle: "Creative Expression for Change",
        image: "/assets/images/arts1.webp",
        desc: "Using creative expression as a catalyst for dialogue, community healing, awareness, and social change. Babawatoto Organization believes in the power of theatre, dance, music, and painting to engage communities on critical issues such as children rights, sanitation, and health.",
        keyFocus: [
          "Community Theatre & Street Drama: Interactive performances addressing local challenges.",
          "Youth Music & Dance Coaching: Empowering young artists to find their voice and hone their talent.",
          "Fine Arts & Painting: Visual arts workshops showcasing child expressions and aspirations."
        ],
        outcomes: "Over 12,000 community members reached through interactive performances. Empowered 300+ youth with professional arts mentoring, launching successful local creative groups.",
        videos: ["FgXXMyMLF9k", "R09iiZAHiFs", "pdx8DWYJM_o"]
      },
      protection: {
        title: "Child Protection & Ethics",
        subtitle: "Safeguarding Vulnerable Children",
        image: "/assets/images/IMG_1087.JPG",
        desc: "Ensuring every child lives in a safe environment free from violence, abuse, and exploitation. We establish safe spaces, build child safeguarding committees, and train caregivers on children rights and positive discipline.",
        keyFocus: [
          "Safe Play Spaces: Secure, supervised environments for children to play, learn, and heal.",
          "Safeguarding Committee Training: Equipping local leaders to identify and report abuse.",
          "Family Guidance & Counseling: Providing mental health support and building resilient homes."
        ],
        outcomes: "Active child safeguarding systems in 15 municipal wards. Over 250 caregivers trained in positive parenting, significantly reducing reported domestic child abuse incidents.",
        videos: []
      },
      humanitarian: {
        title: "Humanitarian Response",
        subtitle: "Emergency Relief Support",
        image: "/assets/images/kizazi.webp",
        desc: "Providing rapid, lifecycle support during disasters, emergencies, and household economic crises. Our response aims to restore dignity and provide immediate relief to children and vulnerable families.",
        keyFocus: [
          "Food Security & Nutrition: Distributing nutritious meals and relief packages to families.",
          "Hygiene & Sanitation Kits: Providing clean water resources and essential sanitary supplies.",
          "Emergency Relocation Support: Assisting households displaced by seasonal floods or fires."
        ],
        outcomes: "Delivered over 250,000 meals to displaced families. Supported 1,500+ households with hygiene kits, preventing disease outbreaks in highly vulnerable urban settlements.",
        videos: []
      },
      asrh: {
        title: "ASRH & Well-being",
        subtitle: "Health Education & Outreaches",
        image: "/assets/images/community aoutreach 2.jpg",
        desc: "Delivering evidence-based Adolescent Sexual & Reproductive Health (ASRH) education, mobile clinic referrals, advisory counseling, and awareness outreaches. We dismantle taboos and empower youths to make healthy choices.",
        keyFocus: [
          "ASRH Workshops: Accurate, age-appropriate reproductive health education in schools.",
          "Mobile Referral Clinics: Connecting youth to confidential counseling and healthcare services.",
          "Peer Educator Networks: Training youth leaders to guide and support their peers."
        ],
        outcomes: "Educated over 5,000 adolescents on health and well-being. Facilitated 350+ clinic referrals for reproductive health services and private counseling.",
        videos: []
      },
      youth: {
        title: "Youth & Civic Engagement",
        subtitle: "Digital & Entrepreneurship",
        image: "/assets/images/Youth discussion.JPG",
        desc: "Unlocking youth economic potential through leadership coaching, small business training, digital literacy, and civic advocacy. We prepare youths to be active civic leaders and successful entrepreneurs.",
        keyFocus: [
          "Entrepreneurship Bootcamps: Practical business plan writing, budgeting, and marketing.",
          "Digital Literacy & IT Training: Teaching computer operations, office tools, and online branding.",
          "Civic Leadership Clubs: Fostering youth voices to participate in community decision-making."
        ],
        outcomes: "Helped launch 80+ youth-led micro-enterprises. Trained 300+ youth in digital tools, and established active youth representation in district ward councils.",
        videos: []
      },
      vocational: {
        title: "Vocational Skills Training",
        subtitle: "Hands-on Employability Training",
        image: "/assets/images/YOUTH.webp",
        desc: "Practical hands-on training that equips youths with employable skill sets and paths to sustainable livelihoods. At the BAO Youth Centre, we offer courses tailored to local job market demands.",
        keyFocus: [
          "Tailoring & Fashion Design: Comprehensive garment making and sewing machine operations.",
          "Carpentry & Woodwork: Furniture making, design structures, and wood processing.",
          "Welding & Metal Fabrication: Metal works, safety practices, and structure assembly."
        ],
        outcomes: "Graduated over 1,000 youth from vocational courses. Over 70% of graduates secured immediate employment or successfully set up self-employed workshops.",
        videos: []
      },
      conservation: {
        title: "Conservation & Clean Energy",
        subtitle: "Climate Resilience Actions",
        image: "/assets/images/cover.jpg",
        desc: "Promoting climate resilience, environmental sustainability, conservation, and clean energy adoption in local communities. We engage youth in tree planting and production of energy-efficient cookstoves.",
        keyFocus: [
          "Afforestation Campaigns: Tree planting events to restore degraded urban green spaces.",
          "Clean Cookstove Production: Training youth to manufacture energy-efficient clay cookstoves.",
          "Climate Advocacy: Organizing community seminars on waste management and recycling."
        ],
        outcomes: "Planted over 5,000 indigenous trees. Distributed 350+ energy-saving cookstoves to low-income households, reducing firewood consumption by 40%.",
        videos: []
      }
    };

    const tabs = document.querySelectorAll('#program-tabs .tab-link');
    const gridItems = document.querySelectorAll('#programs-grid .program-card-item');

    // 6a. Tab Filtering logic
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const filter = tab.getAttribute('data-filter');
        gridItems.forEach(item => {
          if (filter === 'all' || item.getAttribute('data-category') === filter) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });

    // 6b. Featured Carousel Logic
    const featuredSlides = document.querySelectorAll('.featured-carousel-item');
    const featuredDots = document.querySelectorAll('.carousel-dot');
    let currentFeaturedIndex = 0;
    let featuredCarouselTimer = null;

    window.changeFeaturedSlide = (direction) => {
      if (!featuredSlides.length) return;
      featuredSlides[currentFeaturedIndex].classList.remove('active');
      if (featuredDots[currentFeaturedIndex]) {
        featuredDots[currentFeaturedIndex].classList.remove('active');
      }

      currentFeaturedIndex = (currentFeaturedIndex + direction + featuredSlides.length) % featuredSlides.length;

      featuredSlides[currentFeaturedIndex].classList.add('active');
      if (featuredDots[currentFeaturedIndex]) {
        featuredDots[currentFeaturedIndex].classList.add('active');
      }
      resetFeaturedTimer();
    };

    window.setFeaturedSlide = (index) => {
      if (!featuredSlides.length || index < 0 || index >= featuredSlides.length) return;
      featuredSlides[currentFeaturedIndex].classList.remove('active');
      if (featuredDots[currentFeaturedIndex]) {
        featuredDots[currentFeaturedIndex].classList.remove('active');
      }

      currentFeaturedIndex = index;

      featuredSlides[currentFeaturedIndex].classList.add('active');
      if (featuredDots[currentFeaturedIndex]) {
        featuredDots[currentFeaturedIndex].classList.add('active');
      }
      resetFeaturedTimer();
    };

    const resetFeaturedTimer = () => {
      if (featuredCarouselTimer) {
        clearInterval(featuredCarouselTimer);
      }
      featuredCarouselTimer = setInterval(() => {
        changeFeaturedSlide(1);
      }, 6000);
    };

    if (featuredSlides.length > 0) {
      resetFeaturedTimer();
    }

    // 6c. SPA Transition Logic to Detail View
    const listView = document.getElementById('programs-list-view');
    const detailView = document.getElementById('programs-detail-view');

    window.showProgramDetail = (category) => {
      const data = programDetails[category];
      if (!data || !listView || !detailView) return;

      // Populate elements
      document.getElementById('detail-tag').textContent = data.title;
      document.getElementById('detail-title').textContent = data.subtitle;
      document.getElementById('detail-hero').style.backgroundImage = `linear-gradient(transparent, rgba(0,0,0,0.85)), url('${data.image}')`;
      document.getElementById('detail-desc').textContent = data.desc;

      // Populate key focus checklist
      const focusList = document.getElementById('detail-focus-list');
      focusList.innerHTML = '';
      data.keyFocus.forEach(focusItem => {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.gap = '12px';
        li.style.alignItems = 'flex-start';
        li.innerHTML = `
          <span style="color: var(--color-secondary); font-weight: bold; font-size: 1.2rem; line-height: 1;">&#10003;</span>
          <span style="color: var(--color-text-body); font-size: 1rem; line-height: 1.5;">${focusItem}</span>
        `;
        focusList.appendChild(li);
      });

      // outcomes
      document.getElementById('detail-outcomes-text').textContent = data.outcomes;

      // videos
      const videoArea = document.getElementById('detail-video-area');
      const videoGrid = document.getElementById('detail-video-grid');
      videoGrid.innerHTML = '';

      if (data.videos && data.videos.length > 0) {
        videoArea.style.display = 'block';
        data.videos.forEach(vidId => {
          const videoWrapper = document.createElement('div');
          videoWrapper.style.aspectRatio = '16/9';
          videoWrapper.style.width = '100%';
          videoWrapper.style.borderRadius = 'var(--radius-sm)';
          videoWrapper.style.overflow = 'hidden';
          videoWrapper.style.backgroundColor = '#000';
          videoWrapper.innerHTML = `
            <div class="video-placeholder" onclick="loadYoutubeVideo(this, '${vidId}')" style="width: 100%; height: 100%; position: relative; cursor: pointer;">
              <img src="https://img.youtube.com/vi/${vidId}/maxresdefault.jpg" alt="Babawatoto video thumbnail" class="video-thumbnail" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.8; transition: opacity 0.3s ease;">
              <div class="play-button-outer" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 70px; height: 70px; background-color: rgba(255, 255, 255, 0.8); border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: transform 0.3s ease;">
                <div class="play-button-inner" style="color: #FF5515; display: flex; align-items: center; justify-content: center;">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20" style="margin-left: 2px;">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            </div>
          `;
          videoGrid.appendChild(videoWrapper);
        });
      } else {
        videoArea.style.display = 'none';
      }

      listView.style.display = 'none';
      detailView.style.display = 'block';
      const featuredCarousel = document.querySelector('.featured-carousel-container');
      if (featuredCarousel) featuredCarousel.style.display = 'none';

      // Scroll smoothly to top of the page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.hideProgramDetail = () => {
      if (!listView || !detailView) return;
      
      const videoGrid = document.getElementById('detail-video-grid');
      if (videoGrid) {
        videoGrid.innerHTML = '';
      }

      detailView.style.display = 'none';
      listView.style.display = 'block';
      const featuredCarousel = document.querySelector('.featured-carousel-container');
      if (featuredCarousel) featuredCarousel.style.display = 'block';

      // Scroll smoothly to top of grid list tabs
      const tabsRow = document.getElementById('program-tabs');
      if (tabsRow) {
        tabsRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    // 6d. Check URL query params for loading specific category
    const urlParams = new URLSearchParams(window.location.search);
    const programParam = urlParams.get('program');
    if (programParam && programDetails[programParam]) {
      setTimeout(() => {
        showProgramDetail(programParam);
      }, 200);
    }
  }

  // 7. Handle Navbar Dropdown click interceptions
  const dropdownLinks = document.querySelectorAll('.nav-dropdown-menu a');
  dropdownLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const url = new URL(link.href);
      
      // Category links on programs page
      const category = url.searchParams.get('program');
      if (category && window.location.pathname.endsWith('programs.html') && document.getElementById('programs-grid')) {
        e.preventDefault();
        showProgramDetail(category);
        history.pushState(null, '', link.href);
        collapseMobileMenu();
      }
      
      // Hash anchor links on about page
      const hash = url.hash;
      if (hash && window.location.pathname.endsWith('about.html')) {
        const targetEl = document.querySelector(hash);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.pushState(null, '', link.href);
          collapseMobileMenu();
        }
      }
    });
  });

  const collapseMobileMenu = () => {
    const navMenu = document.getElementById('nav-menu');
    const menuToggle = document.getElementById('menu-toggle');
    if (navMenu && navMenu.classList.contains('open')) {
      navMenu.classList.remove('open');
      if (menuToggle) {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.textContent = 'Menu';
      }
    }
  };
});
