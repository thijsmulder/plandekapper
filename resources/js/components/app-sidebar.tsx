import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, List, ChartNoAxesGantt, Users, Clock, Contact, File } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
];

const planningNavItems: NavItem[] = [
    {
        title: 'Tijdlijn',
        href: '/tijdlijn',
        icon: ChartNoAxesGantt,
    }
];

const servicesNavItems: NavItem[] = [
    {
        title: 'Behandelingen',
        href: '/behandelingen',
        icon: List,
    }
];

const manageNavItems: NavItem[] = [
    {
        title: 'Medewerkers',
        href: '/medewerkers',
        icon: Users,
    },
    {
        title: 'Openingstijden',
        href: '/openingstijden',
        icon: Clock,
    },
    {
        title: 'Klanten',
        href: '/klanten',
        icon: Contact,
    }
];

const reportNavItems: NavItem[] = [
    {
        title: 'Rapporten',
        href: '/rapporten',
        icon: File,
    }
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                <NavMain items={planningNavItems} title="Planning" />
                <NavMain items={servicesNavItems} title="Diensten" />
                <NavMain items={manageNavItems} title="Beheer" />
                <NavMain items={reportNavItems} title="Overzichten" />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
