package machine.state;

import machine.VendingMachine;

public class IdleState implements IMachineState{
    @Override
    public void selectSlot(VendingMachine machine, String slotId) {

    }

    @Override
    public void insertPayment(VendingMachine machine, double amount) {

    }

    @Override
    public void cancel(VendingMachine machine) {

    }
}
