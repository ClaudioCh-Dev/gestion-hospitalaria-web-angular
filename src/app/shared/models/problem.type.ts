export interface ProblemBaseDetail {
  type?: string;
  title?: string;
  status: number;
  detail?: string;
  instance?: string;
}

export interface ProblemDetailMicroservice extends ProblemBaseDetail {
  code?: string;
}