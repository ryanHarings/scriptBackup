const fs = require('fs');
const Path = require('path');

const prepend = "./ppsiTesting/";
const measure = {}
const tests = {}

function parseFiles() {
  fs.readdir('./ppsiTesting', (err, entries) => { 
    var measureProps = [];
    // pulls data from files and sets as above ojects
    entries.forEach(test => {
      if (test.split('.')[test.split.length-1]==="csv") {
        if (test.split('.')[0]==='measure') {
          const measureLines = fs.readFileSync(prepend + test, 'utf8').split(/\r?\n/);
          measureLines.forEach((mLine,lIndex) => {
            mLine.split(',').forEach((td,aIndex)=>{
              if (lIndex===0) {
                if (td!=='' && td!==null) {
                  measureProps.push(td);
                  measure[td]=[];
                } 
              }
            }) 
            for (let i=0; i<measureProps.length; i++) {
              if (mLine.split(',')[i]!=='' && lIndex!==0) {
                measure[measureProps[i]].push(mLine.split(',')[i].replace(/\"/,''))
              }
            }
          })
        } else {
          tests[test.split('.')[0]] = fs.readFileSync(prepend + test, 'utf8').split(/\r?\n/);
        }
      }
    })
  })
};

parseFiles()

setTimeout(analyzeData, 3000)

function analyzeData() {

  Object.keys(tests).forEach(test=> {
    const output = {
      mom: {
        list: []
      },
      dad: {
        list: []
      }
    };

    var filename = test;
    var answers = tests[test];

    Object.keys(measure).forEach(meas=> {
      tempMeas=meas
      measure[meas].forEach(key=> {
        var code = 't'
        var numb = key.split('-')[0]
        if (numb.includes('*')) {
          code = 'f'
          numb = Number(numb.replace('*', ''))
        } else {
          numb = Number(numb)
        }
        if (isNaN(parseInt(numb))===false) {
          if (answers[numb-1].split(',')[0] === code) {
            if (!output.mom.list.includes(meas) && meas !== 'Dependent Father') {
              output.mom.list.push(meas)
            }
            if (!Object.keys(output.mom).includes(meas)) {
              output.mom[meas] = []
            }
            output.mom[meas].push(key)
          }
          if (answers[numb-1].split(',')[1] === code) {
            if (!output.dad.list.includes(meas)&& meas !== 'Dependent Mother') {
              output.dad.list.push(meas)
            }
            if (!Object.keys(output.dad).includes(meas)) {
              output.dad[meas] = []
            }
            output.dad[meas].push(key)
          }
        }
      })
    })
    var momBody = '';
    Object.keys(output.mom).forEach(mill=> {
      if (mill !== 'list' && mill!== 'Dependent Father') {
      momBody += '\n' + mill + ': ' + output.mom[mill].length + '/' + measure[mill].length + ' -- ' + output.mom[mill] + '\n'

      }
    })
    var dadBody = '';
    Object.keys(output.dad).forEach(dill=> {
      if (dill !== 'list' && dill !== 'Dependent Mother') {
      dadBody += '\n' + dill + ': ' + output.dad[dill].length + '/' + measure[dill].length + ' -- ' + output.dad[dill] + '\n'

      }
    })
    var text = 'Mom:\n' +
                '________________________' +
                '\n' +
                '\n' +
                output.mom.list + '\n' +
                '________________________' +
                '\n' +
                momBody +
                '\n' +
                '************************************' + '\n' +
                '************************************' + '\n' +
                '\n' +
                'Dad:\n' +
                '________________________' +
                '\n' +
                '\n' +
                output.dad.list + '\n' +
                '________________________' +
                '\n' +
                dadBody

    var outputDir = prepend + 'output';
    if (!fs.existsSync(outputDir)){
      fs.mkdirSync(outputDir);
    }
    fs.writeFile(outputDir + '/' + filename + '.txt', text);
  })
}

