def server = vertx.createHttpServer();

server.requestHandler { req ->
  def file = req.uri == "/" ? "index.html" : req.uri
  req.response.sendFile "webroot/$file"
};

def inboundPermitted = []
def outboundPermitted = []

vertx.createSockJSServer(server).bridge(
["prefix": "/eventbus"], inboundPermitted, outboundPermitted)
server.listen(8080)

