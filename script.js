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