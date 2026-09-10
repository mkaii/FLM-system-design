void main() throws InterruptedException {
    /*BankAccount account1 = new BankAccount(1000);
    BankAccount account2 = new BankAccount(1000);



    Thread t1 = new Thread(new WithdrawTask(account1, 700), "T1");
    Thread t2 = new Thread(new WithdrawTask(account2, 700), "T2");

    t1.start();
    t2.start();

    t1.join();
    t2.join();

    System.out.println("Final balance: " + account1.getBalance());
    System.out.println("Final balance: " + account2.getBalance());*/


    // singleton example :

    Thread t3 = new Thread(new SingletonTask(), "t3");
    Thread t4 = new Thread(new SingletonTask(), "t4");

    t3.start();
    t4.start();

    t3.join();
    t4.join();



}
