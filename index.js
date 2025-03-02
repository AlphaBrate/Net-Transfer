// Part of net transfer project, under APEL.
// (c) AlphaBrate 2022 - 2025.
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
const bodyParser = require('body-parser');



const fetch = require('node-fetch');

const pathHere = (process.pkg) ? process.cwd() : __dirname;

// Set storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'files')
    },
    filename: function (req, file, cb) {
        cb(null, Buffer.from(file.originalname, 'latin1').toString('utf8'));
    }
});

if (!fs.existsSync('files')) {
    fs.mkdirSync('files');
}

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

// blocked by CORS policy: Request header field content-type is not allowed by Access-Control-Allow-Headers in preflight response.

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    next();
});

app.use(bodyParser.json());

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

let server = {
    'ipv4': ipv4,
    'port': pt,
    'link': link,
    'qrc': qrc,
    'status': 'online',
    'version': 'v2.2.3'
};

const releaseUrl = 'https://api.github.com/repos/AlphaBrate/Net-Transfer/releases/latest';
let latestVersion;
let currentVersion = server.version;

let versionCheckFetchDone = false;

fetch(releaseUrl)
    .then(res => res.json())
    .then(json => {
        latestVersion = json.tag_name;
        versionCheckFetchDone = true;
        if (json.tag_name != currentVersion) {
            console.log('New version available: ' + `${currentVersion} -> ${json.tag_name}`);
            server.update = {
                update: true,
                currentVersion: currentVersion,
                latestVersion: latestVersion
            };
        } else {
            server.update = {
                update: false,
                currentVersion: currentVersion,
                latestVersion: latestVersion
            };
        }
    });

app.get('/file/:file', (req, res) => {
    let file = req.params.file;

    // If the file is not found, send 404

    try {
        res.sendFile(pathHere + '/files/' + file)
    } catch { }
});

app.get('/:file.:ext', (req, res) => {
    let file = req.params.file;
    let ext = req.params.ext;
    res.sendFile(__dirname + '/public/' + file + '.' + ext);
});

