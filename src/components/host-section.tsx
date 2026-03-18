import { MessageCircle, Clock, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PropertyInfo } from "@/types";

interface HostSectionProps {
  host: PropertyInfo["host"];
}

export function HostSection({ host }: HostSectionProps) {
  const initials = host.names
    .split("&")
    .map((n) => n.trim()[0])
    .join(" & ");

  return (
    <div>
      <h2 className="font-heading text-xl font-semibold">Hosted by {host.names}</h2>
      <div className="mt-4 flex gap-5">
        {/* Avatar */}
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-cedar text-lg font-semibold text-cedar-foreground">
          {initials}
        </div>

        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-muted-foreground">{host.bio}</p>

          {/* Badges */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <ThumbsUp className="size-3.5" />
              <span>{host.responseRate}% response rate</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="size-3.5" />
              <span>Responds {host.responseTime}</span>
            </div>
          </div>

          <Button variant="outline" size="sm" render={<a href={`mailto:${host.email}`} />}>
            <MessageCircle className="mr-1.5 size-3.5" />
            Contact Host
          </Button>
        </div>
      </div>
    </div>
  );
}
