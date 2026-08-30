package machine.state;

import machine.VendingMachine;
import machine.exception.InvalidMachineStateException;

public class UnavailableState implements IMachineState{

    private static final UnavailableState singleton = new UnavailableState();

    private UnavailableState() {
    }

    public static UnavailableState getInstance() {
        return singleton;
    }



    @Override
    public void selectSlot(VendingMachine machine, String slotId) {
        throw new InvalidMachineStateException("machine is unavailable (out of stock)");
    }

    @Override
    public void insertPayment(VendingMachine machine, double amount) {
        throw new InvalidMachineStateException("machine is unavailable (out of stock)");
    }

    @Override
    public void cancel(VendingMachine machine) {
        System.out.println("nothing to cancel, machine is unavailable");
    }

}
