import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { suministrosApi } from '../services/api';
import type { SuministroInput } from '../services/api';

export function useSuministros(proyectoId: string) {
  return useQuery({
    queryKey: ['suministros', proyectoId],
    queryFn: () => suministrosApi.list(proyectoId),
    enabled: !!proyectoId,
  });
}

export function useCreateSuministro(proyectoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SuministroInput) => suministrosApi.create(proyectoId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suministros', proyectoId] }),
  });
}

export function useUpdateSuministro(proyectoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SuministroInput> }) =>
      suministrosApi.update(proyectoId, id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suministros', proyectoId] }),
  });
}

export function useDeleteSuministro(proyectoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => suministrosApi.remove(proyectoId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suministros', proyectoId] }),
  });
}
