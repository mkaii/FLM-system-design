package service;

import machine.Slot;
import machine.VendingMachine;

public class InventoryReportService {


    public int getTotalStock(VendingMachine machine) {
        int total = 0;
        for (Slot slot : machine.getSlots()) {
            total += slot.getQuantity();
        }
        return total;
    }

    public void printReport(VendingMachine machine, int lowStockThreshold) {
        for (Slot slot : machine.getSlots()) {
            String flag = slot.getQuantity() == 0 ? " [EMPTY]" : slot.getQuantity() <= lowStockThreshold ? " [LOW]" : "";
            System.out.println(slot.getId() + " - " + slot.getProductName() + ": " + slot.getQuantity() + flag);
        }
    }
}
