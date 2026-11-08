// Entrega um arquivo gerado no navegador ao estudante.
// Dentro do claude.ai o download passa pela confirmação do próprio site;
// em qualquer outro lugar (GitHub Pages, arquivo local) usa o download normal.

type DownloadsApi = { save: (r: { filename: string; data: Blob }) => Promise<unknown> };
type ClaudeHost = { use: (name: string) => Promise<unknown> };

const host = (): ClaudeHost | undefined => (window as unknown as { claude?: ClaudeHost }).claude;

/** true quando o site roda dentro do visualizador do claude.ai. */
export const insideArtifact = () => typeof host()?.use === 'function';

/** Imprimir só funciona quando o site é aberto diretamente no navegador. */
export const canPrint = () => !insideArtifact();

export type SaveResult = 'saved' | 'declined';

export async function saveFile(filename: string, blob: Blob): Promise<SaveResult> {
  const h = host();
  if (h?.use) {
    const downloads = (await h.use('downloads').catch(() => null)) as DownloadsApi | null;
    if (downloads) {
      try {
        await downloads.save({ filename, data: blob });
        return 'saved';
      } catch (e) {
        const code = (e as { code?: string })?.code;
        if (code === 'declined') return 'declined';
        throw new Error(code === 'rate_limited' ? 'Já existe um download aguardando confirmação. Tente de novo em instantes.' : 'Não foi possível baixar o arquivo aqui.');
      }
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return 'saved';
}

export const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'tca';
