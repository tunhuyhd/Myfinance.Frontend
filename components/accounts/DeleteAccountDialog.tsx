'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { accountService, Account } from '@/services/accounts.service';
import { toast } from 'sonner';
import { Loader2, AlertTriangle, X } from 'lucide-react';

interface DeleteAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
}

export function DeleteAccountDialog({ isOpen, onClose, account }: DeleteAccountDialogProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => accountService.deleteAccount(account!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Xóa tài khoản thành công!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa!');
    },
  });

  if (!isOpen || !account) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Xóa ví "{account.name}"?
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Hành động này sẽ xóa hoàn toàn ví của bạn. Tất cả các giao dịch thu/chi liên quan đến ví này cũng có thể bị mất. Bạn không thể hoàn tác hành động này.
          </p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              disabled={mutation.isPending}
              className="flex-1 px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-70"
            >
              Hủy
            </button>
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="flex-1 flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-70"
            >
              {mutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Xóa ví'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
