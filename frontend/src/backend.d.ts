import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface NewOrderRequest {
    service: bigint;
    link: string;
    quantity: bigint;
}
export type Time = bigint;
export interface T__2 {
    id: bigint;
    service: bigint;
    status: T;
    link: string;
    createdAt: Time;
    user: Principal;
    totalCost: bigint;
    quantity: bigint;
}
export interface T__1 {
    id: bigint;
    minOrder: bigint;
    name: string;
    pricePer1000: number;
    description: string;
    category: Category;
    maxOrder: bigint;
}
export interface TopUpInitiation {
    redirectUrl: string;
    amount: bigint;
}
export interface UserProfile {
    name: string;
    email: string;
}
export enum Category {
    tiktok = "tiktok",
    instagram = "instagram",
    twitterX = "twitterX",
    facebook = "facebook",
    youtube = "youtube",
    telegram = "telegram"
}
export enum T {
    canceled = "canceled",
    pending = "pending",
    completed = "completed",
    refunded = "refunded",
    processing = "processing",
    failed = "failed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    /**
     * / Add funds to a user&apos;s balance. Admin only.
     */
    addBalance(user: Principal, amount: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Get the caller&apos;s current balance. Requires user role.
     */
    getBalance(): Promise<bigint>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Get a specific order by ID. Only the order owner or an admin can view it.
     */
    getOrderById(orderId: bigint): Promise<T__2>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initiateTopUp(request: TopUpInitiation): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / List all orders for a given user. Only the user themselves or an admin can list orders.
     */
    listOrdersByUser(user: Principal): Promise<Array<T__2>>;
    /**
     * / List all available SMM services. Public - no auth required.
     */
    listServices(): Promise<Array<T__1>>;
    /**
     * / Place a new SMM order. Requires user role.
     */
    placeOrder(newOrder: NewOrderRequest): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    /**
     * / Update an order&apos;s status. Admin only.
     */
    updateOrderStatus(orderId: bigint, status: T): Promise<void>;
    updateServicePrice(serviceId: bigint, newPrice: number): Promise<void>;
}
