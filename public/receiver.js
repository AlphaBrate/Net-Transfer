files.forEach(w => {
    document.getElementById('eta').innerHTML += `<span>
                    <div class='lower'>
                    </div>
                    <div class='upper'>
                        <div class='tag'>${w.split('.')[w.split('.').length - 1]}</div>
                        <a target='_blank' href='/file/${w}'>${w}</a>
                        <span class='del' onclick='del(this)'>╳</span>
                    </div>
                </span>`;
});

let previews = 5;
let image_types = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'tif'];

document.querySelectorAll('#eta a').forEach(e => {
    if (image_types.includes(e.innerText.split('.')[e.innerText.split('.').length - 1]) && previews > 0) {
        previews--;
        e.parentElement.parentElement.querySelector('.lower').innerHTML = `<img src='/file/${e.innerText}' alt='${e.innerText}'>`;
    }
});

let toggles = [`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 18.2637V5.73774C5 4.14035 6.78029 3.18756 8.1094 4.07364L17.5038 10.3366C18.6913 11.1282 18.6913 12.8732 17.5039 13.6648L8.1094 19.9278C6.78029 20.8138 5 19.8611 5 18.2637Z" fill="white" stroke="white" stroke-width="0.5" stroke-linecap="round"/></svg>`,
    `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 4H7C6.44772 4 6 4.44772 6 5V19C6 19.5523 6.44772 20 7 20H8C8.55228 20 9 19.5523 9 19V5C9 4.44772 8.55228 4 8 4Z" fill="white"/><path d="M17 4H16C15.4477 4 15 4.44772 15 5V19C15 19.5523 15.4477 20 16 20H17C17.5523 20 18 19.5523 18 19V5C18 4.44772 17.5523 4 17 4Z" fill="white"/><path d="M8 4H7C6.44772 4 6 4.44772 6 5V19C6 19.5523 6.44772 20 7 20H8C8.55228 20 9 19.5523 9 19V5C9 4.44772 8.55228 4 8 4Z" stroke="white" stroke-width="1.5" stroke-linecap="round"/><path d="M17 4H16C15.4477 4 15 4.44772 15 5V19C15 19.5523 15.4477 20 16 20H17C17.5523 20 18 19.5523 18 19V5C18 4.44772 17.5523 4 17 4Z" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>`];

let audio_types = ['wav', 'mp3', 'mp4', 'adts', 'ogg', 'webm', 'caf', 'flac'];
document.querySelectorAll('#eta a').forEach(e => {
    if (audio_types.includes(e.innerText.split('.')[e.innerText.split('.').length - 1].toLowerCase()) && previews > 0) {
        previews--;
        let randomID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        e.parentElement.parentElement.querySelector('.lower').innerHTML = `<audio id='${randomID}'><source src='/file/${e.innerText}' type='audio/${e.innerText.split('.')[e.innerText.split('.').length - 1]}'></audio>
                <div class='audio' data-for='${randomID}'>
                    <div class='toggle'>${toggles[0]}</div>
                    <div class='current fixed-length'>0:00</div>
                    <div class='timeLine'>
                        <input type='range' class='timeLineRange' style='--process: 50%;' min='0' max='100' value='0'>
                        <input type='range' class='timeLineRange top' style='--process: 50%;' min='0' max='100' value='0'>
                    </div>
                    <div class='duration fixed-length'>-0:00</div>
                </div>`;

        // init values
        document.getElementById(randomID).addEventListener('loadedmetadata', function () {
            this.parentElement.querySelector('.duration').innerText = '-' + new Date(this.duration * 1000).toISOString().substr(14, 5);

            // remove the first zero
            if (this.parentElement.querySelector('.duration').innerText.startsWith('-0')) {
                this.parentElement.querySelector('.duration').innerText = '-' + this.parentElement.querySelector('.duration').innerText.substring(2);
            }
        });
    }

    // change values
    document.querySelectorAll('audio').forEach(e => {
        e.addEventListener('timeupdate', function () {
            let range = e.parentElement.querySelector('input[type=range].timeLineRange');
            range.value = e.currentTime * 100 / e.duration;
            e.parentElement.querySelector('.current').innerText = new Date(e.currentTime * 1000).toISOString().substr(14, 5);
            e.parentElement.querySelector('.duration').innerText = '-' + new Date((e.duration - e.currentTime) * 1000).toISOString().substr(14, 5);

            // remove the first zero
            if (e.parentElement.querySelector('.current').innerText.startsWith('0')) {
                e.parentElement.querySelector('.current').innerText = e.parentElement.querySelector('.current').innerText.substring(1);
            }

            if (e.parentElement.querySelector('.duration').innerText.startsWith('-0')) {
                e.parentElement.querySelector('.duration').innerText = '-' + e.parentElement.querySelector('.duration').innerText.substring(2);
            }

            // change sibling range value
            e.parentElement.querySelector('input[type=range].top').value = range.value;
        });
    });
});

// if there is img or audio, then add the class
document.querySelectorAll('.lower img').forEach(e => {
    e.parentElement.parentElement.classList.add('preview');
});

document.querySelectorAll('.lower audio').forEach(e => {
    e.parentElement.parentElement.classList.add('preview');
});

let toDel;

