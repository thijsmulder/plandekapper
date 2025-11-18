import Heading from '@/components/heading';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { nl } from 'react-day-picker/locale';

type Treatment = { id: number; name: string; duration_in_minutes: number };
type Client = { id: number; name: string; email: string };
type Appointment = {
    id: number;
    employee_id: number;
    start_time: string;
    treatment: Treatment;
    client: Client;
    appointment_status_id: number;
};
type Employee = {
    id: number;
    first_name: string;
    appointments?: Appointment[];
};

interface OpeningHours {
    day: string;
    opening_time: string; // bv. '08:00:00'
    closing_time: string; // bv. '18:00:00'
    closed: number;
}

interface TodayScheduleProps {
    employees: Employee[];
    selectedDate: string;
    openingHours: OpeningHours | null;
}

export default function TodaySchedule({ employees, selectedDate: selectedDateProp, openingHours }: TodayScheduleProps) {
    const [selectedDate, setSelectedDate] = useState(new Date(selectedDateProp));
    const [pickedDate, setPickedDate] = useState<Date | undefined>(undefined);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const openingHoursStr = openingHours?.opening_time ?? '09:00:00';
    const closingHoursStr = openingHours?.closing_time ?? '17:00:00';

    const [openingHour] = openingHoursStr.split(':').map(Number);
    const [closingHour] = closingHoursStr.split(':').map(Number);

    const workDayStartHour = openingHour;
    const workDayHours = closingHour - openingHour;

    const QUARTER_MINUTES = 15;
    const QUARTERS_PER_HOUR = 60 / QUARTER_MINUTES;
    const TOTAL_QUARTERS = workDayHours * QUARTERS_PER_HOUR;

    const breadcrumbs = useMemo(() => [{ title: 'Tijdlijn', href: '/tijdlijn' }], []);

    const hours = useMemo(() => {
        return Array.from({ length: workDayHours }, (_, i) => {
            const hour = workDayStartHour + i;
            return `${hour.toString().padStart(2, '0')}:00`;
        });
    }, [workDayStartHour, workDayHours]);
    const isToday = useMemo(() => new Date().toDateString() === selectedDate.toDateString(), [selectedDate]);

    const formattedDate = useMemo(
        () =>
            selectedDate.toLocaleDateString('nl-NL', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }),
        [selectedDate],
    );

    const dateStr = selectedDate.toDateString();

    // Map appointments per employee keyed by "hour:quarter"
    const employeesWithMap = useMemo(() => {
        return employees.map((emp) => {
            const apps = (emp.appointments ?? []).filter((a) => new Date(a.start_time).toDateString() === dateStr);
            const appointmentMap: Record<string, Appointment[]> = {};
            apps.forEach((a) => {
                const dt = new Date(a.start_time);
                const h = dt.getHours();
                const q = Math.floor(dt.getMinutes() / QUARTER_MINUTES) + 1;
                const key = `${h}:${q}`;
                if (!appointmentMap[key]) appointmentMap[key] = [];
                appointmentMap[key].push(a);
            });
            return { ...emp, appointmentMap };
        });
    }, [employees, dateStr]);

    const getAppointmentsBySlot = useCallback((emp: (typeof employeesWithMap)[0], hourLabel: string, quarterIndex: number) => {
        const h = parseInt(hourLabel.split(':')[0], 10);
        return emp.appointmentMap[`${h}:${quarterIndex}`] ?? [];
    }, []);

    const calcStyles = useCallback(
        (a: Appointment) => {
            const dt = new Date(a.start_time);
            const startQ = Math.floor(dt.getMinutes() / QUARTER_MINUTES);
            const offsetQ = (dt.getHours() - workDayStartHour) * QUARTERS_PER_HOUR + startQ;
            const widthQ = Math.ceil((a.treatment?.duration_in_minutes ?? 60) / QUARTER_MINUTES);
            return {
                left: `${(offsetQ / TOTAL_QUARTERS) * 100}%`,
                width: `${(widthQ / TOTAL_QUARTERS) * 100}%`,
            };
        },
        [workDayStartHour, QUARTERS_PER_HOUR, TOTAL_QUARTERS],
    );

    const navigate = useCallback(
        (delta: number) => {
            const newDate = new Date(selectedDate.getTime() + delta * 24 * 60 * 60 * 1000);
            setSelectedDate(newDate);

            router.get(route('timeline.index'), { date: newDate.toISOString().split('T')[0] }, { preserveScroll: true });
        },
        [selectedDate],
    );

    const nowIndicatorStyle = useMemo(() => {
        if (!isToday) return null;

        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        if (currentHour < openingHour || currentHour >= closingHour) return null;

        const quartersSinceOpen =
            (currentHour - openingHour) * QUARTERS_PER_HOUR + Math.floor(currentMinute / QUARTER_MINUTES);
        const leftPercent = (quartersSinceOpen / TOTAL_QUARTERS) * 100;

        return {
            left: `${leftPercent}%`,
        };
    }, [isToday, openingHour, closingHour, QUARTERS_PER_HOUR, TOTAL_QUARTERS]);


    const handleDateSelect = (d: Date | undefined) => {
        if (!d) return;
        setPickedDate(d);
        setSelectedDate(d);

        const toYMD = (date: Date) => {
            const year = date.getFullYear();
            const month = `${date.getMonth() + 1}`.padStart(2, '0');
            const day = `${date.getDate()}`.padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        router.get(route('timeline.index'), { date: toYMD(d) }, { preserveScroll: true });
    };

    const handleDelete = useCallback(() => {
        if (!selectedAppointment) return;

        router.delete(route('timeline.destroy', { appointment: selectedAppointment.id }), {
            preserveScroll: true,
            onSuccess: () => {
                setShowConfirmModal(false);
                setShowDetailModal(false);
                setSelectedAppointment(null);
            },
            onError: () => toast.error('Fout bij verwijderen'),
        });
    }, [selectedAppointment]);

    return (
        <>
            <Head title="Tijdlijn" />
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="p-6 text-sm">
                    <div className="flex flex-wrap items-start justify-between">
                        <Heading title="Tijdlijn" description="Bekijk de planning op je tijdlijn" />

                        {employeesWithMap.length > 0 && (
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="font-semibold">{formattedDate}</div>

                                <div className="inline-flex overflow-hidden">
                                    <Button variant="outline" className="rounded-r-none" onClick={() => navigate(-1)}>
                                        <ChevronLeft />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="rounded-none border-l-0 border-r-0"
                                        onClick={() => handleDateSelect(new Date())}
                                        disabled={isToday}
                                    >
                                        Vandaag
                                    </Button>
                                    <Button variant="outline" className="rounded-l-none" onClick={() => navigate(1)}>
                                        <ChevronRight />
                                    </Button>
                                </div>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-10 justify-start text-left">
                                            <CalendarIcon />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent align="end" className="p-0">
                                        <Calendar
                                            mode="single"
                                            selected={pickedDate}
                                            onSelect={handleDateSelect}
                                            captionLayout="dropdown"
                                            className="w-full"
                                            locale={nl}
                                        />
                                    </PopoverContent>
                                </Popover>

                                <Button>
                                    <Plus />
                                    Nieuwe afspraak
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="overflow-x-scroll">
                    <div className="mt-4 min-w-[800px]">
                        {employeesWithMap.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground">
                                Er zijn (nog) geen gegevens beschikbaar. <TextLink href={route('employees.index')}>Voeg een medewerker toe</TextLink>.
                            </div>
                        ) : (
                            <>
                                <div className="sticky top-0 z-10 flex bg-background">
                                    <div className="w-24 border-b" />
                                    <div className="flex flex-1">
                                        {hours.map((h) => (
                                            <div key={h} className="flex-1 border-l">
                                                <div className="border-b p-2 text-left text-xs text-muted-foreground">{h}</div>
                                                <div className="flex">
                                                    {Array.from({ length: 4 }).map((_, q) => (
                                                        <div
                                                            key={q}
                                                            className={`flex-1 border-l ${q === 0 ? 'border-solid' : 'border-dashed'} border-border`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {employeesWithMap.map((emp) => (
                                    <div key={emp.id} className="flex items-center border-b">
                                        <div className="w-24 p-2">{emp.first_name}</div>
                                        <div className="relative h-20 flex-1">
                                            {openingHours?.closed === 1 && (
                                                <div className="absolute inset-0 z-0 bg-[repeating-linear-gradient(45deg,theme(colors.border),theme(colors.border)_10px,transparent_10px,transparent_20px)] opacity-50 pointer-events-none rounded" />
                                            )}

                                            {isToday && nowIndicatorStyle && (
                                                <div
                                                    className="absolute top-0 bottom-0 w-[2px] bg-red-500 z-20 pointer-events-none"
                                                    style={nowIndicatorStyle}
                                                />
                                            )}

                                            <div className="flex h-full">
                                                {hours.map((h) => (
                                                    <div key={h} className="flex flex-1">
                                                        {Array.from({ length: 4 }).map((_, q) => (
                                                            <div
                                                                key={q}
                                                                className={`flex-1 border-l ${q === 0 ? 'border-solid' : 'border-dashed'} border-border`}
                                                            />
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>

                                            {hours.map((h) =>
                                                Array.from({ length: 4 }).flatMap((_, q) =>
                                                    getAppointmentsBySlot(emp, h, q + 1).map((a) => (
                                                        <div
                                                            key={a.id}
                                                            className={`absolute z-10 h-full cursor-pointer rounded px-2 py-1.5 text-xs text-white overflow-hidden ${
                                                                a.appointment_status_id === 1 ? 'bg-chart-1' : 'bg-primary'
                                                            }`}
                                                            style={calcStyles(a)}
                                                            onClick={() => {
                                                                setSelectedAppointment(a);
                                                                setShowDetailModal(true);
                                                            }}
                                                        >
                                                            {a.treatment?.name ?? 'Onbekend'}
                                                        </div>
                                                    )),
                                                ),
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                    </div>
                </div>

                <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Afspraakgegevens</DialogTitle>
                            <DialogDescription>Details van de afspraak</DialogDescription>
                        </DialogHeader>
                        {selectedAppointment && (
                            <div className="text-sm">
                                <table className="w-full">
                                    <tbody>
                                        {[
                                            ['Behandeling', selectedAppointment.treatment?.name ?? 'Onbekend'],
                                            [
                                                'Tijd',
                                                `${new Date(selectedAppointment.start_time).toLocaleTimeString('nl-NL', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })} – ${new Date(
                                                    new Date(selectedAppointment.start_time).getTime() +
                                                        (selectedAppointment.treatment?.duration_in_minutes ?? 60) * 60000,
                                                ).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}`,
                                            ],
                                            ['Status', selectedAppointment.appointment_status_id === 1 ? 'In afwachting' : 'Bevestigd'],
                                            ['Klantnaam', selectedAppointment.client.name],
                                            ['E-mailadres', selectedAppointment.client.email],
                                        ].map(([label, value]) => (
                                            <tr key={label} className="border-b last:border-b-0">
                                                <td className="px-2 py-3 font-medium text-muted-foreground">{label}</td>
                                                <td className="px-2 py-3">{value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div className="mt-4 flex justify-end gap-2">
                            <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                                Annuleren
                            </Button>
                            <Button variant="destructive" onClick={() => setShowConfirmModal(true)}>
                                Verwijder
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Bevestig verwijdering</DialogTitle>
                            <DialogDescription>
                                Weet je zeker dat je deze afspraak wilt verwijderen? Dit kan niet ongedaan worden gemaakt.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4 flex justify-end gap-2">
                            <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                                Annuleren
                            </Button>
                            <Button variant="destructive" onClick={handleDelete}>
                                Verwijder
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </AppLayout>
        </>
    );
}
