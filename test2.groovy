vertx.createHttpServer().requestHandler{ request ->
    println "A request has arrived on the server!"
    request.response.putHeader("Content-Type", "text/plain")
    request.response.end("What!") 
}.listen(8080)

