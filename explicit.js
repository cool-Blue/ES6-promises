/**
 * Created by cool.blue on 24-Sep-16.
 */
const fail = true;
function throwit (m) {
  return fail ? new Error(m) : m;
}

function throwitAsync (m, res, rej) {             // just use the provided interface
  setTimeout(_ => {                               //
    try {                                         //
      if(fail)                                    // use fail to try resolved vs rejected
        throw new Error(m);                       //
      else                                        //
        res(m + ' success"')                      // callback with the result if clear
    } catch (e) {                                 //
      if(rej)                                     //
        rej(e);                                   // callback with the error if not clear
      else                                        //
        throw e;                                  //
    }                                             //
  },0);                                           //
}                                                 //

console.log('\nsync throw');
new Promise((resolve, reject) => {                //
  console.log('in executor');                     //
  var result = throwit('then');                   // the async function must handle
  if(result instanceof Error)                     // and return the error
    reject(result);                               // The executor then triggers rejected
  else                                            //
    resolve(result)                               //
}).then(_ => console.log('then2'))                //
  .catch(e => {                                   //
    console.log('in catch' + '\n\t' + e);         //
  });                                             //

console.log('\nun-handled, async throw');
new Promise((resolve, reject) => {                //
  console.log('in then');                         // In this case it's very obvious that
  throwitAsync('then');                           // its an error...
}).then()                                         //
  .catch(e => {                                   //
    console.log('in catch' + '\n' + e);           //
  });                                             //

console.log('\nhandled, async throw');
new Promise((resolve, reject) => {                // This pattern is very easy to follow
  console.log('in then');                         // The async function handles the error
  throwitAsync('then', resolve, reject);          // and connects to the chain via the executor args
})                                                //
  .catch(e => {                                   //
    console.log('in catch' + '\n' + e);           //
  });                                             //
