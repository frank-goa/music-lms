"use client";

import { useState } from "react";
import { FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaPlayerProps {
  fileUrl: string;
  fileType: "pdf" | "audio" | "video";
}

export function MediaPlayer({ fileUrl, fileType }: MediaPlayerProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/50">
        <p className="text-muted-foreground mb-4">
          Unable to load the file. Click below to open it directly.
        </p>
        <Button asChild>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open in New Tab
          </a>
        </Button>
      </div>
    );
  }

  if (fileType === "audio") {
    return (
      <div className="p-4 bg-muted/30 rounded-lg">
        <audio
          controls
          className="w-full"
          onError={() => setError(true)}
          preload="metadata"
        >
          <source src={fileUrl} />
          Your browser does not support the audio element.
        </audio>
      </div>
    );
  }

  if (fileType === "video") {
    return (
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <video
          controls
          className="w-full h-full"
          onError={() => setError(true)}
          preload="metadata"
        >
          <source src={fileUrl} />
          Your browser does not support the video element.
        </video>
      </div>
    );
  }

  // PDF
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center p-8 border rounded-lg bg-muted/30">
        <div className="text-center">
          <FileText className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <p className="text-sm text-muted-foreground mb-4">
            PDF Document
          </p>
          <Button asChild>
            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open PDF
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
