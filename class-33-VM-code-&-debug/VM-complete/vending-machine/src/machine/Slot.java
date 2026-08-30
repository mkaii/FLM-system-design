package machine;

public class Slot {

    private final String id;
    private final String productName;
    private final double price;
    private int quantity;

    public Slot(String id, String productName, double price, int quantity) {
        this.id = id;
        this.productName = productName;
        this.price = price;
        this.quantity = quantity;
    }

    public String getId() {
        return id;
    }

    public String getProductName() {
        return productName;
    }

    public double getPrice() {
        return price;
    }

    public int getQuantity() {
        return quantity;
    }

    public boolean hasStock() {
        return quantity > 0;
    }

    // reduces stock by one when an item is dispensed; guards against going negative
    public void dispenseOne() {
        if (quantity <= 0) {
            throw new IllegalStateException("slot " + id + " is out of stock");
        }
        quantity--;
    }

    public void restock(int units) {
        quantity += units;
    }


}
