//TIP To <b>Run</b> code, press <shortcut actionId="Run"/> or
// click the <icon src="AllIcons.Actions.Execute"/> icon in the gutter.
void main() {
    //TIP Press <shortcut actionId="ShowIntentionActions"/> with your caret at the highlighted text
    // to see how IntelliJ IDEA suggests fixing it.
    Warehouse warehouse = new Warehouse();

    Thread consumer = new Thread(new Consumer(warehouse));
    Thread producer = new Thread(new Producer(warehouse));

    // Consumer is started FIRST
    consumer.start();

    // Producer is started SECOND
    producer.start();
}
