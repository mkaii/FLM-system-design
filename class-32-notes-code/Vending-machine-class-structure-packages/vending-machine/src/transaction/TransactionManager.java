package transaction;

import java.util.ArrayList;
import java.util.List;

public class TransactionManager implements ITransactionLookup {

    private final List<Transaction> allTransactions = new ArrayList<>();

    public void save(Transaction transaction) {
        allTransactions.add(transaction);
    }

    @Override
    public List<Transaction> getTransactionHistory() {
        System.out.println("fetching transaction history (slow lookup)...");
        return allTransactions;
    }
}
