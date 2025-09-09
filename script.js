document.addEventListener('DOMContentLoaded', function() {
    // Remove loader after page load
    setTimeout(() => {
        document.getElementById('loader').classList.add('hidden');
    }, 2000);

    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const body = document.body;

    if (themeToggle && themeIcon) {
        const currentTheme = localStorage.getItem('theme') || 'dark';
        if (currentTheme === 'dark') {
            body.setAttribute('data-color-scheme', 'dark');
            themeIcon.textContent = '☀️';
        } else {
            body.setAttribute('data-color-scheme', 'light');
            themeIcon.textContent = '🌙';
        }

        themeToggle.addEventListener('click', () => {
            const isDark = body.getAttribute('data-color-scheme') === 'dark';
            const newTheme = isDark ? 'light' : 'dark';
            body.setAttribute('data-color-scheme', newTheme);
            themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
            try {
                localStorage.setItem('theme', newTheme);
            } catch (error) {
                console.warn('Could not save theme preference:', error);
            }
        });
    } else {
        console.error('Theme toggle elements not found in DOM');
    }

    // Scroll Hint
    const scrollHint = document.getElementById('scrollHint');
    const syllabusSection = document.getElementById('syllabus');

    if (scrollHint && syllabusSection) {
        // Respect previous dismissal
        if (!localStorage.getItem('scrollHintDismissed')) {
            setTimeout(() => scrollHint.classList.add('show'), 800);
        }

        scrollHint.addEventListener('click', () => {
            syllabusSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            scrollHint.classList.remove('show');
            scrollHint.classList.add('hidden');
            localStorage.setItem('scrollHintDismissed', 'true');
        });

        const hideTargets = [syllabusSection, document.querySelector('footer')].filter(Boolean);
        const io = new IntersectionObserver((entries) => {
            if (entries.some(e => e.isIntersecting)) {
                scrollHint.classList.remove('show');
            } else {
                if (!localStorage.getItem('scrollHintDismissed')) scrollHint.classList.add('show');
            }
        }, { threshold: 0.1 });

        hideTargets.forEach(t => io.observe(t));
    }

    // Gallery grid reveal on scroll
    (function () {
        const items = document.querySelectorAll('#gallery .anim-item');
        if (!items.length) return;

        const io = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });

        items.forEach(el => io.observe(el));
    })();

    // Header scroll effect
    const header = document.getElementById('header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    });

    // Intersection Observer for reveal animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
                
                // Special handling for syllabus items
                if (entry.target.classList.contains('syllabus-item')) {
                    const items = document.querySelectorAll('.syllabus-item');
                    items.forEach((item, index) => {
                        setTimeout(() => {
                            item.classList.add('reveal');
                        }, index * 100);
                    });
                    revealObserver.unobserve(entry.target);
                }

                // Special handling for educator cards
                if (entry.target.classList.contains('educator-card')) {
                    const cards = document.querySelectorAll('.educator-card');
                    cards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('reveal');
                        }, index * 200);
                    });
                }

                // Special handling for contact sections (updated for single map)
                if (entry.target.classList.contains('contact-form-section') ||
                    entry.target.classList.contains('contact-info-section') ||
                    entry.target.classList.contains('map-section-single')) {
                    entry.target.classList.add('reveal');
                }
            }
        });
    }, observerOptions);

    // Observe elements for reveal animations (updated selector)
    const elementsToReveal = document.querySelectorAll(
        '.section-title, .feature-card, .video-container, .syllabus-item, .map-container, ' +
        '.educator-card, .contact-form-section, .contact-info-section, .map-section-single'
    );
    
    elementsToReveal.forEach(el => {
        revealObserver.observe(el);
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Parallax effect for hero shapes
    const shapes = document.querySelectorAll('.shape');
    let ticking = false;

    function updateParallax() {
        const scrolled = window.scrollY;
        shapes.forEach((shape, index) => {
            const speed = 0.5 + (index * 0.1);
            const yPos = -(scrolled * speed);
            shape.style.transform = `translateY(${yPos}px)`;
        });
        ticking = false;
    }

    function requestTick() {
        if (!ticking) {
            window.requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }

    window.addEventListener('scroll', requestTick);

    // Scroll-timeline fallback for older browsers
    if ('IntersectionObserver' in window && CSS.supports('animation-timeline', 'scroll()')) {
        console.log('Scroll timeline animations supported');
    } else {
        console.log('Using fallback animations');
        const heroPhoto = document.querySelector('.hero-photo');
        if (heroPhoto) {
            const heroObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const scrollProgress = entry.intersectionRatio;
                        heroPhoto.style.transform = `scale(${0.9 + scrollProgress * 0.1})`;
                    }
                });
            }, {
                threshold: Array.from({length: 100}, (_, i) => i / 100)
            });
            heroObserver.observe(heroPhoto);
        }
    }

    // Micro-interactions for buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Play button functionality
    const playButton = document.querySelector('.play-button');
    if (playButton) {
        playButton.addEventListener('click', () => {
            // You can replace this with actual video embed code
            alert('Video playback would start here. Add your video URL or embed code.');
        });
    }

    // Feature cards tilt effect (3D hover effect)
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });

    // Educator card hover effects
    const educatorCards = document.querySelectorAll('.educator-card');
    educatorCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Social links hover effects
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'rotate(360deg) scale(1.2)';
        });
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'rotate(0deg) scale(1)';
        });
    });

    // Contact item hover effects
    const contactItems = document.querySelectorAll('.contact-item');
    contactItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(10px) scale(1.02)';
        });
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0) scale(1)';
        });
    });

    // Floating CTA button visibility
    const floatingCTA = document.querySelector('.floating-cta');
    if (floatingCTA) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                floatingCTA.style.display = 'block';
                floatingCTA.style.opacity = '1';
            } else {
                floatingCTA.style.opacity = '0';
                setTimeout(() => {
                    if (window.scrollY <= 500) {
                        floatingCTA.style.display = 'none';
                    }
                }, 300);
            }
        });

        // Add click functionality to floating CTA
        floatingCTA.addEventListener('click', () => {
            document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
        });
    }

    //// Hide Floating CTA and Scroll Hint when footer is visible
    const footerEl = document.querySelector('footer');
    const floatingCTAEl = document.querySelector('.floating-cta');
    const scrollHintEl = document.getElementById('scrollHint');

    if (footerEl) {
    const hideOnFooterIO = new IntersectionObserver((entries) => {
        const footerVisible = entries.some(e => e.isIntersecting);
        if (footerVisible) {
        if (floatingCTAEl) {
            floatingCTAEl.style.opacity = '0';
            floatingCTAEl.style.pointerEvents = 'none';
            // also collapse it after fade to avoid accidental click
            setTimeout(() => {
            floatingCTAEl.style.display = 'none';
            }, 200);
        }
        if (scrollHintEl) {
            scrollHintEl.classList.remove('show');
            scrollHintEl.classList.add('hidden');
            scrollHintEl.style.pointerEvents = 'none';
        }
        } else {
        if (floatingCTAEl) {
            if (window.scrollY > 500) {
            floatingCTAEl.style.display = 'block';
            requestAnimationFrame(() => {
                floatingCTAEl.style.opacity = '1';
                floatingCTAEl.style.pointerEvents = 'auto';
            });
            }
        }
        if (scrollHintEl && !localStorage.getItem('scrollHintDismissed')) {
            scrollHintEl.classList.add('show');
            scrollHintEl.classList.remove('hidden');
            scrollHintEl.style.pointerEvents = 'auto';
        }
        }
    }, {
        root: null,
        threshold: 0,          // trigger on first pixel overlap
        rootMargin: '0px 0px 0px 0px' // no margin so behavior is predictable
    });

    hideOnFooterIO.observe(footerEl);
    }



    // Debounced scroll events for performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }

        scrollTimeout = window.requestAnimationFrame(() => {
            // Additional scroll-based animations can be added here
        });
    });

    // Keyboard navigation support
    document.addEventListener('keydown', (e) => {
        // Theme toggle with 'T' key
        if (e.key === 't' || e.key === 'T') {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                themeToggle.click();
            }
        }

        // Quick navigation with number keys
        if (e.key >= '1' && e.key <= '5' && !e.ctrlKey && !e.altKey && !e.shiftKey) {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                const sections = ['#hero', '#features', '#syllabus', '#educators', '#contact'];
                const targetSection = document.querySelector(sections[parseInt(e.key) - 1]);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }
    });

    // Form validation (if forms are added later)
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const inputs = form.querySelectorAll('input[required], textarea[required]');
            let isValid = true;

            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = 'var(--color-red-500)';
                } else {
                    input.style.borderColor = '';
                }
            });

            if (!isValid) {
                e.preventDefault();
                alert('Please fill in all required fields.');
            }
        });
    });

    // Performance monitoring
    const performanceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
            if (entry.entryType === 'navigation') {
                console.log('Page load time:', entry.duration);
            }
        });
    });

    if ('PerformanceObserver' in window) {
        performanceObserver.observe({ entryTypes: ['navigation'] });
    }

    // Error handling for images
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            this.style.display = 'none';
            console.log('Image failed to load:', this.src);
        });
    });

    // Lazy loading for images (if supported)
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Iframe resizing for mobile
    const iframe = document.querySelector('.form-container iframe');
    if (iframe) {
        function resizeIframe() {
            if (window.innerWidth <= 768) {
                iframe.style.height = '500px';
            } else {
                iframe.style.height = '600px';
            }
        }
        
        window.addEventListener('resize', resizeIframe);
        resizeIframe(); // Call on load
    }

    // Analytics tracking (placeholder)
    function trackEvent(eventName, eventData) {
        console.log('Analytics Event:', eventName, eventData);
        // Add your analytics code here (Google Analytics, etc.)
    }

    // Track button clicks
    document.addEventListener('click', (e) => {
        if (e.target.matches('.btn, .social-link, .floating-cta, .contact-item')) {
            trackEvent('button_click', {
                element: e.target.className,
                text: e.target.textContent.trim()
            });
        }
    });

    // Service Worker registration (for future PWA features)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }

    // Schema.org structured data for SEO
    const schemaData = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "name": "Shrvan Wealth Creation",
                "description": "Premium stock market education with personalized counselling and money-back guarantee",
                "url": window.location.href,
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Gargoti",
                    "addressRegion": "Maharashtra",
                    "postalCode": "416209",
                    "addressCountry": "IN"
                },
                "contactPoint": {
                    "@type": "ContactPoint",
                    "telephone": "+91-8983589099",
                    "contactType": "customer service"
                }
            },
            {
                "@type": "Person",
                "name": "Shreyas Chodankar",
                "jobTitle": "Senior Trading Mentor",
                "worksFor": {
                    "@type": "Organization",
                    "name": "Shrvan Wealth Creation"
                },
                "url": "https://instagram.com/shreyas_chodankar"
            },
            {
                "@type": "Person",
                "name": "Shweta Chodankar", 
                "jobTitle": "Trading Strategy Expert",
                "worksFor": {
                    "@type": "Organization",
                    "name": "Shrvan Wealth Creation"
                },
                "url": "https://instagram.com/trade_with__shweta"
            },
            {
                "@type": "Course",
                "name": "Stock Market Trading Course",
                "description": "Comprehensive stock market education covering basic to advanced F&O trading",
                "provider": {
                    "@type": "Organization",
                    "name": "Shrvan Wealth Creation"
                },
                "courseMode": "in-person",
                "educationalCredentialAwarded": "Trading Certificate"
            }
        ]
    };

    // Add structured data to page
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schemaData);
    document.head.appendChild(script);

    console.log('✅ Shrvan Wealth Creation website initialized successfully');
});
