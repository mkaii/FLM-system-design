we modified the code in the following way :
- made packages
- made abstract classes in the spot folder so that we can abstract out common logic in all the spots and called it CommonSpot.
- made the state inside the spot proetcted as it was also common and defaulted with available.


problems with our current design
- BUG : SpotFactory returns the same cached spot instance per size (registry, not a real factory) -> duplicate spots in a floor are actually one object
- PricingStrategyFactory keyed by SpotSize, not vehicle type -> conflates spot tier with pricing tier
- no thread safety: ParkingLot singleton lazy-init not synchronized
- race condition: isAvailable() check + assign() are separate steps -> two threads can grab same spot
- state methods fail silently: releasing an already-available spot, or assigning an already-occupied spot, just prints a message and does nothing (no exception).
  so if unPark() is accidentally called twice on the same ticket, the 2nd call has no way of knowing it failed -> it recalculates a fee and charges the customer again
- TicketManager.getAllTicketHistory() leaks the internal mutable list
- TicketManager.allTickets field is package-private, not private
- tight coupling to the singleton: SpotFinder calls ParkingLot.getInstance() directly instead of being handed the lot in its constructor.
  this hides the dependency (you can't tell what SpotFinder needs just by looking at its constructor), makes it impossible to test SpotFinder
  with a fake/mock lot, and rules out ever having 2 separate parking lots in the same app (e.g. 2 branches)
- Ticket has no unique id; IVehicle has no plate/VIN -> can't look up ticket or distinguish vehicles independently of object reference
