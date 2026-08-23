import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  NewTeamMemberInput,
  TeamMembersQuery,
  TeamMembersResponse,
} from '@/lib/team-types';

const TEAM_MEMBERS_KEY = 'team-members';

async function fetchTeamMembers(
  query: TeamMembersQuery,
): Promise<TeamMembersResponse> {
  const params = new URLSearchParams({
    department: query.department,
    sortKey: query.sortKey,
    sortDirection: query.sortDirection,
    page: String(query.page),
    pageSize: String(query.pageSize),
  });

  const response = await fetch(`/api/team-members?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to load team members.');
  }

  return response.json();
}

// Shared by both the shadcn/ui and MUI demos on purpose — the data-fetching
// layer doesn't belong to either UI library, so there's no reason to write
// it twice.
export function useTeamMembers(query: TeamMembersQuery) {
  return useQuery({
    queryKey: [TEAM_MEMBERS_KEY, query],
    queryFn: () => fetchTeamMembers(query),
    placeholderData: (previous) => previous,
  });
}

async function postTeamMember(input: NewTeamMemberInput) {
  const response = await fetch('/api/team-members', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error('Failed to add team member.');
  }

  return response.json();
}

export function useAddTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_MEMBERS_KEY] });
    },
  });
}
