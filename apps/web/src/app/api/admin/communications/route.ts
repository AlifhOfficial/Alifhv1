/**
 * Admin Communications API
 * GET /api/admin/communications - List all communications
 * POST /api/admin/communications - Update status, mark read, add notes
 * DELETE /api/admin/communications - Delete communication
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  getAdminCommunications, 
  updateCommunicationStatus,
  markCommunicationRead,
  markCommunicationsRead,
  addCommunicationNote,
  deleteCommunication,
  getCommunicationStats,
} from '@alifh/database';
import { getSessionUser } from '@/lib/auth/session-context';

export const runtime = 'nodejs';

/**
 * GET /api/admin/communications - List all communications
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'new' | 'in_progress' | 'resolved' | 'archived' | null;
    const type = searchParams.get('type') as 'inquiry' | 'support' | 'partnership' | 'feedback' | 'report' | 'other' | null;
    const isRead = searchParams.get('isRead');
    const search = searchParams.get('search');
    const statsOnly = searchParams.get('statsOnly') === 'true';

    // Return just stats if requested
    if (statsOnly) {
      const stats = await getCommunicationStats();
      return NextResponse.json({ stats });
    }

    const communications = await getAdminCommunications({
      status: status || undefined,
      type: type || undefined,
      isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
      search: search || undefined,
    });

    const response = NextResponse.json({ communications });
    return response;
  } catch (error) {
    console.error('Error fetching communications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch communications' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/communications - Update communications
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { communicationId, communicationIds, action, status, adminNote } = await request.json();

    // Mark multiple as read
    if (action === 'markMultipleRead' && communicationIds?.length > 0) {
      const count = await markCommunicationsRead(communicationIds);
      return NextResponse.json({ success: true, count });
    }

    // Single communication actions require ID
    if (!communicationId) {
      return NextResponse.json({ error: 'Communication ID required' }, { status: 400 });
    }

    // Mark as read
    if (action === 'markRead') {
      await markCommunicationRead(communicationId);
      return NextResponse.json({ success: true });
    }

    // Add note
    if (action === 'addNote') {
      if (!adminNote || typeof adminNote !== 'string') {
        return NextResponse.json({ error: 'Note text required' }, { status: 400 });
      }
      await addCommunicationNote(communicationId, adminNote);
      return NextResponse.json({ success: true });
    }

    // Update status
    if (action === 'updateStatus') {
      const validStatuses = ['new', 'in_progress', 'resolved', 'archived'];
      if (!status || !validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Valid status required' }, { status: 400 });
      }

      await updateCommunicationStatus(
        communicationId, 
        status, 
        user.id,
        adminNote || undefined
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating communication:', error);
    return NextResponse.json(
      { error: 'Failed to update communication' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/communications - Delete a communication
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (user.role !== 'admin' && user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const communicationId = searchParams.get('id');

    if (!communicationId) {
      return NextResponse.json({ error: 'Communication ID required' }, { status: 400 });
    }

    const deleted = await deleteCommunication(communicationId);

    if (!deleted) {
      return NextResponse.json({ error: 'Communication not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting communication:', error);
    return NextResponse.json(
      { error: 'Failed to delete communication' },
      { status: 500 }
    );
  }
}
