import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { createCareerFn } from '#/modules/career/api/create-career';
import { listCareersFn } from '#/modules/career/api/list-careers';
import { type CreateCareerInput } from '#/modules/career/schemas/careers';

export const careerQueries = {
  all: () => ['careers'] as const,
  list: () =>
    queryOptions({
      queryFn: () => listCareersFn(),
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
    mutationFn: (input: CreateCareerInput) => createCareerFn({ data: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: careerQueries.all() }),
  });
}
