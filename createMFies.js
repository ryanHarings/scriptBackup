const fs = require('fs');
const Path = require('path');

// const lengths = ['22','44','11','33'];
const lengths = ['2', '3']
// const lengths = ['2','3','4']

const biAngles = '0 2.5 5 7.5 10 12.5 15 17.5 20 22.5 25 27.5 30 32.5 35 37.5 40 42.5 45 47.5 50 52.5 55 57.5 60 62.5 65 67.5 70 72.5 75 77.5 80 82.5 85 87.5 90 92.5 95 97.5 100 102.5 105 107.5 110 112.5 115 117.5 120 122.5 125 127.5 130 132.5 135 137.5 140 142.5 145 147.5 150 152.5 155 157.5 160 162.5 165 167.5 170 172.5 175 177.5 180'

const noteBody = {
//   Q3S: {
//     d: '[LUMINAIRE]HOUSING WITH WHITE PAINTED GENERAL INTERIOR FINISH AND A FABRICATED\r\n[MORE]METAL TOP HOUSING, FORMED WHITE PAINTED METAL REFLECTOR/CIRCUIT BOARD\r\n[MORE]MOUNT, WHITE CIRCUIT BOARDS EACH WITH 36 LEDS, EXTRUDED CLEAR FROSTED\r\n[MORE]FLAT PLASTIC LENS. LENSES FROSTED BOTH SIDES. OPEN CENTER.',
//     di: '[LUMINAIRE]HOUSING WITH SIDES CONSISTING OF: EXTRUDED METAL\r\n[MORE]HOUSING WITH WHITE PAINTED GENERAL INTERIOR FINISH AND 2 DISTINCT OPTICAL\r\n[MORE]COMPARTMENTS, TOP OPTICAL COMPARTMENT CONSIST OF: FORMED WHITE PAINTED\r\n[MORE]METAL REFLECTOR/CIRCUIT BOARD MOUNT, WHITE CIRCUIT BOARDS EACH WITH 36\r\n[MORE]LEDS, EXTRUDED CLEAR FROSTED DROP PLASTIC LENS. BOTTOM OPTICAL\r\n[MORE]COMPARTMENT CONSISTS OF: FORMED WHITE PAINTED METAL REFLECTOR/CIRCUIT\r\n[MORE]BOARD MOUNT, WHITE CIRCUIT BOARDS EACH WITH 36 LEDS, EXTRUDED CLEAR\r\n[MORE]FROSTED FLAT PLASTIC LENS. OPEN CENTER.'
//   },
//   Q3R: {
//     d: '[LUMINAIRE]HOUSING WITH EACH SIDE CONSISTING OF: FABRICATED METAL\r\n[MORE]HOUSING WITH WHITE PAINTED GENERAL INTERIOR FINISH, FORMED WHITE PAINTED\r\n[MORE]METAL REFLECTOR/CIRCUIT BOARD MOUNT, WHITE CIRCUIT BOARDS EACH WITH 36\r\n[MORE]LEDS, EXTRUDED TRANSLUCENT WHITE FROSTED FLAT PLASTIC LENS. LENSES\r\n[MORE]FROSTED BOTH SIDES. OPEN CENTER. EACH OPTICAL COMPARTMENT\r\n[MORE]CIRCUIT BOARD MOUNT HAS OVERLAPPING SECTIONS. THIS CONFIGURATION HAS A\r\n[MORE]TOTAL OF 24 OF THE ENERGIZED LEDS PROVIDING MINIMAL CONTRIBUTION TO THE\r\n[MORE]TOTAL LIGHT OUTPUT.'
//   },
  EX2D: {
    di: '[LUMINAIRE]EXTRUDED METAL HOUSING WITH WHITE PAINTED GENERAL INTERIOR FINISH\r\n[MORE]AND CAST WHITE PAINTED METAL END CAPS, FORMED WHITE PAINTED METAL\r\n[MORE]REFLECTOR/CIRCUIT BOARD MOUNT, WHITE CIRCUIT BOARDS EACH WITH 36 LEDS,\r\n[MORE]EXTRUDED PLASTIC REFLECTOR/LENS ASSEMBLY WITH WHITE REFLECTOR AND A\r\n[MORE]FROSTED CLEAR LINEAR PRISMATIC LENS. LENS FROSTED BOTH SIDES WITH PRISMS\r\n[MORE]IN AND PARALLEL WITH LENGTH OF HOUSING. TOP OPTICAL COMPARTMENT CONSISTS\r\n[MORE]OF FORMED WHITE PAINTED METAL REFLECTOR/CIRCUIT BOARD MOUNT,\r\n[MORE]WHITE CIRCUIT BOARDS EACH WITH 36 LEDS, MULTI-PIECE FROSTED LINEAR\r\n[MORE]PRISMATIC PLASTIC LENS. LENS WITH PRISMS OUT AND FROSTED BOTH SIDES.'
//     d: '[LUMINAIRE]EXTRUDED METAL HOUSING WITH WHITE PAINTED GENERAL INTERIOR FINISH\r\n[MORE]AND CAST WHITE PAINTED METAL END CAPS, FORMED WHITE PAINTED METAL\r\n[MORE]REFLECTOR/CIRCUIT BOARD MOUNT, WHITE CIRCUIT BOARDS EACH WITH 36 LEDS,\r\n[MORE]EXTRUDED PLASTIC REFLECTOR/LENS ASSEMBLY WITH WHITE REFLECTOR AND A\r\n[MORE]TRANSLUCENT WHITE FROSTED PRISMATIC DIFFUSER. DIFFUSER FROSTED BOTH\r\n[MORE]SIDES.',
//     di: '[LUMINAIRE]EXTRUDED METAL HOUSING WITH WHITE PAINTED GENERAL INTERIOR FINISH\r\n[MORE]AND CAST WHITE PAINTED METAL END CAPS, TOP OPTICAL COMPARTMENT CONSISTS\r\n[MORE]OF FORMED WHITE PAINTED METAL REFLECTOR/CIRCUIT BOARD MOUNT, WHITE\r\n[MORE]CIRCUIT BOARDS EACH WITH 36 LEDS, EXTRUDED PLASTIC REFLECTOR/LENS\r\n[MORE]ASSEMBLY WITH WHITE REFLECTOR AND A TRANSLUCENT WHITE FROSTED PRISMATIC\r\n[MORE]DIFFUSER. DIFFUSER FROSTED BOTH SIDES. TOP OPTICAL COMPARTMENT CONSISTS\r\n[MORE]OF FORMED WHITE PAINTED METAL REFLECTOR/CIRCUIT BOARD MOUNT, WHITE\r\n[MORE]CIRCUIT BOARDS EACH WITH 36 LEDS, EXTRUDED TRANSLUCENT FROSTED PLASTIC\r\n[MORE]DIFFUSER. DIFFUSER FROSTED BOTH SIDES.'
//   },
//   EX2I: {
//     d: '[LUMINAIRE]EXTRUDED METAL HOUSING WITH WHITE PAINTED GENERAL INTERIOR FINISH\r\n[MORE]AND CAST WHITE PAINTED METAL END CAPS, FORMED WHITE PAINTED METAL\r\n[MORE]REFLECTOR/CIRCUIT BOARD MOUNT, WHITE CIRCUIT BOARDS EACH WITH 36\r\n[MORE]LEDS, EXTRUDED TRANSLUCENT FROSTED PLASTIC DIFFUSER. DIFFUSER FROSTED\r\n[MORE]BOTH SIDES.'
//   },
//   EV2D: {
//     d: '[LUMINAIRE]FABRICATED METAL HOUSING WITH WHITE PAINTED GENERAL INTERIOR\r\n[MORE]FINISH, FORMED WHITE PAINTED METAL REFLECTOR/CIRCUIT BOARD MOUNT,\r\n[MORE]WHITE CIRCUIT BOARDS EACH WITH 36 LEDS, EXTRUDED PLASTIC REFLECTOR/LENS\r\n[MORE]ASSEMBLY WITH WHITE REFLECTOR AND A TRANSLUCENT WHITE FROSTED DIFFUSER.\r\n[MORE]DIFFUSER FROSTED BOTH SIDES.'
  },
  EX3D: {
    di: '[LUMINAIRE]EXTRUDED METAL HOUSING WITH WHITE PAINTED GENERAL INTERIOR FINISH\r\n[MORE]AND CAST WHITE PAINTED METAL END CAPS, FORMED WHITE PAINTED METAL\r\n[MORE]REFLECTOR/CIRCUIT BOARD MOUNT, WHITE CIRCUIT BOARDS EACH WITH 36 LEDS,\r\n[MORE]EXTRUDED PLASTIC REFLECTOR/LENS ASSEMBLY WITH WHITE REFLECTOR AND A\r\n[MORE]FROSTED CLEAR LINEAR PRISMATIC LENS. LENS FROSTED BOTH SIDES WITH PRISMS\r\n[MORE]IN AND PARALLEL WITH LENGTH OF HOUSING. TOP OPTICAL COMPARTMENT CONSISTS\r\n[MORE]OF FORMED WHITE PAINTED METAL REFLECTOR/CIRCUIT BOARD MOUNT,\r\n[MORE]WHITE CIRCUIT BOARDS EACH WITH 36 LEDS, MULTI-PIECE FROSTED LINEAR\r\n[MORE]PRISMATIC PLASTIC LENS. LENS WITH PRISMS OUT AND FROSTED BOTH SIDES.'
  },
  EX4D: {
//     d: '[LUMINAIRE]EXTRUDED METAL HOUSING WITH WHITE PAINTED GENERAL INTERIOR FINISH\r\n[MORE]AND CAST WHITE PAINTED METAL END CAPS, FORMED WHITE PAINTED METAL\r\n[MORE]REFLECTOR/CIRCUIT BOARD MOUNT, WHITE CIRCUIT BOARDS EACH WITH 36 LEDS,\r\n[MORE]EXTRUDED PLASTIC REFLECTOR/LENS ASSEMBLY WITH WHITE REFLECTOR AND A\r\n[MORE]TRANSLUCENT WHITE FROSTED PRISMATIC DIFFUSER. DIFFUSER FROSTED BOTH\r\n[MORE]SIDES.',
    di: '[LUMINAIRE]EXTRUDED METAL HOUSING WITH WHITE PAINTED GENERAL INTERIOR FINISH\r\n[MORE]AND CAST WHITE PAINTED METAL END CAPS, FORMED WHITE PAINTED METAL\r\n[MORE]REFLECTOR/CIRCUIT BOARD MOUNT, WHITE CIRCUIT BOARDS EACH WITH 36 LEDS,\r\n[MORE]EXTRUDED PLASTIC REFLECTOR/LENS ASSEMBLY WITH WHITE REFLECTOR AND A\r\n[MORE]FROSTED CLEAR LINEAR PRISMATIC LENS. LENS FROSTED BOTH SIDES WITH PRISMS\r\n[MORE]IN AND PARALLEL WITH LENGTH OF HOUSING. TOP OPTICAL COMPARTMENT CONSISTS\r\n[MORE]OF FORMED WHITE PAINTED METAL REFLECTOR/CIRCUIT BOARD MOUNT,\r\n[MORE]WHITE CIRCUIT BOARDS EACH WITH 36 LEDS, MULTI-PIECE FROSTED LINEAR\r\n[MORE]PRISMATIC PLASTIC LENS. LENS WITH PRISMS OUT AND FROSTED BOTH SIDES.'
  }
//   EX4I: {
//     d: '[LUMINAIRE]EXTRUDED METAL HOUSING WITH WHITE PAINTED GENERAL INTERIOR FINISH\r\n[MORE]AND CAST WHITE PAINTED METAL END CAPS, FORMED WHITE PAINTED METAL\r\n[MORE]REFLECTOR/CIRCUIT BOARD MOUNT, WHITE CIRCUIT BOARDS EACH WITH 36\r\n[MORE]LEDS, EXTRUDED TRANSLUCENT FROSTED PLASTIC DIFFUSER. DIFFUSER FROSTED\r\n[MORE]BOTH SIDES.'
//   },

//   EV4D: {
//     d: '[LUMINAIRE]FABRICATED METAL HOUSING WITH WHITE PAINTED GENERAL INTERIOR\r\n[MORE]FINISH, FORMED WHITE PAINTED METAL REFLECTOR/CIRCUIT BOARD MOUNT,\r\n[MORE]WHITE CIRCUIT BOARDS EACH WITH 36 LEDS, EXTRUDED PLASTIC REFLECTOR/LENS\r\n[MORE]ASSEMBLY WITH WHITE REFLECTOR AND A TRANSLUCENT WHITE FROSTED DIFFUSER.\r\n[MORE]DIFFUSER FROSTED BOTH SIDES.'
//   }

}

