package payment.decorator;

import payment.IPaymentStrategy;

public class CashBackDecorator extends PaymentDecorator {

    private static final double CASH_BACK = 0.75;

    public CashBackDecorator(IPaymentStrategy wrapped) {
     super(wrapped);
    }

    @Override
    public double process(double amount) {
        return wrapped.process(amount) + CASH_BACK;
    }
}
