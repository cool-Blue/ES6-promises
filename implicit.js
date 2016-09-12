/**
 * Created by cool.blue on 24-Sep-16.
 */
function throwit (m) {
  throw new Error(m);
}

function throwitAsync (m, cb) {                  //
  setTimeout(_ => {                              //
    try {                                        //
      throw new Error(m)                         // throw
    } catch (e) {                                //
      if(cb)                                     // pass error to handler if available
        cb(e);                                   //
      else                                       //
        throw e;                                 // fatal error will terminate node
    }                                            //
  },0);                                          //
}                                                //


Promise.resolve().then(_ => {                     //
  console.log('in then');                         //
  throw new Error('then');                        // throw
}).then(_ => console.log('then2'))                // skip because no reject callback
  .catch(e => {                                   //
    console.log('in catch' + '\n' + e);           // consume and report the error
  });                                             //

Promise.resolve().then(_ => {                     //
  console.log('in then');                         //
  throwitAsync('then');                           // async throw will exit node
}).then()                                         //
  .catch(e => {                                   //
    console.log('in catch' + '\n' + e);           // error handling never occurs
  });                                             //

Promise.resolve().then(_ => {                     //
  console.log('in then');                         //
  return new Promise((resolve, reject)=>          // wrap async functions in a promise
    throwitAsync('then', reject));                // and connect to the chain via a callback
}).then()                                         // skip because no reject callback
  .catch(e => {                                   //
    console.log('in catch' + '\n' + e);           // consume and report the error
  });                                             //


console.log('\nsync throw');
new Promise(() => {
  console.log('in executor');
  throwit('then');
}).then(_ => console.log('then2'))
  .catch(e => {
    console.log('in catch' + '\n\t' + e);
  });

console.log('\nun-handled, async throw');
new Promise(() => {
  console.log('in then');
  throwitAsync('then');
}).then()
  .catch(e => {
    console.log('in catch' + '\n' + e);
  });

console.log('\nhandled, async throw');
new Promise((resolve, reject) => {
  console.log('in then');
  new Promise((resolve)=>
    throwitAsync('then', reject))
}).then()
  .catch(e => {
    console.log('in catch' + '\n' + e);
  });
