package model.parking;

import java.util.ArrayList;
import java.util.List;

public class ParkingLot implements IArea {

    private static ParkingLot singleton;

    private final List<Floor> floors;

    private ParkingLot(){
        floors = new ArrayList<>();
    }

    public static ParkingLot getInstance(){
        if(singleton == null){
            singleton = new ParkingLot();
        }
        return singleton;
    }

    public void addFloor(Floor floor){
        floors.add(floor);
    }


    public List<Floor> getFloors(){
        return floors;
    }


    @Override
    public int availableSpots() {
        int total = 0;
        for(Floor floor : floors){
            total += floor.availableSpots();
        }
        return total;
    }
}
