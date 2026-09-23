# Movie Ticket Booking System — LLD Project Specification

## Objective

Build a Movie Ticket Booking System as an LLD + Java machine-coding project.

The main goal is to practice:

- Object-oriented design
- SOLID principles
- Design patterns where they are actually useful
- Clean separation of responsibilities
- Thread safety
- Concurrent seat booking
- Extensible pricing
- Seat state management
- REST API design

Spring Boot is only the API/web layer. Core business logic should primarily be plain Java.

## Spring Boot Constraint

Use Spring Boot mainly for:

- Starting the application
- REST controllers
- Request/response handling

Do not make the domain/business logic dependent on Spring.

Avoid unnecessary use of:

- `@Service`
- `@Component`
- `@Autowired`
- Lombok
- Spring Data
- Hibernate-specific behavior
- Framework magic

Prefer constructor-based dependency passing and ordinary Java classes.

The project should be understandable and testable without Spring.

---

# Problem Statement

Design and implement a movie ticket booking system similar to BookMyShow.

Users should be able to:

1. Browse movies.
2. Browse theatres and screens.
3. View shows for a movie.
4. View seats for a particular show.
5. Select seats.
6. Temporarily lock selected seats.
7. Complete payment.
8. Confirm a booking.

The system must guarantee that two users cannot successfully book the same seat for the same show, even when they attempt to book it concurrently.

Example:

Two users attempt to book seat A10 for Show 101 at the same time.

Only one booking may succeed.

---

# Domain Model

## Movie

Represents a movie.

Possible fields:

- id
- name
- duration
- language
- genre

---

## Theatre

A theatre can contain multiple screens.

Possible fields:

- id
- name
- location
- screens

Example:

PVR:

- Screen 1
- Screen 2
- Screen 3

---

## Screen

A screen belongs to a theatre and contains physical seats.

Possible fields:

- id
- name
- seats

A screen can have multiple shows throughout the day, but only one show can occupy that screen at a particular time.

Example:

- 3:00 PM → Avengers
- 7:00 PM → Batman
- 10:00 PM → Superman

---

## Seat

A Seat represents a physical seat belonging to a Screen.

Possible fields:

- id
- seatNumber
- seatType

Seat types may include:

- REGULAR
- PREMIUM
- RECLINER

Important:

Do NOT store show-specific availability directly in `Seat`.

The physical seat A1 remains the same seat regardless of which movie is playing.

---

# Show

A Show connects:

- Movie
- Screen
- Start time
- End time

Example:

Show 101:

- Movie = Avengers
- Screen = Screen 1
- Start = 3:00 PM
- End = 6:00 PM

Show 102 can use the same Screen 1 later:

- Movie = Batman
- Screen = Screen 1
- Start = 7:00 PM
- End = 9:30 PM

A Show represents one movie playing on one screen at one point in time.

---

# ShowSeat

`ShowSeat` is the association between a particular `Show` and a physical `Seat`.

This is one of the most important concepts in the project.

A physical Seat does not have a universal booking status.

For example:

For Show 101:

- A1 = BOOKED
- A2 = AVAILABLE
- A3 = LOCKED

For Show 102:

- A1 = AVAILABLE
- A2 = BOOKED
- A3 = AVAILABLE

The physical A1 is the same seat.

Therefore show-specific state belongs to `ShowSeat`.

Conceptually:

`ShowSeat = Show + Seat + show-specific state`

Possible fields:

- show
- seat
- status
- lockedBy
- lockedUntil

Possible status values:

- AVAILABLE
- LOCKED
- BOOKED

---



# Seat Data Structures

The project should deliberately separate **physical seat storage**, **ShowSeat lookup**, and **concurrency locking**.

## Physical Seats on a Screen

A `Screen` contains the physical seats that actually exist on that screen.

Use a collection such as:

```java
class Screen {
    private List<Seat> seats;
}
```

Example:

```text
Screen 1
├── A1
├── A2
├── A3
├── B1
├── B2
└── B3
```

These are physical seats. Their existence does not depend on a particular show.

A `Seat` should contain information such as:

```text
id
seatNumber
seatType
```

Do not store show-specific availability in `Seat`.

---

