document.addEventListener('DOMContentLoaded', init, false);

function init() {
    if (!navigator.onLine) {
        const statusElem = document.querySelector('.page-status')
        statusElem.innerHTML = 'offline'
    } else {
        const statusElem = document.querySelector('.page-status')
        statusElem.innerHTML = 'online'
    }
}