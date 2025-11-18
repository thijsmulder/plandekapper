import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

type NavMainProps = {
    items: NavItem[];
    title?: string;
};

export function NavMain({ items = [], title }: NavMainProps) {
    const page = usePage();
    const isCollapsed = !page.props.sidebarOpen;

    return (
        <SidebarGroup className="px-2 py-0">
            {!isCollapsed && title && (
                <SidebarGroupLabel className="text-muted-foreground">
                    {title}
                </SidebarGroupLabel>
            )}
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={page.url.startsWith(item.href)}
                            tooltip={{ children: item.title }}
                        >
                            <Link href={item.href}>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