const missingLumenMult = {
  CD: {
    A: 1.034
  },
  CI: {
    BW: 1 //.603
  },
  CDIF: {
    A: 1.0
  },
  EX1D: {
    A: 1,
    BW: 1.0,
    HE: 1.0,
    HED: 1.0,
    P: 1.0,
    WHE: 1.0
  },
  EX1I: {
    BW: 1.0,
    HE: 1.0,
    HEA: 1.0,
    WHE: 1.0
  },
  EX2D: {
    A: 1,
    AL: 1.19, // <-whe mult, non-whe -> 1.21,
    BW: 1.0,
    HE: 1.0,
    HED: 1.0, //1.011
    WHE: 1.0
  },
  EX2I: {
    BW: 1.0, //1.001,
    HEA: 1.0, //1.025,
    WHE: 1.01
  },
  EX3D: {
    A: 1,
    AL: 1.1215, // 1.132, //1.1215, //good?
    BW: .988, //.988, //.977,
    HE: 1.00, //1.015,
    HED: 1.0, //1.009 //good?
    WHE: 1. //1.044 // 1.044
  },
  // AL-HEA: 1.131-1.021
  // AL-WHE: 1.11-1
  EX3I: {
    BW: 1,
    HEA: 1.0,
    WHE: 1
  },
  EX4D: {
    A: 1,
    AL: 1.13,
    BW: 1.0, //.999, //.99, //.995
    HE: 1.0, //.998,
    HED: 1.0, //1.005,
    WHE: 1.0 //1.005
  },
  EX4I: {
    BW: 1.0,
    HEA: 1.0, //1.010,
    WHE: 1.0 //1.01
  },
  L6D: {
    A: 1
  },
  L6I: {
    BW: 1.002
  },
  L8D: {
    A: 1
  },
  L8I: {
    BW: 1.002
  }
}

