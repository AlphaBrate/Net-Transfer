pujs.setup.icons_path = 'https://alphabrate.github.io/popupjs/code/showcase/icons/';
pujs.setup.init();

files.forEach(w => {
    document.getElementById('eta').innerHTML += `<span>
            <div class='upper'>
                <div class='tag'>${w.split('.')[w.split('.').length - 1]}</div>
                <a target='_blank' href='/file/${w}'>${w}</a>
                <span class='del' onclick='del(this)'>╳</span>
            </div>
            <div class='lower'>
            </div>
        </span>`;
});

let file;
document.getElementById('dropFile').addEventListener('change', function () {

    let files = this.files;

    // make as forEachable
    files = Array.from(files);

    files.forEach(w => {
        file = w;
        if (file) {
            document.querySelector('.spinner').classList.add('show');
            const formData = new FormData();
            formData.append('file', file);
            fetch('/upload', {
                method: 'POST',
                body: formData
            }).then(data => data.json()).then(data => {
                document.getElementById('eta').innerHTML += `<span>
            <div class='upper'>
                <div class='tag'>${data.file.filename.split('.')[data.file.filename.split('.').length - 1]}</div>
                <a target='_blank' href='/file/${data.file.filename}'>${data.file.filename}</a>
                <span class='del' onclick='del(this)'>╳</span>
            </div>
            <div class='lower'>
            </div>
        </span>`;
                pujs.alert('File uploaded.', 'success');
                document.querySelector('.spinner').classList.remove('show');
            }).catch(err => {
                pujs.alert('File upload failed.', 'error');
                document.querySelector('.spinner').classList.remove('show');
            });
        } else {
            pujs.alert('Please select a file.');
        }
    });
});

document.querySelector('input[readonly]').addEventListener('click', function () {
    this.select();
    document.execCommand('copy');
    pujs.alert('Link copied to clipboard.', 'success');
});

function del(e) {
    fetch('/before-delete/', { method: 'POST' });
    toDel = e.parentElement.querySelector('a').innerText;
    pujs.popup(
        title = `Deleting a .${toDel.split('.')[toDel.split('.').length - 1]} File`,
        message = `You are trying to delete<br><b>${toDel}</b>Please type the file extension to confirm the deletion.`,
        buttons = [
            {
                'text': 'Delete',
                callback: (e) => {
                    if (toDel.split('.')[toDel.split('.').length - 1] === e[0]) {
                        fetch('/delete/' + toDel, {
                            method: 'DELETE'
                        }).then(data => data.json()).then(data => {
                            if (data.del == toDel) {
                                e.parentElement.remove();
                                pujs.alert('File deleted.', 'success');
                            }
                        }).catch(err => {
                            location.reload();
                        });
                    } else {
                        pujs.alert('File extension does not match.', 'error');
                    }
                }
            },
            {
                'text': 'Cancel',
                callback: () => { },
                color: 'var(--pu-red)'
            }],
        'horiz',
        [{ placeholder: 'Type here' }])
}

document.querySelector('.drop').addEventListener('dragover', function (e) {
    e.preventDefault();
    e.stopPropagation();
    document.querySelector('.drop').classList.add('show');
});

document.querySelector('.drop').addEventListener('dragleave', function (e) {
    e.preventDefault();
    e.stopPropagation();
    document.querySelector('.drop').classList.remove('show');
});

document.querySelector('.drop').addEventListener('drop', function (e) {
    e.preventDefault();
    e.stopPropagation();
    document.querySelector('.drop').classList.remove('show');
    console.log(e.dataTransfer.files);

    let files = e.dataTransfer.files;

    // make as forEachable
    files = Array.from(files);

    files.forEach(w => {
        file = w;
        if (file) {
            document.querySelector('.spinner').classList.add('show');
            const formData = new FormData();
            formData.append('file', file);
            fetch('/upload', {
                method: 'POST',
                body: formData
            }).then(data => data.json()).then(data => {
                document.getElementById('eta').innerHTML += `<span>
            <div class='upper'>
                <div class='tag'>${data.file.filename.split('.')[data.file.filename.split('.').length - 1]}</div>
                <a target='_blank' href='/file/${data.file.filename}'>${data.file.filename}</a>
                <span class='del' onclick='del(this)'>╳</span>
            </div>
            <div class='lower'>
            </div>
        </span>`;
                pujs.alert('File uploaded.', 'success');
                document.querySelector('.spinner').classList.remove('show');
            }).catch(err => {
                pujs.alert('File upload failed.', 'error');
                document.querySelector('.spinner').classList.remove('show');
            });
        } else {
            pujs.alert('Please select a file.');
        }
    });
});