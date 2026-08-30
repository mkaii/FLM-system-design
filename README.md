# FLM-system-design

Java + OOP fundamentals course. Each folder below is one class session.

## class-1-Introduction-setup
Dev environment setup: JDK 21, IntelliJ IDEA, GitHub/Git, OpenAI Codex CLI, and Wispr Flow (voice-to-text) for AI-assisted coding.

## class-2-java-basics
Core Java syntax and classes — the basics needed before writing real OOP code.

## class-3-Debugging-IntellJ
Debugging in IntelliJ: breakpoints, stepping through code, inspecting objects and classes at runtime.

## class-4-Inheritance
Encapsulation and inheritance. `Dog` / `GermanShefard extends Dog` example showing a subclass inheriting behavior (`doBark()`) from its parent.

## class-5-polymorphism
Runtime polymorphism via `IDog` interface (`Labrador`, `Pomeranian` overriding `doBark()`, dispatched through `DogSoundManager`) plus method overloading in `Student.print()`.

## class-6-abstraction
Abstraction with the `IDiscount` interface and interchangeable implementations (`MembershipDiscount`, `CreditCardDiscount`, `CouponDiscount`) — same interface, swappable logic.

## class-7-splitwise-1
Design session for a Splitwise-style expense-splitting app — sketching the OOP model (users, groups, expenses, splits) before writing code.

## class-8-splitwise-code
Implementation of the Splitwise design: `User`, `Group`, `Expense` with polymorphic split strategies (`EqualExpense`, `ExactAmountExpense`, `PercentageExpense`) — ties together inheritance, polymorphism, and abstraction from earlier classes.

## class-9-splitwise-code-complete
Finished, working Splitwise app: creates users/groups, adds equal and percentage-split expenses, and computes each member's running balance end-to-end (`Splitwise`, `Group.getBalance()`).

## class-10-SOLID-1
SOLID principles, part 1 — theory on decoupling, covering the Single Responsibility and Open/Closed principles.

## class-11-Solid-2
SOLID principles, part 2 — recaps bad SRP/OCP code (`ShapeCalculator` with if-else chains per shape for area/volume) and introduces the Liskov Substitution Principle: `Line implements Shape` but throws `UnsupportedOperationException` on `getArea()`/`getVolume()` since a 1D shape has neither, forcing `AreaCalculator` to defensively `instanceof`-check and skip it — a textbook LSP violation.

## class-12-solid-3
SOLID principles, part 3 — the fix. Splits the fat `Shape` interface into `Shape1D`/`Shape2D`/`Shape3D` (Interface Segregation fixed), makes `AreaCalculator`/`VolumeCalculator` take their shape list via constructor injection instead of creating it internally (Dependency Inversion fixed), and removes the `instanceof` check entirely since every `Shape2D` now honestly honours the `getArea()` contract (Liskov fixed). Closes out L, I, and D of SOLID.

## class-14-design-pattern-begin-strategypattern-1
Intro to design patterns — Strategy Pattern, part 1 (theory).

## class-15-strategy-pattern-2
Strategy Pattern, part 2 (theory continued).

## class-16-Template-Pattern
Template Method Pattern: abstract `BeverageMaker` defines the fixed algorithm skeleton (`boilWater → brew → pourInACup → addCondiments`), with `CoffeeMaker`/`TeaMaker` overriding only the varying steps (`brew()`, `addCondiments()`).

## class-17-payment-processor-template-pattern
Template Pattern applied to a real scenario: abstract `PaymentProcessor.processOrder()` fixes the steps (validate → OTP check → create payment → pay → log), while `CardPaymentProcessor`/`CashPaymentProcessor`/`UPIPaymentProcessor` each supply their own `createPayment()` via `IPayment` implementations (`CardPayment`, `CashPayment`, `UPIPayment`).

## class-18-Builder
Builder Pattern: compares a `UserProfile` with one bulky 9-arg constructor (order-dependent, easy to mis-call) against a fluent `Builder` inner class (`.name(...).email(...).age(...).build()`) that reads clearly and survives field-order/field-count changes.

## class-19-state-pattern
State Pattern via a `MediaPlayer`: starts from bad code (`bad-code/` uses a raw `State` enum with if-else branching), then fixes it with `IState` interface (`play`/`pause`/`stop`) implemented by `PlayState`/`PauseState`/`StopState` — `MediaPlayer` delegates to its current state object instead of branching on an enum, and swaps state via `setState()`.

