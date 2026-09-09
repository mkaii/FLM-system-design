//TIP To <b>Run</b> code, press <shortcut actionId="Run"/> or
// click the <icon src="AllIcons.Actions.Execute"/> icon in the gutter.
void main() throws InterruptedException {

        // timed waiting
        Runnable r1 = new MyTask();
        Thread  t1 = new Thread(r1, "thread_1");

        t1.start();


        Thread.sleep(100);
        System.out.println(t1.getState());// timed waiting / runnable


        //waiting

        Thread t2 = new Thread(r1, "sleepy_thread");

        Runnable r2 = new Waiter(t2);
        Thread t3 = new Thread(r2, "waiter");

        t2.start();
        t3.start();

        Thread.sleep(100);
        System.out.println(t3.getState());


        // counter example

        Counter c1 = new Counter();


        Runnable countRunner = new CounterRunnable(c1); // both people are working on the same counter
        Thread p1 = new Thread(countRunner, "person1");
        Thread p2 = new Thread(countRunner, "person 2");

        p1.start();

        Thread.sleep(100);
        p2.start();


        System.out.println(p1.getState());
        System.out.println(p2.getState()); // blocked

        p1.join();
        p2.join();


        System.out.println(c1.getCount()); // 2000
}
