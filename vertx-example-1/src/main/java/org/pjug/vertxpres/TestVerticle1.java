package org.pjug.vertxpres;

import org.vertx.java.platform.Verticle;
//            * A Java class can be run from the command line
//            | vertx run org/pjug/vertxpres/TestVerticle1.java
//            | (Compilation will happen in vertx)
//            v 
public class TestVerticle1 extends Verticle {

    public void start() {
        getContainer().logger().info("Test Verticle Started!");
    }
}