export const EMPLOYMENT_TYPES = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "CONTRACTOR", label: "Contractor" },
];

export const ROLES = [
  { value: "OWNER", label: "Owner" },
  { value: "ADMIN", label: "Administrator" },
  { value: "HR", label: "HR Manager" },
  { value: "MANAGER", label: "Manager" },
  { value: "EMPLOYEE", label: "Employee" },
];

export const TIMESHEET_STATUSES = [
  { value: "DRAFT", label: "Draft", color: "gray" },
  { value: "SUBMITTED", label: "Submitted", color: "blue" },
  { value: "APPROVED", label: "Approved", color: "green" },
  { value: "REJECTED", label: "Rejected", color: "red" },
];

export const LEAVE_STATUSES = [
  { value: "DRAFT", label: "Draft", color: "gray" },
  { value: "SUBMITTED", label: "Pending", color: "yellow" },
  { value: "APPROVED", label: "Approved", color: "green" },
  { value: "REJECTED", label: "Rejected", color: "red" },
  { value: "CANCELLED", label: "Cancelled", color: "gray" },
];

export const PAYROLL_STATUSES = [
  { value: "DRAFT", label: "Draft", color: "gray" },
  { value: "SUBMITTED", label: "Calculated", color: "blue" },
  { value: "APPROVED", label: "Approved", color: "green" },
  { value: "REJECTED", label: "Paid", color: "purple" },
];

export const PAY_ITEM_TYPES = [
  { value: "EARNING", label: "Earning", color: "green" },
  { value: "DEDUCTION", label: "Deduction", color: "red" },
  { value: "CONTRIBUTION", label: "Contribution", color: "blue" },
];

export const LEAVE_UNITS = [
  { value: "DAYS", label: "Days" },
  { value: "HOURS", label: "Hours" },
];

export const SALARY_PERIODS = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
];

export const COUNTRIES = [
  { value: "TN", label: "Tunisia", currency: "TND" },
  { value: "FR", label: "France", currency: "EUR" },
  { value: "DE", label: "Germany", currency: "EUR" },
  { value: "US", label: "United States", currency: "USD" },
  { value: "GB", label: "United Kingdom", currency: "GBP" },
];

export const TIMEZONES = [
  { value: "Africa/Tunis", label: "Tunisia (UTC+1)" },
  { value: "Europe/Paris", label: "Paris (UTC+1)" },
  { value: "Europe/Berlin", label: "Berlin (UTC+1)" },
  { value: "America/New_York", label: "New York (UTC-5)" },
  { value: "Europe/London", label: "London (UTC+0)" },
];

export const DAYS_OF_WEEK = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 0, label: "Sunday" },
];

export const DEFAULT_LEAVE_POLICIES = [
  {
    code: "ANNUAL",
    name: "Annual Leave",
    unit: "DAYS" as const,
    accrualRule: JSON.stringify({ type: "monthly", amount: 1.83 }),
    carryOverMax: 5,
  },
  {
    code: "SICK",
    name: "Sick Leave",
    unit: "DAYS" as const,
    accrualRule: JSON.stringify({ type: "monthly", amount: 1.0 }),
    carryOverMax: 0,
  },
  {
    code: "UNPAID",
    name: "Unpaid Leave",
    unit: "DAYS" as const,
    accrualRule: JSON.stringify({ type: "unlimited" }),
    carryOverMax: 0,
  },
];

export const DEFAULT_PAY_ITEMS = [
  {
    code: "BASE",
    name: "Base Salary",
    type: "EARNING" as const,
    formula: "baseSalary",
    taxable: true,
    recurring: true,
  },
  {
    code: "OVERTIME",
    name: "Overtime",
    type: "EARNING" as const,
    formula: "overtimeHours * hourlyRate * 1.25",
    taxable: true,
    recurring: false,
  },
  {
    code: "BONUS",
    name: "Bonus",
    type: "EARNING" as const,
    formula: "0",
    taxable: true,
    recurring: false,
  },
  {
    code: "TAX",
    name: "Income Tax",
    type: "DEDUCTION" as const,
    formula: "gross * 0.20",
    taxable: false,
    recurring: true,
  },
  {
    code: "SOCIAL",
    name: "Social Contribution",
    type: "CONTRIBUTION" as const,
    formula: "gross * 0.15",
    taxable: false,
    recurring: true,
  },
];
