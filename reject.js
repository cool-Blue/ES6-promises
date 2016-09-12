/**
 * Created by cool.blue on 23-Sep-16.
 */
'use strict';
const insp = require('util').inspect;

const size = 5;
const throwAt = 1;
const fail = false;

var template = [];
for(let i = 0; i < size; i++) template.push(i)
var cmds = template.map((_, i) => ({cmd: `cmd ${_}`, args: [`arg1-${i}`, `arg2-${i}`]}));

// resolve factory - handle errors with reject(e)
function Resolve (command, args) {
  var attempt = 0;
  return (function _Resolve(command, args) {
    return (retry) => new Promise((resolve, reject) => {
      if(retry && fail)
        reject(new Error(`${command} failed on second attempt!`));
      setTimeout(_ => {   // fake async command
        if(command.indexOf(throwAt) > 0 && !retry) {
          ++attempt;
          return _Resolve(command, args)(true)
            .then(_ => resolve(), e => reject(e));
        }
        console.log(`${command}\t${insp(args)} ${++attempt}`);
        resolve()
      }, Math.random() * 1000)
    })
  })(command, args)
}

function Reject (cmd) {
  return function reject(e) {
    console.log(`re-throw at ${cmd.cmd}`);
    throw e;  // if you have a reject callback then you must propagate the error
  }
}

// populate the queue
// then execute it and catch all errors
// the Reject gives the opportunity to manage the error cascade
// remove Reject if you want to abort to the catch on error
cmds.reduce((q, c) => q.then(Resolve(c.cmd, c.args), Reject(c)), Promise.resolve())
  .catch(e => console.log(`catch...\n${e.stack}`));

