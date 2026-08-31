import common.PaymentMethod;
import facade.VendingMachineFacade;
import machine.Slot;
import machine.VendingMachine;
import machine.exception.SlotUnavailableException;
import payment.exception.InvalidPaymentException;
import service.InventoryReportService;
import transaction.ITransactionLookup;
import transaction.Transaction;
import transaction.TransactionManager;

//TIP To <b>Run</b> code, press <shortcut actionId="Run"/> or
// click the <icon src="AllIcons.Actions.Execute"/> icon in the gutter.
public class Main {
    public static void main(String[] args) {

        VendingMachine machine = VendingMachine.getInstance();

        machine.addSlot(new Slot("A1", "Chips", 2.50, 3));
        machine.addSlot(new Slot("A2", "Soda", 1.75, 2));
        machine.addSlot(new Slot("A3", "Candy Bar", 6.00, 1));
        machine.receiveCash(50.0);


        TransactionManager transactionManager = new TransactionManager();

        VendingMachineFacade facade = new VendingMachineFacade(transactionManager);

        //client code
        facade.selectProduct("A1");
        printIfCompleted(facade, facade.insertPayment(3.00, PaymentMethod.CASH));

        facade.selectProduct("A2");
        printIfCompleted(facade, facade.insertPayment(1.00, PaymentMethod.CASH));
        printIfCompleted(facade, facade.insertPayment(0.75, PaymentMethod.CASH));

        try {
            facade.selectProduct("A3");
            facade.insertPayment(3.00, PaymentMethod.CARD);
        } catch (InvalidPaymentException e) {
            System.out.println("Expected failure: " + e.getMessage());
        }

        facade.cancel();

        facade.selectProduct("A3");
        printIfCompleted(facade, facade.insertPayment(6.00, PaymentMethod.CARD));

        try {
            facade.selectProduct("A3");
        } catch (SlotUnavailableException e) {
            System.out.println("Expected failure: " + e.getMessage());
        }
    }


        private static void printIfCompleted (VendingMachineFacade facade, Transaction transaction){
            if (transaction != null) {
                System.out.println("purchase complete: " + transaction.getProductName() + ", change returned: " + transaction.getChangeGiven());
            } else {
                System.out.println("payment incomplete, amount still owed: " + facade.getAmountOwed());
            }
        }

    }
