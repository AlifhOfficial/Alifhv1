/**
 * Specialties Section Component
 */

"use client";

interface SpecialtiesSectionProps {
  specialties: string[];
  availableSpecialties: string[];
  isEditing: boolean;
  onSpecialtyToggle: (specialty: string) => void;
}

export function SpecialtiesSection({
  specialties,
  availableSpecialties,
  isEditing,
  onSpecialtyToggle,
}: SpecialtiesSectionProps) {
  return (
    <div className="space-y-3">
      {isEditing ? (
        <div className="flex flex-wrap gap-2">
          {availableSpecialties.map((specialty) => (
            <button
              key={specialty}
              onClick={() => onSpecialtyToggle(specialty)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                specialties.includes(specialty)
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {specialty}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {specialties.length > 0 ? (
            specialties.map((specialty) => (
              <div
                key={specialty}
                className="px-3 py-1.5 bg-muted/50 text-muted-foreground text-xs font-medium rounded-lg"
              >
                {specialty}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">—</p>
          )}
        </div>
      )}
    </div>
  );
}
