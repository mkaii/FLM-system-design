public class Producer implements Runnable {

    private Warehouse warehouse;

    public Producer(Warehouse warehouse) {
        this.warehouse = warehouse;
    }

    @Override
    public void run() {

        for (int i = 1; i <= 5; i++) {
            warehouse.putProduct(i);
        }
    }
}
