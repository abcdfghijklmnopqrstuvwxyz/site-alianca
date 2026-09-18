import { NextRequest } from 'next/server';
import { handleUpdate, handleDelete } from '@/lib/communityAdmin';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  return handleUpdate(req, params.id, 'CHANNEL');
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return handleDelete(req, params.id, 'CHANNEL');
}