## ShowSeats

Each `Show` needs ShowSeat objects representing the state of each physical seat for that particular show.

A useful structure is:

```java
class Show {
    private Map<Integer, ShowSeat> showSeats;
}
```

where the key is the physical `seatId`.

For example:

```text
Show 101
├── 1 → ShowSeat(A1)
├── 2 → ShowSeat(A2)
├── 3 → ShowSeat(A3)
└── ...
```

This makes operations such as:

```text
get ShowSeat for seat A10
```

efficient.

The `ShowSeat` contains:

```text
Seat
Show
Current SeatState
Lock information
```

The exact representation can be refined during implementation.

---

## ConcurrentHashMap Is Not the Seat Store

Do NOT automatically use:

```java
ConcurrentHashMap<Integer, ShowSeat>
```

just because multiple users can book seats concurrently.

The data structure used to represent seats and the data structure used for concurrency control are separate concerns.

The initial design should distinguish:

```text
Screen
  |
  +-- List<Seat>
       Physical seats


Show
  |
  +-- Map<SeatId, ShowSeat>
       Show-specific seat state


SeatLockManager
  |
  +-- ConcurrentHashMap<ShowSeatKey, Lock>
       Concurrency control
```

---

## Seat Lock Registry

The `SeatLockManager` should maintain a thread-safe registry of locks.

For example:

```java
class SeatLockManager {

    private ConcurrentHashMap<String, Lock> locks;
}
```

A key can uniquely identify a ShowSeat:

```text
SHOW_101_SEAT_10
```

Example:

```text
SHOW_101_SEAT_10 → Lock
SHOW_101_SEAT_11 → Lock
SHOW_101_SEAT_12 → Lock
```

The `ConcurrentHashMap` safely manages this lock registry when multiple threads access it.

The actual `Lock` protects the critical section for a specific ShowSeat.

---

## Why Separate These Structures?

The responsibilities are different:

### `List<Seat>`

Represents:

> What physical seats exist on this screen?

### `Map<SeatId, ShowSeat>`

Represents:

> What is the state of this physical seat for this particular show?

### `ConcurrentHashMap<ShowSeatKey, Lock>`

Represents:

> Which lock protects concurrent operations on this particular ShowSeat?

Do not combine these responsibilities into one data structure.

---

## Example

Suppose Screen 1 has:

```text
A1
A2
A3
```

The screen can contain:

```java
List<Seat> seats;
```

For Show 101:

```text
A1 → AVAILABLE
A2 → BOOKED
A3 → LOCKED
```

For Show 102:

```text
A1 → BOOKED
A2 → AVAILABLE
A3 → AVAILABLE
```

Therefore:

```text
Seat A1
    ↓
same physical object

Show 101 + A1
    ↓
ShowSeat
    ↓
AVAILABLE

Show 102 + A1
    ↓
ShowSeat
    ↓
BOOKED
```

And independently:

```text
SHOW_101_A1 → Lock
SHOW_102_A1 → Lock
```

These are different locks because they represent different ShowSeats.

---

# Recommended Initial Data Model

Use the following conceptual structure:

```text
Theatre
  |
  +-- Screen
       |
       +-- List<Seat>
            |
            +-- Seat A1
            +-- Seat A2
            +-- Seat A3


Show
  |
  +-- Movie
  +-- Screen
  +-- Map<SeatId, ShowSeat>
                    |
                    +-- ShowSeat(A1)
                    +-- ShowSeat(A2)
                    +-- ShowSeat(A3)


SeatLockManager
  |
  +-- ConcurrentHashMap<ShowSeatKey, Lock>
```

The implementation should preserve this separation unless a later design decision provides a strong reason to change it.

# Booking

A Booking represents a user's reservation of one or more ShowSeats for a particular show.

Possible fields:

- id
- user
- showSeats
- status
- totalAmount
- createdAt

Possible booking statuses:

- PENDING
- CONFIRMED
- CANCELLED
- EXPIRED

A Booking should reference ShowSeat(s), rather than independently storing a Seat and Show combination, because ShowSeat already represents that relationship.

---

# User

Represents the customer making a booking.

Possible fields:

- id
- name
- email

Authentication is out of scope.

