const
    path = require('path'),
    klaw = require('klaw'),
    hlfs = require('./homelab-file-sync-helper'),
    items = [],
    ignoredFiles = ['.jpg', '.bif'],
    isIgnoreFile = (s) => {
     return (ignoredFiles.indexOf(s.toString().toLowerCase()) > -1);
    },
    canBeProcessed = (item) => {
        if (item.stats.isDirectory()) { return false; }
        if (isIgnoreFile(path.parse(item.path).ext)) { return false;}
        return true;
    },
    buildList = () => {
        return new Promise(function (resolve, reject) {
            klaw(hlfs.MASTER)
                .on('data', function (item) {
                    if (canBeProcessed(item)) {
                        items.push(path.parse(item.path).base)
                    }
                })
                .on('end', () => {
                    resolve(items.filter((e, i) => items.indexOf(e) != i));
                });
        });
    };

module.exports = {
    isIgnoreFile : isIgnoreFile,
    canBeProcessed : canBeProcessed,
    findDups : (callback) => {
        buildList().then((filteredList) => { callback(filteredList); });
    }
};








