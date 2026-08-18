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

    // If a file is attached, submit using FormData multipart
    if (data.file) {
      const formData = new FormData();
      formData.append('회사명', data.companyName || '-');
      formData.append('담당자명', data.contactName || data.name || '-');
      formData.append('연락처', data.phone || '-');
      formData.append('이메일', data.email || '-');
      formData.append('_replyto', data.email || '');
      formData.append('접수경로', data.source || '홈페이지 문의');
      if (data.category) formData.append('카테고리', data.category);
      if (data.material) formData.append('소재', data.material);
      if (data.quantity) formData.append('수량', data.quantity);
      if (data.drawingFileName) formData.append('도면파일명', data.drawingFileName);
      if (data.message) formData.append('문의내용', data.message);
      formData.append('attachment', data.file, data.file.name);
      formData.append(
        '_subject',
        `[(주)백송이엔지] 도면 견적 및 상담 요청 - ${data.companyName || data.contactName || '고객사'}`
      );

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        return { success: true };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, message: errorData.error || 'Formspree 전송 오류' };
      }
    } else {
      // Standard JSON payload
      const payload = {
        회사명: data.companyName || '-',
        담당자명: data.contactName || data.name || '-',
        연락처: data.phone || '-',
        이메일: data.email || '-',
        _replyto: data.email || '',
        접수경로: data.source || '홈페이지 문의',
        카테고리: data.category || '-',
        소재: data.material || '-',
        수량: data.quantity || '-',
        도면파일명: data.drawingFileName || '첨부 없음',
        문의내용: data.message || '-',
        _subject: `[(주)백송이엔지] 도면 견적 및 상담 요청 - ${data.companyName || data.contactName || '고객사'}`,
      };

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
        return { success: false, message: errorData.error || 'Formspree 전송 오류' };
      }
    }
  } catch (error: any) {
    console.error('Formspree submission error:', error);
    return { success: false, message: error?.message || '네트워크 오류' };
  }
}
