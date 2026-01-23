'use client';

import * as React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, Check, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FREE_MODELS, PAID_MODELS, type ModelInfo } from '@/lib/constants';

type ModelSelectorProps = {
  value: string;
  onChange: (modelId: string) => void;
  hasApiKey?: boolean;
  disabled?: boolean;
  className?: string;
};

function getModelLabel(modelId: string): string {
  const allModels = [...PAID_MODELS, ...FREE_MODELS];
  const model = allModels.find((m) => m.id === modelId);
  return (
    model?.label ??
    modelId
      .split('/')
      .pop()
      ?.replace(/:free$/, '') ??
    modelId
  );
}

function ModelItem({
  model,
  isSelected,
  onSelect,
  disabled,
}: {
  model: ModelInfo;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}) {
  return (
    <DropdownMenu.Item
      className={cn(
        'relative flex items-center gap-3 px-3 py-2.5 text-sm outline-none rounded-md transition-colors',
        disabled
          ? 'cursor-not-allowed text-stone-400 bg-transparent'
          : 'cursor-pointer hover:bg-stone-100 focus:bg-stone-100',
        isSelected && !disabled && 'bg-teal-50 hover:bg-teal-50 focus:bg-teal-50',
        isSelected && disabled && 'bg-stone-50'
      )}
      onSelect={disabled ? undefined : onSelect}
      disabled={disabled}
    >
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            'font-medium truncate',
            isSelected && !disabled && 'text-teal-700',
            isSelected && disabled && 'text-stone-500'
          )}
        >
          {model.label}
        </div>
        {model.description && (
          <div className={cn('text-xs truncate', disabled ? 'text-stone-400' : 'text-stone-500')}>
            {model.description}
          </div>
        )}
      </div>
      {isSelected && (
        <Check
          className={cn('w-4 h-4 flex-shrink-0', disabled ? 'text-stone-400' : 'text-teal-600')}
        />
      )}
    </DropdownMenu.Item>
  );
}

export function ModelSelector({
  value,
  onChange,
  hasApiKey = true,
  disabled,
  className,
}: ModelSelectorProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (modelId: string) => {
    onChange(modelId);
    setOpen(false);
  };

  const showFreeFirst = !hasApiKey;

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
          <div className="max-h-[300px] overflow-y-auto">
            {showFreeFirst ? (
              <>
                {/* Free Models Section */}
                <div className="flex flex-col">
                  <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-emerald-100/50">
                    <DropdownMenu.Label className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50/50 uppercase tracking-wide">
                      <Zap className="w-3.5 h-3.5 text-emerald-600" />
                      Free Models
                    </DropdownMenu.Label>
                  </div>
                  <div className="p-1.5 pt-1">
                    {FREE_MODELS.map((model) => (
                      <ModelItem
                        key={model.id}
                        model={model}
                        isSelected={value === model.id}
                        onSelect={() => handleSelect(model.id)}
                      />
                    ))}
                  </div>
                </div>

                <div className="h-px bg-stone-100" />

                {/* Paid Models Section */}
                <div className="flex flex-col">
                  <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-amber-100/50">
                    <DropdownMenu.Label className="flex flex-col gap-0.5 px-3 py-2 text-xs font-bold text-amber-700 bg-amber-50/50 uppercase tracking-wide">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Premium Models</span>
                      </div>
                      {!hasApiKey && (
                        <div className="text-[10px] font-medium normal-case tracking-normal text-amber-700/80">
                          Add OpenRouter key to enable access
                        </div>
                      )}
                    </DropdownMenu.Label>
                  </div>
                  <div className="p-1.5 pt-1">
                    {PAID_MODELS.map((model) => (
                      <ModelItem
                        key={model.id}
                        model={model}
                        isSelected={value === model.id}
                        onSelect={() => handleSelect(model.id)}
                        disabled={!hasApiKey}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Paid Models Section */}
                <div className="flex flex-col">
                  <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-amber-100/50">
                    <DropdownMenu.Label className="flex flex-col gap-0.5 px-3 py-2 text-xs font-bold text-amber-700 bg-amber-50/50 uppercase tracking-wide">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>Premium Models</span>
                      </div>
                      {!hasApiKey && (
                        <div className="text-[10px] font-medium normal-case tracking-normal text-amber-700/80">
                          Add OpenRouter key to enable access
                        </div>
                      )}
                    </DropdownMenu.Label>
                  </div>
                  <div className="p-1.5 pt-1">
                    {PAID_MODELS.map((model) => (
                      <ModelItem
                        key={model.id}
                        model={model}
                        isSelected={value === model.id}
                        onSelect={() => handleSelect(model.id)}
                        disabled={!hasApiKey}
                      />
                    ))}
                  </div>
                </div>

                <div className="h-px bg-stone-100" />

                {/* Free Models Section */}
                <div className="flex flex-col">
                  <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-emerald-100/50">
                    <DropdownMenu.Label className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50/50 uppercase tracking-wide">
                      <Zap className="w-3.5 h-3.5 text-emerald-600" />
                      Free Models
                    </DropdownMenu.Label>
                  </div>
                  <div className="p-1.5 pt-1">
                    {FREE_MODELS.map((model) => (
                      <ModelItem
                        key={model.id}
                        model={model}
                        isSelected={value === model.id}
                        onSelect={() => handleSelect(model.id)}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
