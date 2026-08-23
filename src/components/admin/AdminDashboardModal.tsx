import React, { useState } from 'react';
import { useCMS } from '../../context/CMSContext';
import { useLanguage } from '../../context/LanguageContext';
import { Product, Equipment, NewsPost, HistoryItem, Department, Language, HeroSlide, ProductCategory, OrgCeoInfo, OrgQualityInfo, FactoryPhotoItem } from '../../types';
import { autoTranslateText } from '../../utils/translator';
import { submitToFormspree, DEFAULT_FORMSPREE_ENDPOINT } from '../../utils/formspree';
import { drawWatermarkOnCanvas, applyWatermarkToImage } from '../../utils/watermark';
import { ProductWatermarkOverlay } from '../ProductWatermarkOverlay';
import { uploadImageToStorage } from '../../services/firebaseStorage';
import {
  X,
  Settings,
  Building,
  Newspaper,
  Layers,
  Cpu,
  Inbox,
  Palette,
  Plus,
  Trash2,
  Edit3,
  Check,
  RotateCcw,
  Upload,
  Users,
  MapPin,
  Globe,
  Calendar,
  Briefcase,
  Wrench,
  Lightbulb,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  Loader2,
  Image as ImageIcon,
  Tag,
  Factory,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
  ArrowUpDown,
} from 'lucide-react';

