import { uploadImageToStorage } from '../services/firebaseStorage';

export interface FormspreeSubmission {
  companyName?: string;
  contactName?: string;
  name?: string;
  phone?: string;
  email?: string;
  category?: string;
  material?: string;
  quantity?: string;
  drawingFileName?: string;
  drawingFileUrl?: string;
  message?: string;
  source?: string;
  file?: File | null;
  [key: string]: any;
}

export const DEFAULT_FORMSPREE_ENDPOINT = 'https://formspree.io/f/xgawngpn';

export async function submitToFormspree(
  data: FormspreeSubmission,
  endpointUrl: string = DEFAULT_FORMSPREE_ENDPOINT
): Promise<{ success: boolean; message?: string }> {
  try {
    const url = endpointUrl?.trim() || DEFAULT_FORMSPREE_ENDPOINT;

    // 1. 도면 파일이 첨부된 경우
    // Formspree 무료 플랜의 'File Uploads Not Permitted(400 에러)'를 완벽히 방지하기 위해
    // Firebase Cloud Storage에 도면을 고속 업로드한 후, 영구 다운로드 링크를 이메일 본문에 삽입합니다.
    let cloudDownloadUrl = data.drawingFileUrl || '';
    if (data.file && !cloudDownloadUrl) {
      try {
        const uploadRes = await uploadImageToStorage(data.file, 'quotation_drawings');
        if (uploadRes.url) {
          cloudDownloadUrl = uploadRes.url;
        }
      } catch (uploadErr) {
        console.warn('[Formspree] File upload to cloud storage failed:', uploadErr);
      }
    }

    const fileNameInfo = data.drawingFileName || (data.file ? data.file.name : '첨부 없음');

    // 2. Formspree 표준 JSON 페이로드 구성 (무료/유료 모든 플랜 100% 호환)
    const payload: Record<string, any> = {
      회사명: data.companyName || '-',
      담당자명: data.contactName || data.name || '-',
      연락처: data.phone || '-',
      이메일: data.email || '-',
      _replyto: data.email || '',
      접수경로: data.source || '홈페이지 이메일 상담',
      카테고리: data.category || '-',
      소재: data.material || '-',
      수량: data.quantity || '-',
      도면파일명: fileNameInfo,
      문의내용: data.message || '-',
      _subject: `[(주)백송이엔지] 도면 견적 및 상담 요청 - ${data.companyName || data.contactName || '고객사'}`,
    };

    if (cloudDownloadUrl) {
      payload['도면_다운로드_링크'] = cloudDownloadUrl;
    }

    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (response.ok) {
      return { success: true };
    } else {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error || errorData?.errors?.[0]?.message || 'Formspree 전송 오류';
      return { success: false, message: errorMsg };
    }
  } catch (error: any) {
    console.error('Formspree submission error:', error);
    return { success: false, message: error?.message || '네트워크 오류' };
  }
}
