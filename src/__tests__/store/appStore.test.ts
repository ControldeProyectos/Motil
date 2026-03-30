import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../../store/appStore';

// Resetea el store antes de cada test para evitar contaminación
beforeEach(() => {
  useAppStore.setState({
    suministros:   [],
    restricciones: [],
    diasAlerta:    15,
  });
  localStorage.clear();
});

const suministroBase = {
  descripcion:    'Transformador 138/33kV',
  proveedor:      'Siemens',
  fechaNecesaria: '2026-06-01',
  fechaLlegada:   '2026-05-20',
  leadTimeDias:   90,
  estado:         'EN_PROCESO' as const,
  obs:            '',
};

const restriccionBase = {
  descripcion:   'Falta de planos IFC para cimentaciones',
  responsable:   'Ing. Diseño',
  fechaAtencion: '2026-04-01',
  tipo:          'CRITICA' as const,
  estado:        'ABIERTA' as const,
  obs:           '',
};

describe('Suministros', () => {
  it('addSuministro agrega con id único', () => {
    useAppStore.getState().addSuministro(suministroBase);
    const { suministros } = useAppStore.getState();
    expect(suministros).toHaveLength(1);
    expect(suministros[0].id).toBeDefined();
    expect(suministros[0].descripcion).toBe(suministroBase.descripcion);
  });

  it('deleteSuministro elimina por id', () => {
    useAppStore.getState().addSuministro(suministroBase);
    const id = useAppStore.getState().suministros[0].id;
    useAppStore.getState().deleteSuministro(id);
    expect(useAppStore.getState().suministros).toHaveLength(0);
  });

  it('deleteSuministro con id inexistente no altera el estado', () => {
    useAppStore.getState().addSuministro(suministroBase);
    useAppStore.getState().deleteSuministro('id-que-no-existe');
    expect(useAppStore.getState().suministros).toHaveLength(1);
  });
});

describe('Restricciones', () => {
  it('addRestriccion agrega con id único', () => {
    useAppStore.getState().addRestriccion(restriccionBase);
    const { restricciones } = useAppStore.getState();
    expect(restricciones).toHaveLength(1);
    expect(restricciones[0].tipo).toBe('CRITICA');
  });

  it('updateRestriccionEstado cambia el estado correctamente', () => {
    useAppStore.getState().addRestriccion(restriccionBase);
    const id = useAppStore.getState().restricciones[0].id;
    useAppStore.getState().updateRestriccionEstado(id, 'CERRADA');
    expect(useAppStore.getState().restricciones[0].estado).toBe('CERRADA');
  });

  it('deleteRestriccion elimina por id', () => {
    useAppStore.getState().addRestriccion(restriccionBase);
    const id = useAppStore.getState().restricciones[0].id;
    useAppStore.getState().deleteRestriccion(id);
    expect(useAppStore.getState().restricciones).toHaveLength(0);
  });
});

describe('Configuración', () => {
  it('setDiasAlerta actualiza el valor', () => {
    useAppStore.getState().setDiasAlerta(30);
    expect(useAppStore.getState().diasAlerta).toBe(30);
  });
});

describe('getStatsRestricciones', () => {
  it('calcula correctamente las estadísticas', () => {
    useAppStore.getState().addRestriccion({ ...restriccionBase, tipo: 'CRITICA',    estado: 'ABIERTA'    });
    useAppStore.getState().addRestriccion({ ...restriccionBase, tipo: 'NO_CRITICA', estado: 'ABIERTA'    });
    useAppStore.getState().addRestriccion({ ...restriccionBase, tipo: 'CRITICA',    estado: 'CERRADA'    });

    const stats = useAppStore.getState().getStatsRestricciones();
    expect(stats.criticasAbiertas).toBe(1);
    expect(stats.noCriticasAbiertas).toBe(1);
    expect(stats.cerradas).toBe(1);
    expect(stats.total).toBe(3);
  });
});
