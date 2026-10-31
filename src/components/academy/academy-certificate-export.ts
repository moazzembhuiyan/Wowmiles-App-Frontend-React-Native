import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { featuredCourse } from './academy-data';

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function createCertificateHtml() {
  const courseTitle = escapeHtml(featuredCourse.title);
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      @page { size: A4 landscape; margin: 0; }
      * { box-sizing: border-box; }
      body { margin: 0; background: #f2f4fa; color: #202638; font-family: Arial, Helvetica, sans-serif; }
      .page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 48px; }
      .certificate { width: 100%; max-width: 960px; padding: 62px 72px; border: 2px solid #dfe2ee; background: #fff; text-align: center; }
      .brand { color: #4145b6; font-size: 13px; font-weight: 700; letter-spacing: 3px; }
      .seal { width: 62px; height: 62px; margin: 28px auto 16px; border-radius: 50%; background: #ffb91f; color: #202638; font-size: 28px; line-height: 62px; }
      .label { color: #737b8a; font-size: 11px; font-weight: 700; letter-spacing: 2px; }
      h1 { margin: 18px 0; font-size: 29px; line-height: 1.25; }
      .recipient { margin-top: 30px; font-size: 24px; }
      .agency { margin-top: 8px; color: #747c8d; font-size: 14px; }
      .meta { display: flex; justify-content: center; gap: 110px; margin-top: 34px; }
      .meta div { color: #303748; font-size: 13px; }
      .meta strong { display: block; margin-bottom: 8px; color: #8a91a0; font-size: 10px; letter-spacing: 1px; }
      .ref { margin-top: 30px; color: #8a91a0; font-size: 10px; letter-spacing: 1px; }
    </style>
  </head>
  <body>
    <main class="page">
      <article class="certificate">
        <div class="brand">WOWMILES ACADEMY</div>
        <div class="seal">&#9733;</div>
        <div class="label">CERTIFIED BY EMIRATES</div>
        <h1>${courseTitle}</h1>
        <div class="recipient">Daniel Reed</div>
        <div class="agency">Beverly Travel Ltd</div>
        <div class="meta">
          <div><strong>ISSUED</strong>14 Oct 2026</div>
          <div><strong>COURSE</strong>Emirates</div>
        </div>
        <div class="ref">CERTIFICATE REFERENCE · WM-CERT-00418</div>
      </article>
    </main>
  </body>
</html>`;
}

export async function exportCertificate() {
  const { uri } = await Print.printToFileAsync({ html: createCertificateHtml() });
  if (Platform.OS === 'web') return 'print' as const;

  if (!(await Sharing.isAvailableAsync())) return 'unavailable' as const;

  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    UTI: '.pdf',
    dialogTitle: 'Academy certificate PDF',
  });
  return 'shared' as const;
}
