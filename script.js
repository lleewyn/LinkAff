document.addEventListener('DOMContentLoaded', () => {
    // --- CẤU HÌNH MẶC ĐỊNH ---
    const DEFAULTS = {
        affId: '17371550373',
        bannerUrl: 'promo_banner.png',
        fbLink: '#'
    };

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
    const adminFbLinkInput = document.getElementById('admin-fb-link');

    // --- KHỞI TẠO ---
    let currentConfig = loadConfig();
    applyConfig(currentConfig);

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
        // Điền lại giá trị hiện tại vào form
        adminAffIdInput.value = currentConfig.affId;
        adminBannerUrlInput.value = currentConfig.bannerUrl;
        adminFbLinkInput.value = currentConfig.fbLink;
        
        adminModal.classList.remove('hidden');
    });

    // Đóng Admin Modal
    closeModal.addEventListener('click', () => {
        adminModal.classList.add('hidden');
    });

    // Lưu cài đặt Admin
    saveSettingsBtn.addEventListener('click', () => {
        const newConfig = {
            affId: adminAffIdInput.value.trim() || DEFAULTS.affId,
            bannerUrl: adminBannerUrlInput.value.trim() || DEFAULTS.bannerUrl,
            fbLink: adminFbLinkInput.value.trim() || DEFAULTS.fbLink
        };

        saveConfig(newConfig);
        currentConfig = newConfig;
        applyConfig(newConfig);
        
        adminModal.classList.add('hidden');
        showToast('Đã cập nhật cài đặt thành công!');
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
        if (promoImg) promoImg.src = config.bannerUrl;
        // Cập nhật link FB
        if (fbPostLink) fbPostLink.href = config.fbLink;
    }

    function showToast(message) {
        toast.textContent = message;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 2500);
    }
});
