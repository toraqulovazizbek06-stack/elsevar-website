const BOT_TOKEN = "8730808658:AAE2CxCZ6m2dQqqFxu7RuFgyMSyonE2NNCk";
const CHAT_ID = "8431365235";

document.getElementById('leadForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const inputs = this.querySelectorAll('input');
    const name = inputs[0].value;
    const phone = inputs[1].value;

    const message = `🚀 Yangi Ariza (Elsevar Sayti)\n\n👤 Ismi: ${name}\n📞 Telefon: ${phone}`;

    // FormData orqali yuborish
    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    formData.append('text', message);

    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.ok) {
            alert("Arizangiz muvaffaqiyatli yuborildi!");
            this.reset();
        } else {
            alert("Xatolik: " + data.description);
        }
    })
    .catch(error => {
        alert("Tarmoq xatosi: " + error);
    });
});
// Face-ID Kamera Elementlari
const webcam = document.getElementById('webcam');
const startCamBtn = document.getElementById('startCamBtn');
const scanFaceBtn = document.getElementById('scanFaceBtn');
const scanOverlay = document.getElementById('scanOverlay');
const faceResult = document.getElementById('faceResult');

// Kamerani Yoqish
startCamBtn.addEventListener('click', async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        webcam.srcObject = stream;
        startCamBtn.style.display = 'none';
        scanFaceBtn.style.display = 'inline-block';
        faceResult.innerText = "Kamera faol. Yuzingizni kameraga qarating.";
        faceResult.style.color = "#333";
    } catch (err) {
        alert("Kameraga ruxsat berilmadi yoki kamera topilmadi!");
    }
});

// Yuzni Skanerlash (Simulyatsiya / Demo)
scanFaceBtn.addEventListener('click', () => {
    scanOverlay.style.display = 'block';
    faceResult.innerText = "Yuz skanerlanmoqda, kuting...";
    faceResult.style.color = "#007bff";

    setTimeout(() => {
        scanOverlay.style.display = 'none';
        
        // Muvaffaqiyatli aniqlangan holat
        const now = new Date().toLocaleTimeString('uz-UZ');
        faceResult.innerText = `✅ Yuz aniqlandi! Xodim: Mehmon | Vaqt: ${now} (Davomatga yozildi)`;
        faceResult.style.color = "green";
    }, 2500);
});