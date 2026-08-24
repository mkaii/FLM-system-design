public class HeavySpot implements ISpot {

    // def would be available and states would be singleton
    private IState state = AvailableState.getInstance();


    @Override
    public SpotSize getSize() {
        return SpotSize.HEAVY;
    }

    @Override
    public void setState(IState state) {
        this.state = state;
    }

    @Override
    public boolean isAvailable() {
        return state == AvailableState.getInstance();
    }

    @Override
    public void release() {
        state.release(this);
    }

    @Override
    public void assign() {
        state.assign(this);
    }
}
