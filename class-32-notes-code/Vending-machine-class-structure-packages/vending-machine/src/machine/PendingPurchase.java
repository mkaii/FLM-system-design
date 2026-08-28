package machine;

// use case payments can be made incrementally, so we need this pending or staging object
//when the amount reaches the product price or more, we can call the complete method on this object
// the complete returns us the final transaction which we will store in the manager

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

    public void addAmountReceived(double amount) {
        amountReceived += amount;
    }

    public Transaction complete(double changeGiven, PaymentMethod paymentMethod, long timeStamp) {
        return new Transaction(slot.getId(), slot.getProductName(), slot.getPrice(), changeGiven, paymentMethod, timeStamp);
    }

    public double getAmountOwed() {
        return slot.getPrice() - amountReceived;
    }
}
