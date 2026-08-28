package machine.state;

import machine.Slot;
import machine.VendingMachine;
import machine.exception.InvalidMachineStateException;
import machine.exception.SlotUnavailableException;

public class IdleState implements IMachineState{

    private static final IdleState singleton = new IdleState();

    private IdleState() {
    }

    public static IdleState getInstance() {
        return singleton;
    }

    @Override
    public void selectSlot(VendingMachine machine, String slotId) {
        Slot slot = machine.findSlot(slotId);
        if (slot == null || !slot.hasStock()) {
            throw new SlotUnavailableException("slot " + slotId + " is not available");
        }
        machine.startPurchase(slot);
        machine.setState(AwaitingPaymentState.getInstance());
        System.out.println("selected " + slot.getProductName() + ", price: " + slot.getPrice());
    }

    @Override
    public void insertPayment(VendingMachine machine, double amount) {
        throw new InvalidMachineStateException("select a product before inserting payment");
    }

    @Override
    public void cancel(VendingMachine machine) {
        System.out.println("nothing to cancel, machine is idle");
    }
}
