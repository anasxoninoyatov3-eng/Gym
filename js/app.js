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

    // --- Google OAuth Logic (Oauth 2 Token Client) ---
    const YOUR_GOOGLE_CLIENT_ID = "719607086494-nb31vdrpp5og7chce4r7sd82pbb57480.apps.googleusercontent.com";
    let tokenClient;

    function initGoogleAuth() {
        if (typeof google === 'undefined') {
            setTimeout(initGoogleAuth, 100);
            return;
        }
        
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: YOUR_GOOGLE_CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
            callback: (tokenResponse) => {
                if (tokenResponse && tokenResponse.access_token) {
                    fetchUserProfile(tokenResponse.access_token);
                }
            },
        });
    }
    initGoogleAuth();

    function fetchUserProfile(accessToken) {
        fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
        .then(response => response.json())
        .then(data => {
            handleRealLogin(data);
        })
        .catch(err => console.error("Error fetching user info", err));
    }

    function handleRealLogin(user) {
        // Kabinet panelidagi ma'lumotlarni o'zgartirish
        const nameDisplay = document.getElementById('user-name-display');
        const emailDisplay = document.getElementById('user-email-display');
        const avatarDisplay = document.getElementById('user-avatar-display');
        
        if (nameDisplay) nameDisplay.innerText = user.name;
        if (emailDisplay) emailDisplay.innerText = user.email;
        if (avatarDisplay) {
            avatarDisplay.innerHTML = `<img src="${user.picture}" alt="Avatar" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
        }

        // LocalStorage ga saqlash
        localStorage.setItem('gymUser', JSON.stringify({
            name: user.name,
            email: user.email,
            picture: user.picture
        }));

        // Modal yopish va Kabinet ochish
        closeModal(regModal);
        openDashboard();
    }

    const customGoogleBtn = document.getElementById("custom-google-btn");
    if (customGoogleBtn) {
        customGoogleBtn.addEventListener("click", () => {
            if (tokenClient) {
                tokenClient.requestAccessToken();
            } else {
                console.error("Google Token Client is not initialized yet.");
            }
        });
    }

    // Old unused JWT function removed

    // Refresh qilinganda foydalanuvchini tiklash
    const savedUser = localStorage.getItem('gymUser');
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            // Kabinet update
            document.getElementById('user-name-display').innerText = user.name;
            document.getElementById('user-email-display').innerText = user.email;
            if (user.picture) {
                document.getElementById('user-avatar-display').innerHTML = `<img src="${user.picture}" alt="Avatar" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
            }

            // Shaxsiy AI Jadval aktiv qilish
            document.getElementById('personal-plan-box').style.display = 'block';
            document.getElementById('plan-user-name').innerText = user.name;

        } catch (e) { }
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

                let lowerText = userText.toLowerCase();
                let numbersInfo = userText.match(/\d+/g);
                let numbers = numbersInfo ? numbersInfo.map(Number) : [];

                if (lowerText.includes('salom') || lowerText.includes('hayr') || lowerText.includes('hello') || lowerText.includes('assalom')) {
                    botDiv.innerHTML = "Salom xush kelibsiz! Men EliteForm fitness maslahatchisiman. Sizga qanday yordam bera olaman? Ozish, semirish yoki shunchaki formani ushlab turishni hohlaysizmi? Yoki bo'yingiz va vazningizni ayting, sizga aniq dastur tuzib beraman.";
                } else if (lowerText.includes('ozish') || lowerText.includes('qorin') || lowerText.includes('ves') || lowerText.includes('ozmoq')) {
                    botDiv.innerHTML = "Ajoyib maqsad! Ozish uchun aerobik va kuch mashqlari muhim. Bizning <strong>EliteForm Fitness</strong> darslarimiz aynan sizga mos. O'z vazningiz va bo'yingizni (sm va kg) aytsangiz, aniqroq qancha vazn tashlash kerakligini hisoblab beraman.";
                } else if (lowerText.includes('semirish') || lowerText.includes('massa') || lowerText.includes('ozgin')) {
                    botDiv.innerHTML = "Massa (mushak) yig'ish uchun asosan kuch mashqlari va to'g'ri ovqatlanish tavsiya qilinadi! <strong>EliteForm Fitness PRO</strong> darsimizga kelsangiz, siz bilan shaxsiy murabbiy ishlaydi.";
                } else if (lowerText.includes('narx') || lowerText.includes('pul') || lowerText.includes('qancha') || lowerText.includes('tarif')) {
                    botDiv.innerHTML = "Narxlarimiz juda qulay! Barcha yo'nalishlar (Yoga, Fitness) oylik atigi <strong>400,000 so'm</strong>, Individual (yakkama-yakka) esa 150ming so'm. <br><br><a href='#pricing' style='color:#00F0FF; text-decoration:underline;'>Tariflarni batafsil ko'rish</a>";
                } else if (numbers.length >= 2) {
                    // Tahminiy boy va vaznni aniqlaymiz (kattasi bo'y, kichkinasi vazn)
                    let height = Math.max(numbers[0], numbers[1]);
                    let weight = Math.min(numbers[0], numbers[1]);

                    // Boyni metrga o'tkazamiz
                    let heightInMeters = height > 3 ? height / 100 : height;

                    let bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
                    let idealWeight = (height - 100) * 0.9;
                    let targetDiff = (weight - idealWeight).toFixed(1);

                    if (targetDiff > 5) {
                        botDiv.innerHTML = `Sizning tana vazni indeksi (BMI): <strong>${bmi}</strong>. Standart vazningiz taxminan <strong>${Math.round(idealWeight)} kg</strong> bo'lishi kerak.<br>Siz yana ${targetDiff} kg vazn tashlashingiz lozim. Bunga <strong>EliteForm Fitness</strong> bilan tezroq erishamiz!<br><br><a href='#schedule' style='color:#00F0FF; text-decoration:underline;'>Jadvalni ko'rish</a>`;
                    } else if (targetDiff < -5) {
                        botDiv.innerHTML = `Sizning BMI: <strong>${bmi}</strong>. Standart vazningiz taxminan <strong>${Math.round(idealWeight)} kg</strong> bo'lishi kerak.<br>Siz biroz vazn to'plashingiz va mushaklarni shakllantirishingiz kerak. Buning uchun <strong>Yoga va Fitness PRO</strong> tavsiya etiladi!<br><br><a href='#schedule' style='color:#00F0FF; text-decoration:underline;'>Dars jadvali</a>`;
                    } else {
                        botDiv.innerHTML = `Super natija! Sizning BMI: <strong>${bmi}</strong>. Vazningiz ideal holatda! Formani doim mo'tadil ushlab turish va zavq uchun <strong>EliteForm Yoga</strong> darslariga keling.`;
                    }
                } else {
                    botDiv.innerHTML = "Kechirasiz, men asosan fitnes, sport va jismoniy holat bo'yicha yordam bera olaman. Iltimos jismoniy holat/qaddu qomat bo'yicha biron gap yozing yoki bo'yingiz (masalan, 175) hamda vazningizni (masalan 80) qoldiring, men hisoblayman.";
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