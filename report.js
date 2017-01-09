const fs = require('fs');
const rmdir = require('rmdir');
const moment = require('moment-timezone');
moment().tz('Asia/Jakarta');

const yargs = require('yargs');
const Promise = require('bluebird');

const ARGV = yargs.argv;
const PARAM = ARGV._[0];

const IGNORE = ['.DS_Store', '.gitignore'];

const today = moment().format('DD-MM-YYYY');
const headerText = `
########
${ moment().format('YYYYMMDD') }
########


`;
const files = ['CHANGELOG', 'FILE_CHANGELOG'];

const dir = './report';

switch(PARAM) {

  case 'init':
    console.log('Initialization report ..');
    const todayDir = `${ dir }/${ today }`;

    if (!fs.existsSync(todayDir)){
      console.log('Successfully create folder ' + today);
      fs.mkdirSync(todayDir);

      for(let file in files) {
        let fileDir = `${ todayDir }/${ files[file] }.TXT`;
        fs.writeFile(fileDir, headerText, function(err) {
          if(err) {
              return console.log(err);
          }

          return console.log('Successfully create file ' + fileDir);
        });
      }

    } else {
      console.log('You\'ve already init today.');
    }
    break;

  case 'make':
    getAllDir().then((dirs) => {

      let sortedDirs = dirs.sort((val) => {
        return moment(val, 'DD-MM-YYYY').unix() - moment().unix();
      });

      const reportFolder = `./build/REPORT ${ parseArrayDate(sortedDirs, 0, 'DD-MM-YYYY', 'YYYYMMDD') } - ${ parseArrayDate(sortedDirs, sortedDirs.length - 1, 'DD-MM-YYYY', 'YYYYMMDD') }`;

      if (fs.existsSync(reportFolder)) {
        rmdir(reportFolder, (err, dirs, files) => {
          if (err) return console.log(err);
          console.log('Removing' + dirs + ' and ' + files + ' because already initialized');
        });
      } else {
        fs.mkdirSync(reportFolder);
      }

      let dateReport = `${ parseArrayDate(sortedDirs, 0, 'DD-MM-YYYY', 'DD MMM YYYY') } - ${ parseArrayDate(sortedDirs, sortedDirs.length-1, 'DD-MM-YYYY', 'DD MMM YYYY') }`;

      sortedDirs.forEach((sortedDir) => {
        let dirReport = `${ dir }/${ sortedDir }`;
        files.forEach((file) => {
          let fileName = `${ dirReport }/${ file }.TXT`;

          if (fs.existsSync(fileName)) {
            fs.readFile(fileName, 'utf-8', (err, data) => {
              if (err) return console.log(err);

              let result = `${ data }\n\n`;
              let report = `${ reportFolder }/${ file } ${ dateReport }.TXT`;

              if (fs.existsSync(report)) {
                fs.appendFile(report, result, 'utf-8', (err) => {
                  if (err) return console.log('Cannot append file, because', err);
                });
              } else {
                fs.writeFile(report, result, (err) => {
                  if (err) return console.log('Cannot write file, because', err);
                });
              }

            })
          }
        });

      });

    });
    break;

  case 'backup':
    // do backup
    break;

  default:
    console.log(PARAM + ' not supported yet.');
    break;

}

function parseArrayDate(arrayDate, index, inputFormat, outputFormat) {
  return moment(arrayDate[index], inputFormat).format(outputFormat)
}

function inArray(needle, haystack) {
  return haystack.indexOf(needle) >= 0;
}

function getAllDir() {
  let allDir = [];
  return new Promise((resolve, reject) => {

    fs.readdir(dir, (err, folders) => {
      return Promise.each(folders, (folder) => {
        if (!inArray(folder, IGNORE) && fs.lstatSync(`${ dir }/${ folder }`).isDirectory()) allDir.push(folder);
      }).then(() => {
        resolve(allDir);
      })
    });

  });
}