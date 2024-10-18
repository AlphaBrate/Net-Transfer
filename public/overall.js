pujs.setup.icons_path = 'https://alphabrate.github.io/popupjs/code/showcase/icons/';
pujs.setup.init();

const language = document.documentElement.lang;

let languages = {
    'en': {
        'del-title': 'Deleting a .[VARIABLE] File',
        'del-content': 'You are trying to delete<br><b>[VARIABLE]</b>Please type the file extension to confirm the deletion.',
        'Delete': 'Delete',
        'Cancel': 'Cancel',
        'File deleted.': 'File deleted.',
        'File extension does not match.': 'File extension does not match.',
        'Type here': 'Type here',
        'A file is being deleted. Audio files are stopped.': 'A file is being deleted. Audio files are stopped.',
        'Link copied to clipboard.': 'Link copied to clipboard.',
        'File uploaded.': 'File uploaded.',
        'File upload failed.': 'File upload failed.',
        'Please select a file.': 'Please select a file.',
        'Update Available': 'Update Available',
        'An update of [VARIABLE] is available<br>and is ready to be installed.': 'An update of [VARIABLE] is available<br>and is ready to be installed.',
        'Update': 'Update',
        'Close': 'Close',
        'You can disable this notification in the settings.': 'You can disable this notification in the settings.',
        'You are blocked': 'You are blocked',
        "You can't config the server<br>since you are not the host.": "You can't config the server<br>since you are not the host.",
        'Success': 'Success',
        'The settings have been saved.': 'The settings have been saved.',
        'Save': 'Save',
        'Settings': 'Settings',
        'You are the host': 'Host',
        'Back': 'Back',
    },
    'zh-cn': {
        'del-title': '删除 .[VARIABLE] 文件',
        'del-content': '您正在尝试删除<br><b>[VARIABLE]</b>请输入文件扩展名以确认删除。',
        'Delete': '删除',
        'Cancel': '取消',
        'File deleted.': '文件已删除。',
        'File extension does not match.': '输入的拓展名错误。',
        'Type here': '文件拓展名',
        'A file is being deleted. Audio files are stopped.': '文件正在删除中。音频播放已停止。',
        'Link copied to clipboard.': '链接已复制。',
        'File uploaded.': '文件已上传。',
        'File upload failed.': '文件上传失败。',
        'Please select a file.': '请选择一个文件。',
        'Update Available': '新的更新可用',
        'An update of [VARIABLE] is available<br>and is ready to be installed.': '[VARIABLE] 的新版本可用<br>並且已準備好安裝。',
        'Update': '更新',
        'Close': '关闭',
        'You can disable this notification in the settings.': '您可以在设置中禁用此通知。',
        'You are blocked': '你不被允许访问此页面',
        "You can't config the server<br>since you are not the host.": '你不能配置服务器<br>因为你不是服务器主机。',
        'Success': '成功',
        'The settings have been saved.': '设置已保存。',
        'Save': '保存',
        'Settings': '设置',
        'You are the host': '主机',
        'Back': '返回',
    },
    'zh-tw': {
        'del-title': '刪除 .[VARIABLE] 檔案',
        'del-content': '您正在嘗試刪除<br><b>[VARIABLE]</b>請輸入檔案副檔名以確認刪除。',
        'Delete': '刪除',
        'Cancel': '取消',
        'File deleted.': '檔案已刪除。',
        'File extension does not match.': '檔案副檔名不符。',
        'Type here': '輸入檔案副檔名',
        'A file is being deleted. Audio files are stopped.': '檔案正在刪除中。音訊播放已停止。',
        'Link copied to clipboard.': '連結已複製。',
        'File uploaded.': '檔案已上傳。',
        'File upload failed.': '檔案上傳失敗。',
        'Please select a file.': '請選擇一個檔案。',
        'Update Available': '新的更新可用',
        'An update of [VARIABLE] is available<br>and is ready to be installed.': '[VARIABLE] 的新版本可用<br>並且已準備好安裝。',
        'Update': '更新',
        'Close': '關閉',
        'You can disable this notification in the settings.': '您可以在設定中禁用此通知。',
        'You are blocked': '你不被允許訪問此頁面',
        "You can't config the server<br>since you are not the host.": '你不能配置服務器<br>因為你不是服務器主機。',
        'Success': '成功',
        'The settings have been saved.': '設定已保存。',
        'Save': '保存',
        'Settings': '設定',
        'You are the host': '主機',
        'Back': '返回',       
    },
    'zh-hk': {
        'del-title': '刪除 .[VARIABLE] 文件',
        'del-content': '您正在嘗試刪除<br><b>[VARIABLE]</b>請輸入文件擴展名以確認刪除。',
        'Delete': '刪除',
        'Cancel': '取消',
        'File deleted.': '文件已刪除。',
        'File extension does not match.': '輸入的拓展名錯誤。',
        'Type here': '文件拓展名',
        'A file is being deleted. Audio files are stopped.': '文件正在刪除中。音頻播放已停止。',
        'Link copied to clipboard.': '鏈接已覆制。',
        'File uploaded.': '文件已上傳。',
        'File upload failed.': '文件上傳失敗。',
        'Please select a file.': '請選擇一個文件。',
        'Update Available': '新的更新可用',
        'An update of [VARIABLE] is available<br>and is ready to be installed.': '[VARIABLE] 的新版本可用<br>並且已準備好安裝。',
        'Update': '更新',
        'You can disable this notification in the settings.': '您可以在設置中禁用此通知。',
        'Close': '關閉',
        'You are blocked': '你不被允許訪問此頁面',
        "You can't config the server<br>since you are not the host.": '你無法配置此服務器<br>因為你不是服務器的主機/主持。',
        'Success': '成功',
        'The settings have been saved.': '設置已保存。',
        'Save': '保存',
        'Settings': '設置',
        'You are the host': '主機',
        'Back': '返回',
    },
};

