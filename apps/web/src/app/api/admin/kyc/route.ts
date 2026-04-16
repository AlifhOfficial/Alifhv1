/**
 * Admin KYC List API
 * 
 * GET /api/admin/kyc - List all KYC records with filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session-context';
import { decryptSensitiveData, maskDocumentNumber } from '@/lib/kyc/encryption';
import { getAllKycRecordsFull, getKycStats, type KycStatus } from '@alifh/database';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    // Check admin auth
    const user = await getSessionUser();
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = (searchParams.get('status') || 'all') as KycStatus | 'all';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = (page - 1) * limit;
    
    // Option to return masked or unmasked document numbers
    // For security, default to masked unless explicitly requested
    const unmask = searchParams.get('unmask') === 'true';

    // Get records and stats in parallel
    const [{ records, total }, stats] = await Promise.all([
      getAllKycRecordsFull({ status, limit, offset }),
      getKycStats(),
    ]);

    // Decrypt and optionally mask sensitive document numbers for display
    const processedRecords = records.map(record => {
      if (record.documentNumber) {
        const decrypted = decryptSensitiveData(record.documentNumber);
        return {
          ...record,
          documentNumber: unmask ? decrypted : maskDocumentNumber(decrypted),
          // Keep encrypted version for audit purposes
          documentNumberEncrypted: record.documentNumber,
        };
      }
      return record;
    });

    return NextResponse.json({
      records: processedRecords,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats,
    });
  } catch (error) {
    console.error('[Admin/KYC] List failed:', error);
    return NextResponse.json({ error: 'Failed to load KYC records' }, { status: 500 });
  }
}
