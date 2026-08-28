package machine;

import machine.state.IMachineState;
import machine.state.IdleState;
import service.ChangeService;

import java.util.ArrayList;
import java.util.List;

public class VendingMachine {

    private static VendingMachine instance;

    private final List<Slot> slots;
    private IMachineState state = IdleState.getInstance();
    private final ChangeService changeService;
    private PendingPurchase pendingPurchase;

    private VendingMachine()
    {
        slots = new ArrayList<>();
        changeService = new ChangeService(0);
    }

    public static VendingMachine getInstance()
    {
        if (instance == null)
            instance =  new VendingMachine();
        return instance;
    }

    public void addSlot(Slot slot) {
        slots.add(slot);
    }

    public List<Slot> getSlots() {
        return slots;
    }

    public Slot findSlot(String slotId) {
        for (Slot slot : slots) {
            if (slot.getId().equals(slotId)) {
                return slot;
            }
        }
        return null;
    }


    //todo why not in reporting service
    public boolean hasAnyStock() {
        for (Slot slot : slots) {
            if (slot.hasStock()) {
                return true;
            }
        }
        return false;
    }

    public IMachineState getState() {
        return state;
    }

    public void setState(IMachineState state) {
        this.state = state;
    }

    public PendingPurchase getPendingPurchase() {
        return pendingPurchase;
    }

    // start a purchase

    public void startPurchase(Slot slot){

        this.pendingPurchase = new PendingPurchase(slot);
    }

    public void resetTransaction(){
        this.pendingPurchase = null;
    }

    public boolean canMakeChange(double amount){
        return changeService.canMakeChange(amount);

    }

    public void releaseChange(double amount){
        changeService.releaseChange(amount);
    }

    // The cash in the vending machine should not update if you are paying via UPI or card,
    // because then the cash is going into the bank account of the merchant
    // and not into the amount reservoir of the vending machine.

    public void receiveCash(double amount){
        changeService.receiveCash(amount);
    }

    public void insertPayment(double amount) {
        state.insertPayment(this, amount);
    }


    public void cancel() {
        state.cancel(this);
    }

    public void selectSlot(String slotId) {
        state.selectSlot(this, slotId);
    }
}
