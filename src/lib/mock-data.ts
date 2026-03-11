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
  expected_working_days: number;
  payable_working_days: number;
  paid_leave_days: number;
  unpaid_leave_days: number;
  gross_salary: number;
  deductions: number;
  net_salary: number;
  status: PayrollStatus;
  breakdown: {
    basic: number;
    hra: number;
    allowances: number;
    pf_contribution: number;
    tax: number;
    other_deductions: number;
  };
}

export interface Payslip {
  id: string;
  employee_id: string;
  cycle_id: string;
  month: string;
  year: number;
  generated_at: string;
}

export const EMPLOYEES: Employee[] = [
  { id: 'EMP001', name: 'John Doe', department: 'Engineering', designation: 'Senior Engineer', salary_basis: 'MONTHLY', base_salary: 85000 },
  { id: 'EMP002', name: 'Jane Smith', department: 'Human Resources', designation: 'HR Manager', salary_basis: 'MONTHLY', base_salary: 72000 },
  { id: 'EMP003', name: 'Robert Johnson', department: 'Finance', designation: 'Accountant', salary_basis: 'MONTHLY', base_salary: 65000 },
  { id: 'EMP004', name: 'Emily Davis', department: 'Marketing', designation: 'Creative Lead', salary_basis: 'MONTHLY', base_salary: 68000 },
  { id: 'EMP005', name: 'Michael Brown', department: 'Engineering', designation: 'Fullstack Developer', salary_basis: 'MONTHLY', base_salary: 78000 },
];

export const PAYROLL_CYCLES: PayrollCycle[] = [
  {
    id: 'C001',
    month: 'January',
    year: 2024,
    status: 'LOCKED',
    cutoff_date: '2024-01-25',
    start_date: '2023-12-26',
    end_date: '2024-01-25',
    total_gross: 368000,
    total_deductions: 55200,
    total_net: 312800,
    employee_count: 5,
  },
  {
    id: 'C002',
    month: 'February',
    year: 2024,
    status: 'FINALIZED',
    cutoff_date: '2024-02-25',
    start_date: '2024-01-26',
    end_date: '2024-02-25',
    total_gross: 368000,
    total_deductions: 55200,
    total_net: 312800,
    employee_count: 5,
  },
  {
    id: 'C003',
    month: 'March',
    year: 2024,
    status: 'DRAFT',
    cutoff_date: '2024-03-25',
    start_date: '2024-02-26',
    end_date: '2024-03-25',
    employee_count: 5,
  },
  {
    id: 'C004',
    month: 'April',
    year: 2024,
    status: 'OPEN',
    cutoff_date: '2024-04-25',
    start_date: '2024-03-26',
    end_date: '2024-04-25',
  },
];

export const generateRunsForCycle = (cycleId: string): PayrollRun[] => {
  return EMPLOYEES.map((emp) => {
    const gross = emp.base_salary;
    const deductions = Math.floor(gross * 0.15);
    return {
      id: `RUN-${cycleId}-${emp.id}`,
      cycle_id: cycleId,
      employee_id: emp.id,
      employee_name: emp.name,
      department: emp.department,
      expected_working_days: 22,
      payable_working_days: 21.5,
      paid_leave_days: 1.5,
      unpaid_leave_days: 0.5,
      gross_salary: gross,
      deductions: deductions,
      net_salary: gross - deductions,
      status: 'DRAFT',
      breakdown: {
        basic: Math.floor(gross * 0.5),
        hra: Math.floor(gross * 0.3),
        allowances: Math.floor(gross * 0.2),
        pf_contribution: Math.floor(deductions * 0.6),
        tax: Math.floor(deductions * 0.3),
        other_deductions: Math.floor(deductions * 0.1),
      },
    };
  });
};