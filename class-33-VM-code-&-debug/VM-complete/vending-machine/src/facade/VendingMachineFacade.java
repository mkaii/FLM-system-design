package facade;

import common.PaymentMethod;
import machine.Slot;
import machine.VendingMachine;
import machine.exception.ChangeUnavailableException;
import machine.state.DispensingState;
import machine.state.IdleState;
import machine.state.UnavailableState;
import payment.IPaymentStrategy;
import payment.PaymentStrategyFactory;
import transaction.Transaction;
import transaction.TransactionManager;

public class VendingMachineFacade {

    private final VendingMachine machine;
    private final PaymentStrategyFactory paymentStrategyFactory;
    private final TransactionManager transactionManager;

    public VendingMachineFacade(TransactionManager transactionManager) {
        this.machine = VendingMachine.getInstance();
        this.paymentStrategyFactory = new PaymentStrategyFactory();
        this.transactionManager = transactionManager;
    }

    // ---- public API: product selection, payment, cancel ----

    public void selectProduct(String slotId) {
        machine.selectSlot(slotId);
    }


    public Transaction insertPayment(double amount, PaymentMethod method) {
        IPaymentStrategy strategy = paymentStrategyFactory.getStrategy(method);

        double credited = strategy.process(amount);

        machine.insertPayment(credited);

        Slot slot = machine.getPendingPurchase().getSlot();
        if (machine.getPendingPurchase().getAmountReceived() >= slot.getPrice()) {
            return completePurchase(method);
        }
        return null;
    }

    public double getAmountOwed() {
        return machine.getPendingPurchase().getAmountOwed();
    }

    public void cancel() {
        machine.cancel();
    }

    // once enough has been received: check change is available, dispense, record the
    // transaction, then move the machine back to Idle (or Unavailable if now out of stock)
    private Transaction completePurchase(PaymentMethod method) {
        Slot slot = machine.getPendingPurchase().getSlot();
        double amountReceived = machine.getPendingPurchase().getAmountReceived();
        double change = amountReceived - slot.getPrice();

        if (!machine.canMakeChange(change)) {
            machine.resetTransaction();
            machine.setState(IdleState.getInstance());
            throw new ChangeUnavailableException("cannot make change of " + change + ", refunding " + amountReceived);
        }

        machine.setState(DispensingState.getInstance());

        slot.dispenseOne(); // item got out of the machine for the customer to pick
        machine.releaseChange(change);
        machine.receiveCash(amountReceived); // this should be only possible for cash payments

        Transaction transaction = machine.getPendingPurchase().complete(change, method, System.currentTimeMillis());
        transactionManager.save(transaction);

        machine.resetTransaction();
        machine.setState(machine.hasAnyStock() ? IdleState.getInstance() : UnavailableState.getInstance());

        return transaction;
    }


}
