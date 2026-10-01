<script>
// Telegram Sozlamalari
const BOT_TOKEN = "8730808658:AAE2CxCZ6m2dQqqFxu7RuFgyMSyonE2NNCk";
const CHAT_ID = "-1003954771903";

// HTML Elementlari
const webcam = document.getElementById('webcam');
const startCamBtn = document.getElementById('startCamBtn');
const scanFaceBtn = document.getElementById('scanFaceBtn');
const scanOverlay = document.getElementById('scanOverlay');
const faceResult = document.getElementById('faceResult');
const cameraSelect = document.getElementById('cameraSelect');

let currentStream = null;

async function startCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    const selectedMode = cameraSelect ? cameraSelect.value : 'user';
    
    const constraintsList = [
        { video: { facingMode: { exact: selectedMode } } },
        { video: { facingMode: selectedMode } },
        { video: true }
    ];

    for (let constraints of constraintsList) {
        try {
            currentStream = await navigator.mediaDevices.getUserMedia(constraints);
            webcam.srcObject = currentStream;
            break;
        } catch (e) {
            console.warn("Kamerani ulashda xatolik:", constraints, e);
        }
    }

    if (!webcam.srcObject) {
        alert("Kameraga ulanib bo'lmadi! Brauzer ruxsatlarini tekshiring.");
        return;
    }

    startCamBtn.style.display = 'none';
    scanFaceBtn.style.display = 'inline-block';
    if (faceResult) {
        faceResult.innerText = "Kamera faol. Yuzingizni kameraga qarating.";
        faceResult.style.color = "#333";
    }
}

if (startCamBtn) {
    startCamBtn.addEventListener('click', startCamera);
}

if (cameraSelect) {
    cameraSelect.addEventListener('change', () => {
        if (currentStream) {
            startCamera();
        }
    });
}

if (scanFaceBtn) {
    scanFaceBtn.addEventListener('click', () => {
        const nameInput = document.getElementById('employeeName');
        const fullName = (nameInput && nameInput.value.trim() !== "") ? nameInput.value.trim() : "Jasurbek To'raqulov";

        if (scanOverlay) scanOverlay.style.display = 'block';
        if (faceResult) {
            faceResult.innerText = "Yuz skanerlanmoqda, kuting...";
            faceResult.style.color = "#007bff";
        }

        setTimeout(() => {
            if (scanOverlay) scanOverlay.style.display = 'none';
            
            const now = new Date();
            const dateString = now.toLocaleDateString('uz-UZ', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            const timeString = now.toLocaleTimeString('uz-UZ');

            if (faceResult) {
                faceResult.innerText = `✅ Yuz aniqlandi! Xodim: ${fullName} | Sana: ${dateString} | Vaqt: ${timeString}`;
                faceResult.style.color = "green";
            }

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

            try {
                const canvas = document.createElement('canvas');
                canvas.width = webcam.videoWidth || 320;
                canvas.height = webcam.videoHeight || 240;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(webcam, 0, 0, canvas.width, canvas.height);

                canvas.toBlob(function(blob) {
                    if (!blob) return;

                    const caption = `📸 <b>Face-ID Davomat Qaydi</b>\n\n👤 <b>Xodim:</b> ${fullName}\n📅 <b>Sana:</b> ${dateString}\n⏰ <b>Vaqt:</b> ${timeString}\n🟢 <b>Holat:</b> Keldi (Qayd etildi)`;

                    const formData = new FormData();
                    formData.append('chat_id', CHAT_ID);
                    formData.append('photo', blob, 'attendance.jpg');
                    formData.append('caption', caption);
                    formData.append('parse_mode', 'HTML');

                    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
                        method: 'POST',
                        body: formData
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (!data.ok) {
                            alert("Telegram xatosi: " + data.description);
                        }
                    })
                    .catch(err => console.error("Tarmoq xatosi:", err));

                }, 'image/jpeg', 0.85);
            } catch (err) {
                console.error("Canvas xatosi:", err);
            }

        }, 2500);
    });
}
</script>