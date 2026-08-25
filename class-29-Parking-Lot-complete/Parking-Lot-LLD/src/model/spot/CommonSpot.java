package model.spot;

import state.AvailableState;
import state.IState;

public abstract class CommonSpot implements ISpot {


    // def would be available and states would be singleton
    protected IState state = AvailableState.getInstance();

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
