document.addEventListener('DOMContentLoaded', init, false);

function init() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js', {
            type: 'module',
        })
            .then((reg) => {
                console.log("Service worker is ok")
            }, (err) => {
                alert('Service worker not registered! Some error occured : ', err);
            });
    } else {
        alert(`Service worker not available. Please try another browser.`);
    }
}