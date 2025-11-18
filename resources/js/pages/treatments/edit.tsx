import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircleIcon } from 'lucide-react';

type Category = { id: number; name: string };
type Treatment = {
    id: number;
    name: string;
    duration_in_minutes: number;
    price: number;
    description: string;
    active: number;
    category?: Category | null;
};
type Props = { treatment?: Treatment; categories: Category[] };

const InputError = ({ message }: { message?: string }) => (message ? <p className="text-sm text-red-600">{message}</p> : null);

const InputGroup = ({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) => (
    <div className="grid gap-2">
        <Label htmlFor={id}>{label}</Label>
        {children}
        <InputError message={error} />
    </div>
);

export default function Edit({ treatment, categories }: Props) {
    const isEdit = Boolean(treatment);
    const { data, setData, post, put, processing, errors } = useForm({
        name: treatment?.name ?? '',
        price: treatment?.price ?? 0,
        duration_in_minutes: String(treatment?.duration_in_minutes ?? ''),
        description: treatment?.description ?? '',
        active: treatment ? treatment.active === 1 : true,
        category_id: treatment?.category ? String(treatment.category.id) : '',
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        (isEdit ? put : post)(route(isEdit ? 'treatments.update' : 'treatments.store', treatment?.id), { preserveScroll: true });
    };

    const inputClass = (error?: string) => (error ? '' : '');
    const durations = Array.from({ length: 8 }, (_, i) => (i + 1) * 15);

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Behandelingen', href: route('treatments.index') },
                { title: isEdit ? 'Bewerken' : 'Aanmaken', href: '' },
            ]}
        >
            <Head title={`Behandeling ${isEdit ? 'bewerken' : 'aanmaken'}`} />

            <form onSubmit={onSubmit} className="p-6">
                <div className="flex justify-between">
                    <Heading
                        title={`Behandeling ${isEdit ? 'bewerken' : 'aanmaken'}`}
                        description={isEdit ? 'Pas hier de gegevens aan' : 'Vul de gegevens in om een behandeling toe te voegen'}
                    />
                    <Link href={route('treatments.index')}>
                        <Button variant="outline" type="button">
                            Terug naar overzicht
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <Card className="h-fit lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Behandelingsgegevens</CardTitle>
                            <CardDescription>Voer hier de gegevens van de behandeling in</CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <InputGroup id="name" label="Naam" error={errors.name}>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={inputClass(errors.name)}
                                    disabled={processing}
                                    autoFocus
                                    required
                                />
                            </InputGroup>

                            <InputGroup id="price" label="Prijs" error={errors.price}>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={data.price}
                                    onChange={(e) => setData('price', parseFloat(e.target.value))}
                                    className={inputClass(errors.price)}
                                    disabled={processing}
                                    required
                                />
                            </InputGroup>

                            <InputGroup id="duration_in_minutes" label="Duur" error={errors.duration_in_minutes}>
                                <Select value={data.duration_in_minutes} onValueChange={(v) => setData('duration_in_minutes', v)}>
                                    <SelectTrigger id="duration_in_minutes" className={inputClass(errors.duration_in_minutes)}>
                                        <SelectValue placeholder="Selecteer een duur" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {durations.map((m) => (
                                            <SelectItem key={m} value={String(m)}>
                                                {m} minuten
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </InputGroup>

                            <InputGroup id="category_id" label="Categorie" error={errors.category_id}>
                                <Select value={data.category_id} onValueChange={(v) => setData('category_id', v)}>
                                    <SelectTrigger id="category_id" className={inputClass(errors.category_id)}>
                                        <SelectValue placeholder="Selecteer een categorie" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(({ id, name }) => (
                                            <SelectItem key={id} value={String(id)}>
                                                {name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </InputGroup>

                            <InputGroup id="description" label="Beschrijving" error={errors.description}>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className={inputClass(errors.description)}
                                    disabled={processing}
                                />
                            </InputGroup>
                        </CardContent>
                    </Card>

                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle>Zichtbaarheid</CardTitle>
                            <CardDescription>Bepaal of deze behandeling zichtbaar is en geboekt kan worden</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="active">Toon in telefoon-app</Label>
                                <Switch id="active" checked={data.active} onCheckedChange={(v) => setData('active', !!v)} disabled={processing} />
                            </div>
                            <InputError message={errors.active} />

                            <Alert variant="default" className="mt-6">
                                <AlertCircleIcon />
                                <AlertTitle>Medewerkers koppelen</AlertTitle>
                                <AlertDescription>
                                    <p>
                                        Er moet minstens één medewerker gekoppeld zijn aan deze behandeling,
                                        anders is deze niet beschikbaar voor klanten.
                                    </p>
                                </AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </div>

                <div className="mt-4 flex gap-2">
                    <Link href={route('treatments.index')}>
                        <Button variant="outline" type="button">
                            Annuleren
                        </Button>
                    </Link>
                    <Button type="submit" disabled={processing}>
                        {isEdit ? 'Wijzigingen opslaan' : 'Behandeling aanmaken'}
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}