## class-20-Singleton
Singleton Pattern: private constructor plus a static `getInstance()` that lazily creates the one shared instance on first call and returns it on every call after — ensures only one object of the class ever exists.

## class-21-Observer-pattern
Observer Pattern via a YouTube notification example: `ISubject` (`subscribe`/`unsubscribe`) implemented by `YouTubeChannel`, `ISubscriber` implemented by `EmailSubscriber`/`SMSSubscriber` — `uploadVideo()` triggers `notifySubscribers()`, looping through all subscribers and calling their `notifyUser()`, so any number of observer types can react to one event without the channel knowing their details.

## class-22-factory-method
Factory Method and Abstract Factory, side by side. `Factory-for-Game`: abstract `Level.createEnemy()` is the factory method — `ForestLevel`/`SnowLevel`/`DesertLevel` each decide their own `IEnemy` (`Goblin`/`SnowMan`/`SandMan`) while `Level`'s shared logic never changes. `abstract-factory-furniture-example`: `FurnitureFactory` (`createChair`/`createSofa`) implemented by `ModernFurnitureFactory`/`VictorianFurnitureFactory`, guaranteeing `FurnitureStore` always gets a matching family of pieces, never a mismatched Modern chair with a Victorian sofa.

## class-23-Adapter-pattern
Adapter Pattern (theory) — wrapping an incompatible class (e.g. a third-party/legacy API) behind your existing interface so the rest of the codebase can keep calling the familiar contract without knowing a translation is happening underneath.

## class-24-Decorator
Decorator Pattern on `IPayment`: abstract `BaseDecorator` holds the wrapped `IPayment` so concrete decorators don't repeat that boilerplate — `FeeDecorator`/`RewardDecorator` layer fee (`CardFee`/`UPIFee`) and reward (`CardReward`/`UPIReward`) behavior onto `CardPayment`/`UPIPayment` by stacking wrappers, instead of writing a combinatorial-explosion of Fee+Reward subclasses per payment type.

## class-25-hw-diisc-composition-composite-facade-proxy-pattern
Four patterns in one class, plus ready-made quiz CSVs (`Quiz-CSVs/`) for composite, composition-vs-inheritance, facade, and proxy. **Composite**: `FileSystemItem` interface (`getSize()`) implemented uniformly by `File` (leaf) and `Folder` (holds children, sums their sizes) — same for `Employee`/`Manager`/`IndividualContributor`, treating individuals and groups through one interface. **Facade**: `CheckoutFacade.checkout()` hides `PaymentValidator` → `FraudCheckService` → `PaymentGateway` → `NotificationService` behind one simple call. **Proxy**: `DocumentProxy` defers creating the expensive `RealDocument` until `display()` is actually called (lazy loading), compared against `bad-code/` which loads it eagerly on construction.

## class-26-parking-lot-LLD-1
Full LLD problem statement: design a multi-floor Parking Lot system (spot allocation by size/vehicle-type compatibility, entry/exit + ticketing, swappable fee schemes, spot state — Available/Occupied/Reserved, cross-floor availability reporting, centralized object creation, single shared lot instance, one simple external entry/exit call, and a stretch goal for lazy/access-controlled ticket lookups). Written to deliberately map onto nearly every pattern covered so far — Strategy (pricing), State (spot condition), Composite (floor/lot reporting), Factory (spot/vehicle creation), Singleton (one lot instance), Facade (simple external interface), Proxy (stretch goal).

## class-27-parking-lot-2
Design notes/walkthrough continuing the Parking Lot LLD problem from class-26.

## class-28-parking-lot-LLD-code
First code pass on the class-26/27 Parking Lot design, everything in one flat `src/` package (no sub-packages yet). Implements the State pattern for spot occupancy (`IState`, singleton `AvailableState`/`OccupiedState`), Strategy for pricing (`IPricingStrategy`, `HourlyBikePricingStrategy`/`HourlyCarPricingStrategy`) selected via a `PricingStrategyFactory` keyed by `SpotSize`, plus `IVehicle` (`TwoWheeler`/`FourWheeler`/`HeavyFourWheeler`) and `ISpot` (`CompactSpot`/`LargeSpot`/`HeavySpot`) hierarchies. Several pieces are deliberately left as stubs (`ParkingFacade`, `Main`, `Ticket`, `HeavySpot` are empty) — a work-in-progress snapshot mid-implementation.

