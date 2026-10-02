// Termux + Cloudflare backend URL manzili
const SERVER_URL = "https://tub-concentrations-stake-anywhere.trycloudflare.com/send-face";

document.addEventListener('DOMContentLoaded', () => {
    const webcam = document.getElementById('webcam');
    const scanFaceBtn = document.getElementById('scanFaceBtn');
    const faceResult = document.getElementById('faceResult');
    const employeeNameInput = document.getElementById('employeeName');

    // Kamera tasvirini olish
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                if (webcam) {
                    webcam.srcObject = stream;
                }
            })
            .catch((err) => {
                console.error("Kamerani ochishda xatolik:", err);
            });
    }

    // Face-ID skanerlash tugmasi bosilganda
    if (scanFaceBtn) {
        scanFaceBtn.addEventListener('click', () => {
            const fullName = employeeNameInput ? employeeNameInput.value.trim() : "Noma'lum";
            
            if (!fullName) {
                alert("Iltimos, ismingizni kiriting!");
                return;
            }

            const now = new Date();
            const todayDate = now.toLocaleDateString('uz-UZ');
            const timeString = now.toLocaleTimeString('uz-UZ');

            if (faceResult) {
                faceResult.innerText = `✔ Yuz aniqlandi: ${fullName} (${todayDate} ${timeString})`;
                faceResult.style.color = "green";
            }

            // Kadrni ushlab rasm holatiga keltirish
            setTimeout(() => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = webcam.videoWidth || 320;
                    canvas.height = webcam.videoHeight || 240;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(webcam, 0, 0, canvas.width, canvas.height);

                    // Rasmni BLOB shaklida Termux serveriga yuborish
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
                            if (data.status === 'success') {
                                console.log("Muvaffaqiyatli yuborildi:", data);
                            } else {
                                console.error("Server xatosi:", data.message);
                            }
                        })
                        .catch(err => {
                            console.error("Termux serverga ulanishda xatolik:", err);
                        });
                    }, 'image/jpeg');

                } catch (err) {
                    console.error("Rasm olishda xatolik:", err);
                }
            }, 1500);
        });
    }
});
const excelFileInput = document.getElementById('excelFileInput');
const employeeSelect = document.getElementById('employeeSelect');

if (excelFileInput) {
    excelFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (event) => {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            // Birinchi varaqni olish
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // Excel'ni JSON (obyektlar) ro'yxatiga o'tkazish
            const rows = XLSX.utils.sheet_to_json(worksheet);

            // Select (ro'yxat) menyusini tozalash
            employeeSelect.innerHTML = '<option value="">-- Xodimni tanlang --</option>';

            // Har bir xodimlarni ro'yxatga qo'shish
            rows.forEach((row) => {
                // Excel faylingizdagi ustun nomi 'Ism' yoki 'Xodim' deb nomlangan bo'lishi kerak
                const name = row['Ism'] || row['Xodim'] || row['Full Name'] || Object.values(row)[0];
                
                if (name) {
                    const option = document.createElement('option');
                    option.value = name;
                    option.textContent = name;
                    employeeSelect.appendChild(option);
                }
            });

            alert("Xodimlar ro'yxati Excel'dan muvaffaqiyatli yuklandi!");
        };

        reader.readAsArrayBuffer(file);
    });
}