/**
 * UsageCapModal — shown when a user hits their monthly AI editor usage cap.
 */

import type { BudgetStatus } from '../../utils/usageTracking';
import { CAPS } from '../../utils/usageTracking';

interface UsageCapModalProps {
  budgetStatus: BudgetStatus;
  isLoggedIn: boolean;
  onClose: () => void;
  onSignUp?: () => void;
}

function getResetDate(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

export function UsageCapModal({ budgetStatus, isLoggedIn, onClose, onSignUp }: UsageCapModalProps) {
  const isGuestCap = budgetStatus.reason === 'guest_cap';
  const usedDollars = ((budgetStatus.capCents - budgetStatus.remainingCents) / 100).toFixed(2);
  const capDollars = (budgetStatus.capCents / 100).toFixed(2);

  return (
    <div className="usage-cap-overlay" onClick={onClose}>
      <div className="usage-cap-modal" onClick={e => e.stopPropagation()}>
        <div className="usage-cap-header">
          Monthly limit reached
        </div>
        <div className="usage-cap-body">
          {isGuestCap ? (
            <>
              <p>
                You've used your free monthly allowance of <strong>${capDollars}</strong> in AI editor credits.
              </p>
              <p>
                Sign up for a free account to get <strong>${(CAPS.registered / 100).toFixed(2)}</strong>/month in AI editor credits — that's {Math.round(CAPS.registered / CAPS.guest)}x more.
              </p>
            </>
          ) : (
            <>
              <p>
                You've used <strong>${usedDollars}</strong> of your <strong>${capDollars}</strong>/month AI editor allowance.
              </p>
              <p>
                Your allowance resets on <strong>{getResetDate()}</strong>.
              </p>
            </>
          )}
          <p className="usage-cap-tip">
            You can also add your own Anthropic API key in Editor settings to use the editor without limits.
          </p>
        </div>
        <div className="usage-cap-actions">
          {isGuestCap && onSignUp && (
            <button className="usage-cap-btn primary" onClick={onSignUp}>
              Sign up free
            </button>
          )}
          <button className="usage-cap-btn" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
