import Heading from '@/components/heading';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable } from '@tanstack/react-table';
import { ArrowUpDown, EllipsisVertical, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type Employee = {
    id: number;
    name: string;
    phone: string;
    email: string;
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Medewerkers', href: '/medewerkers' }];

export default function Index() {
    const page = usePage();
    const { employees: initialEmployees } = usePage().props as unknown as { employees: Employee[] };
    const [employees] = useState(initialEmployees);
    const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
    const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

    function deleteEmployee(id: number) {
        router.delete(route('employees.destroy', id), {
            preserveState: false,
            preserveScroll: false,
            onSuccess: () => {
                setEmployeeToDelete(null);
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                toast.success(page.props.flash.success);
            },
            onError: () => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                toast.error(page.props.flash.errors);
            },
        });
    }

    const columns: ColumnDef<Employee>[] = [
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <Button variant="ghost" className="p-0!" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Naam <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span>{row.original.name}</span>,
        },
        {
            accessorKey: 'email',
            header: 'E-mailadres',
            cell: ({ row }) => <span>{row.original.email}</span>,
        },
        {
            accessorKey: 'phone',
            header: 'Telefoon',
            cell: ({ row }) => <span>{row.original.phone}</span>,
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => {
                const employee = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <EllipsisVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel className="text-xs text-muted-foreground">Acties</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => router.visit(route('employees.edit', employee.id))}>Bewerken</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEmployeeToDelete(employee)}>Verwijderen</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const table = useReactTable({
        data: employees,
        columns,
        state: { sorting, pagination },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: false,
        pageCount: Math.ceil(employees.length / pagination.pageSize),
    });

    const renderPaginationText = () => {
        const { pageIndex, pageSize } = table.getState().pagination;
        const total = table.getFilteredRowModel().rows.length;
        const start = total === 0 ? 0 : pageIndex * pageSize + 1;
        const end = Math.min((pageIndex + 1) * pageSize, total);
        return `Toont ${start} - ${end} van ${total} resultaten`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Medewerkers" />
            <div className="p-6">
                <div className="flex justify-between">
                    <Heading title="Medewerkers" description="Beheer en voeg nieuwe medewerkers toe" />
                    <Link href={route('employees.create')}>
                        <Button>
                            <Plus />
                            Medewerker aanmaken
                        </Button>
                    </Link>
                </div>

                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id}>
                                {hg.headers.map((header) => (
                                    <TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="py-6 text-center text-muted-foreground">
                                    Nog geen medewerkers beschikbaar.{' '}
                                    <TextLink href={route('employees.create')} className="ml-1 text-sm">
                                        Klik hier om er een toe te voegen.
                                    </TextLink>
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className={cell.column.id === 'actions' ? 'text-right' : ''}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">{renderPaginationText()}</div>
                    <div className="space-x-2">
                        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                            Vorige
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                            Volgende
                        </Button>
                    </div>
                </div>
            </div>

            <Dialog open={!!employeeToDelete} onOpenChange={(open) => !open && setEmployeeToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Medewerker verwijderen</DialogTitle>
                        <DialogDescription>
                            Weet je zeker dat je deze medewerker wilt verwijderen? Deze actie kan niet ongedaan gemaakt worden.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setEmployeeToDelete(null)}>
                            Annuleren
                        </Button>
                        <Button variant="destructive" onClick={() => employeeToDelete && deleteEmployee(employeeToDelete.id)}>
                            Verwijderen
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
