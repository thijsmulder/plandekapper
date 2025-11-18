import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';

import Heading from '@/components/heading';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle } from 'lucide-react';
import { nl } from 'react-day-picker/locale';

interface Treatment {
    id: number;
    name: string;
    price: number;
    category_id: number;
}

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
}

interface Category {
    id: number;
    name: string;
}

interface Settings {
    weeks_ahead?: number;
    show_prices?: 0 | 1;
}

interface Props {
    treatments: Treatment[];
    employees: Employee[];
    categories: Category[];
    settings: Settings;
}

export default function BookingForm({ treatments, employees, categories, settings }: Props) {
    const [activeCategory, setActiveCategory] = useState<string>(() => categories[0]?.id.toString() || '');
    const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
    const [value, setValue] = useState<Date>(new Date());
    const [step, setStep] = useState(1);
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);

    const [form, setForm] = useState({
        treatmentId: '',
        employeeId: '',
        date: '',
        time: '',
        name: '',
        email: '',
        errors: {} as Record<string, string[]>,
    });

    // Sync activeCategory on categories change
    useEffect(() => {
        if (categories.length && !activeCategory) {
            setActiveCategory(categories[0].id.toString());
        }
    }, [categories, activeCategory]);

    // Update form.date when calendar value changes
    useEffect(() => {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, '0');
        const day = String(value.getDate()).padStart(2, '0');
        setForm((f) => ({ ...f, date: `${year}-${month}-${day}` }));
    }, [value]);

    // Fetch employees when treatmentId changes
    useEffect(() => {
        if (!form.treatmentId) {
            setAvailableEmployees([]);
            setForm((f) => ({ ...f, employeeId: '' }));
            return;
        }

        let cancelled = false;
        const fetchEmployees = async () => {
            try {
                const { data } = await axios.get(route('booking.employees'), { params: { treatmentId: form.treatmentId } });
                if (!cancelled) {
                    setAvailableEmployees(data);
                    setForm((f) => ({ ...f, employeeId: '' }));
                }
            } catch (e) {
                if (!cancelled) {
                    console.error('Fout bij ophalen medewerkers:', e);
                    setAvailableEmployees([]);
                }
            }
        };
        fetchEmployees();

        return () => {
            cancelled = true;
        };
    }, [form.treatmentId]);

    const treatmentsByCategory = useMemo(() => {
        return treatments.filter((t) => t.category_id.toString() === activeCategory);
    }, [activeCategory, treatments]);

    const nextStep = useCallback(() => setStep((s) => s + 1), []);
    const prevStep = useCallback(() => setStep((s) => s - 1), []);

    const fetchAvailableTimes = useCallback(async () => {
        try {
            const { data } = await axios.post(route('booking.available-times'), {
                employeeId: Number(form.employeeId),
                date: form.date,
                treatmentId: Number(form.treatmentId),
            });
            setAvailableTimes(data);
            nextStep();
        } catch (e) {
            console.error(e);
        }
    }, [form.employeeId, form.date, form.treatmentId, nextStep]);

    const submit = useCallback(async () => {
        try {
            await axios.post(route('booking.create'), {
                ...form,
                treatmentId: Number(form.treatmentId),
                employeeId: Number(form.employeeId),
            });
            setStep(6);
            setForm((f) => ({ ...f, errors: {} }));
        } catch (error: unknown) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            if (error.response?.status === 422) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                setForm((f) => ({ ...f, errors: error.response.data.errors || {} }));
            } else {
                console.error(error);
            }
        }
    }, [form]);

    // Handlers for setting form fields (prevents recreating functions inline)
    const selectTreatment = useCallback((id: number) => {
        setForm((f) => ({ ...f, treatmentId: id.toString() }));
    }, []);

    const selectEmployee = useCallback((id: number) => {
        setForm((f) => ({ ...f, employeeId: id.toString() }));
    }, []);

    const setName = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((f) => ({ ...f, name: e.target.value }));
    }, []);

    const setEmail = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((f) => ({ ...f, email: e.target.value }));
    }, []);

    const selectTime = useCallback((time: string) => {
        setForm((f) => ({ ...f, time }));
    }, []);

    return (
        <>
            <Head title="Afspraak" />

            <div className="flex min-h-screen flex-col bg-background">
                <main className="flex-1">
                    <div className="mx-auto max-w-2xl p-4">
                        {step === 1 && (
                            <>
                                <Heading title="Selecteer een behandeling" description="Selecteer een behandeling" />
                                <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
                                    <TabsList className="w-full bg-sidebar">
                                        {categories.map(({ id, name }) => (
                                            <TabsTrigger key={id} value={id.toString()} className="flex-1">
                                                {name}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>

                                    {categories.map(({ id }) => (
                                        <TabsContent key={id} value={id.toString()} className="mt-2">
                                            <div className="space-y-2">
                                                {treatmentsByCategory.length > 0 ? (
                                                    treatmentsByCategory.map((treatment) => {
                                                        const idStr = treatment.id.toString();
                                                        const isSelected = form.treatmentId === idStr;
                                                        return (
                                                            <Button
                                                                key={treatment.id}
                                                                onClick={() => selectTreatment(treatment.id)}
                                                                variant={isSelected ? 'default' : 'outline'}
                                                                className={`flex w-full justify-between py-6 ${
                                                                    isSelected
                                                                        ? 'border border-ring bg-accent text-accent-foreground hover:bg-accent'
                                                                        : 'border border-input'
                                                                }`}
                                                            >
                                                                <span>{treatment.name}</span>
                                                                {settings.show_prices === 1 && (
                                                                    <span>&#8364;{treatment.price.toFixed(2).replace('.', ',')}</span>
                                                                )}
                                                            </Button>
                                                        );
                                                    })
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">Geen behandelingen beschikbaar in deze categorie.</p>
                                                )}
                                            </div>
                                        </TabsContent>
                                    ))}
                                </Tabs>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <Heading title="Selecteer een medewerker" description="Selecteer een medewerker" />
                                <div className="space-y-2">
                                    {availableEmployees.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">Geen medewerkers beschikbaar voor deze behandeling.</p>
                                    ) : (
                                        availableEmployees.map((employee) => {
                                            const idStr = employee.id.toString();
                                            const isSelected = form.employeeId === idStr;
                                            return (
                                                <Button
                                                    key={employee.id}
                                                    onClick={() => selectEmployee(employee.id)}
                                                    variant={isSelected ? 'default' : 'outline'}
                                                    className={`w-full justify-start py-6 text-left ${
                                                        isSelected
                                                            ? 'border border-ring bg-accent text-accent-foreground hover:bg-accent'
                                                            : 'border border-input'
                                                    }`}
                                                >
                                                    {employee.first_name} {employee.last_name}
                                                </Button>
                                            );
                                        })
                                    )}
                                </div>
                            </>
                        )}

                        {step === 3 && (
                            <>
                                <Heading title="Selecteer een datum" description="Selecteer een datum" />
                                <Calendar
                                    selected={value}
                                    onSelect={(date) => {
                                        if (!date) return;
                                        // Zet tijd altijd op 12:00 zodat tijdzone issues worden beperkt
                                        setValue(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0));
                                    }}
                                    mode="single"
                                    locale={nl}
                                    startMonth={new Date(new Date().getFullYear(), new Date().getMonth())}
                                    endMonth={new Date(new Date().getFullYear(), new Date().getMonth() + 12)}
                                    modifiers={{ disabled: [{ before: new Date() }] }}
                                    captionLayout="dropdown"
                                    className="w-full rounded-md border"
                                />
                            </>
                        )}

                        {step === 4 && (
                            <>
                                <Heading title="Selecteer een tijd" description="Selecteer een tijd" />
                                <div className="grid grid-cols-2 gap-2">
                                    {availableTimes.length > 0 ? (
                                        availableTimes.map((time) => {
                                            const isSelected = form.time === time;
                                            return (
                                                <Button
                                                    key={time}
                                                    onClick={() => selectTime(time)}
                                                    variant={isSelected ? 'default' : 'outline'}
                                                    className={`py-6 ${isSelected ? 'border border-ring bg-accent text-accent-foreground hover:bg-accent' : 'border border-input'}`}
                                                >
                                                    {time}
                                                </Button>
                                            );
                                        })
                                    ) : (
                                        <p className="mt-4 text-sm text-muted-foreground">Geen tijden beschikbaar op deze datum.</p>
                                    )}
                                </div>
                            </>
                        )}

                        {step === 5 && (
                            <>
                                <Heading title="Afspraak bevestigen" description="Afspraak bevestigen" />
                                <div className="mb-6 rounded-md border">
                                    <table className="w-full text-sm">
                                        <tbody>
                                            <tr className="border-b last:border-b-0">
                                                <td className="w-1/3 px-4 py-3 font-medium text-muted-foreground">Behandeling</td>
                                                <td className="px-4 py-3">
                                                    {treatments.find((t) => t.id.toString() === form.treatmentId)?.name ?? '–'}
                                                </td>
                                            </tr>
                                            <tr className="border-b last:border-b-0">
                                                <td className="px-4 py-3 font-medium text-muted-foreground">Medewerker</td>
                                                <td className="px-4 py-3">
                                                    {(() => {
                                                        const e = employees.find((e) => e.id.toString() === form.employeeId);
                                                        return e ? `${e.first_name} ${e.last_name}` : '–';
                                                    })()}
                                                </td>
                                            </tr>
                                            <tr className="border-b last:border-b-0">
                                                <td className="px-4 py-3 font-medium text-muted-foreground">Datum</td>
                                                <td className="px-4 py-3">
                                                    {new Date(form.date).toLocaleDateString('nl-NL', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="px-4 py-3 font-medium text-muted-foreground">Tijd</td>
                                                <td className="px-4 py-3">{form.time || '–'}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <Label htmlFor="name-input" className="mb-2 block">
                                    Naam
                                </Label>
                                <Input id="name-input" required value={form.name} onChange={setName} />
                                {form.errors.name && <p className="mt-2 text-sm text-destructive">{form.errors.name[0]}</p>}

                                <Label htmlFor="email-input" className="mt-4 mb-2 block">
                                    E-mail
                                </Label>
                                <Input id="email-input" type="email" required value={form.email} onChange={setEmail} />
                                {form.errors.email && <p className="mt-2 text-sm text-destructive">{form.errors.email[0]}</p>}

                                <p className="mt-4 text-xs text-muted-foreground">
                                    Door uw afspraak te bevestigen, geeft u ons toestemming om uw naam en e‑mail te bewaren zodat wij de afspraak
                                    kunnen uitvoeren. <TextLink href={route('booking')}>Lees onze privacyverklaring.</TextLink>
                                </p>
                            </>
                        )}

                        {step === 6 && (
                            <div className="flex min-h-screen flex-col items-center justify-center px-4 text-sm">
                                <div className="w-full max-w-2xl space-y-4">
                                    <div className="overflow-hidden rounded-xl border border-border bg-white p-6 shadow-xs dark:bg-zinc-950">
                                        <div className="flex flex-col items-center space-y-4 text-center">
                                            <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/20">
                                                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                                            </div>
                                            <h2 className="text-xl font-semibold text-foreground">Afspraak gereserveerd!</h2>
                                            <p className="text-muted-foreground">
                                                Controleer je e-mail om je afspraak te bevestigen.
                                                <br />
                                                Je hoeft alleen nog op de bevestigingsknop te klikken.
                                            </p>
                                            <TextLink href={route('booking')}>Terug naar de planner</TextLink>
                                        </div>
                                    </div>

                                    <p className="text-center text-xs text-muted-foreground/75">
                                        Boekingssysteem door{' '}
                                        <a className="text-accent-foreground" href="https://plandekapper.nl" rel="noopener noreferrer">
                                            Plandekapper
                                        </a>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                {step < 6 && (
                    <footer className="sticky right-0 bottom-0 left-0 z-10 border-t bg-background p-4 shadow-sm dark:bg-background">
                        <div className="mx-auto grid max-w-2xl grid-cols-2 gap-2">
                            {step > 1 && (
                                <Button onClick={prevStep} variant="outline" className="w-full">
                                    Terug
                                </Button>
                            )}
                            {step === 1 && (
                                <Button onClick={nextStep} disabled={!form.treatmentId} className="col-span-2 w-full">
                                    Volgende stap
                                </Button>
                            )}
                            {step === 2 && (
                                <Button onClick={nextStep} disabled={!form.employeeId} className="w-full">
                                    Volgende stap
                                </Button>
                            )}
                            {step === 3 && (
                                <Button onClick={fetchAvailableTimes} disabled={!form.date} className="w-full">
                                    Volgende stap
                                </Button>
                            )}
                            {step === 4 && (
                                <Button onClick={nextStep} disabled={!form.time} className="w-full">
                                    Volgende stap
                                </Button>
                            )}
                            {step === 5 && (
                                <Button onClick={submit} disabled={!form.name || !form.email} className="w-full">
                                    Bevestig afspraak
                                </Button>
                            )}
                        </div>
                    </footer>
                )}
            </div>
        </>
    );
}
