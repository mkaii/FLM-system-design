package state;

import model.spot.ISpot;

public interface IState {

    void assign(ISpot spot);

    void release(ISpot spot);
}
