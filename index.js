const path = require('path');
const fs = require('fs-extra');
const klaw = require('klaw');

const master = '\\\\RT-AC87R-90C8\\Seagate\\backup\\archive\\s';
const staging = 'D:\\temp\\archive\\s';
const WIN_SLASH = '\\';
const LNX_SLASH = '/';
const UNKNOWN_FILE_NAME = 'unsynced_directory.txt';
const UNKNOWN_FILE_NAME_CONTENT = 'Directroy is NOT synced with Emby Collection\nyou should consider deleteting directory';

const findRoot = (s) => {
    if(s.lastIndexOf(WIN_SLASH) > '-1') { return s.substring((s.lastIndexOf(WIN_SLASH) + 1)); }
    if(s.lastIndexOf(LNX_SLASH) > '-1') { return s.substring((s.lastIndexOf(LNX_SLASH) + 1)); }
    return s;
};

const buildItems = (dir, list) => {
    return new Promise(function(resolve, reject) {
        let baseFolder = findRoot(dir);
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
        const s = staging + WIN_SLASH + item;
        if(!fs.existsSync(s)) { fs.mkdir(s); }
    });
};

const maybeMarkUnknownDirs = (list) => {
    list.forEach((item) => {
        const s = staging + WIN_SLASH + item;
        if(fs.existsSync(s)) { fs.writeFile(s + WIN_SLASH + UNKNOWN_FILE_NAME, UNKNOWN_FILE_NAME_CONTENT); }
    });
};

const generateChangesList = (processList) => {
    const response = [];
    processList.forEach((item) => {
        const s = staging + WIN_SLASH + item;
        if(fs.existsSync(s)) {
            if(fs.readdirSync(s).length > 0) { response.push(item); }
        }
    });
    return response;
};


const maybeCopyStageToMaster = (list) => {
    list.forEach((item) => {
        const masterDir = master + WIN_SLASH + item;
        const stagingDir = staging + WIN_SLASH + item;
        let masterList = [];
        let stagingList = [];
        if(fs.existsSync(masterDir)) { masterList = fs.readdirSync(masterDir); }
        if(fs.existsSync(stagingDir)) { stagingList = fs.readdirSync(stagingDir); }
        const filesToDelete  = stagingList.filter(x => { return masterList.includes(x)});
        filesToDelete.forEach((fileToDelete) => {
            console.log('Duplicate file found at ' + stagingDir + WIN_SLASH + fileToDelete);
            fs.unlink(stagingDir + WIN_SLASH + fileToDelete);
        });
        const filesToCopy  = stagingList.filter(x => { return !masterList.includes(x)});
        filesToCopy.forEach((fileToCopy) => {
            const src = staging + WIN_SLASH + item + WIN_SLASH + fileToCopy;
            const dest =master + WIN_SLASH + item + WIN_SLASH + fileToCopy;
            fs.copyFile(src, dest, (err) => {
                if (err) throw err;
                fs.unlink(src);
                console.log('Copied file ' + dest);
            })
        });
    });
};

let masterList = [];
let stagingList = [];
let changesList = [];

buildItems(master, masterList)
    .then(() => { return buildItems(staging, stagingList); })
    .then(() => { return maybeCreateEmptyFolders(masterList.filter(item => { return !stagingList.includes(item)}))} )
    .then(() => { return maybeMarkUnknownDirs(stagingList.filter(item => { return !masterList.includes(item)}))})
    .then(() => { return stagingList.filter(item => { return masterList.includes(item)})})
    .then((stagingList) => { return generateChangesList(stagingList)})
    .then((changesList) => { return maybeCopyStageToMaster(changesList)})
    .then(() => { console.log('were done')});
