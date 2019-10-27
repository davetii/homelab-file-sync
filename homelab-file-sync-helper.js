const path = require('path');
const os = require('os');
const fs = require('fs');

const masterLocation = '\\\\RT-AC87R-90C8\\Seagate\\backup\\archive\\s';
const stagingLocation = 'D:\\temp\\archive\\s';
const WIN_SLASH =  '\\';
const LNX_SLASH =  '/';
const REPORT_FILE_NAME = 'file-sync-report.txt';
const getReportFilePath = () => { return path.join(os.homedir(), 'Desktop') + WIN_SLASH + REPORT_FILE_NAME; };
const getDateStamp = (date) => {
    return (date.getMonth() +1) + LNX_SLASH + date.getDate() + LNX_SLASH +
        date.getFullYear() + " " + date.getHours() + ":" + date.getMinutes() + "";
};

module.exports = {
    MASTER : masterLocation,
    STAGING : stagingLocation,
    WIN_SLASH : WIN_SLASH,
    LNX_SLASH : LNX_SLASH,
    UNKNOWN_FILE_NAME : 'unsynced_directory.txt',
    UNKNOWN_FILE_NAME_CONTENT : 'Directory is NOT synced with Emby Collection\nyou should consider deleting directory',
    REPORT_FILE_NAME : REPORT_FILE_NAME,
    SEPERATOR : '********************************************',
    getHeader : (date) => { return 'File Sync process ' + getDateStamp(new Date()); },
    findRoot : (s) => {
        if(s.lastIndexOf(this.WIN_SLASH) > '-1') { return s.substring((s.lastIndexOf(this.WIN_SLASH) + 1)); }
        if(s.lastIndexOf(this.LNX_SLASH) > '-1') { return s.substring((s.lastIndexOf(this.LNX_SLASH) + 1)); }
        return s;
    },
    getDateStamp : getDateStamp,
    postReport : (content) => {
        let file = getReportFilePath();
        fs.appendFile(file, content + os.EOL, (err) => { if (err) throw err; });
        fs.appendFile(file, os.EOL, function (err) { if (err) throw err; });
        fs.appendFile(file, os.EOL, function (err) { if (err) throw err; });
    }
};