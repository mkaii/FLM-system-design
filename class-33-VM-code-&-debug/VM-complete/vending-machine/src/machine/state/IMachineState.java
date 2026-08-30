package machine.state;

import machine.VendingMachine;

// each implementation decides which of these 3 are legal in that condition; an illegal
// call throws InvalidMachineStateException instead of silently doing nothing
public interface IMachineState {

    void selectSlot(VendingMachine machine, String slotId);

    void insertPayment(VendingMachine machine, double amount);

    void cancel(VendingMachine machine);
}
