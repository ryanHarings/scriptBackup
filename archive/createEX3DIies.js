const fs = require('fs');
const Path = require('path');

const lengths = ['2','3','4'];

function buildTree() {
  fs.readdir('./', (err, entries) => {
    //find CSV data file
    var refPath = '';
    var refIndPath = '';

    const indirect = [];

    entries.forEach((refFile) => {
      const path = Path.join('./', refFile);
      if (path.match(/\.csv$/) && (path.match(/EX3D/) || path.match(/EX2D/)|| path.match(/EX4D.csv/))) {
        refPath = path;
      } else if (path.match(/\.csv$/) && (path.match(/EX3I/) || path.match(/EX2I/) || path.match(/EX4I/))) {
        refIndPath = path;
      } else if ((path.match(/\.IES$/) || path.match(/\.ies$/)) && originalFileCheck(path) && (path.split('-')[0] === 'EX3I' || path.split('-')[0] === 'EX2I' || path.split('-')[0] === 'EX4I')) {
        indirect.push(path)
      }
    });

    console.log('Reference files:');
    console.log(refPath, refIndPath);
    //loops through all IES files in current directory
    entries.forEach((file) => {
      const path = Path.join('./', file);
      if ((file.match(/\.IES$/) || file.match(/\.ies$/)) && originalFileCheck(path) && (path.split('-')[0] === 'EX3D' || path.split('-')[0] === 'EX2D' || path.split('-')[0] === 'EX4D')) {
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

//loops through each direct file
function processFile(refPath,refIndPath,path,indPaths) {
  // set output path
  var outputDir = './output';
  // create output directory if it does not exist
  if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir);
  }
  // set direct file content and chop up file name
  const originalText = path.split('-')[0] === 'EX3D' ? fs.readFileSync(path, 'utf8').replace('EX3D','EX3DI').split(/\r?\n/) : path.split('-')[0] === 'EX2D' ? fs.readFileSync(path, 'utf8').replace('EX2D','EX2DI').split(/\r?\n/) : fs.readFileSync(path, 'utf8').replace('EX4D','EX4DI').split(/\r?\n/);

  const originalFileName = path.split('-');
  // select appropriate direct output data per shielding
  const newData = processCSV(refPath,originalFileName[1]);
  // variable for body data
  const originalData = {
    'absLumen': '',
    'endAngles': '',
    'topAngles': '',
    'fixtureData': [],
    'wattageData': [],
    'candelaData': [],
    'deleteLines': []
  }
  //established base point for file content parsing, within loop
  var indexTrace;
  // loop through each line of direct body and set data or change verbiage
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
      while (originalText[index + 1].split(' ')[0] === '') {
        // originalData.endAngles += originalText[index + 1];
        originalText.splice(index + 1, 1)
      } 
    } else if (line.split(' ')[0] === '0' && (line.split(' ').length === 5 || line.split(' ').length === 16)) {
      originalData.candelaData.splice(0, originalData.candelaData.length);
      originalData.deleteLines.splice(0, originalData.deleteLines.length);
      originalData.topAngles = line;
    } else if (index > indexTrace && index < originalText.length - 1) {
      originalData.candelaData.push(line);
      originalData.deleteLines.push(index)
    }
  });
  // removes candela data
  originalText.splice(originalData.deleteLines[0], originalData.deleteLines.length)
  // removes extraneous angle data lines
  if (originalText[indexTrace + 3].split(' ')[0] === '') {
    originalText.splice(indexTrace + 3, 1)
  }
  // loop through each indirect file
  indPaths.forEach(indP => {
    // set indirect file content and chop up file name
    const indText = fs.readFileSync(indP, 'utf8').split(/\r?\n/);
    const indFileName = indP.split('-');
    // selects appropriate indirect output data per shielding
    const newIndData = processCSV(refIndPath,indFileName[1]);
    console.log(newIndData)

    // console.log(indFileName[2]) 
    // const indLength = indFileName[4]; remove if file has been running 11-10
    // variable for body data
    const indData = {
      'test': '',
      'luminaire': ['[MORE]BOTTOM OPTICAL COMPARTMENT CONSISTS OF:'],
      'absLumen': '',
      'topAngles': '',
      'fixtureData': [],
      'wattageData': [],
      'candelaData': []
    }
    // loop through each line of indirect body and set data or change verbiage
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
    
    // combines/replaces fixture data to establish combined base file content
    var combFixtureData = originalData.fixtureData.split(' ');
    // diode qty
    combFixtureData[0] = Number(combFixtureData[0]) + Number(indData.fixtureData.split(' ')[0]);
    // vertical angle qty
    combFixtureData[3] = '73';
    // top angle qty
    combFixtureData[4] = Number(combFixtureData[4]) < Number(indData.fixtureData.split(' ')[4]) ? Number(indData.fixtureData.split(' ')[4]) : Number(combFixtureData[4]);
    // sets z axis IF applicable
    combFixtureData[9] = Number(originalData.fixtureData.split(' ')[9]) > 0 ? originalData.fixtureData.split(' ')[9] : indData.fixtureData.split(' ')[9]
    // checks if top angle qty is equal, sets the largest qty if not
    var combTopAngles = originalData.topAngles.length < indData.topAngles.length ? indData.topAngles : originalData.topAngles
    // combines text to establish base file content, common base info (no configuration variables)
    var combinedText = originalText.join('\r\n')
      .replace('[TEST]ITL','[TEST]SCALED FROM ITL')
      .replace('-GONIOPHOTOMETRY',' & ' + indData.test)
      .replace('-GONIOPHOTOMETRY','')
      .replace('-' + originalFileName[1], '-' + originalFileName[1] + '-' + indFileName[1])
      .replace('-' + originalFileName[2], '-' + originalFileName[2] + '-' + indFileName[2])
      .replace('[LAMP]', indData.luminaire.join('\r\n') + '\r\n[LAMP]')
      .replace('[_ABSOLUTELUMENS]','[OTHER]NOTE THIS TEST FILE HAS MULTIPLIER AND/OR WATTAGE ADJUSTMENTS APPLIED FOR CCT, OPTIC OR OUTPUT OPTIONS - CONTACT PINNACLE FACTORY FOR MORE INFORMATION\r\n[_ABSOLUTELUMENS]')
      .replace(originalData.fixtureData, combFixtureData.join(' '))
      .replace(originalData.endAngles, '0 2.5 5 7.5 10 12.5 15 17.5 20 22.5 25 27.5 30 32.5 35 37.5 40 42.5 45 47.5 50 52.5 55 57.5 60 62.5 65 67.5 70 72.5 75 77.5 80 82.5 85 87.5 90 92.5 95 97.5 100 102.5 105 107.5 110 112.5 115 117.5 120 122.5 125 127.5 130 132.5 135 137.5 140 142.5 145 147.5 150 152.5 155 157.5 160 162.5 165 167.5 170 172.5 175 177.5 180')
      .replace(originalData.topAngles, combTopAngles);

    // console.log(combinedText);
    //loops through direct output data to build configs
    console.log(newIndData)
    Object.keys(newData).forEach((color) => {
      // loops through indirect output data to build configs
      Object.keys(newIndData).forEach(indColor => {
        // ensures only output of common colors is processed
        if (color.substr(0,3) === indColor.substr(0,3)) {
          // loops through each length to build configs
          lengths.forEach((length) => {
            // copies variables to avoid base file modification
            var newFixtureData = combFixtureData.join(' ').split( ' ');
            var newWattageData = originalData.wattageData.split( ' ');
            // calculates proud lens abs lumens differential 
            // var dropLensDirDif = originalFileName.includes('AL') ? 1 * Number(originalData.absLumen) : originalFileName.includes('HED') ? 1 * Number(originalData.absLumen) : 0;
            // var dropLensIndDif = originalFileName.includes('AL') ? 1 * Number(indData.absLumen) : originalFileName.includes('HED') ? 1 * Number(originalData.absLumen) : 0;
            // var raisedLensDif = originalFileName.includes('HEA') ? 1 * Number(indData.absLumen) : 0;
            // calculates ratio of direct output to direct abs lumens, normalizer later applied to all indirect data for use in overall file multiplier (IES toolbox)
            var indNormalizer
            if (path.split('-')[0] === "EX3D" || path.split('-')[0] === "EX2D" || path.split('-')[0] === "EX4D") {
              indNormalizer = ((Number(originalData.absLumen)) * (newIndData[indColor][0] * Number(length)) / (newData[color][0] * Number(length))) / (Number(indData.absLumen));
            } else {
              indNormalizer = color === indColor ? 1 : 1 //unfinished placeholder for errors 
              console.log(indNormalizer)
            } 
            // calculates configuration specific normalized indirect abs lumens to direct abs lumens per above
            
            var combAbsLumens = ((Number(originalData.absLumen)) + ((Number(indData.absLumen)) * indNormalizer));
            // calculates configuration specific overall file multiplier (IES toolbox) and sets in variable
            newFixtureData[2] = ((newData[color][0] * Number(length) + newIndData[indColor][0] * Number(length)) / combAbsLumens).toFixed(5);
            // calculates configuration specific total wattage and sets in variable
            newWattageData[2] = (newData[color][1] * Number(length) + newIndData[indColor][1] * Number(length)).toFixed(1);
            // notes length and width dim location and delta of base files to config length
            var dimsArray = lengthModifier(newFixtureData, originalFileName[3], length);
            // reorders length and width IF asymmetrical shielding (per IES spec)
            if (originalFileName.includes('WHE') || indFileName.includes('WHE')) {
              newFixtureData[newFixtureData.length - 3] = (Number(combFixtureData[dimsArray[0]]) - dimsArray[2]).toFixed(2);
              newFixtureData[newFixtureData.length - 2] = combFixtureData[dimsArray[1]];
            } else {
              newFixtureData[dimsArray[0]] = (Number(combFixtureData[dimsArray[0]]) - dimsArray[2]).toFixed(2);
            }
            // helper function to combine the direct and indirect candela data, all normalizers applied
            var combCandelaData = candelaCombiner(originalData.candelaData, indData.candelaData, indNormalizer);
            // sets base combined file name to be replaced on each config
            var biFileName = path.split('-')[0] === 'EX3D' ? 'EX3DI' : path.split('-')[0] === 'EX2D' ? 'EX2DI' : 'EX4DI';
            var oldFile = [biFileName,originalFileName[1],indFileName[1],originalFileName[2],indFileName[2],originalFileName[3].split('.')[0]]
            // creates new combined file name
            var newFile = [biFileName,oldFile[1],oldFile[2],color,indColor,length];
            // configuration specific file content replacement
            var newText = combinedText
              .replace(oldFile.join('-'), newFile.join('-'))
              .replace('[_ABSOLUTELUMENS]' + originalData.absLumen,'[_ABSOLUTELUMENS]' + combAbsLumens.toFixed(0))
              .replace(combFixtureData.join(' '), newFixtureData.join(' '))
              .replace(originalData.wattageData, newWattageData.join(' '))
            // adds file extension to combined file name
            var newFileName = newFile.join('-') + '.IES';
            // console.log(newFileName)
            // if (newFileName === "EX3DI-AL-BW-835HO-835-4.IES") {
            //   console.log(dropLensDirDif, 'drop dir lens difference')
            //   console.log(dropLensIndDif, 'drop ind lens difference')
            //   console.log(indNormalizer, 'indirect normalizer')
            //   console.log(combAbsLumens, 'combined abs lumens normed')
            //   console.log(Number(originalData.absLumen) - dropLensDirDif, 'dir abs lumens minus dif')
            //   console.log(Number(indData.absLumen) + dropLensIndDif, 'ind abs lumens plus dif')
            // }
            // writes each file with content to output dir (if colors match per above)
            fs.writeFileSync(outputDir + '/' + newFileName, newText + combCandelaData);
          })
        }
      })
    })
  })
}

// function finds index of length and width, and establishes config specific length differential
function lengthModifier(fixArray,origL,newL) {
  var lengthDim = fixArray.length - 3;
  var widthDim = fixArray.length - 2;
  if (Number(fixArray[widthDim]) > Number(fixArray[lengthDim])) {
    lengthDim = fixArray.length - 2;
    widthDim = fixArray.length - 3;
  }
  var diff = Number(origL.split('.')[0]) - Number(newL);
  return [lengthDim,widthDim,diff]
}

// function for selecting shielding specific output data
function processCSV(csvPath, shield) {
  var outputObject = {};
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
        if (Number(splitLine[1]) > Number(splitLine[shieldIndex])) {
          outputObject[color].push(Number(splitLine[1]));
          outputObject[color].push(Number(splitLine[shieldIndex]));
          // console.log(outputObject)
        } else {
          outputObject[color].push(Number(splitLine[shieldIndex]));
          outputObject[color].push(Number(splitLine[1]));
        }
      }
    }
  })
  // console.log(outputObject)
  return outputObject;
}

