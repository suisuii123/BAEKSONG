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

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function submitDirectInquiry(
  params: SendInquiryParams
): Promise<{ success: boolean; emailSent: boolean; message: string; drawingUrl?: string }> {
  try {
    let drawingFileUrl = '';
    let drawingFileName = '';

    if (params.file) {
      drawingFileName = `${params.file.name} (${(params.file.size / 1024).toFixed(1)} KB)`;
      
      // 1. Upload to dedicated server storage first (always accessible & persistent)
      try {
        const base64Data = await fileToBase64(params.file);
        const serverUploadRes = await fetch('/api/upload-drawing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: params.file.name,
            fileData: base64Data,
          }),
        });
        if (serverUploadRes.ok) {
          const uploadJson = await serverUploadRes.json();
          if (uploadJson.success && uploadJson.url) {
            drawingFileUrl = uploadJson.url;
            console.log('[Inquiry] Drawing file stored on server:', drawingFileUrl);
          }
        }
      } catch (serverErr) {
        console.warn('[Inquiry] Direct server drawing upload warning, trying Firebase:', serverErr);
      }

      // 2. If server upload was not set, try Firebase Cloud Storage as fallback
      if (!drawingFileUrl) {
        try {
          const uploadRes = await uploadImageToStorage(params.file, 'quotation_drawings');
          if (uploadRes.url) {
            drawingFileUrl = uploadRes.url;
          }
        } catch (uploadErr) {
          console.warn('[Inquiry] Drawing file upload to storage warning:', uploadErr);
        }
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
      // Direct Formspree client-side fallback
      try {
        const fsDirectRes = await fetch("https://formspree.io/f/xgawngpn", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            "회사명": params.companyName || "(고객사 미입력)",
            "담당자": params.contactName,
            "연락처": params.phone,
            "고객이메일": params.email,
            "상담_견적요청내용": params.message || "(내용 없음)",
            "도면_다운로드_링크": drawingFileUrl || "첨부 없음",
          }),
        });
        if (fsDirectRes.ok) {
          return {
            success: true,
            emailSent: true,
            message: "상담 문의가 성공적으로 접수되었습니다. 담당자가 확인 후 신속히 회신드리겠습니다.",
            drawingUrl: drawingFileUrl,
          };
        }
      } catch (e) {
        console.warn('Formspree fallback error:', e);
      }

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
