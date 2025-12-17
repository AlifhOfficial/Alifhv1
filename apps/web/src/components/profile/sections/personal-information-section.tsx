/**
 * Personal Information Section Component
 */

'use client';

interface PersonalInformationSectionProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  originalEmail?: string;
  originalPhone?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  isEditing: boolean;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onEmailVerificationClick: () => void;
  onPhoneVerificationClick: () => void;
}

export function PersonalInformationSection({
  firstName,
  lastName,
  email,
  phone,
  originalEmail,
  originalPhone,
  emailVerified,
  phoneVerified,
  isEditing,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPhoneChange,
  onEmailVerificationClick,
  onPhoneVerificationClick,
}: PersonalInformationSectionProps) {
  // Check if email or phone has changed from original
  const emailHasChanged = originalEmail && email !== originalEmail;
  const phoneHasChanged = originalPhone && phone !== originalPhone;
  const showEmailAsVerified = emailVerified && !emailHasChanged;
  const showPhoneAsVerified = phoneVerified && !phoneHasChanged;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">
            First name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={firstName}
              onChange={(e) => onFirstNameChange(e.target.value)}
              placeholder="First name"
              className="w-full h-10 px-3 bg-background border border-border/40 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
            />
          ) : (
            <p className="h-10 px-3 flex items-center text-sm text-foreground">
              {firstName || '—'}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">
            Last name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={lastName}
              onChange={(e) => onLastNameChange(e.target.value)}
              placeholder="Last name"
              className="w-full h-10 px-3 bg-background border border-border/40 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
            />
          ) : (
            <p className="h-10 px-3 flex items-center text-sm text-foreground">
              {lastName || '—'}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2 sm:col-span-2">
        <label className="text-xs text-muted-foreground">
          Email
        </label>
        {isEditing ? (
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="email@example.com"
            className="w-full h-10 px-3 bg-background border border-border/40 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
          />
        ) : (
          <div className="h-10 px-3 flex items-center justify-between text-sm text-foreground">
            <span>{email || '—'}</span>
            {showEmailAsVerified ? (
              <div className="flex items-center gap-1.5" title="Email verified">
                <div className="relative inline-flex items-center justify-center w-4 h-4">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                    <circle cx="12" cy="12" r="10" className="text-primary" />
                    <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                </div>
                <span className="text-xs text-muted-foreground">Verified</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <div className="relative inline-flex items-center justify-center w-4 h-4">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                    <circle cx="12" cy="12" r="10" className="text-muted-foreground/40" />
                    <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                </div>
                <button
                  onClick={onEmailVerificationClick}
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  Verify email
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2 sm:col-span-2">
        <label className="text-xs text-muted-foreground">
          Phone number
        </label>
        {isEditing ? (
          <input
            type="tel"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="+971 50 123 4567"
            className="w-full h-10 px-3 bg-background border border-border/40 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
          />
        ) : (
          <div className="h-10 px-3 flex items-center justify-between text-sm text-foreground">
            <span>{phone || '—'}</span>
            {showPhoneAsVerified ? (
              <div className="flex items-center gap-1.5" title="Phone verified">
                <div className="relative inline-flex items-center justify-center w-4 h-4">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                    <circle cx="12" cy="12" r="10" className="text-primary" />
                    <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                </div>
                <span className="text-xs text-muted-foreground">Verified</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <div className="relative inline-flex items-center justify-center w-4 h-4">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                    <circle cx="12" cy="12" r="10" className="text-muted-foreground/40" />
                    <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                </div>
                <button 
                  onClick={onPhoneVerificationClick}
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  Verify phone
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
