import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { T__1, T__2, UserProfile, NewOrderRequest, T } from '../backend';

// ── Services ────────────────────────────────────────────────────────────────

export function useServices() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<T__1[]>({
    queryKey: ['services'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listServices();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 5 * 60 * 1000,
  });
}

// ── Balance ──────────────────────────────────────────────────────────────────

export function useBalance() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<bigint>({
    queryKey: ['balance', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getBalance();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

// ── Orders ───────────────────────────────────────────────────────────────────

export function useOrdersByUser() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<T__2[]>({
    queryKey: ['orders', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.listOrdersByUser(identity.getPrincipal());
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation<bigint, Error, NewOrderRequest>({
    mutationFn: async (newOrder: NewOrderRequest) => {
      if (!actor) throw new Error('Actor not available');
      return actor.placeOrder(newOrder);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['balance', identity?.getPrincipal().toString()] });
    },
  });
}

// ── User Profile ─────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
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
  const { identity } = useInternetIdentity();

  return useMutation<void, Error, UserProfile>({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['currentUserProfile', identity?.getPrincipal().toString()],
      });
    },
  });
}
