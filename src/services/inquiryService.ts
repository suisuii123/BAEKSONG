import { uploadImageToStorage } from './firebaseStorage';

export interface SendInquiryParams {
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  category?: string;
  material?: string;
  quantity?: string;
  message?: string;
  file?: File | null;
  source?: string;
}

export async function submitDirectInquiry(
  params: SendInquiryParams
): Promise<{ success: boolean; emailSent: boolean; message: string; drawingUrl?: string }> {
  try {
    let drawingFileUrl = '';
    let drawingFileName = '';

    if (params.file) {
      drawingFileName = `${params.file.name} (${(params.file.size / 1024).toFixed(1)} KB)`;
      try {
        const uploadRes = await uploadImageToStorage(params.file, 'quotation_drawings');
        if (uploadRes.url) {
          drawingFileUrl = uploadRes.url;
        }
      } catch (uploadErr) {
        console.warn('[Inquiry] Drawing file upload to storage warning:', uploadErr);
      }
    }

    const payload = {
      companyName: params.companyName,
      contactName: params.contactName,
      phone: params.phone,
      email: params.email,
      category: params.category || '이메일 상담 / 도면 견적',
      material: params.material || '도면/요청사항 참조',
      quantity: params.quantity || '도면/요청사항 참조',
      drawingFileName: drawingFileName || '첨부 도면 없음',
      drawingFileUrl: drawingFileUrl || undefined,
      message: params.message || '',
      source: params.source || '홈페이지 이메일 상담',
    };

    const response = await fetch('/api/send-inquiry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return {
        success: false,
        emailSent: false,
        message: err.error || err.message || '서버 응답 오류',
        drawingUrl: drawingFileUrl,
      };
    }

    const result = await response.json();
    return {
      success: true,
      emailSent: !!result.emailSent,
      message: result.message || '상담 문의가 성공적으로 접수되었습니다.',
      drawingUrl: drawingFileUrl,
    };
  } catch (error: any) {
    console.error('submitDirectInquiry error:', error);
    return {
      success: false,
      emailSent: false,
      message: error?.message || '네트워크 오류가 발생했습니다.',
    };
  }
}
