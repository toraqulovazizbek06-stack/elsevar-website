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

// Yuzni Skanerlash va Sana/Vaqt bilan Davomatga Yozish ile Telegram'ga yuborish
scanFaceBtn.addEventListener('click', () => {
    scanOverlay.style.display = 'block';
    faceResult.innerText = "Yuz skanerlanmoqda, kuting...";
    faceResult.style.color = "#007bff";

    setTimeout(() => {
        scanOverlay.style.display = 'none';
        
        // Hozirgi sana va vaqtni olish
        const now = new Date();
        
        // Sana, oy, yil (masalan: 01.10.2026)
        const dateString = now.toLocaleDateString('uz-UZ', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        // Soat, daqiqa, soniya (masalan: 05:30:15)
        const timeString = now.toLocaleTimeString('uz-UZ');

        // Natija matnini ekranga chiqarish
        faceResult.innerText = `✅ Yuz aniqlandi! Xodim: Mehmon | Sana: ${dateString} | Vaqt: ${timeString}`;
        faceResult.style.color = "green";

        // 1. Davomat jadvaliga yangi qator qo'shish
        const tbody = document.getElementById('attendanceBody');
        if (tbody) {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>Mehmon</td>
                <td>${dateString}</td>
                <td>${timeString}</td>
                <td><span style="color: green; font-weight: bold;">Keldi (Qayd etildi)</span></td>
            `;
            tbody.prepend(newRow); // Eng so'nggi qayd tepada ko'rinadi
        }

        // 2. Davomat haqida Telegram botga xabar yuborish
        const telegramMessage = `📸 *Face-ID Davomat Qaydi*\n\n👤 *Xodim:* Mehmon\n📅 *Sana:* ${dateString}\n⏰ *Vaqt:* ${timeString}\n🟢 *Holat:* Keldi (Qayd etildi)`;

        const formData = new FormData();
        formData.append('chat_id', CHAT_ID);
        formData.append('text', telegramMessage);
        formData.append('parse_mode', 'Markdown');

        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (!data.ok) {
                console.error("Telegramga yuborishda xatolik:", data.description);
            }
        })
        .catch(err => console.error("Tarmoq xatosi:", err));

    }, 2500);
});