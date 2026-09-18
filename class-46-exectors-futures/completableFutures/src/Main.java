//TIP To <b>Run</b> code, press <shortcut actionId="Run"/> or
// click the <icon src="AllIcons.Actions.Execute"/> icon in the gutter.
void main() {

    // fetch a number  10

    // double it 10 -> f* 20

    // print it 20

     /*CompletableFuture<Integer> future= CompletableFuture.supplyAsync(new GetNumber());

    CompletableFuture<Integer> doubled = future.thenApply(new DoubleNumber());

    doubled.thenAccept(new PrintNumber());*/

    CompletableFuture.supplyAsync(new GetNumber()).
            thenApply(new DoubleNumber()).
                thenAccept(new PrintNumber());


}
