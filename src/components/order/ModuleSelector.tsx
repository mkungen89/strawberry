"use client";
import { MODULES } from "@/lib/services-data";
import { useCurrency } from "@/lib/currency-context";
import { Check } from "lucide-react";

interface Props {
  serviceSlug: string;
  selectedModules: string[];
  onToggle: (moduleId: string) => void;
}

export default function ModuleSelector({ serviceSlug, selectedModules, onToggle }: Props) {
  const { format } = useCurrency();
  const available = MODULES.filter(m => m.category.includes(serviceSlug));

  if (available.length === 0) return null;

  return (
    <div>
      <h3 className="mb-2 font-semibold text-gray-200">Add-on modules</h3>
      <p className="mb-4 text-sm text-gray-400">
        Pick the features you need. Each module is added to your total price.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {available.map((mod) => {
          const selected = selectedModules.includes(mod.id);
          return (
            <button
              key={mod.id}
              onClick={() => onToggle(mod.id)}
              className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                selected
                  ? "border-purple-500 bg-purple-600/10"
                  : "border-white/10 bg-white/5 hover:border-white/30"
              }`}
            >
              <div className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
                selected ? "bg-purple-600" : "border border-white/30"
              }`}>
                {selected && <Check className="h-3 w-3 text-white" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-white">{mod.name}</span>
                  <span className="text-sm font-bold text-purple-400 whitespace-nowrap">+{format(mod.price, mod.priceGBP)}</span>
                </div>
                <p className="mt-0.5 text-xs text-gray-500">{mod.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
