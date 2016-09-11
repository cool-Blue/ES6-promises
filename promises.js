/**
 * Created by cool.blue on 11-Sep-16.
 */
var throw_not = '0';
var error_or_n = (x, y) => {
  if(throw_not && y === throw_not)
    throw(new Error('error ' + x + y));
  else
    return y
};

/**
 *  arbitrary function that returns a promise
 * */
var pp = (_, $) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, 0, _ + $)
  })
};

/**
 * Method 1
 * promise o decorated with the resolved value of p
 * p promises a value that is set on property a of o
 * which is the resolved value of the returned promise
 * */
var po = (o, p, a) => {
  return new Promise((resolve, reject) => {
      p.then( $ => setTimeout(_ => {
        if (typeof a !== 'undefined')
          o[a] = $;
        resolve(o)
      }, 0))
    }, 0)
};

var p1 = new Promise(function(resolve, reject) {
  var o = {};
  o.p1 = 'p' + error_or_n('p', '1');
  resolve(o)
})
  .then(o => {
    console.log(o.p1);
    return po(o, pp(o.p1, '-> p' + error_or_n('p', '2')), 'p1')
  })
  .then((o) => {
    console.log(o.p1);
    return po(o, pp(o.p1, '-> p' + error_or_n('p', '3')), 'p1')
  })
  .then(o => {
    console.log(o.p1);
  })
  .catch(e => console.log(e));

/**
 * Method 2
 * using vanilla promise structures
 * */
var p2 = new Promise(function(resolve, reject) {
  var o = {};
  o.p1 = 'q' + error_or_n('q', '1');
  resolve(o)
})
  .then(o => {
    console.log(o.p1);
    return pp(o.p1, '-> q' + error_or_n('q', '2'))
      .then( _ => Promise
        .resolve((o.p1 = _ , o)));
  })
  .then((o) => {
    console.log(o.p1);
    return pp(o.p1, '-> q' + error_or_n('q', '3'))
      .then( _ => Promise
        .resolve((o.p1 = _ + '|', o)));  // shorter, but maybe dirty?
  })
  .then(o => {
    console.log(o.p1);
  })
  .catch(e => console.log(e));

/**
 * Method 3
 * abstract the transformation on the promised value
 * */

/**
 * arbitrary transform on a promised value promising an
 * arbitrary value
 * */
var psify = (cb, o) => {
  return  _ => Promise.resolve((cb(_), o))
};

var p3 = new Promise(function(resolve, reject) {
  var o = {};
  o.p1 = 'r' + error_or_n('r', '1');
  resolve(o)
})
  .then(o => {
    console.log(o.p1);
    return pp(o.p1, '-> r' + error_or_n('r', '2'))
      .then(psify(_ => o.p1 = _, o))
  })
  .then(o => {
    console.log(o.p1);
    return pp(o.p1, '-> r' + error_or_n('r', '3'))
      .then(psify(_ => o.p1 = _ + '|', o))
  })
  .then(o => {
    console.log(o.p1);
  })
  .catch(e => console.log(e));

/**
 * Method 4
 * transform a promise to 'then' with an arbitrary signature
 * */
function thenify (p) {
  return {
    then: function(cb, o) { //<-- arbitrary signature
      return p.then(_ => {  //<-- resolve signature
        return Promise.resolve((cb(_), o))})
    }
  };
}

var p4 = new Promise(function(resolve, reject) {
  var o = {};
  o.p1 = 's' + error_or_n('s', '1');
  resolve(o)
})
  .then(o => {
    console.log(o.p1);
    return thenify(pp(o.p1, '-> s' + error_or_n('s', '2')))
      .then(_ => o.p1 = _, o)
  })
  .then(o => {
    console.log(o.p1);
    return thenify(pp(o.p1, '-> s' + error_or_n('s', '3')))
      .then(_ => o.p1 = _ + '|', o)
  })
  .then(o => {
    console.log(o.p1);
  })
  .catch(e => console.log(e));

console.log('done');