package org.pjug.vertxpres;

import java.util.Date;

import org.vertx.java.core.AsyncResult;
import org.vertx.java.core.Handler;
import org.vertx.java.core.eventbus.Message;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.platform.Verticle;

public class TestVerticle4 extends Verticle {

  public void start() {

    //               * Construct a config object for the Module we're deploying
    //               |  The configuration manual is located on the website
    //               |  of the module itself. (These are typically github sites)
    //               v
    final JsonObject config = new JsonObject();
    config.putString("db_name", "test");
    config.putString("address", "vertx.mongopersistor");

    //                       * The module is specified by the name found at the
    //                       | main Vert.x Module registry. The module is
    //                       | downloaded at runtime. (the vertx process will
    //                       | actually fetch this module when the verticle
    //                       | hits this async operation.
    //                       v
    container.deployModule("io.vertx~mod-mongo-persistor~2.0.0-beta2", config,
        new Handler<AsyncResult<String>>() {

          @Override
          public void handle(AsyncResult<String> event) {
            if (event.succeeded()) {
              // * Once we're sure the persistor has started, we can do
              // | additional things. In this case we'll just call another
              // | method that saves a single object in MongoDB. It's important
              // | to run this code INSIDE this callback handler. If the module
              // | is not set up when we try to send a message to be persisted
              // | the message will not go anywhere. (Vert.x just eats messages
              // | that are sent to addresses that nothing is listening on.
              // v
              afterDeploySuccess();
            } else {
              container.logger().info(event.result());
            }
          }
        });

  }

  protected void afterDeploySuccess() {
    JsonObject doc = new JsonObject();
    doc.putNumber("RandomNumber", Math.random());
    doc.putString("timestamp", (new Date()).toString());

    JsonObject save = new JsonObject();
    save.putString("action", "save");
    save.putString("collection", "test");
    save.putObject("document", doc);
    vertx.eventBus().send("vertx.mongopersistor", save, new Handler<Message>() {

      @Override
      public void handle(Message event) {
        container.logger().info("Saved: " + event.body());
      }
    });

  }
}