import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, T__1, T__2, NewOrderRequest, TopUpInitiation } from '../backend';
import { T as OrderStatus } from '../backend';
import type { Principal } from '@dfinity/principal';

// ── User Profile ─────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ── Services ─────────────────────────────────────────────────────────────────

export function useListServices() {
  const { actor, isFetching } = useActor();

  return useQuery<T__1[]>({
    queryKey: ['services'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listServices();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateServicePrice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serviceId, newPrice }: { serviceId: bigint; newPrice: number }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateServicePrice(serviceId, newPrice);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

// ── Orders ────────────────────────────────────────────────────────────────────

export function useListOrdersByUser() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<T__2[]>({
    queryKey: ['orders', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.listOrdersByUser(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (request: NewOrderRequest) => {
      if (!actor) throw new Error('Actor not available');
      return actor.placeOrder(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', identity?.getPrincipal().toString()] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
  });
}

// ── Balance ───────────────────────────────────────────────────────────────────

export function useGetBalance() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<bigint>({
    queryKey: ['balance', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getBalance();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

// ── Top-up ────────────────────────────────────────────────────────────────────

export function useInitiateTopUp() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (request: TopUpInitiation) => {
      if (!actor) throw new Error('Actor not available');
      return actor.initiateTopUp(request);
    },
  });
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['isAdmin', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useAllOrders() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<T__2[]>({
    queryKey: ['allOrders'],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.listOrdersByUser(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: bigint; status: OrderStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useAddBalance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, amount }: { user: Principal; amount: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addBalance(user, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
  });
}
