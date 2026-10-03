const SERVER_URL = "https://tub-concentrations-stake-anywhere.trycloudflare.com/send-face";

let currentStream = null;
let currentFacingMode = "user"; // 'user' - oldi kamera, 'environment' - orqa kamera

// Kamerani faqat chaqirilganda yoqish
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
        .catch((err) => {
            console.error("Kamera xatosi:", err);
        });
}

// "Kirish" tugmasi bosilganda modal oynani yopish VA KAMERANI YOQISH
function submitRegistration() {
    const modal = document.getElementById('registerModal');
    const firstName = document.getElementById('regFirstName')?.value.trim();
    const lastName = document.getElementById('regLastName')?.value.trim();
    const employeeNameInput = document.getElementById('employeeName');

    if (firstName || lastName) {
        if (employeeNameInput) {
            employeeNameInput.value = `${firstName} ${lastName}`.trim();
        }
    }

    if (modal) {
        modal.style.display = 'none'; // Ro'yxatdan o'tish oynasi yo'qoladi
    }

    // AYNAN SHU YERDA KAMERA ISHGA TUSHADI
    startCamera(currentFacingMode);
}

document.addEventListener('DOMContentLoaded', () => {
    const scanFaceBtn = document.getElementById('scanFaceBtn');
    const faceResult = document.getElementById('faceResult');
    const excelFileInput = document.getElementById('excelFileInput');
    const employeeSelect = document.getElementById('employeeSelect');
    const switchCamBtn = document.getElementById('switchCamBtn');
    const webcam = document.getElementById('webcam');

    // Kamera almashtirish (Oldi/Orqa)
    if (switchCamBtn) {
        switchCamBtn.addEventListener('click', () => {
            currentFacingMode = (currentFacingMode === "user") ? "environment" : "user";
            startCamera(currentFacingMode);
        });
    }

    // Excel o'qish
    if (excelFileInput && employeeSelect) {
        excelFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    const rows = XLSX.utils.sheet_to_json(worksheet);

                    employeeSelect.innerHTML = '<option value="">-- Xodimni tanlang --</option>';

                    rows.forEach((row) => {
                        const name = row['Ism'] || row['Xodim'] || row['Full Name'] || Object.values(row)[0];
                        if (name) {
                            const option = document.createElement('option');
                            option.value = name;
                            option.textContent = name;
                            employeeSelect.appendChild(option);
                        }
                    });

                    alert("Xodimlar ro'yxati Excel'dan yuklandi!");
                } catch (err) {
                    alert("Excel faylini o'qishda xatolik!");
                }
            };
            reader.readAsArrayBuffer(file);
        });
    }

    // Face-ID skanerlash va Termux serverga yuborish
    if (scanFaceBtn) {
        scanFaceBtn.addEventListener('click', () => {
            let fullName = "Noma'lum";
            if (employeeSelect && employeeSelect.value) {
                fullName = employeeSelect.value;
            } else {
                const employeeNameInput = document.getElementById('employeeName');
                if (employeeNameInput && employeeNameInput.value.trim()) {
                    fullName = employeeNameInput.value.trim();
                }
            }

            if (!fullName || fullName === "Noma'lum") {
                alert("Iltimos, xodimni tanlang yoki ismingizni kiriting!");
                return;
            }

            const now = new Date();
            const todayDate = now.toLocaleDateString('uz-UZ');
            const timeString = now.toLocaleTimeString('uz-UZ');

            if (faceResult) {
                faceResult.innerText = `✔ Yuz aniqlandi: ${fullName} (${todayDate} ${timeString})`;
                faceResult.style.color = "green";
            }

            setTimeout(() => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = webcam.videoWidth || 320;
                    canvas.height = webcam.videoHeight || 240;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(webcam, 0, 0, canvas.width, canvas.height);

                    canvas.toBlob((blob) => {
                        const formData = new FormData();
                        formData.append('photo', blob, 'face.jpg');
                        formData.append('full_name', fullName);
                        formData.append('date_str', todayDate);
                        formData.append('time_str', timeString);

                        fetch(SERVER_URL, {
                            method: 'POST',
                            body: formData
                        })
                        .then(res => res.json())
                        .then(data => {
                            console.log("Termux server javobi:", data);
                        })
                        .catch(err => {
                            console.error("Termux xatosi:", err);
                        });
                    }, 'image/jpeg');

                } catch (err) {
                    console.error("Rasm olish xatosi:", err);
                }
            }, 500);
        });
    }
});