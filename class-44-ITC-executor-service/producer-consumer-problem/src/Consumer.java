public class Consumer implements Runnable{

    private Warehouse warehouse;

    public Consumer(Warehouse warehouse) {
        this.warehouse = warehouse;
    }

    @Override
    public void run() {

        for (int i = 1; i <= 5; i++) {
            warehouse.takeProduct();
        }
    }
}