---

# Payment

Payment represents payment for a booking.

Possible fields:

- id
- booking
- amount
- status

Possible statuses:

- INITIATED
- SUCCESS
- FAILED

For the initial implementation, payment can be mocked.

---

# Booking Flow

The expected flow is:

1. User selects a movie.
2. User selects a show.
3. User views ShowSeats.
4. User selects one or more available seats.
5. Selected ShowSeats are temporarily locked.
6. User makes payment.
7. If payment succeeds, ShowSeats become BOOKED.
8. Booking becomes CONFIRMED.
9. If payment fails, ShowSeats become AVAILABLE.
10. If the lock expires before payment, ShowSeats become AVAILABLE.

---

# Seat Locking

Seats should not become permanently BOOKED immediately after selection.

Instead:

AVAILABLE → LOCKED

The lock should have a configurable duration, for example 5 minutes.

If payment succeeds:

LOCKED → BOOKED

If payment fails:

LOCKED → AVAILABLE

If the lock expires:

LOCKED → AVAILABLE

The lock duration should not be hardcoded throughout the system.

---

# Seat State — State Pattern Required

The project must use the **State Pattern** for seat state management.

This is an explicit learning requirement of the project.

Do NOT replace the State Pattern with only an enum.

The seat lifecycle should be modeled using state objects such as:

```text
SeatState
    |
    +-- AvailableState
    +-- LockedState
    +-- BookedState
```

The context should delegate state-dependent operations to the current state.

For example:

```java
interface SeatState {

    void lock(ShowSeat showSeat, User user);

    void book(ShowSeat showSeat);

    void release(ShowSeat showSeat);
}
```

The exact method names may be refined during implementation.

Expected transitions:

```text
AVAILABLE → LOCKED
LOCKED → BOOKED
LOCKED → AVAILABLE
```

Invalid transitions should be rejected by the current state.

For example:

```text
BOOKED → LOCKED
BOOKED → AVAILABLE
AVAILABLE → BOOKED
```

should not be allowed through normal operations.

`ShowSeat` should act as the context and maintain its current `SeatState`.

The implementation should demonstrate why the State Pattern is useful: behavior and valid transitions depend on the current state, and state-specific rules should not be scattered across large `if/else` or `switch` blocks.

The State Pattern is a required part of this project, not an optional future refactoring.

---

# Pricing

Pricing should be extensible.

Do not create a large chain of `if/else` statements for pricing rules.

Introduce:

```java
interface PricingStrategy {
    double calculatePrice(ShowSeat showSeat, Show show);
}
```

Possible implementations:

- RegularPricingStrategy
- WeekendPricingStrategy
- HolidayPricingStrategy

Pricing can depend on:

- Seat type
- Day of week
- Holiday
- Show timing
- Other future pricing rules

Initial example:

- REGULAR = ₹200
- PREMIUM = ₹300
- RECLINER = ₹500

Strategy Pattern should be used because pricing rules are expected to vary independently from booking logic.

---

# Payment Strategy

Payment can also be abstracted:

```java
interface PaymentStrategy {
    PaymentResult pay(double amount);
}
```

Possible implementations:

- MockPaymentStrategy
- CardPaymentStrategy
- UPIPaymentStrategy

For the first version, use a mock implementation.

---

# Repository Layer

Use repository interfaces to keep persistence separate from business logic.

Examples:

```java
interface MovieRepository
interface ShowRepository
interface BookingRepository
```

Initially use in-memory implementations.

Examples:

- InMemoryMovieRepository
- InMemoryShowRepository
- InMemoryBookingRepository

A real database is not required for the first version.

---

# Concurrency Requirement

This is a critical part of the project.

Consider Show 101 and Seat A10.

Initial state:

`A10 = AVAILABLE`

Two users attempt to book A10 simultaneously.

Without synchronization:

1. Thread A checks A10 → AVAILABLE.
2. Thread B checks A10 → AVAILABLE.
3. Thread A books A10.
4. Thread B books A10.

This creates a double booking.

The system must guarantee:

`Successful bookings for the same ShowSeat = at most 1`

---

# Fine-Grained Locking

Do not synchronize the entire BookingService.

