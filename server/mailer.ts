import nodemailer from 'nodemailer';

export interface InquiryMailPayload {
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  category?: string;
  material?: string;
  quantity?: string;
  drawingFileName?: string;
  drawingFileUrl?: string;
  message?: string;
  source?: string;
}

export async function sendInquiryEmail(
  data: InquiryMailPayload
): Promise<{ success: boolean; emailSent: boolean; message: string; error?: string }> {
  const smtpUser = process.env.SMTP_USER || 'baeksong_eng';
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || 'smtp.naver.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
  const targetEmail = process.env.MAIL_TO || 'baeksong_eng@naver.com';

  // If SMTP_PASS is not provided, return info that data is stored in CMS
  if (!smtpPass) {
    return {
      success: true,
      emailSent: false,
      message: '문의 내역이 백송이엔지 데이터베이스에 안전하게 저장되었습니다. (네이버 SMTP 비밀번호 미등록 상태)',
    };
  }

  try {
    const isSsl = smtpPort === 465;
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: isSsl,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const drawingHtml = data.drawingFileUrl
      ? `
      <div style="margin-top: 18px; padding: 16px; background-color: #ecfdf5; border-radius: 8px; border: 1px solid #a7f3d0;">
        <div style="color: #065f46; font-size: 14px; font-weight: bold; margin-bottom: 6px;">
          📎 첨부 도면 파일: ${data.drawingFileName || '도면 파일'}
        </div>
        <a href="${data.drawingFileUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 10px 20px; background-color: #059669; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px;">
          📥 첨부 도면 바로 다운로드 (클라우드 보관)
        </a>
      </div>
    `
      : `
      <div style="margin-top: 12px; font-size: 13px; color: #64748b;">
        첨부 도면: 첨부 파일 없음
      </div>
    `;

    const senderEmail = smtpUser.includes('@') ? smtpUser : `${smtpUser}@naver.com`;
    const nowKorean = new Date().toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const htmlContent = `
      <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #065f46 0%, #047857 100%); padding: 24px; color: #ffffff; text-align: center;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">(주)백송이엔지 홈페이지 온라인 문의 접수</h2>
          <p style="margin: 8px 0 0 0; font-size: 13px; opacity: 0.9;">신규 도면 견적 및 이메일 상담 요청이 도착했습니다.</p>
        </div>
        
        <div style="padding: 24px;">
          <h3 style="font-size: 15px; color: #0f172a; border-bottom: 2px solid #059669; padding-bottom: 8px; margin-top: 0;">📋 고객 및 문의 기본 정보</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px;">
            <tr>
              <td style="padding: 10px; background-color: #f8fafc; font-weight: bold; color: #475569; width: 28%; border: 1px solid #e2e8f0;">회사명</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; color: #0f172a; font-weight: bold;">${data.companyName || '(고객사 미입력)'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; background-color: #f8fafc; font-weight: bold; color: #475569; border: 1px solid #e2e8f0;">담당자명</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; color: #0f172a;">${data.contactName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; background-color: #f8fafc; font-weight: bold; color: #475569; border: 1px solid #e2e8f0;">연락처</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; color: #047857; font-weight: bold;">${data.phone}</td>
            </tr>
            <tr>
              <td style="padding: 10px; background-color: #f8fafc; font-weight: bold; color: #475569; border: 1px solid #e2e8f0;">고객 이메일</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; color: #2563eb;"><a href="mailto:${data.email}">${data.email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px; background-color: #f8fafc; font-weight: bold; color: #475569; border: 1px solid #e2e8f0;">접수 구분</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; color: #0f172a;">${data.category || '이메일 상담 / 도면 견적'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; background-color: #f8fafc; font-weight: bold; color: #475569; border: 1px solid #e2e8f0;">가공 소재 / 수량</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; color: #0f172a;">${data.material || '-'} / ${data.quantity || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; background-color: #f8fafc; font-weight: bold; color: #475569; border: 1px solid #e2e8f0;">접수 일시</td>
              <td style="padding: 10px; border: 1px solid #e2e8f0; color: #64748b;">${nowKorean}</td>
            </tr>
          </table>

          <h3 style="font-size: 15px; color: #0f172a; border-bottom: 2px solid #059669; padding-bottom: 8px; margin-top: 24px;">💬 문의 및 가공 요청사항</h3>
          <div style="margin-top: 12px; padding: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; line-height: 1.7; color: #1e293b; white-space: pre-wrap;">
${data.message || '상세 문의 내용 없음'}
          </div>

          ${drawingHtml}
        </div>

        <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
          본 메일은 (주)백송이엔지 공식 홈페이지 시스템에서 자동 발송되었습니다.<br/>
          수신 고객에게 바로 회신하시려면 메일 프로그램의 <strong>[답장]</strong> 버튼을 누르시면 됩니다.
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"(주)백송이엔지 온라인문의" <${senderEmail}>`,
      to: targetEmail,
      replyTo: data.email,
      subject: `[(주)백송이엔지 견적문의] ${data.companyName || '신규 고객사'} - ${data.contactName}`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('[SMTP Mailer] Inquiry email sent successfully to:', targetEmail, 'messageId:', info.messageId);

    return {
      success: true,
      emailSent: true,
      message: `이메일이 ${targetEmail}로 성공적으로 자동 발송되었습니다.`,
    };
  } catch (error: any) {
    console.error('[SMTP Mailer] Error sending inquiry email:', error);
    return {
      success: false,
      emailSent: false,
      message: error?.message || 'SMTP 발송 실패',
      error: error?.message,
    };
  }
}
