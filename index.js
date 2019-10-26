const fileSync = require("./file-sync.js");
const reportDups = require("./report-dups.js");
const hlfs = require('./homelab-file-sync-helper');
const details = [];

const dupReportCallback = (data) => {
    if(data && data.length > 0) {
        data.forEach((s) => { details.push("Duplicate file found in Master :" + s) });
    } else {
        details.push('no duplicate files found in master');
    }
    details.push(hlfs.SEPERATOR);
    hlfs.postReport(details);
};

const syncedFilesCallBack = (data) => {
    details.push(hlfs.SEPERATOR);
    details.push(hlfs.getHeader(new Date()));
    if (data && data.length > 0) {
        data.forEach((s) => { details.push('file moved to master :' + s); });
    } else {
        details.push('no files moved to master');
    }
    reportDups.findDups(dupReportCallback);
};
fileSync.syncFiles(syncedFilesCallBack);