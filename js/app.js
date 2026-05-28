document.addEventListener("DOMContentLoaded", () => {

    // --- Navbar Scroll Effect ---
    const navbar = document.getElementById("navbar");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });

    // --- Intersection Observer for Fade-In Animations ---
    const faders = document.querySelectorAll('.fade-in');
    const appearOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function (entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('appear');
            observer.unobserve(entry.target);
        });
    }, appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });

    // --- Modals Logic ---
    const regModal = document.getElementById('reg-modal');
    const aiModal = document.getElementById('ai-modal');
    const dashboardPanel = document.getElementById('dashboard-panel');

    // Open Buttons
    const btnHeroCta = document.getElementById('btn-hero-cta');
    const btnPrimaryCta = document.getElementById('btn-primary-cta');
    const btnAiGuide = document.getElementById('btn-ai-guide');
    const btnLogin = document.getElementById('btn-login');
    const payBtns = document.querySelectorAll('.btn-pay');
    const bookableSlots = document.querySelectorAll('.bookable');

    // Close Buttons
    const closeBtns = document.querySelectorAll('.close-modal');
    const closeDashboardBtn = document.getElementById('close-dashboard');

    // Functions to open/close
    const openModal = (modal) => modal.classList.add('show');
    const closeModal = (modal) => modal.classList.remove('show');

    // Event Listeners for Opening
    [btnHeroCta, btnPrimaryCta, ...payBtns, ...bookableSlots].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                openModal(regModal);
            });
        }
    });

    if (btnAiGuide) {
        btnAiGuide.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(aiModal);
        });
    }

    if (btnLogin) {
        btnLogin.addEventListener('click', (e) => {
            e.preventDefault();
            dashboardPanel.classList.add('show');
        });
    }

    // Event Listeners for Closing
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(regModal);
            closeModal(aiModal);
        });
    });

    if (closeDashboardBtn) {
        closeDashboardBtn.addEventListener('click', () => {
            dashboardPanel.classList.remove('show');
        });
    }

    // Close on Outside Click
    window.addEventListener('click', (e) => {
        if (e.target === regModal) closeModal(regModal);
        if (e.target === aiModal) closeModal(aiModal);
        if (e.target === dashboardPanel) dashboardPanel.classList.remove('show');
    });

    // --- Google OAuth Logic ---
    // Make sure to define a configuration logic so it works when the user adds their valid Client ID.
    const YOUR_GOOGLE_CLIENT_ID = "719607086494-nb31vdrpp5og7chce4r7sd82pbb57480.apps.googleusercontent.com";

    // Bu funksiya google script yuklangandan keyin yoki sahifa yuklanganda ishlaydi
    function initGoogleAuth() {
        if (typeof google === 'undefined') {
            console.error("Google script not loaded");
            return;
        }

        google.accounts.id.initialize({
            client_id: YOUR_GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse
        });

        const btnWrapper = document.getElementById("google-btn-wrapper");
        if (btnWrapper) {
            google.accounts.id.renderButton(
                btnWrapper,
                { theme: "filled_black", size: "large", shape: "pill", text: "continue_with" }
            );
        }
    }

    // Callback funksiya login muvaffaqiyatli bulganda ishlaydi
    function handleCredentialResponse(response) {
        console.log("Encoded JWT ID token: " + response.credential);
        // Bu joyda token backendga jo'natiladi. Hozircha login bo'ldi deb hisoblaymiz.
        closeModal(regModal);
        // Kabitnetdi ochish
        dashboardPanel.classList.add('show');
    }

    // Call init if google is already there, or wait for it
    if (typeof google !== 'undefined') {
        initGoogleAuth();
    } else {
        window.onload = initGoogleAuth;
    }

    // --- AI Chat Logic (Mockup) ---
    const aiForm = document.getElementById('ai-form');
    const aiInput = document.getElementById('ai-input');
    const aiChatBody = document.getElementById('ai-chat-body');

    if (aiForm) {
        aiForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const userText = aiInput.value.trim();
            if (!userText) return;

            // Append User Message
            const userDiv = document.createElement('div');
            userDiv.className = 'chat-bubble user';
            userDiv.innerText = userText;
            aiChatBody.appendChild(userDiv);
            aiInput.value = '';

            // Scroll to bottom
            aiChatBody.scrollTop = aiChatBody.scrollHeight;

            // Simulate Bot Typing
            setTimeout(() => {
                const botDiv = document.createElement('div');
                botDiv.className = 'chat-bubble bot';

                // Super basic Logic
                userText.toLowerCase();
                if (userText.includes('ozish') || userText.includes('fitness')) {
                    botDiv.innerHTML = "Sizga <strong>Antigravity Fitness</strong> yo'nalishimizni va murabbiyimiz R.Alisher darslarini tavsiya qilaman. Chidamlilikni oshirish va kaloriyalarni tez yoqishga yordam beradi! <br><br> <a href='#schedule' style='color:#00F0FF; text-decoration:underline;'>Jadvalni ko'rish</a>";
                } else if (userText.includes('bel') || userText.includes('og\'riq') || userText.includes('cho\'zilish') || userText.includes('yoga')) {
                    botDiv.innerHTML = "Orqa miya og'riqlari uchun <strong>Antigravity Yoga</strong> eng yaxshi yechim. A.Kamila yoki N.Dildora murabbiylarimizning darslari sizga mos. <br><br> <a href='#schedule' style='color:#00F0FF; text-decoration:underline;'>Jadvalni ko'rish</a>";
                } else {
                    botDiv.innerHTML = "Juda ajoyib maqsad! Sizga individual yondashuv tavsiya qilamiz. Asosiy sahifadan 'Bepul sinov' orqali yozilsangiz murabbiy o'zi siz bilan bog'lanib maslahat beradi.";
                }

                aiChatBody.appendChild(botDiv);
                aiChatBody.scrollTop = aiChatBody.scrollHeight;

                // Add listener to inside links to close modal and scroll
                const insideLinks = botDiv.querySelectorAll('a');
                insideLinks.forEach(l => {
                    l.addEventListener('click', () => {
                        closeModal(aiModal);
                    });
                });

            }, 1000);
        });
    }

});