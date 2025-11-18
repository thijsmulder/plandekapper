import Heading from '@/components/heading';
import TextLink from '@/components/text-link';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable } from '@tanstack/react-table';
import { ArrowUpDown, EllipsisVertical, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type Client = {
    id: number;
    name: string;
    phone: string;
    email: string;
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Klanten', href: '/klanten' }];

export default function Index() {
    const { clients: initialClients } = usePage().props as unknown as { clients: Client[] };
    const [clients, setClients] = useState(initialClients);
    const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

    async function deleteClient(id: number) {
        router.delete(route('clients.destroy', id), {
            preserveScroll: true,
            onSuccess: () => {
                setClients((prev) => prev.filter((c) => c.id !== id));
                setClientToDelete(null);
            },
            onError: () => toast.error('Er is iets misgegaan bij het verwijderen'),
        });
    }

    const columns: ColumnDef<Client>[] = [
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
            id: 'actions',
            header: '',
            cell: ({ row }) => {
                const client = row.original;
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
                            <DropdownMenuItem onClick={() => router.visit(route('clients.edit', client.id))}>Bewerken</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setClientToDelete(client)}>Verwijderen</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const table = useReactTable({
        data: clients,
        columns,
        state: { sorting, pagination },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: false,
        pageCount: Math.ceil(clients.length / pagination.pageSize),
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
            <Head title="Klanten" />
            <div className="p-6">
                <div className="flex justify-between">
                    <Heading title="Klanten" description="Beheer en voeg nieuwe klanten toe" />
                    <Link href={route('clients.create')}>
                        <Button>
                            <Plus />
                            Klant aanmaken
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
                                    Nog geen klanten beschikbaar.{' '}
                                    <TextLink href={route('clients.create')} className="ml-1 text-sm">
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

            <AlertDialog open={!!clientToDelete} onOpenChange={(open) => !open && setClientToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Klant verwijderen</AlertDialogTitle>
                        <AlertDialogDescription>
                            Weet je zeker dat je <strong>{clientToDelete?.name}</strong> wilt verwijderen? Deze actie kan niet ongedaan gemaakt
                            worden.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuleren</AlertDialogCancel>
                        <AlertDialogAction onClick={() => clientToDelete && deleteClient(clientToDelete.id)}>Verwijderen</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
