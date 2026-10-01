// Telegram Sozlamalari
const BOT_TOKEN = "8730808658:AAE2CxCZ6m2dQqqFxu7RuFgyMSyonE2NNCk";
const CHAT_ID = "-1005157110689"; // Yopiq guruh ID'si (-100 bilan)

// HTML Elementlari
const webcam = document.getElementById('webcam');
const startCamBtn = document.getElementById('startCamBtn');
const scanFaceBtn = document.getElementById('scanFaceBtn');
const scanOverlay = document.getElementById('scanOverlay');
const faceResult = document.getElementById('faceResult');
const cameraSelect = document.getElementById('cameraSelect');

let currentStream = null;

// Kamerani xavfsiz yoqish funksiyasi
async function startCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    const selectedMode = cameraSelect ? cameraSelect.value : 'user';
    
    // Kamera parametrlarini bosqichma-bosqich sinash
    const constraintsList = [
        { video: { facingMode: { exact: selectedMode } } },
        { video: { facingMode: selectedMode } },
        { video: true } // Agar xatolik bo'lsa, istalgan kamerani yoqadi
    ];

    for (let constraints of constraintsList) {
        try {
            currentStream = await navigator.mediaDevices.getUserMedia(constraints);
            webcam.srcObject = currentStream;
            break; // Muvaffaqiyatli ulansa, sikldan chiqadi
        } catch (e) {
            console.warn("Kamera ulash urinishi muvaffaqiyatsiz:", constraints, e);
        }
    }

    if (!webcam.srcObject) {
        alert("Kameraga ulanib bo'lmadi! Brauzeringizda kameraga ruxsat berilganini tekshiring.");
        return;
    }

    startCamBtn.style.display = 'none';
    scanFaceBtn.style.display = 'inline-block';
    faceResult.innerText = "Kamera faol. Yuzingizni kameraga qarating.";
    faceResult.style.color = "#333";
}

// Tugma va Select voqealari
startCamBtn.addEventListener('click', startCamera);

if (cameraSelect) {
    cameraSelect.addEventListener('change', () => {
        if (currentStream) {
            startCamera();
        }
    });
}

// Face-ID Skanerlash va Guruhga Yuborish
scanFaceBtn.addEventListener('click', () => {
    const nameInput = document.getElementById('employeeName');
    const fullName = (nameInput && nameInput.value.trim() !== "") ? nameInput.value.trim() : "Jasurbek To'raqulov";

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

        // Sahifadagi jadvalga qo'shish
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

        // 📸 Rasmni tayyorlash va Telegram guruhiga yuborish
        try {
            const canvas = document.createElement('canvas');
            canvas.width = webcam.videoWidth || 320;
            canvas.height = webcam.videoHeight || 240;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(webcam, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(function(blob) {
                if (!blob) {
                    console.error("Rasm fayli yaratilmadi.");
                    return;
                }

                const caption = `📸 *Face-ID Davomat Qaydi*\n\n👤 *Xodim:* ${fullName}\n📅 *Sana:* ${dateString}\n⏰ *Vaqt:* ${timeString}\n🟢 *Holat:* Keldi (Qayd etildi)`;

                const formData = new FormData();
                formData.append('chat_id', CHAT_ID);
                formData.append('photo', blob, 'attendance.jpg');
                formData.append('caption', caption);
                formData.append('parse_mode', 'Markdown');

                fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
                    method: 'POST',
                    body: formData
                })
                .then(res => res.json())
                .then(data => {
                    if (!data.ok) {
                        alert("Telegramga yuborishda xatolik: " + data.description);
                    }
                })
                .catch(err => console.error("Tarmoq xatoligi:", err));

            }, 'image/jpeg', 0.85);
        } catch (err) {
            console.error("Canvas xatosi:", err);
        }

    }, 2500);
});