// function for combining direct and indirect candela data
function candelaCombiner(dirArr,indArr,norm) {
  // cleans up the lines to remove extraneous spaces and newlines, then removes inverse hemisphere in proud lens applications
  // var directC = fixLines(dirArr).map(dLine => {
  //   return removeInvHem(dLine)
  // });
  // var indirectC = fixLines(indArr).map(iLine => {
  //   return removeInvHem(iLine)
  // });
  var directC = fixLines(dirArr);
  var indirectC = fixLines(indArr);
  // applies normalizer to indirect candela so the complete file can be scaled uniformly
  // var normInd = []
  // indirectC.forEach(line => {
  //   normInd.push(
  //     line.split(' ').map(val => {
  //       if (Number(val) !== 0) {
  //         return (Number(val) * norm).toFixed(0)
  //       }
  //     }).join(' ')
  //   )
  // });
  // ensures the same number of angle measurements exist by configuration
  if (directC.length < indirectC.length) {
    directC = normalizeAngleQty(directC.reverse());
  } else if (indirectC.length < directC.length) {
    indirectC = normalizeAngleQty(indirectC.reverse());
  }
  // combines the processed candela data
  var comb = []
  for (var i = 0; i < directC.length; i++) {
    if (directC[i] !== undefined && indirectC[i] !== undefined) {
      let splitD = directC[i].split(' ');
      let splitI = indirectC[i].split(' ');
      if (splitD.length - splitI.length === 0) {
        if (splitD.length === 37) {
          comb.push( directC[i] + indirectC[i] )
        } else {
          splitD.forEach((num,ind) => {
            var indNorm = ind < 36 ? 1 : norm;
            splitD[ind] = (Number(num) + Number(splitI[ind])) * indNorm
          })
          comb.push(splitD)
        }
      } else {
        var hemi;
        for (var j = 0; j < 37; j++) {
          if (splitD.length === 73) {
            if (j === 0) {
              splitD[j + 36] = (Number(splitD[j + 36]) + Number(splitI[j]))
            } else {
              splitD[j + 36] = ((Number(splitD[j + 36]) + Number(splitI[j])) * norm).toFixed(0)
            }
            hemi = "D"
          } else {
            splitI[j] = Number(splitD[j]) + Number(splitI[j])
            splitI[j + 36] = Number(splitI[j]) * norm
            hemi = "I"
          }
        }
        comb.push(eval("split" + hemi))
      }
    }
  }
  return comb.join('\r\n')
}

// function to clean up the block of candela data, removing extra spaces and newlines
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

// function to remove the inverse hemisphere candela data for proud lens application
function removeInvHem(line) {
  if (line.split(' ').length === 73 && Number(line.split(' ')[0]) > 0) {
    var temp = line.split(' ');
    temp.length = 37;
    return temp.join(' ');
  } else if (line.split(' ').length === 73) {
    var temp = line.split(' ').reverse();
    temp.length = 36;
    return ' ' + temp.reverse().join(' ');
  } else {
    return line;
  }
}

// function to extrapolate candela data over more angle measurement points
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
