  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const sideMenu = document.getElementById('sideMenu');
  const closeMenu = document.getElementById('closeMenu');
  const overlay = document.getElementById('overlay');
  const searchBtn = document.getElementById('searchBtn');
  const searchField = document.getElementById('searchField');

  hamburgerBtn.addEventListener('click', () => {
    sideMenu.classList.add('open');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  });
  
  closeMenu.addEventListener('click', () => {
    sideMenu.classList.remove('open');
    overlay.classList.remove('show');
    document.body.style.overflow = 'auto';
  });
  
  overlay.addEventListener('click', () => {
    sideMenu.classList.remove('open');
    overlay.classList.remove('show');
    document.body.style.overflow = 'auto';
  });
  
  searchBtn.addEventListener('click', () => {
    searchField.classList.toggle('show');
    if(searchField.classList.contains('show')) searchField.focus();
  });

  gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const accordion = header.closest('.accordion'); // the container
      const allHeaders = accordion.querySelectorAll('.accordion-header');

      // Close all other items
      allHeaders.forEach(h => {
        if (h !== header) {
          h.classList.remove('active');
          h.nextElementSibling.style.maxHeight = null;
        }
      });

      // Toggle the clicked one
      header.classList.toggle('active');
      const content = header.nextElementSibling;
      if (header.classList.contains('active')) {
        content.style.maxHeight = content.scrollHeight + "px";
      } else {
        content.style.maxHeight = null;
      }
    });
  });

  document.addEventListener("DOMContentLoaded", () => {
    const track = document.querySelector('.carousel-track');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    const cards = Array.from(track.children);

    let index = 0;
    const visibleCards = 4; // how many cards show at once
    const cardWidth = cards[0].getBoundingClientRect().width + 20;
    const maxIndex = cards.length - visibleCards;
    let autoSlideInterval;

    // function to move carousel
    function moveCarousel(newIndex) {
      index = newIndex;
      track.style.transform = `translateX(-${index * cardWidth}px)`;
    }

    // next slide
    function nextSlide() {
      if (index < maxIndex) {
        moveCarousel(index + 1);
      } else {
        moveCarousel(0); // loop back to start
      }
    }

    // prev slide
    function prevSlide() {
      if (index > 0) {
        moveCarousel(index - 1);
      } else {
        moveCarousel(maxIndex); // go to last group
      }
    }

    // auto slide
    function startAutoSlide() {
      autoSlideInterval = setInterval(nextSlide, 3000); // every 3s
    }

    function stopAutoSlide() {
      clearInterval(autoSlideInterval);
    }

    // button events
    nextBtn.addEventListener('click', () => {
      nextSlide();
      stopAutoSlide();
      startAutoSlide(); // restart auto-slide after manual move
    });

    prevBtn.addEventListener('click', () => {
      prevSlide();
      stopAutoSlide();
      startAutoSlide();
    });

    // start auto-slide on page load
    startAutoSlide();
  });

  // Fixed GSAP animations for heritage and legacy
  gsap.to(".heritage", {
    x: 800,
    opacity: 0,
    ease: "power1.inOut",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom 30%",
      scrub: true,
      markers: false,
    }
  });

  gsap.to(".legacy", {
    x: -800,
    opacity: 0,
    ease: "power1.inOut",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom 30%",
      scrub: true,
      markers: false,
    }
  });

  // Left paragraph
  gsap.from(".hero-left p", {
    x:-50, 
    opacity:0, 
    duration:1, 
    delay:0.3, 
    scrollTrigger:{
      trigger:".hero", 
      start:"top center"
    }
  });

  // Buttons
  gsap.from(
    ".hero-buttons a", {
      y:30, 
      opacity:0, 
      stagger:0.2, 
      duration:1, 
      scrollTrigger:{
        trigger:".hero", 
        start:"top center"
      }
    });

  // Rosettes
  gsap.from(
    ".hero-right img", {
      scale:0.6, 
      opacity:0, 
      stagger:0.2, 
      duration:1, 
      ease:"back.out(1.7)", 
      scrollTrigger:{
        trigger:".hero", 
        start:"top center"
      }
    });

  // SVG line draw
  gsap.from(".hero-svg path", {strokeDasharray:400, strokeDashoffset:400, duration:2, ease:"power2.out", scrollTrigger:{trigger:".hero", start:"top center"}});

  gsap.to(".hero-svg", {
    y: 150, // adjust how much it “follows”
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true
    }
  });

  gsap.from(".about-left", {
    x: -80,
    opacity: 0,
    duration: 1,
    scrollTrigger: {
      trigger: ".about-section",
      start: "top 80%",   // start when top of section hits 80% viewport height
      toggleActions: "play none none none" // play only once
    }
  });

  gsap.from(".about-right", {
    x: 80,
    opacity: 0,
    duration: 1,
    scrollTrigger: {
      trigger: ".about-section",
      start: "top 80%",
      toggleActions: "play none none none"
    }
  });

  gsap.to(".hero-svg path", {
    attr: { d: "M0,100 C360,0 1080,200 1440,80 L1440,150 L0,150 Z" },
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true
    },
    ease: "power2.inOut"
  });

  gsap.utils.toArray('.profile-card').forEach(card => {
  gsap.from(card, {
    opacity: 0,
    y: 40,
    duration: 0.6,
    scrollTrigger: {
      trigger: card,
      start: "top 80%",
      toggleActions: "play none none reverse"
    }
  });
});
