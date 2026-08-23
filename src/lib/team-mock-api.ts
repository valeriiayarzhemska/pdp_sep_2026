import {
  DEPARTMENTS,
  type Department,
  type NewTeamMemberInput,
  type TeamMember,
  type TeamMembersQuery,
  type TeamMembersResponse,
} from './team-types';

const FIRST_NAMES = [
  'Ava',
  'Liam',
  'Noah',
  'Emma',
  'Mia',
  'Ethan',
  'Olivia',
  'Lucas',
  'Sofia',
  'Mateo',
  'Ivy',
  'Kai',
  'Nora',
  'Leo',
  'Zara',
  'Finn',
  'Aria',
  'Theo',
  'Luna',
  'Owen',
  'Maya',
  'Elias',
  'Rosa',
  'Dario',
];

const LAST_NAMES = [
  'Bennett',
  'Kowalski',
  'Nakamura',
  'Alvarez',
  'Petrov',
  'Kim',
  'Dubois',
  'Okafor',
  'Silva',
  'Novak',
  'Larsen',
  'Haddad',
  'Costa',
  'Fischer',
  'Moreau',
  'Ivanov',
  'Park',
  'Bianchi',
  'Mercer',
  'Sato',
  'Rossi',
  'Wagner',
  'Reyes',
  'Lindqvist',
];

const ROLES_BY_DEPARTMENT: Record<Department, string[]> = {
  Engineering: [
    'Frontend Engineer',
    'Backend Engineer',
    'Platform Engineer',
    'QA Engineer',
  ],
  Design: ['Product Designer', 'UX Researcher', 'Design Systems Lead'],
  Product: ['Product Manager', 'Product Analyst'],
  Marketing: ['Content Strategist', 'Growth Marketer'],
  Sales: ['Account Executive', 'Sales Development Rep'],
  Support: ['Support Engineer', 'Customer Success Manager'],
};

function hashString(value: string): number {
  let hash = 0;

  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }

  return Math.abs(hash);
}

function statusFor(index: number): MemberStatusInternal {
  if (index % 11 === 0) {
    return 'suspended';
  }

  if (index % 5 === 0) {
    return 'invited';
  }

  return 'active';
}

type MemberStatusInternal = TeamMember['status'];

function generateMembers(): TeamMember[] {
  return FIRST_NAMES.map((firstName, i) => {
    const lastName = LAST_NAMES[i % LAST_NAMES.length];
    const department = DEPARTMENTS[i % DEPARTMENTS.length];
    const roles = ROLES_BY_DEPARTMENT[department];
    const role = roles[i % roles.length];
    const id = `member-${i + 1}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
    const joinOffset = hashString(id) % 900;
    const joinDate = new Date(2023, 0, 1 + joinOffset)
      .toISOString()
      .slice(0, 10);

    return {
      id,
      name: `${firstName} ${lastName}`,
      email,
      role,
      department,
      status: statusFor(i),
      joinDate,
    };
  });
}

const globalForTeam = globalThis as unknown as { teamMembers?: TeamMember[] };

function getStore(): TeamMember[] {
  if (!globalForTeam.teamMembers) {
    globalForTeam.teamMembers = generateMembers();
  }

  return globalForTeam.teamMembers;
}

export function queryTeamMembers(query: TeamMembersQuery): TeamMembersResponse {
  const store = getStore();
  const filtered =
    query.department === 'all'
      ? store
      : store.filter((member) => member.department === query.department);

  const direction = query.sortDirection === 'asc' ? 1 : -1;
  const sorted = [...filtered].sort(
    (a, b) => a[query.sortKey].localeCompare(b[query.sortKey]) * direction,
  );

  const start = (query.page - 1) * query.pageSize;
  const items = sorted.slice(start, start + query.pageSize);

  return { items, totalCount: sorted.length };
}

export function addTeamMember(input: NewTeamMemberInput): TeamMember {
  const store = getStore();
  const member: TeamMember = {
    id: `member-${store.length + 1}-${Date.now()}`,
    name: input.name,
    email: input.email,
    role: input.role,
    department: input.department,
    status: 'invited',
    joinDate: input.joinDate.toISOString().slice(0, 10),
  };

  store.unshift(member);

  return member;
}
