import {
  Clock,
  Moon,
  Ban,
  Flame,
  Dog,
  Car,
  Volume2,
  MoveRight,
  Trash2,
  Table,
} from "lucide-react";
import type { PropertyInfo } from "@/types";

const ruleIcons: Record<string, React.ReactNode> = {
  "Quiet hours": <Moon className="size-4 shrink-0 text-muted-foreground" />,
  "Pack-in": <Trash2 className="size-4 shrink-0 text-muted-foreground" />,
  "No firearms": <Ban className="size-4 shrink-0 text-muted-foreground" />,
  Campfires: <Flame className="size-4 shrink-0 text-muted-foreground" />,
  Dogs: <Dog className="size-4 shrink-0 text-muted-foreground" />,
  "Do not move": <Table className="size-4 shrink-0 text-muted-foreground" />,
  "$200": <Car className="size-4 shrink-0 text-muted-foreground" />,
  "4WD": <MoveRight className="size-4 shrink-0 text-muted-foreground" />,
  "No amplified": <Volume2 className="size-4 shrink-0 text-muted-foreground" />,
  Generators: <Volume2 className="size-4 shrink-0 text-muted-foreground" />,
};

function getIconForRule(rule: string) {
  for (const [key, icon] of Object.entries(ruleIcons)) {
    if (rule.startsWith(key)) return icon;
  }
  return <Ban className="size-4 shrink-0 text-muted-foreground" />;
}

interface RulesPoliciesProps {
  propertyInfo: PropertyInfo;
}

export function RulesPolicies({ propertyInfo }: RulesPoliciesProps) {
  return (
    <div className="space-y-8">
      {/* Check-in/out times */}
      <div>
        <h2 className="font-heading text-xl font-semibold">Check-in & Check-out</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <Clock className="size-5 text-forest" />
            <div>
              <p className="text-sm text-muted-foreground">Check-in</p>
              <p className="font-medium">{propertyInfo.checkInTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <Clock className="size-5 text-forest" />
            <div>
              <p className="text-sm text-muted-foreground">Check-out</p>
              <p className="font-medium">{propertyInfo.checkOutTime}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation policy */}
      <div>
        <h2 className="font-heading text-xl font-semibold">Cancellation Policy</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {propertyInfo.cancellationPolicy}
        </p>
      </div>

      {/* House rules */}
      <div>
        <h2 className="font-heading text-xl font-semibold">House Rules</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {propertyInfo.houseRules.map((rule) => (
            <div key={rule} className="flex items-start gap-2.5 text-sm">
              {getIconForRule(rule)}
              <span>{rule}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
