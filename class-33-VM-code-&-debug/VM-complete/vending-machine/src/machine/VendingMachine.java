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

    // ---- slot inventory ----

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

    // kept on the machine rather than InventoryReportService since completePurchase() needs
    // it right after a dispense, to decide whether to fall back to UnavailableState
    public boolean hasAnyStock() {
        for (Slot slot : slots) {
            if (slot.hasStock()) {
                return true;
            }
        }
        return false;
    }

    // ---- current state + in-progress purchase, read/written by MachineState implementations ----

    public IMachineState getState() {
        return state;
    }

    // the actual state-transition point: called both by MachineState implementations
    // (on selectSlot/cancel) and directly by the facade while completing a purchase
    public void setState(IMachineState state) {
        this.state = state;
    }

    public PendingPurchase getPendingPurchase() {
        return pendingPurchase;
    }

    public void startPurchase(Slot slot){
        this.pendingPurchase = new PendingPurchase(slot);
    }

    public void resetTransaction(){
        this.pendingPurchase = null;
    }

    // ---- change reservoir, used by the facade while completing a purchase ----

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

    // ---- public triggers: the facade calls these, they just forward to whichever state is active ----

    public void selectSlot(String slotId) {
        state.selectSlot(this, slotId);
    }

    public void insertPayment(double amount) {
        state.insertPayment(this, amount);
    }

    public void cancel() {
        state.cancel(this);
    }
}
