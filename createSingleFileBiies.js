const fs = require('fs');
const Path = require('path');

const lengths = ['2', '3', '4'];

function buildTree() {
  fs.readdir('./', (err, entries) => {
    //find CSV data file
    var refPath = '';

    entries.forEach((refFile) => {
      const path = Path.join('./', refFile);
      if (path.match(/\.csv$/)) {
        refPath = path;
      } 
    });

    console.log('Reference files:');
    console.log(refPath);
    //loops through all IES files in current directory
    entries.forEach((file) => {
      const path = Path.join('./', file);
      if ((file.match(/\.IES$/) || file.match(/\.ies$/)) && originalFileCheck(path)) {
        processFile(refPath,path);
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
function processFile(refPath,path) {
  // set output path
  var outputDir = './output';
  // create output directory if it does not exist
  if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir);
  }
  // set direct file content and chop up file name
  const originalText = fs.readFileSync(path, 'utf8').split(/\r?\n/);

  const originalFileName = path.split('-');
  // select appropriate direct output data per shielding
  const newData = processCSV(refPath,originalFileName[1]);
  const newIndData = processCSV(refPath,originalFileName[2]);
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
      // if (originalText[index + 1].includes('FINISH, ')) {
      //   originalText[index + 1].replace('FINISH, ', '');
      // }
      // originalText[index] = '[LUMINAIRE]FABRICATED METAL HOUSING WITH WHITE PAINTED GENERAL INTERIOR FINISH\r\n[MORE]AND 2 DISTINCT OPTICAL COMPARTMENTS, TOP OPTICAL COMPARTMENT CONSISTS OF:';
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
      // while (originalText[index + 1].split(' ')[0] === '') {
        // originalData.endAngles += originalText[index + 1];
        // console.log(originalData.endAngles)
        // originalText.splice(index + 1, 1)
      // } 
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
  // if (originalText[indexTrace + 3].split(' ')[0] === '') {
    // originalText.splice(indexTrace + 3, 1)
  // }

  // combines/replaces fixture data to establish combined base file content
  var combFixtureData = originalData.fixtureData.split(' ');
  // combines text to establish base file content, common base info (no configuration variables)
  var combinedText = originalText.join('\r\n')
    .replace('[TEST]ITL','[TEST]SCALED FROM ITL')
    .replace('-GONIOPHOTOMETRY','')
    .replace('[_ABSOLUTELUMENS]','[OTHER]NOTE THIS TEST FILE HAS MULTIPLIER AND/OR WATTAGE ADJUSTMENTS APPLIED FOR CCT, OPTIC OR OUTPUT OPTIONS - CONTACT PINNACLE FACTORY FOR MORE INFORMATION\r\n[_ABSOLUTELUMENS]')

  //loops through direct output data to build configs
  Object.keys(newData).forEach((color) => {
    // loops through indirect output data to build configs
    Object.keys(newIndData).forEach(indColor => {
      // ensures only output of common colors is processed
      if (color.substr(0,3) === indColor.substr(0,3)) {
        // loops through each length to build configs
        lengths.forEach((length) => {
          // copies variables to avoid base )ile modification
          var newFixtureData = combFixtureData.join(' ').split( ' ');
          var newWattageData = originalData.wattageData.split( ' ');
          // calculates proud lens abs lumens differential 
          // var dropLensDirDif = originalFileName.includes('AL') ? 0.138547 * Number(originalData.absLumen) : originalFileName.includes('HED') ? 0.02 * Number(originalData.absLumen) : 0;
          // var dropLensIndDif = originalFileName.includes('AL') ? 0.147447 * Number(indData.absLumen) : originalFileName.includes('HED') ? 0.02 * Number(originalData.absLumen) : 0;
          // var raisedLensDif = originalFileName.includes('HEA') ? 0.02 * Number(indData.absLumen) : 0;
          // calculates ratio of direct output to direct abs lumens, normalizer later applied to all indirect data for use in overall file multiplier (IES toolbox)
          // var indNormalizer
          // var indNormalizer = (Number(originalData.absLumen) * (newIndData[indColor][0] * Number(length)) / (newData[color][0] * Number(length))) / Number(indData.absLumen);
          // var indNormalizer = ((originalFileName[0].substring(0,2)==="L8" ? 5150.09 : 4959.27) * (newIndData[indColor][0] * Number(length)) / (newData[color][0] * Number(length))) / (originalFileName[0].substring(0,2)==="L8" ? 5142.67 : 4896.22);
          // var indNormalizer = ((originalFileName[0].substring(0,2)==="L8" ? 5150.09 : 4959.27) * (newIndData[indColor][0] * Number(length)) / (newData[color][0] * Number(length))) / (originalFileName[0].substring(0,2)==="L8" ? 5142.67 : 4896.22);
        //   var dirPercentage = (newData[originalFileName[3]][0] * Number(originalFileName[5].split('.')[0])) / (newIndData[originalFileName[4]][0] * Number(originalFileName[5].split('.')[0]) + newData[originalFileName[3]][0] * Number(originalFileName[5].split('.')[0]))
          var dirPercentage = originalFileName[0] === "EX3B" ? .367438 : .38737 //.391636 //.6366 //.387379
          var indNormalizer = (newIndData[indColor][0] * Number(originalFileName[5].split('.')[0])) / (Number(originalData.absLumen) * (1 - dirPercentage))
          var dirNormalizer = (newData[color][0] * Number(originalFileName[5].split('.')[0])) / (Number(originalData.absLumen) * dirPercentage)
          
          // if (color === '840HO' && indColor==='840LO') {
          //   console.log ('dir', dirNormalizer)
          //   console.log ('ind', indNormalizer)
          // }
          // var indNormalizer =  (newIndData[color][0] / newData[originalFileName[3]][0];
          // if (path.split('-')[0] === "EX3D") {
            // indNormalizer = ((Number(originalData.absLumen) - dropLensDirDif + raisedLensDif) * (newIndData[indColor][0] * Number(length)) / (newData[color][0] * Number(length))) / (Number(indData.absLumen) + dropLensIndDif - raisedLensDif);
          // } else {
            // indNormalizer = color === indColor ? 1 : 1 //unfinished placeholder for errors 
            // console.log(indNormalizer)
          // } 
          // calculates configuration specific normalized indirect abs lumens to direct abs lumens per above

          // var combAbsLumens = ((Number(originalData.absLumen) - dropLensDirDif + raisedLensDif) + ((Number(indData.absLumen) + dropLensIndDif - raisedLensDif) * indNormalizer));
          // var combAbsLumens = originalFileName[0].substring(0,2)==="L8" ? 5150.09 : 4959.27 + (originalFileName[0].substring(0,2)==="L8" ? 5142.67 : 4896.22 * indNormalizer);
          var combAbsLumens = newIndData[indColor][0] * Number(length) + newData[color][0] * Number(length);
          // calculates configuration specific overall file multiplier (IES toolbox) and sets in variable
          // newFixtureData[2] = ((newData[color][0] * Number(length) + newIndData[indColor][0] * Number(length)) / Number(originalData.absLumen)).toFixed(5);
          newFixtureData[2] = Number(length) / Number(originalFileName[5].split('.')[0])
          // calculates configuration specific total wattage and sets in variable
          newWattageData[2] = (newData[color][1] * Number(length) + newIndData[indColor][1] * Number(length)).toFixed(1);
          // notes length and width dim location and delta of base files to config length
          var dimsArray = lengthModifier(newFixtureData, originalFileName[5], length);
          // reorders length and width IF asymmetrical shielding (per IES spec)
          if (originalFileName.includes('WHE')) {
            newFixtureData[newFixtureData.length - 3] = (Number(combFixtureData[dimsArray[0]]) - dimsArray[2]).toFixed(2);
            newFixtureData[newFixtureData.length - 2] = combFixtureData[dimsArray[1]];
          } else {
            newFixtureData[dimsArray[0]] = (Number(combFixtureData[dimsArray[0]]) - dimsArray[2]).toFixed(2);
          }
          // helper function to combine the direct and indirect candela data, all normalizers applied
          var combCandelaData = candelaCombiner(originalData.candelaData, dirNormalizer, indNormalizer, dirPercentage);
          // sets base combined file name to be replaced on each config
          var oldFile = [originalFileName[0],originalFileName[1],originalFileName[2],originalFileName[3],originalFileName[4],originalFileName[5].split('.')[0]]
          // creates new combined file name
          var newFile = [originalFileName[0],oldFile[1],oldFile[2],color,indColor,length];
          // configuration specific file content replacement
          var newText = combinedText
            .replace(oldFile.join('-'), newFile.join('-'))
            .replace('[_ABSOLUTELUMENS]' + originalData.absLumen,'[_ABSOLUTELUMENS]' + combAbsLumens.toFixed(0))
            .replace(combFixtureData.join(' '), newFixtureData.join(' '))
            .replace(originalData.wattageData, newWattageData.join(' '))
          // adds file extension to combined file name
          var newFileName = newFile.join('-') + '.IES';
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
        } else {
          outputObject[color].push(Number(splitLine[shieldIndex]));
          outputObject[color].push(Number(splitLine[1]));
        }
      }
    }
  })
  return outputObject;
}

// function for combining direct and indirect candela data
function candelaCombiner(dirArr,dNorm,iNorm,dPerc) {
  // cleans up the lines to remove extraneous spaces and newlines, then removes inverse hemisphere in proud lens applications
  // var directC = fixLines(dirArr).map(dLine => {
  //   return removeInvHem(dLine)
  // });
  // var indirectC = fixLines(indArr).map(iLine => {
  //   return removeInvHem(iLine)
  // });
  var directC = fixLines(dirArr);
  // var indirectC = fixLines(indArr);
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
  // if (directC.length < indirectC.length) {
    // directC = normalizeAngleQty(directC.reverse());
  // } else if (indirectC.length < directC.length) {
    // indirectC = normalizeAngleQty(indirectC.reverse());
  // }
  // combines the processed candela data
  var comb = []
  for (var i = 0; i < directC.length; i++) {
    if (directC[i] !== undefined) {
      let splitD = directC[i].split(' ');
      // for (var j = Math.floor(splitD.length/2); j < splitD.length; j++) {
      //   splitD[j] = (splitD[j] * norm).toFixed(0);
      // }
      var newSplitD = splitD.map((val, ind) => {
        // console.log(ind <= Math.ceil(splitD.length/2))
        // console.log(ind)
        if (ind <= splitD.length/2) {
          return (val * dNorm).toFixed(4);
        }
        // else if (ind === Math.ceil(splitD.length/2)) {
          // console.log(val); 
          // console.log(ind);
          // console.log('yes', (((val * dPerc) * dNorm) + (((val * (1-dPerc)) * iNorm))).toFixed(2));
          
          // return (((val * dPerc) * dNorm) + (((val * (1-dPerc)) * iNorm))).toFixed(4) ;
        // } 
        else {
          return (val * iNorm).toFixed(4);
        }
      })
      comb.push(newSplitD.join(' '))
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
