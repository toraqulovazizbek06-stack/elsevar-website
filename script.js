document.getElementById('leadForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Sahifa qayta yuklanishini oldini oladi
    
    alert("Rahmat! Arizangiz qabul qilindi. Soon siz bilan bog'lanamiz.");
    
    // Formani tozalash
    this.reset();
});