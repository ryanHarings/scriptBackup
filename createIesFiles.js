const fs = require('fs');
const Path = require('path');
const lineReader = require('readline');

const lengths = ['2','3','4'];
// const colors = ['927','930','935','940','950','830','835','840','850'];
// const outputs = ['LO','MO','HO','VHO'];

function buildTree() {
  fs.readdir('./', (err, entries) => {
    //find CSV data file
    var refPath = '';

    entries.forEach((refFile) => {

      if (refFile.match(/\.csv$/)) {
        refPath = Path.join('./', refFile);
      }
    });
    console.log('Reference file:');
    console.log(refPath);
    console.log("File's processed:");
    fs.readdir('./', (err, entries) => {
      //loops through all IES files in current directory
      entries.forEach((file) => {
        const path = Path.join('./', file);

        if (file.match(/\.IES$/) && originalFileCheck(path)) {
          processFile(refPath,path);
        }
      });
    });
  });
}

buildTree();

//checks if the file is the original
function originalFileCheck(path) {
  const file = fs.readFileSync(path, 'utf8');
  return !file.includes('[TEST]SCALED FROM ITL');
}

//process each original file
function processFile(refPath,path) {
  console.log(path);

  var outputDir = './output';
  if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir);
  }

  const originalText = fs.readFileSync(path, 'utf8');
  const originalFileName = path.split('-');

  const newData = processCSV(refPath,originalFileName[1]);

  const originalColor = originalFileName[2].substring(0,3);
  const originalOutput = originalFileName[2].substring(3);
  const originalLength = originalFileName[3];

  const originalData = {
    'absLumen': '',
    'fixtureData': [],
    'wattageData': []
  }

  originalText.split(/\r?\n/).forEach((line, index) => {
    if (index === 21) {
      originalData.absLumen = line.split(']')[1];
    } else if (index === 23) {
      originalData.fixtureData = line;
    } else if (index === 24) {
      originalData.wattageData = line;
    }
  });

  var totalOutputCount = 0;

  Object.keys(newData).forEach((color) => {

    var newText = originalText.replace('[TEST]ITL','[TEST]SCALED FROM ITL').replace('[_ABSOLUTELUMENS]','[OTHER]NOTE THIS TEST FILE HAS MULTIPLIER AND/OR WATTAGE ADJUSTMENTS APPLIED FOR CCT, OPTIC OR OUTPUT OPTIONS\n[OTHER]CCT ADJUSTMENT BASED ON OSRAM  DATA - CONTACT PINNACLE FACTORY FOR MORE INFORMATION\n[_ABSOLUTELUMENS]');

    var newFixtureData = originalData.fixtureData.split(' ');
    var newWattageData = originalData.wattageData.split(' ');

    var newFile = path.split('-');
    newFile[2] = color;

    newFixtureData[2] = (newData[color][0] * Number(originalLength)) / Number(originalData.absLumen);
    var colorMult = newFixtureData[2];
    newWattageData[2] = (newData[color][1] * Number(originalLength)).toFixed(1);

    newText = newText.replace(originalFileName[2], newFile[2]).replace(originalData.fixtureData, newFixtureData.join(' ')).replace(originalData.wattageData, newWattageData.join(' '));

    lengths.forEach((length) => {
      var prevLength = newFile[3];
      var prevFixData = newFixtureData.join(' ');
      var prevWattData = newWattageData.join(' ');

      newFile[3] = length;

      newFixtureData[2] = (colorMult * (Number(length) / Number(originalLength))).toFixed(5);

      newWattageData[2] = (newData[color][1] * Number(length)).toFixed(1);

      lengthModifier(newFixtureData, prevLength, length);

      newText = newText.replace(newFile[2] + '-' + prevLength, newFile[2] + '-' + newFile[3]).replace(prevFixData, newFixtureData.join(' ')).replace(prevWattData, newWattageData.join(' '));

      var newLengthFile = newFile.join('-')
      fs.writeFile(outputDir + '/' + newLengthFile, newText);
      totalOutputCount++;
    })
  })

  console.log('Total output files: ',totalOutputCount);
}

// function newProperty(newParam, originalParam) {
//   return newParam !== originalParam
// }

function lengthModifier(fixArray,origL,newL) {
  var largestDim = fixArray.length - 3;
  for (var i = largestDim + 1; i < fixArray.length; ++i) {
    if (Number(fixArray[i]) > Number(fixArray[largestDim])) {
      largestDim = i;
    }
  }
  var diff = Number(origL) - Number(newL);
  return fixArray[largestDim] = parseFloat(fixArray[largestDim]).toFixed(2) - diff;
}

function processCSV(csvPath, shield) {
  var outputObject = {
  };
  var csvParse = fs.readFileSync(csvPath, 'utf8');
  var shieldIndex;
  csvParse.split(/\r?\n/).forEach((line,index) => {
    var splitLine = line.split(',')
    if (shieldIndex === undefined) {
      shieldIndex = splitLine.indexOf(shield);
    } else if (shieldIndex > -1 && index !== csvParse.split(/\r?\n/).length - 1) {
      if (splitLine[shieldIndex] !== 'N/A') {
        var color = splitLine[0];
        outputObject[color] = [];
        outputObject[color].push(Number(splitLine[1]));
        outputObject[color].push(Number(splitLine[shieldIndex + 1]));
      }
    }
  })
  return outputObject;
}
