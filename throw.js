/**
 * Created by cool.blue on 23-Sep-16.
 */
'use strict';
const insp = require('util').inspect;

const size = 5;
const throwAt = 3;

var template = [];
for(let i = 0; i < size; i++) template.push(i)
var cmds = template.map((_, i) => ({cmd: `cmd ${_}`, args: [`arg1-${i}`, `arg2-${i}`]}));
var queue = [];

// promise factory - handle errors with reject(e)
function makePromise (command, args) {
  return (retry) => new Promise((resolve, reject) => {
    setTimeout(_ => {
      if(command.indexOf(throwAt) > 0 && !retry) {
        return makePromise('retry:' + command, args)(true)
          .then(_ => resolve(), e => reject(e));
      }
      console.log(`${command}\t${insp(args)}`);
      resolve()
    }, Math.random() * 1000)
  })
}
// promise factory - handle errors with throw
function makePromise2 (command, args) {
  return (retry) => new Promise((resolve, reject) => {
    if(retry){
      console.log(`throw at ${command}`);
      throw new Error(`sorry, tried twice!`);
    }
    setTimeout(_ => {   // fake async command
      if(command.indexOf(throwAt) > 0) {
/*
        if(retry)   // throwing hear will not be handled
          throw new Error(`sorry, tried my best!`);
*/
        return makePromise2(command, args)(true)
          .then(resolve, reject);  // without this it will fail silently
      }
      console.log(`${command}\t${insp(args)}`);
      resolve();
    }, Math.random() * 1000)
  })
}

function Reject (cmd) {
  return function reject (e) {
  console.log(`re-throw at ${cmd.cmd}`);
  throw e;  // if you have a reject callback then you must propagate the error
}}

// populate the queue
cmds.forEach(c => queue.push(makePromise2(c.cmd, c.args)));
// then execute it and catch all errors
// the Reject gives the opportunity to manage the error cascade
queue.reduce((q, p, i) => q.then(p, Reject(cmds[i])), Promise.resolve())
  .catch(e => console.log(`catch...\n${e.stack}`));


