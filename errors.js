/**
 * Created by cool.blue on 23-Sep-16.
 */
'use strict';
const size = 10;
const throwAt = 6;

function root (n) {
  return function(res, rej) {
    setTimeout(res,1000, n)
  }
}

class Iterator {

  next(_) {
    return new Promise(res => {
      if(_ === throwAt) {
        console.log('throwing at ' + _);
        throw new Error('bee'); // abort here and invoke the 'reject' callback of the next 'then'
      } else
      setTimeout(_ => {
        res(_)
      }, 1000, _ - 1)
    })
  }

  previous(_) {
    return this.next(_ + 1)
  }

}

var itr = new Iterator();

function Step (id) {
  return function step(_) {
/*
    if(_ instanceof Error)
      throw _;
*/
/*
    if(_ === throwAt) {
      console.log('throwing at ' + _);
      throw new Error('bee'); // abort here and invoke the 'reject' callback of the next 'then'
    } else
*/
      console.log(id + '\t' + _);
    return itr.next(_)
  }
}

function Reject (id) {
  return function reject (e) {  // there was an error in the previous link in the chain
    console.log('reject at ' + id);

    // throw e; // cause the next 'then' to invoke its 'reject'
    return Step(id)(id);   // skip the error one and resume from this one
    // return e  // return e to the resolve argument of the next then
    // return itr.next(id)  // skip this one also and continue
    // return itr.next(id+1)  // skip this one and resume the next one
    // return itr.previous(id);   // resume the next one but with input expected by this one

  }
}

var p = new Promise(root(size));
var i = size;

do {
  p = p.then(Step(i), Reject(i))
} while (i--);

p.catch(data => console.log('boo!'));