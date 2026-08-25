package pricing;

import model.ticket.Ticket;

public interface IPricingStrategy {

    double calculateFee(Ticket ticket);
}
