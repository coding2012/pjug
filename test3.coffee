vertx = require('vertx');
vertx.createHttpServer().requestHandler((req) ->
    request.response.putHeader("Content-Type", "text/plain")
    request.response.end("Coffee script supported!") 
).listen 8080
