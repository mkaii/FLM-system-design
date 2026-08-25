package facade;

import model.ticket.Ticket;
import model.ticket.TicketManager;
import model.vehicle.IVehicle;
import model.spot.ISpot;
import pricing.IPricingStrategy;
import pricing.PricingStrategyFactory;
import service.SpotFinder;

public class ParkingFacade {

    private final SpotFinder spotFinder;
    private final PricingStrategyFactory pricingStrategyFactory;
    private final TicketManager ticketManager;

    public ParkingFacade(){
        this.ticketManager = new TicketManager();
        this.pricingStrategyFactory = new PricingStrategyFactory();
        this.spotFinder = new SpotFinder();
    }

    public Ticket parkVehicle(IVehicle vehicle){
        ISpot spot = spotFinder.findAvailableSpot(vehicle);
        spot.assign();

        Ticket ticket = new Ticket(vehicle, spot, System.currentTimeMillis());
        ticketManager.save(ticket);

        return ticket;
    }

    public double unPark(Ticket ticket){

        ticket.setExitTime(System.currentTimeMillis());
        IPricingStrategy strategy =pricingStrategyFactory.getPricingStrategy(ticket.getVehicle());
        double fee = strategy.calculateFee(ticket);

        ticket.getSpot().release();
        return fee;
    }
}
