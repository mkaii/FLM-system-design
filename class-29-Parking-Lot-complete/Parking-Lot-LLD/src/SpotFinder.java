public class SpotFinder {

    public ISpot findAvailableSpot(IVehicle vehicle){

        ParkingLot lot = ParkingLot.getInstance();

        for(Floor floor : lot.getFloors()){

            for(ISpot spot : floor.getAllSpots()){
                if(spot.isAvailable() && spot.getSize() == vehicle.getSize()){
                    return spot;
                }
            }
        }

        throw new NoAvailableSpotException("NO spots available");
    }
}
