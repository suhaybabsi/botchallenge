"use strict";
const fs = require('fs');
const dir = '/Volumes/Suhayb Files/Arabic\ Books/';

const adab = "آداب وفنون";
const fikr = "فكـــر";
const histroy = "تاريخ وتراجم";
const philosophy = "فلسفة";
const psychology = "تربية وعلم نفس";

const random1 = "منزل حديثا";
const random2 = "عالم المعرفة";

let list;

list = walkSync(dir + adab);
fs.writeFile('./list_adab.json', JSON.stringify(list, null, 4) , 'utf-8');

list = walkSync(dir + fikr);
fs.writeFile('./list_fikr.json', JSON.stringify(list, null, 4) , 'utf-8');

list = walkSync(dir + histroy);
fs.writeFile('./list_histroy.json', JSON.stringify(list, null, 4) , 'utf-8');

list = walkSync(dir + philosophy);
fs.writeFile('./list_philosophy.json', JSON.stringify(list, null, 4) , 'utf-8');

list = walkSync(dir + psychology);
fs.writeFile('./list_psychology.json', JSON.stringify(list, null, 4) , 'utf-8');

list = walkSync(dir + random1).concat(walkSync(dir + random2))
fs.writeFile('./list_random.json', JSON.stringify(list, null, 4) , 'utf-8');

// List all files in a directory in Node.js recursively in a synchronous fashion
function walkSync(dir, filelist) {

    var files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function (file) {

        if (fs.statSync(dir + '/' + file).isDirectory()) {

            filelist = walkSync(dir + '/' + file, filelist);

        } else if (file.endsWith(".pdf")) {

            let filename = file.substring(0, file.length-4);
            filelist.push(filename);
        }
    });
    return filelist;
};