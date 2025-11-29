export type WorkStyle = 'onsite' | 'remote' | 'hybrid';

export type JobInfo = {
  company?: string;
  position?: string;
  workStyle?: WorkStyle;
};
