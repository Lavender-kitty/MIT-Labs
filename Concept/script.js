const slider = document.getElementById('volumeSlider');
const volumeValueText = document.getElementById('volumeValue');
const modal = document.getElementById('confirmModal');
const btnYes = document.getElementById('btnYes');
const btnNo = document.getElementById('btnNo');

let lastConfirmedValue = 50;
let pendingValue = 50;

slider.addEventListener('input', (e) => {
    volumeValueText.textContent = `${e.target.value}%`;
});

slider.addEventListener('change', (e) => {
    const chance = Math.random();
    
    if (chance < 0.4) {
        pendingValue = e.target.value;
        slider.value = lastConfirmedValue;
        volumeValueText.textContent = `${lastConfirmedValue}%`;
        showModal();
    } else {
        lastConfirmedValue = e.target.value;
    }
});

function showModal() {
    modal.style.display = 'block';
    btnYes.disabled = true;
    btnYes.style.opacity = "0.5";
    btnYes.style.boxShadow = "none";
    
    if (typeof grecaptcha !== 'undefined' && typeof grecaptcha.reset === 'function') {
        try {
            grecaptcha.reset();
        } catch (e) {
            console.warn("reCAPTCHA reset failed.");
        }
    } else {
        btnYes.disabled = false;
        btnYes.style.opacity = "1";
    }
}

function hideModal() {
    modal.style.display = 'none';
}

window.onCaptchaSuccess = function(token) {
    if (token) {
        btnYes.disabled = false;
        btnYes.style.opacity = "1";
        btnYes.style.boxShadow = "0 0 15px #a6e3a1";
    }
};

btnNo.addEventListener('click', () => {
    hideModal();
});

btnYes.addEventListener('click', () => {
    if (btnYes.disabled) return;
    
    lastConfirmedValue = pendingValue;
    slider.value = lastConfirmedValue;
    volumeValueText.textContent = `${lastConfirmedValue}%`;
    hideModal();
    
    const container = document.querySelector('.container');
    container.style.borderColor = '#a6e3a1';
    setTimeout(() => container.style.borderColor = '#45475a', 1000);
});
