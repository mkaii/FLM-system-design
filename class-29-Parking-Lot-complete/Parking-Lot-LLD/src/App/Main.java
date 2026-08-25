import exception.NoAvailableSpotException;
import facade.ParkingFacade;
import factory.SpotFactory;
import model.parking.Floor;
import model.parking.ParkingLot;
import model.spot.CompactSpot;
import model.spot.SpotSize;
import model.ticket.Ticket;
import model.vehicle.FourWheeler;
import model.vehicle.HeavyFourWheeler;
import model.vehicle.IVehicle;
import model.vehicle.TwoWheeler;

//TIP To <b>Run</b> code, press <shortcut actionId="Run"/> or
// click the <icon src="AllIcons.Actions.Execute"/> icon in the gutter.
void main() {


    SpotFactory spotFactory = new SpotFactory();

    Floor groundFloor = new Floor("Ground model.parking.Floor");
    groundFloor.addSpot(spotFactory.getSpot(SpotSize.COMPACT));
    groundFloor.addSpot(spotFactory.getSpot(SpotSize.COMPACT));
    groundFloor.addSpot(spotFactory.getSpot(SpotSize.LARGE));
    groundFloor.addSpot(spotFactory.getSpot(SpotSize.HEAVY));

    ParkingLot.getInstance().addFloor(groundFloor);

    System.out.println("Available spots at start: " + ParkingLot.getInstance().availableSpots());

    ParkingFacade facade = new ParkingFacade();

    IVehicle car = new FourWheeler();
    Ticket carTicket = facade.parkVehicle(car);
    System.out.println("Parked car. Available spots now: " + ParkingLot.getInstance().availableSpots());

    double carFee = facade.unPark(carTicket);
    System.out.println("Car fee charged (HourlyCarPricing): " + carFee);
    System.out.println("Available spots after car exits: " + ParkingLot.getInstance().availableSpots());

    IVehicle bike = new TwoWheeler();
    Ticket bikeTicket = facade.parkVehicle(bike);
    double bikeFee = facade.unPark(bikeTicket);
    System.out.println("Bike fee charged (HourlyBikePricing): " + bikeFee);

    IVehicle heavyTruck1 = new HeavyFourWheeler();
    IVehicle heavyTruck2 = new HeavyFourWheeler();
    facade.parkVehicle(heavyTruck1);

    try {
        facade.parkVehicle(heavyTruck2);
    } catch (NoAvailableSpotException e) {
        System.out.println("Expected failure: " + e.getMessage());
    }

    CompactSpot s = new CompactSpot();
}
