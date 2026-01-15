// app.js - Portfolio functionality
document.addEventListener("DOMContentLoaded", () => {
    // Utility: show toast message
    function showMessage(message, duration = 3000) {
      const box = document.getElementById('messageBox');
      box.textContent = message;
      box.style.display = 'block';
      setTimeout(() => { box.style.display = 'none'; }, duration);
    }

    // Preloader hide
    window.addEventListener('load', () => {
      const pre = document.getElementById('preloader');
      if (pre) pre.style.display = 'none';
    });

    // Reveal on scroll
    const revealObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) entry.target.classList.add('revealed');
      }
    }, { threshold: 0.15 });
    
    document.querySelectorAll('section').forEach(sec => {
      if (!sec.classList.contains('revealed')) revealObserver.observe(sec);
    });

    // Back-to-top visibility + active nav highlighting
    const topBtn = document.getElementById('topBtn');
    const sections = [...document.querySelectorAll('main section')];
    const navLinks = [...document.querySelectorAll('nav a')];

    function onScroll() {
      const y = window.scrollY + 100; // offset for sticky nav
      // Toggle back-to-top
      topBtn.style.display = (window.scrollY > 300) ? 'block' : 'none';
      // Highlight current nav link
      let currentId = sections[0]?.id;
      for (const sec of sections) {
        if (y >= sec.offsetTop) currentId = sec.id;
      }
      navLinks.forEach(a => a.setAttribute('aria-current', a.getAttribute('href') === '#' + currentId ? 'true' : 'false'));
    }
    
    window.addEventListener('scroll', onScroll, { passive:true });
    onScroll();

    topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // Gallery images (lazy + fallback)
    const galleryGrid = document.getElementById('galleryGrid');
    if (galleryGrid) {
        for (let i = 1; i <= 6; i++) {
          const img = document.createElement('img');
          img.src = `img/img${i}.jpg`;
          img.alt = `Project image ${i}`;
          img.loading = 'lazy';
          img.decoding = 'async';
          img.onerror = () => { img.remove(); };
          galleryGrid.appendChild(img);
        }
    }

    // Videos
    const videosGrid = document.getElementById('videosGrid');
    if (videosGrid) {
        const totalVideos = 3;
        const videoDescriptions = [
          "This video combines two parts: First, I demonstrate holding the vehicle's ECU and explain its role in the system. Then, I use the Launch diagnostic scanner to identify faults and error codes, followed by step-by-step ECU programming to configure and test the system. This practical demonstration is ideal for anyone interested in auto electrical work, vehicle diagnostics, and ECU programming.",
          "I specialize in creating professional and visually appealing graphic designs that bring ideas to life. From logos and business cards to social media posts and banners, I focus on building unique and creative designs tailored to each project. My goal is to combine creativity with simplicity, ensuring every design is both attractive and meaningful.",
          "In this video, I use my laptop to research and develop my professional skills. I focus on gathering knowledge, tools, and resources that can help me improve and advance in my field. This video provides a practical demonstration of how I build my expertise through ongoing learning and research."
        ];

        for (let i = 1; i <= totalVideos; i++) {
          const wrap = document.createElement('div');
          wrap.className = 'video-item';

          const video = document.createElement('video');
          video.controls = true;
          video.preload = 'metadata';
          video.controlsList = 'nodownload';
          video.setAttribute('aria-label', `Project Video ${i}`);

          // MP4 source
          const sourceMp4 = document.createElement('source');
          sourceMp4.src = `vid/video${i}.mp4`;
          sourceMp4.type = 'video/mp4';
          video.appendChild(sourceMp4);

          video.addEventListener('error', () => wrap.remove());

          const caption = document.createElement('div');
          caption.className = 'caption';
          caption.innerHTML = `<h4>Project Video ${i}</h4><p>${videoDescriptions[i-1]}</p>`;

          wrap.appendChild(video);
          wrap.appendChild(caption);
          videosGrid.appendChild(wrap);
        }
    }

    // Contact Form Validation
    const form = document.getElementById('contact-form');
    if (form) {
        // Create a div for success messages
        const successDiv = document.createElement('div');
        successDiv.classList.add('success-message');
        successDiv.style.display = 'none';
        form.parentNode.insertBefore(successDiv, form.nextSibling);

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameInput = form.querySelector('#nameInput');
            const emailInput = form.querySelector('#emailInput');
            const messageInput = form.querySelector('#msgInput');
            const submitBtn = form.querySelector('button[type="submit"]');

            let isValid = true;

            // Helper functions
            const showError = (element, message) => {
                let errorSpan = element.nextElementSibling;
                if (!errorSpan || !errorSpan.classList.contains('error-message')) {
                    errorSpan = document.createElement('span');
                    errorSpan.classList.add('error-message');
                    element.parentNode.insertBefore(errorSpan, element.nextSibling);
                }
                errorSpan.textContent = message;
                errorSpan.style.display = 'block';
                element.style.borderColor = '#e74c3c';
            };

            const clearError = (element) => {
                let errorSpan = element.nextElementSibling;
                if (errorSpan && errorSpan.classList.contains('error-message')) {
                    errorSpan.style.display = 'none';
                }
                element.style.borderColor = '#ddd';
            };

            // Somali validation messages
            const validationMessages = {
                nameRequired: "Fadlan geli magacaaga",
                emailRequired: "Fadlan geli emailkaaga",
                emailInvalid: "Fadlan geli email sax ah",
                messageRequired: "Fadlan qor fariintaada",
                success: "Mahadsanid! Fariintaadu waa la diray. Waxa ku soo noqon doonaa dhowr maalmood gudahood."
            };

            // Name validation
            if (!nameInput.value.trim()) {
                showError(nameInput, validationMessages.nameRequired);
                isValid = false;
            } else {
                clearError(nameInput);
            }

            // Email validation
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailInput.value.trim()) {
                showError(emailInput, validationMessages.emailRequired);
                isValid = false;
            } else if (!emailPattern.test(emailInput.value.trim())) {
                showError(emailInput, validationMessages.emailInvalid);
                isValid = false;
            } else {
                clearError(emailInput);
            }

            // Message validation
            if (!messageInput.value.trim()) {
                showError(messageInput, validationMessages.messageRequired);
                isValid = false;
            } else if (messageInput.value.trim().length < 10) {
                showError(messageInput, "Fariintu waa in ay ka kooban tahay ugu yaraan 10 xaraf");
                isValid = false;
            } else {
                clearError(messageInput);
            }

            if (isValid) {
                // Disable button during submission
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Lagu wadaayo...';
                submitBtn.style.opacity = "0.7";

                // Simulate AJAX submission
                setTimeout(() => {
                    // Show success message
                    successDiv.textContent = validationMessages.success;
                    successDiv.style.display = "block";
                    
                    // Reset form and button
                    form.reset();
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-paper-plane btn-send-icon"></i>Fariin Dir';
                    submitBtn.style.opacity = "1";
                    
                    // Hide success message after 5 seconds
                    setTimeout(() => {
                        successDiv.style.display = "none";
                    }, 5000);
                    
                    // Scroll to show success message
                    successDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 1500);
            }
        });

        // Add live validation as users type
        form.querySelectorAll("input, textarea").forEach(input => {
            input.addEventListener("input", function() {
                clearError(this);
            });
        });
    }

    // Language switching functionality
    const i18n = {
        en: {
            name: 'Ridwan Farah',
            title: 'Electrical & Electronics Engineer | AI Developer',
            nav_profile: 'Profile',
            nav_services: 'Services',
            nav_experience: 'Experience',
            nav_education: 'Education',
            nav_skills: 'Skills',
            nav_projects: 'Projects',
            nav_gallery: 'Gallery',
            nav_videos: 'Videos',
            nav_testimonials: 'Testimonials',
            nav_resume: 'Resume',
            nav_contact: 'Contact',
            section_profile: 'Profile',
            section_services: 'Services I Provide',
            profile_text: "I hold a Bachelor's Degree in Electrical and Electronics Engineering with hands-on experience in designing, analyzing, and retrofitting electrical systems. My passion includes Embedded Systems, Electric Vehicles, and AI for Engineering. I'm dedicated to creating innovative solutions that bridge the gap between hardware and software.",
            stat_years: 'Years Experience',
            stat_projects: 'Projects Completed',
            stat_clients: 'Happy Clients',
            stat_awards: 'Awards Won',
            section_experience: 'Work Experience',
            section_education: 'Education & Training',
            section_skills: 'Skills',
            section_projects: 'Projects',
            section_gallery: 'Gallery',
            section_videos: 'Videos',
            section_testimonials: 'Testimonials',
            section_resume: 'Resume',
            section_contact: 'Contact',
            service_web_title: 'Professional Websites',
            service_web_desc: 'Fast, responsive, and user-friendly websites for businesses and individuals. Built with modern technologies and optimized for performance.',
            service_apps_title: 'Custom Applications',
            service_apps_desc: 'Scalable mobile and desktop applications with modern features tailored to your specific needs and requirements.',
            service_ai_title: 'AI-Powered Chatbots',
            service_ai_desc: 'Smart conversational assistants that enhance customer support, improve sales, and automate business processes.',
            resume_summary_h3: 'Professional Summary',
            resume_summary_p: 'Electrical Engineer with hands-on experience in automotive diagnostics, ECU systems, and vehicle electronics. Skilled across the full project lifecyclefrom concept and design to testing, implementation, and optimizationwhile maintaining a strong focus on safety, efficiency, and innovation.',
            resume_lang_h3: 'Languages',
            lang_somali: 'Somali (Native)',
            lang_english: 'English',
            lang_bengali: 'Bengali',
            lang_turkish: 'Turkish (basic)',
            resume_hobbies_h3: 'Hobbies',
            hobby_riding: 'Riding',
            hobby_writing: 'Writing',
            hobby_listening: 'Listening',
            hobby_learning: 'Learning',
            resume_keyskills_h3: 'Key Skills',
            resume_experience_h3: 'Experience',
            resume_edu_h3: 'Education & Workshops',
            resume_download_btn: 'Download My CV (PDF)',
            form_name: 'Your Name',
            form_email: 'Your Email',
            form_message: 'Your Message',
            form_send: 'Send Message',
            rights: 'All rights reserved.',
            designed: 'Designed with passion by Ridwan Farah'
        },
        so: {
            name: 'Ridwan Farah',
            title: 'Injineer Korontada iyo Elektaroonigga | Hormuudhaye AI',
            nav_profile: 'Profile',
            nav_services: 'Adeegyada',
            nav_experience: 'Khibrad',
            nav_education: 'Waxbarashada',
            nav_skills: 'Xirfadaha',
            nav_projects: 'Mashaariicda',
            nav_gallery: 'Gallery',
            nav_videos: 'Muqaalada',
            nav_testimonials: 'Testimooniyada',
            nav_resume: 'Resume',
            nav_contact: 'Xiriir',
            section_profile: 'Profile',
            section_services: 'Adeegyada aan Bixiyo',
            profile_text: "Waxaan haystaa shahaadada Bachelor ee Injineernimada Korontada iyo Elektaroonigga, waxaana leeyahay khibrad dheeraad ah naqshadeynta, falanqaynta, iyo dayactirka nidaamyada korontada. Waxaan xiiseynaa nidaamyada la guntay, baabuurta korontada, iyo AI ee injineernimada. Waxaan ku dadaalayaa inaan abuuro xallayn cusub oo isku xira hardware iyo software.",
            stat_years: 'Sanooyin Khibrad',
            stat_projects: 'Mashaariic Dhamaystiran',
            stat_clients: 'Macamiil Faraxsan',
            stat_awards: 'Abaalmarin Loo Qaaday',
            section_experience: 'Khibrada Shaqada',
            section_education: 'Waxbarashada iyo Tababarka',
            section_skills: 'Xirfadaha',
            section_projects: 'Mashaariicda',
            section_gallery: 'Gallery',
            section_videos: 'Muqaalada',
            section_testimonials: 'Testimooniyada',
            section_resume: 'Resume',
            section_contact: 'Xiriir',
            service_web_title: 'Website-yaal Xirfad leh',
            service_web_desc: 'Website-yaal degdeg ah, ka jawaabaya, iyo macmiil wanaagsan u ganacsiga iyo shakhsiyadda. Waxaa lagu dhisay technologyad casriga ah waxaana loo habeeyay si ay ugu shaqeyso si fiican.',
            service_apps_title: 'Barnaamijyada Gaar ah',
            service_apps_desc: 'Barnaamijyada mobile iyo desktop ee leh sifooyin casriga ah oo loo qaabeeyay baahiyahaaga gaarka ah.',
            service_ai_title: 'Chatbots-ka AI',
            service_ai_desc: 'Caawiyayaal wada hadle oo xikmad leh oo kor u qaada taageerada macaamiisha, wax soo saarka iyo automation-ka hawlaha ganacsiga.',
            resume_summary_h3: 'Koobid Xirfadeed',
            resume_summary_p: 'Injineer Korontada oo leh khibrad dheeri ah baadhista baabuurta, nidaamyada ECU, iyo elektaroonigada baabuurta. Xirfad lihi nidaamka mashaariicda oo dhan - laga bilaabo fikradda iyo naqshadeynta ilaa imtixaanka, fulinta, iyo hagaajinta - iyadoo lagu sii waday diiradad xooggan ah amniga, wax soo saarka, iyo horumarin.',
            resume_lang_h3: 'Luuqadaha',
            lang_somali: 'Soomaali (Hooyo)',
            lang_english: 'Ingiriisi',
            lang_bengali: 'Bengaali',
            lang_turkish: 'Turki (aasaasi)',
            resume_hobbies_h3: 'Jaammacayaasha',
            hobby_riding: 'Dabaal',
            hobby_writing: 'Qorista',
            hobby_listening: 'Maqalka',
            hobby_learning: 'Barashada',
            resume_keyskills_h3: 'Xirfadaha Muhiimka ah',
            resume_experience_h3: 'Khibrad',
            resume_edu_h3: 'Waxbarashada & Tababarka',
            resume_download_btn: 'Soo Dejiso CV-gayga (PDF)',
            form_name: 'Magacaaga',
            form_email: 'Emailkaaga',
            form_message: 'Fariintaada',
            form_send: 'Dir Fariinta',
            rights: 'Dhammaan xuquuqda waa la xifdiyay.',
            designed: 'Loogu talagalay jecel Ridwan Farah'
        }
    };

    // Language switching functionality
    document.querySelectorAll('.language-switcher button').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            // Update button states
            document.querySelectorAll('.language-switcher button').forEach(b => {
                b.classList.toggle('active', b === btn);
                b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
            });
            
            // Update all elements with data-i18n attribute
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const key = el.getAttribute('data-i18n');
                if (i18n[lang] && i18n[lang][key]) {
                    el.textContent = i18n[lang][key];
                }
            });
            
            // Update placeholder texts
            document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
                const key = el.getAttribute('data-i18n-placeholder');
                if (i18n[lang] && i18n[lang][key]) {
                    el.placeholder = i18n[lang][key];
                }
            });
            
            showMessage(`Language changed to ${lang === 'en' ? 'English' : 'Somali'}`);
        });
    });
});
