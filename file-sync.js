const path = require('path');
const fs = require('fs-extra');
const klaw = require('klaw');
const hlfs = require('./homelab-file-sync-helper');

const processedFiles= [];
const masterList = [];
const stagingList = [];

const buildItems = (dir, list) => {
    return new Promise(function(resolve, reject) {
        let baseFolder = hlfs.findRoot(dir);
        klaw(dir, {depthLimit: 0})
            .on('data', function (item) {
                if (item.stats.isDirectory() && path.parse(item.path).base != baseFolder) {
                    list.push(path.parse(item.path).base)
                }
            })
            .on('end', () => { resolve(); });
    });
};

const maybeCreateEmptyFolders = (list) => {
    list.forEach((item) => {
        const s = staging + hlfs.WIN_SLASH + item;
        if(!fs.existsSync(s)) { fs.mkdir(s); }
    });
};

const maybeMarkUnknownDirs = (list) => {
    list.forEach((item) => {
        const s = hlfs.STAGING + hlfs.WIN_SLASH + item;
        if(fs.existsSync(s)) { fs.writeFile(s + hlfs.WIN_SLASH + hlfs.UNKNOWN_FILE_NAME, hlfs.UNKNOWN_FILE_NAME_CONTENT); }
    });
};

const generateChangesList = (processList) => {
    const response = [];
    processList.forEach((item) => {
        const s = hlfs.STAGING + hlfs.WIN_SLASH + item;
        if(fs.existsSync(s)) {
            if(fs.readdirSync(s).length > 0) { response.push(item); }
        }
    });
    return response;
};


const maybeCopyStageToMaster = (list) => {
    list.forEach((item) => {
        const masterDir = hlfs.MASTER + hlfs.WIN_SLASH + item;
        const stagingDir = hlfs.STAGING + hlfs.WIN_SLASH + item;
        let masterList = [];
        let stagingList = [];
        if(fs.existsSync(masterDir)) { masterList = fs.readdirSync(masterDir); }
        if(fs.existsSync(stagingDir)) { stagingList = fs.readdirSync(stagingDir); }
        const filesToDelete  = stagingList.filter(x => { return masterList.includes(x)});

        filesToDelete.forEach((fileToDelete) => {
            const f = stagingDir + hlfs.WIN_SLASH + fileToDelete;
            processedFiles.push(fileToDelete);
            fs.unlink(f);
        });
        const filesToCopy  = stagingList.filter(x => { return !masterList.includes(x)});

        filesToCopy.forEach((fileToCopy) => {
            const src = hlfs.STAGING + hlfs.WIN_SLASH + item + hlfs.WIN_SLASH + fileToCopy;
            const dest =hlfs.MASTER + hlfs.WIN_SLASH + item + hlfs.WIN_SLASH + fileToCopy;
            processedFiles.push(dest);
            fs.copyFile(src, dest, (err) => {
                if (err) throw err;
                fs.unlink(src);
            })
        });
    });
};



exports.syncFiles = (callback) => {
    buildItems(hlfs.MASTER, masterList)
        .then(() => { return buildItems(hlfs.STAGING, stagingList); })
        .then(() => { return maybeCreateEmptyFolders(masterList.filter(item => { return !stagingList.includes(item)}))} )
        .then(() => { return maybeMarkUnknownDirs(stagingList.filter(item => { return !masterList.includes(item)}))})
        .then(() => { return stagingList.filter(item => { return masterList.includes(item)})})
        .then((stagingList) => { return generateChangesList(stagingList)})
        .then((changesList) => { return maybeCopyStageToMaster(changesList)})
        .then(() => { callback(processedFiles) });
};

