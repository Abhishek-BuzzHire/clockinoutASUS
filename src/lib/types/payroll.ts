export type PayrollStatus = 'OPEN' | 'DRAFT' | 'FINALIZED' | 'LOCKED';

export interface Employee {
  id: string;
  name: string;
  department: string;
  designation: string;
  salary_basis: 'MONTHLY' | 'DAILY' | 'HOURLY';
  base_salary: number;
}

export interface PayrollCycle {
  id: string;
  month: string;
  year: number;
  status: PayrollStatus;
  cutoff_date: string;
  start_date: string;
  end_date: string;
  total_gross?: number;
  total_deductions?: number;
  total_net?: number;
  employee_count?: number;
}

export interface PayrollRun {
  id: string;
  cycle_id: string;
  employee_id: string;
  employee_name: string;
  department: string;
  designation: string;
  expected_hours: number;
  payable_hours: number;
  unpaid_hours: number;
  paid_leave_dates: string[];
  unpaid_leave_dates: string[];
  absent_dates: string[];
  gross_salary: number;
  deductions: number;
  net_salary: number;
  status: PayrollStatus;
  missing_punch_dates: string[];
}

export interface Payslip {
  id: string;
  employee_id: string;
  cycle_id: string;
  month: string;
  year: number;
  generated_at: string;
}