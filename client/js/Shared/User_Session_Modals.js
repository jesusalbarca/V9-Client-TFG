
console.log(`LOADED LoginLogoutModals.js`)

const signUpButtons = document.querySelectorAll('.signup-btn');
const signInButtons = document.querySelectorAll('.signin-btn');

signInButtons.forEach(btn => btn.addEventListener("click", () => {
    document.querySelector('#signin-form-wrapper').classList.toggle("hidden");
}));
signUpButtons.forEach(btn => btn.addEventListener("click", () => {
    document.querySelector('#signup-form-wrapper').classList.toggle("hidden");
}));


const closeModalButtons = document.querySelectorAll('.close-modal');
closeModalButtons.forEach((modalCloseBtn) => modalCloseBtn.addEventListener("click", (e) => {
    console.log(e)
    e.target.closest(".modal-wrapper").classList.toggle("hidden");
}));


const modalWrapperDivs = document.querySelectorAll('.modal-wrapper');
modalWrapperDivs.forEach((modalWrapper) => modalWrapper.addEventListener("click", (e) => {
    console.log(e)
    if (e.target === e.currentTarget) {
        e.target.classList.toggle("hidden");
    }
}));

