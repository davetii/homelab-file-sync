const assert = require('assert');
const path = require('path');
const fs = require('fs-extra');
const reportDups = require("../report-dups.js");

const txtFile = './test/test-materials/tmp.txt';
const jpgFile = './test/test-materials/tmp.jpg';
const directory = './test/test-materials';


describe('reportDups', function() {
    describe('isIgnoreFile', function() {
        it('should return false when the file type is not present', function(){
            assert.equal(false, reportDups.isIgnoreFile('thisisnotanignorefile'));
        });
    });
});

describe('reportDups', function() {
    describe('isIgnoreFile', function() {
        it('should return true when the file type is present', function(){
            assert.equal(false, reportDups.isIgnoreFile('test.jpg'));
        });
    });
});

fs.stat(txtFile, (err, stats) =>{
    describe('reportDups', function() {
        describe('canBeProcessed', function() {
            it('should return true when the file type can be processed', function(){
                assert.equal(true, reportDups.canBeProcessed({path: txtFile, stats: stats}));
            });
        });
    });
});

fs.stat(jpgFile, (err, stats) =>{
    describe('reportDups', function() {
        describe('canBeProcessed', function() {
            it('should return false when the file type SHOULD NOT be processed', function(){
                assert.equal(false, reportDups.canBeProcessed({path: jpgFile, stats: stats}));
            });
        });
    });
});

fs.stat(directory, (err, stats) =>{
    describe('reportDups', function() {
        describe('canBeProcessed', function() {
            it('should return false when the file type is a folder', function(){
                assert.equal(false, reportDups.canBeProcessed({path: directory, stats: stats}));
            });
        });
    });
});
