const fs = require('fs');
const Path = require('path');
const lineReader = require('readline');

const lengths = ['2','3','4'];

function buildTree() {
  fs.readdir('./', (err, entries) => {
    //find CSV data file
    var refPath = '';
    var refIndPath = '';

    const indirect = [];

    entries.forEach((refFile) => {
      const path = Path.join('./', refFile);
      if (path.match(/\.csv$/) && path.match(/EX3D/)) {
        refPath = path;
      } else if (path.match(/\.csv$/) && path.match(/EX3I/)) {
        refIndPath = path;
      } else if (path.match(/\.IES$/) && originalFileCheck(path) && path.split('-')[0] === 'EX3I') {
        indirect.push(path)
      }
    });
    console.log('Reference files:');
    console.log(refPath, refIndPath);
    //loops through all IES files in current directory
    entries.forEach((file) => {
      const path = Path.join('./', file);
      if (file.match(/\.IES$/) && originalFileCheck(path) && path.split('-')[0] === 'EX3D') {
        processFile(refPath,refIndPath,path,indirect);
      }
    });
    console.log("Output Complete!");
  });
}

buildTree();

//checks if the file is the original
function originalFileCheck(path) {
  const file = fs.readFileSync(path, 'utf8');
  return !file.includes('[TEST]SCALED FROM ITL');
}

