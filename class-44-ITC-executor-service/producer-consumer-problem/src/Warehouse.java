public class Warehouse {

    private int product;
    private boolean hasProduct = false;

    public synchronized void takeProduct() {

        while (!hasProduct) {
            try {
                System.out.println("Consumer: Warehouse is empty. Waiting...");
                wait();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        System.out.println("Consumer: Taking product " + product);

        hasProduct = false;

        notify();
    }

    public synchronized void putProduct(int product) {

        while (hasProduct) {
            try {
                System.out.println("Producer: Warehouse is full. Waiting...");
                wait();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }

        this.product = product;
        hasProduct = true;

        System.out.println("Producer: Putting product " + product);

        notify();
    }
}