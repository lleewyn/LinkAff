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

    // --- TRẠNG THÁI ---
    let currentConfig = { ...DEFAULTS };
    let isLoggedIn = false;
    let editingCampaignId = null; // null = tạo mới

    const campaignListView = document.getElementById('campaign-list-view');
    const campaignEditView = document.getElementById('campaign-edit-view');
    const campaignItemsContainer = document.getElementById('campaign-items-container');
    const createNewBtn = document.getElementById('create-new-campaign');
    const backToListBtn = document.getElementById('back-to-list');
    const editViewTitle = document.getElementById('edit-view-title');
    const adminSlugInput = document.getElementById('admin-slug');
    const urlPreview = document.getElementById('generated-url-preview');

    // --- KHỞI TẠO ---
    initApp();

    async function initApp() {
        const urlParams = new URLSearchParams(window.location.search);
        const campaignSlug = urlParams.get('p');

        if (campaignSlug) {
            await loadCampaignBySlug(campaignSlug);
        } else {
            // Load mặc định
            applyConfig(DEFAULTS);
            await loadCampaignBySlug('default');
        }
    }

    async function loadCampaignBySlug(slug) {
        if (!supabase) return;
        try {
            const { data, error } = await supabase
                .from('app_config')
                .select('*')
                .eq('slug', slug)
                .single();
            
            if (data) {
                currentConfig = mapDataToConfig(data);
                applyConfig(currentConfig);
            }
        } catch (err) {
            console.warn('Không tìm thấy campaign:', slug);
        }
    }

    function mapDataToConfig(data) {
        return {
            id: data.id,
            slug: data.slug,
            affId: data.aff_id || DEFAULTS.affId,
            bannerUrl: data.banner_url || DEFAULTS.bannerUrl,
            bannerSize: data.banner_size || DEFAULTS.bannerSize,
            fbLink: data.fb_link || DEFAULTS.fbLink,
            promoTitle: data.promo_title || DEFAULTS.promoTitle,
            promoSubtitle: data.promo_subtitle || DEFAULTS.promoSubtitle,
            promoBadge: data.promo_badge || DEFAULTS.promoBadge,
            promoStat: data.promo_stat || DEFAULTS.promoStat,
            step1: data.step1 || DEFAULTS.step1,
            step2: data.step2 || DEFAULTS.step2,
            step3: data.step3 || DEFAULTS.step3,
            appTitle: data.app_title || DEFAULTS.appTitle,
            tabTitle: data.tab_title || DEFAULTS.tabTitle
        };
    }

    // --- LOGIC CHIẾN DỊCH ---

    async function loadCampaignList() {
        if (!supabase) return;
        campaignItemsContainer.innerHTML = '<div class="loading-text">Đang tải danh sách...</div>';
        
        const { data, error } = await supabase
            .from('app_config')
            .select('id, slug, app_title')
            .order('created_at', { ascending: false });

        if (error) {
            campaignItemsContainer.innerHTML = '<div class="loading-text" style="color: red;">Lỗi tải dữ liệu!</div>';
            return;
        }

        if (data.length === 0) {
            campaignItemsContainer.innerHTML = '<div class="loading-text">Chưa có link nào. Hãy tạo mới!</div>';
            return;
        }

        campaignItemsContainer.innerHTML = '';
        data.forEach(item => {
            const div = document.createElement('div');
            div.className = 'campaign-item';
            const fullUrl = `${window.location.origin}${window.location.pathname}?p=${item.slug}`;
            
            div.innerHTML = `
                <div class="campaign-info">
                    <div class="campaign-name">${item.app_title || 'Không tên'}</div>
                    <div class="campaign-slug">?p=${item.slug}</div>
                </div>
                <div class="campaign-actions">
                    <button class="action-btn copy-url-btn" data-url="${fullUrl}">Copy Link</button>
                    <button class="action-btn edit-item-btn" data-id="${item.id}">Sửa</button>
                    <button class="action-btn delete-item-btn" data-id="${item.id}">Xóa</button>
                </div>
            `;
            campaignItemsContainer.appendChild(div);
        });

        // Gán sự kiện cho các nút
        // Các sự kiện đã được xử lý qua Event Delegation ở ngoài
    }

    // Sử dụng Event Delegation để xử lý các nút bấm trong danh sách
    campaignItemsContainer.onclick = async (e) => {
        const btn = e.target.closest('.action-btn');
        if (!btn) return;

        const id = btn.dataset.id;
        const url = btn.dataset.url;

        if (btn.classList.contains('copy-url-btn')) {
            navigator.clipboard.writeText(url);
            showToast('Đã copy link chiến dịch!');
        } 
        else if (btn.classList.contains('edit-item-btn')) {
            showToast('Đang tải dữ liệu...');
            const { data, error } = await supabase.from('app_config').select('*').eq('id', id).single();
            if (data) {
                editingCampaignId = id;
                const config = mapDataToConfig(data);
                fillEditForm(config);
                showEditView(true);
            } else {
                alert('Không tìm thấy dữ liệu chiến dịch!');
            }
        } 
        else if (btn.classList.contains('delete-item-btn')) {
            if (confirm('Bạn có chắc muốn xóa link này?')) {
                const { error } = await supabase.from('app_config').delete().eq('id', id);
                if (error) {
                    alert('Lỗi khi xóa: ' + error.message);
                } else {
                    loadCampaignList();
                    showToast('Đã xóa thành công!');
                }
            }
        }
    };

    function fillEditForm(config) {
        adminSlugInput.value = config.slug || '';
        adminAppTitleInput.value = config.appTitle || '';
        adminTabTitleInput.value = config.tabTitle || '';
        adminAffIdInput.value = config.affId || '';
        adminFbLinkInput.value = config.fbLink || '';
        adminBannerUrlInput.value = config.bannerUrl || '';
        adminBannerSizeInput.value = config.bannerSize || '60';
        adminPromoTitleInput.value = config.promoTitle || '';
        adminPromoSubtitleInput.value = config.promoSubtitle || '';
        adminPromoBadgeInput.value = config.promoBadge || '';
        adminPromoStatInput.value = config.promoStat || '';
        adminStep1Input.value = config.step1 || '';
        adminStep2Input.value = config.step2 || '';
        adminStep3Input.value = config.step3 || '';
        
        const previewImg = document.getElementById('admin-banner-preview-img');
        if (previewImg) previewImg.src = config.bannerUrl || 'promo_banner.png';
        updateUrlPreview();
    }

    function showEditView(isEdit) {
        campaignListView.classList.add('hidden');
        campaignEditView.classList.remove('hidden');
        editViewTitle.textContent = isEdit ? 'Chỉnh sửa Link' : 'Tạo Link Mới';
        if (!isEdit) {
            editingCampaignId = null;
            fillEditForm({ ...DEFAULTS, slug: '' });
        }
    }

    createNewBtn.onclick = () => showEditView(false);
    backToListBtn.onclick = () => {
        campaignListView.classList.remove('hidden');
        campaignEditView.classList.add('hidden');
        loadCampaignList();
    };

    adminSlugInput.oninput = updateUrlPreview;
    function updateUrlPreview() {
        const slug = adminSlugInput.value.trim().toLowerCase().replace(/\s+/g, '-');
        adminSlugInput.value = slug;
        urlPreview.textContent = slug ? `${window.location.origin}${window.location.pathname}?p=${slug}` : '';
    }

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

    // Logic chuyển đổi sang link Affiliate (Hỗ trợ hàng loạt)
    convertBtn.addEventListener('click', () => {
        const rawContent = productUrlInput.value.trim();
        if (!rawContent) {
            alert('Vui lòng dán link Shopee vào đây...');
            return;
        }

        // Tách các link theo dòng
        const lines = rawContent.split('\n').map(l => l.trim()).filter(l => l !== '');
        
        // Kiểm tra xem có link rút gọn nào không
        const hasShortLink = lines.some(l => l.includes('shope.ee') || l.includes('shp.ee'));
        if (hasShortLink) {
            const confirmProceed = confirm('Trong danh sách có chứa link rút gọn (shp.ee). Link này có thể không ổn định. Bạn nên dùng link dài để đạt hiệu quả tốt nhất. Vẫn tiếp tục?');
            if (!confirmProceed) return;
        }

        try {
            const results = lines.map(line => {
                try {
                    return transformLink(line, currentConfig.affId);
                } catch (e) {
                    return `Lỗi link: ${line}`;
                }
            });

            outputUrl.value = results.join('\n');
            // Tự động điều chỉnh độ cao textarea kết quả
            outputUrl.rows = Math.min(Math.max(results.length, 4), 15);
            
            resultArea.classList.remove('hidden');
            resultArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (error) {
            alert('Có lỗi xảy ra khi xử lý danh sách link!');
        }
    });
    // Sao chép link kết quả
    copyBtn.addEventListener('click', () => {
        outputUrl.select();
        navigator.clipboard.writeText(outputUrl.value).then(() => {
            showToast('Đã sao chép link thành công!');
        });
    });

    // --- LOGIC ADMIN PANEL ---

    // Mở Admin Modal
    adminToggle.addEventListener('click', () => {
        if (!isLoggedIn) {
            loginSection.classList.remove('hidden');
            settingsSection.classList.add('hidden');
            modalTitle.textContent = 'Đăng Nhập Quản Trị';
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
        modalTitle.textContent = 'Quản Lý Link (Campaigns)';
        loadCampaignList();
    }

    // Xử lý upload file ảnh & Khởi tạo Cropper
    adminBannerFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                cropperImage.src = event.target.result;
                cropperWrapper.classList.remove('hidden');
                if (cropper) cropper.destroy();
                setTimeout(() => {
                    cropper = new Cropper(cropperImage, {
                        aspectRatio: 1,
                        viewMode: 1,
                        autoCropArea: 1,
                    });
                }, 100);
            };
            reader.readAsDataURL(file);
        }
    });

    cropBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (cropper) {
            const canvas = cropper.getCroppedCanvas({ width: 400, height: 400 });
            const base64Image = canvas.toDataURL('image/png');
            adminBannerUrlInput.value = base64Image;
            document.getElementById('admin-banner-preview-img').src = base64Image;
            cropperWrapper.classList.add('hidden');
            cropper.destroy();
            cropper = null;
            showToast('Đã cắt ảnh xong!');
        }
    });

    // Lưu cài đặt Admin
    saveSettingsBtn.addEventListener('click', async () => {
        const slug = adminSlugInput.value.trim();
        if (!slug) {
            alert('Vui lòng nhập Đuôi link (Slug)!');
            return;
        }

        const newConfig = {
            slug: slug,
            affId: adminAffIdInput.value.trim(),
            bannerUrl: adminBannerUrlInput.value.trim(),
            bannerSize: adminBannerSizeInput.value.trim(),
            fbLink: adminFbLinkInput.value.trim(),
            promoTitle: adminPromoTitleInput.value.trim(),
            promoSubtitle: adminPromoSubtitleInput.value.trim(),
            promoBadge: adminPromoBadgeInput.value.trim(),
            promoStat: adminPromoStatInput.value.trim(),
            step1: adminStep1Input.value.trim(),
            step2: adminStep2Input.value.trim(),
            step3: adminStep3Input.value.trim(),
            appTitle: adminAppTitleInput.value.trim(),
            tabTitle: adminTabTitleInput.value.trim()
        };

        if (supabase) {
            showToast('Đang lưu...');
            let result;
            if (editingCampaignId) {
                // Update
                result = await supabase.from('app_config').update({
                    slug: newConfig.slug,
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
                }).eq('id', editingCampaignId);
            } else {
                // Insert
                result = await supabase.from('app_config').insert([{
                    slug: newConfig.slug,
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
                }]);
            }

            if (result.error) {
                alert('Lỗi: ' + result.error.message);
            } else {
                showToast('Đã lưu thành công!');
                backToListBtn.click();
                // Nếu đang ở chính trang này thì apply luôn
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('p') === slug) {
                    applyConfig(newConfig);
                }
            }
        }
    });

    // Đóng Admin Modal
    closeModal.addEventListener('click', () => {
        adminModal.classList.add('hidden');
    });

    // Đóng modal khi click ra ngoài
    window.addEventListener('click', (e) => {
        if (e.target === adminModal) {
            adminModal.classList.add('hidden');
        }
    });

    // --- HÀM HỖ TRỢ ---

    function transformLink(url, id) {
        let cleanUrl = url;

        // 1. Nếu là link rút gọn (shope.ee hoặc shp.ee), ta để nguyên link đó làm origin_link
        // Nhưng tốt nhất vẫn khuyên người dùng dùng link dài.
        if (url.includes('shope.ee') || url.includes('shp.ee')) {
            cleanUrl = url.split('?')[0];
        } else {
            // 2. Xử lý link dài: Lọc bỏ các tham số affiliate của người khác nếu có
            try {
                const urlObj = new URL(url);
                const params = new URLSearchParams(urlObj.search);
                const blackList = ['aff_id', 'affiliate_id', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
                blackList.forEach(p => params.delete(p));
                
                urlObj.search = params.toString();
                cleanUrl = urlObj.toString().split('?')[0]; // Lấy base URL trước
                
                // Nếu có tham số quan trọng như v (video) hoặc smtt, có thể giữ lại ở đây nếu cần
            } catch (e) {
                cleanUrl = url.split('?')[0];
            }

            // 3. Regex cải tiến: hỗ trợ cả -i. (cũ) và .i. (mới)
            const matchI = url.match(/[.-]i\.(\d+)\.(\d+)/);
            const matchProduct = url.match(/product\/(\d+)\/(\d+)/);
            
            if (matchI) {
                cleanUrl = `https://shopee.vn/product/${matchI[1]}/${matchI[2]}`;
            } else if (matchProduct) {
                cleanUrl = `https://shopee.vn/product/${matchProduct[1]}/${matchProduct[2]}`;
            }
        }

        const encodedUrl = encodeURIComponent(cleanUrl);
        // Thêm sub_id=tool_linkaff để bạn dễ theo dõi trong Dashboard Shopee
        return `https://s.shopee.vn/an_redir?origin_link=${encodedUrl}&affiliate_id=${id}&sub_id=tool_linkaff`;
    }

    function loadConfig() {
        const saved = localStorage.getItem('shopee_app_config');
        return saved ? JSON.parse(saved) : { ...DEFAULTS };
    }

    function saveConfig(config) {
        localStorage.setItem('shopee_app_config', JSON.stringify(config));
    }

    function applyConfig(config) {
        // 1. Cập nhật Tiêu đề Tab trình duyệt
        if (config.tabTitle) {
            document.title = config.tabTitle;
            // Cập nhật thêm thẻ title nếu có ID để chắc chắn
            const tabTitleEl = document.getElementById('app-tab-title');
            if (tabTitleEl) tabTitleEl.textContent = config.tabTitle;
            console.log('Đã đổi tiêu đề tab thành:', config.tabTitle);
        }

        // 2. Cập nhật Tiêu đề chính trên trang
        const appTitleEl = document.getElementById('display-app-title');
        if (appTitleEl && config.appTitle) {
            appTitleEl.textContent = config.appTitle;
        }

        // 3. Cập nhật ảnh banner
        if (promoImg) {
            promoImg.src = config.bannerUrl || 'promo_banner.png';
            const wrapper = document.querySelector('.promo-image-wrapper');
            if (wrapper) {
                const size = config.bannerSize || '60';
                wrapper.style.width = size + 'px';
                wrapper.style.height = size + 'px';
            }
        }

        // 4. Cập nhật link FB
        if (fbPostLink) fbPostLink.href = config.fbLink || '#';
        
        // 5. Cập nhật thông tin voucher
        const titleEl = document.getElementById('promo-title');
        const subtitleEl = document.getElementById('promo-subtitle');
        const badgeEl = document.getElementById('promo-badge');
        const statEl = document.getElementById('promo-stat');

        if (titleEl) titleEl.textContent = config.promoTitle;
        if (subtitleEl) subtitleEl.textContent = config.promoSubtitle;
        if (badgeEl) badgeEl.textContent = config.promoBadge;
        if (statEl) {
            const termsSpan = statEl.querySelector('.terms');
            statEl.textContent = (config.promoStat || '') + ' ';
            if (termsSpan) statEl.appendChild(termsSpan);
        }

        // 6. Cập nhật 3 bước hướng dẫn
        const step1El = document.getElementById('display-step1');
        const step2El = document.getElementById('display-step2');
        const step3El = document.getElementById('display-step3');

        if (step1El) step1El.innerHTML = config.step1 || DEFAULTS.step1;
        if (step2El) step2El.innerHTML = config.step2 || DEFAULTS.step2;
        if (step3El) step3El.innerHTML = config.step3 || DEFAULTS.step3;
    }

    function showToast(message) {
        toast.textContent = message;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 2500);
    }
});