//process each original file
function processFile(refPath,refIndPath,path,indPaths) {

  var outputDir = './output';
  if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir);
  }

  const originalText = fs.readFileSync(path, 'utf8').replace('EX3D','EX3DI').split(/\r?\n/);
  const originalFileName = path.split('-');

  const newData = processCSV(refPath,originalFileName[1]);

  const originalData = {
    'absLumen': '',
    'endAngles': '',
    'topAngles': '',
    'fixtureData': [],
    'wattageData': [],
    'candelaData': [],
    'deleteLines': []
  }

  var indexTrace;
  originalText.forEach((line, index) => {
    if (line.includes('[LUMINAIRE]')) {
      if (originalText[index + 1].includes('FINISH, ')) {
        originalText[index + 1].replace('FINISH, ', '');
      }
      originalText[index] = '[LUMINAIRE]FABRICATED METAL HOUSING WITH WHITE PAINTED GENERAL INTERIOR FINISH\r\n[MORE]AND 2 DISTINCT OPTICAL COMPARTMENTS, TOP OPTICAL COMPARTMENT CONSISTS OF:';
    } else if (line.includes('[LAMP]')) {
      if (originalText[index + 1].includes('[MORE]')) {
        originalText.splice(index + 1, 1);
      }
      originalText[index] = '[LAMP]TWO HUNDRED EIGHTY-EIGHT WHITE LIGHT EMITTING DIODES (LEDS), 144 VERTICAL\r\n[MORE]BASE-UP POSITION, 144 TILTED 10-DEGREES FROM VERTICAL BASE-DOWN POSITION.'
    } else if (line.includes('_INPUT_ELECTRICAL')) {
      originalText.splice(index, 1)
      var removeInd = index
      while (!originalText[removeInd].includes('[OTHER]')) {
        originalText.splice(removeInd, 1);
      }
    } else if (line.includes('[_ABSOLUTELUMENS]')) {
      indexTrace = index + 2;
      originalData.absLumen = line.split(']')[1];
    } else if (index === indexTrace) {
      originalData.fixtureData = line;
    } else if (index === indexTrace + 1) {
      originalData.wattageData = line;
    } else if (index === indexTrace + 2) {
      originalData.endAngles = line;
    } else if (line.split(' ')[0] === '0' && (line.split(' ').length === 5 || line.split(' ').length === 16)) {
      originalData.candelaData.splice(0, originalData.candelaData.length);
      originalData.deleteLines.splice(0, originalData.deleteLines.length);
      originalData.topAngles = line;
    } else if (index > indexTrace && index < originalText.length - 1) {
      originalData.candelaData.push(line);
      originalData.deleteLines.push(index)
    }
  });

  originalText.splice(originalData.deleteLines[0], originalData.deleteLines.length)
  if (originalText[indexTrace + 3].split(' ')[0] === '') {
    originalText.splice(indexTrace + 3, 1)
  }

  indPaths.forEach(indP => {
    const indText = fs.readFileSync(indP, 'utf8').split(/\r?\n/);
    const indFileName = indP.split('-');

    const newIndData = processCSV(refIndPath,indFileName[2]);

    const indLength = indFileName[4];

    const indData = {
      'test': '',
      'luminaire': ['[MORE]BOTTOM OPTICAL COMPARTMENT CONSISTS OF:'],
      'absLumen': '',
      'topAngles': '',
      'fixtureData': [],
      'wattageData': [],
      'candelaData': []
    }

    var indexIndTrace;
    indText.forEach((line, index) => {
      if (line.includes('[TEST]')) {
        indData.test = line.split(']')[1];
      } else if (line.includes('[LUMINAIRE]')) {
        var lumInd = index + 1;
        while (indText[lumInd].includes('[MORE]')) {
          indData.luminaire.push(indText[lumInd].replace('FINISH, ', ''))
          lumInd++;
        }
      } else if (line.includes('[_ABSOLUTELUMENS]')) {
        indexIndTrace = index + 2;
        indData.absLumen = line.split(']')[1];
      } else if (index === indexIndTrace) {
        indData.fixtureData = line;
      } else if (index === indexIndTrace + 1) {
        indData.wattageData = line;
      } else if (line.split(' ')[0] === '0' && (line.split(' ').length === 5 || line.split(' ').length === 16)) {
        indData.candelaData.splice(0, indData.candelaData.length);
        indData.topAngles = line;
      } else if (index >= indexIndTrace && index < indText.length - 1) {
        indData.candelaData.push(line);
      }
    });

    var combFixtureData = originalData.fixtureData.split(' ');
    combFixtureData[0] = Number(combFixtureData[0]) * 2;
    combFixtureData[3] = Number(combFixtureData[3]) * 2 - 1;
    combFixtureData[4] = Number(combFixtureData[4]) < Number(indData.fixtureData.split(' ')[4]) ? Number(indData.fixtureData.split(' ')[4]) : Number(combFixtureData[4])

    var combTopAngles = originalData.topAngles.length < indData.topAngles.length ? indData.topAngles : originalData.topAngles

    var combinedText = originalText.join('\r\n')
      .replace('[TEST]ITL','[TEST]SCALED FROM ITL')
      .replace('-GONIOPHOTOMETRY',' & ' + indData.test)
      .replace('-GONIOPHOTOMETRY','')
      .replace('-' + originalFileName[1], '-' + originalFileName[1] + '-' + indFileName[2])
      .replace('-' + originalFileName[3], '-' + originalFileName[3] + '-' + indFileName[3])
      .replace('[LAMP]', indData.luminaire.join('\r\n') + '\r\n[LAMP]')
      .replace('[_ABSOLUTELUMENS]','[OTHER]NOTE THIS TEST FILE HAS MULTIPLIER AND/OR WATTAGE ADJUSTMENTS APPLIED FOR CCT, OPTIC OR OUTPUT OPTIONS - CONTACT PINNACLE FACTORY FOR MORE INFORMATION\r\n[_ABSOLUTELUMENS]')
      .replace(originalData.fixtureData, combFixtureData.join(' '))
      .replace(originalData.endAngles, '0 2.5 5 7.5 10 12.5 15 17.5 20 22.5 25 27.5 30 32.5 35 37.5 40 42.5 45 47.5 50 52.5 55 57.5 60 62.5 65 67.5 70 72.5 75 77.5 80 82.5 85 87.5 90 92.5 95 97.5 100 102.5 105 107.5 110 112.5 115 117.5 120 122.5 125 127.5 130 132.5 135 137.5 140 142.5 145 147.5 150 152.5 155 157.5 160 162.5 165 167.5 170 172.5 175 177.5 180')
      .replace(originalData.topAngles, combTopAngles);

    // console.log(combinedText);

    Object.keys(newData).forEach((color) => {

      Object.keys(newIndData).forEach(indColor => {
        if (color.substr(0,3) === indColor.substr(0,3)) {

          lengths.forEach((length) => {

            var newFixtureData = combFixtureData.join(' ').split( ' ');
            var newWattageData = originalData.wattageData.split( ' ');

            var indNormalizer = (Number(originalData.absLumen) * (newIndData[indColor][0] * Number(length)) / (newData[color][0] * Number(length))) / Number(indData.absLumen);

            var combAbsLumens = (Number(originalData.absLumen) + Number(indData.absLumen) * indNormalizer).toFixed(0);

            newFixtureData[2] = ((newData[color][0] * Number(length) + newIndData[indColor][0] * Number(length)) / combAbsLumens).toFixed(5);

            newWattageData[2] = (newData[color][1] * Number(length) + newIndData[indColor][1] * Number(length)).toFixed(1);

            lengthModifier(newFixtureData, originalFileName[4], length);

            var combCandelaData = candelaCombiner(originalData.candelaData, indData.candelaData, indNormalizer);

            var oldFile = ['EX3DI',originalFileName[1],indFileName[2],originalFileName[3],indFileName[3],originalFileName[4].split('.')[0]]
            var newFile = ['EX3DI', oldFile[1], oldFile[2], color, indColor, length];

            var newText = combinedText
              .replace(oldFile.join('-'), newFile.join('-'))
              .replace('[_ABSOLUTELUMENS]' + originalData.absLumen,'[_ABSOLUTELUMENS]' + combAbsLumens)
              .replace(combFixtureData.join(' '), newFixtureData.join(' '))
              .replace(originalData.wattageData, newWattageData.join(' '))

            var newFileName = newFile.join('-') + '.IES';
            fs.writeFile(outputDir + '/' + newFileName, newText + combCandelaData);
          })
        }
      })
    })
  })
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

