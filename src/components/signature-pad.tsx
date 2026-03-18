"use client";

import { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
}

export function SignaturePad({ onSave }: SignaturePadProps) {
  const sigRef = useRef<SignatureCanvas>(null);

  function handleClear() {
    sigRef.current?.clear();
  }

  function handleSave() {
    if (sigRef.current && !sigRef.current.isEmpty()) {
      onSave(sigRef.current.toDataURL());
    }
  }

  return (
    <div>
      <div className="overflow-hidden rounded-lg border bg-white">
        <SignatureCanvas
          ref={sigRef}
          canvasProps={{
            className: "w-full h-40",
            style: { width: "100%", height: "160px" },
          }}
          penColor="#1f1f1d"
        />
      </div>
      <div className="mt-2 flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={handleClear}>
          Clear
        </Button>
        <Button type="button" size="sm" onClick={handleSave}>
          Save Signature
        </Button>
      </div>
    </div>
  );
}
