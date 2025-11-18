// Componenten
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <AuthLayout
            title="Verifieer je e-mailadres"
            description="Klik op de link in de e-mail die we je net hebben gestuurd om je e-mailadres te verifiëren."
        >
            <Head title="E-mailverificatie" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    Er is een nieuwe verificatielink verzonden naar het e-mailadres dat je hebt opgegeven bij het registreren.
                </div>
            )}

            <form onSubmit={submit} className="space-y-6 text-center">
                <Button disabled={processing} variant="secondary">
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    Verificatie-e-mail opnieuw verzenden
                </Button>

                <TextLink href={route('logout')} method="post" className="mx-auto block text-sm">
                    Uitloggen
                </TextLink>
            </form>
        </AuthLayout>
    );
}