export const AdminDashboardModal: React.FC = () => {
  const {
    isAdminOpen,
    setIsAdminOpen,
    companyInfo,
    updateCompanyInfo,
    themeConfig,
    updateThemeConfig,
    productCategories,
    addProductCategory,
    updateProductCategory,
    deleteProductCategory,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    equipments,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    newsPosts,
    addNewsPost,
    updateNewsPost,
    deleteNewsPost,
    inquiries,
    updateInquiryStatus,
    deleteInquiry,
    historyItems,
    addHistoryItem,
    updateHistoryItem,
    deleteHistoryItem,
    orgCeo,
    updateOrgCeo,
    orgQuality,
    updateOrgQuality,
    departments,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    heroSlides,
    addHeroSlide,
    updateHeroSlide,
    deleteHeroSlide,
    factoryPhotos,
    addFactoryPhoto,
    updateFactoryPhoto,
    deleteFactoryPhoto,
    moveFactoryPhotoInFilter,
    moveFactoryPhotoToPosition,
    cmsLang,
    setCmsLang,
    customTranslations,
    updateSectionTranslation,
    resetToDefault,
  } = useCMS();

  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<
    'hero' | 'factory' | 'company' | 'orgchart' | 'equipment' | 'products' | 'contact' | 'news' | 'theme' | 'inquiries'
  >('hero');


  // File Upload Helper with optional automatic Watermark application, HTML5 Canvas compression, and Firebase Cloud Storage upload
  const handleFileUpload = (
    file: File,
    callback: (finalUrl: string) => void,
    options?: { watermark?: boolean; folder?: string }
  ) => {
    if (!file) return;
    showToast('사진 처리 및 구글 클라우드 스토리지 업로드 중...');

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        const rawDataUrl = e.target.result;
        const img = new Image();
        img.onload = async () => {
          try {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 1200;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height = Math.round((height * MAX_WIDTH) / width);
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width = Math.round((width * MAX_HEIGHT) / height);
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            let processedDataUrl = rawDataUrl;
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);

              // Apply BAEKSONG ENG official watermark if requested
              if (options?.watermark) {
                drawWatermarkOnCanvas(ctx, width, height, { opacity: 0.38, scale: 0.46 });
              }

              processedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
            }

            // Determine destination folder
            const folder = options?.folder || (activeTab === 'factory' ? 'factory_photos' : activeTab === 'products' ? 'products' : 'cms_uploads');

            // Attempt upload directly to Firebase Cloud Storage
            const uploadResult = await uploadImageToStorage(processedDataUrl, folder);

            if (uploadResult.isCloudStorage && uploadResult.url) {
              callback(uploadResult.url);
              showToast('구글 클라우드 스토리지(pro-axis-wdw25)에 영구 업로드 완료되었습니다.');
            } else {
              // Fallback to data URL
              callback(processedDataUrl);
              if (uploadResult.error && (uploadResult.error.toLowerCase().includes('permission') || uploadResult.error.toLowerCase().includes('unauthorized') || uploadResult.error.includes('403'))) {
                showToast('Firebase Storage 규칙을 allow read, write: if true; 로 설정해주세요. (현재 로컬/Firestore 저장됨)');
              } else {
                showToast('사진이 안전하게 등록되었습니다.');
              }
            }
          } catch (err) {
            console.error('Image processing or upload error:', err);
            callback(rawDataUrl);
          }
        };
        img.onerror = () => {
          callback(rawDataUrl);
        };
        img.src = rawDataUrl;
      }
    };
    reader.readAsDataURL(file);
  };

  // State for adding History Item
  const [newHistYear, setNewHistYear] = useState('2024');
  const [newHistMonth, setNewHistMonth] = useState('01월');
  const [newHistTitle, setNewHistTitle] = useState('');
  const [newHistDesc, setNewHistDesc] = useState('');
  const [editingHistId, setEditingHistId] = useState<string | null>(null);
  const [editingHistData, setEditingHistData] = useState<Partial<HistoryItem>>({});

  // State for adding Department
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptEngName, setNewDeptEngName] = useState('');
  const [newDeptCnName, setNewDeptCnName] = useState('');
  const [newDeptIcon, setNewDeptIcon] = useState('Briefcase');
  const [newDeptDuties, setNewDeptDuties] = useState('');
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [editingDeptData, setEditingDeptData] = useState<Partial<Department>>({});

  // State for Product Category Management
  const [newCatName, setNewCatName] = useState('');
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [newCatNameCn, setNewCatNameCn] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatData, setEditingCatData] = useState<Partial<ProductCategory>>({});

  // State for adding Product
  const [newProdTitle, setNewProdTitle] = useState('');
  const [newProdTitleEn, setNewProdTitleEn] = useState('');
  const [newProdTitleCn, setNewProdTitleCn] = useState('');
  const [newProdPN, setNewProdPN] = useState('');
  const [newProdPNEn, setNewProdPNEn] = useState('');
  const [newProdPNCn, setNewProdPNCn] = useState('');
  const [newProdMaker, setNewProdMaker] = useState('');
  const [newProdMakerEn, setNewProdMakerEn] = useState('');
  const [newProdMakerCn, setNewProdMakerCn] = useState('');
  const [newProdCat, setNewProdCat] = useState<string>('chamber');
  const [newProdImageUrl, setNewProdImageUrl] = useState('');

  // State for adding Equipment
  const [newEqName, setNewEqName] = useState('');
  const [newEqModel, setNewEqModel] = useState('');
  const [newEqMaker, setNewEqMaker] = useState('');
  const [newEqWorkingArea, setNewEqWorkingArea] = useState('');
  const [newEqPrecision, setNewEqPrecision] = useState('±0.001 mm');
  const [newEqQty, setNewEqQty] = useState(1);
  const [newEqCat, setNewEqCat] = useState<'cnc' | 'mct' | 'cmm' | 'cleanroom'>('mct');
  const [newEqImageUrl, setNewEqImageUrl] = useState('');
  const [editingEqId, setEditingEqId] = useState<string | null>(null);
  const [editingEqData, setEditingEqData] = useState<Partial<Equipment>>({});

  // State for adding News Post
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<
    '공지사항' | '기술자료' | '보도자료' | '설비도입'
  >('공지사항');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostAuthor, setNewPostAuthor] = useState('관리자');
  const [newPostImageUrl, setNewPostImageUrl] = useState('');

  // State for Hero Slide Management
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [slideForm, setSlideForm] = useState<Omit<HeroSlide, 'id'>>({
    badge: '반도체 장비 메탈 부품 초정밀 가공 선도기업',
    badgeEn: 'Leading Semiconductor Metal Machining',
    badgeCn: '半导体设备精密金属加工领军企业',
    title: '초정밀 가공의 한계를 넘어서는 기술력',
    titleEn: 'Precision Engineering Beyond Limits',
    titleCn: '超越精密切削加工极限的技术力量',
    subtitle: '반도체 장비 메탈 부품 초정밀 가공 전문 기업. 첨단 5축 CNC 및 MCT 설비, 체계적인 품질관리로 토탈 솔루션을 제공합니다.',
    subtitleEn: 'Specialized in ultra-precision metal parts for semiconductor equipment with advanced 5-axis CNC & MCT facilities.',
    subtitleCn: '半导体设备金属零件超精密加工专业企业。构建先进精密加工设备， provide full solution.',
    imageUrl: '',
  });

  // State for inline edit of a specific hero slide
  const [inlineSlideForm, setInlineSlideForm] = useState<HeroSlide | null>(null);

  // State for Factory Photos Management
  const [editingFactoryPhotoId, setEditingFactoryPhotoId] = useState<string | null>(null);
  const [adminFactoryPlantTab, setAdminFactoryPlantTab] = useState<'all' | 'factory1' | 'factory2'>('factory1');
  const [factoryPhotoForm, setFactoryPhotoForm] = useState<Omit<FactoryPhotoItem, 'id'>>({
    image: '',
    factoryType: 'factory1',
    titleKo: '',
    titleEn: '',
    titleCn: '',
    descKo: '',
    descEn: '',
    descCn: '',
    tagKo: '제1공장',
    tagEn: 'Plant 1',
    tagCn: '第1工厂',
  });
  const [inlineFactoryPhotoForm, setInlineFactoryPhotoForm] = useState<FactoryPhotoItem | null>(null);
  const [deleteConfirmPhotoId, setDeleteConfirmPhotoId] = useState<string | null>(null);

  // State for inline edit of a product
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingProductForm, setEditingProductForm] = useState<Product | null>(null);
  const [deleteConfirmProdId, setDeleteConfirmProdId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3000);
  };

  // AI Translation State
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [translationNotice, setTranslationNotice] = useState<string | null>(null);

  // Formspree Test State
  const [isTestingFormspree, setIsTestingFormspree] = useState<boolean>(false);
  const [formspreeTestResult, setFormspreeTestResult] = useState<{ success: boolean; msg: string } | null>(null);

  const handleTestFormspree = async () => {
    setIsTestingFormspree(true);
    setFormspreeTestResult(null);
    try {
      const endpoint = companyInfo.formspreeUrl || DEFAULT_FORMSPREE_ENDPOINT;
      const res = await submitToFormspree(
        {
          companyName: '(주)백송이엔지 [관리자 테스트 전송]',
          contactName: '관리자 테스트',
          phone: companyInfo.phone,
          email: companyInfo.email,
          category: 'Formspree 연동 테스트',
          material: 'TEST',
          quantity: '1 EA',
          drawingFileName: 'test_connection.pdf',
          message: `Formspree 연동이 정상적으로 작동하고 있습니다.\n테스트 일시: ${new Date().toLocaleString()}`,
          source: '관리자 CMS 테스트 발송',
        },
        endpoint
      );

      if (res.success) {
        setFormspreeTestResult({
          success: true,
          msg: `Formspree (${endpoint}) 연동이 정상 확인되었습니다! 테스트 메일이 발송되었습니다.`,
        });
      } else {
        setFormspreeTestResult({
          success: false,
          msg: `Formspree 전송 실패: ${res.message || '엔드포인트를 확인해주세요.'}`,
        });
      }
    } catch (err: any) {
      setFormspreeTestResult({
        success: false,
        msg: `오류 발생: ${err.message}`,
      });
    } finally {
      setIsTestingFormspree(false);
    }
  };

  // Batch translate all CMS items
  const handleBatchTranslateAll = async () => {
    setIsTranslating(true);
    setTranslationNotice('✨ Gemini AI가 모든 등록 데이터의 한국어를 바탕으로 영문 및 중문 번역을 자동 생성하는 중입니다...');
    try {
      // 1. Products
      for (const prod of products) {
        if (prod.title) {
          const transTitle = await autoTranslateText(prod.title, 'Precision CNC machined part title');
          const transDesc = prod.description ? await autoTranslateText(prod.description, 'Precision CNC machined part description') : { english: '', chinese: '' };
          const transMat = prod.material ? await autoTranslateText(prod.material, 'Part material') : { english: prod.material, chinese: prod.material };
          
          updateProduct(prod.id, {
            titleEn: transTitle.english,
            titleCn: transTitle.chinese,
            descriptionEn: transDesc.english || prod.description,
            descriptionCn: transDesc.chinese || prod.description,
            materialEn: transMat.english || prod.material,
            materialCn: transMat.chinese || prod.material,
          });
        }
      }

      // 2. Hero Slides
      for (const slide of heroSlides) {
        if (slide.title) {
          const transBadge = slide.badge ? await autoTranslateText(slide.badge, 'Hero banner badge') : { english: '', chinese: '' };
          const transTitle = await autoTranslateText(slide.title, 'Hero banner title');
          const transSub = slide.subtitle ? await autoTranslateText(slide.subtitle, 'Hero banner subtitle') : { english: '', chinese: '' };

          updateHeroSlide(slide.id, {
            badgeEn: transBadge.english,
            badgeCn: transBadge.chinese,
            titleEn: transTitle.english,
            titleCn: transTitle.chinese,
            subtitleEn: transSub.english,
            subtitleCn: transSub.chinese,
          });
        }
      }

      // 3. News Posts
      for (const post of newsPosts) {
        if (post.title) {
          const transTitle = await autoTranslateText(post.title, 'Company news title');
          const transContent = post.content ? await autoTranslateText(post.content, 'Company news content') : { english: '', chinese: '' };

          updateNewsPost(post.id, {
            titleEn: transTitle.english,
            titleCn: transTitle.chinese,
            contentEn: transContent.english,
            contentCn: transContent.chinese,
          });
        }
      }

      // 4. History Items
      for (const hist of historyItems) {
        if (hist.title) {
          const transTitle = await autoTranslateText(hist.title, 'Company history title');
          const transDesc = hist.description ? await autoTranslateText(hist.description, 'Company history description') : { english: '', chinese: '' };

          updateHistoryItem(hist.id, {
            titleEn: transTitle.english,
            titleCn: transTitle.chinese,
            descriptionEn: transDesc.english,
            descriptionCn: transDesc.chinese,
          });
        }
      }

      // 5. Equipment
      for (const eq of equipments) {
        if (eq.name) {
          const transName = await autoTranslateText(eq.name, 'Equipment name');
          const transSpec = eq.workingArea ? await autoTranslateText(eq.workingArea, 'Equipment specification') : { english: eq.workingArea, chinese: eq.workingArea };

          updateEquipment(eq.id, {
            nameEn: transName.english,
            nameCn: transName.chinese,
            specEn: transSpec.english,
            specCn: transSpec.chinese,
          });
        }
      }

      // 6. Company Info Text
      if (companyInfo.slogan) {
        const transSlogan = await autoTranslateText(companyInfo.slogan, 'Company slogan');
        const transDesc = companyInfo.description ? await autoTranslateText(companyInfo.description, 'Company description') : { english: '', chinese: '' };
        updateCompanyInfo({
          sloganEn: transSlogan.english,
          sloganCn: transSlogan.chinese,
          descriptionEn: transDesc.english,
          descriptionCn: transDesc.chinese,
        });
      }

      // 7. Factory Photos
      for (const photo of factoryPhotos) {
        if (photo.titleKo) {
          const transTitle = await autoTranslateText(photo.titleKo, 'Factory facility photo title');
          const transDesc = photo.descKo ? await autoTranslateText(photo.descKo, 'Factory facility photo description') : { english: '', chinese: '' };
          const transTag = photo.tagKo ? await autoTranslateText(photo.tagKo, 'Factory photo category tag') : { english: photo.tagKo, chinese: photo.tagKo };

          updateFactoryPhoto(photo.id, {
            titleEn: transTitle.english,
            titleCn: transTitle.chinese,
            descEn: transDesc.english,
            descCn: transDesc.chinese,
            tagEn: transTag.english,
            tagCn: transTag.chinese,
          });
        }
      }

      setTranslationNotice('🎉 모든 CMS 데이터의 영문 및 중문 AI 자동번역/동기화가 완료되었습니다!');
    } catch (err) {
      console.error('Batch translate error:', err);
      setTranslationNotice('번역 처리 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsTranslating(false);
      setTimeout(() => setTranslationNotice(null), 6000);
    }
  };

  const handleStartInlineEdit = (slide: HeroSlide) => {
    setEditingSlideId(slide.id);
    setInlineSlideForm({ ...slide });
  };

  const handleCancelInlineEdit = () => {
    setEditingSlideId(null);
    setInlineSlideForm(null);
  };

  const handleSaveInlineEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineSlideForm) return;

    if (!inlineSlideForm.imageUrl.trim()) {
      alert('배경 이미지 URL 또는 파일 업로드가 필요합니다.');
      return;
    }
    if (!inlineSlideForm.title.trim()) {
      alert('메인 타이틀 제목을 입력해주세요.');
      return;
    }

    let updatedForm = { ...inlineSlideForm };
    if (!updatedForm.titleEn || !updatedForm.titleCn) {
      setIsTranslating(true);
      try {
        const titleTrans = await autoTranslateText(updatedForm.title, 'Hero slide title');
        const badgeTrans = updatedForm.badge ? await autoTranslateText(updatedForm.badge, 'Hero badge') : { english: '', chinese: '' };
        const subTrans = updatedForm.subtitle ? await autoTranslateText(updatedForm.subtitle, 'Hero subtitle') : { english: '', chinese: '' };

        updatedForm.badgeEn = updatedForm.badgeEn || badgeTrans.english;
        updatedForm.badgeCn = updatedForm.badgeCn || badgeTrans.chinese;
        updatedForm.titleEn = updatedForm.titleEn || titleTrans.english;
        updatedForm.titleCn = updatedForm.titleCn || titleTrans.chinese;
        updatedForm.subtitleEn = updatedForm.subtitleEn || subTrans.english;
        updatedForm.subtitleCn = updatedForm.subtitleCn || subTrans.chinese;
      } catch (err) {
        console.error(err);
      } finally {
        setIsTranslating(false);
      }
    }

    updateHeroSlide(updatedForm.id, updatedForm);
    alert('슬라이드 내용이 성공적으로 수정되었습니다 (영문/중문 자동 반영 완료).');
    handleCancelInlineEdit();
  };

  const handleAddSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideForm.imageUrl.trim()) {
      alert('슬라이드 배경 이미지를 업로드하거나 이미지 URL을 입력해주세요.');
      return;
    }
    if (!slideForm.title.trim()) {
      alert('슬라이드 메인 타이틀을 입력해주세요.');
      return;
    }

    let finalForm = { ...slideForm };
    if (!finalForm.titleEn || !finalForm.titleCn) {
      setIsTranslating(true);
      try {
        const titleTrans = await autoTranslateText(finalForm.title, 'Hero slide title');
        const badgeTrans = finalForm.badge ? await autoTranslateText(finalForm.badge, 'Hero badge') : { english: '', chinese: '' };
        const subTrans = finalForm.subtitle ? await autoTranslateText(finalForm.subtitle, 'Hero subtitle') : { english: '', chinese: '' };

        finalForm.badgeEn = finalForm.badgeEn || badgeTrans.english;
        finalForm.badgeCn = finalForm.badgeCn || badgeTrans.chinese;
        finalForm.titleEn = finalForm.titleEn || titleTrans.english;
        finalForm.titleCn = finalForm.titleCn || titleTrans.chinese;
        finalForm.subtitleEn = finalForm.subtitleEn || subTrans.english;
        finalForm.subtitleCn = finalForm.subtitleCn || subTrans.chinese;
      } catch (err) {
        console.error(err);
      } finally {
        setIsTranslating(false);
      }
    }

    addHeroSlide(finalForm);
    alert('새 슬라이드가 성공적으로 추가되었으며, 영문/중문 번역이 자동 생성되었습니다.');
    setSlideForm({
      badge: '',
      badgeEn: '',
      badgeCn: '',
      title: '',
      titleEn: '',
      titleCn: '',
      subtitle: '',
      subtitleEn: '',
      subtitleCn: '',
      imageUrl: '',
    });
  };

  const handleStartInlineEditFactoryPhoto = (photo: FactoryPhotoItem) => {
    setEditingFactoryPhotoId(photo.id);
    setInlineFactoryPhotoForm({
      ...photo,
      factoryType: photo.factoryType || 'factory1',
    });
  };

  const handleCancelInlineEditFactoryPhoto = () => {
    setEditingFactoryPhotoId(null);
    setInlineFactoryPhotoForm(null);
  };

  const handleSaveInlineEditFactoryPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineFactoryPhotoForm) return;

    let updated = { ...inlineFactoryPhotoForm };
    if (!updated.factoryType) {
      updated.factoryType = 'factory1';
    }
    if (!updated.titleEn || !updated.titleCn) {
      setIsTranslating(true);
      try {
        const titleTrans = await autoTranslateText(updated.titleKo, 'Factory facility photo title');
        const descTrans = updated.descKo ? await autoTranslateText(updated.descKo, 'Factory facility photo description') : { english: '', chinese: '' };
        const tagTrans = updated.tagKo ? await autoTranslateText(updated.tagKo, 'Factory tag') : { english: updated.tagKo, chinese: updated.tagKo };

        updated.titleEn = updated.titleEn || titleTrans.english;
        updated.titleCn = updated.titleCn || titleTrans.chinese;
        updated.descEn = updated.descEn || descTrans.english;
        updated.descCn = updated.descCn || descTrans.chinese;
        updated.tagEn = updated.tagEn || tagTrans.english;
        updated.tagCn = updated.tagCn || tagTrans.chinese;
      } catch (err) {
        console.error(err);
      } finally {
        setIsTranslating(false);
      }
    }

    updateFactoryPhoto(updated.id, updated);
    showToast('공장 현장 사진 정보가 성공적으로 수정되었습니다.');
    handleCancelInlineEditFactoryPhoto();
  };

  const handleAddFactoryPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factoryPhotoForm.image.trim()) {
      alert('공장 현장 사진을 업로드하거나 이미지 URL을 입력해주세요.');
      return;
    }
    if (!factoryPhotoForm.titleKo.trim()) {
      alert('사진 제목(설명)을 입력해주세요.');
      return;
    }

    let finalForm = {
      ...factoryPhotoForm,
      factoryType: factoryPhotoForm.factoryType || (adminFactoryPlantTab === 'factory2' ? 'factory2' : 'factory1'),
    };
    if (!finalForm.titleEn || !finalForm.titleCn) {
      setIsTranslating(true);
      try {
        const titleTrans = await autoTranslateText(finalForm.titleKo, 'Factory facility photo title');
        const descTrans = finalForm.descKo ? await autoTranslateText(finalForm.descKo, 'Factory facility photo description') : { english: '', chinese: '' };
        const tagTrans = finalForm.tagKo ? await autoTranslateText(finalForm.tagKo, 'Factory tag') : { english: finalForm.tagKo, chinese: finalForm.tagKo };

        finalForm.titleEn = finalForm.titleEn || titleTrans.english;
        finalForm.titleCn = finalForm.titleCn || titleTrans.chinese;
        finalForm.descEn = finalForm.descEn || descTrans.english;
        finalForm.descCn = finalForm.descCn || descTrans.chinese;
        finalForm.tagEn = finalForm.tagEn || tagTrans.english;
        finalForm.tagCn = finalForm.tagCn || tagTrans.chinese;
      } catch (err) {
        console.error(err);
      } finally {
        setIsTranslating(false);
      }
    }

    addFactoryPhoto(finalForm);
    const plantName = finalForm.factoryType === 'factory2' ? '제2공장' : '제1공장';
    showToast(`새 ${plantName} 현장 사진이 성공적으로 등록되었습니다.`);
    setFactoryPhotoForm({
      image: '',
      factoryType: adminFactoryPlantTab === 'factory2' ? 'factory2' : 'factory1',
      titleKo: '',
      titleEn: '',
      titleCn: '',
      descKo: '',
      descEn: '',
      descCn: '',
      tagKo: adminFactoryPlantTab === 'factory2' ? '제2공장' : '제1공장',
      tagEn: adminFactoryPlantTab === 'factory2' ? 'Plant 2' : 'Plant 1',
      tagCn: adminFactoryPlantTab === 'factory2' ? '第2工厂' : '第1工厂',
    });
  };

  if (!isAdminOpen) return null;

  const presetColors = [
    { name: 'Aura Purple', color: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.4)' },
    { name: 'Electric Violet', color: '#A855F7', glow: 'rgba(168, 85, 247, 0.4)' },
    { name: 'Cyber Indigo', color: '#6366F1', glow: 'rgba(99, 102, 241, 0.4)' },
    { name: 'Neon Cyan', color: '#06B6D4', glow: 'rgba(6, 182, 212, 0.4)' },
    { name: 'Emerald High-Tech', color: '#10B981', glow: 'rgba(16, 185, 129, 0.4)' },
    { name: 'Deep Gold', color: '#F59E0B', glow: 'rgba(245, 158, 11, 0.4)' },
  ];

  // Helper to read current section translation or fallback to default t
  const getTrans = (section: string, key: string, defaultVal: string) => {
    return customTranslations?.[cmsLang]?.[section]?.[key] ?? defaultVal;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xl animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-6xl w-full h-[92vh] flex flex-col shadow-2xl relative overflow-hidden text-slate-800">
        
        {/* Top Header */}
        <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between bg-slate-50 gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center p-0.5 shadow-md shrink-0"
              style={{ background: `linear-gradient(135deg, ${themeConfig.accentColor}, #4C1D95)` }}
            >
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <Settings className="w-5 h-5 text-purple-700 animate-spin-slow" />
              </div>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                <span>(주)백송이엔지 CMS 통합 관리자 대시보드</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>FIREBASE CLOUD DB & STORAGE (pro-axis-wdw25) 연동</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-mono font-bold">
                  MULTI-LANG LIVE CMS
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                구글 클라우드 DB(Firestore) 및 Cloud Storage와 실시간 연동되어 서버 재부팅 시에도 업로드한 공장 사진 및 제품 정보가 영구 보존됩니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* AI Auto Translation Sync Button */}
            <button
              onClick={handleBatchTranslateAll}
              disabled={isTranslating}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-purple-600 to-indigo-600 hover:from-amber-500 hover:to-purple-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all border border-amber-300 disabled:opacity-50 shrink-0 cursor-pointer"
              title="한국어로 등록된 모든 CMS 데이터를 영문 및 중문으로 AI 자동번역 및 동기화합니다."
            >
              {isTranslating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
                  <span>AI 영/중문 번역 진행 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>✨ AI 전체 영/중문 번역 동기화</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                if (window.confirm('모든 CMS 데이터 및 테마 설정을 초기화하시겠습니까?')) {
                  resetToDefault();
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-1"
              title="샘플 데이터 초기화"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>설정 초기화</span>
            </button>

            <button
              id="close-admin-modal-btn"
              onClick={() => setIsAdminOpen(false)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              title="관리자 화면을 닫고 메인 홈페이지(/)로 이동합니다"
            >
              <span>메인 홈페이지로 이동</span>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Translation Banner Notice */}
        {translationNotice && (
          <div className="px-6 py-2.5 bg-gradient-to-r from-purple-900 to-indigo-900 text-white text-xs font-bold flex items-center justify-between gap-3 border-b border-purple-700 shadow-inner animate-fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin shrink-0" />
              <span>{translationNotice}</span>
            </div>
            {isTranslating && (
              <span className="text-[10px] font-mono text-amber-200 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-700">
                GEMINI AI POWERED
              </span>
            )}
          </div>
        )}

        {/* Global CMS Edit Language Selector */}
        <div className="px-6 py-2.5 bg-purple-950 text-white flex items-center justify-between gap-4 border-b border-purple-900 text-xs">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-purple-300" />
            <span className="font-bold text-purple-200">CMS Content Edit Language (편집 언어):</span>
            <span className="text-[11px] text-purple-300 hidden sm:inline">
              선택한 언어 버전의 문구 및 단어를 실시간 수정합니다.
            </span>
          </div>

          <div className="flex items-center gap-1 bg-purple-900/70 p-1 rounded-xl border border-purple-700/60">
            {(['KO', 'EN', 'CN'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setCmsLang(lang)}
                className={`px-3 py-1 rounded-lg font-bold transition-all text-xs flex items-center gap-1.5 ${
                  cmsLang === lang
                    ? 'bg-purple-500 text-white shadow-sm'
                    : 'text-purple-300 hover:bg-purple-800'
                }`}
              >
                <span>{lang === 'KO' ? '🇰🇷 한국어' : lang === 'EN' ? '🇺🇸 English' : '🇨🇳 中文'}</span>
                {cmsLang === lang && <Check className="w-3 h-3 text-white" />}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-2 bg-slate-100 border-b border-slate-200 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('hero')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'hero'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>메인 슬라이더 ({heroSlides.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('factory')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'factory'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Factory className="w-4 h-4" />
            <span>공장 현장 사진 ({factoryPhotos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('company')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'company'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>회사소개 ({cmsLang})</span>
          </button>

          <button
            onClick={() => setActiveTab('orgchart')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'orgchart'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>조직도 관리 ({departments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('equipment')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'equipment'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>설비현황 ({equipments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'products'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>제품안내 ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('contact')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'contact'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>오시는길 & 견적요청</span>
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'inquiries'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>수주/견적 문의함 ({inquiries.length})</span>
            {inquiries.filter((i) => i.status === '대기중').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('news')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'news'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            <span>소식/게시글 ({newsPosts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'theme'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>테마 & 디자인</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="flex-1 overflow-y-auto p-6 text-xs text-slate-700 relative">
          {toastMessage && (
            <div className="sticky top-0 z-30 mb-4 px-4 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-between shadow-xl animate-fade-in border border-slate-700">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{toastMessage}</span>
              </span>
              <button
                type="button"
                onClick={() => setToastMessage(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>
          )}
          
          {/* TAB 0: Hero Slider Management */}
          {activeTab === 'hero' && (
            <div className="space-y-8 max-w-4xl">
              {/* Header Info */}
              <div className="p-4 rounded-2xl bg-[#2BB8A1]/10 border border-[#2BB8A1]/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-xl bg-[#2BB8A1] text-slate-950 font-bold">
                    <ImageIcon className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      메인 화면 배경 사진 & 슬라이드 문구 관리
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      홈페이지 최상단(히어로 섹션)에 순환 재생되는 배경 이미지 및 각 슬라이드별 타이틀, 뱃지, 설명을 수정/추가/삭제할 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* Add New Slide Form Card */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-purple-600" />
                    <span>새 배경 슬라이드 추가</span>
                  </h4>
                  <span className="text-xs text-slate-500">배경 사진과 메인/서브 타이틀 텍스트 입력</span>
                </div>

                <form onSubmit={handleAddSlide} className="space-y-5">
                  {/* Image Upload & Preview */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      배경 이미지 <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                      <div className="sm:col-span-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="이미지 URL 직접 입력 (https://...)"
                            value={slideForm.imageUrl}
                            onChange={(e) => setSlideForm({ ...slideForm, imageUrl: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-xs"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer flex items-center gap-2 transition-colors">
                            <Upload className="w-4 h-4" />
                            <span>내 컴퓨터에서 사진 업로드</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload(file, (url) => {
                                    setSlideForm({ ...slideForm, imageUrl: url });
                                  });
                                }
                              }}
                            />
                          </label>
                          <span className="text-[11px] text-slate-500">JPG, PNG, WEBP 지원</span>
                        </div>
                      </div>

                      {/* Live Image Box */}
                      <div className="relative h-28 bg-slate-900 rounded-xl overflow-hidden border border-slate-300 flex items-center justify-center">
                        {slideForm.imageUrl ? (
                          <img
                            src={slideForm.imageUrl}
                            alt="슬라이드 미리보기"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">사진 미리보기</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Badge Text inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">상단 뱃지 태그 (KO)</label>
                      <input
                        type="text"
                        placeholder="예: 반도체 장비 메탈 부품 초정밀 가공 선도기업"
                        value={slideForm.badge}
                        onChange={(e) => setSlideForm({ ...slideForm, badge: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">상단 뱃지 태그 (EN)</label>
                      <input
                        type="text"
                        placeholder="Leading Semiconductor Metal Machining"
                        value={slideForm.badgeEn || ''}
                        onChange={(e) => setSlideForm({ ...slideForm, badgeEn: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">상단 뱃지 태그 (CN)</label>
                      <input
                        type="text"
                        placeholder="半导体设备精密金属加工领军企业"
                        value={slideForm.badgeCn || ''}
                        onChange={(e) => setSlideForm({ ...slideForm, badgeCn: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Headline Title inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        메인 타이틀 제목 (KO) <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={2}
                        placeholder="예: 초정밀 가공의 한계를 넘어서는 기술력"
                        value={slideForm.title}
                        onChange={(e) => setSlideForm({ ...slideForm, title: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">메인 타이틀 제목 (EN)</label>
                      <textarea
                        rows={2}
                        placeholder="Precision Engineering Beyond Limits"
                        value={slideForm.titleEn || ''}
                        onChange={(e) => setSlideForm({ ...slideForm, titleEn: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">메인 타이틀 제목 (CN)</label>
                      <textarea
                        rows={2}
                        placeholder="超越精密切削加工极限的技术力量"
                        value={slideForm.titleCn || ''}
                        onChange={(e) => setSlideForm({ ...slideForm, titleCn: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold"
                      />
                    </div>
                  </div>

                  {/* Subtitle description inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">서브 설명 문구 (KO)</label>
                      <textarea
                        rows={3}
                        placeholder="반도체 장비 메탈 부품 초정밀 가공 전문 기업..."
                        value={slideForm.subtitle}
                        onChange={(e) => setSlideForm({ ...slideForm, subtitle: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">서브 설명 문구 (EN)</label>
                      <textarea
                        rows={3}
                        placeholder="Specialized in ultra-precision metal parts..."
                        value={slideForm.subtitleEn || ''}
                        onChange={(e) => setSlideForm({ ...slideForm, subtitleEn: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">서브 설명 문구 (CN)</label>
                      <textarea
                        rows={3}
                        placeholder="半导体设备金属零件超精密加工专业企业..."
                        value={slideForm.subtitleCn || ''}
                        onChange={(e) => setSlideForm({ ...slideForm, subtitleCn: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#2BB8A1] hover:bg-[#229a87] text-slate-950 font-bold flex items-center gap-2 shadow-md transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>새 슬라이드 추가 저장</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Slide List */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                  <span>등록된 배경 슬라이드 목록 ({heroSlides.length}개)</span>
                  <span className="text-xs text-slate-500 font-normal">
                    * 각 카드의 [수정] 버튼을 누르면 사진과 타이틀 텍스트를 바로 편집할 수 있습니다.
                  </span>
                </h4>

                <div className="grid grid-cols-1 gap-4">
                  {heroSlides.map((slide, idx) => {
                    const isEditingThis = editingSlideId === slide.id && inlineSlideForm;

                    return (
                      <div
                        key={slide.id}
                        className={`bg-white p-5 rounded-2xl border transition-all shadow-sm ${
                          isEditingThis
                            ? 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/10'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {isEditingThis ? (
                          /* INLINE EDIT FORM FOR THIS SLIDE */
                          <form onSubmit={handleSaveInlineEdit} className="space-y-5">
                            <div className="flex items-center justify-between pb-3 border-b border-purple-200">
                              <span className="font-extrabold text-purple-700 flex items-center gap-2 text-sm">
                                <Edit3 className="w-4 h-4" />
                                Slide #{idx + 1} 수정 편집기
                              </span>
                              <button
                                type="button"
                                onClick={handleCancelInlineEdit}
                                className="px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold"
                              >
                                취소
                              </button>
                            </div>

                            {/* Background Image Edit */}
                            <div>
                              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                                배경 사진 변경 <span className="text-red-500">*</span>
                              </label>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                                <div className="sm:col-span-2 space-y-2">
                                  <input
                                    type="text"
                                    placeholder="이미지 URL (https://...)"
                                    value={inlineSlideForm.imageUrl}
                                    onChange={(e) =>
                                      setInlineSlideForm({ ...inlineSlideForm, imageUrl: e.target.value })
                                    }
                                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-xs"
                                  />
                                  <div className="flex items-center gap-2">
                                    <label className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer flex items-center gap-2 transition-colors">
                                      <Upload className="w-4 h-4" />
                                      <span>새 파일로 교체 업로드</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            handleFileUpload(file, (url) => {
                                              setInlineSlideForm({ ...inlineSlideForm, imageUrl: url });
                                            });
                                          }
                                        }}
                                      />
                                    </label>
                                  </div>
                                </div>
                                <div className="relative h-24 bg-slate-900 rounded-xl overflow-hidden border border-slate-300">
                                  <img
                                    src={inlineSlideForm.imageUrl}
                                    alt="미리보기"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Badges Edit */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">상단 뱃지 (KO)</label>
                                <input
                                  type="text"
                                  value={inlineSlideForm.badge}
                                  onChange={(e) =>
                                    setInlineSlideForm({ ...inlineSlideForm, badge: e.target.value })
                                  }
                                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">상단 뱃지 (EN)</label>
                                <input
                                  type="text"
                                  value={inlineSlideForm.badgeEn || ''}
                                  onChange={(e) =>
                                    setInlineSlideForm({ ...inlineSlideForm, badgeEn: e.target.value })
                                  }
                                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">상단 뱃지 (CN)</label>
                                <input
                                  type="text"
                                  value={inlineSlideForm.badgeCn || ''}
                                  onChange={(e) =>
                                    setInlineSlideForm({ ...inlineSlideForm, badgeCn: e.target.value })
                                  }
                                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900"
                                />
                              </div>
                            </div>

                            {/* Main Titles Edit */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                  메인 타이틀 제목 (KO) <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                  rows={2}
                                  value={inlineSlideForm.title}
                                  onChange={(e) =>
                                    setInlineSlideForm({ ...inlineSlideForm, title: e.target.value })
                                  }
                                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">메인 타이틀 제목 (EN)</label>
                                <textarea
                                  rows={2}
                                  value={inlineSlideForm.titleEn || ''}
                                  onChange={(e) =>
                                    setInlineSlideForm({ ...inlineSlideForm, titleEn: e.target.value })
                                  }
                                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">메인 타이틀 제목 (CN)</label>
                                <textarea
                                  rows={2}
                                  value={inlineSlideForm.titleCn || ''}
                                  onChange={(e) =>
                                    setInlineSlideForm({ ...inlineSlideForm, titleCn: e.target.value })
                                  }
                                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-900"
                                />
                              </div>
                            </div>

                            {/* Subtitles Edit */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">서브 설명 (KO)</label>
                                <textarea
                                  rows={3}
                                  value={inlineSlideForm.subtitle}
                                  onChange={(e) =>
                                    setInlineSlideForm({ ...inlineSlideForm, subtitle: e.target.value })
                                  }
                                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">서브 설명 (EN)</label>
                                <textarea
                                  rows={3}
                                  value={inlineSlideForm.subtitleEn || ''}
                                  onChange={(e) =>
                                    setInlineSlideForm({ ...inlineSlideForm, subtitleEn: e.target.value })
                                  }
                                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">서브 설명 (CN)</label>
                                <textarea
                                  rows={3}
                                  value={inlineSlideForm.subtitleCn || ''}
                                  onChange={(e) =>
                                    setInlineSlideForm({ ...inlineSlideForm, subtitleCn: e.target.value })
                                  }
                                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900"
                                />
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-2 flex items-center justify-end gap-3 border-t border-purple-200">
                              <button
                                type="button"
                                onClick={handleCancelInlineEdit}
                                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs"
                              >
                                취소
                              </button>
                              <button
                                type="submit"
                                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                              >
                                <Check className="w-4 h-4" />
                                <span>수정 내용 저장 적용</span>
                              </button>
                            </div>
                          </form>
                        ) : (
                          /* DISPLAY CARD */
                          <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
                            {/* Image Thumbnail */}
                            <div className="w-full md:w-48 h-28 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200 relative group">
                              <img
                                src={slide.imageUrl}
                                alt={slide.title}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 text-teal-300 font-bold font-mono text-[10px]">
                                Slide #{idx + 1}
                              </span>
                            </div>

                            {/* Details */}
                            <div className="flex-1 space-y-1 text-xs">
                              <div className="inline-block px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 font-bold text-[11px] mb-1 border border-teal-200">
                                {slide.badge}
                              </div>
                              <h5 className="font-extrabold text-slate-900 text-sm">{slide.title}</h5>
                              <p className="text-slate-600 line-clamp-2">{slide.subtitle}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
                              <button
                                onClick={() => handleStartInlineEdit(slide)}
                                className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-bold flex items-center gap-1.5 transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-purple-600" />
                                <span>수정</span>
                              </button>
                              <button
                                onClick={() => {
                                  if (heroSlides.length <= 1) {
                                    showToast('⚠️ 최소 1개 이상의 슬라이드가 유지되어야 합니다.');
                                    return;
                                  }
                                  deleteHeroSlide(slide.id);
                                  showToast('배경 슬라이드가 삭제되었습니다.');
                                }}
                                className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>삭제</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 0.5: Factory Photos Management */}
          {activeTab === 'factory' && (
            <div className="space-y-8 max-w-4xl">
              {/* Header Info */}
              <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-xl bg-cyan-600 text-white font-bold">
                    <Factory className="w-5 h-5" />
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span>(주)백송이엔지 1공장 / 2공장 가공 현장 사진 관리</span>
                      <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 text-[10px] font-bold">
                        총 {factoryPhotos.length}장 (1공장: {factoryPhotos.filter(p => (p.factoryType || 'factory1') === 'factory1').length}장 / 2공장: {factoryPhotos.filter(p => p.factoryType === 'factory2').length}장)
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      회사소개 페이지의 실제 공장 갤러리 슬라이드에 표시되는 1공장 및 2공장 사진을 구분하여 등록, 수정, 삭제합니다. 등록된 사진은 퍼블리시 및 배포 시에도 안전하게 보존됩니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 1공장 / 2공장 전환 서브 탭 */}
              <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setAdminFactoryPlantTab('factory1');
                    setFactoryPhotoForm((prev) => ({
                      ...prev,
                      factoryType: 'factory1',
                      tagKo: prev.tagKo === '제2공장' ? '제1공장' : prev.tagKo,
                      tagEn: prev.tagEn === 'Plant 2' ? 'Plant 1' : prev.tagEn,
                      tagCn: prev.tagCn === '第2工厂' ? '第1工厂' : prev.tagCn,
                    }));
                  }}
                  className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    adminFactoryPlantTab === 'factory1'
                      ? 'bg-[#2BB8A1] text-white shadow-md'
                      : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Factory className="w-4 h-4" />
                  <span>제1공장 사진 관리</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    adminFactoryPlantTab === 'factory1' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {factoryPhotos.filter(p => (p.factoryType || 'factory1') === 'factory1').length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAdminFactoryPlantTab('factory2');
                    setFactoryPhotoForm((prev) => ({
                      ...prev,
                      factoryType: 'factory2',
                      tagKo: prev.tagKo === '제1공장' ? '제2공장' : prev.tagKo,
                      tagEn: prev.tagEn === 'Plant 1' ? 'Plant 2' : prev.tagEn,
                      tagCn: prev.tagCn === '第1工厂' ? '第2工厂' : prev.tagCn,
                    }));
                  }}
                  className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    adminFactoryPlantTab === 'factory2'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Factory className="w-4 h-4" />
                  <span>제2공장 사진 관리</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    adminFactoryPlantTab === 'factory2' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {factoryPhotos.filter(p => p.factoryType === 'factory2').length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminFactoryPlantTab('all')}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    adminFactoryPlantTab === 'all'
                      ? 'bg-slate-800 text-white shadow-md'
                      : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span>전체 보기 ({factoryPhotos.length})</span>
                </button>
              </div>

              {/* Add New Factory Photo Form Card */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-cyan-600" />
                    <span>
                      새 {adminFactoryPlantTab === 'factory2' ? '제2공장' : '제1공장'} 사진 추가 등록
                    </span>
                  </h4>
                  <span className="text-xs text-slate-500">실제 공장 가공 설비/현장 사진 등록</span>
                </div>

                <form onSubmit={handleAddFactoryPhoto} className="space-y-5">
                  {/* Factory Plant Selector (1공장 vs 2공장) */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      등록 대상 공장 선택 <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFactoryPhotoForm({ ...factoryPhotoForm, factoryType: 'factory1' })}
                        className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                          factoryPhotoForm.factoryType === 'factory1' || !factoryPhotoForm.factoryType
                            ? 'border-[#2BB8A1] bg-teal-50/60 ring-2 ring-[#2BB8A1]/30'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          factoryPhotoForm.factoryType === 'factory1' || !factoryPhotoForm.factoryType
                            ? 'bg-[#2BB8A1] text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Factory className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-extrabold text-slate-900">제1공장</div>
                          <div className="text-[10px] text-slate-500">MCT & CNC 초정밀 가공 라인</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFactoryPhotoForm({ ...factoryPhotoForm, factoryType: 'factory2' })}
                        className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                          factoryPhotoForm.factoryType === 'factory2'
                            ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/30'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          factoryPhotoForm.factoryType === 'factory2'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Factory className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-extrabold text-slate-900">제2공장</div>
                          <div className="text-[10px] text-slate-500">초대형 부품/플레이트 가공 플랜트</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Image Upload & Preview */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      현장 사진 <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                      <div className="sm:col-span-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="이미지 URL 직접 입력 (https://... 또는 data:image/...)"
                            value={factoryPhotoForm.image}
                            onChange={(e) => setFactoryPhotoForm({ ...factoryPhotoForm, image: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-xs"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs cursor-pointer flex items-center gap-2 transition-colors">
                            <Upload className="w-4 h-4" />
                            <span>내 컴퓨터에서 사진 업로드</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload(file, (url) => {
                                    setFactoryPhotoForm({ ...factoryPhotoForm, image: url });
                                  });
                                }
                              }}
                            />
                          </label>
                          <span className="text-[11px] text-slate-500">JPG, PNG, WEBP 지원</span>
                        </div>
                      </div>

                      {/* Live Image Box */}
                      <div className="relative h-28 bg-slate-950 rounded-xl overflow-hidden border border-slate-300 flex items-center justify-center">
                        {factoryPhotoForm.image ? (
                          <img
                            src={factoryPhotoForm.image}
                            alt="현장 사진 미리보기"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">사진 미리보기</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Category Tag & Title (KO) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">분류 태그 (KO)</label>
                      <input
                        type="text"
                        placeholder="예: 제1공장 가공실, MCT 라인"
                        value={factoryPhotoForm.tagKo}
                        onChange={(e) => setFactoryPhotoForm({ ...factoryPhotoForm, tagKo: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        사진 제목 / 설비명 (KO) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="예: 두산·DNM 머시닝센터(MCT) 가공 라인"
                        value={factoryPhotoForm.titleKo}
                        onChange={(e) => setFactoryPhotoForm({ ...factoryPhotoForm, titleKo: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-900"
                        required
                      />
                    </div>
                  </div>

                  {/* Description (KO) */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">상세 설명 (KO)</label>
                    <input
                      type="text"
                      placeholder="예: 최신 고속 머시닝센터 가공 설비 및 갠트리 크레인 시스템"
                      value={factoryPhotoForm.descKo}
                      onChange={(e) => setFactoryPhotoForm({ ...factoryPhotoForm, descKo: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900"
                    />
                  </div>

                  {/* Multilingual (EN & CN) Optional inputs */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-cyan-600" />
                        <span>다국어 번역 설정 (미입력 시 AI가 자동 번역)</span>
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">English Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Doosan/DNM MCT Machining Center Line"
                          value={factoryPhotoForm.titleEn}
                          onChange={(e) => setFactoryPhotoForm({ ...factoryPhotoForm, titleEn: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">中文 标题</label>
                        <input
                          type="text"
                          placeholder="例如: 斗山/DNM加工中心(MCT)生产线"
                          value={factoryPhotoForm.titleCn}
                          onChange={(e) => setFactoryPhotoForm({ ...factoryPhotoForm, titleCn: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer transition-colors ${
                        factoryPhotoForm.factoryType === 'factory2'
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-cyan-600 hover:bg-cyan-700'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>{factoryPhotoForm.factoryType === 'factory2' ? '제2공장' : '제1공장'} 사진 등록</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Registered Factory Photos List */}
              <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-100/80 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-cyan-600" />
                      <span className="text-sm font-bold text-slate-900">
                        {adminFactoryPlantTab === 'factory1'
                          ? '제1공장 등록 사진 목록'
                          : adminFactoryPlantTab === 'factory2'
                          ? '제2공장 등록 사진 목록'
                          : '등록된 전체 공장 사진 목록'}
                        {' '}({factoryPhotos.filter(p => adminFactoryPlantTab === 'all' ? true : (p.factoryType || 'factory1') === adminFactoryPlantTab).length}개)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-xs">
                      <ArrowUpDown className="w-3.5 h-3.5 text-cyan-600" />
                      <span>카드의 <strong>[위로] / [아래로]</strong> 버튼 또는 <strong>[순서 번호]</strong>로 슬라이드 노출 순서를 변경할 수 있습니다.</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(() => {
                      const filteredList = factoryPhotos.filter((p) =>
                        adminFactoryPlantTab === 'all' ? true : (p.factoryType || 'factory1') === adminFactoryPlantTab
                      );

                      return filteredList.map((photo, idx) => {
                        const isEditingThis = editingFactoryPhotoId === photo.id && inlineFactoryPhotoForm;
                        const isPlant2 = photo.factoryType === 'factory2';
                        const isFirst = idx === 0;
                        const isLast = idx === filteredList.length - 1;

                        return (
                          <div
                            key={photo.id}
                            className={`bg-white p-4 rounded-2xl border transition-all shadow-sm ${
                              isEditingThis
                                ? 'border-cyan-500 ring-2 ring-cyan-500/20 bg-cyan-50/10'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {isEditingThis ? (
                              /* INLINE EDIT FORM FOR THIS PHOTO */
                              <form onSubmit={handleSaveInlineEditFactoryPhoto} className="space-y-4">
                                <div className="flex items-center justify-between pb-2 border-b border-cyan-200">
                                  <span className="font-extrabold text-cyan-700 flex items-center gap-1.5 text-xs">
                                    <Edit3 className="w-3.5 h-3.5" />
                                    사진 #{idx + 1} 정보 수정
                                  </span>
                                  <button
                                    type="button"
                                    onClick={handleCancelInlineEditFactoryPhoto}
                                    className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-semibold"
                                  >
                                    취소
                                  </button>
                                </div>

                                {/* Factory Type Selector */}
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-700 mb-1">공장 구분</label>
                                  <div className="grid grid-cols-2 gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setInlineFactoryPhotoForm({ ...inlineFactoryPhotoForm, factoryType: 'factory1' })}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                                        inlineFactoryPhotoForm.factoryType === 'factory1' || !inlineFactoryPhotoForm.factoryType
                                          ? 'bg-[#2BB8A1] text-white border-[#2BB8A1] shadow-sm'
                                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                      }`}
                                    >
                                      <Factory className="w-3 h-3" />
                                      <span>제1공장</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setInlineFactoryPhotoForm({ ...inlineFactoryPhotoForm, factoryType: 'factory2' })}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                                        inlineFactoryPhotoForm.factoryType === 'factory2'
                                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                      }`}
                                    >
                                      <Factory className="w-3 h-3" />
                                      <span>제2공장</span>
                                    </button>
                                  </div>
                                </div>

                                {/* Image Change */}
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                    사진 변경 <span className="text-red-500">*</span>
                                  </label>
                                  <div className="flex gap-2 items-center">
                                    <input
                                      type="text"
                                      placeholder="이미지 URL"
                                      value={inlineFactoryPhotoForm.image}
                                      onChange={(e) =>
                                        setInlineFactoryPhotoForm({ ...inlineFactoryPhotoForm, image: e.target.value })
                                      }
                                      className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-mono"
                                    />
                                    <label className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs cursor-pointer flex items-center gap-1 shrink-0">
                                      <Upload className="w-3.5 h-3.5" />
                                      <span>파일 선택</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            handleFileUpload(file, (url) => {
                                              setInlineFactoryPhotoForm({ ...inlineFactoryPhotoForm, image: url });
                                            });
                                          }
                                        }}
                                      />
                                    </label>
                                  </div>
                                </div>

                                {/* Tag & Title KO */}
                                <div className="grid grid-cols-3 gap-2">
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">태그 (KO)</label>
                                    <input
                                      type="text"
                                      value={inlineFactoryPhotoForm.tagKo}
                                      onChange={(e) =>
                                        setInlineFactoryPhotoForm({ ...inlineFactoryPhotoForm, tagKo: e.target.value })
                                      }
                                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs"
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">제목 (KO)</label>
                                    <input
                                      type="text"
                                      value={inlineFactoryPhotoForm.titleKo}
                                      onChange={(e) =>
                                        setInlineFactoryPhotoForm({ ...inlineFactoryPhotoForm, titleKo: e.target.value })
                                      }
                                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 font-bold text-xs"
                                    />
                                  </div>
                                </div>

                                {/* Description KO */}
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">설명 (KO)</label>
                                  <input
                                    type="text"
                                    value={inlineFactoryPhotoForm.descKo}
                                    onChange={(e) =>
                                      setInlineFactoryPhotoForm({ ...inlineFactoryPhotoForm, descKo: e.target.value })
                                    }
                                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs"
                                  />
                                </div>

                                {/* Multilingual EN / CN */}
                                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Title (EN)</label>
                                    <input
                                      type="text"
                                      value={inlineFactoryPhotoForm.titleEn || ''}
                                      onChange={(e) =>
                                        setInlineFactoryPhotoForm({ ...inlineFactoryPhotoForm, titleEn: e.target.value })
                                      }
                                      className="w-full px-2 py-1 rounded bg-slate-50 border border-slate-200 text-[11px]"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Title (CN)</label>
                                    <input
                                      type="text"
                                      value={inlineFactoryPhotoForm.titleCn || ''}
                                      onChange={(e) =>
                                        setInlineFactoryPhotoForm({ ...inlineFactoryPhotoForm, titleCn: e.target.value })
                                      }
                                      className="w-full px-2 py-1 rounded bg-slate-50 border border-slate-200 text-[11px]"
                                    />
                                  </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                                  <button
                                    type="button"
                                    onClick={handleCancelInlineEditFactoryPhoto}
                                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                                  >
                                    취소
                                  </button>
                                  <button
                                    type="submit"
                                    className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>수정 완료</span>
                                  </button>
                                </div>
                              </form>
                            ) : (
                              /* PHOTO DISPLAY CARD */
                              <div className="space-y-3">
                                {/* Order Controller Bar on Card Top */}
                                <div className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                                  <div className="flex items-center gap-2">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-mono font-black shadow-xs">
                                      {idx + 1}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <span className="text-[11px] text-slate-500 font-bold">순서:</span>
                                      <select
                                        value={idx}
                                        onChange={(e) => {
                                          const targetIdx = Number(e.target.value);
                                          moveFactoryPhotoToPosition(photo.id, targetIdx, adminFactoryPlantTab);
                                          showToast(`'${photo.titleKo}' 사진이 ${targetIdx + 1}번째 순서로 변경되었습니다.`);
                                        }}
                                        className="px-2 py-1 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-800 cursor-pointer shadow-xs focus:ring-1 focus:ring-cyan-500"
                                      >
                                        {filteredList.map((_, pIdx) => (
                                          <option key={pIdx} value={pIdx}>
                                            {pIdx + 1}번째 {pIdx === 0 ? '(맨 앞)' : pIdx === filteredList.length - 1 ? '(맨 뒤)' : ''}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>

                                  {/* Up / Down Move Buttons */}
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      disabled={isFirst}
                                      onClick={() => {
                                        moveFactoryPhotoInFilter(photo.id, 'up', adminFactoryPlantTab);
                                        showToast(`'${photo.titleKo}' 사진의 순서가 앞으로 이동되었습니다.`);
                                      }}
                                      className={`px-2 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all ${
                                        isFirst
                                          ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed opacity-50'
                                          : 'bg-white hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-300 text-slate-700 border-slate-300 shadow-xs cursor-pointer active:scale-95'
                                      }`}
                                      title="위로 (앞 순서로 이동)"
                                    >
                                      <ChevronUp className="w-3.5 h-3.5" />
                                      <span className="text-[11px]">위로</span>
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isLast}
                                      onClick={() => {
                                        moveFactoryPhotoInFilter(photo.id, 'down', adminFactoryPlantTab);
                                        showToast(`'${photo.titleKo}' 사진의 순서가 뒤로 이동되었습니다.`);
                                      }}
                                      className={`px-2 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all ${
                                        isLast
                                          ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed opacity-50'
                                          : 'bg-white hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-300 text-slate-700 border-slate-300 shadow-xs cursor-pointer active:scale-95'
                                      }`}
                                      title="아래로 (다음 순서로 이동)"
                                    >
                                      <ChevronDown className="w-3.5 h-3.5" />
                                      <span className="text-[11px]">아래로</span>
                                    </button>
                                  </div>
                                </div>

                                <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 group flex items-center justify-center">
                                  <img
                                    src={photo.image}
                                    alt={photo.titleKo}
                                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                  />
                                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                                    <span className="px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur text-white text-[10px] font-mono font-bold">
                                      #{idx + 1}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-md text-white text-[10px] font-bold shadow ${
                                      isPlant2 ? 'bg-blue-600' : 'bg-[#2BB8A1]'
                                    }`}>
                                      {isPlant2 ? '제2공장' : '제1공장'}
                                    </span>
                                    {photo.tagKo && (
                                      <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-200 text-[10px] font-bold">
                                        {photo.tagKo}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <h5 className="font-bold text-slate-900 text-xs leading-snug line-clamp-1">
                                    {photo.titleKo}
                                  </h5>
                                  {photo.descKo && (
                                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                                      {photo.descKo}
                                    </p>
                                  )}
                                  {(photo.titleEn || photo.titleCn) && (
                                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                                      EN: {photo.titleEn || '-'} | CN: {photo.titleCn || '-'}
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newType = isPlant2 ? 'factory1' : 'factory2';
                                        updateFactoryPhoto(photo.id, {
                                          ...photo,
                                          factoryType: newType,
                                          tagKo: newType === 'factory2' ? '제2공장' : '제1공장',
                                        });
                                        showToast(`${newType === 'factory2' ? '제2공장' : '제1공장'}으로 이동되었습니다.`);
                                      }}
                                      className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer transition-colors"
                                      title="공장 구분 즉시 변경"
                                    >
                                      {isPlant2 ? '➡️ 1공장으로 이동' : '➡️ 2공장으로 이동'}
                                    </button>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleStartInlineEditFactoryPhoto(photo)}
                                      className="px-3 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-700 font-bold flex items-center gap-1 text-xs transition-colors cursor-pointer"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                      <span>수정</span>
                                    </button>
                                    {deleteConfirmPhotoId === photo.id ? (
                                      <div className="flex items-center gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            deleteFactoryPhoto(photo.id);
                                            setDeleteConfirmPhotoId(null);
                                            showToast('공장 현장 사진이 삭제되었습니다.');
                                          }}
                                          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1 text-xs shadow-sm transition-colors cursor-pointer"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                          <span>삭제 확인</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setDeleteConfirmPhotoId(null)}
                                          className="px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                                        >
                                          취소
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (factoryPhotos.length <= 1) {
                                            showToast('⚠️ 최소 1개 이상의 현장 사진이 유지되어야 합니다.');
                                            return;
                                          }
                                          setDeleteConfirmPhotoId(photo.id);
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold flex items-center gap-1 text-xs transition-colors cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>삭제</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
          )}

          {/* TAB 1: Company Profile & About */}
          {activeTab === 'company' && (
            <div className="space-y-8 max-w-4xl">
              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-xl bg-purple-600 text-white font-bold text-xs">
                    {cmsLang}
                  </span>
                  <div>
                    <h4 className="font-bold text-purple-950 text-sm">
                      현재 편집 언어: {cmsLang === 'KO' ? '한국어 (KO)' : cmsLang === 'EN' ? '영어 (EN)' : '중국어 (CN)'}
                    </h4>
                    <p className="text-[11px] text-purple-700">
                      아래 문구 및 타이틀은 선택된 언어 버전({cmsLang})에 직접 반영됩니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* 1. Main Hero & About Text Translations */}
              <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-700" />
                  <span>히어로 & 회사소개 섹션 문구 ({cmsLang})</span>
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">히어로 슬로건 타이틀 ({cmsLang})</label>
                    <input
                      type="text"
                      value={getTrans('hero', 'slogan', companyInfo.slogan)}
                      onChange={(e) => updateSectionTranslation(cmsLang, 'hero', 'slogan', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">히어로 서브 타이틀 설명 ({cmsLang})</label>
                    <textarea
                      rows={2}
                      value={getTrans('hero', 'subtitle', companyInfo.description)}
                      onChange={(e) => updateSectionTranslation(cmsLang, 'hero', 'subtitle', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">회사소개 섹션 제목 ({cmsLang})</label>
                    <input
                      type="text"
                      value={getTrans('about', 'title', '고객 신뢰를 바탕으로 성장하는 정밀가공 파트너')}
                      onChange={(e) => updateSectionTranslation(cmsLang, 'about', 'title', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">회사소개 본문 내용 ({cmsLang})</label>
                    <textarea
                      rows={4}
                      value={getTrans('about', 'p1', companyInfo.description)}
                      onChange={(e) => updateSectionTranslation(cmsLang, 'about', 'p1', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Basic Company Metadata & Factory Image Upload */}
              <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-purple-700" />
                  <span>기업 사업자 기본 정보 및 공장 사진 파일 변경</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">회사 한글명</label>
                    <input
                      type="text"
                      value={companyInfo.name}
                      onChange={(e) => updateCompanyInfo({ name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">회사 영문명</label>
                    <input
                      type="text"
                      value={companyInfo.engName}
                      onChange={(e) => updateCompanyInfo({ engName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">대표이사 성함</label>
                    <input
                      type="text"
                      value={companyInfo.ceo}
                      onChange={(e) => updateCompanyInfo({ ceo: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">설립 연도</label>
                    <input
                      type="text"
                      value={companyInfo.establishedYear}
                      onChange={(e) => updateCompanyInfo({ establishedYear: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">사업자등록번호</label>
                    <input
                      type="text"
                      value={companyInfo.businessNumber}
                      onChange={(e) => updateCompanyInfo({ businessNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono"
                    />
                  </div>
                </div>

                {/* Images Upload Section (Factory/Building Photo & CEO Portrait Photo) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Factory Image Upload */}
                  <div className="p-4 bg-white rounded-xl border border-slate-300 space-y-3">
                    <label className="block font-bold text-slate-800 text-xs flex items-center justify-between">
                      <span>회사소개 대표 공장/건물 사진 파일 변경</span>
                      <span className="text-[10px] text-purple-700 font-mono">(3개 언어 공통 적용)</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-300 shrink-0 p-1 flex items-center justify-center relative">
                        <img
                          src={companyInfo.factoryImage}
                          alt="Factory Facility"
                          className="w-full h-full object-cover rounded-lg"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="flex-1 space-y-2">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs cursor-pointer border border-purple-300 shadow-sm transition-colors">
                          <Upload className="w-3.5 h-3.5 text-purple-700" />
                          <span>PC에서 공장 사진 선택</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleFileUpload(e.target.files[0], (dataUrl) => {
                                  updateCompanyInfo({ factoryImage: dataUrl });
                                });
                              }
                            }}
                          />
                        </label>

                        <input
                          type="text"
                          value={companyInfo.factoryImage || ''}
                          onChange={(e) => updateCompanyInfo({ factoryImage: e.target.value })}
                          className="w-full px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-300 text-[11px] font-mono"
                          placeholder="이미지 URL"
                        />
                      </div>
                    </div>
                  </div>

                  {/* CEO Image Upload */}
                  <div className="p-4 bg-white rounded-xl border border-slate-300 space-y-3">
                    <label className="block font-bold text-slate-800 text-xs flex items-center justify-between">
                      <span>CEO 인사말 프로필 사진 파일 변경</span>
                      <span className="text-[10px] text-purple-700 font-mono">(선택)</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-300 shrink-0 p-1 flex items-center justify-center relative">
                        {companyInfo.ceoImageUrl ? (
                          <img
                            src={companyInfo.ceoImageUrl}
                            alt="CEO Portrait"
                            className="w-full h-full object-cover rounded-xl"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="text-[10px] text-slate-400 text-center font-bold">사진 미등록 (심볼 표시)</div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs cursor-pointer border border-purple-300 shadow-sm transition-colors">
                          <Upload className="w-3.5 h-3.5 text-purple-700" />
                          <span>PC에서 대표 사진 선택</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleFileUpload(e.target.files[0], (dataUrl) => {
                                  updateCompanyInfo({ ceoImageUrl: dataUrl });
                                });
                              }
                            }}
                          />
                        </label>

                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={companyInfo.ceoImageUrl || ''}
                            onChange={(e) => updateCompanyInfo({ ceoImageUrl: e.target.value })}
                            className="w-full px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-300 text-[11px] font-mono"
                            placeholder="이미지 URL"
                          />
                          {companyInfo.ceoImageUrl && (
                            <button
                              type="button"
                              onClick={() => updateCompanyInfo({ ceoImageUrl: '' })}
                              className="px-2 py-1 text-[10px] bg-red-100 text-red-700 rounded font-bold shrink-0"
                              title="CEO 사진 삭제"
                            >
                              삭제
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. History Timeline Items Manager */}
              <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-700" />
                    <span>연혁 (History Timeline) 연도별 연혁 추가/수정/삭제</span>
                  </span>
                  <span className="text-[11px] text-slate-500">총 {historyItems.length}건</span>
                </h4>

                {/* Add New History Form */}
                <div className="p-4 bg-white rounded-xl border border-purple-200 space-y-3">
                  <span className="font-bold text-xs text-purple-900 block">새 연혁 연도 및 타이틀 추가</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      placeholder="연도 (예: 2023)"
                      value={newHistYear}
                      onChange={(e) => setNewHistYear(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-xs"
                    />
                    <input
                      type="text"
                      placeholder="월 (예: 05월)"
                      value={newHistMonth}
                      onChange={(e) => setNewHistMonth(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="연혁 제목"
                      value={newHistTitle}
                      onChange={(e) => setNewHistTitle(e.target.value)}
                      className="col-span-2 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="연혁 상세 내용 설명"
                    value={newHistDesc}
                    onChange={(e) => setNewHistDesc(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                  <button
                    onClick={async () => {
                      if (!newHistTitle.trim()) {
                        alert('연혁 제목을 입력해 주세요.');
                        return;
                      }
                      setIsTranslating(true);
                      let titleEn = '', titleCn = '';
                      let descEn = '', descCn = '';

                      try {
                        const transTitle = await autoTranslateText(newHistTitle, 'Company history title');
                        titleEn = transTitle.english;
                        titleCn = transTitle.chinese;

                        if (newHistDesc) {
                          const transDesc = await autoTranslateText(newHistDesc, 'Company history description');
                          descEn = transDesc.english;
                          descCn = transDesc.chinese;
                        }
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setIsTranslating(false);
                      }

                      addHistoryItem({
                        year: newHistYear,
                        month: newHistMonth,
                        title: newHistTitle,
                        titleEn: titleEn || newHistTitle,
                        titleCn: titleCn || newHistTitle,
                        description: newHistDesc,
                        descriptionEn: descEn || newHistDesc,
                        descriptionCn: descCn || newHistDesc,
                      });
                      alert('연혁이 성공적으로 등록되었으며 영문 및 중문 번역이 자동 추가되었습니다.');
                      setNewHistTitle('');
                      setNewHistDesc('');
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>연혁 등록 (✨ AI 번역 반영)</span>
                  </button>
                </div>

                {/* Existing History Items List */}
                <div className="space-y-2">
                  {historyItems.map((hist) => {
                    const isEditing = editingHistId === hist.id;
                    if (isEditing) {
                      return (
                        <div key={hist.id} className="p-3 bg-purple-50 rounded-xl border border-purple-300 space-y-2">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <input
                              type="text"
                              value={editingHistData.year ?? hist.year}
                              onChange={(e) => setEditingHistData((prev) => ({ ...prev, year: e.target.value }))}
                              className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-mono font-bold"
                            />
                            <input
                              type="text"
                              value={editingHistData.month ?? hist.month}
                              onChange={(e) => setEditingHistData((prev) => ({ ...prev, month: e.target.value }))}
                              className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs"
                            />
                            <input
                              type="text"
                              value={editingHistData.title ?? hist.title}
                              onChange={(e) => setEditingHistData((prev) => ({ ...prev, title: e.target.value }))}
                              className="col-span-2 px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-bold"
                            />
                          </div>
                          <input
                            type="text"
                            value={editingHistData.description ?? hist.description}
                            onChange={(e) => setEditingHistData((prev) => ({ ...prev, description: e.target.value }))}
                            className="w-full px-2.5 py-1 rounded-lg border border-slate-300 text-xs"
                          />
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => {
                                updateHistoryItem(hist.id, editingHistData);
                                setEditingHistId(null);
                                setEditingHistData({});
                              }}
                              className="px-3 py-1 bg-purple-600 text-white rounded-lg font-bold text-xs"
                            >
                              저장
                            </button>
                            <button
                              onClick={() => {
                                setEditingHistId(null);
                                setEditingHistData({});
                              }}
                              className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={hist.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-purple-700 text-xs">
                              {hist.year}.{hist.month}
                            </span>
                            <span className="font-bold text-slate-900 text-xs">{hist.title}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{hist.description}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              setEditingHistId(hist.id);
                              setEditingHistData({ ...hist });
                            }}
                            className="p-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteHistoryItem(hist.id)}
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Org Chart & Departments */}
          {activeTab === 'orgchart' && (
            <div className="space-y-6 max-w-4xl">
              {/* OrgChart Section Translations */}
              <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-700" />
                  <span>조직도 섹션 헤더 문구 ({cmsLang})</span>
                </h4>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">조직도 섹션 제목 ({cmsLang})</label>
                  <input
                    type="text"
                    value={getTrans('orgchart', 'title', '체계적인 조직 및 전문가 라인업')}
                    onChange={(e) => updateSectionTranslation(cmsLang, 'orgchart', 'title', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">조직도 섹션 설명 ({cmsLang})</label>
                  <input
                    type="text"
                    value={getTrans('orgchart', 'subtitle', '반도체 장비 메탈 부품 전문 제작을 위한 최적의 협업 구조')}
                    onChange={(e) => updateSectionTranslation(cmsLang, 'orgchart', 'subtitle', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              {/* 1. CEO Info Edit Section (대표이사 정보 수정) */}
              <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-purple-700" />
                    <span>조직도 - 대표이사 (CEO) 정보 수정</span>
                  </h4>
                  <button
                    onClick={async () => {
                      if (!orgCeo.name) return;
                      setIsTranslating(true);
                      try {
                        const titleTrans = await autoTranslateText(orgCeo.title, 'Job title CEO');
                        const nameTrans = await autoTranslateText(orgCeo.name, 'Person name');
                        const descTrans = orgCeo.description
                          ? await autoTranslateText(orgCeo.description, 'CEO management statement')
                          : { english: '', chinese: '' };
                        updateOrgCeo({
                          titleEn: titleTrans.english,
                          titleCn: titleTrans.chinese,
                          nameEn: nameTrans.english,
                          nameCn: nameTrans.chinese,
                          descriptionEn: descTrans.english || orgCeo.description,
                          descriptionCn: descTrans.chinese || orgCeo.description,
                        });
                        alert('✨ 대표이사 정보의 영문/중문 AI 자동번역이 완료되었습니다.');
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setIsTranslating(false);
                      }
                    }}
                    className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold text-[11px] rounded-xl flex items-center gap-1 shadow-sm cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>✨ AI 영/중문 자동번역</span>
                  </button>
                </div>

                <div className="p-4 bg-white rounded-xl border border-purple-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">직함 (KO)</label>
                      <input
                        type="text"
                        value={orgCeo.title}
                        onChange={(e) => updateOrgCeo({ title: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">직함 (EN)</label>
                      <input
                        type="text"
                        value={orgCeo.titleEn || ''}
                        onChange={(e) => updateOrgCeo({ titleEn: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">직함 (CN)</label>
                      <input
                        type="text"
                        value={orgCeo.titleCn || ''}
                        onChange={(e) => updateOrgCeo({ titleCn: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">성명 (KO)</label>
                      <input
                        type="text"
                        value={orgCeo.name}
                        onChange={(e) => updateOrgCeo({ name: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">성명 (EN)</label>
                      <input
                        type="text"
                        value={orgCeo.nameEn || ''}
                        onChange={(e) => updateOrgCeo({ nameEn: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">성명 (CN)</label>
                      <input
                        type="text"
                        value={orgCeo.nameCn || ''}
                        onChange={(e) => updateOrgCeo({ nameCn: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">경영 방침 / 설명 (KO)</label>
                      <textarea
                        rows={2}
                        value={orgCeo.description}
                        onChange={(e) => updateOrgCeo({ description: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">설명 (EN)</label>
                      <textarea
                        rows={2}
                        value={orgCeo.descriptionEn || ''}
                        onChange={(e) => updateOrgCeo({ descriptionEn: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">설명 (CN)</label>
                      <textarea
                        rows={2}
                        value={orgCeo.descriptionCn || ''}
                        onChange={(e) => updateOrgCeo({ descriptionCn: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Quality Control Info Edit Section (품질관리부 정보 수정) */}
              <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-700" />
                    <span>조직도 - 품질관리부 (Quality Control) 독립조직 정보 수정</span>
                  </h4>
                  <button
                    onClick={async () => {
                      if (!orgQuality.title) return;
                      setIsTranslating(true);
                      try {
                        const titleTrans = await autoTranslateText(orgQuality.title, 'Quality control division name');
                        const subTrans = orgQuality.subtitle
                          ? await autoTranslateText(orgQuality.subtitle, 'Quality control subtitle')
                          : { english: '', chinese: '' };
                        const descTrans = orgQuality.description
                          ? await autoTranslateText(orgQuality.description, 'Quality control mission statement')
                          : { english: '', chinese: '' };
                        updateOrgQuality({
                          titleEn: titleTrans.english,
                          titleCn: titleTrans.chinese,
                          subtitleEn: subTrans.english || orgQuality.subtitle,
                          subtitleCn: subTrans.chinese || orgQuality.subtitle,
                          descriptionEn: descTrans.english || orgQuality.description,
                          descriptionCn: descTrans.chinese || orgQuality.description,
                        });
                        alert('✨ 품질관리부 정보의 영문/중문 AI 자동번역이 완료되었습니다.');
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setIsTranslating(false);
                      }
                    }}
                    className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold text-[11px] rounded-xl flex items-center gap-1 shadow-sm cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>✨ AI 영/중문 자동번역</span>
                  </button>
                </div>

                <div className="p-4 bg-white rounded-xl border border-purple-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">조직명 (KO)</label>
                      <input
                        type="text"
                        value={orgQuality.title}
                        onChange={(e) => updateOrgQuality({ title: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">조직명 (EN)</label>
                      <input
                        type="text"
                        value={orgQuality.titleEn || ''}
                        onChange={(e) => updateOrgQuality({ titleEn: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">조직명 (CN)</label>
                      <input
                        type="text"
                        value={orgQuality.titleCn || ''}
                        onChange={(e) => updateOrgQuality({ titleCn: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">부제목 / 역할 (KO)</label>
                      <input
                        type="text"
                        value={orgQuality.subtitle}
                        onChange={(e) => updateOrgQuality({ subtitle: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">부제목 / 역할 (EN)</label>
                      <input
                        type="text"
                        value={orgQuality.subtitleEn || ''}
                        onChange={(e) => updateOrgQuality({ subtitleEn: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">부제목 / 역할 (CN)</label>
                      <input
                        type="text"
                        value={orgQuality.subtitleCn || ''}
                        onChange={(e) => updateOrgQuality({ subtitleCn: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">상세 설명 / 보증 체계 (KO)</label>
                      <textarea
                        rows={2}
                        value={orgQuality.description}
                        onChange={(e) => updateOrgQuality({ description: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">설명 (EN)</label>
                      <textarea
                        rows={2}
                        value={orgQuality.descriptionEn || ''}
                        onChange={(e) => updateOrgQuality({ descriptionEn: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">설명 (CN)</label>
                      <textarea
                        rows={2}
                        value={orgQuality.descriptionCn || ''}
                        onChange={(e) => updateOrgQuality({ descriptionCn: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Department Manager */}
              <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-700" />
                    <span>핵심 부서 (Operating Departments) 추가 / 수정 / 삭제</span>
                  </span>
                  <span className="text-[11px] text-slate-500">총 {departments.length}개 부서</span>
                </h4>

                {/* Add New Department Form */}
                <div className="p-4 bg-white rounded-xl border border-purple-200 space-y-3">
                  <span className="font-bold text-xs text-purple-900 block">신규 부서 추가</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="부서 한글명 (예: 품질관리부)"
                      value={newDeptName}
                      onChange={(e) => setNewDeptName(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-300 font-bold text-xs"
                    />
                    <input
                      type="text"
                      placeholder="부서 영문명 (예: Quality Control)"
                      value={newDeptEngName}
                      onChange={(e) => setNewDeptEngName(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                    />
                    <input
                      type="text"
                      placeholder="부서 중문명 (예: 质量管理部)"
                      value={newDeptCnName}
                      onChange={(e) => setNewDeptCnName(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 font-semibold mb-1">
                      부서 주요 업무 (쉼표 구분)
                    </label>
                    <input
                      type="text"
                      placeholder="업무1, 업무2, 업무3"
                      value={newDeptDuties}
                      onChange={(e) => setNewDeptDuties(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <button
                    onClick={async () => {
                      if (!newDeptName.trim()) {
                        alert('부서명을 입력해주세요.');
                        return;
                      }
                      setIsTranslating(true);
                      let engName = newDeptEngName;
                      let cnName = newDeptCnName;
                      let dutiesEn: string[] = [];
                      let dutiesCn: string[] = [];

                      try {
                        if (!engName || !cnName) {
                          const transName = await autoTranslateText(newDeptName, 'Department name');
                          engName = engName || transName.english;
                          cnName = cnName || transName.chinese;
                        }

                        if (newDeptDuties) {
                          const transDuties = await autoTranslateText(newDeptDuties, 'Department duties');
                          dutiesEn = transDuties.english.split(',').map((s) => s.trim());
                          dutiesCn = transDuties.chinese.split(',').map((s) => s.trim());
                        }
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setIsTranslating(false);
                      }

                      addDepartment({
                        name: newDeptName,
                        engName: engName || newDeptName,
                        cnName: cnName || newDeptName,
                        iconName: newDeptIcon,
                        duties: newDeptDuties
                          ? newDeptDuties.split(',').map((s) => s.trim())
                          : ['업무 수행'],
                        dutiesEn: dutiesEn.length > 0 ? dutiesEn : ['Department Duties'],
                        dutiesCn: dutiesCn.length > 0 ? dutiesCn : ['部门职责'],
                      });
                      alert('부서가 등록되었으며 영문 및 중문 번역이 자동 반영되었습니다.');
                      setNewDeptName('');
                      setNewDeptEngName('');
                      setNewDeptCnName('');
                      setNewDeptDuties('');
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>부서 등록 (✨ AI 번역 반영)</span>
                  </button>
                </div>

                {/* Departments List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {departments.map((dept) => {
                    const isEditing = editingDeptId === dept.id;
                    if (isEditing) {
                      return (
                        <div key={dept.id} className="p-4 bg-purple-50 rounded-2xl border-2 border-purple-400 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <input
                              type="text"
                              value={editingDeptData.name ?? dept.name}
                              onChange={(e) => setEditingDeptData((prev) => ({ ...prev, name: e.target.value }))}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold"
                            />
                            <input
                              type="text"
                              value={editingDeptData.engName ?? dept.engName}
                              onChange={(e) => setEditingDeptData((prev) => ({ ...prev, engName: e.target.value }))}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                            />
                            <input
                              type="text"
                              value={editingDeptData.cnName ?? dept.cnName ?? ''}
                              onChange={(e) => setEditingDeptData((prev) => ({ ...prev, cnName: e.target.value }))}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-500">주요 업무 (쉼표 구분)</label>
                            <input
                              type="text"
                              value={
                                editingDeptData.duties
                                  ? editingDeptData.duties.join(', ')
                                  : dept.duties.join(', ')
                              }
                              onChange={(e) =>
                                setEditingDeptData((prev) => ({
                                  ...prev,
                                  duties: e.target.value.split(',').map((s) => s.trim()),
                                }))
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                            />
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => {
                                updateDepartment(dept.id, editingDeptData);
                                setEditingDeptId(null);
                                setEditingDeptData({});
                              }}
                              className="px-3.5 py-1.5 bg-purple-600 text-white rounded-xl font-bold text-xs shadow-sm"
                            >
                              저장
                            </button>
                            <button
                              onClick={() => {
                                setEditingDeptId(null);
                                setEditingDeptData({});
                              }}
                              className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={dept.id} className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-bold text-slate-900 text-sm">{dept.name}</h5>
                              <span className="text-[10px] text-purple-700 font-mono block">{dept.engName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setEditingDeptId(dept.id);
                                  setEditingDeptData({ ...dept });
                                }}
                                className="p-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => deleteDepartment(dept.id)}
                                className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <ul className="mt-2 space-y-1 pl-1">
                            {dept.duties.map((duty, idx) => (
                              <li key={idx} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-purple-500" />
                                <span>{duty}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Equipment Status */}
          {activeTab === 'equipment' && (
            <div className="space-y-6 max-w-4xl">
              {/* Equipment Section Translations */}
              <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-700" />
                  <span>설비현황 섹션 타이틀 문구 ({cmsLang})</span>
                </h4>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">설비현황 타이틀 ({cmsLang})</label>
                  <input
                    type="text"
                    value={getTrans('equipment', 'title', '최첨단 정밀가공 및 측정 설비 현황')}
                    onChange={(e) => updateSectionTranslation(cmsLang, 'equipment', 'title', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold"
                  />
                </div>
              </div>

              {/* Add New Equipment Form */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-purple-700" />
                  <span>신규 보유 설비 추가</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="설비명 (예: DOOSAN 5-AXIS MCT)"
                    value={newEqName}
                    onChange={(e) => setNewEqName(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 font-bold"
                  />
                  <input
                    type="text"
                    placeholder="모델명 (예: DHF 8000)"
                    value={newEqModel}
                    onChange={(e) => setNewEqModel(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 font-mono"
                  />
                  <input
                    type="text"
                    placeholder="제조사 (예: DN솔루션즈)"
                    value={newEqMaker}
                    onChange={(e) => setNewEqMaker(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-300"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="가공 범주/사양 (예: 800 x 800 x 750 mm)"
                    value={newEqWorkingArea}
                    onChange={(e) => setNewEqWorkingArea(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 font-mono"
                  />
                  <input
                    type="number"
                    min={1}
                    placeholder="수량"
                    value={newEqQty}
                    onChange={(e) => setNewEqQty(Number(e.target.value))}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 font-mono font-bold"
                  />
                  <select
                    value={newEqCat}
                    onChange={(e: any) => setNewEqCat(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 font-bold"
                  >
                    <option value="mct">MCT 머시닝센터</option>
                    <option value="cnc">CNC 선반</option>
                    <option value="cmm">CMM / 정밀 측정</option>
                    <option value="cleanroom">클린룸 / 부대 설비</option>
                  </select>
                </div>

                {/* New Equipment Image Upload */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                  <label className="block font-semibold text-slate-700">설비 사진 파일 업로드</label>
                  <div className="flex items-center gap-3">
                    <label className="px-3.5 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs cursor-pointer border border-purple-300 flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-purple-700" />
                      <span>PC에서 사진 업로드</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleFileUpload(e.target.files[0], (dataUrl) => {
                              setNewEqImageUrl(dataUrl);
                            });
                          }
                        }}
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="또는 이미지 URL"
                      value={newEqImageUrl}
                      onChange={(e) => setNewEqImageUrl(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-xs"
                    />
                  </div>
                </div>

                <button
                  onClick={async () => {
                    if (!newEqName.trim()) {
                      alert('설비명을 입력해주세요.');
                      return;
                    }
                    setIsTranslating(true);
                    let nameEn = '', nameCn = '';
                    let specEn = '', specCn = '';

                    try {
                      const transName = await autoTranslateText(newEqName, 'Equipment name');
                      nameEn = transName.english;
                      nameCn = transName.chinese;

                      if (newEqWorkingArea) {
                        const transSpec = await autoTranslateText(newEqWorkingArea, 'Equipment specification');
                        specEn = transSpec.english;
                        specCn = transSpec.chinese;
                      }
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setIsTranslating(false);
                    }

                    addEquipment({
                      name: newEqName,
                      nameEn: nameEn || newEqName,
                      nameCn: nameCn || newEqName,
                      model: newEqModel,
                      maker: newEqMaker,
                      spec: newEqWorkingArea,
                      specEn: specEn || newEqWorkingArea,
                      specCn: specCn || newEqWorkingArea,
                      workingArea: newEqWorkingArea,
                      precision: '±0.001 mm',
                      quantity: newEqQty,
                      category: newEqCat,
                      imageUrl:
                        newEqImageUrl ||
                        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
                    });
                    alert('설비가 등록되었으며 영문 및 중문 번역이 자동 반영되었습니다.');
                    setNewEqName('');
                    setNewEqModel('');
                    setNewEqMaker('');
                    setNewEqWorkingArea('');
                    setNewEqImageUrl('');
                  }}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>설비 인벤토리 등록 (✨ AI 영/중문 번역)</span>
                </button>
              </div>

              {/* Equipment Inventory List */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">보유 설비 목록 ({equipments.length})</h4>
                {equipments.map((eq) => {
                  const isEditing = editingEqId === eq.id;
                  if (isEditing) {
                    return (
                      <div key={eq.id} className="p-4 bg-purple-50 rounded-2xl border-2 border-purple-400 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                          <input
                            type="text"
                            placeholder="설비명"
                            value={editingEqData.name ?? eq.name}
                            onChange={(e) => setEditingEqData((prev) => ({ ...prev, name: e.target.value }))}
                            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-xs"
                          />
                          <input
                            type="text"
                            placeholder="모델명"
                            value={editingEqData.model ?? eq.model}
                            onChange={(e) => setEditingEqData((prev) => ({ ...prev, model: e.target.value }))}
                            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                          />
                          <input
                            type="text"
                            placeholder="제조사"
                            value={editingEqData.maker ?? eq.maker}
                            onChange={(e) => setEditingEqData((prev) => ({ ...prev, maker: e.target.value }))}
                            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                          />
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap">보유대수:</span>
                              <input
                                type="number"
                                min={1}
                                value={editingEqData.quantity ?? eq.quantity}
                                onChange={(e) => setEditingEqData((prev) => ({ ...prev, quantity: Number(e.target.value) }))}
                                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-xs text-purple-700"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="가공사양 (예: 800 x 800 x 750 mm)"
                            value={editingEqData.workingArea ?? eq.workingArea}
                            onChange={(e) => setEditingEqData((prev) => ({ ...prev, workingArea: e.target.value }))}
                            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                          />
                          <select
                            value={editingEqData.category ?? eq.category}
                            onChange={(e: any) => setEditingEqData((prev) => ({ ...prev, category: e.target.value }))}
                            className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-xs"
                          >
                            <option value="mct">MCT 머시닝센터</option>
                            <option value="cnc">CNC 선반</option>
                            <option value="cmm">CMM / 정밀 측정</option>
                            <option value="cleanroom">클린룸 / 부대 설비</option>
                          </select>
                        </div>

                        {/* Image Change */}
                        <div className="p-3 bg-white rounded-xl border border-purple-200 flex items-center gap-3">
                          <img
                            src={editingEqData.imageUrl ?? eq.imageUrl}
                            alt={eq.name}
                            className="w-16 h-12 object-contain bg-slate-50 border rounded-lg shrink-0"
                          />
                          <label className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs rounded-xl cursor-pointer">
                            <span>사진 파일 변경</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleFileUpload(e.target.files[0], (dataUrl) => {
                                    setEditingEqData((prev) => ({ ...prev, imageUrl: dataUrl }));
                                  });
                                }
                              }}
                            />
                          </label>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              updateEquipment(eq.id, editingEqData);
                              setEditingEqId(null);
                              setEditingEqData({});
                            }}
                            className="px-4 py-1.5 bg-purple-600 text-white rounded-xl font-bold text-xs"
                          >
                            저장
                          </button>
                          <button
                            onClick={() => {
                              setEditingEqId(null);
                              setEditingEqData({});
                            }}
                            className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={eq.id} className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={eq.imageUrl}
                          alt={eq.name}
                          className="w-16 h-14 object-contain bg-slate-50 p-1 rounded-xl border shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-sm">{eq.name}</span>
                            <span className="text-purple-700 font-mono text-xs">({eq.model})</span>
                            <div className="flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200">
                              <button
                                type="button"
                                title="1대 감소"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateEquipment(eq.id, { quantity: Math.max(1, (eq.quantity || 1) - 1) });
                                }}
                                className="w-4 h-4 flex items-center justify-center rounded bg-white hover:bg-purple-200 text-purple-800 font-extrabold text-[11px] border border-purple-200 cursor-pointer"
                              >
                                -
                              </button>
                              <span className="font-mono font-bold text-purple-950 text-xs px-1">
                                {eq.quantity || 1}대
                              </span>
                              <button
                                type="button"
                                title="1대 증가"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateEquipment(eq.id, { quantity: (eq.quantity || 1) + 1 });
                                }}
                                className="w-4 h-4 flex items-center justify-center rounded bg-white hover:bg-purple-200 text-purple-800 font-extrabold text-[11px] border border-purple-200 cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            제조사: {eq.maker} | 사양: {eq.workingArea}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingEqId(eq.id);
                            setEditingEqData({ ...eq });
                          }}
                          className="p-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteEquipment(eq.id)}
                          className="p-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: Products Catalog & Categories */}
          {activeTab === 'products' && (
            <div className="space-y-6 max-w-4xl">
              {/* Products Section Translations */}
              <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-700" />
                  <span>제품안내 섹션 헤더 문구 ({cmsLang})</span>
                </h4>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">제품안내 타이틀 ({cmsLang})</label>
                  <input
                    type="text"
                    value={getTrans('products', 'title', '초정밀 반도체 핵심 메탈 부품 카탈로그')}
                    onChange={(e) => updateSectionTranslation(cmsLang, 'products', 'title', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold"
                  />
                </div>
              </div>

              {/* 1. Category Management Section (제품 카테고리 추가/수정/삭제) */}
              <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-purple-700" />
                    <span>제품 카테고리 관리 (추가 / 수정 / 삭제)</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">총 {productCategories.length}개 카테고리</span>
                </div>

                {/* Add New Category Form */}
                <div className="p-4 bg-white rounded-xl border border-purple-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-purple-900 block">신규 카테고리 추가</span>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!newCatName.trim()) return;
                        setIsTranslating(true);
                        try {
                          const trans = await autoTranslateText(newCatName, 'Product category name');
                          setNewCatNameEn(trans.english);
                          setNewCatNameCn(trans.chinese);
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setIsTranslating(false);
                        }
                      }}
                      className="px-2.5 py-1 bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold text-[10px] rounded-lg flex items-center gap-1 shadow-sm cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>✨ 영문/중문 자동입력</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="카테고리명 (KO, 예: 챔버 부품)"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-300 font-bold text-xs"
                    />
                    <input
                      type="text"
                      placeholder="카테고리명 (EN, 예: Chamber Parts)"
                      value={newCatNameEn}
                      onChange={(e) => setNewCatNameEn(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                    />
                    <input
                      type="text"
                      placeholder="카테고리명 (CN, 예: 腔体零部件)"
                      value={newCatNameCn}
                      onChange={(e) => setNewCatNameCn(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      if (!newCatName.trim()) {
                        alert('카테고리 이름을 입력해 주세요.');
                        return;
                      }

                      let nameEn = newCatNameEn;
                      let nameCn = newCatNameCn;

                      if (!nameEn || !nameCn) {
                        setIsTranslating(true);
                        try {
                          const trans = await autoTranslateText(newCatName, 'Product category name');
                          nameEn = nameEn || trans.english;
                          nameCn = nameCn || trans.chinese;
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setIsTranslating(false);
                        }
                      }

                      const generatedId =
                        'cat_' +
                        Date.now().toString(36) +
                        '_' +
                        Math.random().toString(36).substring(2, 6);

                      addProductCategory({
                        id: generatedId,
                        name: newCatName.trim(),
                        nameEn: nameEn || newCatName.trim(),
                        nameCn: nameCn || newCatName.trim(),
                      });

                      setNewCatName('');
                      setNewCatNameEn('');
                      setNewCatNameCn('');
                      alert('카테고리가 성공적으로 추가되었습니다.');
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>카테고리 등록</span>
                  </button>
                </div>

                {/* Categories List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {productCategories.map((cat) => {
                    const isEditing = editingCatId === cat.id;

                    if (isEditing) {
                      return (
                        <div key={cat.id} className="p-3 bg-purple-50 rounded-xl border border-purple-300 space-y-2">
                          <input
                            type="text"
                            placeholder="카테고리명 (한글)"
                            value={editingCatData.name ?? cat.name}
                            onChange={(e) => setEditingCatData((prev) => ({ ...prev, name: e.target.value }))}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold text-xs"
                          />
                          <div className="grid grid-cols-2 gap-1.5">
                            <input
                              type="text"
                              placeholder="English"
                              value={editingCatData.nameEn ?? cat.nameEn ?? ''}
                              onChange={(e) => setEditingCatData((prev) => ({ ...prev, nameEn: e.target.value }))}
                              className="px-2 py-1 rounded-lg border border-slate-300 text-xs font-mono"
                            />
                            <input
                              type="text"
                              placeholder="中文"
                              value={editingCatData.nameCn ?? cat.nameCn ?? ''}
                              onChange={(e) => setEditingCatData((prev) => ({ ...prev, nameCn: e.target.value }))}
                              className="px-2 py-1 rounded-lg border border-slate-300 text-xs"
                            />
                          </div>
                          <div className="flex items-center gap-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                updateProductCategory(cat.id, editingCatData);
                                setEditingCatId(null);
                                setEditingCatData({});
                              }}
                              className="px-3 py-1 bg-purple-600 text-white font-bold text-xs rounded-lg cursor-pointer"
                            >
                              저장
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCatId(null);
                                setEditingCatData({});
                              }}
                              className="px-3 py-1 bg-slate-200 text-slate-700 text-xs rounded-lg cursor-pointer"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={cat.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2 shadow-xs">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0" />
                            <span className="font-bold text-slate-900 text-xs truncate">{cat.name}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono pl-3.5 truncate">
                            EN: {cat.nameEn || '-'} | CN: {cat.nameCn || '-'}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCatId(cat.id);
                              setEditingCatData({ ...cat });
                            }}
                            className="p-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 cursor-pointer"
                            title="카테고리 수정"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (productCategories.length <= 1) {
                                showToast('⚠️ 최소 1개 이상의 카테고리가 유지되어야 합니다.');
                                return;
                              }
                              deleteProductCategory(cat.id);
                              showToast(`'${cat.name}' 카테고리가 삭제되었습니다.`);
                            }}
                            className="p-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 cursor-pointer"
                            title="카테고리 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Add Product Form (제품명, P/N, MAKER 등록, 설명 제거) */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-purple-700" />
                    <span>신규 정밀 가공 제품 등록</span>
                  </h4>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!newProdTitle.trim()) return;
                      setIsTranslating(true);
                      try {
                        const transTitle = await autoTranslateText(newProdTitle, 'Precision CNC machined part title');
                        setNewProdTitleEn(transTitle.english);
                        setNewProdTitleCn(transTitle.chinese);

                        if (newProdPN.trim()) {
                          setNewProdPNEn(newProdPN.trim());
                          setNewProdPNCn(newProdPN.trim());
                        }

                        if (newProdMaker.trim()) {
                          const transMaker = await autoTranslateText(newProdMaker, 'Semiconductor equipment maker company');
                          setNewProdMakerEn(transMaker.english || newProdMaker);
                          setNewProdMakerCn(transMaker.chinese || newProdMaker);
                        }
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setIsTranslating(false);
                      }
                    }}
                    className="px-2.5 py-1 bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold text-[10px] rounded-lg flex items-center gap-1 shadow-sm cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>✨ 영문/중문 자동입력</span>
                  </button>
                </div>

                {/* Row 1: Product Name (KO, EN, CN) */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 text-xs">제품명 (Product Name) *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="제품명 (KO, 예: Chamber out liner)"
                      value={newProdTitle}
                      onChange={(e) => setNewProdTitle(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs"
                    />
                    <input
                      type="text"
                      placeholder="제품명 (EN, 예: Chamber out liner)"
                      value={newProdTitleEn}
                      onChange={(e) => setNewProdTitleEn(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-xs"
                    />
                    <input
                      type="text"
                      placeholder="제품명 (CN, 예: 摆阀阀板)"
                      value={newProdTitleCn}
                      onChange={(e) => setNewProdTitleCn(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                {/* Row 2: P/N (KO, EN, CN) */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 text-xs">P/N (Part Number)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="P/N (KO/공통, 예: 0020-34694)"
                      value={newProdPN}
                      onChange={(e) => setNewProdPN(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-xs font-semibold"
                    />
                    <input
                      type="text"
                      placeholder="P/N (EN, 예: 0020-34694)"
                      value={newProdPNEn}
                      onChange={(e) => setNewProdPNEn(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-xs"
                    />
                    <input
                      type="text"
                      placeholder="P/N (CN, 예: 0020-34694)"
                      value={newProdPNCn}
                      onChange={(e) => setNewProdPNCn(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Row 3: MAKER (KO, EN, CN) */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 text-xs">MAKER (제조사 / 적용 설비사)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="MAKER (KO, 예: Applied Materials)"
                      value={newProdMaker}
                      onChange={(e) => setNewProdMaker(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold"
                    />
                    <input
                      type="text"
                      placeholder="MAKER (EN, 예: Applied Materials)"
                      value={newProdMakerEn}
                      onChange={(e) => setNewProdMakerEn(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="MAKER (CN, 예: 应用材料)"
                      value={newProdMakerCn}
                      onChange={(e) => setNewProdMakerCn(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                {/* Row 4: Category Selection */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 text-xs">부품 카테고리</label>
                  <select
                    value={newProdCat}
                    onChange={(e: any) => setNewProdCat(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs"
                  >
                    {productCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.nameEn || cat.id})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product Image Upload */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-semibold text-slate-700 text-xs">제품 대표 이미지 파일 업로드</label>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>BAEKSONG ENG 워터마크 자동 합성</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="px-3.5 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs cursor-pointer border border-purple-300 flex items-center gap-1.5 shrink-0">
                      <Upload className="w-4 h-4 text-purple-700" />
                      <span>PC에서 이미지 선택</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleFileUpload(
                              e.target.files[0],
                              (dataUrl) => {
                                setNewProdImageUrl(dataUrl);
                              },
                              { watermark: true }
                            );
                          }
                        }}
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="또는 이미지 URL (https://...)"
                      value={newProdImageUrl}
                      onChange={(e) => setNewProdImageUrl(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-xs"
                    />
                  </div>
                  {newProdImageUrl && (
                    <div className="pt-2 flex items-center gap-3">
                      <div className="relative w-16 h-16 rounded-lg border border-slate-200 overflow-hidden bg-white flex items-center justify-center p-1 shrink-0">
                        <img src={newProdImageUrl} alt="preview" className="w-full h-full object-contain" />
                        <ProductWatermarkOverlay opacity={0.35} size="sm" />
                      </div>
                      <span className="text-[11px] text-slate-500">
                        업로드된 이미지에 BAEKSONG ENG 정품 워터마크가 안전하게 포함되었습니다.
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    if (!newProdTitle.trim()) {
                      alert('제품명을 입력해주세요.');
                      return;
                    }
                    setIsTranslating(true);
                    let titleEn = newProdTitleEn, titleCn = newProdTitleCn;
                    let pnVal = newProdPN.trim();
                    let pnEn = (newProdPNEn || newProdPN).trim();
                    let pnCn = (newProdPNCn || newProdPN).trim();
                    let makerEn = newProdMakerEn || newProdMaker;
                    let makerCn = newProdMakerCn || newProdMaker;

                    try {
                      if (!titleEn || !titleCn) {
                        const transTitle = await autoTranslateText(newProdTitle, 'Precision CNC machined part title');
                        titleEn = titleEn || transTitle.english;
                        titleCn = titleCn || transTitle.chinese;
                      }

                      if (newProdMaker && (!newProdMakerEn || !newProdMakerCn)) {
                        const transMaker = await autoTranslateText(newProdMaker, 'Semiconductor equipment maker company');
                        makerEn = makerEn || transMaker.english;
                        makerCn = makerCn || transMaker.chinese;
                      }
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setIsTranslating(false);
                    }

                    const selectedCategoryObj = productCategories.find((c) => c.id === newProdCat);

                    addProduct({
                      title: newProdTitle.trim(),
                      titleEn: titleEn || newProdTitle.trim(),
                      titleCn: titleCn || newProdTitle.trim(),
                      pn: pnVal || undefined,
                      pnEn: pnEn || undefined,
                      pnCn: pnCn || undefined,
                      pl: pnVal || undefined,
                      plEn: pnEn || undefined,
                      plCn: pnCn || undefined,
                      maker: newProdMaker.trim() || undefined,
                      makerEn: makerEn.trim() || undefined,
                      makerCn: makerCn.trim() || undefined,
                      category: newProdCat,
                      categoryName: selectedCategoryObj?.name || newProdCat.toUpperCase(),
                      imageUrl:
                        newProdImageUrl ||
                        'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
                      featured: true,
                    });
                    alert('제품이 등록되었으며 영문 및 중문 정보가 저장되었습니다.');
                    setNewProdTitle('');
                    setNewProdTitleEn('');
                    setNewProdTitleCn('');
                    setNewProdPN('');
                    setNewProdPNEn('');
                    setNewProdPNCn('');
                    setNewProdMaker('');
                    setNewProdMakerEn('');
                    setNewProdMakerCn('');
                    setNewProdImageUrl('');
                  }}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>제품 등록 완료</span>
                </button>
              </div>

              {/* 3. Products Catalog List (제품명, P/N, MAKER 관리) */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 text-sm">등록된 가공 제품 목록 ({products.length})</h4>
                <div className="space-y-3">
                  {products.map((prod) => {
                    const isEditing = editingProductId === prod.id;

                    if (isEditing && editingProductForm) {
                      return (
                        <div
                          key={prod.id}
                          className="p-5 bg-purple-50/80 rounded-2xl border-2 border-purple-400 shadow-md space-y-4 animate-fade-in"
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-purple-200">
                            <span className="font-extrabold text-xs text-purple-900 flex items-center gap-1.5">
                              <Edit3 className="w-4 h-4 text-purple-700" />
                              <span>제품 정보 수정 (ID: {prod.id})</span>
                            </span>
                            <button
                              type="button"
                              onClick={async () => {
                                setIsTranslating(true);
                                try {
                                  const titleTrans = await autoTranslateText(editingProductForm.title, 'Precision CNC machined part title');
                                  let makerTrans = { english: editingProductForm.maker || '', chinese: editingProductForm.maker || '' };
                                  if (editingProductForm.maker) {
                                    makerTrans = await autoTranslateText(editingProductForm.maker, 'Semiconductor equipment maker company');
                                  }

                                  const curPN = editingProductForm.pn || editingProductForm.pl || '';
                                  const curPNEn = editingProductForm.pnEn || editingProductForm.plEn || curPN;
                                  const curPNCn = editingProductForm.pnCn || editingProductForm.plCn || curPN;

                                  setEditingProductForm({
                                    ...editingProductForm,
                                    titleEn: titleTrans.english,
                                    titleCn: titleTrans.chinese,
                                    pn: curPN,
                                    pnEn: curPNEn,
                                    pnCn: curPNCn,
                                    pl: curPN,
                                    plEn: curPNEn,
                                    plCn: curPNCn,
                                    makerEn: makerTrans.english || editingProductForm.maker,
                                    makerCn: makerTrans.chinese || editingProductForm.maker,
                                  });
                                  alert('✨ 제품명 및 MAKER 영문/중문 자동 번역이 적용되었습니다.');
                                } catch (err) {
                                  console.error(err);
                                  alert('번역 중 오류가 발생했습니다.');
                                } finally {
                                  setIsTranslating(false);
                                }
                              }}
                              disabled={isTranslating}
                              className="px-3 py-1 bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold text-[11px] rounded-lg flex items-center gap-1 shadow-sm cursor-pointer disabled:opacity-50"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-slate-900" />
                              <span>✨ AI 번역 동기화</span>
                            </button>
                          </div>

                          {/* Form Grid */}
                          <div className="space-y-3 text-xs">
                            {/* Product Name (KO, EN, CN) */}
                            <div>
                              <label className="block font-bold text-slate-700 mb-1">제품명 (Product Name)</label>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <input
                                  type="text"
                                  placeholder="제품명 (한글)"
                                  value={editingProductForm.title}
                                  onChange={(e) => setEditingProductForm({ ...editingProductForm, title: e.target.value })}
                                  className="px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold"
                                />
                                <input
                                  type="text"
                                  placeholder="English"
                                  value={editingProductForm.titleEn || ''}
                                  onChange={(e) => setEditingProductForm({ ...editingProductForm, titleEn: e.target.value })}
                                  className="px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono"
                                />
                                <input
                                  type="text"
                                  placeholder="中文"
                                  value={editingProductForm.titleCn || ''}
                                  onChange={(e) => setEditingProductForm({ ...editingProductForm, titleCn: e.target.value })}
                                  className="px-3 py-2 rounded-xl bg-white border border-slate-300"
                                />
                              </div>
                            </div>

                            {/* P/N (KO, EN, CN) */}
                            <div>
                              <label className="block font-bold text-slate-700 mb-1">P/N (Part Number)</label>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <input
                                  type="text"
                                  placeholder="P/N (한글/공통)"
                                  value={editingProductForm.pn || editingProductForm.pl || ''}
                                  onChange={(e) =>
                                    setEditingProductForm({
                                      ...editingProductForm,
                                      pn: e.target.value,
                                      pl: e.target.value,
                                    })
                                  }
                                  className="px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono font-semibold"
                                />
                                <input
                                  type="text"
                                  placeholder="P/N (English)"
                                  value={editingProductForm.pnEn || editingProductForm.plEn || ''}
                                  onChange={(e) =>
                                    setEditingProductForm({
                                      ...editingProductForm,
                                      pnEn: e.target.value,
                                      plEn: e.target.value,
                                    })
                                  }
                                  className="px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono"
                                />
                                <input
                                  type="text"
                                  placeholder="P/N (中文)"
                                  value={editingProductForm.pnCn || editingProductForm.plCn || ''}
                                  onChange={(e) =>
                                    setEditingProductForm({
                                      ...editingProductForm,
                                      pnCn: e.target.value,
                                      plCn: e.target.value,
                                    })
                                  }
                                  className="px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono"
                                />
                              </div>
                            </div>

                            {/* MAKER (KO, EN, CN) */}
                            <div>
                              <label className="block font-bold text-slate-700 mb-1">MAKER (제조사 / 적용 설비사)</label>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <input
                                  type="text"
                                  placeholder="MAKER (한글)"
                                  value={editingProductForm.maker || ''}
                                  onChange={(e) => setEditingProductForm({ ...editingProductForm, maker: e.target.value })}
                                  className="px-3 py-2 rounded-xl bg-white border border-slate-300 font-semibold"
                                />
                                <input
                                  type="text"
                                  placeholder="MAKER (English)"
                                  value={editingProductForm.makerEn || ''}
                                  onChange={(e) => setEditingProductForm({ ...editingProductForm, makerEn: e.target.value })}
                                  className="px-3 py-2 rounded-xl bg-white border border-slate-300"
                                />
                                <input
                                  type="text"
                                  placeholder="MAKER (中文)"
                                  value={editingProductForm.makerCn || ''}
                                  onChange={(e) => setEditingProductForm({ ...editingProductForm, makerCn: e.target.value })}
                                  className="px-3 py-2 rounded-xl bg-white border border-slate-300"
                                />
                              </div>
                            </div>

                            {/* Category Selection */}
                            <div>
                              <label className="block font-bold text-slate-700 mb-1">카테고리</label>
                              <select
                                value={editingProductForm.category}
                                onChange={(e) => {
                                  const catObj = productCategories.find((c) => c.id === e.target.value);
                                  setEditingProductForm({
                                    ...editingProductForm,
                                    category: e.target.value,
                                    categoryName: catObj?.name || e.target.value.toUpperCase(),
                                  });
                                }}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold"
                              >
                                {productCategories.map((cat) => (
                                  <option key={cat.id} value={cat.id}>
                                    {cat.name} ({cat.nameEn || cat.id})
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Image URL & Upload */}
                          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <label className="block font-semibold text-slate-700">제품 이미지</label>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                <span>워터마크 자동 합성</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-12 rounded-lg border border-slate-200 overflow-hidden bg-white flex items-center justify-center p-0.5 shrink-0">
                                <img
                                  src={editingProductForm.imageUrl}
                                  alt="preview"
                                  className="w-full h-full object-contain"
                                />
                                <ProductWatermarkOverlay opacity={0.35} size="sm" />
                              </div>
                              <label className="px-3 py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-[11px] cursor-pointer border border-purple-300 flex items-center gap-1 shrink-0">
                                <Upload className="w-3.5 h-3.5 text-purple-700" />
                                <span>이미지 교체</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                      handleFileUpload(
                                        e.target.files[0],
                                        (dataUrl) => {
                                          setEditingProductForm({ ...editingProductForm, imageUrl: dataUrl });
                                        },
                                        { watermark: true }
                                      );
                                    }
                                  }}
                                />
                              </label>
                              <input
                                type="text"
                                value={editingProductForm.imageUrl}
                                onChange={(e) => setEditingProductForm({ ...editingProductForm, imageUrl: e.target.value })}
                                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-xs"
                              />
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-purple-200">
                            <button
                              type="button"
                              onClick={() => {
                                setNewProdPN('');
                                setEditingProductId(null);
                                setEditingProductForm(null);
                              }}
                              className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                            >
                              취소
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (!editingProductForm.title.trim()) {
                                  alert('제품명을 입력해 주세요.');
                                  return;
                                }

                                let updatedProd = { ...editingProductForm };
                                const effectivePN = updatedProd.pn || updatedProd.pl || '';
                                const effectivePNEn = updatedProd.pnEn || updatedProd.plEn || effectivePN;
                                const effectivePNCn = updatedProd.pnCn || updatedProd.plCn || effectivePN;

                                updatedProd.pn = effectivePN;
                                updatedProd.pnEn = effectivePNEn;
                                updatedProd.pnCn = effectivePNCn;
                                updatedProd.pl = effectivePN;
                                updatedProd.plEn = effectivePNEn;
                                updatedProd.plCn = effectivePNCn;

                                if (!updatedProd.titleEn || !updatedProd.titleCn) {
                                  setIsTranslating(true);
                                  try {
                                    const titleTrans = await autoTranslateText(updatedProd.title, 'Precision CNC machined part title');
                                    updatedProd.titleEn = updatedProd.titleEn || titleTrans.english;
                                    updatedProd.titleCn = updatedProd.titleCn || titleTrans.chinese;
                                  } catch (err) {
                                    console.error(err);
                                  } finally {
                                    setIsTranslating(false);
                                  }
                                }

                                updateProduct(updatedProd.id, updatedProd);
                                alert('제품 정보가 성공적으로 수정되었습니다.');
                                setEditingProductId(null);
                                setEditingProductForm(null);
                              }}
                              className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Check className="w-4 h-4" />
                              <span>수정사항 저장</span>
                            </button>
                          </div>
                        </div>
                      );
                    }

                    const categoryName =
                      productCategories.find((c) => c.id === prod.category)?.name || prod.category;
                    const prodPN = prod.pn || prod.pl;

                    return (
                      <div key={prod.id} className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between gap-3 hover:border-purple-300 transition-colors shadow-sm">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative w-14 h-14 bg-white p-1 rounded-xl border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                            <img
                              src={prod.imageUrl}
                              alt={prod.title}
                              className="w-full h-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                            <ProductWatermarkOverlay opacity={0.35} size="sm" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-bold text-slate-900 text-xs">{prod.title}</h5>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200">
                                {categoryName}
                              </span>
                            </div>

                            {/* P/N & MAKER info */}
                            <div className="flex items-center gap-3 mt-1 text-[11px] flex-wrap">
                              {prodPN && (
                                <span className="text-slate-600 flex items-center gap-1">
                                  <strong className="text-slate-500 font-bold font-mono text-[10px]">P/N: </strong>
                                  <span className="font-pn font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md text-xs">{prodPN}</span>
                                </span>
                              )}
                              {prod.maker && (
                                <span className="text-slate-600">
                                  <strong className="text-slate-400 font-medium">MAKER: </strong>
                                  <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{prod.maker}</span>
                                </span>
                              )}
                            </div>

                            {(prod.titleEn || prod.titleCn) && (
                              <span className="text-[10px] text-slate-400 block truncate max-w-sm mt-1 font-mono">
                                EN: {prod.titleEn || '-'} | CN: {prod.titleCn || '-'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingProductId(prod.id);
                              setEditingProductForm({ ...prod });
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                            title="제품 정보 수정"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>수정</span>
                          </button>
                          {deleteConfirmProdId === prod.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  deleteProduct(prod.id);
                                  setDeleteConfirmProdId(null);
                                  showToast(`'${prod.title}' 제품이 삭제되었습니다.`);
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-colors cursor-pointer animate-pulse"
                                title="삭제 확정"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>삭제 확인</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmProdId(null)}
                                className="px-2 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                              >
                                취소
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteConfirmProdId(prod.id);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                              title="제품 삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>삭제</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Contact & Quote */}
          {activeTab === 'contact' && (
            <div className="space-y-6 max-w-4xl">
              {/* Contact Translations */}
              <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-700" />
                  <span>오시는길 & 견적문의 섹션 문구 ({cmsLang})</span>
                </h4>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">오시는길 타이틀 ({cmsLang})</label>
                  <input
                    type="text"
                    value={getTrans('contact', 'title', '찾아오시는 길 & 도면 수주 문의')}
                    onChange={(e) => updateSectionTranslation(cmsLang, 'contact', 'title', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold"
                  />
                </div>
              </div>

              {/* Location & Contact Info */}
              <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-700" />
                  <span>본사 및 제1·제2 공장 주소 및 연락처 수정</span>
                </h4>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">제1공장 주소 (본사)</label>
                  <input
                    type="text"
                    value={companyInfo.address}
                    onChange={(e) => updateCompanyInfo({ address: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">제2공장 주소 (확장공장)</label>
                  <input
                    type="text"
                    value={companyInfo.address2 || '인천광역시 남동구 남동대로79번길 107 (고잔동)'}
                    onChange={(e) => updateCompanyInfo({ address2: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">전화번호</label>
                    <input
                      type="text"
                      value={companyInfo.phone}
                      onChange={(e) => updateCompanyInfo({ phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">팩스번호</label>
                    <input
                      type="text"
                      value={companyInfo.fax}
                      onChange={(e) => updateCompanyInfo({ fax: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">대표 이메일</label>
                    <input
                      type="text"
                      value={companyInfo.email}
                      onChange={(e) => updateCompanyInfo({ email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Formspree Data Collection Configuration */}
              <div className="space-y-4 bg-gradient-to-br from-emerald-50 to-teal-50/70 p-5 rounded-2xl border border-emerald-200">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                    <Inbox className="w-4 h-4 text-emerald-700" />
                    <span>Formspree 웹사이트 데이터 수집 연동 설정</span>
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-mono text-[10px] font-bold">
                    CONNECTED & ACTIVE
                  </span>
                </div>

                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  홈페이지의 <strong>'이메일 상담'</strong> 모달 및 <strong>'오시는길 & 도면견적'</strong> 양식에 고객이 입력한 모든 데이터(회사명, 담당자명, 연락처, 이메일, 첨부도면, 요청사항 등)가 아래 Formspree 엔드포인트를 통해 실시간으로 수집 및 이메일 전송됩니다.
                </p>

                <div className="space-y-2">
                  <label className="block text-emerald-900 font-bold text-xs">Formspree 엔드포인트 URL</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={companyInfo.formspreeUrl || DEFAULT_FORMSPREE_ENDPOINT}
                      onChange={(e) => updateCompanyInfo({ formspreeUrl: e.target.value })}
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-emerald-300 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                      placeholder="https://formspree.io/f/xgawngpn"
                    />
                    <button
                      type="button"
                      onClick={handleTestFormspree}
                      disabled={isTestingFormspree}
                      className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50 cursor-pointer shrink-0"
                    >
                      {isTestingFormspree ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>연동 테스트 중...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>연동 테스트 전송</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {formspreeTestResult && (
                  <div
                    className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                      formspreeTestResult.success
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-red-100 text-red-900 border border-red-300'
                    }`}
                  >
                    <span>{formspreeTestResult.msg}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: Inquiries Inbox */}
          {activeTab === 'inquiries' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-purple-700" />
                  <span>실시간 수주 및 도면 견적 문의함 ({inquiries.length})</span>
                </h4>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                    Formspree 수신 연동 중 ({companyInfo.formspreeUrl || DEFAULT_FORMSPREE_ENDPOINT})
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 hover:border-purple-300"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{inq.companyName}</span>
                        <span className="text-slate-600 text-xs font-semibold">
                          ({inq.contactName} / {inq.phone})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-mono text-[11px]">{inq.createdAt}</span>

                        <select
                          value={inq.status}
                          onChange={(e: any) => updateInquiryStatus(inq.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                            inq.status === '대기중'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : inq.status === '검토중'
                              ? 'bg-purple-50 text-purple-800 border-purple-300'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          }`}
                        >
                          <option value="대기중">대기중</option>
                          <option value="검토중">검토중</option>
                          <option value="답변완료">답변완료</option>
                        </select>

                        <button
                          onClick={() => deleteInquiry(inq.id)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-white p-3 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-slate-400 block">카테고리:</span>
                        <span className="text-slate-800 font-bold">{inq.category}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">소재:</span>
                        <span className="text-purple-700 font-bold">{inq.material}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">수량:</span>
                        <span className="text-slate-800 font-mono font-bold">{inq.quantity}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">첨부 도면:</span>
                        <span className="text-emerald-700 font-bold font-mono truncate block">
                          {inq.drawingFileName || '없음'}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed whitespace-pre-line">
                      {inq.message}
                    </p>
                  </div>
                ))}

                {inquiries.length === 0 && (
                  <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                    접수된 수주 문의가 없습니다.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: News Posts */}
          {activeTab === 'news' && (
            <div className="space-y-6 max-w-4xl">
              {/* Add News Post Form */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-purple-700" />
                  <span>신규 회사 소식/게시글 작성</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="게시글 제목"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    className="col-span-2 px-3.5 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs"
                  />
                  <select
                    value={newPostCategory}
                    onChange={(e: any) => setNewPostCategory(e.target.value)}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs"
                  >
                    <option value="공지사항">공지사항</option>
                    <option value="기술자료">기술자료</option>
                    <option value="보도자료">보도자료</option>
                    <option value="설비도입">설비도입</option>
                  </select>
                </div>

                <textarea
                  rows={4}
                  placeholder="게시글 상세 내용"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs"
                />

                <button
                  onClick={async () => {
                    if (!newPostTitle.trim()) {
                      alert('제목을 입력해주세요.');
                      return;
                    }
                    setIsTranslating(true);
                    let titleEn = '', titleCn = '';
                    let contentEn = '', contentCn = '';

                    try {
                      const transTitle = await autoTranslateText(newPostTitle, 'Company news title');
                      titleEn = transTitle.english;
                      titleCn = transTitle.chinese;

                      if (newPostContent) {
                        const transContent = await autoTranslateText(newPostContent, 'Company news content');
                        contentEn = transContent.english;
                        contentCn = transContent.chinese;
                      }
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setIsTranslating(false);
                    }

                    const now = new Date();
                    const formattedDate = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(
                      now.getDate()
                    ).padStart(2, '0')}`;
                    addNewsPost({
                      title: newPostTitle,
                      titleEn: titleEn || newPostTitle,
                      titleCn: titleCn || newPostTitle,
                      category: newPostCategory,
                      content: newPostContent,
                      contentEn: contentEn || newPostContent,
                      contentCn: contentCn || newPostContent,
                      author: newPostAuthor,
                      date: formattedDate,
                      pinned: false,
                    });
                    alert('게시글이 등록되었으며 영문 및 중문 번역이 자동 반영되었습니다.');
                    setNewPostTitle('');
                    setNewPostContent('');
                  }}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>게시글 등록 (✨ AI 영/중문 번역)</span>
                </button>
              </div>

              {/* News Posts List */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">게시글 목록 ({newsPosts.length})</h4>
                {newsPosts.map((post) => (
                  <div key={post.id} className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold text-[10px]">
                          {post.category}
                        </span>
                        <span className="font-bold text-slate-900 text-xs">{post.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{post.content}</p>
                    </div>
                    <button
                      onClick={() => deleteNewsPost(post.id)}
                      className="p-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: Theme */}
          {activeTab === 'theme' && (
            <div className="space-y-6 max-w-3xl">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-700" />
                <span>웹사이트 포인트 테마 컬러 커스터마이징</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {presetColors.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() =>
                      updateThemeConfig({
                        accentColor: preset.color,
                        accentGlow: preset.glow,
                        accentName: preset.name,
                      })
                    }
                    className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                      themeConfig.accentName === preset.name
                        ? 'border-purple-600 bg-purple-50 shadow-md'
                        : 'border-slate-200 bg-white hover:border-purple-300'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: preset.color }} />
                    <span className="font-bold text-slate-900 text-xs">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            * 수정한 모든 내용은 브라우저 로컬 저장소에 보존되며 외국어(KO/EN/CN) 모드에 즉시 반영됩니다.
          </span>
          <button
            onClick={() => setIsAdminOpen(false)}
            className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20"
          >
            대시보드 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
