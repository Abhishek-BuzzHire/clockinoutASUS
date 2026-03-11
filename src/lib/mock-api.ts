import { 
  PAYROLL_CYCLES, 
  PayrollCycle, 
  PayrollRun, 
  generateRunsForCycle,
  PayrollStatus 
} from './mock-data';

const API_BASE_URL = "https://mock-api.local/payroll";

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const payrollApi = {
  getCycles: async (): Promise<PayrollCycle[]> => {
    await delay(500);
    return [...PAYROLL_CYCLES].reverse();
  },

  getCycleById: async (id: string): Promise<PayrollCycle | undefined> => {
    await delay(300);
    return PAYROLL_CYCLES.find(c => c.id === id);
  },

  createCycle: async (data: { month: string; year: number; cutoff_date: string }): Promise<PayrollCycle> => {
    await delay(800);
    const newCycle: PayrollCycle = {
      id: `C00${PAYROLL_CYCLES.length + 1}`,
      ...data,
      status: 'OPEN',
      start_date: '2024-04-26', // Mock calc
      end_date: data.cutoff_date,
    };
    PAYROLL_CYCLES.push(newCycle);
    return newCycle;
  },

  generatePayroll: async (cycleId: string): Promise<void> => {
    await delay(2000);
    const cycle = PAYROLL_CYCLES.find(c => c.id === cycleId);
    if (cycle) {
      cycle.status = 'DRAFT';
    }
  },

  getPayrollRuns: async (cycleId: string): Promise<PayrollRun[]> => {
    await delay(600);
    return generateRunsForCycle(cycleId);
  },

  finalizePayroll: async (cycleId: string): Promise<void> => {
    await delay(1000);
    const cycle = PAYROLL_CYCLES.find(c => c.id === cycleId);
    if (cycle) {
      cycle.status = 'FINALIZED';
      cycle.total_gross = 368000;
      cycle.total_deductions = 55200;
      cycle.total_net = 312800;
      cycle.employee_count = 5;
    }
  },

  getPayslip: async (year: number, month: string, employeeId?: string): Promise<any> => {
    await delay(400);
    return {
      id: `PS-${year}-${month}-${employeeId || 'ME'}`,
      url: `/payslips/mock-pdf-url`,
    };
  }
};