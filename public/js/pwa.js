import { configurePushSubscription } from "../js/notification.js"

document.addEventListener('DOMContentLoaded', init, false);

function init() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js', {
            type: 'module',
        })
            .then((reg) => {
                if ("Notification" in window) {
                    Notification.requestPermission(async function (res) {
                        if (res !== "granted") {
                            alert(`Push notifications denied for this site!\nTo test functionality, please allow notifications in browser settings.`);
                        } else {
                            await configurePushSubscription();
                        }
                    });
                } else {
                    alert(`Push notifications not available. Please try another browser.`);
                }
            }, (err) => {
                alert('Service worker not registered! Some error occured : ', err);
            });
    } else {
        alert(`Service worker not available. Please try another browser.`);
    }
}