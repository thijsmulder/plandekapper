import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';
import { Toaster, toast } from 'sonner';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

// Wordt via HandleInertiaRequest aan de usePage toegevoegd als prop
type FlashProps = {
    flash?: {
        success?: string;
        error?: string;
        info?: string;
        warning?: string;
    };
};

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => {
    const { flash } = usePage<FlashProps>().props;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
        if (flash?.info) toast.error(flash.info);
        if (flash?.warning) toast.error(flash.warning);
    }, [flash?.success, flash?.error, flash?.info, flash?.warning]);

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
            <Toaster position="top-center" theme="system" richColors />
        </AppLayoutTemplate>
    );
};
