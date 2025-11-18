import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

interface Props {
    show_prices: number;
    weeks_ahead: number;
}

export default function PhoneAppSettings({ show_prices, weeks_ahead }: Props) {
    const [saved, setSaved] = useState(false);

    const form = useForm({
        show_prices: String(show_prices),
        weeks_ahead: String(weeks_ahead),
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        form.put(route('app.update'), {
            preserveScroll: true,
            onSuccess: () => {
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            },
        });
    };

    const breadcrumbs = [
        {
            title: 'Telefoon-app instellingen',
            href: '/instellingen/app',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Telefoon-app instellingen" />

            <SettingsLayout>
                <div className="flex flex-col space-y-6">
                    <HeadingSmall
                        title="Telefoon-app instellingen"
                        description="Deze instellingen zijn zichtbaar voor klanten die via de telefoon-app een afspraak inplannen"
                    />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-3">
                            <Label htmlFor="show_prices">Toon prijzen in app</Label>
                            <Select
                                value={form.data.show_prices}
                                onValueChange={(value) => form.setData('show_prices', value)}
                            >
                                <SelectTrigger id="show_prices" className="w-full">
                                    <SelectValue placeholder="Kies een optie" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Ja</SelectItem>
                                    <SelectItem value="0">Nee</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError className="mt-2" message={form.errors.show_prices} />
                        </div>

                        {/*<div className="grid gap-3">*/}
                        {/*    <Label htmlFor="weeks_ahead">Weken vooruit plannen</Label>*/}
                        {/*    <Select*/}
                        {/*        value={form.data.weeks_ahead}*/}
                        {/*        onValueChange={(value) => form.setData('weeks_ahead', value)}*/}
                        {/*    >*/}
                        {/*        <SelectTrigger id="weeks_ahead" className="w-full">*/}
                        {/*            <SelectValue placeholder="Kies aantal weken" />*/}
                        {/*        </SelectTrigger>*/}
                        {/*        <SelectContent>*/}
                        {/*            {[...Array(7)].map((_, i) => {*/}
                        {/*                const week = i + 1;*/}
                        {/*                return (*/}
                        {/*                    <SelectItem key={week} value={String(week)}>*/}
                        {/*                        {week} weken*/}
                        {/*                    </SelectItem>*/}
                        {/*                );*/}
                        {/*            })}*/}
                        {/*        </SelectContent>*/}
                        {/*    </Select>*/}
                        {/*    <InputError className="mt-2" message={form.errors.weeks_ahead} />*/}
                        {/*</div>*/}

                        <div className="flex items-center gap-4">
                            <Button type="submit" disabled={form.processing}>
                                Opslaan
                            </Button>
                            {saved && (
                                <p className="text-sm text-neutral-600 transition-opacity duration-300">Opgeslagen!</p>
                            )}
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
