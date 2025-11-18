import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import MultiselectTreatments from '@/components/employees/multiselect-treatments';
import { Head, Link, useForm } from '@inertiajs/react';

type Employee = {
    id: number;
    first_name: string;
    infix?: string | null;
    last_name: string;
    phone?: string | null;
    email: string;
    active: boolean;
    treatment_ids: number[];
};

type Treatment = {
    id: number;
    name: string;
};

type Props = {
    employee?: Employee | null;
    treatments: Treatment[];
};

const InputError = ({ message }: { message?: string }) =>
    message ? <p className="text-sm text-red-600">{message}</p> : null;

const InputGroup = ({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) => (
    <div className="grid gap-2">
        <Label htmlFor={id}>{label}</Label>
        {children}
        <InputError message={error} />
    </div>
);

export default function Edit({ employee, treatments }: Props) {
    const isEdit = Boolean(employee);

    const { data, setData, post, put, processing, errors } = useForm({
        first_name: employee?.first_name ?? '',
        infix: employee?.infix ?? '',
        last_name: employee?.last_name ?? '',
        phone: employee?.phone ?? '',
        email: employee?.email ?? '',
        active: employee ? employee.active : true,
        treatment_ids: employee?.treatment_ids ?? [],
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        (isEdit ? put : post)(route(isEdit ? 'employees.update' : 'employees.store', employee?.id), {
            preserveScroll: true,
        });
    };

    const inputClass = (error?: string) => (error ? '' : '');

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Medewerkers', href: route('employees.index') },
                { title: isEdit ? 'Bewerken' : 'Aanmaken', href: '' },
            ]}
        >
            <Head title={`Medewerker ${isEdit ? 'bewerken' : 'aanmaken'}`} />

            <form onSubmit={onSubmit} className="p-6">
                <div className="flex justify-between">
                    <Heading
                        title={`Medewerker ${isEdit ? 'bewerken' : 'aanmaken'}`}
                        description={isEdit ? 'Pas hier de medewerker aan' : 'Voer gegevens in om een medewerker toe te voegen'}
                    />
                    <Link href={route('employees.index')}>
                        <Button variant="outline" type="button">
                            Terug naar overzicht
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <Card className="h-fit lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Persoonsgegevens</CardTitle>
                            <CardDescription>Voer hier de gegevens van de medewerker in</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <InputGroup id="first_name" label="Voornaam" error={errors.first_name}>
                                <Input
                                    id="first_name"
                                    type="text"
                                    value={data.first_name}
                                    onChange={(e) => setData('first_name', e.target.value)}
                                    className={inputClass(errors.first_name)}
                                    disabled={processing}
                                    required
                                />
                            </InputGroup>

                            <InputGroup id="infix" label="Tussenvoegsel" error={errors.infix}>
                                <Input
                                    id="infix"
                                    type="text"
                                    value={data.infix}
                                    onChange={(e) => setData('infix', e.target.value)}
                                    className={inputClass(errors.infix)}
                                    disabled={processing}
                                />
                            </InputGroup>

                            <InputGroup id="last_name" label="Achternaam" error={errors.last_name}>
                                <Input
                                    id="last_name"
                                    type="text"
                                    value={data.last_name}
                                    onChange={(e) => setData('last_name', e.target.value)}
                                    className={inputClass(errors.last_name)}
                                    disabled={processing}
                                    required
                                />
                            </InputGroup>

                            <InputGroup id="email" label="E-mailadres" error={errors.email}>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={inputClass(errors.email)}
                                    disabled={processing}
                                    required
                                />
                            </InputGroup>

                            <InputGroup id="phone" label="Telefoonnummer" error={errors.phone}>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className={inputClass(errors.phone)}
                                    disabled={processing}
                                />
                            </InputGroup>
                        </CardContent>
                    </Card>

                    <Card className="h-fit max-h-full">
                        <CardHeader>
                            <CardTitle>Behandelingen</CardTitle>
                            <CardDescription>Selecteer de behandelingen die deze medewerker kan uitvoeren</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <MultiselectTreatments
                                    selected={data.treatment_ids}
                                    onChange={(ids) => setData('treatment_ids', ids)}
                                    treatments={treatments}
                                />
                                <InputError message={errors.treatment_ids} />
                            </div>
                            <InputError message={errors.active} />
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-6 flex gap-2">
                    <Link href={route('employees.index')}>
                        <Button variant="outline" type="button">
                            Annuleren
                        </Button>
                    </Link>
                    <Button type="submit" disabled={processing}>
                        {isEdit ? 'Wijzigingen opslaan' : 'Medewerker aanmaken'}
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}
