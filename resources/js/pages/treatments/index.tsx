import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
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

type Category = { id: number; name: string };
type Treatment = { id: number; name: string; duration_in_minutes: number; price: number; category?: Category | null };

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Behandelingen', href: '/behandelingen' }];

const categoryClasses: Record<number, string> = {
    1: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100',
    2: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    3: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100',
    4: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
};

export default function Index() {
    const { treatments: initialTreatments } = usePage().props as unknown as { treatments: Treatment[] };
    const [treatments] = useState(initialTreatments);
    const [sorting, setSorting] = useState<SortingState>([{ id: 'name', desc: false }]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });
    const [treatmentToDelete, setTreatmentToDelete] = useState<Treatment | null>(null);

    function deleteTreatment(id: number) {
        router.delete(route('treatments.destroy', id), {
            preserveState: false,
            preserveScroll: false,
            onSuccess: () => {
                setTreatmentToDelete(null);
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

    const columns: ColumnDef<Treatment>[] = [
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <Button variant="ghost" className="p-0!" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Naam <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <p>{row.original.name}</p>,
        },
        {
            accessorKey: 'price',
            header: 'Prijs',
            cell: ({ row }) => (
                <span>
                    €
                    {parseFloat(row.getValue('price')).toLocaleString('nl-NL', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                </span>
            ),
        },
        {
            accessorKey: 'duration_in_minutes',
            header: 'Duur',
            cell: ({ row }) => `${row.getValue('duration_in_minutes')} minuten`,
        },
        {
            accessorKey: 'category.name',
            header: 'Categorie',
            cell: ({ row }) => {
                const category = row.original.category;
                const className = category ? (categoryClasses[category.id] ?? categoryClasses[1]) : '';
                return (
                    <Badge className={className} variant="default">
                        {category?.name ?? '-'}
                    </Badge>
                );
            },
        },
        {
            id: 'actions',
            header: '',
            cell: ({ row }) => {
                const treatment = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-right">
                                <span className="sr-only">Open menu</span>
                                <EllipsisVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel className="text-xs text-muted-foreground">Acties</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => router.visit(route('treatments.edit', treatment.id))}>Bewerken</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTreatmentToDelete(treatment)}>Verwijderen</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const table = useReactTable({
        data: treatments,
        columns,
        state: { sorting, pagination },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: false,
        pageCount: Math.ceil(treatments.length / pagination.pageSize),
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
            <Head title="Behandelingen" />
            <div className="p-6">
                <div className="flex justify-between">
                    <Heading title="Behandelingen" description="Beheer en voeg nieuwe behandelingen toe" />
                    <Link href={route('treatments.create')}>
                        <Button>
                            <Plus />
                            Behandeling aanmaken
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
                        {table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} className={cell.column.id === 'actions' ? 'text-right' : ''}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center py-2 text-sm text-muted-foreground">{renderPaginationText()}</div>
                    <div className="flex items-center justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                            Vorige
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                            Volgende
                        </Button>
                    </div>
                </div>
            </div>

            <Dialog open={!!treatmentToDelete} onOpenChange={(open) => !open && setTreatmentToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Behandeling verwijderen</DialogTitle>
                        <DialogDescription>
                            Weet je zeker dat je deze behandeling wilt verwijderen? Deze actie kan niet ongedaan gemaakt worden.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setTreatmentToDelete(null)}>
                            Annuleren
                        </Button>
                        <Button variant="destructive" onClick={() => treatmentToDelete && deleteTreatment(treatmentToDelete.id)}>
                            Verwijderen
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
