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

    // Modal State Functions
    const openModal = (modal) => {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    };
    const closeModal = (modal) => {
        modal.classList.remove('show');
        if (!dashboardPanel.classList.contains('show')) {
            document.body.style.overflow = '';
        }
    };
    const openDashboard = () => {
        dashboardPanel.classList.add('show');
        document.body.style.overflow = 'hidden';
    };
    const closeDashboard = () => {
        dashboardPanel.classList.remove('show');
        document.body.style.overflow = '';
    };

    // Event Listeners for Opening Login
    [btnHeroCta, btnPrimaryCta, ...bookableSlots].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                openModal(regModal);
            });
        }
    });

    // Event Listener for Telegram Redirects (Pricing buttons and dashboard Telegram button)
    const allTgBtns = [...payBtns];
    const dashboardTgBtn = document.getElementById('btn-tg-receipt');
    if (dashboardTgBtn) allTgBtns.push(dashboardTgBtn);

    allTgBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                window.open('https://t.me/torvensnow', '_blank');
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
            openDashboard();
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
            closeDashboard();
        });
    }

    // Close on Outside Click
    window.addEventListener('click', (e) => {
        if (e.target === regModal) closeModal(regModal);
        if (e.target === aiModal) closeModal(aiModal);
        if (e.target === dashboardPanel) {
            closeDashboard();
        }
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

    // JWT dekodlash funksiyasi
    function decodeJwtResponse(token) {
        let base64Url = token.split('.')[1];
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        let jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    }

    // Callback funksiya login muvaffaqiyatli bulganda ishlaydi
    function handleCredentialResponse(response) {
        const responsePayload = decodeJwtResponse(response.credential);

        // Kabinet panelidagi ma'lumotlarni o'zgartirish
        document.getElementById('user-name-display').innerText = responsePayload.name;
        document.getElementById('user-email-display').innerText = responsePayload.email;
        if (responsePayload.picture) {
            document.getElementById('user-avatar-display').innerHTML = `<img src="${responsePayload.picture}" alt="Avatar" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
        }

        // LocalStorage ga saqlash, refresh qilinganda chiqib ketmasligi uchun
        localStorage.setItem('gymUser', JSON.stringify({
            name: responsePayload.name,
            email: responsePayload.email,
            picture: responsePayload.picture
        }));

        closeModal(regModal);

        // Kabitnetdi ochish
        openDashboard();
    }

    // Refresh qilinganda foydalanuvchini tiklash
    const savedUser = localStorage.getItem('gymUser');
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            document.getElementById('user-name-display').innerText = user.name;
            document.getElementById('user-email-display').innerText = user.email;
            if (user.picture) {
                document.getElementById('user-avatar-display').innerHTML = `<img src="${user.picture}" alt="Avatar" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
            }
        } catch (e) { }
    }

    // Call init if google is already there, or wait for it
    if (typeof google !== 'undefined') {
        initGoogleAuth();
    } else {
        window.addEventListener('load', initGoogleAuth);
    }

    // --- Logout (Chiqish) ---
    const logoutBtn = document.querySelector('.dashboard-sidebar .btn-outline[style*="margin-top: 30px"]');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('gymUser');
            // reset UI dummy text
            document.getElementById('user-name-display').innerText = 'Foydalanuvchi';
            document.getElementById('user-email-display').innerText = 'Elektron pochta';
            document.getElementById('user-avatar-display').innerHTML = `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>`;
            closeDashboard();
            // sahifani ixtiyoriy yangilash
            // window.location.reload();
        });
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

                let textParams = userText.toLowerCase().replace(/[^0-9 ]/g, "").trim().split(/\s+/);
                let numbers = textParams.map(Number).filter(n => n > 0);

                if (numbers.length >= 2) {
                    // Tahminiy boy va vaznni aniqlaymiz (kattasi bo'y, kichkinasi vazn)
                    let height = Math.max(numbers[0], numbers[1]);
                    let weight = Math.min(numbers[0], numbers[1]);

                    // Boyni metrga o'tkazamiz
                    let heightInMeters = height > 3 ? height / 100 : height;

                    let bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
                    let idealWeight = (height - 100) * 0.9;
                    let targetDiff = (weight - idealWeight).toFixed(1);

                    if (targetDiff > 5) {
                        botDiv.innerHTML = `Sizning BMI (Tana vazni indeksi): <strong>${bmi}</strong>. Standart (ideal) vazningiz taxminan <strong>${Math.round(idealWeight)} kg</strong> bo'lishi kerak.<br>Siz ${targetDiff} kg vazn tashlashingiz lozim. Bunga <strong>Antigravity Fitness</strong> orqali oson erishamiz!<br><br><a href='#schedule' style='color:#00F0FF; text-decoration:underline;'>Jadvalni ko'rish</a>`;
                    } else if (targetDiff < -5) {
                        botDiv.innerHTML = `Sizning BMI: <strong>${bmi}</strong>. Standart vazningiz taxminan <strong>${Math.round(idealWeight)} kg</strong> bo'lishi kerak.<br>Siz biroz vazn to'plashingiz va mushaklarni shakllantirishingiz kerak. Buning uchun <strong>Yoga va Fitness PRO</strong> tavsiya etiladi!`;
                    } else {
                        botDiv.innerHTML = `Super! Sizning BMI: <strong>${bmi}</strong>. Vazningiz ideal holatda! Formani ushlab turish va moslashuvchanlik uchun <strong>Antigravity Yoga</strong> darslariga keling.`;
                    }
                } else {
                    botDiv.innerHTML = "Iltimos, aniqroq raqamlarni kiriting. Masalan: <strong>175 sm va 80 kg</strong> deb yozing.";
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