function buildTree() {
  fs.readdir('./', (err, entries) => {
    //find all file names
    var refPath;
    var refIndPath;
    var indPaths = [];

    entries.forEach((refFile) => {
      const path = Path.join('./', refFile);
      // if (path.match(/\.csv/)) {
      if (path.match(/MW\.csv/) || path.match(/M\.csv/) || path.match(/D\.csv/) || path.match(/S3N\.csv/) || path.match(/S3U\.csv/) || path.match(/CDF\.csv/) || path.match(/CDIF\.csv/)) {
        refPath = path;
      } else if (path.match(/I\.csv/) || path.match(/CDI\.csv/)) {
        refIndPath = path;
      } else if ((path.match(/\.IES$/) || path.match(/\.ies$/)) && originalFileCheck(path) && path.split('-')[0].match(/I/)) {
        indPaths.push(path)
      }
    });
    if (refPath === undefined && refIndPath !== undefined) {
      refPath = refIndPath;
      indPaths = []
      var refIndPath
    }

    console.log('Files:');
    console.log("Direct reference: ", refPath);
    console.log("Indirect reference: ", refIndPath);
    console.log("Indirect files: ", indPaths);
    //loops through all IES files in current directory
    entries.forEach((file) => {
      const path = Path.join('./', file);
      if ((path.split('-')[0].match(/D/) || (path.split('-')[0].match(/I/) && indPaths.length === 0) || path.split('-')[0].match(/M/) || path.split('-')[0].match(/S3/)) && (file.match(/\.IES$/) || file.match(/\.ies$/))) {
        console.log("Direct file: ", path);
        processFile(refPath,refIndPath,path,indPaths);
      }
    });
    console.log("Output Complete!");
  });
}

