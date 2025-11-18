import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';

type Client = {
    id: number;
    name: string;
    email: string | null;
};

type Props = {
    client?: Client | null;
};

const InputError = ({ message }: { message?: string }) => (message ? <p className="text-sm text-red-600">{message}</p> : null);

const InputGroup = ({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) => (
    <div className="grid gap-2">
        <Label htmlFor={id}>{label}</Label>
        {children}
        <InputError message={error} />
    </div>
);

export default function Edit({ client }: Props) {
    const isEdit = Boolean(client);

    const { data, setData, post, put, processing, errors } = useForm({
        name: client?.name ?? '',
        email: client?.email ?? '',
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        (isEdit ? put : post)(route(isEdit ? 'clients.update' : 'clients.store', client?.id), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Klanten', href: route('clients.index') },
                { title: isEdit ? 'Bewerken' : 'Aanmaken', href: '' },
            ]}
        >
            <Head title={`Klant ${isEdit ? 'bewerken' : 'aanmaken'}`} />

            <form onSubmit={onSubmit} className="p-6">
                <div className="flex justify-between">
                    <Heading
                        title={`Klant ${isEdit ? 'bewerken' : 'aanmaken'}`}
                        description={isEdit ? 'Pas hier de klantgegevens aan' : 'Voer gegevens in om een klant toe te voegen'}
                    />
                    <Link href={route('clients.index')}>
                        <Button variant="outline" type="button">
                            Terug naar overzicht
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <Card className="h-fit lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Klantgegevens</CardTitle>
                            <CardDescription>Voer hier de gegevens van de klant in</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <InputGroup id="name" label="Naam" error={errors.name}>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    disabled={processing}
                                    required
                                />
                            </InputGroup>

                            <InputGroup id="email" label="E-mailadres" error={errors.email}>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email ?? ''}
                                    onChange={(e) => setData('email', e.target.value)}
                                    disabled={processing}
                                />
                            </InputGroup>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-6 flex gap-2">
                    <Link href={route('clients.index')}>
                        <Button variant="outline" type="button">
                            Annuleren
                        </Button>
                    </Link>
                    <Button type="submit" disabled={processing}>
                        {isEdit ? 'Wijzigingen opslaan' : 'Klant aanmaken'}
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}
