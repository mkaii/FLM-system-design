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

## class-13-solid-4-quiz-discussion
SOLID part 4 and quiz discussion, plus a SOLID reference PDF. This folder is also the single home for every quiz in the course — `Quiz-CSVs/` holds 30 files and roughly 800 questions in the FLM import schema (`questionText, option1..option5, correctOptions, correctOptionExplanation, points`), grouped as `oops/` (abstraction, inheritance, polymorphism), `solid/` (srp, ocp, lsp, isp, dip), `design-patterns/` (one file per pattern taught), and one folder per LLD project — `parking-lot/`, `vending-machine/`, `snake-game/`. `quiz_import_template.csv` at the top level is the blank import format sample, not a quiz. The project quizzes are written against the repo's own code: each question quotes the real class it is about and asks what a decision buys or what breaks without it, including the defects found in class — the shared-instance `SpotFactory` cache, the change reserve being updated from the wrong payment method, the `occupied`/`body` desync, the `spawnFood()` hang on a full board.

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

## class-34-VM-new-req
Three new requirements layered onto the finished vending machine. **New payment type via inheritance**: `PaymentMethod.SPECIAL` plus `SpecialCardPayment extends CardPayment`, which reuses the card minimum through `super.process()` and then subtracts its own flat surcharge — the first real class-inheritance relationship among the payment strategies, which until now were siblings behind one interface. **Decorator**: a `payment/decorator/` package (`PaymentDecorator`, `CashBackDecorator`) for layering an effect onto a payment without reopening it (note the factory still returns a bare `SpecialCardPayment`, so the decorator is defined but not yet wired in). **Change-reserve restricted to cash**: `IPaymentStrategy` grows a `default boolean doesAffectChangeReserve()` returning `false`, overridden by `CashPayment`, so `VendingMachineFacade.completePurchase()` gates `releaseChange`/`receiveCash` behind one polymorphic question instead of branching per payment type — the default method is what let the interface grow without touching the payment classes that already worked.

## class-35-snake-game-Design
Snake game LLD design session. `requirements.txt` is the written problem statement — nine numbered sections (board, movement, growth, food, boundary behaviour, game lifecycle, scoring and reporting, external interaction, stretch goals) phrased as demands on the system, with a separate `HINT` line per section so the design decision each one is really testing gets discovered rather than handed over; no pattern is named anywhere in the file. `UML/` holds five schematic sheets, one per pattern (states, observer, factory, spawn strategy, template method), alongside a design-notes PDF.

## class-36-snake-game-code-discuss
The working implementation of the class-35 design — plain Java, no GUI, driven from `Main`. Packages: `engine` (abstract `SnakeGame` plus `ClassicSnakeGame`/`WrapAroundSnakeGame`), `engine.state` (`IGameState` implemented by `RunningState`/`PausedState`/`GameOverState`, illegal calls throwing `InvalidMoveException`), `food` (parallel `FoodItem` and `FoodCreator` hierarchies plus `IFoodSpawnStrategy`), `observer`, `score`, `board`, `common`. `SnakeGame.performMove()` is the template method: a fixed five-step pipeline (compute next head → `handleBoundary()` → self-collision check → eat-or-advance → notify observers) in which only `handleBoundary()` varies — Classic returns `null` off the board to end the game, WrapAround wraps the coordinate with `Math.floorMod`. Growth is implemented as an omission rather than an action: the eating branch simply skips the tail eviction that every other move performs. The snake is held twice over, as an ordered `Deque<Point>` and a `Set<Point>`, so self-collision stays cheap as it grows. `Main` plays the game with a small greedy bot instead of keyboard input, keeping runs deterministic under a seeded `Random`.

## class-37-code-debug-discuss
A debugging session on the class-36 code, followed by a new-requirements pass; `new-req.txt` records the three stretch requirements taken from class-35's section 9 and what each actually cost. Met purely by addition, with no existing file edited: `SuperFood`/`SuperFoodCreator` (a third food kind), `CylinderSnakeGame` (a third boundary mode — Pac-Man style, side edges wrap and top/bottom are fatal), `MilestoneObserver` (a third listener), and `CyclingFoodSpawnStrategy`. The power-up requirement could **not** be met by addition — scoring was hardcoded as `score += currentFood.getPoints()`, so a seam had to be cut into `SnakeGame` first: `IScoringRule`/`BaseScoringRule`/`ScoringRuleDecorator`/`DoublePointsDecorator`, with a per-move `onMove()` tick so a timed effect can expire. The notes also record what the design cannot express: a bouncing edge is impossible, because `handleBoundary()` receives only a candidate position and `SnakeGame` stores no direction to reverse.

## class-38-concurrency
Start of the concurrency block — reading material only (a link on concurrency vs. parallelism), no code.

## class-39-threading-start
First threading code, plus a threading-and-processes discussion PDF. `MyThread extends Thread` overriding `run()`, and `Main` creates two instances and calls `start()` on each, printing `Thread.currentThread().getName()` from both the main thread and the spawned ones — so the output shows the two worker threads by name and shows the main thread carrying on past `start()` rather than waiting. A commented-out second `t1.start()` records that a thread cannot be restarted once it has run.
