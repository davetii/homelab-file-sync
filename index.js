const fileSync = require("./file-sync.js");
const reportDups = require("./report-dups.js");
const hlfs = require('./homelab-file-sync-helper');
const os = require('os');
let report ='';


const dupReportCallback = (data) => {
    if(data && data.length > 0) {
        data.forEach((s) => {
            report += 'Duplicate file found in Master :' + s + os.EOL;
        });
    } else {
        report += 'no duplicate files found in master' + os.EOL;
    }
    report += hlfs.SEPERATOR + os.EOL;
    hlfs.postReport(report);
};

const syncedFilesCallBack = (data) => {
    if (data && data.length > 0) {
        data.forEach((s) => {
            report += 'file moved to master :' + s + os.EOL;
        });
    } else {
        report += 'no files moved to master' + os.EOL;
    }
    reportDups.findDups(dupReportCallback);
};
report += hlfs.SEPERATOR + os.EOL;
report += hlfs.getHeader(new Date()) + os.EOL;
fileSync.syncFiles(syncedFilesCallBack);