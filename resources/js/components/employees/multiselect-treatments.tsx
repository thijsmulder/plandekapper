import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function MultiselectTreatments({
                                                  treatments,
                                                  selected,
                                                  onChange,
                                              }: {
    treatments: { id: number; name: string }[];
    selected: number[];
    onChange: (ids: number[]) => void;
}) {
    const [open, setOpen] = useState(false);

    const toggleSelect = (id: number) => {
        if (selected.includes(id)) {
            onChange(selected.filter((i) => i !== id));
        } else {
            onChange([...selected, id]);
        }
    };

    const allSelected = selected.length === treatments.length;
    const noneSelected = selected.length === 0;

    const toggleSelectAll = () => {
        if (allSelected) {
            onChange([]);
        } else {
            onChange(treatments.map((t) => t.id));
        }
    };

    return (
        <div className="w-full space-y-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                        Selecteer behandelingen
                        <ChevronDown />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                    <Command>
                        <CommandInput placeholder="Zoek behandelingen..." />
                        <CommandList>
                                <CommandItem onSelect={toggleSelectAll} className="cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        <Checkbox checked={allSelected} />
                                        <span>Selecteer alles</span>
                                    </div>
                                </CommandItem>
                            <CommandGroup heading="Behandelingen">
                                {treatments.map((treatment) => (
                                    <CommandItem key={treatment.id} onSelect={() => toggleSelect(treatment.id)} className="cursor-pointer">
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                checked={selected.includes(treatment.id)}
                                                onCheckedChange={() => toggleSelect(treatment.id)}
                                            />
                                            <span>{treatment.name}</span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            <div className="flex flex-wrap gap-2">
                {selected.map((id) => {
                    const treatment = treatments.find((t) => t.id === id);
                    return (
                        <Badge key={id} variant="secondary" className="flex items-center gap-1">
                            {treatment?.name}
                            <button onClick={() => toggleSelect(id)} type="button" className="ml-1">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    );
                })}
            </div>
        </div>
    );
}
