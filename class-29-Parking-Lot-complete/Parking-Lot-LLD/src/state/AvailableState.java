package state;

import model.spot.ISpot;

public class AvailableState implements IState {

    private static final AvailableState singleton = new AvailableState();

    private AvailableState(){

    }

    public static AvailableState getInstance(){
        return singleton;
    }

    @Override
    public void assign(ISpot spot) {
        System.out.println("Assigned available spot");
        spot.setState(OccupiedState.getInstance());
    }

    @Override
    public void release(ISpot spot) {
        System.out.println("cant release , is already available");
    }
}
