package org.pjug.vertxpres;

import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.platform.Verticle;

public class TestVerticle5 extends Verticle {

  public void start() {
    vertx.createHttpServer().requestHandler(new Handler<HttpServerRequest>() {

      @Override
      public void handle(HttpServerRequest request) {
        final String file = request.path().equals("/") ? "index.html" : request
            .path();
        request.response().sendFile("webroot/" + file);
      }
    }).listen(8080);
  }
}