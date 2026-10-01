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
const faceResult = document.getElementById('faceResult'); // ✅ To'g'ri

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
    // Ism-familiyani olish
    const nameInput = document.getElementById('employeeName');
    const fullName = nameInput && nameInput.value.trim() !== "" ? nameInput.value.trim() : "Jasurbek To'raqulov";

    scanOverlay.style.display = 'block';
    faceResult.innerText = "Yuz skanerlanmoqda, kuting...";
    faceResult.style.color = "#007bff";

    setTimeout(() => {
        scanOverlay.style.display = 'none';
        
        const now = new Date();
        const dateString = now.toLocaleDateString('uz-UZ', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const timeString = now.toLocaleTimeString('uz-UZ');

        faceResult.innerText = `✅ Yuz aniqlandi! Xodim: ${fullName} | Sana: ${dateString} | Vaqt: ${timeString}`;
        faceResult.style.color = "green";

        // Davomat jadvaliga qo'shish
        const tbody = document.getElementById('attendanceBody');
        if (tbody) {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${fullName}</td>
                <td>${dateString}</td>
                <td>${timeString}</td>
                <td><span style="color: green; font-weight: bold;">Keldi (Qayd etildi)</span></td>
            `;
            tbody.prepend(newRow);
        }

        // 📸 Kameradan rasmni qirqib olish (Canvas)
        const canvas = document.createElement('canvas');
        canvas.width = webcam.videoWidth || 320;
        canvas.height = webcam.videoHeight || 240;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(webcam, 0, 0, canvas.width, canvas.height);

        // Canvas'dan Blob (rasm fayli) hosil qilish va Telegram'ga sendPhoto orqali yuborish
        canvas.toBlob((blob) => {
            const telegramCaption = `📸 *Face-ID Davomat Qaydi*\n\n👤 *Xodim:* ${fullName}\n📅 *Sana:* ${dateString}\n⏰ *Vaqt:* ${timeString}\n🟢 *Holat:* Keldi (Qayd etildi)`;

            const formData = new FormData();
            formData.append('chat_id', CHAT_ID);
            formData.append('photo', blob, 'face_scan.jpg');
            formData.append('caption', telegramCaption);
            formData.append('parse_mode', 'Markdown');

            fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
                method: 'POST',
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                if (!data.ok) {
                    console.error("Rasm yuborishda xatolik:", data.description);
                }
            })
            .catch(err => console.error("Tarmoq xatosi:", err));
        }, 'image/jpeg');

    }, 2500);
});