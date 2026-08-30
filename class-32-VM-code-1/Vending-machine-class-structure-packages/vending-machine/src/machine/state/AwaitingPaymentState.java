package machine.state;

import machine.VendingMachine;
import machine.exception.InvalidMachineStateException;

public class AwaitingPaymentState implements IMachineState{

    private static final AwaitingPaymentState singleton = new AwaitingPaymentState();

    private AwaitingPaymentState() {
    }

    public static AwaitingPaymentState getInstance() {
        return singleton;
    }

    @Override
    public void selectSlot(VendingMachine machine, String slotId) {
        throw new InvalidMachineStateException("a selection is already in progress, cancel first");
    }

    @Override
    public void insertPayment(VendingMachine machine, double amount) {
        machine.getPendingPurchase().addAmountReceived(amount);
        System.out.println("received " + amount + ", total so far: " + machine.getPendingPurchase().getAmountReceived());
    }

    // cancel should return the amount that has been paid so far instead of just printing it
    // note : no money movement has happened, if cancel was called during partial payments
    @Override
    public void cancel(VendingMachine machine) {
        System.out.println("cancelling, refunding " + machine.getPendingPurchase().getAmountReceived());
        machine.resetTransaction();
        machine.setState(IdleState.getInstance());
    }
}
