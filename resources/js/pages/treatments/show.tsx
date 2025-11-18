import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

type Category = {
    id: number;
    name: string;
};

type Treatment = {
    id: number;
    name: string;
    duration_in_minutes: number;
    price: number;
    description: string;
    active: number;
    category?: Category | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Behandelingen', href: route('treatments.index') },
    { title: 'Bekijken', href: '' },
];

export default function Show({ treatment }: { treatment: Treatment }) {
    const categoryClasses: Record<number, string> = {
        1: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100',
        2: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
        3: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100',
        4: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    };

    const categoryBadgeClass =
        treatment.category?.id && categoryClasses[treatment.category.id]
            ? categoryClasses[treatment.category.id]
            : 'bg-muted text-muted-foreground';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Behandeling bekijken" />

            <div className="p-6">
                <div className="flex justify-between">
                    <Heading title="Behandeling bekijken" description="Details van deze behandeling" />
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href={route('treatments.index')}>Terug naar overzicht</Link>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Specificaties behandeling</CardTitle>
                            <CardDescription>Overzicht van details van deze behandeling</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <h3 className="font-medium text-foreground">Naam</h3>
                                        <p>{treatment.name}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="font-medium text-foreground">Prijs</h3>
                                        <p>
                                            €
                                            {parseFloat(String(treatment.price)).toLocaleString('nl-NL', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="font-medium text-foreground">Duur</h3>
                                        <p>{treatment.duration_in_minutes} minuten</p>
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="font-medium text-foreground">Categorie</h3>
                                        {treatment.category ? (
                                            <Badge className={categoryBadgeClass}>{treatment.category.name}</Badge>
                                        ) : (
                                            <span className="text-muted-foreground">Geen categorie gekoppeld</span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <h3 className="font-medium text-foreground">Beschrijving</h3>
                                    <p>{treatment.description}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Status</CardTitle>
                            <CardDescription>Informatie over status of gebruik</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            <div className="space-y-1">
                                <h3 className="font-medium text-foreground">Zichtbaar in telefoon-app</h3>
                                <p>{treatment.active === 1 ? 'Ja' : 'Nee'}</p>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </AppLayout>
    );
}

