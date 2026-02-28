import Array "mo:core/Array";
import Float "mo:core/Float";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";

actor {
  include MixinStorage();

  module Service {
    public type Category = {
      #instagram;
      #youtube;
      #tiktok;
      #facebook;
      #telegram;
      #twitterX;
    };

    public type T = {
      id : Nat;
      name : Text;
      category : Category;
      pricePer1000 : Float;
      minOrder : Nat;
      maxOrder : Nat;
      description : Text;
    };

    public func compare(service1 : T, service2 : T) : Order.Order {
      Text.compare(service1.name, service2.name);
    };
  };

  module OrderStatus {
    public type T = {
      #pending;
      #processing;
      #completed;
      #canceled;
      #refunded;
      #failed;
    };
  };

  module SmmOrder {
    public type T = {
      id : Nat;
      user : Principal;
      service : Nat;
      link : Text;
      quantity : Nat;
      totalCost : Nat;
      status : OrderStatus.T;
      createdAt : Time.Time;
    };

    public func compareByCreatedAt(o1 : T, o2 : T) : Order.Order {
      Int.compare(o2.createdAt, o1.createdAt); // Newest first
    };
  };

  // Shim to fill gap between core library and Nat library.
  module Float {
    public func toNat(x : Float) : Nat {
      (x.toInt()).toNat();
    };
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let services = Map.empty<Nat, Service.T>();
  let orders = Map.empty<Nat, SmmOrder.T>();
  let balances = Map.empty<Principal, Nat>();

  public type UserProfile = {
    name : Text;
    email : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Seed services on initialization
  do {
    let seededServices = [
      {
        id = 1;
        name = "Instagram Followers";
        category = #instagram;
        pricePer1000 = 1.5;
        minOrder = 10;
        maxOrder = 10000;
        description = "High quality followers with gradual delivery.";
      },
      {
        id = 2;
        name = "Instagram Likes";
        category = #instagram;
        pricePer1000 = 1.2;
        minOrder = 20;
        maxOrder = 15000;
        description = "Instant likes for your photos and videos.";
      },
      {
        id = 3;
        name = "Instagram Views";
        category = #instagram;
        pricePer1000 = 1.0;
        minOrder = 50;
        maxOrder = 20000;
        description = "Genuine views from active users.";
      },
      {
        id = 4;
        name = "Instagram Comments";
        category = #instagram;
        pricePer1000 = 2.5;
        minOrder = 30;
        maxOrder = 5000;
        description = "Real comments to boost engagement.";
      },
      {
        id = 5;
        name = "YouTube Subscribers";
        category = #youtube;
        pricePer1000 = 3.5;
        minOrder = 15;
        maxOrder = 8000;
        description = "Organic subscribers with no drop guarantee.";
      },
      {
        id = 6;
        name = "YouTube Views";
        category = #youtube;
        pricePer1000 = 1.8;
        minOrder = 100;
        maxOrder = 40000;
        description = "High retention views from global users.";
      },
      {
        id = 7;
        name = "YouTube Likes";
        category = #youtube;
        pricePer1000 = 1.6;
        minOrder = 25;
        maxOrder = 12000;
        description = "Fast likes to your videos.";
      },
      {
        id = 8;
        name = "Twitter/X Followers";
        category = #twitterX;
        pricePer1000 = 2.0;
        minOrder = 10;
        maxOrder = 7000;
        description = "Worldwide followers with steady delivery.";
      },
      {
        id = 9;
        name = "Twitter/X Retweets";
        category = #twitterX;
        pricePer1000 = 1.4;
        minOrder = 10;
        maxOrder = 8000;
        description = "Boost the reach of your tweets.";
      },
      {
        id = 10;
        name = "Twitter/X Likes";
        category = #twitterX;
        pricePer1000 = 1.1;
        minOrder = 20;
        maxOrder = 9000;
        description = "Instant likes from active accounts.";
      },
      {
        id = 11;
        name = "TikTok Followers";
        category = #tiktok;
        pricePer1000 = 2.2;
        minOrder = 15;
        maxOrder = 15000;
        description = "Authentic followers with gradual delivery.";
      },
      {
        id = 12;
        name = "TikTok Likes";
        category = #tiktok;
        pricePer1000 = 0.9;
        minOrder = 30;
        maxOrder = 10000;
        description = "Fast and organic likes for your videos.";
      },
      {
        id = 13;
        name = "TikTok Views";
        category = #tiktok;
        pricePer1000 = 0.8;
        minOrder = 60;
        maxOrder = 22000;
        description = "Worldwide exposure for your content.";
      },
      {
        id = 14;
        name = "Facebook Page Likes";
        category = #facebook;
        pricePer1000 = 2.5;
        minOrder = 10;
        maxOrder = 5000;
        description = "Real page likes from active users.";
      },
      {
        id = 15;
        name = "Telegram Channel Members";
        category = #telegram;
        pricePer1000 = 1.8;
        minOrder = 20;
        maxOrder = 12000;
        description = "Increase your channel's reach.";
      },
      {
        id = 16;
        name = "Facebook Post Likes";
        category = #facebook;
        pricePer1000 = 1.3;
        minOrder = 20;
        maxOrder = 8000;
        description = "Boost engagement on your Facebook posts.";
      },
      {
        id = 17;
        name = "Telegram Post Views";
        category = #telegram;
        pricePer1000 = 0.7;
        minOrder = 50;
        maxOrder = 30000;
        description = "Increase visibility of your Telegram posts.";
      },
    ];

    let iter = seededServices.values();
    for (service in iter) {
      services.add(service.id, service);
    };
  };

  // ── User Profile Functions ──────────────────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ── Service Functions ───────────────────────────────────────────────────────

  /// List all available SMM services. Public - no auth required.
  public query func listServices() : async [Service.T] {
    services.values().toArray().sort();
  };

  public shared ({ caller }) func updateServicePrice(serviceId : Nat, newPrice : Float) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Only admins can update service prices");
    };

    let service = switch (services.get(serviceId)) {
      case (null) { Runtime.trap("Service not found") };
      case (?svc) { svc };
    };

    let updatedService = {
      id = service.id;
      name = service.name;
      category = service.category;
      pricePer1000 = newPrice;
      minOrder = service.minOrder;
      maxOrder = service.maxOrder;
      description = service.description;
    };

    services.add(serviceId, updatedService);
  };

  // ── Order Functions ─────────────────────────────────────────────────────────

  public type NewOrderRequest = {
    service : Nat;
    link : Text;
    quantity : Nat;
  };

  /// Place a new SMM order. Requires user role.
  public shared ({ caller }) func placeOrder(newOrder : NewOrderRequest) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place SMM orders");
    };

    let service = switch (services.get(newOrder.service)) {
      case (null) { Runtime.trap("Service not found") };
      case (?svc) { svc };
    };

    if (newOrder.quantity < service.minOrder or newOrder.quantity > service.maxOrder) {
      Runtime.trap(
        "Invalid order quantity. Accepted range: " # service.minOrder.toText() # " - " # service.maxOrder.toText()
      );
    };

    let currentBalance = switch (balances.get(caller)) {
      case (null) { 0 };
      case (?bal) { bal };
    };

    let totalCost = Float.toNat((newOrder.quantity.toFloat() * service.pricePer1000) / 1000.0);

    if (currentBalance < totalCost) {
      Runtime.trap("Insufficient balance. Top up your account.");
    };

    let orderId = orders.size() + 1;
    let now = Time.now();

    let newOrderEntry : SmmOrder.T = {
      id = orderId;
      user = caller;
      service = service.id;
      link = newOrder.link;
      quantity = newOrder.quantity;
      totalCost;
      status = #pending;
      createdAt = now;
    };

    orders.add(orderId, newOrderEntry);
    balances.add(caller, currentBalance - totalCost);

    orderId;
  };

  /// Get a specific order by ID. Only the order owner or an admin can view it.
  public query ({ caller }) func getOrderById(orderId : Nat) : async SmmOrder.T {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?o) { o };
    };
    if (order.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: You can only view your own orders");
    };
    order;
  };

  /// List all orders for a given user. Only the user themselves or an admin can list orders.
  public query ({ caller }) func listOrdersByUser(user : Principal) : async [SmmOrder.T] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list orders");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: You can only list your own orders");
    };
    let filtered = orders.values().toArray().filter(
      func(order : SmmOrder.T) : Bool {
        order.user == user;
      }
    );
    filtered.sort(SmmOrder.compareByCreatedAt);
  };

  // ── Balance Functions ───────────────────────────────────────────────────────

  /// Get the caller's current balance. Requires user role.
  public query ({ caller }) func getBalance() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check their balance");
    };
    switch (balances.get(caller)) {
      case (null) { 0 };
      case (?bal) { bal };
    };
  };

  /// Add funds to a user's balance. Admin only.
  public shared ({ caller }) func addBalance(user : Principal, amount : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add balance");
    };
    let current = switch (balances.get(user)) {
      case (null) { 0 };
      case (?bal) { bal };
    };
    balances.add(user, current + amount);
  };

  public shared ({ caller }) func addBalanceToUser(userId : Principal, amount : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add balance to user");
    };
    let currentBalance = switch (balances.get(userId)) {
      case (null) { 0 };
      case (?bal) { bal };
    };
    balances.add(userId, currentBalance + amount);
  };

  /// Update an order's status. Admin only.
  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : OrderStatus.T) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?o) { o };
    };
    let updated : SmmOrder.T = {
      id = order.id;
      user = order.user;
      service = order.service;
      link = order.link;
      quantity = order.quantity;
      totalCost = order.totalCost;
      status = status;
      createdAt = order.createdAt;
    };
    orders.add(orderId, updated);
  };

  // ── Top-up Functions ────────────────────────────────────────────────────────

  public type TopUpInitiation = {
    amount : Nat;
    redirectUrl : Text;
  };

  public shared ({ caller }) func initiateTopUp(request : TopUpInitiation) : async () {
    if (request.amount == 0) {
      Runtime.trap("Amount must be greater than zero");
    };
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can top up");
    };
  };
};
