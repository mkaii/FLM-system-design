package com.mainak.websocketdemo;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

// Everyone connected to /chat. A message from one person goes to everyone else.
@Component
public class ChatHandler extends TextWebSocketHandler {

    // all open lines. A thread-safe list: each person's messages run on their own thread
    private List<WebSocketSession> people = new CopyOnWriteArrayList<>();

    // someone opened a line (the customer's browser, or the rider's Postman)
    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        people.add(session);
        System.out.println("CONNECTED: " + people.size() + " people on /chat");
    }

    // someone sent a message on their line: pass it to everyone else
    @Override
    protected void handleTextMessage(WebSocketSession from, TextMessage message) throws IOException {
        System.out.println("RECEIVED: " + message.getPayload());
        for (WebSocketSession person : people) {
            if (person != from) {
                person.sendMessage(message);
            }
        }
    }

    // someone closed their line
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        people.remove(session);
        System.out.println("DISCONNECTED: " + people.size() + " people on /chat");
    }
}
