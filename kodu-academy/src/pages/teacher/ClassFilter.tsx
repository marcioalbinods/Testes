import type { ClassRow } from '../../services/types';

export function ClassFilter({ classes, value, onChange, id = 'filtro-turma' }: { classes: ClassRow[]; value: string; onChange: (v: string) => void; id?: string }) {
  return (
    <div className="field">
      <label htmlFor={id}>Turma</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Todas as turmas</option>
        {classes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
            {c.archived ? ' (arquivada)' : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
