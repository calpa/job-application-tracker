export type WorkStyle = 'onsite' | 'remote' | 'hybrid';

export type JobInfo = {
  id?: string;
  company?: string;
  position?: string;
  workStyle?: WorkStyle;
  description?: string;
  appliedAt?: string;
};