buildTree();

//checks if the file is the original
function originalFileCheck(path) {
  const file = fs.readFileSync(path, 'utf8');
  return !file.includes('[TEST]SCALED FROM ITL')
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
  const originalText = fs.readFileSync(path, 'utf8').split(/\r?\n/);

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
    
    if (line.includes('[LUMINAIRE]') && (originalFileName[0]==='EX3D' || originalFileName[0]==='EX4D') && indPaths.length>0) {
      while (originalText[index + 1].includes('[MORE]')) {
        originalText.splice(index + 1, 1)
      }
      var bodyText = noteBody[originalFileName[0]]
      originalText[index] = bodyText['di'];
    } else if (line.includes('[LAMP]')) {
      if (originalText[index + 1].includes('[MORE]')) {
        originalText.splice(index + 1, 1);
      }
      originalText.splice(index, 1);
      // originalText[index] = '[LAMP]TWO HUNDRED EIGHTY-EIGHT WHITE LIGHT EMITTING DIODES (LEDS), 144 VERTICAL\r\n[MORE]BASE-UP POSITION, 144 TILTED 10-DEGREES FROM VERTICAL BASE-DOWN POSITION.'
    } else if (line.includes('_ELECTRICAL')) {
      originalText.splice(index, 1)
    } else if (line.includes('_LEDDRIVER')) {
      while (originalText[index + 1].includes('[MORE]')) {
        originalText.splice(index, 1);
      }
      originalText.splice(index, 1)
    } else if (line.includes('[_ABSOLUTELUMENS]')) {
      indexTrace = index + 2;
      originalData.absLumen = line.split(']')[1];
    } else if (index === indexTrace) {
      originalData.fixtureData = line;
    } else if (index === indexTrace + 1) {
      originalData.wattageData = line;
    } else if (index === indexTrace + 2) {
      if((originalFileName[0]==='CU1I' || originalFileName[0]==='CU3I') && line.split(' ').length!==73) {
        originalData.endAngles = convertAngles(line);
      } else {
        originalData.endAngles = line;
      }
      while (originalText[index + 1].split(' ')[0] === '') {
        originalData.endAngles += originalText[index + 1]
        originalText.splice(index + 1, 1)
      }
      originalText[index] = originalData.endAngles
    } else if (line.split(' ')[0] === '0' && (line.split(' ').length === 5 || line.split(' ').length === 9 || line.split(' ').length === 11 || line.split(' ').length === 16 || line.split(' ').length === 25 || line.split(' ').length === 37 || line.split(' ').length === 73)) {
      originalData.candelaData.splice(0, originalData.candelaData.length);
      originalData.deleteLines.splice(0, originalData.deleteLines.length);
      originalData.topAngles = line;
    } else if (index > indexTrace && index < originalText.length - 1) {
      // console.log(index,originalText.length,line)
      if(originalFileName[0]==='CU1I' || originalFileName[0]==='CU3I') {
        originalData.candelaData.push(line.split(' ').reverse().join(' '));
      } else {
        originalData.candelaData.push(line);
      }
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
  for (var i = 0; i < (indPaths.length===0 ? 1 : indPaths.length); i++) {
    var indText;
    var indFileName
    var newIndData
    const indData = {
      'test': '',
      'luminaire': [],
      'absLumen': '',
      'topAngles': '',
      'fixtureData': [],
      'wattageData': [],
      'candelaData': []
    }
    if (indPaths.length>0) {
      var indP = indPaths[i];
    // indPaths.forEach(indP => {
      // set indirect file content and chop up file name
      indText = fs.readFileSync(indP, 'utf8').split(/\r?\n/);
      indFileName = indP.split('-');
      // selects appropriate indirect output data per shielding
      newIndData = processCSV(refIndPath,indFileName[1]);

      // variable for body data
      
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
        } else if (line.split(' ')[0] === '0' && (line.split(' ').length === 5 || line.split(' ').length === 16 || line.split(' ').length === 9 || line.split(' ').length === 25)) {
          indData.candelaData.splice(0, indData.candelaData.length);
          indData.topAngles = line;
        } else if (index >= indexIndTrace && index < indText.length - 1) {
          indData.candelaData.push(line);
        }
      });
    }
    // combines/replaces fixture data to establish combined base file content
    var combFixtureData = originalData.fixtureData.split(' ');
    // diode qty
    combFixtureData[0] = indPaths.length>0 ? indData.fixtureData.split(' ')[0] : combFixtureData[0];
    // vertical angle qty
    combFixtureData[3] = indPaths.length>0 ? '73' : combFixtureData[3];
    // top angle qty
    combFixtureData[4] = indPaths.length>0 && Number(combFixtureData[4]) < Number(indData.fixtureData.split(' ')[4]) ? Number(indData.fixtureData.split(' ')[4]) : Number(combFixtureData[4]);
    // sets z axis IF applicable
    combFixtureData[9] = Number(originalData.fixtureData.split(' ')[9]) > 0 || indPaths.length===0 ? originalData.fixtureData.split(' ')[9] : indData.fixtureData.split(' ')[9]
    // checks if top angle qty is equal, sets the largest qty if not
    var combTopAngles = indPaths.length>0 && originalData.topAngles.length < indData.topAngles.length ? indData.topAngles : originalData.topAngles
    // combines text to establish base file content, common base info (no configuration variables)

    var combinedText = originalText.join('\r\n')
      .replace('[TEST]ITL','[TEST]SCALED FROM ITL')
      .replace('[TEST]  KPL','[TEST]SCALED FROM KPL')
      // .replace('[TEST]','[TEST]SCALED FROM')
      .replace('-GONIOPHOTOMETRY',indPaths.length>0 ? ' & ' + indData.test : '')
      .replace('-GONIOPHOTOMETRY','')
      // if(indPaths.length>0) {
      //   .replace('D Series','DI Series')
      // }
      // .replace('-' + originalFileName[2], '-' + 'test')
      // .replace('[LAMP]', indPaths.length>0 ? indData.luminaire.join('\r\n') + '\r\n[LAMP]' : '[LAMP]')
      .replace('[_ABSOLUTELUMENS]','[OTHER]NOTE THIS TEST FILE HAS MULTIPLIER AND/OR WATTAGE ADJUSTMENTS APPLIED FOR CCT, OPTIC OR OUTPUT OPTIONS - CONTACT PINNACLE FACTORY FOR MORE INFORMATION\r\n[_ABSOLUTELUMENS]')
      .replace(originalData.fixtureData, combFixtureData.join(' '))
      .replace(originalData.endAngles, indPaths.length>0 ? biAngles : originalData.endAngles)
      .replace(originalData.topAngles, combTopAngles);
    //loops through direct output data to build configs
    Object.keys(newData).forEach((color) => {
      // loops through indirect output data to build configs
      for (var j=0; j<(indPaths.length===0 ? 1 : Object.keys(newIndData).length); j++) {
      // Object.keys(newIndData).forEach(indColor => {
        if (indPaths.length>0) {
          var indColor = Object.keys(newIndData)[j];
        }
        // ensures only output of common colors is processed
        if (indPaths.length === 0 || color.substr(0,3) === indColor.substr(0,3) || (color.substr(0,2)==="TW" && indColor.substr(0,2)==="TW")) {
          // loops through each length to build configs
          for (var k=0; k<lengths.length - (path.split('-')[0] === "Q3R" ? 2 : 0); k++) {
          // lengths.forEach((length) => {
            var length = originalFileName[1].includes('24') ? '24' : lengths[k];
            var linLength = length === '24' ? 12 : Number(length.charAt(0)) * (length.length > 1 ? 4 : 1);

            // copies variables to avoid base file modification
            var newFixtureData = combFixtureData.join(' ').split( ' ');
            var newWattageData = originalData.wattageData.split( ' ');
             
            var dirNormalizer = (newData[color][0] * Number(linLength)) / Number(originalData.absLumen);
            // calculates ratio of direct output to direct abs lumens, normalizer later applied to all indirect data for use in overall file multiplier (IES toolbox)
            if (indPaths.length>0) {
              // var origIndLinLength = indFileName[1].substring(0,2) === '24' ? 12 : Number(indFileName[1].charAt(0)) * 4;
              // var indAbsRatio = newData[indFileName[5].split('.')[0]][0] / (newData[indFileName[4]][0] + newData[indFileName[5].split('.')[0]][0]);
              // var partialAbs = Number(indData.absLumen) * indAbsRatio;
              var indNormalizer = (newIndData[indColor][0] * Number(linLength)) / Number(indData.absLumen);
              // var indNormalizer = (Number(originalData.absLumen) * (newIndData[indColor][0] * Number(length)) / (newData[color][0] * Number(length))) / (Number(indData.absLumen));
            }
            // calculates configuration specific normalized indirect abs lumens to direct abs lumens per above
            
            var combAbsLumens = newData[color][0] * Number(linLength);

            if (indPaths.length>0) {
              combAbsLumens += newIndData[indColor][0] * Number(linLength)
            }
            // calculates configuration specific overall file multiplier (IES toolbox) and sets in variable
            newFixtureData[2] = 1;
            // newFixtureData[2] = ((newData[color][0] * Number(length) + newIndData[indColor][0] * Number(length)) / combAbsLumens).toFixed(5);

            // calculates configuration specific total wattage and sets in variable
            var combWattage = newData[color][1] * Number(linLength);
            if (indPaths.length>0) {
              combWattage += newIndData[indColor][1] * Number(linLength)
            }
            newWattageData[2] = combWattage.toFixed(1)

            // notes length and width dim location and delta of base files to config length
            // var dimsArray = lengthModifier(newFixtureData, originalFileName[1].substring(0,2), length);
            var dimsArray = lengthModifier(newFixtureData, originalFileName[3].substring(0,1), length);

            newFixtureData[dimsArray[(indPaths.length > 0 && indFileName[1] === "WHE" && originalFileName[1] !== "WHE" ? 1 : 0)]] = (Number(combFixtureData[dimsArray[0]]) - dimsArray[2]).toFixed(2);
            // newFixtureData[dimsArray[2]] = (Number(combFixtureData[dimsArray[2]]) - dimsArray[3]).toFixed(2);
            newFixtureData[dimsArray[(indPaths.length > 0 && indFileName[1] === "WHE" && originalFileName[1] !== "WHE" ? 0 : 1)]] = Number(combFixtureData[dimsArray[1]]).toFixed(2);

            // helper function to combine the direct and indirect candela data, all normalizers applied
            var dirMissingLumenM = 1
            var indMissingLumenM = 1

            if (indPaths.length>0) {
              // if (originalFileName[1] === "AL" || originalFileName[1] === "BW" || originalFileName[1] === "HE" || originalFileName[1] === "HED" || originalFileName[1] === "WHE") {
              if (originalFileName[1]) {
                dirMissingLumenM = missingLumenMult[originalFileName[0]][originalFileName[1]]
              }
              if (indFileName[1] === "HEA" || indFileName[1] === "HE" || indFileName[1] === "BW" || (indFileName[1]==="WHE" && (indFileName[0]==="EX4I" || indFileName[0]==="EX3I" || indFileName[0]==="L6I" || indFileName[0]==="L8I"))) {
                indMissingLumenM = missingLumenMult[indFileName[0]][indFileName[1]]
              }
            }

            var combCandelaData = candelaCombiner(originalData.candelaData, indData.candelaData, dirNormalizer, indNormalizer, dirMissingLumenM, indMissingLumenM);
            // sets base combined file name to be replaced on each config
            var biFileName = path.split('-')[0];
            console.log(biFileName)
            if (biFileName==="CDF") {
              var oldFile = [biFileName,originalFileName[2],originalFileName[3].replace('.IES', '')]
            } else if (biFileName==="CDIF") {
              var oldFile = [biFileName,originalFileName[1],originalFileName[2],originalFileName[3].replace('.IES', '')]
            } else {
              var oldFile = [biFileName,originalFileName[1],originalFileName[2],originalFileName[3].replace('.IES', '')]
            }
            // creates new combined file name
            if (indPaths.length>0 && biFileName!=="CDIF") {
              // var newFile = [biFileName,length+"DI",oldFile[2],indFileName[2],color,indColor];
              var newFile = [biFileName+'I',oldFile[1],indFileName[1],color,indColor,length]
            } else if (biFileName==="S3U" || biFileName==="S3N") {
              var newFile = [biFileName,color,length]
            } else if (biFileName==="CDF") {
              var newFile = [biFileName,"N",color,length]
            } else if (biFileName==="CDIF") {
              var newFile = [biFileName,"BW",color,indColor,length]
            } else {
              // var newFile = [biFileName,length+"D",oldFile[2],color];
              var newFile = [biFileName,oldFile[1],color,length]
            }

            // configuration specific file content replacement
            var newText = combinedText
              .replace(oldFile.join('-'), (biFileName==="CDF" || biFileName==="CDIF") ? newFile.join('-').concat('-----REFER TO IES FILE INSTRUCTIONS FOR X OR Y FORM IN ZIP FOLDER-----') : newFile.join('-'))
              .replace('[_ABSOLUTELUMENS]' + originalData.absLumen,'[_ABSOLUTELUMENS]' + combAbsLumens.toFixed(0))
              .replace(combFixtureData.join(' '), newFixtureData.join(' '))
              .replace(originalData.wattageData, newWattageData.join(' '))
            // adds file extension to combined file name
            var newFileName = newFile.join('-') + '.IES';
            // writes each file with content to output dir (if colors match per above)
            fs.writeFileSync(outputDir + '/' + newFileName, newText + combCandelaData);
          }
        }
      }
    })
  }
}