function candelaCombiner(dirArr,indArr,norm) {
  var directC = fixLines(dirArr);
  var indirectC = fixLines(indArr);

  var normInd = []
  indirectC.forEach(line => {
    normInd.push(
      line.split(' ').map(val => {
        if (Number(val) !== 0) {
          return (Number(val) * norm).toFixed(0)
        }
      }).join(' ')
    )
  });

  if (directC.length < normInd.length) {
    directC = normalizeAngleQty(directC);
  } else if (normInd.length < directC.length) {
    normInd = normalizeAngleQty(normInd);
  }

  var comb = []
  for (var i = 0; i < directC.length; i++) {
    if (directC[i] !== undefined && normInd[i] !== undefined)
    comb.push( directC[i] + normInd[i] )
  }
  return comb.join('\r\n')
}

function fixLines(arr) {
  if (arr.length !== 5 && arr.length !== 16) {
    var newArray = []
    var start
    arr.forEach((line,index) => {
      if (line.split(' ')[0] === '' || Number(line.split(' ')[line.split(' ').length - 1]) === 0) {
        line.split(' ')[0] === '' ? start += line : start += ' ' + line
        if (index === arr.length - 1) {
          newArray.push(start)
        }
      } else if (line.split(' ')[0] !== '') {
        if (index !== 0) {
          newArray.push(start)
        }
        start = line
      }
    })
    return newArray
  } else {
    return arr
  }
}

function normalizeAngleQty(arr) {
  var stretchedArr = [];

  arr.map((line, index) => {
    stretchedArr.push(line);
    stretchedArr.push(line);
    if (index === 2 || index === 4) {
      stretchedArr.push(line);
    }
  })
  for (var i = arr.length - 2;i >= 0;i--) {
    stretchedArr.push(arr[i]);
  }
  return stretchedArr
}
