//TIP To <b>Run</b> code, press <shortcut actionId="Run"/> or
// click the <icon src="AllIcons.Actions.Execute"/> icon in the gutter.
void main() throws InterruptedException {

//    System.out.println("Main thread started");
//
//    Runnable myTask = new MyTask();
//    Thread t1 = new Thread(myTask);
//    t1.setName("saikiran");
//
//    System.out.println(t1.getName() + " " + t1.getState());
//
//    t1.start();
//
//    System.out.println(t1.getName() + " " + t1.getState());
//
//    t1.join();
//    System.out.println(Thread.currentThread().getState());
//    System.out.println(t1.getName() + " " + t1.getState());
//
//    Thread t2 = new Thread(myTask);
//    t2.setName("jaikanth");
//    t2.start();
//
//    System.out.println(Thread.currentThread().getState());
//
//    t2.join();
//    System.out.println(Thread.currentThread().getState());
//    System.out.println("Main thread ended");


    int[] numbers = {6,7,8,9};

    /*1 1 2 3 5 8 13 21 34
    6 th -> 8
        7th -> 13
        8th -> 21
        9th -> 34*/


    for(int n : numbers){
        Fibonacci task = new Fibonacci(n);

        Thread t = new Thread(task);
        t.start();
    }



}
