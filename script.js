const SERVER_URL = "http://localhost:5000/send-face";

const translations = {
    uz: {
        docTitle: "Elsevar - Ishlab chiqarish va Nazorat Tizimi",
        heroHeading: "Elsevar Korxonasi",
        heroSubheading: "Face-ID Davomat va Nazorat Tizimi",
        cardTitle: "Face-ID Davomat",
        lblExcel: "Excel xodimlari ro'yxatini yuklash",
        lblSelectEmp: "Xodimni tanlang",
        optDefaultEmp: "-- Avval Excel yuklang yoki qo'lda kiriting --",
        lblManualName: "Yoki ism-familiyangizni kiriting",
        scanInBtn: "🟢 Ishga kelish",
        scanOutBtn: "🔴 Ishdan ketish",
        switchCamBtn: "🔄 Kamera"
    }
};

let currentStream = null;
let currentFacingMode = "user";

function startCamera(facingMode = "user") {
    const webcam = document.getElementById('webcam');
    if (!webcam) return;
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: facingMode } })
    .then((stream) => {
        currentStream = stream;
        webcam.srcObject = stream;
    })
    .catch((err) => console.error("Kamera xatosi:", err));
}

document.getElementById('switchCamBtn')?.addEventListener('click', () => {
    currentFacingMode = currentFacingMode === "user" ? "environment" : "user";
    startCamera(currentFacingMode);
});

// Umumiy jo'natish funksiyasi (action: 'in' yoki 'out')
async function handleScan(actionType) {
    const webcam = document.getElementById('webcam');
    const empSelect = document.getElementById('employeeSelect');
    const empInput = document.getElementById('employeeName');
    const resultText = document.getElementById('faceResult');

    let fullName = empSelect.value || empInput.value;
    if (!fullName) {
        alert("Iltimos, ism-familiyangizni kiriting yoki tanlang!");
        return;
    }

    resultText.style.color = "#38bdf8";
    resultText.innerText = "📍 Joylashuv va yuz skanerlanmoqda...";

    const getLocation = () => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve({ lat: 39.6548, lon: 66.9597 });
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
                () => resolve({ lat: 39.6548, lon: 66.9597 }),
                { timeout: 5000, enableHighAccuracy: true }
            );
        });
    };

    const loc = await getLocation();

    const canvas = document.createElement('canvas');
    canvas.width = webcam.videoWidth || 640;
    canvas.height = webcam.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(webcam, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append('photo', blob, 'face.jpg');
        formData.append('full_name', fullName);
        formData.append('latitude', loc.lat);
        formData.append('longitude', loc.lon);
        formData.append('action_type', actionType); // 'in' yoki 'out'

        try {
            const response = await fetch(SERVER_URL, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (response.ok && data.status === 'success') {
                resultText.style.color = "#4ade80";
                resultText.innerText = `✅ ${data.action} muvaffaqiyatli saqlandi!`;
            } else {
                resultText.style.color = "#f87171";
                resultText.innerText = "❌ " + (data.message || "Rad etildi!");
            }
        } catch (err) {
            resultText.style.color = "#f87171";
            resultText.innerText = "❌ Server bilan aloqa yo'q!";
        }
    }, 'image/jpeg');
}

document.getElementById('scanInBtn')?.addEventListener('click', () => handleScan('in'));
document.getElementById('scanOutBtn')?.addEventListener('click', () => handleScan('out'));

window.addEventListener('DOMContentLoaded', () => {
    startCamera(currentFacingMode);
});