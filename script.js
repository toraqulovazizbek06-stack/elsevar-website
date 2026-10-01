const BOT_TOKEN = "8730808658:AAE2CxCZ6m2dQqqFxu7RuFgyMSyonE2NNCk";
const CHAT_ID = "-1005157110689";

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
const cameraSelect = document.getElementById('cameraSelect');

let currentStream = null;

// Eski kamera oqimini to'xtatish
function stopCameraStream() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }
}

// Tanlangan kamerani yoqish
async function startCamera() {
    stopCameraStream();
    const facingMode = cameraSelect.value; // 'user' yoki 'environment'

    try {
        currentStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { exact: facingMode } }
        });
        webcam.srcObject = currentStream;
    } catch (err) {
        try {
            currentStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facingMode }
            });
            webcam.srcObject = currentStream;
        } catch (e) {
            alert("Kamera topilmadi yoki ruxsat berilmadi!");
            return;
        }
    }

    startCamBtn.style.display = 'none';
    scanFaceBtn.style.display = 'inline-block';
    faceResult.innerText = "Kamera faol. Yuzingizni kameraga qarating.";
    faceResult.style.color = "#333";
}

// Menyu o'zgarganda kamerani almashtirish
cameraSelect.addEventListener('change', () => {
    if (currentStream) {
        startCamera();
    }
});

startCamBtn.addEventListener('click', startCamera);

// Skanerlash va guruhga yuborish
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

        // Rasmni qirqib olish va yopiq guruhga yuborish
        try {
            const canvas = document.createElement('canvas');
            canvas.width = webcam.videoWidth || 320;
            canvas.height = webcam.videoHeight || 240;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(webcam, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(function(blob) {
                if (!blob) return;

                const caption = `📸 *Face-ID Davomat Qaydi*\n\n👤 *Xodim:* ${fullName}\n📅 *Sana:* ${dateString}\n⏰ *Vaqt:* ${timeString}\n🟢 *Holat:* Keldi (Qayd etildi)`;

                const formData = new FormData();
                formData.append('chat_id', CHAT_ID); // Yopiq guruh ID'si (-100...)
                formData.append('photo', blob, 'scan.jpg');
                formData.append('caption', caption);
                formData.append('parse_mode', 'Markdown');

                fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
                    method: 'POST',
                    body: formData
                })
                .then(res => res.json())
                .then(data => {
                    if (!data.ok) console.error("Telegram xatolik:", data);
                })
                .catch(err => console.error("Tarmoq xatosi:", err));
            }, 'image/jpeg', 0.8);
        } catch (e) {
            console.error("Canvas error:", e);
        }

    }, 2500);
});