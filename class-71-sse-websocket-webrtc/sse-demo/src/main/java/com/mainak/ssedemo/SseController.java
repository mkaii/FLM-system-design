package com.mainak.ssedemo;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;

@RestController
public class SseController {

    private SseEmitter emitter;   // the one open connection (one customer, to keep it simple)

    // Called by the CUSTOMER's app, once: "keep sending me updates".
    // This reply never ends.
    @GetMapping(value = "/events", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe() {
        emitter = new SseEmitter(0L);   // 0 = stay open forever
        System.out.println("CUSTOMER connected: line is open");
        return emitter;
    }

    // Called by the RIDER's app, every time the rider moves: "here is my new location".
    @PostMapping("/send")
    public String send(@RequestParam String msg) throws IOException {
        if (emitter == null) {
            return "no customer is listening yet: open http://localhost:8080 first";
        }
        emitter.send(msg);   // pushes msg into the customer's open reply
        System.out.println("RIDER sent: " + msg + " -> pushed to the customer");
        return "sent: " + msg;
    }
}
