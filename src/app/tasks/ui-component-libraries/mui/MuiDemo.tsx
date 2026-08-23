'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip, { type ChipProps } from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Paper from '@mui/material/Paper';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { useAddTeamMember, useTeamMembers } from '../use-team-members';
import {
  DEPARTMENTS,
  newTeamMemberSchema,
  type Department,
  type NewTeamMemberInput,
  type SortKey,
} from '@/lib/team-types';

const PAGE_SIZE = 6;

const STATUS_COLOR: Record<string, ChipProps['color']> = {
  active: 'success',
  invited: 'info',
  suspended: 'error',
};

function AddMemberDialog() {
  const [open, setOpen] = useState(false);
  const addMember = useAddTeamMember();
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewTeamMemberInput>({
    resolver: zodResolver(newTeamMemberSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    await addMember.mutateAsync(values);

    reset();
    setOpen(false);
  });

  return (
    <>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setOpen(true)}
      >
        Add team member
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Add team member</DialogTitle>

        <form onSubmit={onSubmit}>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Fields are grouped by what they describe, and validated with the
              same Zod schema the API route re-checks server-side.
            </DialogContentText>

            <Typography variant="overline" color="text.secondary" component="p">
              Identity
            </Typography>

            <Stack spacing={2} sx={{ mb: 3, mt: 1 }}>
              <TextField
                label="Full name"
                size="small"
                error={!!errors.name}
                helperText={errors.name?.message}
                {...register('name')}
              />

              <TextField
                label="Work email"
                size="small"
                error={!!errors.email}
                helperText={errors.email?.message}
                {...register('email')}
              />
            </Stack>

            <Typography variant="overline" color="text.secondary" component="p">
              Assignment
            </Typography>

            <Stack spacing={2} sx={{ mt: 1 }}>
              <Controller
                control={control}
                name="department"
                render={({ field }) => (
                  <FormControl size="small" error={!!errors.department}>
                    <InputLabel id="mui-department-label">
                      Department
                    </InputLabel>

                    <Select
                      labelId="mui-department-label"
                      label="Department"
                      value={field.value ?? ''}
                      onChange={field.onChange}
                    >
                      {DEPARTMENTS.map((department) => (
                        <MenuItem key={department} value={department}>
                          {department}
                        </MenuItem>
                      ))}
                    </Select>

                    {errors.department && (
                      <FormHelperText>
                        {errors.department.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />

              <TextField
                label="Role"
                size="small"
                error={!!errors.role}
                helperText={errors.role?.message}
                {...register('role')}
              />

              <Controller
                control={control}
                name="joinDate"
                render={({ field }) => (
                  <DatePicker
                    label="Join date"
                    value={field.value ?? null}
                    onChange={field.onChange}
                    slotProps={{
                      textField: {
                        size: 'small',
                        error: !!errors.joinDate,
                        helperText: errors.joinDate?.message,
                      },
                    }}
                  />
                )}
              />
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
           
            <Button
              type="submit"
              variant="contained"
              disabled={addMember.isPending}
              startIcon={
                addMember.isPending ? (
                  <CircularProgress size={16} color="inherit" />
                ) : undefined
              }
            >
              Add member
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}

export default function MuiDemo() {
  const [department, setDepartment] = useState<Department | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useTeamMembers({
    department,
    sortKey,
    sortDirection,
    page,
    pageSize: PAGE_SIZE,
  });

  const totalPages = data
    ? Math.max(1, Math.ceil(data.totalCount / PAGE_SIZE))
    : 1;

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }

    setPage(1);
  }

  function handleDepartmentFilterChange(
    event: SelectChangeEvent<Department | 'all'>,
  ) {
    setDepartment(event.target.value as Department | 'all');
    setPage(1);
  }

  return (
    <Stack spacing={5}>
      <Box>
        <Typography variant="overline" color="text.secondary">
          Typography
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          MUI ships an actual <code>Typography</code> component — variant names
          (h1…h6, body1/2, caption, overline) map to design tokens defined on
          the theme, unlike shadcn&apos;s raw utility classes.
        </Typography>

        <Paper variant="outlined" sx={{ mt: 1.5, p: 2 }}>
          <Typography variant="h4">Heading 1</Typography>

          <Typography variant="h5" sx={{ mt: 1 }}>
            Heading 2
          </Typography>

          <Typography variant="subtitle1" sx={{ mt: 1 }}>
            Lead paragraph text, slightly larger than body copy.
          </Typography>

          <Typography variant="body2" sx={{ mt: 1 }}>
            Regular body text, used for the bulk of on-page content.
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: 'block' }}
          >
            Muted caption text, for secondary metadata.
          </Typography>
        </Paper>
      </Box>

      <Box>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="overline" color="text.secondary">
            Select, table, pagination &amp; loading state
          </Typography>

          <AddMemberDialog />
        </Stack>

        <Stack
          direction="row"
          spacing={2}
          sx={{ mt: 1.5, alignItems: 'center' }}
        >
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="mui-filter-label">Department</InputLabel>

            <Select
              labelId="mui-filter-label"
              label="Department"
              value={department}
              onChange={handleDepartmentFilterChange}
            >
              <MenuItem value="all">All departments</MenuItem>

              {DEPARTMENTS.map((dep) => (
                <MenuItem key={dep} value={dep}>
                  {dep}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {isFetching && !isLoading && <CircularProgress size={18} />}
        </Stack>

        <TableContainer component={Paper} variant="outlined" sx={{ mt: 1.5 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {(['name', 'department', 'joinDate'] as SortKey[]).map(
                  (key) => (
                    <TableCell key={key}>
                      <TableSortLabel
                        active={sortKey === key}
                        direction={sortKey === key ? sortDirection : 'asc'}
                        onClick={() => toggleSort(key)}
                      >
                        {key === 'joinDate'
                          ? 'Joined'
                          : key[0].toUpperCase() + key.slice(1)}
                      </TableSortLabel>
                    </TableCell>
                  ),
                )}

                <TableCell>Role</TableCell>

                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading
                ? Array.from({ length: PAGE_SIZE }, (_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }, (__, j) => (
                        <TableCell key={j}>
                          <Skeleton variant="text" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : data?.items.map((member) => (
                    <TableRow key={member.id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {member.name}
                      </TableCell>

                      <TableCell>{member.department}</TableCell>

                      <TableCell>{member.joinDate}</TableCell>

                      <TableCell>{member.role}</TableCell>
                      
                      <TableCell>
                        <Chip
                          size="small"
                          label={member.status}
                          color={STATUS_COLOR[member.status]}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Pagination
          sx={{ mt: 1.5 }}
          count={totalPages}
          page={page}
          onChange={(_, value) => setPage(value)}
        />
      </Box>
    </Stack>
  );
}