A global lock would unnecessarily block unrelated bookings.

Example:

User A wants A1.

User B wants A2.

These operations should be able to proceed concurrently.

Use a lock per ShowSeat.

A possible approach:

```java
ConcurrentHashMap<String, Lock>
```

where the key could be:

```text
SHOW_101_A10
```

Conceptually:

```text
SHOW_101_A10 → Lock
SHOW_101_A11 → Lock
SHOW_101_A12 → Lock
```

The `ConcurrentHashMap` is used as a thread-safe registry for the locks.

It does NOT itself prevent double booking.

The Lock protects the critical section.

The following operations must happen atomically within the lock:

1. Check ShowSeat status.
2. Verify that it is AVAILABLE.
3. Change its state.
4. Persist/update the booking state.

Use `ReentrantLock` or another appropriate Java locking mechanism.

---

# Important ConcurrentHashMap Clarification

Do not treat `ConcurrentHashMap` as simply:

"HashMap where every method is synchronized."

That is not its purpose.

`ConcurrentHashMap` is designed to support concurrent access without serializing every operation behind one global lock.

For this project, its important role is safely maintaining the collection of per-ShowSeat locks.

The actual lock prevents two threads from simultaneously modifying the same ShowSeat.

---

# Single JVM vs Multiple JVM

The first implementation only needs to solve concurrency inside one Spring Boot JVM.

Use:

- ConcurrentHashMap
- ReentrantLock

Later, the design should be able to explain what changes when there are multiple application instances.

Example:

Instance 1 → User A → A10

Instance 2 → User B → A10

An in-memory Java Lock cannot coordinate across JVMs.

Possible production approaches include:

- Database locking
- Atomic database updates
- Database constraints
- Redis distributed locking

Do NOT implement Redis in the initial project.

This is primarily an LLD exercise.

---

# REST APIs

Spring Boot should expose REST APIs after the core domain/business logic is implemented.

Suggested APIs:

```text
GET /movies
GET /movies/{movieId}/shows
GET /shows/{showId}/seats

POST /bookings/lock
POST /bookings/{bookingId}/pay
POST /bookings/{bookingId}/confirm

GET /bookings/{bookingId}
```

Example:

```http
GET /shows/101/seats
```

should return the ShowSeats and their current status.

Example response:

```json
[
  {
    "seatNumber": "A1",
    "type": "REGULAR",
    "status": "AVAILABLE"
  },
  {
    "seatNumber": "A2",
    "type": "PREMIUM",
    "status": "BOOKED"
  }
]
```

---

# Error Cases

The system should handle:

## Seat already booked

Reject the booking attempt.

## Seat already locked

Reject the booking attempt if another user owns the lock.

## Lock expired

The seat should become available.

## Payment failure

Release the locked seats.

## Invalid state transition

Prevent invalid transitions such as:

BOOKED → AVAILABLE

through normal booking operations.

---

# Testing Requirements

Create unit tests for:

## Basic booking

Available seat → Lock → Payment Success → Confirmed Booking.

## Multiple seats

A user can book multiple seats in one booking.

## Already booked seat

Attempting to book an already booked seat should fail.

## Already locked seat

Attempting to book a seat locked by another user should fail.

## Payment failure

Payment failure should release locked seats.

## Lock expiry

An expired lock should make the seat available again.

---

# Critical Concurrency Test

Create a test where many threads attempt to book the same ShowSeat simultaneously.

Example:

```text
100 threads
    ↓
Show 101 + Seat A10
```

Expected:

```text
Successful bookings = 1
Failed attempts = 99
```

Never allow:

```text
Successful bookings > 1
```

This test is a key requirement of the project.

---

# Development Plan

Implement incrementally.

Do not generate the entire project in one shot.

## Phase 1 — Domain Model

Implement:

- Movie
- Theatre
- Screen
- Seat
- Show
- ShowSeat
- User
- Booking
- Payment

Focus on relationships and responsibilities.

Do not add Spring Boot yet.

---

## Phase 2 — Repositories

Create repository interfaces and simple in-memory implementations.

---

## Phase 3 — Basic Services

Implement:

- MovieService
- ShowService
- BookingService
- PaymentService

