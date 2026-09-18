//TIP To <b>Run</b> code, press <shortcut actionId="Run"/> or
// click the <icon src="AllIcons.Actions.Execute"/> icon in the gutter.
void main() throws ExecutionException, InterruptedException {

    ExecutorService executor = Executors.newFixedThreadPool(3);

    /*executor.execute(new MyTask(1));
    executor.execute(new MyTask(2));
    executor.execute(new MyTask(3));
    executor.execute(new MyTask(4));
    executor.execute(new MyTask(5));*/

    Future<Integer> x = executor.submit(new MyCalculation()); // represent eventual results


    System.out.println(x.get());

    System.out.println("Main is about to end");

    executor.shutdown();


}
