import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { NoteBlock } from "@/lib/schemas";
import ReactMarkdown from "react-markdown";

interface DeepDiveDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    block: NoteBlock | null;
}

export function DeepDiveDrawer({ isOpen, onClose, block }: DeepDiveDrawerProps) {
    // Even if block is null, we might want to render the Sheet to allow the exit animation to play if it was just closed.
    // However, Shadcn Sheet handles unmounting.
    // If block is null but isOpen is true, that's an invalid state, but we can handle it gracefully.

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{block?.title ?? 'Details'}</SheetTitle>
                    <SheetDescription>
                        {block?.blockType === 'deep-dive' ? `Deep Dive: ${block.deepDiveMode}` : 'Note Details'}
                    </SheetDescription>
                </SheetHeader>
                <div className="mt-6 prose prose-sm dark:prose-invert max-w-none">
                    {block?.summary ? (
                        <ReactMarkdown>{block.summary}</ReactMarkdown>
                    ) : (
                        <p className="text-muted-foreground">No content available.</p>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
