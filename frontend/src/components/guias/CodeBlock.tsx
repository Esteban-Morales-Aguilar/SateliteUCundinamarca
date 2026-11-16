import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import { guessLang } from '../../utils/format';

/** {t('codeBlock.syntaxHighlight')} (Prism.js) {t('codeBlock.copyButton')}. */
export function CodeBlock({ code }: { code: string }) {
  const { t } = useTranslation();
  const ref = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const lang = guessLang(code);
  useEffect(() => { if (ref.current) Prism.highlightElement(ref.current); }, [code]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* portapapeles bloqueado */ }
  };
  return (
    <div className="relative my-5 overflow-hidden rounded-xl bg-space-900 text-slate-100">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs text-slate-400">
        <span className="mono">{lang}</span>
        <button onClick={() => void copy()} className="rounded px-2 py-1 font-semibold text-sky-300 hover:bg-white/10" aria-live="polite">{copied ? t('common.copied') : t('common.copy')}</button>
      </div>
      <pre className={`language-${lang} overflow-x-auto !m-0 !bg-transparent p-4`} tabIndex={0}><code ref={ref} className={`language-${lang}`}>{code}</code></pre>
    </div>
  );
}
