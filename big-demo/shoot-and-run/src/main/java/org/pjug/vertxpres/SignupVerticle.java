package org.pjug.vertxpres;

import org.vertx.java.core.Handler;
import org.vertx.java.core.eventbus.Message;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.platform.Verticle;

public class SignupVerticle extends Verticle {

  public void start() {

    vertx.eventBus().registerHandler("signup",
        new Handler<Message<JsonObject>>() {
          @Override
          public void handle(Message<JsonObject> event) {
            signup(event);
          }
        });
  }

  private void signup(Message<JsonObject> event) {
    final int code = ((int) (Math.random() * 10000000)) + 10000000;
    // Save the username and code in mongo
    final String email = event.body().getString("email");
    ensureCodeSaved(email, code);

    // Email the user a code
    JsonObject message = new JsonObject();
    message.putString("from", "nobody@ravacado.com");
    message.putString("to", email);
    message.putString("subject", "your passcode");
    message.putString("body", "Your code is " + code);
    vertx.eventBus().send("sendemail", message);

    // Send a simple reply
    final JsonObject reply = new JsonObject();
    reply.putBoolean("ok", true);
    event.reply(reply);
  }

  private String ensureCodeSaved(final String email, final int code) {

    /**
     * { "action": "update", "collection": <collection>, "criteria": {
     * <criteria> }, "objNew" : { <objNew> }, upsert : <upsert> multi: <multi> }
     */

    JsonObject saveCode = new JsonObject();
    saveCode.putString("action", "update");
    saveCode.putString("collection", "users");
    saveCode.putBoolean("upsert", true);
    saveCode.putBoolean("multi", false);

    JsonObject criteria = new JsonObject();
    criteria.putString("username", email);
    saveCode.putObject("criteria", criteria);

    JsonObject user = new JsonObject();
    user.putString("username", email);
    user.putString("password", "" + code);
    saveCode.putObject("objNew", user);
    
    vertx.eventBus().send("vertx.mongopersistor", saveCode);

    return email;
  }
}
