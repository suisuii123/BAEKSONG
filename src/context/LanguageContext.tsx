import React, { createContext, useContext, useState } from 'react';
import { useCMS } from './CMSContext';

export type Language = 'KO' | 'EN' | 'CN';

export interface Translations {
  companyName: string;
  nav: {
    about: string;
    orgchart: string;
    equipment: string;
    products: string;
    contact: string;
  };
  header: {
    requestQuote: string;
    adminCms: string;
    seoPreview: string;
  };
  hero: {
    badge: string;
    heading1: string;
    subHeading: string;
    quoteBtn: string;
    equipmentBtn: string;
    guarantee1: string;
    guarantee2: string;
    guarantee3: string;
    metric1Label: string;
    metric1Desc: string;
    metric2Label: string;
    metric2Desc: string;
    metric3Label: string;
    metric3Desc: string;
    metric4Label: string;
    metric4Desc: string;
  };
  about: {
    badge: string;
    title: string;
    subtitle: string;
    ceoTitle: string;
    quote: string;
    p1: string;
    p2: string;
    intro: string;
    stat1: string;
    stat2: string;
    stat3: string;
    stat4: string;
    certsTitle: string;
    historyTitle: string;
  };
  orgchart: {
    title: string;
    subtitle: string;
    ceo: string;
    management: string;
    rnd: string;
    quality: string;
    qualityDept: string;
    production: string;
  };
  equipment: {
    title: string;
    subtitle: string;
    catAll: string;
    catMct: string;
    catCmm: string;
    qtyLabel: string;
    rangeLabel: string;
    precLabel: string;
  };
  products: {
    title: string;
    subtitle: string;
    filterAll: string;
    matLabel: string;
    tolLabel: string;
    plLabel: string;
    pnLabel: string;
    makerLabel: string;
    specTitle: string;
    searchPlaceholder: string;
    searchCount: string;
    noResults: string;
    resetSearch: string;
  };
  news: {
    title: string;
    notice: string;
    tech: string;
    press: string;
    views: string;
  };
  contact: {
    title: string;
    subtitle: string;
    address: string;
    phone: string;
    fax: string;
    email: string;
    formTitle: string;
    companyName: string;
    contactName: string;
    tel: string;
    userEmail: string;
    category: string;
    material: string;
    quantity: string;
    fileAttach: string;
    fileHint: string;
    message: string;
    submitBtn: string;
    successMsg: string;
  };
  quoteModal: {
    modalTitle: string;
    modalDesc: string;
    companyLabel: string;
    contactLabel: string;
    phoneLabel: string;
    emailLabel: string;
    categoryLabel: string;
    materialLabel: string;
    qtyLabel: string;
    fileLabel: string;
    fileHint: string;
    messageLabel: string;
    submitBtn: string;
    successTitle: string;
    successDesc: string;
  };
  footer: {
    companyInfoTitle: string;
    ceo: string;
    bizNum: string;
    address: string;
    phone: string;
    fax: string;
    email: string;
    scrollTop: string;
    rights: string;
  };
}

