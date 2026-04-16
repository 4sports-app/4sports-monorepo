import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Banknote, Building } from 'lucide-react';
import { useRecordPayment } from './useEvidence';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const DEFAULT_MEMBERSHIP_FEE = 3000;

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  memberName: string;
  month: number;
  year: number;
  membershipFee?: number;
}

export function RecordPaymentDialog({ open, onOpenChange, memberId, memberName, month, year, membershipFee }: RecordPaymentDialogProps) {
  const fee = membershipFee || DEFAULT_MEMBERSHIP_FEE;
  const { t } = useTranslation();
  const { toast } = useToast();
  const recordPayment = useRecordPayment();
  const [amount, setAmount] = useState(String(fee));
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK_TRANSFER'>('CASH');
  const [note, setNote] = useState('');

  const months = t('calendar.months', { returnObjects: true }) as string[];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    try {
      await recordPayment.mutateAsync({
        memberId,
        amount: fee,
        paidAmount: Number(amount),
        paymentMethod,
        note: note || `${months[month - 1]} ${year}`,
        period: { month, year },
      });

      toast({ title: t('common.success'), description: t('evidence.paymentRecorded', { name: memberName }) });
      resetForm();
      onOpenChange(false);
    } catch {
      toast({ title: t('common.error'), description: t('evidence.paymentFailed'), variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setAmount(String(fee));
    setPaymentMethod('CASH');
    setNote('');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) resetForm(); onOpenChange(isOpen); }}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{t('evidence.recordPaymentTitle')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{memberName}</span>
              {' '}&mdash;{' '}{months[month - 1]} {year}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">{t('evidence.amountRSD')}</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                min="0"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>{t('evidence.paymentMethod')}</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={paymentMethod === 'CASH' ? 'default' : 'outline'}
                  className={cn(paymentMethod === 'CASH' && 'bg-green-600 hover:bg-green-700')}
                  onClick={() => setPaymentMethod('CASH')}
                >
                  <Banknote className="mr-2 h-4 w-4" />
                  {t('evidence.cash')}
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === 'BANK_TRANSFER' ? 'default' : 'outline'}
                  className={cn(paymentMethod === 'BANK_TRANSFER' && 'bg-green-600 hover:bg-green-700')}
                  onClick={() => setPaymentMethod('BANK_TRANSFER')}
                >
                  <Building className="mr-2 h-4 w-4" />
                  {t('evidence.bankTransfer')}
                </Button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="note">{t('evidence.noteOptional')}</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t('evidence.notePlaceholder')}
                className="min-h-[60px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={recordPayment.isPending}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={recordPayment.isPending || !amount}>
              {recordPayment.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('common.saving')}</>
              ) : (
                t('evidence.record')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
