/**
 * Created by cool.blue on 11-Sep-16.
 */
var throw_dont = '0';  // enter 1..3 to throw
var error_or_n = (x, y) => {
  if(throw_dont && y == throw_dont)
    throw(new Error('in ' + x + y));
  else
    return y
};

/**
 *  arbitrary function that returns a promise
 * */
var pp = (o, n) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, 0, `${o.p1}-> ${o.n}${error_or_n(o.n, n)}`)
  })
};

/**
 * Method 1 :: +1
 * insert an extra 'then' before returning
 * */
var q = new Promise(function(resolve, reject) {
  var o = {n: 'q'};
  o.p1 = 'q' + error_or_n('q', '1');
  resolve(o)
})
  .then(o => {
    console.log(o.p1);
    return pp(o, 2).then(_ => {
        o.p1 = _;
        return o
      });
  })
  .then((o) => {
    console.log(o.p1);
    return pp(o, 3).then(_ => {
        o.p1 = _ + '|';
        return o
      });
  })
  .then(o => {
    console.log(o.p1);
    return o
  })
  .catch(e => console.log(e));

/**
 * Method 2 :: +1
 * use closures
 *
 * */
var t = new Promise(function(resolve, reject) {
  var o = {n: 't'};
  o.p1 = 't' + error_or_n('t', '1');
  resolve(o)
})
  .then(o => {
    console.log(o.p1);
    return pp(o, 2)
      .then(_ => {
        o.p1 = _;
        console.log(o.p1);
        return pp(o, 3)
      })
      .then(_ => {
        o.p1 = _ + "|";
        console.log(o.p1);
        return o
      })
  })
  .catch(e => console.log(e));


/**
 * Method 1a :: +1
 * insert an extra 'then' before returning
 * with helper functions
 * */
var step1 = o => {
  console.log(o.p1);
  return pp(o, 2).then(_ => {
    o.p1 = _;
    return o
  });
}
var r = new Promise(function(resolve, reject) {
  var o = {n: 'r'};
  o.p1 = 'r' + error_or_n('r', '1');
  resolve(o)
})
  .then(o => {
    console.log(o.p1);
    return pp(o, 2).then(_ => {
      o.p1 = _;
      return o
    });
  })
  .then((o) => {
    console.log(o.p1);
    return pp(o, 3).then(_ => {
      o.p1 = _ + '|';
      return o
    });
  })
  .then(o => {
    console.log(o.p1);
    return o
  })
  .catch(e => console.log(e));

Promise.all([q, t, r]).then(_ => {
  if(_.every(_ => _)) {
    console.log('all done...');
    console.dir(_)
  }
});
Promise.race([q, t, r]).then(_ => {
  if(_) {
    console.log('1\'st done...');
    console.dir(_)
  }
});

/**
 * check if then can accept a raw promise
 * */

console.log('check if then can accept a raw promise');
Promise.resolve()
  .then(Promise.resolve('yes it can'))
  .then(_ => console.log(_ || 'nope'))
  .catch(_ => console.log('maybe not...' + _));