## class-29-Parking-Lot-complete
Reorganizes class-28 into real packages (`model.parking`, `model.spot`, `model.vehicle`, `model.ticket`, `pricing`, `state`, `factory`, `facade`, `service`, `exception`) and finishes the system end to end. Adds `ParkingLot` (Singleton via `getInstance()`) composed of `Floor`s, both implementing a shared `IArea.availableSpots()` (Composite), a `SpotFactory` centralizing spot creation, a `SpotFinder` service that scans floors for a size-matching available spot, `TicketManager` for ticket history, and `NoAvailableSpotException` when no spot fits. `ParkingFacade.parkVehicle()/unPark()` hides spot-finding, state assignment, ticketing, and pricing behind one call; `Main.java` demonstrates parking/unparking a car and bike and triggering the no-spot exception for a second heavy vehicle.

## class-30-package-pLot-start-VM
No code — two notes files. `Parking-lot-future-notes.txt` is a retrospective code review of the class-29 parking lot, cataloguing concrete bugs: `SpotFactory` is a cached registry, not a real factory (duplicate spots are secretly the same object); `PricingStrategyFactory` keyed by `SpotSize` conflates spot tier with vehicle type; the `ParkingLot` singleton's lazy init isn't synchronized and `isAvailable()`+`assign()` race across threads; state methods fail silently instead of throwing, letting `unPark()` double-charge; `TicketManager` leaks its internal list; `SpotFinder` is tightly coupled to the singleton. `Problem-statement.txt` introduces the next project — a Vending Machine managing slots/inventory, payment, dispensing, and change, driven by machine state (idle/awaiting-payment/dispensing/unavailable).

## class-31-VM-design-LLD
Expands the vending machine problem statement into nine numbered functional-requirement sections (inventory/slots, selection, payment, change/cash handling, dispensing, machine lifecycle, reporting, external interaction, and stretch-goal extensibility), plus a design-plan PDF, and lays down the initial package skeleton (`app`, `common`, `facade`, `machine`, `machine.state`, `payment`, `service`, `transaction`) mostly as stubs. `VendingMachine` (Singleton) holds a `ChangeService`; `IMachineState`/`IdleState`/`AwaitingPaymentState`/`DispensingState`/`UnavailableState` (State pattern) and `IPaymentStrategy`/`CashPayment`/`CardPayment`/`UPIPayment` (Strategy) exist but with empty method bodies, and `Slot`/`VendingMachineFacade` are placeholder classes — scaffolding for classes 32–34.

## class-32-VM-code-1
Fills in the class-31 skeleton into a working vending machine. `VendingMachine` (Singleton) now holds real `Slot`s (id/product/price/quantity, `dispenseOne()`/`restock()`) and delegates `selectSlot()/insertPayment()/cancel()` to whichever `IMachineState` is active, with each state throwing a new `InvalidMachineStateException` on illegal calls instead of ignoring them; new `SlotUnavailableException`/`ChangeUnavailableException` cover empty slots and unmakeable change. Payment combines Strategy and Factory: `IPaymentStrategy` (`CashPayment`/`CardPayment`/`UPIPayment`) is chosen by a new `PaymentStrategyFactory`. `VendingMachineFacade.selectProduct()/insertPayment()/cancel()` is the single external entry point, coordinating slot lookup, state transitions, change validation (`ChangeService`), and `TransactionManager`; a new `ITransactionLookup` interface sits in front of `TransactionManager` as the seam for the class-31 stretch goal (a future Proxy for lazy/access-controlled transaction history).

## class-33-VM-code-&-debug
A debugging and cleanup pass over the class-32 vending machine — same package structure and classes, no new functionality. Reorders members, adds explanatory comments (why cash-only payments update the machine's change reservoir, how `PendingPurchase` stages incremental payments, that `IMachineState` implementations must throw `InvalidMachineStateException` rather than silently no-op), and lands a complete `Main.java` walkthrough: buying with exact cash, paying in two partial installments, a card payment rejected by `InvalidPaymentException` for falling below `CardPayment`'s minimum, a cancel, a successful card purchase, and a final `SlotUnavailableException` once a slot sells out.

## class-34-VM-new-req-wip
Currently an exact, file-for-file copy of the class-33 `VM-complete` code — carried over as the starting point for a new requirement to be layered onto the finished vending machine, since the additional requirement needed groundwork before the class itself could happen. The additional-requirement implementation isn't in this snapshot yet.