app.delete('/delete/:file', (req, res) => {
    const filePath = path.join(pathHere, 'files', req.params.file);

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

app.get('/server-status', (req, res) => {
    if (!versionCheckFetchDone) {
        function check() {
            if (!versionCheckFetchDone) {
                setTimeout(check, 100);
            } else {
                res.json(server);
            }
        }
        check();
    } else {
        res.json(server);
    }
});

const supportedLanguages = ['en', 'zh-cn', 'zh-tw', 'zh-hk', 'zh'];
const rewriteLanguages = { 'zh': 'zh-cn' };

app.get('/', (req, res) => {

    let language = 'en';
    if (req.headers['accept-language']) {
        let lang = req.headers['accept-language'].split(',')[0].split('-')[0];
        if (supportedLanguages.includes(lang)) {
            language = lang;
        }
    }

    // Get query language
    let query = req.query.lang;
    if (query && supportedLanguages.includes(query)) {
        language = query;
    }

    // Rewrite the language
    if (rewriteLanguages[language]) {
        language = rewriteLanguages[language];
    }

    frs = []; // List of files

    // Get all files in the folder with fs, and push it to frs sorted by time added, lastest the first
    fs.readdirSync('files').sort((a, b) => {
        return fs.statSync('files/'
            + b).mtime.getTime() - fs.statSync('files/' + a).mtime.getTime();
    }
    ).forEach(w => {
        if (w !== '.nt-settings.json') {
            frs.push(w);
        }
    });
    // Replace the variable in the file
    let html = replceVariableToFile('public/' + language + '/receiver.html', { frs: frs });

    // Send the file
    res.send(html);
});

app.get('/settings', (req, res) => {
    let language = 'en';

    if (req.headers['accept-language']) {
        let lang = req.headers['accept-language'].split(',')[0].split('-')[0];
        if (supportedLanguages.includes(lang)) {
            language = lang;
        }
    }

    // Get query language

    let query = req.query.lang;
    if (query && supportedLanguages.includes(query)) {
        language = query;
    }

    // Rewrite the language

    if (rewriteLanguages[language]) {
        language = rewriteLanguages[language];
    }

    let html = replceVariableToFile('public/' + language + '/settings.html', { link: link });

    res.send(html);
});

app.get('/settings/.json', (req, res) => {
    // if files/.nt-settings.json is not found, create it from public/settings.json
    if (!fs.existsSync(pathHere + '/files/.nt-settings.json')) {
        fs.copyFileSync(__dirname + '/public/settings.json', pathHere + '/files/.nt-settings.json');
    }

    fs.readFile(pathHere + '/files/.nt-settings.json', 'utf8', (err, data) => {
        if (err) {
            res.json({ error: 'Failed to read settings.json' });
        } else {
            res.json(JSON.parse(data));
        }
    });
});

app.get('/settings/:destiny', (req, res) => {
    let destiny = req.params.destiny;

    // a>b>c
    let path = destiny.split('>');

    // Get from the settings.json
    fs.readFile(pathHere + '/files/.nt-settings.json', 'utf8', (err, data) => {
        if (err) {
            res.json({ error: 'Failed to read settings.json' });
        } else {
            let settings = JSON.parse(data);

            let value = settings;

            for (let i = 0; i < path.length; i++) {
                value = value[path[i]];
            }

            res.json(value);
        }
    });
});

app.post('/writeSettings', (req, res) => {
    // Write those values to settings.json, based on the original settings.json
    function loopJsonWrite(origin, data) {
        for (let key in data) {
            if (typeof data[key] == 'object') {
                loopJsonWrite(origin[key], data[key]);
            } else {
                origin[key] = data[key];
            }
        }
    }

    fs.readFile(pathHere + '/files/.nt-settings.json', 'utf8', (err, data) => {
        if (err) {
            res.json({ error: 'Failed to read settings.json' });
        } else {
            let settings = JSON.parse(data);
            loopJsonWrite(settings, req.body);

            fs.writeFile(pathHere + '/files/.nt-settings.json', JSON.stringify(settings, null, 4), (err) => {
                if (err) {
                    res.json({ error: 'Failed to write settings.json' });
                } else {
                    res.json({ success: true });
                }
            });
        }
    });

});

app.post('/update', (req, res) => {
    const batch = `@echo off

echo (C) AlphaBrate 2025
echo Net-Transfer Updater

@REM Get parameters from the command line
set currentVersion=%1
set latestVersion=%2

set caller=%3

@REM If no caller, transfer.exe is calling the updater
if "%caller%"=="" (
    set caller=transfer.exe
)

@REM Check if the current version is not provided
if "%currentVersion%"=="" (
    echo Current version is not provided
    pause

    @REM Start the caller with an error message
    start %caller% update failed "current_version_not_provided"

    exit /b 1
)

@REM Check if the latest version is not provided
if "%latestVersion%"=="" (
    echo Latest version is not provided
    pause

    @REM Start the caller with an error message
    start %caller% update failed "latest_version_not_provided"

    exit /b 1
)

echo Current version: %currentVersion%
echo Latest version: %latestVersion%

echo.

@REM Check if the current version is the latest version
if "%currentVersion%"=="%latestVersion%" (
    echo Net-Transfer is already up to date
    pause

    start %caller% update success %currentVersion% %latestVersion%

    exit /b 1

    del "%~f0"
)

if "%currentVersion%" LSS "%latestVersion%" (
    echo Updating Net-Transfer...
    @REM Download the latest version with additional options for debugging
    curl -o transfer.exe -L --retry 3 --retry-delay 5 --fail https://github.com/AlphaBrate/Net-Transfer/releases/download/%latestVersion%/transfer.exe

    echo.

    @REM Check if the download was successful
    if %errorlevel% neq 0 (
        echo Failed to download the latest version. Please check your internet connection or try again later.
        pause

        start %caller% update failed "download_failed"

    ) else (
        echo Net-Transfer updated successfully
        pause

        start %caller% update success %currentVersion% %latestVersion%

    )

    del "%~f0"

    exit /b 1
)`;

    fs.writeFileSync('update.bat', batch);

    res.json({ success: true });

    console.log('Updating Net-Transfer...');

    const command = `start update.bat ${currentVersion} ${latestVersion} transfer.exe`;

    exec(command);

    console.log(command);

    setTimeout(() => {
        process.exit(0);
    }, 1000);
});

app.get('/app/sender', (req, res) => {

    let language = 'en';
    if (req.headers['accept-language']) {
        let lang = req.headers['accept-language'].split(',')[0].split('-')[0];
        if (supportedLanguages.includes(lang)) {
            language = lang;
        }
    }

    // Get query language
    let query = req.query.lang;
    if (query && supportedLanguages.includes(query)) {
        language = query;
    }

    // Rewrite the language
    if (rewriteLanguages[language]) {
        language = rewriteLanguages[language];
    }

    frs = [];
    fs.readdirSync('files').sort((a, b) => {
        return fs.statSync('files/'
            + b).mtime.getTime() - fs.statSync('files/' + a).mtime.getTime();
    }).forEach(w => {
        if (w !== '.nt-settings.json') {
            frs.push(w);
        }
    });

    let html = replceVariableToFile('public/' + language + '/sender.html', { link: link, frs: frs, qrc: qrc });

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

function replceVariableToFile(file, v = {}) {
    let data = fs.readFileSync(path.join(__dirname, file), 'utf8');
    // replace [_let_]
    for (let key in v) {
        data = data.replace(new RegExp('\\[_' + key + '_\\]', 'g'), Array.isArray(v[key]) ? JSON.stringify(v[key]) : v[key]);
    }
    return data;
}

let args = {
    'startSender': true,
};

let argv = process.argv.slice(2);

if (argv.includes('--no-sender')) {
    args.startSender = false;
}

if (argv.includes('--start-sender') && argv[argv.indexOf('--start-sender') + 1] == 'false') {
    args.startSender = false;
}

if (argv.includes('update')) {
    // Get next argument, failed or success
    let status = argv[argv.indexOf('update') + 1];
    let currentVersion = argv[argv.indexOf('update') + 2];
    let latestVersion = argv[argv.indexOf('update') + 3];

    if (status == 'success') {
        args.startSender = false;
        exec('start http://localhost:' + pt + '/app/sender?update=success&currentVersion=' + currentVersion + '&latestVersion=' + latestVersion);

        console.log(`Net-Transfer updated successfully: ${currentVersion} -> ${latestVersion}`);
    } else {
        args.startSender = false;
        exec('start http://localhost:' + pt + '/app/sender?update=failed');

        console.log(`Failed to update Net-Transfer: ${status}`);
    }
}

const io = socket(app.listen(pt, () => {
    console.log('© AlphaBrate 2022 - 2025, under APEL.');
}), { cors: { origin: '*' } });


if (args.startSender) {
    exec('start http://localhost:' + pt + '/app/sender');
} else {
    console.log('Auto Start Sender is disabled');
}