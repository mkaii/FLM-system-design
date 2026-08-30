package transaction;

import common.PaymentMethod;

public class Transaction {

    private final String slotId;
    private final String productName;
    private final double price;
    private final double changeGiven;
    private final PaymentMethod paymentMethod;
    private final long timestamp;

    public Transaction(String slotId, String productName, double price, double changeGiven, PaymentMethod paymentMethod, long timestamp) {
        this.slotId = slotId;
        this.productName = productName;
        this.price = price;
        this.changeGiven = changeGiven;
        this.paymentMethod = paymentMethod;
        this.timestamp = timestamp;
    }

    public String getSlotId() {
        return slotId;
    }

    public String getProductName() {
        return productName;
    }

    public double getPrice() {
        return price;
    }

    public double getChangeGiven() {
        return changeGiven;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public long getTimestamp() {
        return timestamp;
    }
}
