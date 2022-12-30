
function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

const displayConfirmNotification = () => {
    if ('serviceWorker' in navigator) {
        const options = {
            body: 'You successfully subscribed to our Notification service!',
            dir: 'ltr',
            lang: 'en-US',
            tag: 'confirm-notification',
            actions: [
                {
                    action: 'confirm',
                    title: 'Okay'
                },
                {
                    action: 'cancel',
                    title: 'Cancel'
                }
            ]
        };
        navigator.serviceWorker.ready
            .then(sw => {
                sw.showNotification('Successfully allowed notifications!', options)
            });
    } else {
        alert("Service worker not available. Please try another browser.")
    }
};

const configurePushSubscription = async () => {
    try {
        let reg = await navigator.serviceWorker.ready;
        let sub = await reg.pushManager.getSubscription();
        if (sub === null) {
            sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array("BApIAn-RdczDwpKrImGICSl9Tct_MLBz6dZkJtVRj3KKxPirbfnZine7CZZHjvAuYFK7UdeEuPlCXK7LiUBUt8w")
            });
            let res = await fetch("/subscriptions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({ sub }),
            });
            if (res.ok) {
                displayConfirmNotification()
            }
            return res
        }
    } catch (error) {
        console.log("Error occured : " + error);
    }
};

export {
    displayConfirmNotification,
    configurePushSubscription
}