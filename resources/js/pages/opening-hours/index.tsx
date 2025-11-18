import { Head, useForm, usePage } from '@inertiajs/react';
import { toast } from 'sonner';

import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';

type OpeningHours = Record<string, { open: string; close: string; isClosed: boolean }>;

interface Props {
    openingHours: OpeningHours;
    openingOptions: string[];
    closingOptions: string[];
}

const TimeSelect = ({
    value,
    onChange,
    disabled,
    placeholder,
    options,
    error,
}: {
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
    placeholder: string;
    options: string[];
    error?: string;
}) => (
    <div>
        <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    {options.map((time) => (
                        <SelectItem key={time} value={time}>
                            {time}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
);

export default function OpeningHoursPage({ openingHours, openingOptions, closingOptions }: Props) {
    const page = usePage();

    const { data, setData, post, processing, errors } = useForm({
        openingHours: Object.fromEntries(
            Object.entries(openingHours).map(([day, value]) => [
                day,
                {
                    open: value.open || '08:00',
                    close: value.close || '17:00',
                    isClosed: value.isClosed,
                },
            ]),
        ),
    });

    const save = () => {
        post(route('opening-hours.update'), {
            preserveState: false,
            preserveScroll: false,
            onSuccess: () => {
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
    };

    const handleChange = (day: string, key: 'open' | 'close' | 'isClosed', value: string | boolean) => {
        setData((prev) => ({
            ...prev,
            openingHours: {
                ...prev.openingHours,
                [day]: {
                    ...prev.openingHours[day],
                    [key]: value,
                },
            },
        }));
    };

    const breadcrumbs = [{ title: 'Openingstijden', href: '/openingstijden' }];

    return (
        <>
            <Head title="Openingstijden" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="p-6">
                    <div className="flex flex-wrap justify-between">
                        <Heading title="Openingstijden" description="Beheer en voeg nieuwe openingstijden toe" />
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {Object.entries(data.openingHours).map(([day, settings]) => {
                            const isClosed = settings.isClosed;
                            const errorOpen = (errors as never)[`openingHours.${day}.open`];
                            const errorClose = (errors as never)[`openingHours.${day}.close`];

                            return (
                                <Card key={day} className="shadow-none">
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle className="font-semibold capitalize">{day}</CardTitle>
                                        <div className="flex items-center space-x-2">
                                            <p className="text-sm text-muted-foreground">Gesloten</p>
                                            <Switch checked={isClosed} onCheckedChange={(checked) => handleChange(day, 'isClosed', checked)} />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className={`grid grid-cols-2 gap-2 ${isClosed ? 'pointer-events-none opacity-60' : ''}`}>
                                            <TimeSelect
                                                value={settings.open || '09:00'}
                                                onChange={(value) => handleChange(day, 'open', value)}
                                                disabled={isClosed}
                                                placeholder="Openingstijd"
                                                options={openingOptions}
                                                error={errorOpen}
                                            />
                                            <TimeSelect
                                                value={settings.close || '17:00'}
                                                onChange={(value) => handleChange(day, 'close', value)}
                                                disabled={isClosed}
                                                placeholder="Sluitingstijd"
                                                options={closingOptions}
                                                error={errorClose}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    <Button onClick={save} disabled={processing} className="mt-4">
                        Opslaan
                    </Button>
                </div>
            </AppLayout>
        </>
    );
}
