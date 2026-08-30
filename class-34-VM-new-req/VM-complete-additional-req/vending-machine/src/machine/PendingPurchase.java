package machine;

// staging object for an in-progress purchase: payments can arrive incrementally via
// addAmountReceived(), and once enough has been received, complete() turns this into
// the final Transaction that gets saved

import common.PaymentMethod;
import transaction.Transaction;

public class PendingPurchase {

    private final Slot slot;
    private double amountReceived;

    public PendingPurchase(Slot slot) {
        this.slot = slot;
    }

    public Slot getSlot() {
        return slot;
    }

    public double getAmountReceived() {
        return amountReceived;
    }

    public double getAmountOwed() {
        return slot.getPrice() - amountReceived;
    }

    public void addAmountReceived(double amount) {
        amountReceived += amount;
    }

    public Transaction complete(double changeGiven, PaymentMethod paymentMethod, long timeStamp) {
        return new Transaction(slot.getId(), slot.getProductName(), slot.getPrice(), changeGiven, paymentMethod, timeStamp);
    }
}