// function finds index of length and width, and establishes config specific length differential
function lengthModifier(fixArray,origL,newL) {
  var lengthDim = fixArray.length - 2;
  var widthDim = fixArray.length - 3;
  if (fixArray[widthDim] > fixArray[lengthDim]) {
    var tempDim = lengthDim;
    lengthDim = widthDim;
    widthDim = tempDim;
  }
  
  var lDiff = Number(origL.charAt(0)) - Number(newL.charAt(0));
  // var wDiff = Number(origL.charAt(1)) - Number(newL.charAt(1));

  // return [lengthDim, wDiff, widthDim, lDiff]
  return [lengthDim, widthDim, lDiff]
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
function candelaCombiner(dirArr,indArr, dNorm, iNorm, dRep, iRep) {
console.log(dirArr.length)
  // cleans up the lines to remove extraneous spaces and newlines, then removes inverse hemisphere in proud lens applications
  var directC = fixLines(dirArr);
  var indirectC = fixLines(indArr);
  console.log(directC.length)
  console.log(indirectC.length)

  if (directC.length === 9 && indirectC.length === 5) {
    var revInd = indirectC.slice().reverse().slice(0,-1)
    indirectC = revInd.concat(indirectC)
  }
  
  if (directC.length === 5 && indirectC.length === 16) {
    var revDir = directC.slice().reverse().slice(0,-1)
    directC = revDir.concat(directC)
  }

  // ensures the same number of angle measurements exist by configuration
  if (directC.length < indirectC.length) {
    // directC = normalizeAngleQty(directC.reverse(), indirectC.length);
    directC = normalizeAngleQty(directC, indirectC.length);
  } else if (indirectC.length < directC.length) {
    // indirectC = normalizeAngleQty(indirectC.reverse(), directC.length);
    indirectC = normalizeAngleQty(indirectC, directC.length);
  }

  // combines the processed candela data
  var comb = [] 
  
  // var dirTotal = 0
  // var dirMissing = 0

  for (var i = 0; i < directC.length; i++) {
    let splitD = directC[i].split(' ')

    // var dirRep = 1

    // if (splitD.length>37 && indirectC.length!==0) {
      // var dirTotal = 0;
      // var dirMissing = 0;
      // splitD.forEach((cand,ind)=>{
        // dirTotal += Number(cand);
        // if (ind > 36) {
          // dirMissing += Number(cand)
        // }
      // })
      // dirRep = 1 + dirMissing/dirTotal
    // }
    splitD = splitD.map(cand=>{
      // if (index < 36 && fixtPn.charAt(0)==="E" && fixtPn.split('').pop()==='I') {
      //   return 0;
      // } else {
      return (Number(cand)*dNorm*dRep).toFixed(1);
      // }
    });

    let splitI
    if (indirectC.length !== 0) {
      splitI = indirectC[i].split(' ')

      // var indRep = 1

      // if (splitI.length>37 && directC.length!==0) {
        // var indTotal = 0;
        // var indMissing = 0;
        // splitI.forEach((cand,ind)=>{
          // indTotal += Number(cand);
          // if (ind < 36) {
            // dirMissing += Number(cand)
          // }
        // })
        // indRep += indMissing/indTotal/37
      // }

      splitI = splitI.map(cand=>{
        return (Number(cand)*iNorm*iRep).toFixed(1);
      });
    } else {
      splitI = undefined
    }

    if (splitI!==undefined && splitI.length>0) {
      if (splitD.length === splitI.length && splitD.length === 37) {
        splitD[36] = Number(splitD.pop()) + Number(splitI.shift())
        splitD = splitD.concat(splitI)
      } else if (splitD.length > splitI.length) {
        splitD = splitD.slice(0, 37).concat(splitI.slice(1, splitI.length))        
      } else if (splitI.length > splitD.length || (splitD.length === splitI.length && splitD.length === 73)) {
        splitD = splitD.slice(0, 36).concat(splitI.slice(36, splitI.length))
      }
    }

    comb.push(splitD.join(' '))
  }
  return comb.join('\r\n')
}

// function to clean up the block of candela data, removing extra spaces and newlines
function fixLines(arr) {
  if (arr.length !== 5 && arr.length !== 9 && arr.length !== 11 && arr.length !== 16 && arr.length !== 25 && arr.length !== 37 && arr.length!= 73) {
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
// function normalizeAngleQty(arr) {
//   var stretchedArr = [];
//   arr.forEach((elem,ind) => {
//     stretchedArr.push(elem)
//     if (ind !== 2 && (arr.length > 5 ? ind !== 6 : true)) {
//       stretchedArr.push(elem)
//     }
//   })
//   return stretchedArr
// }

function normalizeAngleQty(arr, ref) {
  var stretchedArr = [];
  arr.forEach((elem,ind) => {
    stretchedArr.push(elem)
    if ((ref===9 && ind!==2) || (ref===16 && ind!==0 && ind!==(arr.length===5 ? 4 : 8))) {
      
      stretchedArr.push(elem)
    }
    if (ref===16 && arr.length===5 && ind!==2) {
      console.log("angleQty")
      stretchedArr.push(elem)
      stretchedArr.push(elem)
    }
    if (ref===25 && arr.length===5) {
      stretchedArr.push(elem)
      stretchedArr.push(elem)
      stretchedArr.push(elem)
      stretchedArr.push(elem)
      stretchedArr.push(elem)
    }
  })

  return stretchedArr
}
// function to add the missing candela to remaining candela

function convertAngles(angStr) {
  // console.log(angStr)
  var newAngs = [];
  var angDif = Number(angStr.split(' ').reverse()[0])-Number(angStr.split(' ').reverse()[1])
  console.log(angDif)
  
  angStr.split(' ').reverse().forEach((elem,ind) => {
    if (ind===0) {
      newAngs.push(elem)
    } else {
      newAngs.push(String(Number(newAngs[ind-1])+angDif))
    }
  })
  // console.log(newAngs)
  return newAngs.join(' ')
}