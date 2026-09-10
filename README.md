# FLM-system-design

Java + OOP course. Each folder below is one class.

Roughly five blocks:
- **Classes 1–9** — Java and OOP basics, ending with a small Splitwise app
- **Classes 10–13** — SOLID principles
- **Classes 14–25** — design patterns, one or two per class
- **Classes 26–37** — three full design projects: parking lot, vending machine, snake game
- **Classes 38 onwards** — threads and concurrency

---

## class-1-Introduction-setup
- Setting up the machine: JDK, IntelliJ, Git and GitHub
- AI tools for coding: Codex CLI, and Wispr Flow for voice input

## class-2-java-basics
- Core Java syntax and classes
- The minimum needed before writing real OOP code

## class-3-Debugging-IntellJ
- Debugging in IntelliJ: breakpoints and stepping through code line by line
- Looking inside objects while the program is running

## class-4-Inheritance
- Encapsulation: keeping data private and controlling who can touch it
- Inheritance: a child class gets its parent's behaviour for free
- Example: a dog breed that inherits barking from `Dog`

## class-5-polymorphism
- The same method call doing different things depending on the object behind it
- Example: different dog breeds each barking their own way, called through one common type
- Also method overloading: same method name, different arguments

## class-6-abstraction
- One interface, several implementations that can be swapped freely
- Example: membership, credit card and coupon discounts behind one discount interface
- The caller does not need to know which one it got

## class-7-splitwise-1
- First real design session, no code yet
- Sketching the model for a Splitwise-style app: users, groups, expenses, splits

## class-8-splitwise-code
- Builds the design from class-7
- Three ways to split a bill (equal, exact amount, percentage) behind one common type
- First time inheritance, polymorphism and abstraction are all used together

## class-9-splitwise-code-complete
- The finished, working app
- Creates users and groups, adds expenses, and works out what each person owes

## class-10-SOLID-1
- SOLID part 1, theory
- Single Responsibility and Open/Closed

## class-11-Solid-2
- SOLID part 2
- Starts from bad code: one calculator with a long if-else chain per shape
- Liskov Substitution: a `Line` claims to be a shape but has no area or volume, so callers are forced to special-case it
- Lesson: a child class that cannot keep the parent's promises breaks everyone using it

## class-12-solid-3
- SOLID part 3 — fixing the class-11 code
- Splits one big interface into 1D / 2D / 3D, so nothing has to implement methods it cannot support
- Calculators are handed the data they work on instead of creating it themselves
- The special-case checks disappear on their own once the interfaces are honest

## class-13-solid-4-quiz-discussion
- SOLID part 4 and quiz discussion, plus a SOLID reference PDF
- Also the home for **every quiz in the course** — `Quiz-CSVs/`, 33 files, around 880 questions
- Grouped into `oops/`, `solid/`, `design-patterns/`, `concurrency/`, and one folder per project: `parking-lot/`, `vending-machine/`, `snake-game/`
- `quiz_import_template.csv` is the blank format sample, not a quiz
- The project quizzes quote real code from this repo, including the bugs we found in class

## class-14-design-pattern-begin-strategypattern-1
- Intro to design patterns
- Strategy pattern, part 1 (theory)

## class-15-strategy-pattern-2
- Strategy pattern, part 2 (theory continued)

## class-16-Template-Pattern
- Template Method: the parent fixes the order of the steps, children fill in only the steps that differ
- Example: making a hot drink — boil, brew, pour, add condiments — where only brewing and condiments change between tea and coffee

## class-17-payment-processor-template-pattern
- The same pattern on something real: paying for an order
- The steps and their order are fixed: validate, check OTP, create payment, pay, log
- Card, cash and UPI each supply only their own payment step

## class-18-Builder
- Compares one constructor with nine arguments against a step-by-step builder
- The long constructor is easy to call wrongly and breaks whenever the fields change
- The builder reads clearly and survives those changes

## class-19-state-pattern
- State pattern using a media player
- Starts from bad code: one enum with if-else checks scattered around
- Fixed by giving each state (play, pause, stop) its own class that owns its own rules

## class-20-Singleton
- Making sure only one object of a class can ever exist
- Private constructor plus one shared access point

## class-21-Observer-pattern
- One event, many listeners
- Example: a YouTube channel uploads a video and every subscriber gets notified
- The channel does not know who is listening or how many there are

## class-22-factory-method
- Two creation patterns side by side
- Factory Method: each game level decides which enemy it creates, while the shared level logic stays the same
- Abstract Factory: a furniture factory that guarantees a matching set, so you never get a modern chair with a victorian sofa

## class-23-Adapter-pattern
- Adapter (theory)
- Wrapping something with the wrong shape — an old or third-party class — so existing code can keep calling what it already knows