Keep business logic in plain Java.

---

## Phase 4 — Pricing Strategy

Introduce:

- PricingStrategy
- RegularPricingStrategy
- WeekendPricingStrategy

Make BookingService depend on the abstraction rather than concrete pricing implementations.

---

## Phase 5 — Seat State

Implement:

- AVAILABLE
- LOCKED
- BOOKED

Enforce valid transitions.

Start with an enum.

Introduce State Pattern only if the design genuinely benefits from it.

---

## Phase 6 — Temporary Seat Locking

Create a SeatLockManager abstraction.

Possible operations:

```text
lock()
release()
isLocked()
```

Implement lock expiry.

The lock duration should be configurable.

---

## Phase 7 — Thread Safety

Implement per-ShowSeat locking using:

- ConcurrentHashMap
- ReentrantLock

Ensure check-and-update happens inside the same critical section.

---

## Phase 8 — Concurrent Tests

Create tests with multiple threads trying to book the same ShowSeat.

Verify that exactly one booking succeeds.

---

## Phase 9 — Spring Boot APIs

Only after the core Java implementation works.

Create controllers for:

- Movies
- Shows
- Seats
- Bookings
- Payments

Controllers should remain thin.

---

## Phase 10 — Design Review

Review the final implementation for:

- SOLID
- DRY
- Encapsulation
- Composition vs inheritance
- Dependency inversion
- Separation of concerns
- Thread safety
- Extensibility
- Error handling
- Appropriate use of design patterns

---

# Suggested Package Structure

```text
movie-booking/
|
├── controller/
|
├── domain/
|
├── service/
|
├── repository/
|
├── pricing/
|
├── payment/
|
├── locking/
|
├── state/
|
├── exception/
|
└── test/
```

The exact package structure can be changed if a better design emerges.

---

# Design Principles

Prefer:

- Small classes with clear responsibilities
- Interfaces where behavior is expected to vary
- Composition over unnecessary inheritance
- Constructor-based dependency passing
- Explicit business rules
- Testable plain Java code

Avoid:

- God classes
- Giant service classes
- Deep inheritance hierarchies
- Excessive design patterns
- Framework-dependent domain logic
- Unnecessary abstractions
- Premature database/distributed-system complexity

---

# Interview Perspective

The implementation should be explainable as a 45–60 minute LLD interview.

The important discussion areas are:

1. Why is Show separate from Movie and Screen?
2. Why does ShowSeat exist?
3. Why is availability stored on ShowSeat instead of Seat?
4. How does pricing remain extensible?
5. Why use Strategy Pattern?
6. When would State Pattern be useful?
7. How do we prevent double booking?
8. Why use per-seat locking instead of a global lock?
9. What role does ConcurrentHashMap play?
10. What happens if payment fails?
11. What happens when a seat lock expires?
12. What changes when there are multiple Spring Boot instances?
13. How would database locking or Redis change the design?

---

# Definition of Done

The project is complete when:

- Movies can be represented and retrieved.
- Theatres and screens can be represented.
- Screens contain physical seats.
- Shows connect movies to screens and times.
- ShowSeat represents a seat's state for a particular show.
- Users can view available seats.
- Users can lock seats.
- Locks expire.
- Successful payment converts locked seats into booked seats.
- Failed payment releases seats.
- Pricing uses Strategy Pattern.
- Concurrent booking is thread-safe.
- The same ShowSeat cannot be successfully booked by two threads.
- Spring Boot exposes REST APIs.
- Core business logic is not dependent on Spring.
- Unit tests cover the core functionality.
- Concurrent tests verify the double-booking scenario.
- The design can be explained clearly in an LLD interview.

---

# Final Instruction to the Coding Agent

Build this project incrementally.

Do not generate the entire application immediately.

Start with Phase 1: Domain Model.

Before writing code, explain the proposed domain classes, their relationships, and why each class exists.

The State Pattern must be included in the design and implementation when the seat state model is introduced.

Then implement Phase 1.

After each phase, run the relevant tests and verify the design before proceeding.

The goal is not merely to produce a working application. The goal is to produce a clean, interview-quality LLD implementation using simple Java, appropriate design principles, and carefully justified design patterns.
