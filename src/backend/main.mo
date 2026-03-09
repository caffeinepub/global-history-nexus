import Text "mo:core/Text";
import Float "mo:core/Float";
import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Order "mo:core/Order";

actor {
  // Data Types
  type KeyFigure = {
    name : Text;
    role : Text;
  };

  type HistoricalEvent = {
    id : Text;
    title : Text;
    year : Int;
    exactDate : ?Text;
    locationName : Text;
    latitude : Float;
    longitude : Float;
    region : Text;
    civilization : Text;
    category : Text;
    shortSummary : Text;
    fullDescription : Text;
    causes : [Text];
    consequences : [Text];
    keyFigures : [KeyFigure];
    relatedEventIds : [Text];
    sources : [Text];
  };

  module HistoricalEvent {
    public func compare(e1 : HistoricalEvent, e2 : HistoricalEvent) : Order.Order {
      Text.compare(e1.id, e2.id);
    };
  };

  // Stable Storage
  stable var eventsStable : [(Text, HistoricalEvent)] = [];

  // Persistent Map Storage
  var historicalEvents : Map.Map<Text, HistoricalEvent> = Map.empty<Text, HistoricalEvent>();

  // System Hooks
  system func preupgrade() {
    eventsStable := historicalEvents.toArray();
  };

  system func postupgrade() {
    historicalEvents := Map.fromIter<Text, HistoricalEvent>(eventsStable.vals());
  };

  // Queries
  public query ({ caller }) func getEventById(id : Text) : async ?HistoricalEvent {
    historicalEvents.get(id);
  };

  public query ({ caller }) func getEventsByYear(year : Int) : async [HistoricalEvent] {
    historicalEvents.values().toArray().filter(
      func(e) {
        e.year == year;
      }
    );
  };

  public query ({ caller }) func getEventsByRegion(region : Text) : async [HistoricalEvent] {
    historicalEvents.values().toArray().filter(
      func(e) {
        e.region == region;
      }
    );
  };

  public query ({ caller }) func getEventsByCategory(category : Text) : async [HistoricalEvent] {
    historicalEvents.values().toArray().filter(
      func(e) {
        e.category == category;
      }
    );
  };

  public query ({ caller }) func searchEvents(keyword : Text) : async [HistoricalEvent] {
    let searchText = keyword.trim(#char ' ').toLower();
    let filtered = historicalEvents.values().toArray().filter(
      func(e) {
        e.title.toLower().contains(#text(searchText)) or e.shortSummary.toLower().contains(#text(searchText));
      }
    );
    filtered;
  };

  public query ({ caller }) func getRelatedEvents(eventId : Text) : async [HistoricalEvent] {
    switch (historicalEvents.get(eventId)) {
      case (null) { [] };
      case (?event) {
        [];
      };
    };
  };

  public query ({ caller }) func getYearByRegion(year : Int) : async [(Text, [HistoricalEvent])] {
    let regions = ["Europe", "Asia", "Middle East", "India", "Americas", "Africa", "Global"];
    regions.map(
      func(region) {
        let events = historicalEvents.values().toArray().filter(
          func(e) {
            e.year == year and e.region == region;
          }
        );
        (region, events);
      }
    );
  };

  public query ({ caller }) func getAllYears() : async [Int] {
    let years = historicalEvents.values().toArray().map(
      func(e) { e.year }
    );
    years.sort();
  };

  public query ({ caller }) func getEventsByYearRange(startYear : Int, endYear : Int) : async [HistoricalEvent] {
    historicalEvents.values().toArray().filter(
      func(e) {
        e.year >= startYear and e.year <= endYear
      }
    );
  };

  // Admin Function: Add Event
  public shared ({ caller }) func addEvent(event : HistoricalEvent) : async Text {
    if (historicalEvents.containsKey(event.id)) {
      Runtime.trap("Event with this ID already exists");
    };
    historicalEvents.add(event.id, event);
    event.id;
  };
};

