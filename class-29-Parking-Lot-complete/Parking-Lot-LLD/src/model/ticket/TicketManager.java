package model.ticket;

import java.util.ArrayList;
import java.util.List;

public class TicketManager {

    List<Ticket> allTickets = new ArrayList<>();

    public void save(Ticket ticket) {
        allTickets.add(ticket);
    }

    public List<Ticket> getAllTicketHistory() {
        // proxy pattern situation if this method is slow
        return allTickets;
    }
}
