/**
 * Settings Section Component
 */

'use client';

interface SettingsSectionProps {
  consignmentMode: boolean;
  showPhone: boolean;
  isEditing: boolean;
  onConsignmentModeToggle: () => void;
  onShowPhoneToggle: () => void;
}

export function SettingsSection({
  consignmentMode,
  showPhone,
  isEditing,
  onConsignmentModeToggle,
  onShowPhoneToggle,
}: SettingsSectionProps) {
  return (
    <>
      {/* Consignment Mode */}
      <div className="flex items-center justify-between py-3 border-b border-border/40">
        <div>
          <label className="text-sm font-medium text-foreground">
            Consignment Mode
          </label>
          <p className="text-xs text-muted-foreground mt-1">
            Enable to list vehicles on consignment
          </p>
        </div>
        {isEditing ? (
          <button
            onClick={onConsignmentModeToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              consignmentMode ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                consignmentMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        ) : (
          <span className="text-sm text-muted-foreground">
            {consignmentMode ? 'Enabled' : 'Disabled'}
          </span>
        )}
      </div>

      {/* Privacy Settings */}
      <div className="flex items-center justify-between py-3">
        <div>
          <label className="text-sm font-medium text-foreground">
            Show Phone Number
          </label>
          <p className="text-xs text-muted-foreground mt-1">
            Display your phone number on your public profile
          </p>
        </div>
        {isEditing ? (
          <button
            onClick={onShowPhoneToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              showPhone ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                showPhone ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        ) : (
          <span className="text-sm text-muted-foreground">
            {showPhone ? 'Visible' : 'Hidden'}
          </span>
        )}
      </div>
    </>
  );
}
