'use client';

import * as React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, Check, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FREE_MODELS, PAID_MODELS, type ModelInfo } from '@/lib/constants';

type ModelSelectorProps = {
  value: string;
  onChange: (modelId: string) => void;
  disabled?: boolean;
  className?: string;
};

function getModelLabel(modelId: string): string {
  const allModels = [...PAID_MODELS, ...FREE_MODELS];
  const model = allModels.find((m) => m.id === modelId);
  return model?.label ?? modelId.split('/').pop()?.replace(/:free$/, '') ?? modelId;
}

function ModelItem({
  model,
  isSelected,
  onSelect,
}: {
  model: ModelInfo;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <DropdownMenu.Item
      className={cn(
        'relative flex items-center gap-3 px-3 py-2.5 text-sm outline-none cursor-pointer rounded-md transition-colors',
        'hover:bg-stone-100 focus:bg-stone-100',
        isSelected && 'bg-teal-50 hover:bg-teal-50 focus:bg-teal-50'
      )}
      onSelect={onSelect}
    >
      <div className="flex-1 min-w-0">
        <div className={cn('font-medium truncate', isSelected && 'text-teal-700')}>
          {model.label}
        </div>
        {model.description && (
          <div className="text-xs text-stone-500 truncate">{model.description}</div>
        )}
      </div>
      {isSelected && <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />}
    </DropdownMenu.Item>
  );
}

export function ModelSelector({ value, onChange, disabled, className }: ModelSelectorProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (modelId: string) => {
    onChange(modelId);
    setOpen(false);
  };

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild disabled={disabled}>
        <button
          className={cn(
            'inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all',
            'bg-white/80 border border-stone-200 text-stone-700',
            'hover:bg-white hover:border-stone-300 hover:shadow-sm',
            'focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
          )}
        >
          <span className="truncate max-w-[140px]">{getModelLabel(value)}</span>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-stone-400 transition-transform duration-200',
              open && 'rotate-180'
            )}
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={cn(
            'z-50 min-w-[240px] max-w-[280px] overflow-hidden rounded-xl',
            'bg-white border border-stone-200 shadow-lg shadow-stone-200/50',
            'animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2',
            'data-[side=top]:slide-in-from-bottom-2'
          )}
          sideOffset={8}
          align="start"
        >
          {/* Paid Models Section */}
          <div className="p-1.5">
            <DropdownMenu.Label className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-stone-500 uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Premium Models
            </DropdownMenu.Label>
            {PAID_MODELS.map((model) => (
              <ModelItem
                key={model.id}
                model={model}
                isSelected={value === model.id}
                onSelect={() => handleSelect(model.id)}
              />
            ))}
          </div>

          <DropdownMenu.Separator className="h-px bg-stone-200 mx-2" />

          {/* Free Models Section */}
          <div className="p-1.5">
            <DropdownMenu.Label className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-stone-500 uppercase tracking-wide">
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              Free Models
            </DropdownMenu.Label>
            {FREE_MODELS.map((model) => (
              <ModelItem
                key={model.id}
                model={model}
                isSelected={value === model.id}
                onSelect={() => handleSelect(model.id)}
              />
            ))}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
