# FLM-system-design

Java, OOP and system design course. Each folder below is one class.

The blocks:
- **Classes 1–9** — Java and OOP basics, ending with a small Splitwise app
- **Classes 10–13** — SOLID principles
- **Classes 14–25** — design patterns, one or two per class
- **Classes 26–37** — three full design projects: parking lot, vending machine, snake game
- **Classes 38–46** — threads and concurrency
- **Classes 47–52** — REST APIs with Spring Boot, ending with a movie ticket booking project
- **Classes 53–55** — SQL: CRUD, connecting Spring Boot to MySQL, indexes
- **Classes 56–59** — scaling: load balancing, CAP theorem, NoSQL and MongoDB, SQL vs MongoDB
- **Classes 60–67** — Redis: data types, caching, Pub/Sub, Streams, atomic updates, distributed locks
- **Classes 68–69** — circuit breaker and retry (Resilience4j)
- **Classes 70–71** — how clients and servers talk: TCP/UDP, HTTP/1.1–3, HTTPS, polling, SSE, WebSocket, WebRTC
- **Classes 72–73** — system design case study: WhatsApp

Most classes from 54 on have a `class-plan.txt` and an `animations/` folder (open the HTML files in a browser).

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
- Also the home for **every quiz in the course** — `Quiz-CSVs/`, 34 files, around 910 questions
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

## class-43-custom-locks
- Moving from `synchronized` to explicit locks you take and release yourself
- The reason why: with `synchronized`, if a thread gets stuck inside, everyone else waits forever and there is no way out
- `tryLock` with a timeout: wait up to 3 seconds for the lock, and if it does not come, give up and carry on instead of blocking
- Unlocking always goes in a `finally`, so the lock is released even if something fails
- Second demo shows a lock is re-entrant: a thread already holding it can take it again in a nested method, while a different thread asking at that moment is turned away immediately

## class-44-ITC-executor-service
- Threads talking to each other with `wait()` and `notify()`, instead of only locking each other out
- Producer and consumer share a warehouse that holds one product at a time
- The producer waits when it is full, the consumer waits when it is empty, and each wakes the other up after acting
- `wait()` also lets go of the lock, which is what makes it different from sleeping — a sleeping thread keeps the lock and nobody can get in
- The waiting check is a `while`, not an `if`, so a woken thread checks again instead of assuming things changed
- The consumer is deliberately started first, so the first thing it does is wait
- Also a PDF on thread communication and thread pools; `class-plan.txt` lists executor service as the next topic, not coded yet

## class-45-Threadpool
- Twenty numbered experiments exploring `ThreadPoolExecutor` one knob at a time
- Core vs max pool size, the work queue filling up, and what happens once it does
- The four rejection policies (abort, caller-runs, discard, discard-oldest) each get their own experiment
- Later experiments cover cancelling a running or queued task, and interrupting a task that is sleeping vs one that is not
- `plan.txt` sets the next steps: a flow chart, a comparison of the executor classes, and futures / completable futures examples — the seed for class-46

## class-46-exectors-futures
- Two small projects picking up straight from class-45's plan
- **Executors-futures**: a fixed thread pool takes a `Runnable` (`MyTask`, fire-and-forget) and a `Callable` (`MyCalculation`, returns a value); `Future.get()` blocks the caller until that value is ready
- **completableFutures**: the same idea without blocking — `supplyAsync` fetches a number, `thenApply` doubles it, `thenAccept` prints it, each stage handed off as its own `Supplier` / `Function` / `Consumer` class
- Sets up the shift from "wait for the result" (`Future`) to "react when the result arrives" (`CompletableFuture`)

## class-47-api
- First look outside plain Java: building a REST API with Spring Boot
- `api-demo/` generated from Spring Initializr (see `spring-initializer-website.png`), with one `@RestController` exposing a `/test` endpoint
- `api.pdf` has the accompanying API/Spring Boot reference material
- Up to here: a single endpoint, to see the request-response loop

## class-48-user-CRUD
- First real API: a user service with `GET` and `POST`
- Controller → service → model, with users kept in memory
- `api-springboot-get-post.pdf` explains the request flow and annotations

## class-49-usermanagement complete
- The same user API with full CRUD: list, get by id, search, create, update (`PUT`), delete
- `postman-requests.png` shows every request working

## class-50-movie ticketing
- Design for the next project: a movie ticket booking system (`movie-ticket-booking-lld-project.md`)
- `notes/` is a small HTML site: domain model, seat states, booking flow, API design, concurrency and locking

## class-51-ticketing-code
- The core concurrency problem of the project: two users picking the same seat at the same moment
- Three figures walk through the race, plus a PDF on handling it with threads and locks

## class-52-movie-ticketing-code
- The booking app in Spring Boot, with a Postman collection
- Flow: lock seats → pay → confirm, with a 5-minute hold on each seat
- `SeatLockManager` keeps one lock per seat in a `ConcurrentHashMap`, taken in sorted order so two bookings cannot deadlock
- Seat states (available, locked, booked) use the State pattern; pricing and payment use Strategy

## class-53-SQL-start
- Databases and tables: `CREATE`, `INSERT`, `SELECT`, `UPDATE`, `DELETE` on a student table
- `notes.txt` has every query from class, plus a PDF

## class-54-sql-backend-connect
- Connecting Spring Boot to MySQL with Spring Data JPA: a Todo app with a Postman collection
- Hibernate creates the tables; `show-sql` prints the SQL it runs
- Notes PDF on ORM, and screenshots of the dependencies and Workbench

## class-55-indexes
- Why a lookup on 1,000,000 rows is slow (full table scan), shown with `EXPLAIN` in `index-demo.sql`
- How an index fixes it: sorted data and a B+ tree, O(log n) instead of O(n)
- Animations: B+ tree, secondary index, multi-column index, and an index question set

