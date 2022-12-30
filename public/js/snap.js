import { get, set } from "https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm";

let player = document.getElementById("player");
let canvas = document.getElementById("canvas");
let camera = document.getElementById("camera");
let picture = document.getElementById("picture");

let startCapture = function () {
    camera.style.display = "block";
    picture.style.display = "none";
    if (!("mediaDevices" in navigator)) {
        alert("Camera not available. Please try another browser.")
    } else {
        navigator.mediaDevices
            .getUserMedia({ video: true, audio: false })
            .then((stream) => {
                player.srcObject = stream;
            })
            .catch((err) => {
                console.log(err);
            });
    }
};
startCapture();

let stopCapture = function () {
    picture.style.display = "block";
    camera.style.display = "none";
    player.srcObject.getVideoTracks().forEach(function (track) {
        track.stop();
    });
};

document.getElementById("snap").addEventListener("click", function (event) {
    canvas.width = player.getBoundingClientRect().width;
    canvas.height = player.getBoundingClientRect().height;
    canvas.getContext("2d").drawImage(player, 0, 0, canvas.width, canvas.height);
    stopCapture();
});

document.getElementById("share").addEventListener("click", function (event) {
    event.preventDefault();
    if ("serviceWorker" in navigator && "SyncManager" in window) {
        let url = canvas.toDataURL();
        fetch(url)
            .then((res) => res.blob())
            .then((blob) => {
                let ts = new Date().toISOString();
                let id = ts
                set(id, {
                    id,
                    ts,
                    title: ts,
                    image: blob,
                });
                return navigator.serviceWorker.ready;
            })
            .then((swRegistration) => {
                return swRegistration.sync.register("sync");
            })
            .then(() => {
                startCapture();
            })
            .catch((error) => {
                console.log(error);
            });
    } else {
        alert("Service worker or background sync not working. Please try another browser.");
    }
});
