/**
 * Created by cool.blue on 18-Sep-16.
 * Proof of concept for dynamic write queue with error handling
 */
'use strict';
const insp = _ => require('util').inspect(_, {colors: true});
var t = 500;
var failAt = 5;

function fail (x) {
  return x === failAt;
}
/**
 * proxy for stdout.write that includes an iterator
 * @param x
 * @param enc {string}
 * @param cb {function}
 */
function write (x, enc, cb) {
  process.stdout.write('write: ' + x);
  cb(x - 1);
}
/**
 * promise to write with timeout error handler
 * @param x
 * @param write
 * @returns {Promise}
 */
function f(x, write) {
  const timeOut = 2000;
  return new Promise((res, rej) => {
    var dog = setTimeout(rej.bind(null, new Error(`write timeout ${x}`)), timeOut);
    if(!fail(x))
      setTimeout(_ => {
        clearTimeout(dog);
        write(x, null, res)
      }, t)
  })

}

console.log('start');

var q = Promise.resolve(0);
var complete = [];

var Queue = (function () {
  var _m = [];
  /**
   * @class Queue
   * @param skip - skip errors if truthy
   */
  return class extends require('events') {
    constructor (skip) {
      super();
      this.skipErrors = skip;
  }
    push (_) {
      return _m.push(_);
    }
    pop () {
      var r = _m.shift();
      if(!_m.length)
        process.nextTick(() => this.emit('drain'));
      return r
    }
  }
})();

var qs = new Queue('skip');
qs.on('drain', () => {
    console.log('all done');
    complete.forEach((_, i) => {
      process.stdout.write(`${insp(_)}\t${i}\n`)
    })
});

[1,2,3,4,5,6,7,8,9,10]
  .forEach(
    /**
     * build a chain of promises to perform sequential writes
     * if the promise is fulfilled, follow with a sync write
     * if the promise is rejected, propagate or handle a timeout error
     */
    (n) => {

      function cb (_) {
        process.stdout.write('\tcb ' + n + '\n');
        return _
      }

      q = q.then(() => {
        return f(n, write)                    // return a promise to write that can resolve or reject
          .then(_ => {                        // followed by a synchronous write
            cb(_ + 1)
          });
      })
        .then(                                // perform follow-up, sync write
          _ => complete.push(qs.pop()),
          e => {                              // or handle errors
            qs.pop();
            if(qs.skipErrors)                 // continue or terminate depending on class state
              return console.error(e.stack);
            process.nextTick(_ => {throw e}); // async throw will not be handled
          }
        );
      qs.push({cb: cb, x: n});                // record the queue state to detect drain event

    });