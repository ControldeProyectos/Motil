import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { restriccionesApi } from '../services/api';
import type { RestriccionInput } from '../services/api';

export function useRestricciones(proyectoId: string) {
  return useQuery({
    queryKey: ['restricciones', proyectoId],
    queryFn: () => restriccionesApi.list(proyectoId),
    enabled: !!proyectoId,
  });
}

export function useCreateRestriccion(proyectoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RestriccionInput) => restriccionesApi.create(proyectoId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['restricciones', proyectoId] }),
  });
}

export function useUpdateRestriccion(proyectoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RestriccionInput> }) =>
      restriccionesApi.update(proyectoId, id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['restricciones', proyectoId] }),
  });
}

export function useDeleteRestriccion(proyectoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => restriccionesApi.remove(proyectoId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['restricciones', proyectoId] }),
  });
}
