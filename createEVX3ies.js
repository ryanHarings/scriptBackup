const fs = require('fs');
const Path = require('path');

const lengths = ['2','3','4','6','8'];
// const lengths = ['4'];

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
        if ((file.match(/\.IES$/) || file.match(/\.ies$/)) && originalFileCheck(path) && refPath.split('.')[0] === path.split('-')[0]) {
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

  const originalText = fs.readFileSync(path, 'utf8').split(/\r?\n/);
  const originalFileName = path.split('.')[0].split('-');

  // if (originalFileName[0] === 'EV3D' || originalFileName[0] === 'EV3D') {
  //   originalFileName.splice(2,0,'N')
  // }

  // const shieldIndex = originalFileName[0] === "EX3I" ? 2 : 1;
  var shieldVal = 'A';

  if (originalFileName[1] === 'N') {
    shieldVal = originalFileName[2]
  } else if (originalFileName[2] === 'N' || originalFileName[2].length > 1) {
    shieldVal = originalFileName[1]
  }

  const newData = processCSV(refPath,shieldVal);

  const originalData = {
    'absLumen': '',
    'fixtureData': [],
    'wattageData': []
  }

  var indexTrace;
  originalText.forEach((line, index) => {
    if (line.includes('_INPUT_ELECTRICAL')) {
      originalText.splice(index, 1)
      var removeInd = index
      while (!originalText[removeInd].includes('[OTHER]')) {
        originalText.splice(removeInd, 1);
     }
    } else if (line.includes('[_ABSOLUTELUMENS]')) {
      indexTrace = index;
      originalData.absLumen = line.split(']')[1];
    } else if (index === indexTrace + 2) {
      originalData.fixtureData = line;
    } else if (index === indexTrace + 3) {
      originalData.wattageData = line;
    }
  });

  var totalOutputCount = 0;

  Object.keys(newData).forEach((color) => {
    lengths.forEach((length) => {

      var newFixtureData = originalData.fixtureData.split(' ');
      var newWattageData = originalData.wattageData.split(' ');

      newFixtureData[2] = ((newData[color][0] * Number(length)) / Number(originalData.absLumen)).toFixed(5);

      newWattageData[2] = (newData[color][1] * Number(length)).toFixed(1);

      lengthModifier(newFixtureData, originalFileName[originalFileName.length - 1], length);

      // var oldFile = [originalFileName[0],originalFileName[1],originalFileName[originalFileName.length - 2],originalFileName[originalFileName.length - 1].split('.')[0]]
      // var newFile = [oldFile[0], originalFileName[1], color, length];

      var oldFile = originalFileName.filter((val,ind) => {
        return val !== undefined
      })

      var newFile = oldFile.map((val,ind) => {
        if (ind === oldFile.length - 2) {
          return color
        } else if (ind === oldFile.length - 1) {
          return length
        } else {
          return val
        }
      });

      // if (originalFileName[0] !== 'EV3D' || originalFileName[0] !== 'T4A') {
      //   oldFile.splice(2,0,originalFileName[2])
      //   newFile.splice(2,0,originalFileName[2])
      // }

      var newText = originalText.join('\r\n')
        .replace('[TEST]ITL','[TEST]SCALED FROM ITL')
        .replace('-GONIOPHOTOMETRY','')
        .replace(oldFile.join('-'), newFile.join('-'))
        .replace('[_ABSOLUTELUMENS]','[OTHER]NOTE THIS TEST FILE HAS MULTIPLIER AND/OR WATTAGE ADJUSTMENTS APPLIED FOR CCT, OPTIC OR OUTPUT OPTIONS - CONTACT PINNACLE FACTORY FOR MORE INFORMATION\r\n[_ABSOLUTELUMENS]')
        .replace(originalData.fixtureData, newFixtureData.join(' '))
        .replace(originalData.wattageData, newWattageData.join(' '));

      var newFileName = newFile.join('-') + '.IES';
      fs.writeFile(outputDir + '/' + newFileName, newText);
      totalOutputCount++;
    })
  })

  console.log('Total output files: ',totalOutputCount);
}

function lengthModifier(fixArray,origL,newL) {
  var largestDim = fixArray.length - 3;
  for (var i = largestDim + 1; i < fixArray.length; ++i) {
    if (Number(fixArray[i]) > Number(fixArray[largestDim])) {
      largestDim = i;
    }
  }
  var diff = Number(origL.split('.')[0]) - Number(newL);
  return fixArray[largestDim] = (Number(fixArray[largestDim]) - diff).toFixed(2);
}

function processCSV(csvPath, shield) {
  var outputObject = {
  };
  var csvParse = fs.readFileSync(csvPath, 'utf8');
  var shieldIndex;
  csvParse.split(/\r?\n/).forEach((line,index) => {
    var splitLine = line.split(',')
    if (shieldIndex === undefined) {
      shieldIndex = splitLine.indexOf(shield)+1;
    } else if (shieldIndex > -1 && index !== csvParse.split(/\r?\n/).length - 1) {
      if (splitLine[shieldIndex] !== 'N/A') {
        var color = splitLine[0];
        outputObject[color] = [];
        if (Number(splitLine[1]) > Number(splitLine[shieldIndex])) {
          outputObject[color].push(Number(splitLine[1]));
          outputObject[color].push(Number(splitLine[shieldIndex]));
        } else {
          outputObject[color].push(Number(splitLine[shieldIndex]));
          outputObject[color].push(Number(splitLine[1]));
        }
      }
    }
  })
  return outputObject;
}
