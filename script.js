// O'zingizning Bot Token va Chat ID'ingizni burchakli qavslarsiz kiriting
const BOT_TOKEN = "8730808658:AAE2CxCZ6m2dQqqFxu7RuFgyMSyonE2NNCk";
const CHAT_ID = "8431365235";

document.getElementById('leadForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Inputlardan qiymatlarni olish
    const inputs = this.querySelectorAll('input');
    const name = inputs[0].value;
    const phone = inputs[1].value;

    // Telegram'ga yuboriladigan xabar matni
    const message = `🚀 *Yangi Ariza (Elsevar Sayti)*\n\n👤 *Ismi:* ${name}\n📞 *Telefon:* ${phone}`;

    // Telegram API orqali xabar yuborish
    fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        })
    })
    .then(response => {
        if (response.ok) {
            alert("Arizangiz muvaffaqiyatli yuborildi! Tez orada siz bilan bog'lanamiz.");
            this.reset();
        } else {
            alert("Xatolik yuz berdi. Qayta urinib ko'ring.");
        }
    })
    .catch(error => {
        alert("Tarmoq xatosi yuz berdi: " + error);
    });
});