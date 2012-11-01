// module-test.js
//
// Test the module interface for the jankyqueue
//
// Copyright 2012, StatusNet Inc.
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

var assert = require('assert'),
    vows = require('vows'),
    os = require('os'),
    fs = require('fs'),
    path = require('path');

var suite = vows.describe('jankyqueue module interface');

suite.addBatch({
    'When we require the module': {
        topic: function() {
            return require('../lib/jankyqueue');
        },
        "it works": function(Queue) {
            assert.ok(Queue);
            assert.isFunction(Queue);
        },
        "it has a Queue member for backwards compatibility": function(Queue) {
            assert.ok(Queue);
            assert.ok(Queue.Queue);
        },
        "and we create an instance": {
            topic: function(Queue) {
                return new Queue(10);
            },
            "it works": function(q) {
                assert.ok(q);
                assert.isObject(q);
            },
            "it has an enqueue method": function(q) {
                assert.ok(q);
                assert.isObject(q);
                assert.isFunction(q.enqueue);
            },
            "and we enqueue a bunch of operations": {
                topic: function(q) {
                    var i = 0,
                        counter = 100,
                        callback = this.callback,
                        decr = function(j, cb) {
                            // do something with j
                            process.nextTick(function() {
                                counter--;
                                cb(null);
                            });
                        };

                    for (i = 0; i < 100; i++) {
                        q.enqueue(decr, [i], function(err) {
                            if (counter <= 0) {
                                callback(null);
                            }
                        });
                    }
                },
                "it works": function(err) {
                    assert.ifError(err);
                }
            }
        },
        "and we create a different instance": {
            topic: function(Queue) {
                return new Queue(64); // Much less than ulimit -n (usually)
            },
            "it works": function(q) {
                assert.ok(q);
            },
            "and we enqueue a bunch of file operations": {
                topic: function(q) {
                    var i = 0,
                        max = 1024 * 20, // Much more than ulimit -n
                        counter = max, 
                        callback = this.callback,
                        tmp = os.tmpDir(),
                        fname;

                    for (i = 0; i < max; i++) {
                        (function(fname) {
                            q.enqueue(fs.writeFile, 
                                      [fname, 
                                       "My dog has fleas"],
                                      function(err) {
                                          if (err) {
                                              callback(err);
                                          } else {
                                              q.enqueue(fs.unlink, [fname], function(err) {
                                                  if (err) {
                                                      callback(err);
                                                  } else {
                                                      counter--;
                                                      if (counter <= 0) {
                                                          callback(null);
                                                      }
                                                  }
                                              });
                                          }
                                      });
                        })(path.join(tmp, "jankyqueue-test-"+i+".txt"));
                    }
                },
                "it works": function(err) {
                    assert.ifError(err);
                }
            }
        }
    }
});

suite["export"](module);