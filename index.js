// Part of net transfer project, under APEL.
// (c) AlphaBrate 2022 - 2024.
const fs = require('fs'); // use to read file
const QRCode = require('qrcode');
const express = require('express'); // localhost server
const { networkInterfaces, type } = require('os'); // use to get user ipv4
const nets = networkInterfaces(); // return of network interface
const results = Object.create(null); // defind result
const { exec } = require('child_process');
const multer = require('multer');
const path = require('path');
const socket = require('socket.io');

// Set storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'files')
    },
    filename: function (req, file, cb) {
        cb(null, Buffer.from(file.originalname, 'latin1').toString('utf8'));
    }
});

// Empty the files folder except the default.svg
fs.readdirSync('files').forEach(file => {
    if (file != 'default.svg') {
        fs.unlinkSync('files/' + file);
    }
});

const upload = multer({ storage: storage });

for (const name of Object.keys(nets)) { // geting ip
    for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
        const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
        if (net.family === familyV4Value && !net.internal) {
            if (!results[name]) {
                results[name] = [];
            }
            results[name].push(net.address);
        }
    }
}
let qrc;
const ipv4 = results[Object.keys(results)[0]][0]; // ipv4 of user

const app = express(); //
app.use(express.static('public')); // use folder: files as the static lib.

// blocked by CORS policy: Request header field content-type is not allowed by Access-Control-Allow-Headers in preflight response.

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    next();
});

// Get ports in use

const pt = 1345; // port
const link = 'http://' + ipv4 + ':' + pt; // generate the link

QRCode.toDataURL(link, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    quality: 1,
    margin: 1,
    width: 500,
    color: {
        dark: '#000000',
        light: '#ffffff00'
    }
}, function (err, url) {
    qrc = url;
});

app.get('/file/:file', (req, res) => {
    let file = req.params.file;

    // If the file is not found, send 404

    try {
        res.sendFile(__dirname + '/files/' + file)
    } catch { }
});

app.delete('/delete/:file', (req, res) => {
    const filePath = path.join(__dirname, 'files', req.params.file);

    try {
        fs.unlinkSync(filePath);
        io.emit('del_file', { file: req.params.file });
        res.json({ del: req.params.file });
    } catch (err) {
        console.error(`Error deleting file: ${err.message}`);
        res.status(500).json({ error: 'File is in use and could not be deleted.' });
    }
});

app.post('/before-delete', (req, res) => {
    io.emit('before_del_file');
});

app.get('/', (req, res) => {

    frs = []; // List of files

    // Get all files in the folder with fs, and push it to frs sorted by time added, lastest the first
    fs.readdirSync('files').sort((a, b) => {
        return fs.statSync('files/'
            + b).mtime.getTime() - fs.statSync('files/' + a).mtime.getTime();
    }
    ).forEach(w => {
        frs.push(w);
    });
    // Replace the letiable in the file
    let html = replceletiableToFile('public/en/receiver.html', { frs: frs});

    // Send the file
    res.send(html);
});

app.get('/app/sender', (req, res) => {
    frs = [];
    fs.readdirSync('files').sort((a, b) => {
        return fs.statSync('files/'
            + b).mtime.getTime() - fs.statSync('files/' + a).mtime.getTime();
    }).forEach(w => {
        frs.push(w);
    });

    let html = replceletiableToFile('public/en/sender.html', { link: link, frs: frs, qrc: qrc });

    res.send(html);
});

app.get('/app/:file.:ext', (req, res) => {
    let file = req.params.file;
    let ext = req.params.ext;
    res.sendFile(__dirname + '/public/' + file + '.' + ext);
});

app.post('/upload', upload.single('file'), (req, res) => {
    const utf8FileName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
    
    io.emit('new_file', { file: utf8FileName });

    res.json({ file: req.file });
});

app.post('/server', (req, res) => {
    frs = []; // List of files

    // Get all files in the folder with fs, and push it to frs sorted by time added, lastest the first
    fs.readdirSync('files').sort((a, b) => {
        return fs.statSync('files/'
            + b).mtime.getTime() - fs.statSync('files/' + a).mtime.getTime();
    }
    ).forEach(w => {
        frs.push(w);
    });
    
    res.json({
        'server': {
            'ipv4': ipv4,
            'link': link
        },
        'files': frs,
        'status': 'success'
    });
});

function replceletiableToFile(file, v = {}) {
    let data = fs.readFileSync(path.join(__dirname, file), 'utf8');
    // replace [_let_]
    for (let key in v) {
        data = data.replace(new RegExp('\\[_' + key + '_\\]', 'g'), Array.isArray(v[key]) ? JSON.stringify(v[key]) : v[key]);
    }
    return data;
}

const io = socket(app.listen(pt, () => {
    console.log('© AlphaBrate 2022 - 2024, under APEL.');
}), { cors: { origin: '*' } });

exec('start http://localhost:' + pt + '/app/sender');
exec('mkdir files')