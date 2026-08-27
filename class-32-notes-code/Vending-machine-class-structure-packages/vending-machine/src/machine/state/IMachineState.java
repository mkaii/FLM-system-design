package machine.state;

import machine.VendingMachine;

public interface IMachineState {

    void selectSlot(VendingMachine machine, String slotId);

    void insertPayment(VendingMachine machine, double amount);

    void cancel(VendingMachine machine);
}
