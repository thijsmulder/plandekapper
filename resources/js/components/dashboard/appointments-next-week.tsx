import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

type Appointment = {
    date: string;
    count: number;
};

const chartConfig = {
    desktop: {
        label: "Afspraken",
        color: "var(--primary)",
    },
    count: {
        label: "Afspraken"
    }
} satisfies ChartConfig

export function AppointmentsNextWeek({ data }: { data: Appointment[] }) {
    const formattedData = data.map((item) => {
        const dateObj = new Date(item.date);
        const day = dateObj.getDate().toString().padStart(2, '0');
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        return {
            ...item,
            day: `${day}-${month}`,
        };
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Aankomende 7 dagen</CardTitle>
                <CardDescription>Aantal afspraken aankomende week</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart accessibilityLayer data={formattedData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="day"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Bar dataKey="count" fill="var(--color-desktop)" radius={8} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
