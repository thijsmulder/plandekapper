import { useEffect } from 'react';
import { Head } from '@inertiajs/react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import confetti from 'canvas-confetti';
import { CheckCircle } from 'lucide-react';
import TextLink from '@/components/text-link';

const launchConfetti = () => {
    const defaults = { spread: 55, particleCount: 50 };
    confetti({ ...defaults, angle: 60, origin: { x: 0 } });
    confetti({ ...defaults, angle: 120, origin: { x: 1 } });
};

export default function Confirmed() {
    useEffect(() => {
        launchConfetti();
    }, []);

    return (
        <>
            <Head title="Bevestigd" />

            <main
                role="main"
                className="flex min-h-screen flex-col items-center justify-center px-4 text-sm"
            >
                <div className="w-full max-w-2xl space-y-4">
                    <div className="border-border overflow-hidden rounded-xl border bg-white p-6 shadow-xs dark:bg-zinc-950">
                        <div className="flex flex-col items-center space-y-4 text-center">
                            <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/20">
                                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h2 className="text-foreground text-xl font-semibold">Afspraak bevestigd!</h2>
                            <p className="text-muted-foreground">
                                Je afspraak is succesvol ingepland. Je ontvangt zo een bevestiging per e-mail.
                                <br />
                                Tot snel in de salon! 🎉
                            </p>
                            <TextLink href={route('booking')}>Terug naar de planner</TextLink>
                        </div>
                    </div>

                    <p className="text-muted-foreground/75 text-center text-xs">
                        Boekingssysteem door{' '}
                        <a
                            href="https://plandekapper.nl"
                            className="text-accent-foreground"
                            rel="noopener"
                        >
                            Plandekapper
                        </a>
                    </p>
                </div>
            </main>
        </>
    );
}
