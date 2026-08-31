package payment.decorator;

import payment.IPaymentStrategy;

public abstract class PaymentDecorator implements IPaymentStrategy {

    protected final IPaymentStrategy wrapped;


    protected PaymentDecorator(IPaymentStrategy wrapped) {
        this.wrapped = wrapped;
    }
}
