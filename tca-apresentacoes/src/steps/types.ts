import type { ProjectForm } from '../types';
import type { Errors } from '../state/validation';

export interface StepProps {
  form: ProjectForm;
  update: (patch: Partial<ProjectForm>) => void;
  errors: Errors;
}
