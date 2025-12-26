/**
 * Real-time notifications for consignment leads
 */

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

interface ConsignmentLeadNotification {
  type: 'consignment_lead';
  leadId: string;
  partnerId: string;
  listing: {
    make: string;
    model: string;
    year: number;
    price: number;
  };
}

/**
 * Notify partner staff about new consignment lead via WebSocket
 * Sends to all staff members of the partner in real-time
 */
export async function notifyNewConsignmentLead(
  partnerId: string,
  leadData: {
    leadId: string;
    make: string;
    model: string;
    year: number;
    price: number;
  }
) {
  try {
    // In production, you'd publish to a message broker (Redis Pub/Sub, etc.)
    // For now, we'll call the WS server's HTTP API to broadcast
    
    const notification: ConsignmentLeadNotification = {
      type: 'consignment_lead',
      leadId: leadData.leadId,
      partnerId,
      listing: {
        make: leadData.make,
        model: leadData.model,
        year: leadData.year,
        price: leadData.price,
      },
    };

    // Send to internal WS broadcast endpoint
    // The WS server will publish to all staff members of this partner
    await fetch(`${WS_URL.replace('ws:', 'http:')}/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: `partner:${partnerId}:consignment`,
        data: notification,
      }),
    }).catch(err => {
      console.error('[Consignment] WS notification failed:', err);
      // Don't throw - notifications are best-effort
    });

    console.log(`[Consignment] Notified partner ${partnerId} about lead ${leadData.leadId}`);
  } catch (error) {
    console.error('[Consignment] Notification error:', error);
  }
}

/**
 * Browser-side hook to listen for consignment lead notifications
 * Usage in staff dashboard:
 * 
 * const { ws, lastLead } = useConsignmentNotifications(partnerId);
 */
export function useConsignmentWebSocket(partnerId: string) {
  if (typeof window === 'undefined') return null;

  const ws = new WebSocket(WS_URL);
  
  ws.onopen = () => {
    // Subscribe to partner's consignment channel
    ws.send(JSON.stringify({
      type: 'subscribe',
      channel: `partner:${partnerId}:consignment`,
    }));
  };

  return ws;
}
