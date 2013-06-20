//   * 'vertx' variable in all vert.x supported languages universally
//   | represents the vertx "core API". From there all the cool servers
//   | and features can be accessed.
//   |       * Each supported language comes with a language module "shim"
//   |       | to make vertx programs fit well with the idioms of the language
//   |       | Here we see require() as is typical in Node.js or any "CommonJS"
//   |       | environment
//   v       v
var vertx = require('vertx');
var console = require('vertx/console');

// We see the API is often chained. This is typical in environments
// that support async features
vertx.createNetServer().connectHandler(function(sock) {
    console.log("We have a connection");
    sock.dataHandler(function(buffer) {
        console.log('RCV: ' + buffer);
        sock.write('THX! for ' + buffer);
    });
}).listen(8080);
