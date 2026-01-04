/**
 * Banned User Page - User Dashboard
 * Shown when a user's account has been suspended
 * Automatically displayed when user is banned
 */

import Link from 'next/link';
import { Ban, Mail } from 'lucide-react';

export default function UserBannedPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
          <Ban className="w-10 h-10 text-red-500" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Account Suspended
          </h1>
          <p className="text-muted-foreground">
            Your account has been suspended due to a violation of our terms of service.
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-muted/50 rounded-xl p-4 text-left space-y-3">
          <h3 className="font-medium text-sm">What can you do?</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Review our <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> to understand why your account may have been suspended.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>If you believe this is a mistake, you can submit an appeal.</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="mailto:support@alifh.com?subject=Ban%20Appeal"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <Mail className="w-4 h-4" />
            Submit Appeal
          </Link>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground">
          If you have any questions, please contact our support team.
        </p>
      </div>
    </div>
  );
}