## class-24-Decorator
- Adding behaviour by wrapping an object instead of subclassing it
- Fees and rewards get stacked onto payments in layers
- Avoids needing a separate class for every combination

## class-25-hw-diisc-composition-composite-facade-proxy-pattern
- Four topics in one class, plus quizzes
- **Composite**: files and folders treated the same way, so a folder can add up its contents without the caller caring which it has
- **Facade**: one simple call hiding four services behind it
- **Proxy**: only build the expensive object when it is actually needed
- Also composition vs inheritance — when to hold something instead of extending it

## class-26-parking-lot-LLD-1
- First full design project: a multi-floor parking lot
- Written requirements: spot sizes, tickets, fee schemes, availability, one shared lot
- Deliberately written so it needs almost every pattern covered so far

## class-27-parking-lot-2
- Continues the parking lot design discussion from class-26

## class-28-parking-lot-LLD-code
- First code pass on the parking lot
- Everything in one flat folder, some pieces still empty — a work-in-progress snapshot

## class-29-Parking-Lot-complete
- The parking lot finished and working end to end
- Code reorganised into proper packages
- Parks and unparks a car and a bike, and correctly refuses when no spot fits

## class-30-package-pLot-start-VM
- No code — two notes files
- A review of our own parking lot code, listing the real bugs in it: spots secretly sharing one object, failures that print a message instead of raising an error, internal lists handed out to callers
- Also introduces the next project: a vending machine

## class-31-VM-design-LLD
- Vending machine requirements written out in nine sections
- Package structure created with mostly empty classes — the skeleton for the next few classes

## class-32-VM-code-1
- Fills in the skeleton into a working vending machine
- Slots hold stock; the machine moves through idle, awaiting payment, dispensing and unavailable
- Illegal actions now raise an error instead of being quietly ignored
- Cash, card and UPI each validate themselves
- One entry point coordinates the whole purchase

## class-33-VM-code-&-debug
- Debugging and clean-up pass, no new features
- Comments added explaining why things are the way they are
- A full walkthrough: exact cash, payment in two parts, a rejected card payment, a cancel, and finally a sold-out slot

## class-34-VM-new-req
- Three new requirements added to the finished machine
- A new "special card" payment type, built by extending the existing card payment so it reuses its rules
- A decorator, so extra behaviour can be layered onto a payment without editing it
- The cash reserve now only updates for cash payments, decided by the payment type itself instead of if-else in the checkout code

## class-35-snake-game-Design
- Third project: snake game, design only
- `requirements.txt` written as demands on the system, with a hint per section so the design gets discovered rather than handed over
- No pattern is named anywhere in the requirements
- `UML/` has five diagrams, one per pattern used

## class-36-snake-game-code-discuss
- The working snake game, plain Java with no graphics
- One fixed sequence per move; only the edge-of-board rule changes between game types
- Classic ends the game at the wall, wrap-around comes out the other side
- Growing is just skipping the step that normally drops the tail
- A small bot plays it, so runs are repeatable

## class-37-code-debug-discuss
- Debugging session, then a new-requirements pass
- Three requirements were met by only adding new files: a new food type, a new edge rule, a new listener
- The power-up requirement could not be — scoring was hardcoded, so existing code had to be opened up first
- Notes also record what the design cannot do: a bouncing edge is impossible without changing the shared move logic

## class-38-concurrency
- Start of the concurrency block
- Reading and discussion: concurrency vs parallelism — taking turns, versus genuinely running at the same time
- No code

## class-39-threading-start
- First threading code, plus a discussion PDF on threads and processes
- Creating threads by extending `Thread`
- Shows each thread's name, and that the main thread carries on instead of waiting
- Notes that a thread cannot be started twice

## class-40-runnable-thread-method
- Switches to `Runnable`: the job and the worker become separate things, so the same job can be given to several threads
- Thread states, and the common thread methods
- Runs fibonacci on four threads — fine for showing threads, but the numbers are far too small to show any speed gain
- `class-plan.txt` has the measured answer: computing only gets faster up to the number of cores, while waiting overlaps almost for free

## class-41-states-demo-synchronization
- Watching thread states directly: sleeping, waiting on another thread, and waiting for a lock
- A shared counter that two threads both increment
- `count++` is really three steps, so without a lock some updates go missing
- `synchronized` makes the total come out right every time, at the cost of the threads taking turns
- `notes.txt` has what we did and why, plus a warning that the demo as written takes hours to finish

## class-42-syncronized-locks
- Going further with synchronization, this time locking only part of a method instead of all of it
- Bank account: the cheap check stays outside the lock, while the balance check and the withdrawal are locked together
- Singleton: locking so two threads cannot both decide to create the object
- Both examples use a deliberate pause to make the problem easy to reproduce
