"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
// Preserve existing entry points while keeping a single creation flow.
export default function CreateUniverseModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void; onSuccess?: () => void }) {
  const router = useRouter();
  useEffect(() => { if (isOpen) { router.push('/universe/create'); onClose(); } }, [isOpen, onClose, router]);
  return null;
}
