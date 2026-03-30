import { useQuery } from '@tanstack/react-query';
import { proyectosApi } from '../services/api';

export function useProyectos() {
  return useQuery({
    queryKey: ['proyectos'],
    queryFn: proyectosApi.list,
  });
}

/** Returns the first active project (the main one for this app). */
export function useProyectoActivo() {
  const query = useProyectos();
  return {
    ...query,
    proyecto: query.data?.[0] ?? null,
    proyectoId: query.data?.[0]?.id ?? '',
  };
}
