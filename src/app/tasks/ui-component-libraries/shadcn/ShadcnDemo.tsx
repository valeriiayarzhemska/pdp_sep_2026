'use client';

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, ChevronsUpDown } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { useAddTeamMember, useTeamMembers } from '../use-team-members';
import {
  DEPARTMENTS,
  newTeamMemberSchema,
  type Department,
  type NewTeamMemberInput,
  type SortKey,
} from '@/lib/team-types';

const PAGE_SIZE = 6;

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive'> =
  {
    active: 'default',
    invited: 'secondary',
    suspended: 'destructive',
  };

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-xs text-red-400">{message}</p>;
}

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button>Add team member</Button>} />

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add team member</DialogTitle>

          <DialogDescription>
            Fields are grouped by what they describe, and validated with the
            same Zod schema the API route re-checks server-side.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid gap-5">
          <fieldset className="grid gap-3">
            <legend className="text-xs font-semibold tracking-wide text-neutral-400 uppercase">
              Identity
            </legend>

            <div>
              <Label htmlFor="shadcn-name">Full name</Label>

              <Input
                id="shadcn-name"
                className="mt-1.5"
                {...register('name')}
              />

              <FieldError message={errors.name?.message} />
            </div>

            <div>
              <Label htmlFor="shadcn-email">Work email</Label>

              <Input
                id="shadcn-email"
                className="mt-1.5"
                {...register('email')}
              />

              <FieldError message={errors.email?.message} />
            </div>
          </fieldset>

          <fieldset className="grid gap-3">
            <legend className="text-xs font-semibold tracking-wide text-neutral-400 uppercase">
              Assignment
            </legend>

            <div>
              <Label htmlFor="shadcn-department">Department</Label>

              <Controller
                control={control}
                name="department"
                render={({ field }) => (
                  <Select
                    value={field.value ?? ''}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="shadcn-department"
                      className="mt-1.5 w-full"
                    >
                      <SelectValue placeholder="Choose a department" />
                    </SelectTrigger>

                    <SelectContent>
                      {DEPARTMENTS.map((department) => (
                        <SelectItem key={department} value={department}>
                          {department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />

              <FieldError message={errors.department?.message} />
            </div>

            <div>
              <Label htmlFor="shadcn-role">Role</Label>

              <Input
                id="shadcn-role"
                className="mt-1.5"
                {...register('role')}
              />

              <FieldError message={errors.role?.message} />
            </div>

            <div>
              <Label>Join date</Label>

              <Controller
                control={control}
                name="joinDate"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          variant="outline"
                          className="mt-1.5 w-full justify-start font-normal"
                        >
                          <CalendarIcon className="mr-2 size-4" />
                          {field.value
                            ? format(field.value, 'PPP')
                            : 'Pick a date'}
                        </Button>
                      }
                    />

                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />

              <FieldError message={errors.joinDate?.message} />
            </div>
          </fieldset>

          <DialogFooter>
            <Button type="submit" disabled={addMember.isPending}>
              {addMember.isPending && <Spinner className="mr-2 size-4" />}
              Add member
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ShadcnDemo() {
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

  return (
    <div className="grid gap-8">
      <section>
        <p className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
          Typography
        </p>

        <p className="mt-2 text-xs text-neutral-500">
          shadcn/ui doesn&apos;t ship a{' '}
          <code className="rounded bg-neutral-800 px-1 py-0.5">Typography</code>{' '}
          component — it documents a set of Tailwind class combinations for
          headings and body text instead, so this section is plain utility
          classes, not a component.
        </p>

        <div className="mt-3 rounded-lg border border-neutral-800 p-4">
          <h1 className="text-3xl font-bold text-neutral-50">Heading 1</h1>
         
          <h2 className="mt-2 text-2xl font-semibold text-neutral-100">
            Heading 2
          </h2>
        
          <p className="mt-2 text-lg text-neutral-200">
            Lead paragraph text, slightly larger than body copy.
          </p>
       
          <p className="mt-2 text-sm text-neutral-300">
            Regular body text, used for the bulk of on-page content.
          </p>
      
          <p className="mt-2 text-xs text-neutral-500">
            Muted caption text, for secondary metadata.
          </p>
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold tracking-wide text-neutral-500 uppercase">
            Select, table, pagination &amp; loading state
          </p>
        
          <AddMemberDialog />
        </div>

        <div className="mt-3 flex items-center gap-3">
          <Label htmlFor="shadcn-filter" className="text-sm text-neutral-400">
            Department
          </Label>
       
          <Select
            value={department}
            onValueChange={(value) => {
              setDepartment((value ?? 'all') as Department | 'all');
              setPage(1);
            }}
          >
            <SelectTrigger id="shadcn-filter" className="w-48">
              <SelectValue />
            </SelectTrigger>
        
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {DEPARTMENTS.map((dep) => (
                <SelectItem key={dep} value={dep}>
                  {dep}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        
          {isFetching && !isLoading && (
            <Spinner className="size-4 text-neutral-500" />
          )}
        </div>

        <div className="mt-3 overflow-hidden rounded-lg border border-neutral-800">
          <Table>
            <TableHeader>
              <TableRow>
                {(['name', 'department', 'joinDate'] as SortKey[]).map(
                  (key) => (
                    <TableHead key={key}>
                      <button
                        type="button"
                        onClick={() => toggleSort(key)}
                        className="flex items-center gap-1 font-medium hover:text-neutral-200"
                      >
                        {key === 'joinDate'
                          ? 'Joined'
                          : key[0].toUpperCase() + key.slice(1)}
                     
                        <ChevronsUpDown className="size-3" />
                   
                        {sortKey === key && (
                          <span className="text-xs text-neutral-500">
                            ({sortDirection})
                          </span>
                        )}
                      </button>
                    </TableHead>
                  ),
                )}
            
                <TableHead>Role</TableHead>
            
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
          
            <TableBody>
              {isLoading
                ? Array.from({ length: PAGE_SIZE }, (_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }, (__, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : data?.items.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium text-neutral-200">
                        {member.name}
                      </TableCell>
                    
                      <TableCell>{member.department}</TableCell>
                  
                      <TableCell>{member.joinDate}</TableCell>
                  
                      <TableCell>{member.role}</TableCell>
                  
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[member.status]}>
                          {member.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>

        <Pagination className="mt-3 justify-start">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.max(1, p - 1));
                }}
                className={
                  page === 1 ? 'pointer-events-none opacity-40' : undefined
                }
              />
            </PaginationItem>
          
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  isActive={p === page}
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(p);
                  }}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
           
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => Math.min(totalPages, p + 1));
                }}
                className={
                  page === totalPages
                    ? 'pointer-events-none opacity-40'
                    : undefined
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </section>
    </div>
  );
}
