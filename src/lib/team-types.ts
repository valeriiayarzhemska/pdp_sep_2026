import { z } from 'zod';

export const DEPARTMENTS = [
  'Engineering',
  'Design',
  'Product',
  'Marketing',
  'Sales',
  'Support',
] as const;
export type Department = (typeof DEPARTMENTS)[number];

export const MEMBER_STATUSES = ['active', 'invited', 'suspended'] as const;
export type MemberStatus = (typeof MEMBER_STATUSES)[number];

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: Department;
  status: MemberStatus;
  joinDate: string;
};

export type SortKey = 'name' | 'department' | 'joinDate';
export type SortDirection = 'asc' | 'desc';

export type TeamMembersQuery = {
  department: Department | 'all';
  sortKey: SortKey;
  sortDirection: SortDirection;
  page: number;
  pageSize: number;
};

export type TeamMembersResponse = {
  items: TeamMember[];
  totalCount: number;
};

// Shared by both library demos, and reused server-side in the route handler —
// the same schema validates the form on the client and the payload on the
// server, which is the point: the validation *logic* doesn't belong to
// either UI library.
export const newTeamMemberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Enter a valid work email.'),
  department: z.enum(DEPARTMENTS, 'Choose a department.'),
  role: z.string().min(2, 'Role must be at least 2 characters.'),
  joinDate: z.date('Choose a join date.'),
});

export type NewTeamMemberInput = z.infer<typeof newTeamMemberSchema>;
