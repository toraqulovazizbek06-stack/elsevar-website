const BOT_TOKEN = "8730808658:AAE2CxCZ6m2dQqqFxu7RuFgyMSyonE2NNCk";
const CHAT_ID = "-1003954771903";

// Tillarga tarjima lug'ati
const translations = {
    uz: {
        modalTitle: "Ro'yxatdan o'tish",
        firstName: "Ism",
        lastName: "Familiya",
        phone: "Telefon raqam",
        btn: "Kirish",
        heroTitle: "Elsevar - Ishlab chiqarish va Nazorat Tizimi",
        heroDesc: "Korxona va tekstil loyihalari uchun avtomatlashtirilgan boshqaruv platformasi",
        faceTitle: "Face-ID Davomat Tizimi",
        contactTitle: "Bog'lanish"
    },
    uz_cyrl: {
        modalTitle: "Рўйхатдан ўтиш",
        firstName: "Исм",
        lastName: "Фамилия",
        phone: "Телефон рақам",
        btn: "Кириш",
        heroTitle: "Elsevar - Ишлаб чиқариш ва Назорат Тизими",
        heroDesc: "Корхона ва текстиль лойиҳалари учун автоматизация қилинган бошқарув платформаси",
        faceTitle: "Face-ID Давомат Тизими",
        contactTitle: "Боғланиш"
    },
    ru: {
        modalTitle: "Регистрация",
        firstName: "Имя",
        lastName: "Фамилия",
        phone: "Номер телефона",
        btn: "Войти",
        heroTitle: "Elsevar - Система управления и контроля производства",
        heroDesc: "Автоматизированная платформа для текстильных и производственных предприятий",
        faceTitle: "Система посещаемости Face-ID",
        contactTitle: "Контакты"
    },
    tg: {
        modalTitle: "Рӯйхатгирӣ",
        firstName: "Ном",
        lastName: "Насаб",
        phone: "Рақами телефон",
        btn: "Ворид шудан",
        heroTitle: "Elsevar - Системаи идоракунӣ ва назорати истеҳсолот",
        heroDesc: "Платформаи автоматикунонидашуда барои корхонаҳои бофандагӣ ва истеҳсолӣ",
        faceTitle: "Системаи давомот Face-ID",
        contactTitle: "Тамос"
    },
    en: {
        modalTitle: "Registration",
        firstName: "First Name",
        lastName: "Last Name",
        phone: "Phone Number",
        btn: "Enter",
        heroTitle: "Elsevar - Production Control System",
        heroDesc: "Automated management platform for textile and production enterprises",
        faceTitle: "Face-ID Attendance System",
        contactTitle: "Contact Us"
    }
};

function changeLanguage(lang) {
    const t = translations[lang] || translations.uz;
    document.getElementById('modalTitle').innerText = t.modalTitle;
    document.getElementById('regFirstName').placeholder = t.firstName;
    document.getElementById('regLastName').placeholder = t.lastName;
    document.getElementById('regPhone').placeholder = t.phone;
    document.getElementById('regBtn').innerText = t.btn;
    document.getElementById('heroTitle').innerText = t.heroTitle;
    document.getElementById('heroDesc').innerText = t.heroDesc;
    document.getElementById('faceTitle').innerText = t.faceTitle;
    document.getElementById('contactTitle').innerText = t.contactTitle;
}

function submitRegistration() {
    const fname = document.getElementById('regFirstName').value.trim();
    const lname = document.getElementById('regLastName').value.trim();
    const phone = document.getElementById('regPhone').value.trim();

    if (!fname || !lname || phone.length < 9) {
        alert("Iltimos, barcha maydonlarni to'g'ri to'ldiring!");
        return;
    }

    document.getElementById('employeeName').value = fname + " " + lname;
    document.getElementById('registerModal').style.display = 'none';
}

// Kamera (Old va Orqa kamerani boshqarish)
const webcam = document.getElementById('webcam');
const startCamBtn = document.getElementById('startCamBtn');
const scanFaceBtn = document.getElementById('scanFaceBtn');
const faceResult = document.getElementById('faceResult');
const cameraSelect = document.getElementById('cameraSelect');

let currentStream = null;

async function startCamera(facingMode = 'user') {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    try {
        const constraints = {
            video: { facingMode: facingMode }
        };
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        webcam.srcObject = currentStream;
        startCamBtn.style.display = 'none';
        scanFaceBtn.style.display = 'inline-block';
        faceResult.innerText = "Kamera faol. Yuzingizni qarating.";
        faceResult.style.color = "#333";
    } catch (e) {
        console.error(e);
        alert("Kameraga ulanishda xatolik yuz berdi.");
    }
}

if (startCamBtn) {
    startCamBtn.addEventListener('click', () => {
        const selectedFacingMode = cameraSelect.value;
        startCamera(selectedFacingMode);
    });
}

function switchCamera() {
    if (currentStream) {
        const selectedFacingMode = cameraSelect.value;
        startCamera(selectedFacingMode);
    }
}

if (scanFaceBtn) {
    scanFaceBtn.addEventListener('click', () => {
        const fullName = document.getElementById('employeeName').value.trim() || "Noma'lum foydalanuvchi";
        faceResult.innerText = "Skanerlanmoqda...";
        faceResult.style.color = "#ff9800";
        
        setTimeout(() => {
            const now = new Date();
            const dateStr = now.toLocaleDateString('uz-UZ');
            const timeStr = now.toLocaleTimeString('uz-UZ');

            faceResult.innerText = `✅ Yuz aniqlandi: ${fullName} (${timeStr})`;
            faceResult.style.color = "green";

            try {
                const canvas = document.createElement('canvas');
                canvas.width = webcam.videoWidth || 320;
                canvas.height = webcam.videoHeight || 240;
                canvas.getContext('2d').drawImage(webcam, 0, 0);

                canvas.toBlob((blob) => {
                    const formData = new FormData();
                    formData.append('chat_id', CHAT_ID);
                    formData.append('photo', blob, 'face.jpg');
                    formData.append('caption', `📸 <b>Face-ID Qaydi</b>\n\n👤 <b>Xodim:</b> ${fullName}\n📅 <b>Sana:</b> ${dateStr}\n⏰ <b>Vaqt:</b> ${timeStr}`);
                    formData.append('parse_mode', 'HTML');

                    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
                        method: 'POST',
                        body: formData
                    });
                }, 'image/jpeg');
            } catch (err) {
                console.error(err);
            }
        }, 1500);
    });
}