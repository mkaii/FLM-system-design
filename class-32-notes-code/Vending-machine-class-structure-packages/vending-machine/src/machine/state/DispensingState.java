package machine.state;

import machine.VendingMachine;
import machine.exception.InvalidMachineStateException;

public class DispensingState implements IMachineState{

    private static final DispensingState singleton = new DispensingState();

    private DispensingState() {
    }

    public static DispensingState getInstance() {
        return singleton;
    }


    @Override
    public void selectSlot(VendingMachine machine, String slotId) {
        throw new InvalidMachineStateException("machine is dispensing, please wait");
    }

    @Override
    public void insertPayment(VendingMachine machine, double amount) {
        throw new InvalidMachineStateException("machine is dispensing, please wait");
    }

    @Override
    public void cancel(VendingMachine machine) {
        throw new InvalidMachineStateException("cannot cancel while dispensing");
    }
}