export const translations: Record<Language, Translations> = {
  KO: {
    companyName: '(주)백송이엔지',
    nav: {
      about: '회사소개',
      orgchart: '조직도',
      equipment: '설비현황',
      products: '제품',
      contact: '찾아오시는 길',
    },
    header: {
      requestQuote: '이메일 상담',
      adminCms: '관리자 CMS',
      seoPreview: 'SEO 메타',
    },
    hero: {
      badge: '반도체 장비 메탈 부품 초정밀 가공 선도기업',
      heading1: '초정밀 가공의 한계를 넘어서는 기술력,',
      subHeading: '반도체 장비 메탈 부품 초정밀 가공 전문 기업. 첨단 정밀 가공 설비 구축, 체계적인 품질관리부 및 연구전담부 운용으로 핵심 부품 가공부터 표면처리까지 토탈 솔루션을 제공합니다.',
      quoteBtn: '이메일 도면 파일 견적 요청',
      equipmentBtn: '보유 설비 리스트 보기',
      guarantee1: 'Micron(㎛) 3차원 CMM 전수 성적서 발행',
      guarantee2: 'Class 1000 클린룸 파티클 세척 & 포장',
      guarantee3: 'CAD/CAM 3D 가공 경로 설계 최적화',
      metric1Label: 'Ultra Precision',
      metric1Desc: 'Micron(㎛) 단위 한계 극복 공차',
      metric2Label: 'Since 2013',
      metric2Desc: '반도체 부품 초정밀 가공 노하우',
      metric3Label: 'CNC / CMM Machine',
      metric3Desc: 'DOOSAN 고속 MCT & ZEISS 3D CMM 설비',
      metric4Label: 'Quality Assurance',
      metric4Desc: 'Class 1000 클린룸 전수 검수',
    },
    about: {
      badge: 'COMPANY OVERVIEW',
      title: '고객의 신뢰를 바탕으로 성장하는 정밀 가공 파트너',
      subtitle: '',
      ceoTitle: 'CEO 메시지 및 인사말',
      quote: 'Micron 1㎛의 차이가 반도체 수율과 품질의 성패를 가릅니다. 백송이엔지는 단 하나의 부품도 타협하지 않는 집념으로 고객의 기술 혁신을 완벽히 지원합니다.',
      p1: '저희 (주)백송이엔지는 반도체 및 디스플레이 핵심 공정에 투입되는 Chamber, Plate, Lid, Diffuser 등 극도의 정밀도가 요구되는 메탈 부품 수주 가공 전문기업입니다.',
      p2: '인천 남동공단 제1공장 및 제2공장에 구축된 DOOSAN MCT 최신 정밀 가공 설비와 체계적인 품질관리부, 연구전담부를 기반으로 아노다이징 표면처리까지 완벽히 대응하고 있습니다.',
      intro: '최첨단 가공 설비와 엄격한 품질 관리 시스템을 바탕으로 반도체 장비 핵심 메탈 부품을 안정적으로 공급합니다.',
      stat1: '설립 연도',
      stat2: '제1·제2 공장',
      stat3: '품질 목표',
      stat4: '초정밀 공차',
      certsTitle: '인증 및 연구소 현황',
      historyTitle: '주요 연혁',
    },
    orgchart: {
      title: '조직도 (Organization)',
      subtitle: '대표이사를 필두로 엄격한 품질관리부와 4개 핵심 부서가 유기적으로 협력하여 최고의 정밀 가공 제품을 제공합니다.',
      ceo: '대표이사 (CEO)',
      management: '경영지원부',
      rnd: '연구전담부',
      quality: '품질관리부',
      qualityDept: '품질관리부',
      production: '생산가공부',
    },
    equipment: {
      title: '보유 설비 현황',
      subtitle: '최신 DOOSAN MCT 및 ZEISS 3D CMM 정밀 측정 설비',
      catAll: '전체 설비',
      catMct: 'MCT 머시닝센터',
      catCmm: '3D CMM 측정기',
      qtyLabel: '보유 수량:',
      rangeLabel: '가공 범위:',
      precLabel: '보증 정밀도:',
    },
    products: {
      title: '주요 가공 제품 카탈로그',
      subtitle: '',
      filterAll: '전체 부품',
      matLabel: '가공 소재:',
      tolLabel: '보증 공차:',
      plLabel: 'P/N:',
      pnLabel: 'P/N:',
      makerLabel: 'MAKER:',
      specTitle: '제품 가공 스펙',
      searchPlaceholder: '품번(P/N), 제품명, 제조사를 입력하세요 (예: 0020-34694)',
      searchCount: '개의 부품 검색됨',
      noResults: '일치하는 부품이 없습니다.',
      resetSearch: '검색 초기화',
    },
    news: {
      title: '소식 및 기술 자료',
      notice: '공지사항',
      tech: '기술자료',
      press: '보도자료',
      views: '조회수',
    },
    contact: {
      title: '찾아오시는 길',
      subtitle: '(주)백송이엔지 본사 및 제1공장, 제2공장 위치 안내',
      address: '주소',
      phone: '전화번호',
      fax: '팩스번호',
      email: '이메일',
      formTitle: '도면 파일 첨부 이메일 견적 요청서 작성',
      companyName: '회사명 / 기관명 *',
      contactName: '담당자 성함 *',
      tel: '연락처 (전화번호) *',
      userEmail: '이메일 주소 *',
      category: '부품 카테고리',
      material: '가공 소재',
      quantity: '수량 (EA)',
      fileAttach: '가공 도면 파일 첨부 (DWG, STEP, PDF, ZIP)',
      fileHint: '클릭하여 파일 선택 또는 드래그 앤 드롭',
      message: '요청 사항 및 수량/재질 세부 설명',
      submitBtn: '이메일 전송',
      successMsg: '도면 파일 및 견적 요청서가 이메일(kcyexr@naver.com)로 접수되었습니다!',
    },
    quoteModal: {
      modalTitle: '이메일 도면 파일 첨부 견적 요청',
      modalDesc: '가공 도면 파일(DWG, STEP, PDF, ZIP)을 첨부해주시면 담당 엔지니어가 도면 검토 후 견적서를 이메일로 송부해 드립니다.',
      companyLabel: '회사명 / 기관명 *',
      contactLabel: '성함 / 담당자 *',
      phoneLabel: '연락처 *',
      emailLabel: '이메일 주소 *',
      categoryLabel: '부품 종류',
      materialLabel: '가공 소재 선택',
      qtyLabel: '발주 예상 수량 (EA)',
      fileLabel: '가공 도면 파일 업로드 (DWG, STEP, PDF, ZIP) *',
      fileHint: '도면 파일(DWG, STEP, PDF, ZIP)을 클릭하여 첨부하세요',
      messageLabel: '요청 사항 및 기타 참고 정보',
      submitBtn: '이메일 전송',
      successTitle: '도면 파일 및 견적 요청이 이메일로 전송되었습니다!',
      successDesc: '담당 엔지니어가 제출해주신 도면을 검토한 후 입력하신 이메일/연락처로 정식 견적서를 발송해 드립니다.',
    },
    footer: {
      companyInfoTitle: '본사 연락처 및 사업자 정보',
      ceo: '대표이사',
      bizNum: '사업자 등록번호',
      address: '주소',
      phone: '전화번호',
      fax: '팩스번호',
      email: '이메일',
      scrollTop: '맨 위로',
      rights: 'All Rights Reserved.',
    },
  },
  EN: {
    companyName: 'BAEKSONG ENG',
    nav: {
      about: 'About Us',
      orgchart: 'Org Chart',
      equipment: 'Equipment',
      products: 'Products',
      contact: 'Location',
    },
    header: {
      requestQuote: 'Email Consultation',
      adminCms: 'Admin CMS',
      seoPreview: 'SEO Meta',
    },
    hero: {
      badge: 'Leader in Ultra-Precision Machining of Semiconductor Metal Parts',
      heading1: 'Technology Beyond Limits of Ultra-Precision Machining,',
      subHeading: 'Specialized in ultra-precision machining of semiconductor metal components. BAEKSONG ENG provides total solutions from machining key parts (Chamber, Plate, Lid, Diffuser) to surface anodizing.',
      quoteBtn: 'Request Quote by Email (Attach File)',
      equipmentBtn: 'View Equipment List',
      guarantee1: 'Micron (㎛) 3D CMM inspection reports issued',
      guarantee2: 'Class 1000 Cleanroom particle cleaning & packaging',
      guarantee3: 'CAD/CAM 3D machining path optimization',
      metric1Label: 'Ultra Precision',
      metric1Desc: 'Breakthrough tolerance at Micron(㎛) scale',
      metric2Label: 'Since 2013',
      metric2Desc: 'Decades of semiconductor machining expertise',
      metric3Label: 'CNC / CMM Machine',
      metric3Desc: 'DOOSAN High-Speed MCT & ZEISS 3D CMM',
      metric4Label: 'Quality Assurance',
      metric4Desc: '100% Class 1000 Cleanroom inspection',
    },
    about: {
      badge: 'COMPANY OVERVIEW',
      title: 'Precision Machining Partner Growing on Customer Trust',
      subtitle: '',
      ceoTitle: 'CEO Message & Greeting',
      quote: 'A single 1㎛ Micron difference determines semiconductor yield and quality. BAEKSONG ENG supports your technological innovation without compromising on any single part.',
      p1: 'BAEKSONG ENG is a specialized manufacturer of high-precision metal parts required in core semiconductor and display processes, including Chambers, Plates, Lids, and Diffusers.',
      p2: 'Equipped with state-of-the-art DOOSAN MCT machining lines in Plant 1 & Plant 2 in Namdong Industrial Complex, supported by systematic QC and R&D departments, BAEKSONG ENG delivers total solutions including anodizing surface treatments.',
      intro: 'BAEKSONG ENG stably supplies core semiconductor metal parts based on state-of-the-art facilities and strict quality management.',
      stat1: 'Established',
      stat2: 'Plant 1 & Plant 2',
      stat3: 'Quality Goal',
      stat4: 'Precision Tolerance',
      certsTitle: 'Certifications & R&D Center',
      historyTitle: 'Company Milestones',
    },
    orgchart: {
      title: 'Organization Chart',
      subtitle: 'Led by the CEO, the Quality Control Department and 4 core operational departments collaborate organically to deliver superior precision components.',
      ceo: 'CEO',
      management: 'Management Support',
      rnd: 'R&D Department',
      quality: 'Quality Control',
      qualityDept: 'Quality Control Dept.',
      production: 'Production & Machining',
    },
    equipment: {
      title: 'Equipment Inventory',
      subtitle: 'Latest DOOSAN MCT and ZEISS 3D CMM precision measuring instruments',
      catAll: 'All Equipment',
      catMct: 'MCT Machining Center',
      catCmm: '3D CMM Inspection',
      qtyLabel: 'Quantity:',
      rangeLabel: 'Working Range:',
      precLabel: 'Accuracy:',
    },
    products: {
      title: 'Product Catalog',
      subtitle: '',
      filterAll: 'All Parts',
      matLabel: 'Material:',
      tolLabel: 'Tolerance:',
      plLabel: 'P/N:',
      pnLabel: 'P/N:',
      makerLabel: 'MAKER:',
      specTitle: 'Machining Specifications',
      searchPlaceholder: 'Search by Part Number (P/N), Title, or Maker (e.g. 0020-34694)',
      searchCount: 'parts found',
      noResults: 'No matching parts found.',
      resetSearch: 'Reset search',
    },
    news: {
      title: 'News & Technical Resources',
      notice: 'Notices',
      tech: 'Technical Info',
      press: 'Press Release',
      views: 'Views',
    },
    contact: {
      title: 'Location & Factory',
      subtitle: 'BAEKSONG ENG Headquarters and Manufacturing Plants Location Map',
      address: 'Address',
      phone: 'Phone',
      fax: 'Fax',
      email: 'Email',
      formTitle: 'Email Drawing File Quote Request Form',
      companyName: 'Company / Organization *',
      contactName: 'Contact Person *',
      tel: 'Phone Number *',
      userEmail: 'Email Address *',
      category: 'Part Category',
      material: 'Material',
      quantity: 'Quantity (EA)',
      fileAttach: 'Attach Drawing File (DWG, STEP, PDF, ZIP)',
      fileHint: 'Click to select drawing file or drag and drop',
      message: 'Requirements, Quantity & Material Details',
      submitBtn: 'Send Email',
      successMsg: 'Your drawing file and quote request have been received via email (kcyexr@naver.com)!',
    },
    quoteModal: {
      modalTitle: 'Email Drawing File Quote Request',
      modalDesc: 'Attach your CAD drawing file (DWG, STEP, PDF, ZIP). Our engineers will review it and email you an official quotation.',
      companyLabel: 'Company Name *',
      contactLabel: 'Your Name / Contact Person *',
      phoneLabel: 'Phone Number *',
      emailLabel: 'Email Address *',
      categoryLabel: 'Part Category',
      materialLabel: 'Select Material',
      qtyLabel: 'Estimated Quantity (EA)',
      fileLabel: 'Upload Drawing File (DWG, STEP, PDF, ZIP) *',
      fileHint: 'Click to upload drawing file (DWG, STEP, PDF, ZIP)',
      messageLabel: 'Additional Notes & Instructions',
      submitBtn: 'Send Email',
      successTitle: 'Drawing file and quote request sent via email!',
      successDesc: 'Our engineers will review your drawing and send a formal quotation to your email and phone number.',
    },
    footer: {
      companyInfoTitle: 'Headquarters & Business Registration',
      ceo: 'CEO',
      bizNum: 'Business Reg. No.',
      address: 'Address',
      phone: 'Phone',
      fax: 'Fax',
      email: 'Email',
      scrollTop: 'Back to Top',
      rights: 'All Rights Reserved.',
    },
  },
  CN: {
    companyName: 'BAEKSONG ENG',
    nav: {
      about: '公司介绍',
      orgchart: '组织架构',
      equipment: '设备状况',
      products: '产品',
      contact: '交通指南',
    },
    header: {
      requestQuote: '邮件咨询',
      adminCms: '管理员 CMS',
      seoPreview: 'SEO 预览',
    },
    hero: {
      badge: '半导体设备金属零部件超精密加工领军企业',
      heading1: '超越超精密加工极限的技术实力,',
      subHeading: '专攻半导体设备金属零部件超精密加工。BAEKSONG ENG 具备先进的精密加工设备与严谨的质量管理，提供从核心部件(Chamber, Plate, Lid, Diffuser)加工到阳极氧化表面处理的整体解决方案。',
      quoteBtn: '邮件附带图纸报价申请',
      equipmentBtn: '查看设备清单',
      guarantee1: '提供微米(㎛)级 3D CMM 全检报告',
      guarantee2: 'Class 1000 无尘室超声清洗与真空包装',
      guarantee3: 'CAD/CAM 3D 加工路径设计优化',
      metric1Label: 'Ultra Precision',
      metric1Desc: '突破微米(㎛)极限公差',
      metric2Label: 'Since 2013',
      metric2Desc: '多年半导体零部件加工经验',
      metric3Label: 'CNC / CMM Machine',
      metric3Desc: '斗山(DOOSAN)高速MCT与蔡司3D测量仪',
      metric4Label: 'Quality Assurance',
      metric4Desc: 'Class 1000 无尘室100%全检',
    },
    about: {
      badge: 'COMPANY OVERVIEW',
      title: '依托客户信任不断成长的精密加工合作伙伴',
      subtitle: '',
      ceoTitle: 'CEO 寄语与致辞',
      quote: '1㎛ 微米的微小差异决定着半导体良率与品质的成败。BAEKSONG ENG 绝不妥协任何一件产品，全力支持客户的技术创新。',
      p1: 'BAEKSONG ENG 是一家专注于半导体及显示屏核心工艺（如 Chamber, Plate, Lid, Diffuser）极高精度金属零部件加工的制造企业。',
      p2: '依托位于仁川南洞工业园第一及第二工厂的斗山(DOOSAN) MCT 最新精密加工设备、系统化的品质管理部与研发部门，BAEKSONG ENG 完美实现从加工到阳极氧化表面处理的封环生产。',
      intro: 'BAEKSONG ENG 凭借最先进的加工设备和严密品质体系，稳定供应半导体设备核心金属部件。',
      stat1: '成立年份',
      stat2: '第一·第二工厂',
      stat3: '质量目标',
      stat4: '超精密公差',
      certsTitle: '资质认证与研究所',
      historyTitle: '发展历程',
    },
    orgchart: {
      title: '组织架构图 (Organization)',
      subtitle: '以代表理事为核心，品质管理部与四大核心部门紧密协作，提供高品质超精密加工产品。',
      ceo: '代表理事 (CEO)',
      management: '经营支援部',
      rnd: '附属研究所',
      quality: '品质管理部',
      qualityDept: '品质管理部',
      production: '生产加工部',
    },
    equipment: {
      title: '设备状况',
      subtitle: '最新斗山(DOOSAN) MCT 加工中心及蔡司 3D CMM 精密检测设备',
      catAll: '全部设备',
      catMct: 'MCT 加工中心',
      catCmm: '3D CMM 测量仪',
      qtyLabel: '保有数量:',
      rangeLabel: '加工范围:',
      precLabel: '保证精度:',
    },
    products: {
      title: '主要加工产品目录',
      subtitle: '',
      filterAll: '全部零部件',
      matLabel: '加工材质:',
      tolLabel: '保证公差:',
      plLabel: 'P/N:',
      pnLabel: 'P/N:',
      makerLabel: 'MAKER:',
      specTitle: '产品加工规格',
      searchPlaceholder: '按零件号(P/N)、产品名称或制造厂商搜索 (例: 0020-34694)',
      searchCount: '个零部件被检索到',
      noResults: '未找到匹配的零部件。',
      resetSearch: '重置搜索',
    },
    news: {
      title: '新闻与技术资料',
      notice: '公告事项',
      tech: '技术资料',
      press: '新闻报道',
      views: '浏览次数',
    },
    contact: {
      title: '交通指南',
      subtitle: 'BAEKSONG ENG 总部及第一工厂、第二工厂位置指南',
      address: '地址',
      phone: '电话',
      fax: '传真',
      email: '电子邮箱',
      formTitle: '填写图纸文件附带报价申请表',
      companyName: '公司/机构名称 *',
      contactName: '联系人姓名 *',
      tel: '联系电话 *',
      userEmail: '电子邮箱 *',
      category: '零部件类别',
      material: '加工材质',
      quantity: '数量 (EA)',
      fileAttach: '上传加工图纸文件 (DWG, STEP, PDF, ZIP)',
      fileHint: '点击选择图纸文件或拖拽上传',
      message: '需求说明/数量/材质等详细说明',
      submitBtn: '发送邮件',
      successMsg: '图纸文件及报价申请已成功通过邮件(kcyexr@naver.com)接收！',
    },
    quoteModal: {
      modalTitle: '邮件附带图纸报价申请',
      modalDesc: '请附加您的加工图纸文件(DWG, STEP, PDF, ZIP)，工程师审核后将通过邮件将正式报价单发送给您。',
      companyLabel: '公司名称 *',
      contactLabel: '联系人 *',
      phoneLabel: '联系电话 *',
      emailLabel: '电子邮箱 *',
      categoryLabel: '零部件种类',
      materialLabel: '选择加工材质',
      qtyLabel: '预计采购数量 (EA)',
      fileLabel: '上传加工图纸 (DWG, STEP, PDF, ZIP) *',
      fileHint: '点击上传图纸文件(DWG, STEP, PDF, ZIP)',
      messageLabel: '备注与说明',
      submitBtn: '发送邮件',
      successTitle: '图纸文件及报价申请已通过邮件发送！',
      successDesc: '工程师审阅图纸后，将通过您留下的邮箱和电话联系并发送正式报价单。',
    },
    footer: {
      companyInfoTitle: '总公司联系方式与企业信息',
      ceo: '代表理事',
      bizNum: '营业执照注册号',
      address: '地址',
      phone: '电话',
      fax: '传真',
      email: '电子邮箱',
      scrollTop: '返回顶部',
      rights: 'All Rights Reserved.',
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { customTranslations } = useCMS();
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('baeksong_eng_lang');
    if (saved === 'EN' || saved === 'CN' || saved === 'KO') {
      return saved;
    }
    return 'KO';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('baeksong_eng_lang', lang);
  };

  const defaultT = translations[language];
  const langCustom = customTranslations?.[language] || {};

  const t: Translations = {
    ...defaultT,
    nav: { ...defaultT.nav, ...(langCustom.nav || {}) },
    header: { ...defaultT.header, ...(langCustom.header || {}) },
    hero: { ...defaultT.hero, ...(langCustom.hero || {}) },
    about: { ...defaultT.about, ...(langCustom.about || {}) },
    orgchart: { ...defaultT.orgchart, ...(langCustom.orgchart || {}) },
    equipment: { ...defaultT.equipment, ...(langCustom.equipment || {}) },
    products: { ...defaultT.products, ...(langCustom.products || {}) },
    news: { ...defaultT.news, ...(langCustom.news || {}) },
    contact: { ...defaultT.contact, ...(langCustom.contact || {}) },
    quoteModal: { ...defaultT.quoteModal, ...(langCustom.quoteModal || {}) },
    footer: { ...defaultT.footer, ...(langCustom.footer || {}) },
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