languages['zh'] = languages['zh-cn'];

const getTextOfLanguage = (text, variables = {}) => {
    let languageText = languages[language][text] || text;
    if (variables) {
        for (const key in variables) {
            languageText = languageText.replaceAll(`[${key}]`, variables[key]);
        }
    }
    return languageText;
};

const l = getTextOfLanguage;


// Get all a hrefs, if no extension, add the query of this page
function aHrefs() {
    document.querySelectorAll('a:not([data-hrefed])').forEach(e => {
        if (!e.href.includes('.')) {
            e.href += location.search;
        }
        e.dataset.hrefed = true;
    });
}

aHrefs();

// Fetch localhost with the same port
let is_this_local = false;

let port = location.port;
if (port === '') {
    port = '1345';
}

fetch(`http://localhost:${port}/server-status`,
    {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-cache',
        redirect: 'follow',
        signal: AbortSignal.timeout(1000) // Max Timeout
    }
).then(data => data.json()).then(data => {
    is_this_local = true;

    // add before the first <br> of .footer
    let footer = document.querySelector('.footer');

    let before = document.createElement('span');

    before.innerHTML = l('You are the host') + ' | ';
    
    footer.innerHTML = before.outerHTML + footer.innerHTML;

    let br = footer.querySelector('br');
    

    let text = document.createElement('span');
    text.innerHTML = ' | ' + `<a href="/settings">${l('Settings')}</a>`;
    footer.insertBefore(text, br);

    aHrefs();

    try {
        local(data);
    } catch { }
    fetch(`/settings/server>checkUpdate`).then(value => value.json()).then(value => {
        if (data.update && value) {
            if (data.update.update) {
                pujs.popup(
                    title = l('Update Available'),
                    message = l('An update of [VARIABLE] is available<br>and is ready to be installed.', { VARIABLE: data.update.latestVersion }),
                    buttons = [
                        {
                            'text': l('Update'),
                            callback: () => {
                                pujs.popup(
                                    l('Update process started'),
                                    l('Close this page and wait for the server to update.'),
                                    [
                                        {
                                            'text': l('Close'),
                                            'callback': () => {

                                                fetch('/update', {
                                                    method: 'POST'
                                                });
                                                window.close();
                                            }
                                        }
                                    ],
                                    'vert',
                                );
                            }
                        },
                        {
                            'text': l('Cancel'),
                            callback: () => {
                                pujs.alert(l('You can disable this notification in the settings.'), 'success');
                            },
                            color: 'var(--pu-red)'
                        }],
                    'horiz'
                );
            }
        }
    });

}).catch(err => {
    is_this_local = false;

    try {
        local();
    } catch { }
});