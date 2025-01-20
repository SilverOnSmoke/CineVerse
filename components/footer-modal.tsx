'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

export function FooterModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Info Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed bottom-20 right-4 z-40 rounded-full bg-background/80 backdrop-blur-sm shadow-lg md:hidden"
        onClick={() => setOpen(true)}
      >
        <Info className="h-4 w-4" />
      </Button>

      {/* Footer Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="h-[80vh]">
          <SheetHeader>
            <SheetTitle>About CineVerse</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              CineVerse does not host or store videos; all content is provided by
              unaffiliated third parties and accessed through our website.
            </p>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Legal</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>Terms of Service</li>
                <li>Privacy Policy</li>
                <li>DMCA</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Contact</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>Support</li>
                <li>Report an Issue</li>
                <li>Feedback</li>
              </ul>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}