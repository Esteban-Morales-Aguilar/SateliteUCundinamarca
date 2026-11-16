import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { mediaService, mediaUrl } from '../../services/media.service';

/** {t('pdfButton.downloadPdf')}; si no, {t('pdfButton.indicatesWithoutBreaking')}. */
export function PdfButton({ file, label }: { file: string; label: string }) {
  const { t } = useTranslation();
  const { data: exists, isLoading } = useQuery({ queryKey: ['pdf-exists', file], queryFn: () => mediaService.exists('pdf', file) });
  if (isLoading) return null;
  return exists ? (
    <a className="btn-primary" href={mediaUrl('pdf', file)} download>{t('common.download')} {label} (PDF)</a>
  ) : (
    <span className="inline-flex items-center rounded-lg border border-dashed border-slate-300 px-4 py-2.5 text-sm text-slate-500 dark:border-space-600">{t('pdfButton.pdfNotAvailable')}</span>
  );
}
