# ES6 Promises

## Re-binding the value returned by resolve in javascript promises
 
 I want all promises in a chain to have access to a common base object, without resorting to globals.
 
 My idea was to create a promise chain where all resolutions are rebound to said common base object.  It's analogous to `return this` in chainable objects.
 
 The [answer here][1] explains why I can't use `bind` to do this and suggests using a closure.  The other way I found was to insert an extra `then`, before returning, that carried out some transformation and then returned the base object.  This creates the `return this` style chaining that I imagined.
 
 
 Both options are [here][2]
 
## Error handling
 ES6 promises have implicit and explicit error handling, both of which result in the promise resolving to the _rejected_ state.
 
### Implicit error handling
 When an error is thrown in the context of a `resolve` or `reject` callback of a _thenable_ (`then` or `catch`), or in the _executor_ context of a `promise`, the _thenable_ or `promise` is immediately resolved to _rejected_, as if it's `reject` function had been called. If any other items are chained via `then` or `catch`, the first _thenable_ encountered that has a `reject` callback will be immediately resolved to _rejected_ and the error will be consumed.  This means that, unless the error is re-thrown by the consumer, the `resolve` function of the next item chained will be called immediately after the consumer is resolved.  If there are no downstream items with `reject` callbacks, or if there are no items downstream, then the error will have no effect and will be un-reported.
```js 
function throwit (m) {
  throw new Error(m);
}

Promise.resolve().then(_ => {           new Promise(() => {                       // 
  console.log('in then');                 console.log('in executor');             //
  throwit('then');                        throwit('then');                        // throw
}).then()                               }).then(_ => console.log('then2'))        // skip, no reject callback
  .catch(e => {                           .catch(e => {                           //
    console.log('in catch' + '\n' + e);     console.log('in catch' + '\n\t' + e); // consume and report error
  });                                     });                                     //
```

 Any unhandled errors in asynchronous functions called from the _thenable_ context will terminate node.
```js
 function throwitAsync (m, cb) {         //
   setTimeout(_ => {                     //
     try {                               //
       throw new Error(m)                // throw
     } catch (e) {                       //
       if(cb)                            // pass error to handler if available
         cb(e);                          //
       else                              //
         throw e;                        // fatal error, will terminate node
     }                                   //
   },0);                                 //
 }                                       //
 
 Promise.resolve().then(_ => {           new Promise(() => {                       //
   console.log('in then');                 console.log('in then');                 //
   throwitAsync('then');                   throwitAsync('then');                   // async throw will exit
 }).then()                               }).then()                                 //
   .catch(e => {                           .catch(e => {                           //
     console.log('in catch' + '\n' + e);     console.log('in catch' + '\n' + e);   // never occurs
   });                                     });                                     //
```
 If the handling needs to be passed back to the _thenable_, then the invocation must be wrapped in a promise.  
 There is no _implicit_ equivalent for the `Promise` version.
 
```js
Promise.resolve().then(_ => {             //
  console.log('in then');                 //
  return new Promise((resolve, reject)=>  // wrap async functions in a promise
    throwitAsync('then', reject));        // and connect via a callback
}).then()                                 // skip because no reject callback
  .catch(e => {                           //
    console.log('in catch' + '\n' + e);   // consume and report the error
  });                                     //
```                                                                               
## Explicit error handling
Instead of throwing an error, the promise can reject by calling the second argument of the _executor_ function.  These patterns are much easier to understand, mainly because they don't rely on invisible magic.  The propagation and consumption behaviour is identical to the implicit case, except that the trigger to resolve to _rejected_, is the user calling the `reject` argument of the _executor_.

```js
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
```
  
   [1]: http://stackoverflow.com/a/39440548/2670182
   [2]: https://github.com/cool-Blue/ES6-promises/blob/master/promises.js