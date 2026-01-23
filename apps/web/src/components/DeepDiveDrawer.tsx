import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { type NoteBlock } from '@/lib/schemas';
import ReactMarkdown from 'react-markdown';
import {
  getModeIcon,
  getModeTitle,
  getDeepDiveColors,
  DEEP_DIVE_COLORS,
} from '@/lib/deepDiveHelpers';

interface DeepDiveDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  block: NoteBlock | null;
  parentBlock?: NoteBlock | null;
}

export function DeepDiveDrawer({ isOpen, onClose, block, parentBlock }: DeepDiveDrawerProps) {
  const isDeepDive = block?.blockType === 'deep-dive';
  const mode = isDeepDive ? block.deepDiveMode : undefined;

  // Get colors
  const colors = isDeepDive ? getDeepDiveColors(mode) : DEEP_DIVE_COLORS.default;

  // Title logic:
  // 1. If deep dive, show parent title (context)
  // 2. Fallback to own title
  const displayTitle =
    isDeepDive && parentBlock?.title ? parentBlock.title : (block?.title ?? 'Details');

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        className="w-[400px] sm:w-[800px] sm:max-w-3xl overflow-y-auto p-0 shadow-2xl transition-all duration-300"
        style={{
          borderLeft: isDeepDive ? `4px solid ${colors.border}` : undefined,
        }}
      >
        {/* Header Section */}
        <div className="bg-stone-50 border-b border-stone-100 p-8 sticky top-0 z-10">
          <SheetHeader className="space-y-4">
            <div className="flex items-center gap-2">
              {isDeepDive &&
                (() => {
                  const Icon = getModeIcon(mode);
                  return (
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium tracking-wide uppercase"
                      style={{
                        backgroundColor: colors.bg,
                        color: colors.text,
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      <Icon className="w-3.5 h-3.5" /> {getModeTitle(mode)}
                    </span>
                  );
                })()}
            </div>
            <SheetTitle className="text-3xl font-bold text-stone-900 leading-tight font-hand tracking-tight">
              {displayTitle}
            </SheetTitle>
            <SheetDescription className="text-base text-stone-500 font-medium">
              {isDeepDive ? 'A deeper look into the concept.' : 'Note details and summary.'}
            </SheetDescription>
          </SheetHeader>
        </div>

        {/* Content Section */}
        <div className="p-8 pb-20">
          <div
            className="prose prose-lg prose-stone max-w-none
                        prose-headings:font-hand prose-headings:font-bold prose-headings:text-stone-800
                        prose-p:leading-loose prose-p:text-stone-600 prose-p:mb-6
                        prose-strong:text-stone-900 prose-strong:font-semibold
                        prose-li:text-stone-600 prose-li:marker:text-stone-400
                        prose-blockquote:border-l-4 prose-blockquote:border-stone-200 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-stone-500
                        prose-code:bg-stone-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-stone-800 prose-code:font-medium prose-code:before:content-none prose-code:after:content-none
                    "
          >
            {block?.summary ? (
              <ReactMarkdown>{block.summary}</ReactMarkdown>
            ) : (
              <p className="text-stone-400 italic">No content available.</p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
