import { NextRequest, NextResponse } from 'next/server';
import { addTeamMember, queryTeamMembers } from '@/lib/team-mock-api';
import {
  DEPARTMENTS,
  newTeamMemberSchema,
  type Department,
  type SortDirection,
  type SortKey,
  type TeamMembersResponse,
} from '@/lib/team-types';

function parseDepartment(raw: string | null): Department | 'all' {
  if (raw && (DEPARTMENTS as readonly string[]).includes(raw)) {
    return raw as Department;
  }

  return 'all';
}

function parseSortKey(raw: string | null): SortKey {
  if (raw === 'name' || raw === 'department' || raw === 'joinDate') {
    return raw;
  }

  return 'name';
}

function parseSortDirection(raw: string | null): SortDirection {
  if (raw === 'desc') {
    return 'desc';
  }

  return 'asc';
}

async function simulateLatency() {
  await new Promise((resolve) =>
    setTimeout(resolve, 400 + Math.random() * 300),
  );
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const department = parseDepartment(params.get('department'));
  const sortKey = parseSortKey(params.get('sortKey'));
  const sortDirection = parseSortDirection(params.get('sortDirection'));
  const page = Math.max(1, Number(params.get('page')) || 1);
  const pageSize = Math.min(
    20,
    Math.max(1, Number(params.get('pageSize')) || 6),
  );

  await simulateLatency();

  const response: TeamMembersResponse = queryTeamMembers({
    department,
    sortKey,
    sortDirection,
    page,
    pageSize,
  });

  return NextResponse.json(response);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = newTeamMemberSchema.safeParse({
    ...body,
    joinDate: body.joinDate ? new Date(body.joinDate) : undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  await simulateLatency();

  const member = addTeamMember(parsed.data);

  return NextResponse.json(member, { status: 201 });
}