function del(e) {

    fetch('/before-delete/', { method: 'POST' });

    toDel = e.parentElement.querySelector('a').innerText;
    pujs.popup(
        title = l('del-title', {VARIABLE: toDel.split('.')[toDel.split('.').length - 1]}),
        message = l('del-content', {VARIABLE: toDel}),
        buttons = [
            {
                'text': l('Delete'),
                callback: (e) => {
                    if (toDel.split('.')[toDel.split('.').length - 1].toLowerCase() === e[0].toLowerCase()) {
                        fetch('/delete/' + toDel, {
                            method: 'DELETE'
                        }).then(data => data.json()).then(data => {
                            if (data.del == toDel) {
                                e.parentElement.parentElement.remove();
                                pujs.alert(l('File deleted.'), 'success');
                            }
                        }).catch(err => {
                            location.reload();
                        });
                    } else {
                        pujs.alert(l('File extension does not match.'), 'error');
                    }
                }
            },
            {
                'text': l('Cancel'),
                callback: () => { },
                color: 'var(--pu-red)'
            }],
        'horiz',
        [{ placeholder: l('Type here') }])
}

document.querySelectorAll('input[type=range].top').forEach(e => {
    e.addEventListener('input', function () {
        let audio = document.getElementById(e.parentElement.parentElement.getAttribute('data-for'));
        audio.currentTime = this.value * audio.duration / 100;
        // change sibling range value
        this.parentElement.querySelector('input[type=range]').value = this.value;
    });
});

document.querySelectorAll('.toggle').forEach(e => {
    e.addEventListener('click', function () {
        let audio = document.getElementById(e.parentElement.getAttribute('data-for'));
        if (audio.paused) {
            audio.play();
            e.innerHTML = toggles[1];
        } else {
            audio.pause();
            e.innerHTML = toggles[0];
        }
    });
});

let eta = document.getElementById('eta');

let color = eta.firstElementChild;

color.classList.add('color-border');
color.classList.add('preview');

setTimeout(() => {
    color.classList.remove('color-border');
}, 1700);

// socket.io

const socket = io();

socket.on('new_file', data => {
    let file = data.file;
    let tag = file.split('.')[file.split('.').length - 1];
    let a = document.createElement('a');
    a.href = '/file' + file;
    a.innerText = file;
    let span = document.createElement('span');
    span.innerHTML = `<div class='lower'></div>
                    <div class='upper'>
                        <div class='tag'>${tag}</div>
                        <a target='_blank' href='/file/${file}'>${file}</a>
                        <span class='del' onclick='del(this)'>╳</span>
                    </div>`;
    eta.prepend(span);

    if (image_types.includes(tag) && previews > 0) {
        previews--;
        span.querySelector('.lower').innerHTML = `<img src='/file/${file}' alt='${file}'>`;
    }

    if (audio_types.includes(tag) && previews > 0) {
        previews--;
        let randomID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        span.querySelector('.lower').innerHTML = `<audio id='${randomID}'><source src='/file/${file}' type='audio/${tag}'></audio>
                <div class='audio' data-for='${randomID}'>
                    <div class='toggle'>${toggles[0]}</div>
                    <div class='current fixed-length'>0:00</div>
                    <div class='timeLine'>
                        <input type='range' class='timeLineRange' style='--process: 50%;' min='0' max='100' value='0'>
                        <input type='range' class='timeLineRange top' style='--process: 50%;' min='0' max='100' value='0'>
                    </div>
                    <div class='duration fixed-length'>-0:00</div>
                </div>`;

        // init values
        document.getElementById(randomID).addEventListener('loadedmetadata', function () {
            this.parentElement.querySelector('.duration').innerText = '-' + new Date(this.duration * 1000).toISOString().substr(14, 5);

            this.parentElement.querySelector('.toggle').addEventListener('click', function () {
                let audio = document.getElementById(this.parentElement.getAttribute('data-for'));
                if (audio.paused) {
                    audio.play();
                    this.innerHTML = toggles[1];
                } else {
                    audio.pause();
                    this.innerHTML = toggles[0];
                }
            });

            // remove the first zero
            if (this.parentElement.querySelector('.duration').innerText.startsWith('-0')) {
                this.parentElement.querySelector('.duration').innerText = '-' + this.parentElement.querySelector('.duration').innerText.substring(2);
            }
        });

        document.getElementById(randomID).addEventListener('timeupdate', function () {
            let e = document.getElementById(randomID);
            let range = e.parentElement.querySelector('input[type=range].timeLineRange');
            range.value = e.currentTime * 100 / e.duration;
            e.parentElement.querySelector('.current').innerText = new Date(e.currentTime * 1000).toISOString().substr(14, 5);
            e.parentElement.querySelector('.duration').innerText = '-' + new Date((e.duration - e.currentTime) * 1000).toISOString().substr(14, 5);

            // remove the first zero
            if (e.parentElement.querySelector('.current').innerText.startsWith('0')) {
                e.parentElement.querySelector('.current').innerText = e.parentElement.querySelector('.current').innerText.substring(1);
            }

            if (e.parentElement.querySelector('.duration').innerText.startsWith('-0')) {
                e.parentElement.querySelector('.duration').innerText = '-' + e.parentElement.querySelector('.duration').innerText.substring(2);
            }

            // change sibling range value
            e.parentElement.querySelector('input[type=range].top').value = range.value;
        });

        // change values



        // color border
        span.classList.add('color-border');
        span.classList.add('preview');
        setTimeout(() => {
            span.classList.remove('color-border');
        }, 1700);
    }
});

socket.on('before_del_file', () => {
    // Stop all audio and notify the user
    try {
        document.querySelectorAll('audio').forEach(e => {
            e.pause();
        });

        pujs.alert(l('A file is being deleted. Audio files are stopped.'), 'error');

    } catch { }
});

socket.on('del_file', () => {
    location.reload();
});

// on connection
socket.on('connect', () => {
    console.log('Connected to the server.');
});
