// Part of net transfer project, under MIT License.
// (c) AlphaBrate 2022.
const fs = require('fs'); // use to read file
const QRCode = require('qrcode');
const express = require('express'); // localhost server
const { networkInterfaces, type } = require('os'); // use to get user ipv4
const glob = require('glob'); // use to read path
const nets = networkInterfaces(); // return of network interface
const results = Object.create(null); // defind result
const { exec } = require('child_process');
const multer = require('multer');
const path = require('path');

// Set storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'files')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
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
var qrc;
const ipv4 = results[Object.keys(results)[0]][0]; // ipv4 of user

const app = express(); //
app.use(express.static('files')); // use folder: files as the static lib.
const pt = 1345; // port
const link = 'http://' + ipv4 + ':' + pt; // generate the link

QRCode.toDataURL(link, function (err, url) {
    qrc = url;
});

app.get('/:file', (req, res) => {
    let file = req.params.file;
    res.sendFile(__dirname + '/public/' + file);
});

app.delete('/delete/:file', (req, res) => {
    let file = req.params.file;
    fs.unlinkSync('files/' + file);
    res.json({ del: file });
});

app.get('/', (req, res) => {
    frs = []; // List of files
    glob('files/*', function (er, files) {
        files.forEach(w => {
            frs.push(w.split('files/')[1]);
        });
        let html = replceVariableToFile('public/en/receiver.html', { frs: frs });
        res.send(html);
    });
});

app.get('/app/sender', (req, res) => {
    frs = [];
    glob('files/*', function (er, files) {
        files.forEach(w => {
            frs.push(w.split('files/')[1]);
        });
        let html = replceVariableToFile('public/en/sender.html', { link: link, qrc: qrc, frs: frs });
        res.send(html);
    });
});

app.get('/app/:file.:ext', (req, res) => {
    let file = req.params.file;
    let ext = req.params.ext;
    res.sendFile(__dirname + '/public/' + file + '.' + ext);
});

app.post('/upload', upload.single('file'), (req, res) => {
    res.json({ file: req.file });
});

function replceVariableToFile(file, v = {}) {
    let data = fs.readFileSync(path.join(__dirname, file), 'utf8');
    // replace [_VAR_]
    for (let key in v) {
        data = data.replace(new RegExp('\\[_' + key + '_\\]', 'g'), Array.isArray(v[key]) ? JSON.stringify(v[key]) : v[key]);
    }
    return data;
}

app.listen(pt, () => {
    console.log('(C) AlphaBrate');
    console.log('The Web is ready, please go to "Net Transfer" tab.');
});

exec('start files');
exec('start http://localhost:' + pt + '/app/sender');
exec('mkdir files')