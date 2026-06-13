import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { getDb } from '#/db/client';
import {
  createCareer,
  type CreateCareerInput,
  listCareers,
} from '#/modules/career/api/careers';

export const careerQueries = {
  all: () => ['careers'] as const,
  list: () =>
    queryOptions({
      queryFn: async () => listCareers(await getDb()),
      queryKey: [...careerQueries.lists()],
    }),
  lists: () => [...careerQueries.all(), 'list'] as const,
};

export function useCareers() {
  return useQuery(careerQueries.list());
}

export function useCreateCareer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateCareerInput) =>
      createCareer(await getDb(), input),
    onSuccess: () => qc.invalidateQueries({ queryKey: careerQueries.all() }),
  });
}
