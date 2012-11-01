jankyqueue
----------

This is a complete knuckle-dragger remedial queue class. I use
[step](https://npmjs.org/package/step) to organize async stuff, and it
doesn't have queueing built in. So I made this and I use it and now
I'm sharing it with you and if you don't like it you can go use
something else.

Licence
=======

Copyright 2012, E14N Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

> http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Overview
========

You can get to the Queue class by requiring jankyqueue.

    var Queue = require("jankyqueue");

You can make a new queue like this:

    var q = new Queue(10);
    
This makes a queue which can have 10 things going at the same time. To
do something, use the `enqueue` method.

    // an async function
    
    var myfunc = function(param1, param2, callback) {
        process.nextTick(function() {
            callback(null, param1 + param2);
        });
    };

    var arg1 = 23,
        arg2 = 42;
        
    q.enqueue(myfunc, [arg1, arg2], function(err, result) {
        if (err) {
            console.error(err);
        } else {
            console.log(result);
        }
    });

API
===

* `new Queue(len)`

  Makes a new queue with length `len`. No more than `len` operations
  will run at the same time.
  
* `enqueue(fn, args, callback)`

  Enqueues an operation -- calling function `fn` on the array of
  arguments `args`, and returning the results to `callback`.

  If there aren't other operations running, it will run immediately;
  if there are, it will wait until another one is done.
