package org.pjug.vertxpres

import org.vertx.groovy.core.http.HttpServerRequest;
import org.vertx.groovy.platform.Verticle
import org.vertx.java.core.json.JsonObject;

class ShootAndRun extends Verticle {

  def start() {
    container.logger.info("Starting Shoot and Run!");
    container.deployModule("io.vertx~mod-mongo-persistor~2.0.0-beta2", [
      db_name: "GameDB"
    ], {
      container.deployModule("io.vertx~mod-auth-mgr~2.0.0-beta2", [
        user_collection: "users"
      ]);
    });
    container.deployModule("io.vertx~mod-mailer~2.0.0-beta2", [
      "address": "sendemail"
    ]);

    def server = vertx.createHttpServer();
    server.requestHandler {
      HttpServerRequest req ->
      def file = req.uri == "/" ? "index.html" : req.uri
      req.response.sendFile "webroot/$file"
    };
    // This defines the matches for client --> server traffic
    setupBridge(server);
    // A Java verticle for game signup
    container.deployVerticle("org.pjug.vertxpres.SignupVerticle");
    // A Javascript verticle representing the actions of the game.
    container.deployVerticle("game_server.js");
  }

  private setupBridge(org.vertx.groovy.core.http.HttpServer server) {
    def inboundPermitted = []
    inboundPermitted << ["address": "signup"]
    inboundPermitted << ["address": "vertx.basicauthmanager.login"]
    inboundPermitted << [
      "address": "game",
      "requires_auth": true
    ]

    def outboundPermitted = [];
    outboundPermitted << [
      "address": "game.updates",
      "requires_auth": true
    ]

    vertx.createSockJSServer(server).bridge(
    ["prefix": "/eventbus"], inboundPermitted, outboundPermitted)
    server.listen(8080)
  }
}
