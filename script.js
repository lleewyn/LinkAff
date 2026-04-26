document.addEventListener('DOMContentLoaded', () => {
    // --- CẤU HÌNH MẶC ĐỊNH ---
    const DEFAULTS = {
        affId: '17371550373',
        bannerUrl: 'promo_banner.png',
        fbLink: '#',
        promoTitle: 'Giảm 25% Giảm tối đa 1trđ',
        promoSubtitle: 'Đơn Tối Thiểu 50kđ',
        promoBadge: 'Độc Quyền Facebook',
        promoStat: 'Đã dùng 98%, Sắp hết hạn: Còn ...',
        bannerSize: '60',
        step1: 'Sau khi tạo link, nhấn Copy Link.',
        step2: 'Dán link dưới bình luận bài đăng này.',
        step3: 'Click vào link để mở Shopee sẽ nhận được mã.',
        appTitle: 'Tạo Link Shopee',
        tabTitle: 'Tạo Link Shopee - Affiliate Tool'
    };

    // --- CẤU HÌNH SUPABASE ---
    const SUPABASE_URL = 'https://pmdgvhldkzmxzppnlpwy.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_BN8RfFQ4db0vLQ4vQYkplg_EarI2E4k';
    const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

    // --- CÁC PHẦN TỬ UI CHÍNH ---
    const productUrlInput = document.getElementById('product-url');
    const convertBtn = document.getElementById('convert-btn');
    const pasteBtn = document.getElementById('paste-btn');
    const resultArea = document.getElementById('result-area');
    const outputUrl = document.getElementById('output-url');
    const copyBtn = document.getElementById('copy-btn');
    const toast = document.getElementById('toast');
    const promoImg = document.querySelector('.promo-img');
    const fbPostLink = document.getElementById('fb-post-link');

    // --- CÁC PHẦN TỬ ADMIN ---
    const adminToggle = document.getElementById('admin-toggle');
    const adminModal = document.getElementById('admin-modal');
    const closeModal = document.getElementById('close-modal');
    const saveSettingsBtn = document.getElementById('save-settings');
    
    const adminAffIdInput = document.getElementById('admin-aff-id');
    const adminBannerUrlInput = document.getElementById('admin-banner-url');
    const adminBannerFileInput = document.getElementById('admin-banner-file');
    const adminBannerSizeInput = document.getElementById('admin-banner-size');
    
    const cropperWrapper = document.getElementById('cropper-wrapper');
    const cropperImage = document.getElementById('cropper-image');
    const cropBtn = document.getElementById('crop-btn');
    let cropper = null;

    const adminFbLinkInput = document.getElementById('admin-fb-link');
    const adminPromoTitleInput = document.getElementById('admin-promo-title');
    const adminPromoSubtitleInput = document.getElementById('admin-promo-subtitle');
    const adminPromoBadgeInput = document.getElementById('admin-promo-badge');
    const adminPromoStatInput = document.getElementById('admin-promo-stat');
    const adminStep1Input = document.getElementById('admin-step1');
    const adminStep2Input = document.getElementById('admin-step2');
    const adminStep3Input = document.getElementById('admin-step3');
    const adminAppTitleInput = document.getElementById('admin-app-title');
    const adminTabTitleInput = document.getElementById('admin-tab-title');

    const loginSection = document.getElementById('login-section');
    const settingsSection = document.getElementById('settings-section');
    const loginBtn = document.getElementById('login-btn');
    const loginUser = document.getElementById('login-username');
    const loginPass = document.getElementById('login-password');
    const modalTitle = document.getElementById('modal-title');

    const ADMIN_CREDS = {
        user: 'quynhbikhung',
        pass: 'mkquynh123bijkhung'
    };

    let isLoggedIn = false;

    // --- KHỞI TẠO ---
    let currentConfig = loadConfig();
    applyConfig(currentConfig);

    // Tải cấu hình từ Supabase (nếu có)
    async function initSupabase() {
        if (!supabase) return;
        try {
            const { data, error } = await supabase
                .from('app_config')
                .select('*')
                .eq('id', 1)
                .single();
            
            if (data) {
                // Chuyển đổi tên cột từ snake_case sang camelCase (nếu cần)
                currentConfig = {
                    affId: data.aff_id,
                    bannerUrl: data.banner_url,
                    bannerSize: data.banner_size,
                    fbLink: data.fb_link,
                    promoTitle: data.promo_title,
                    promoSubtitle: data.promo_subtitle,
                    promoBadge: data.promo_badge,
                    promoStat: data.promo_stat,
                    step1: data.step1 || DEFAULTS.step1,
                    step2: data.step2 || DEFAULTS.step2,
                    step3: data.step3 || DEFAULTS.step3,
                    appTitle: data.app_title || DEFAULTS.appTitle,
                    tabTitle: data.tab_title || DEFAULTS.tabTitle
                };
                applyConfig(currentConfig);
            }
        } catch (err) {
            console.warn('Sử dụng cấu hình local:', err);
        }
    }
    initSupabase();

    // --- LOGIC CHÍNH ---

    // Xử lý nút Dán (Paste)
    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            productUrlInput.value = text;
        } catch (err) {
            alert('Vui lòng dán link thủ công vào ô nhập liệu.');
        }
    });

    // Logic chuyển đổi sang link Affiliate
    convertBtn.addEventListener('click', () => {
        const rawUrl = productUrlInput.value.trim();
        if (!rawUrl) {
            alert('Vui lòng dán link Shopee vào đây...');
            return;
        }

        try {
            const convertedUrl = transformLink(rawUrl, currentConfig.affId);
            outputUrl.value = convertedUrl;
            resultArea.classList.remove('hidden');
            resultArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (error) {
            alert('Link không hợp lệ!');
        }
    });

    // Sao chép link kết quả
    copyBtn.addEventListener('click', () => {
        outputUrl.select();
        document.execCommand('copy');
        showToast('Đã sao chép link thành công!');
    });

    // --- LOGIC ADMIN PANEL ---

    // Mở Admin Modal
    adminToggle.addEventListener('click', () => {
        // Reset về màn hình login nếu chưa đăng nhập
        if (!isLoggedIn) {
            loginSection.classList.remove('hidden');
            settingsSection.classList.add('hidden');
            modalTitle.textContent = 'Đăng Nhập Quản Trị';
            loginUser.value = '';
            loginPass.value = '';
        } else {
            showSettings();
        }
        
        adminModal.classList.remove('hidden');
    });

    // Xử lý Đăng nhập
    loginBtn.addEventListener('click', () => {
        if (loginUser.value === ADMIN_CREDS.user && loginPass.value === ADMIN_CREDS.pass) {
            isLoggedIn = true;
            showSettings();
            showToast('Đăng nhập thành công!');
        } else {
            alert('Sai tài khoản hoặc mật khẩu!');
        }
    });

    function showSettings() {
        loginSection.classList.add('hidden');
        settingsSection.classList.remove('hidden');
        modalTitle.textContent = 'Bảng Quản Trị (Admin Panel)';

        // Điền lại giá trị hiện tại vào form
        adminAffIdInput.value = currentConfig.affId;
        adminBannerUrlInput.value = currentConfig.bannerUrl;
        adminBannerSizeInput.value = currentConfig.bannerSize || '60';
        adminFbLinkInput.value = currentConfig.fbLink;
        adminPromoTitleInput.value = currentConfig.promoTitle;
        adminPromoSubtitleInput.value = currentConfig.promoSubtitle;
        adminPromoBadgeInput.value = currentConfig.promoBadge;
        adminPromoStatInput.value = currentConfig.promoStat;
        adminStep1Input.value = currentConfig.step1;
        adminStep2Input.value = currentConfig.step2;
        adminStep3Input.value = currentConfig.step3;
        adminAppTitleInput.value = currentConfig.appTitle;
        adminTabTitleInput.value = currentConfig.tabTitle;
    }

    // Xử lý upload file ảnh & Khởi tạo Cropper
    adminBannerFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                // Hiển thị khung cắt ảnh
                cropperImage.src = event.target.result;
                cropperWrapper.classList.remove('hidden');
                
                if (cropper) cropper.destroy();
                
                // Khởi tạo Cropper sau khi ảnh load
                setTimeout(() => {
                    cropper = new Cropper(cropperImage, {
                        aspectRatio: 1, // Tỷ lệ 1:1 cho voucher
                        viewMode: 1,
                        autoCropArea: 1,
                    });
                }, 100);
            };
            reader.readAsDataURL(file);
        }
    });

    // Nút xác nhận cắt ảnh
    cropBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (cropper) {
            const canvas = cropper.getCroppedCanvas({
                width: 300,
                height: 300,
            });
            const base64 = canvas.toDataURL('image/png');
            adminBannerUrlInput.value = base64; // Lưu kết quả cắt
            cropperWrapper.classList.add('hidden');
            showToast('Đã cắt ảnh thành công!');
        }
    });

    // Đóng Admin Modal
    closeModal.addEventListener('click', () => {
        adminModal.classList.add('hidden');
    });

    // Lưu cài đặt Admin
    saveSettingsBtn.addEventListener('click', async () => {
        const newConfig = {
            affId: adminAffIdInput.value.trim() || DEFAULTS.affId,
            bannerUrl: adminBannerUrlInput.value.trim() || DEFAULTS.bannerUrl,
            bannerSize: adminBannerSizeInput.value.trim() || DEFAULTS.bannerSize,
            fbLink: adminFbLinkInput.value.trim() || DEFAULTS.fbLink,
            promoTitle: adminPromoTitleInput.value.trim() || DEFAULTS.promoTitle,
            promoSubtitle: adminPromoSubtitleInput.value.trim() || DEFAULTS.promoSubtitle,
            promoBadge: adminPromoBadgeInput.value.trim() || DEFAULTS.promoBadge,
            promoStat: adminPromoStatInput.value.trim() || DEFAULTS.promoStat,
            step1: adminStep1Input.value.trim() || DEFAULTS.step1,
            step2: adminStep2Input.value.trim() || DEFAULTS.step2,
            step3: adminStep3Input.value.trim() || DEFAULTS.step3,
            appTitle: adminAppTitleInput.value.trim() || DEFAULTS.appTitle,
            tabTitle: adminTabTitleInput.value.trim() || DEFAULTS.tabTitle
        };

        // 1. Lưu vào LocalStorage (dự phòng)
        saveConfig(newConfig);
        
        // 2. Lưu lên Supabase
        if (supabase) {
            showToast('Đang đồng bộ với Cloud...');
            const { error } = await supabase
                .from('app_config')
                .update({
                    aff_id: newConfig.affId,
                    banner_url: newConfig.bannerUrl,
                    banner_size: newConfig.bannerSize,
                    fb_link: newConfig.fbLink,
                    promo_title: newConfig.promoTitle,
                    promo_subtitle: newConfig.promoSubtitle,
                    promo_badge: newConfig.promoBadge,
                    promo_stat: newConfig.promoStat,
                    step1: newConfig.step1,
                    step2: newConfig.step2,
                    step3: newConfig.step3,
                    app_title: newConfig.appTitle,
                    tab_title: newConfig.tabTitle
                })
                .eq('id', 1);

            if (error) {
                console.error('Lỗi Supabase:', error);
                alert('Không thể lưu lên Cloud, vui lòng kiểm tra bảng app_config!');
            }
        }

        currentConfig = newConfig;
        applyConfig(newConfig);
        
        adminModal.classList.add('hidden');
        showToast('Đã cập nhật cấu hình cho toàn hệ thống!');
    });

    // Đóng modal khi click ra ngoài
    window.addEventListener('click', (e) => {
        if (e.target === adminModal) {
            adminModal.classList.add('hidden');
        }
    });

    // --- HÀM HỖ TRỢ ---

    function transformLink(url, id) {
        let cleanUrl = url.split('?')[0];
        const encodedUrl = encodeURIComponent(cleanUrl);
        return `https://s.shopee.vn/an_redir?origin_link=${encodedUrl}&affiliate_id=${id}`;
    }

    function loadConfig() {
        const saved = localStorage.getItem('shopee_app_config');
        return saved ? JSON.parse(saved) : { ...DEFAULTS };
    }

    function saveConfig(config) {
        localStorage.setItem('shopee_app_config', JSON.stringify(config));
    }

    function applyConfig(config) {
        // Cập nhật ảnh banner
        if (promoImg) {
            promoImg.src = config.bannerUrl;
            // Cập nhật kích thước
            const wrapper = document.querySelector('.promo-image-wrapper');
            if (wrapper) {
                const size = config.bannerSize || '60';
                wrapper.style.width = size + 'px';
                wrapper.style.height = size + 'px';
            }
        }
        // Cập nhật link FB
        if (fbPostLink) fbPostLink.href = config.fbLink;
        
        // Cập nhật thông tin voucher
        const titleEl = document.getElementById('promo-title');
        const subtitleEl = document.getElementById('promo-subtitle');
        const badgeEl = document.getElementById('promo-badge');
        const statEl = document.getElementById('promo-stat');

        if (titleEl) titleEl.textContent = config.promoTitle;
        if (subtitleEl) subtitleEl.textContent = config.promoSubtitle;
        if (badgeEl) badgeEl.textContent = config.promoBadge;
        if (statEl) {
            // Giữ lại phần "Điều Kiện" nếu có
            const termsSpan = statEl.querySelector('.terms');
            statEl.textContent = config.promoStat + ' ';
            if (termsSpan) statEl.appendChild(termsSpan);
        }
    }

    function showToast(message) {
        toast.textContent = message;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 2500);
    }
});
