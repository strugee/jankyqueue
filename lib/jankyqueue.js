// jankyqueue.js
//
// A janky in-process queue
//
// Copyright 2012, E14N https://e14n.com/
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// I searched npm for in-process queues; got too many results; so I added
// to the problem.

var Queue = function(max) {

    var q = this,
        add,
        run,
        waiting = [],
        running = 0;

    // Private methods

    add = function(fn, args, callback) {
        waiting.push([fn, args, callback]);
    };

    run = function(fn, args, callback) {
        var wrapped = function() {
            var results = arguments,
                next;
            running--;
            if ((running < q.max) && waiting.length > 0) {
                next = waiting.shift();
                run(next[0], next[1], next[2]);
            }
            callback.apply(null, results);
        },
            all = (args) ? args.concat([wrapped]) : [wrapped];

        running++;

        process.nextTick(function() {
            fn.apply(null, all);
        });
    };

    // Privileged methods

    q.enqueue = function(fn, args, callback) {
        if (running < q.max) {
            run(fn, args, callback);
        } else {
            add(fn, args, callback);
        }
    };

    q.max = max;
};

module.exports = Queue;
module.exports.Queue = Queue;
