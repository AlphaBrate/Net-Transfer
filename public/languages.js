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
document.querySelectorAll('a').forEach(e => {
    if (!e.href.includes('.')) {
        e.href += location.search;
    }
});