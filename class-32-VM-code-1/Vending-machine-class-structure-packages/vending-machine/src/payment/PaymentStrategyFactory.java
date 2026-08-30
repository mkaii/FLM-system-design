package payment;

import common.PaymentMethod;

public class PaymentStrategyFactory {

    public IPaymentStrategy getStrategy(PaymentMethod method) {
        if (method == PaymentMethod.CASH) {
            return new CashPayment();
        } else if (method == PaymentMethod.CARD) {
            return new CardPayment();
        } else {
            return new UPIPayment();
        }
    }
}
