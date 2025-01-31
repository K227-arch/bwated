window.addEventListener("scroll", function() {
    let header3 = document.querySelector(".header3");
    if (window.scrollY > 50) {
        header3.classList.add("scrolled"); // Add solid background when scrolled
    } else {
        header3.classList.remove("scrolled"); // Make it transparent again at the top
    }
});
