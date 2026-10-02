// Termux + Cloudflare backend URL manzili
const SERVER_URL = "https://tub-concentrations-stake-anywhere.trycloudflare.com/send-face";

// 1. "Kirish" (Ro'yxatdan o'tish) oynasini berkitish funksiyasi
function submitRegistration() {
    const modal = document.getElementById('registerModal');
    if (modal) {
        modal.style.display = 'none'; // Ro'yxatdan o'tish oynasini yopadi
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const webcam = document.getElementById('webcam');
    const scanFaceBtn = document.getElementById('scanFaceBtn');
    const faceResult = document.getElementById('faceResult');
    const excelFileInput = document.getElementById('excelFileInput');
    const employeeSelect = document.getElementById('employeeSelect');

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

    // 2. Excel faylni o'qish va ro'yxatni to'ldirish
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

                    alert("Xodimlar ro'yxati Excel'dan muvaffaqiyatli yuklandi!");
                } catch (err) {
                    console.error("Excel faylni o'qishda xatolik:", err);
                    alert("Excel faylini o'qishda xatolik yuz berdi!");
                }
            };

            reader.readAsArrayBuffer(file);
        });
    }

    // 3. Face-ID skanerlash va Termux serverga yuborish
    if (scanFaceBtn) {
        scanFaceBtn.addEventListener('click', () => {
            // Ismni Excel ro'yxatidan yoki inputdan olish
            let fullName = "Noma'lum";
            if (employeeSelect && employeeSelect.value) {
                fullName = employeeSelect.value;
            } else {
                const employeeNameInput = document.getElementById('employeeName');
                if (employeeNameInput && employeeNameInput.value.trim()) {
                    fullName = employeeNameInput.value.trim();
                }
            }

            if (fullName === "Noma'lum" || !fullName) {
                alert("Iltimos, avval xodimni tanlang yoki ismingizni kiriting!");
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
            }, 1000);
        });
    }
});