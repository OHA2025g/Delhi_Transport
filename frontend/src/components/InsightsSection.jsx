import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, ListChecks, Target } from "lucide-react";

function ListBlock({ title, icon: Icon, items, cardClassName = "" }) {
  return (
    <Card className={`bg-white/95 backdrop-blur-xl border-white/30 shadow-sm ${cardClassName}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-gray-900 text-base flex items-center gap-2">
          <Icon className="w-4 h-4 text-violet-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {items?.length ? (
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
            {items.map((t, idx) => (
              <li key={`${title}-${idx}`}>{t}</li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-gray-500">No items available.</div>
        )}
      </CardContent>
    </Card>
  );
}

export default function InsightsSection({
  title = "Insights",
  insights = [],
  recommendations = [],
  actionItems = [],
  className = "",
  titleClassName = "text-gray-900",
  cardClassName = "",
}) {
  return (
    <div className={`space-y-3 ${className}`} data-testid="insights-section">
      {title ? <div className={`text-sm font-semibold ${titleClassName}`}>{title}</div> : null}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <ListBlock title="Insights" icon={Lightbulb} items={insights} cardClassName={cardClassName} />
        <ListBlock title="Recommendations" icon={Target} items={recommendations} cardClassName={cardClassName} />
        <ListBlock title="Action Items" icon={ListChecks} items={actionItems} cardClassName={cardClassName} />
      </div>
    </div>
  );
}


