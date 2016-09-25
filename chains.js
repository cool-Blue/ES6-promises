/**
 * Created by cool.blue on 18-Sep-16.
 * Proof of concept for dynamic write queue with error handling
 */
'use strict';
const insp = _ => require('util').inspect(_, {colors: true});
var t = 500;
var failAt = 3;

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
function f(x, write, cb) {
	const timeOut = 2000;
	return new Promise((res, rej) => {
		var dog = setTimeout(rej.bind(null, new Error(`write timeout ${x}`)), timeOut);
		if(!fail(x))
			setTimeout(_ => {
				clearTimeout(dog);
				write(x, null, res)
			}, t)
	})
		.then(_ => {                          // followed by a synchronous write
			cb(_ + 1)
		});

}

console.log('start');

var complete = [];

var Queue = (function () {
	var _m = [];
	/**
	 * @class Queue
	 * @param skip
	 */
	return class extends require('events') {
		/**
		 * @constructor
		 * @param skip - skip errors if truthy
		 */
		constructor(skip) {
			super();
			this.skipErrors = skip;
			this.thrown = false;
		}

		/**
		 * record a reference to the next queue member
		 * @public
		 * @param _
		 * @returns {Number}
		 */
		push(_) {
			return _m.push(_);
		}

		/**
		 * consume the oldest queue member
		 * @public
		 * @emits drain
		 * @returns {*}
		 */
		pop() {
			var r = _m.shift();
			if(!_m.length)
				process.nextTick(() => this.emit('drain'));
			return r
		}
    throwErr (e) {
      this.thrown = true;
      process.nextTick(() => this.emit('xerror', e, _m));
    }
	}
})();

var qs = new Queue();
qs.on('drain', () => {
		console.log('all done');
		complete.forEach((_, i) => {
			process.stdout.write(`${insp(_)}\t${i}\n`)
		})
})
	.on('xerror', function (e, m) {
		console.log('onError');
		this.skip = false;
});


[1,2,3,4,5]
	.reduce(
		/**
		 * build a chain of promises to perform sequential writes
		 * if the promise is fulfilled, follow with a sync write
		 * if the promise is rejected, propagate or handle a timeout error
		 */
		(q, n) => {

			function cb(_) {
				process.stdout.write('\tcb ' + n + '\n');
				return _
			}

			qs.push({cb: cb, x: n});                  // record the queue state to detect drain event
			return q.then(() => {
				return f(n, write, cb);                 // return a promise that can resolve or reject
			})
				.then(                                  // perform follow-up, sync write
					_ => complete.push(qs.pop()),
					e => {                                // or handle errors
						qs.pop();
						if(qs.skipErrors)                   // continue or terminate depending on class state
							return console.error(e.stack);    // log and continue
						if(!qs.thrown) {                    // throw out of node
							qs.throwErr(e);                   // allow consumer to react to errors
							process.nextTick(_ => {throw e}); // async throw will not be handled in node
						}                                   // execution will continue in browser so,
						throw e;                            // propagate rejection in browser
					}
				);

		}, Promise.resolve(0));