## class-56-horizontal-scaling-load-balancing
- Scaling out: more servers instead of a bigger one, with a load balancer in front
- The animations for this block are in class-57

## class-57-servers-Cap-theorem
- Animations: load balancer, replicas, stateless servers, proxies, API gateway, and a full request flow
- CAP theorem: when the network splits, choose consistency or availability (`cap.html`, plus a PDF)

## class-58-nosql-mongodb
- Why NoSQL exists, and its four types (key-value, document, wide-column, graph)
- MongoDB: documents vs tables, then CRUD and queries
- Animations: CRUD, finding documents, and how it all fits together

## class-59-sql-vs-mongodb-chat
- SQL vs MongoDB on one chat app, step by step: messages, reactions, polls, a viral message, deletes, sharding, new features, renames
- Each step shows the queries side by side and declares a winner; transactions only where they are needed
- Also adding a server, a server dying, sending money, and deleting old data

## class-60-redis-basics
- What Redis is: an in-memory key-value store
- Data types in redis-cli: string, list, set, hash, sorted set, plus `EXPIRE` / `TTL`
- Animations: life without Redis vs with it, then one page per data type, and a commands reference with real outputs

## class-61-redis-springboot-caching
- `product-cache/`: a Spring Boot product API with Redis caching, plus a Postman collection
- Three versions side by side: no cache, manual cache-aside with `RedisTemplate`, and `@Cacheable` / `@CacheEvict`
- Keys expire after 60 s; the animation shows a cache hit, a miss and stale data

## class-62-redis-pubsub
- Redis Pub/Sub and Streams in redis-cli, with three terminals
- Pub/Sub is fire-and-forget: a subscriber that is offline misses the message
- Streams store the message, so a reader can catch up later
- Animation with a command / meaning / reply table for every step

## class-63-redis-pubsub-springboot
- Pub/Sub in Spring Boot: five separate services (order, email, restaurant, delivery, analytics) sending a JSON order
- The animation starts with direct API calls and their problems, then switches to Pub/Sub
- Shows how Spring calls `onMessage`, what happens when a subscriber is down, and adding a new service

## class-64-redis-streams-cli
- Streams with four terminals: one producer, two workers in group `email`, one in group `delivery`
- `prod.txt`, `email1.txt`, `email2.txt`, `delivery1.txt` record every command from class, in order, with its reply
- Consumer groups, the bookmark (`last-delivered-id`), the pending list, `XACK`, and rescuing a stuck entry with `XAUTOCLAIM`
- Animation explains each command word by word

## class-65-redis-streams-springboot
- The same in Spring Boot: order-service writes to the stream, email-service and delivery-service read it in consumer groups
- An order placed while email-service is down is still emailed when it comes back
- Two copies of email-service share the work: each order goes to only one copy

## class-66-redis-stream-rescue-mg-within-consumer-group
- `PendingRescuer`: every 30 s, a live copy claims entries another copy took but never acknowledged
- Three crash tests in Postman: crash before sending, crash after sending (sent twice), slow but alive (sent twice)
- Idempotency: making the work safe to repeat; discussion notes in the PDF
- Animation: the three crash cases

## class-67-redis-atomic-updates-distributed-locks
- Single-threaded Redis: each command is atomic, but `GET` then `SET` can still lose an update, so use `INCR` (`single-threaded-talk.txt`)
- Distributed locks in redis-cli, across `replica1.txt`, `replica2.txt`, `watcher.txt`, `race.txt`: `SET … NX EX`, expiry, releasing only your own lock with `EVAL`, a final booked-key guard, several seats, and 10 clients racing
- Animations: atomic updates, and the seat lock from a Java lock to a Redis lock

## class-68-circuit-breaker
- Why a circuit breaker: a hanging service makes its callers wait until they run out of threads (cascading failure)
- It lives in the caller; the three states: CLOSED (call), OPEN (fail fast with a fallback), HALF-OPEN (a few trial calls)
- Animation: 8 steps, including slow calls and retry + breaker, with every `application.properties` setting explained

## class-69-circuit-breaker-code
- The code for class 68: `order-service` calls `payment-service` through Resilience4j `@CircuitBreaker` and `@Retry`
- `payment-service` has a `/chaos` switch to make it healthy, failing or slow; `/breaker` and the actuator show the state
- Postman collection for every case, tested end to end; `application.properties` is grouped by test

## class-70-client-server-communication
- Two animation pages using a Swiggy example: HTTP/1.1 → 2 → 3 (one lost packet freezing everything vs one file) and HTTPS (the café Wi-Fi snoop)
- Server → client: short polling, long polling, SSE, WebSocket and WebRTC, each with "used for"
- DevTools demo: the Protocol column shows `h3` / `h2` / `http/1.1`

## class-71-sse-websocket-webrtc
- `sse-demo/` (port 8080): the customer calls `GET /events` once, the rider calls `POST /send`; Postman collection included
- `websocket-demo/` (port 8081): customer and rider both connect to `/chat` and talk both ways
- Animations: TCP vs UDP and HTTP versions, SSE vs WebSocket, and WebRTC (STUN, signaling, direct call, TURN)
- `teaching-notes.txt`: what to say and what to click, for both demos

## class-72-whatsapp-1
- WhatsApp system design notes (handwritten PDFs from class and an earlier session)

## class-73-whatsapp-2
- Two animation pages: requirements → core entities → why WebSocket → APIs → data model (DynamoDB tables, the GSI, one transaction)
- Then one chat server: the connection map and how many connections fit, sending a message, an offline device, and the ✓ / ✓✓ / blue ticks
- Ends with the question for the next class: what happens with many chat servers

