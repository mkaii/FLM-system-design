public class OccupiedState implements IState {

    private static final OccupiedState singleton = new OccupiedState();

    private OccupiedState(){

    }

    static OccupiedState getInstance(){
        return singleton;
    }

    @Override
    public void assign(ISpot spot) {
        System.out.println("cannot assigned occupied spot");
    }

    @Override
    public void release(ISpot spot) {
        spot.setState(AvailableState.getInstance());
    }
}
