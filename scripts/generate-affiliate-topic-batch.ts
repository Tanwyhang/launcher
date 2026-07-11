import { readFileSync, writeFileSync } from "node:fs";

type CatalogProduct = {
  id: string;
  merchantName: string;
  productName: string;
  productUrl: string;
  affiliateUrl: string;
  imageLinkUrl: string;
  imageUrl: string;
  price: string;
  commissionRate: number;
  commissionSnapshot: string;
  verificationDate: string;
  sourceUrls: Array<{ label: string; url: string }>;
  isActive: boolean;
};

type Scenario = {
  key: string;
  category: string;
  en: string;
  ms: string;
  zh: string;
  products: string[];
};

const catalogPath = new URL("../data/affiliate-products-shopee-my.json", import.meta.url);
const defaultOutputPath = "/tmp/launcher-affiliate-topic-batch.json";
const apply = process.argv.includes("--apply");
const outputPath = process.argv.slice(2).find((argument) => argument !== "--apply") || defaultOutputPath;

const catalog = JSON.parse(readFileSync(catalogPath, "utf8")) as { products: CatalogProduct[] };
const products = new Map(catalog.products.filter((product) => product.isActive).map((product) => [product.id, product]));

const names = {
  "shopee-my-dji-osmo-pocket-3": {
    en: "DJI Osmo Pocket 3",
    ms: "DJI Osmo Pocket 3",
    zh: "DJI Osmo Pocket 3",
  },
  "shopee-my-ugreen-magnetic-power-bank-10000mah": {
    en: "UGREEN Magnetic Wireless 10000mAh Power Bank",
    ms: "UGREEN Magnetic Wireless Power Bank 10000mAh",
    zh: "UGREEN 磁吸无线 10000mAh 充电宝",
  },
  "shopee-my-goojodoq-gfs001-handheld-fan": {
    en: "GOOJODOQ GFS001 handheld fan",
    ms: "kipas tangan GOOJODOQ GFS001",
    zh: "GOOJODOQ GFS001 手持风扇",
  },
  "shopee-my-goojodoq-mini-fan-display": {
    en: "GOOJODOQ Mini handheld fan with display",
    ms: "kipas tangan mini GOOJODOQ dengan paparan",
    zh: "GOOJODOQ 带显示屏迷你手持风扇",
  },
  "shopee-my-eastel-prepaid-ultra-5g": {
    en: "Eastel prepaid SIM",
    ms: "SIM prabayar Eastel",
    zh: "Eastel 预付 SIM 卡",
  },
  "shopee-my-beone-mobile-prepaid-5g": {
    en: "BeONE prepaid SIM",
    ms: "SIM prabayar BeONE",
    zh: "BeONE 预付 SIM 卡",
  },
  "shopee-my-halo-telco-full-hotspot": {
    en: "Halo prepaid SIM",
    ms: "SIM prabayar Halo",
    zh: "Halo 预付 SIM 卡",
  },
  "shopee-my-motorcycle-bluetooth-intercom-c1-c2": {
    en: "C1/C2 motorcycle Bluetooth intercom",
    ms: "interkom Bluetooth motosikal C1/C2",
    zh: "C1/C2 摩托车蓝牙对讲机",
  },
} as const;

const scenarios: Scenario[] = [
  { key: "hot-weather-commute", category: "Hot-weather commute gear", en: "hot-weather commuting", ms: "ulang-alik cuaca panas", zh: "炎热天气通勤", products: ["shopee-my-goojodoq-gfs001-handheld-fan", "shopee-my-goojodoq-mini-fan-display", "shopee-my-ugreen-magnetic-power-bank-10000mah"] },
  { key: "campus-days", category: "Student everyday carry", en: "long campus days", ms: "hari panjang di kampus", zh: "长时间校园生活", products: ["shopee-my-ugreen-magnetic-power-bank-10000mah", "shopee-my-goojodoq-mini-fan-display", "shopee-my-eastel-prepaid-ultra-5g"] },
  { key: "weekend-city-trip", category: "Weekend city travel gear", en: "weekend city trips", ms: "perjalanan bandar hujung minggu", zh: "周末城市旅行", products: ["shopee-my-dji-osmo-pocket-3", "shopee-my-ugreen-magnetic-power-bank-10000mah", "shopee-my-goojodoq-mini-fan-display"] },
  { key: "motorcycle-commute", category: "Motorcycle commute gear", en: "daily motorcycle commuting", ms: "ulang-alik motosikal setiap hari", zh: "日常摩托车通勤", products: ["shopee-my-motorcycle-bluetooth-intercom-c1-c2", "shopee-my-ugreen-magnetic-power-bank-10000mah", "shopee-my-goojodoq-gfs001-handheld-fan"] },
  { key: "delivery-rider", category: "Delivery rider accessories", en: "delivery rider shifts", ms: "syif penghantar", zh: "配送骑手工作", products: ["shopee-my-motorcycle-bluetooth-intercom-c1-c2", "shopee-my-ugreen-magnetic-power-bank-10000mah", "shopee-my-beone-mobile-prepaid-5g"] },
  { key: "motorcycle-road-trip", category: "Motorcycle road-trip gear", en: "motorcycle road trips", ms: "perjalanan motosikal jarak jauh", zh: "摩托车长途旅行", products: ["shopee-my-motorcycle-bluetooth-intercom-c1-c2", "shopee-my-ugreen-magnetic-power-bank-10000mah", "shopee-my-dji-osmo-pocket-3"] },
  { key: "travel-creator", category: "Travel creator gear", en: "travel creators", ms: "pencipta kandungan travel", zh: "旅行内容创作者", products: ["shopee-my-dji-osmo-pocket-3", "shopee-my-ugreen-magnetic-power-bank-10000mah", "shopee-my-eastel-prepaid-ultra-5g"] },
  { key: "festival-day", category: "Outdoor event gear", en: "outdoor event days", ms: "hari acara luar", zh: "户外活动日", products: ["shopee-my-goojodoq-gfs001-handheld-fan", "shopee-my-ugreen-magnetic-power-bank-10000mah", "shopee-my-halo-telco-full-hotspot"] },
  { key: "airport-layover", category: "Airport travel gear", en: "airport layovers", ms: "tempoh menunggu di lapangan terbang", zh: "机场候机", products: ["shopee-my-ugreen-magnetic-power-bank-10000mah", "shopee-my-goojodoq-mini-fan-display", "shopee-my-eastel-prepaid-ultra-5g"] },
  { key: "train-bus-commute", category: "Public transport gear", en: "train and bus commuting", ms: "ulang-alik tren dan bas", zh: "火车与巴士通勤", products: ["shopee-my-goojodoq-mini-fan-display", "shopee-my-ugreen-magnetic-power-bank-10000mah", "shopee-my-beone-mobile-prepaid-5g"] },
  { key: "marketplace-budget", category: "Budget Shopee gadgets", en: "budget Shopee gadget shopping", ms: "membeli gajet Shopee bajet", zh: "Shopee 平价小工具选购", products: ["shopee-my-goojodoq-mini-fan-display", "shopee-my-goojodoq-gfs001-handheld-fan", "shopee-my-motorcycle-bluetooth-intercom-c1-c2"] },
  { key: "under-rm100", category: "Gadgets under RM100", en: "gadgets under RM100", ms: "gajet bawah RM100", zh: "RM100 以下小工具", products: ["shopee-my-ugreen-magnetic-power-bank-10000mah", "shopee-my-goojodoq-gfs001-handheld-fan", "shopee-my-motorcycle-bluetooth-intercom-c1-c2"] },
  { key: "office-hotdesk", category: "Office desk accessories", en: "hot desk office days", ms: "hari bekerja di meja panas", zh: "共享办公桌工作日", products: ["shopee-my-goojodoq-mini-fan-display", "shopee-my-ugreen-magnetic-power-bank-10000mah", "shopee-my-beone-mobile-prepaid-5g"] },
  { key: "power-cut-prep", category: "Power-cut preparedness gear", en: "short power-cut preparation", ms: "persediaan gangguan elektrik singkat", zh: "短暂停电准备", products: ["shopee-my-ugreen-magnetic-power-bank-10000mah", "shopee-my-goojodoq-gfs001-handheld-fan", "shopee-my-halo-telco-full-hotspot"] },
  { key: "family-day-out", category: "Family day-out gear", en: "family day trips", ms: "perjalanan sehari bersama keluarga", zh: "家庭一日游", products: ["shopee-my-goojodoq-gfs001-handheld-fan", "shopee-my-ugreen-magnetic-power-bank-10000mah", "shopee-my-dji-osmo-pocket-3"] },
  { key: "beach-island-trip", category: "Beach and island trip gear", en: "beach and island trips", ms: "perjalanan pantai dan pulau", zh: "海边与海岛旅行", products: ["shopee-my-goojodoq-gfs001-handheld-fan", "shopee-my-ugreen-magnetic-power-bank-10000mah", "shopee-my-dji-osmo-pocket-3"] },
  { key: "concert-queue", category: "Concert queue essentials", en: "concert queues", ms: "beratur untuk konsert", zh: "演唱会排队", products: ["shopee-my-goojodoq-mini-fan-display", "shopee-my-ugreen-magnetic-power-bank-10000mah", "shopee-my-halo-telco-full-hotspot"] },
  { key: "night-market", category: "Night market essentials", en: "night market walks", ms: "jalan-jalan pasar malam", zh: "夜市逛街", products: ["shopee-my-goojodoq-mini-fan-display", "shopee-my-ugreen-magnetic-power-bank-10000mah", "shopee-my-eastel-prepaid-ultra-5g"] },
  { key: "remote-field-work", category: "Remote field-work gear", en: "remote field work", ms: "kerja lapangan jauh", zh: "远程外勤工作", products: ["shopee-my-ugreen-magnetic-power-bank-10000mah", "shopee-my-eastel-prepaid-ultra-5g", "shopee-my-beone-mobile-prepaid-5g"] },
  { key: "prepaid-data-choice", category: "Malaysia prepaid data", en: "choosing prepaid mobile data", ms: "memilih data prabayar", zh: "选择预付移动数据", products: ["shopee-my-eastel-prepaid-ultra-5g", "shopee-my-beone-mobile-prepaid-5g", "shopee-my-halo-telco-full-hotspot"] },
  { key: "hotspot-backup", category: "Hotspot backup options", en: "mobile hotspot backup", ms: "sandaran hotspot mudah alih", zh: "移动热点备用方案", products: ["shopee-my-eastel-prepaid-ultra-5g", "shopee-my-beone-mobile-prepaid-5g", "shopee-my-halo-telco-full-hotspot"] },
  { key: "new-sim-checklist", category: "New SIM buying checks", en: "buying a new prepaid SIM", ms: "membeli SIM prabayar baharu", zh: "购买新的预付 SIM 卡", products: ["shopee-my-eastel-prepaid-ultra-5g", "shopee-my-beone-mobile-prepaid-5g", "shopee-my-halo-telco-full-hotspot"] },
  { key: "creator-phone-backup", category: "Creator phone backup gear", en: "creator phone backup", ms: "sandaran telefon pencipta", zh: "创作者手机备用装备", products: ["shopee-my-dji-osmo-pocket-3", "shopee-my-ugreen-magnetic-power-bank-10000mah", "shopee-my-goojodoq-mini-fan-display"] },
  { key: "first-time-motorcycle-kit", category: "First motorcycle accessory kit", en: "first-time motorcycle accessory buying", ms: "membeli aksesori motosikal kali pertama", zh: "首次购买摩托车配件", products: ["shopee-my-motorcycle-bluetooth-intercom-c1-c2", "shopee-my-ugreen-magnetic-power-bank-10000mah", "shopee-my-halo-telco-full-hotspot"] },
  { key: "travel-gift-guide", category: "Useful travel gifts", en: "practical travel gifts", ms: "hadiah travel yang praktikal", zh: "实用旅行礼物", products: ["shopee-my-ugreen-magnetic-power-bank-10000mah", "shopee-my-goojodoq-mini-fan-display", "shopee-my-dji-osmo-pocket-3"] },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function requiredProduct(id: string) {
  const product = products.get(id);
  if (!product) throw new Error(`Missing active catalog product: ${id}`);
  return product;
}

function offer(productId: string, scenario: Scenario) {
  const product = requiredProduct(productId);
  const productName = names[productId as keyof typeof names];
  const additionalSources = productId === "shopee-my-goojodoq-gfs001-handheld-fan"
    ? [
        { label: "GOOJODOQ GFS001 official product page", url: "https://www.goojodoqglobal.com/product/goojodoq-gfs001-portable-handheld-fan/" },
        { label: "GOOJODOQ GFS001 official manual", url: "https://manual.goojodoqglobal.com/English/High-Speed-Fan/182.html" },
      ]
    : [];
  const base = {
    id: `${scenario.key}-${product.id}`,
    merchantName: product.merchantName,
    anchorText: productName.en,
    destinationUrl: product.productUrl,
    trackingUrl: product.affiliateUrl,
    imageUrl: product.imageUrl,
    imageLinkUrl: product.imageLinkUrl,
    sourceUrls: [...product.sourceUrls, ...additionalSources],
    rel: "sponsored nofollow noopener noreferrer",
    target: "_blank",
    ctaTextEn: "Check current price",
    ctaTextMs: "Semak harga terkini",
    ctaTextZhHans: "查看最新价格",
    summary: `The supplied Shopee Malaysia listing for ${productName.en}. Confirm the selected variation, current price, seller terms, and whether it fits ${scenario.en} before checkout.`,
    bestFor: `Buyers considering ${scenario.en} who need to verify the live listing before payment.`,
    notFor: "Buyers who need unverified specifications, fixed pricing, or a guaranteed stock position.",
    priceBand: `${product.price} displayed on ${product.verificationDate}`,
    displayedPrice: product.price,
    pricingSummary: `${product.price} was recorded from the supplied listing on ${product.verificationDate}. Marketplace pricing, selected variants, vouchers, and availability can change.`,
    commissionRate: product.commissionRate,
    commissionSnapshot: product.commissionSnapshot,
    verifiedAt: product.verificationDate,
    pros: [
      "Direct access to the supplied Shopee Malaysia listing",
      `Recorded marketplace price snapshot: ${product.price}`,
    ],
    cons: [
      "Price, variant, seller terms, and availability can change",
      "Listing information should be verified before checkout",
    ],
    score: 0,
    isActive: true,
    localizedContent: {
      ms: {
        anchorText: productName.ms,
        summary: `Listing Shopee Malaysia yang dibekalkan untuk ${productName.ms}. Sahkan variasi dipilih, harga semasa, terma penjual dan kesesuaian untuk ${scenario.ms} sebelum checkout.`,
        bestFor: `Pembeli yang mempertimbangkan ${scenario.ms} dan sanggup menyemak listing live sebelum membayar.`,
        notFor: "Pembeli yang memerlukan spesifikasi belum disahkan, harga tetap atau jaminan stok.",
        priceBand: `${product.price} dipaparkan pada ${product.verificationDate}`,
        pricingSummary: `${product.price} direkodkan daripada listing yang dibekalkan pada ${product.verificationDate}. Harga marketplace, variasi, voucher dan stok boleh berubah.`,
        pros: ["Akses terus kepada listing Shopee Malaysia yang dibekalkan", `Snapshot harga marketplace: ${product.price}`],
        cons: ["Harga, variasi, terma penjual dan stok boleh berubah", "Maklumat listing perlu disahkan sebelum checkout"],
      },
      "zh-Hans": {
        anchorText: productName.zh,
        summary: `所提供的 ${productName.zh} Shopee Malaysia 商品页。付款前请确认所选版本、实时价格、卖家条款，以及它是否适合${scenario.zh}。`,
        bestFor: `考虑${scenario.zh}并愿意在付款前核对实时商品页的买家。`,
        notFor: "需要未经核实规格、固定价格或库存保证的买家。",
        priceBand: `${product.verificationDate} 显示 ${product.price}`,
        pricingSummary: `${product.price} 是所提供商品页在 ${product.verificationDate} 的记录。平台价格、版本、优惠券与库存都可能变化。`,
        pros: ["可直接打开所提供的 Shopee Malaysia 商品页", `已记录的平台价格：${product.price}`],
        cons: ["价格、版本、卖家条款和库存可能变化", "付款前必须核对商品页信息"],
      },
    },
  };

  return base;
}

function productList(locale: "en" | "ms" | "zh", productIds: string[]) {
  const labels = productIds.map((id) => names[id as keyof typeof names][locale]);
  if (labels.length === 1) return labels[0];
  if (locale === "zh") return labels.join("、");
  return `${labels.slice(0, -1).join(", ")} and ${labels.at(-1)}`;
}

const research: Record<string, Record<"en" | "ms" | "zh", string>> = {
  "shopee-my-dji-osmo-pocket-3": {
    en: "DJI documents a 1-inch CMOS camera, 20 mm-equivalent f/2.0 lens, three-axis mechanical gimbal, three built-in microphones, no built-in storage, and microSD support up to 1 TB. It is not waterproof; activation requires DJI Mimo. DJI's 166-minute runtime reference used 1080p/24, Wi-Fi off, screen off, and 25 C laboratory conditions, so it is not a promise of real-world runtime.",
    ms: "DJI mendokumenkan kamera CMOS 1 inci, lensa setara 20 mm f/2.0, gimbal mekanikal tiga paksi, tiga mikrofon terbina dalam, tiada storan terbina dalam dan sokongan microSD sehingga 1 TB. Ia tidak kalis air dan pengaktifan memerlukan DJI Mimo. Rujukan 166 minit DJI menggunakan 1080p/24, Wi-Fi serta skrin dimatikan pada 25 C dalam keadaan makmal.",
    zh: "DJI 资料列出 1 英寸 CMOS、等效 20mm f/2.0 镜头、三轴机械云台、三颗内置麦克风、没有内置存储，以及最高 1TB microSD 支持。它不防水，激活需要 DJI Mimo。DJI 的 166 分钟续航数据来自 25 C、1080p/24、关闭 Wi-Fi 与屏幕的实验条件，并不等于实际续航保证。",
  },
  "shopee-my-ugreen-magnetic-power-bank-10000mah": {
    en: "The supplied listing identifies a UGREEN magnetic wireless 10000mAh power bank, but it does not expose a model or enough specification data to verify charging wattage, Qi2 support, ports, dimensions, or phone compatibility. Treat the listing as a lead to verify, not as proof of those details.",
    ms: "Listing dibekalkan mengenal pasti power bank magnetik tanpa wayar UGREEN 10000mAh, tetapi tidak memaparkan model atau spesifikasi mencukupi untuk mengesahkan watt pengecasan, Qi2, port, dimensi atau keserasian telefon. Gunakan listing sebagai titik semakan, bukan bukti butiran tersebut.",
    zh: "所提供商品页标示为 UGREEN 磁吸无线 10000mAh 充电宝，但没有型号或足够规格可核实充电功率、Qi2、接口、尺寸或手机兼容性。应把商品页当作进一步核对的起点，而不是这些细节的证明。",
  },
  "shopee-my-goojodoq-gfs001-handheld-fan": {
    en: "GOOJODOQ's product page and manual identify the GFS001 as a 4.5W, 4000mAh, Type-C rechargeable handheld fan with 100 adjustable levels and a digital display. The manual lists 1.93 to 8.23 hours of operation and about 2.5 hours charging, but official product and manual pages conflict on dimensions and weight, so those physical figures are omitted here.",
    ms: "Halaman produk dan manual GOOJODOQ mengenal pasti GFS001 sebagai kipas tangan 4.5W, 4000mAh, boleh dicas Type-C dengan 100 tahap boleh laras dan paparan digital. Manual menyenaraikan 1.93 hingga 8.23 jam penggunaan serta kira-kira 2.5 jam pengecasan, tetapi halaman rasmi dan manual bercanggah tentang dimensi serta berat.",
    zh: "GOOJODOQ 产品页与说明书将 GFS001 列为 4.5W、4000mAh、Type-C 充电、100 档可调并带数码显示的手持风扇。说明书列出约 1.93 至 8.23 小时使用时间和约 2.5 小时充电时间，但官方产品页与说明书的尺寸和重量互相矛盾，因此本页不采用这些物理数据。",
  },
  "shopee-my-goojodoq-mini-fan-display": {
    en: "For the unnamed GOOJODOQ mini fan, the available catalog supports only that it is a mini high-speed handheld fan with a display. No matching model number was supplied, so battery capacity, speed count, runtime, charging time, weight, and noise claims remain unverified.",
    ms: "Untuk kipas mini GOOJODOQ tanpa model yang dinamakan, katalog hanya menyokong bahawa ia kipas tangan mini berkelajuan tinggi dengan paparan. Tiada nombor model sepadan dibekalkan, jadi kapasiti bateri, tahap kelajuan, masa penggunaan, masa cas, berat dan bunyi belum disahkan.",
    zh: "对于没有型号的 GOOJODOQ 迷你风扇，现有目录只能确认它是带显示屏的迷你高速手持风扇。没有提供可对应的型号，因此电池容量、档位、续航、充电时间、重量和噪音都尚未核实。",
  },
  "shopee-my-eastel-prepaid-ultra-5g": {
    en: "Eastel says it is an MVNO using U Mobile infrastructure. Its published plans include EZ15 at RM15 for 30GB over 15 days, EZ35 at RM35 for 200GB plus 100GB hotspot over 30 days, and EZ50/68/98 monthly plans. Registration and successful verification are required before activation; the RM9.96 marketplace snapshot is not proof of an included plan or reload credit.",
    ms: "Eastel menyatakan ia MVNO menggunakan infrastruktur U Mobile. Pelan diterbitkan termasuk EZ15 RM15 untuk 30GB selama 15 hari, EZ35 RM35 untuk 200GB serta 100GB hotspot selama 30 hari, dan pelan bulanan EZ50/68/98. Pendaftaran dan pengesahan berjaya diperlukan sebelum aktif; snapshot marketplace RM9.96 bukan bukti pelan atau kredit reload disertakan.",
    zh: "Eastel 表示自己是使用 U Mobile 基础设施的 MVNO。已发布的配套包括 RM15 的 EZ15（15 天 30GB）、RM35 的 EZ35（30 天 200GB 加 100GB 热点）以及 EZ50/68/98 月配套。激活前必须完成注册和验证；RM9.96 的平台价格记录并不表示含有配套或充值额。",
  },
  "shopee-my-beone-mobile-prepaid-5g": {
    en: "BeONE describes itself as powered by Maxis, which does not prove identical retail-plan priority or performance. Its FUP table lists daily 3GB, weekly 15GB, 100GB plus 10GB hotspot for ULTRA plus 25, and 200GB plus 50GB hotspot for ULTRA plus 35; after main quota it states 512kbps, while hotspot exhaustion may restrict tethering. Verify the selected plan label in the app or listing.",
    ms: "BeONE menyatakan ia dikuasakan Maxis, tetapi ini tidak membuktikan prioriti atau prestasi sama seperti pelan runcit Maxis. Jadual FUP menyenaraikan 3GB harian, 15GB mingguan, 100GB dan 10GB hotspot untuk ULTRA plus 25, serta 200GB dan 50GB hotspot untuk ULTRA plus 35; selepas kuota utama ia menyatakan 512kbps. Sahkan label pelan dalam aplikasi atau listing.",
    zh: "BeONE 表示自己由 Maxis 支持，但这并不证明与 Maxis 零售配套拥有相同优先级或表现。其 FUP 表列出每日 3GB、每周 15GB、ULTRA plus 25 的 100GB 加 10GB 热点，以及 ULTRA plus 35 的 200GB 加 50GB 热点；主流量用尽后标示为 512kbps。请在应用或商品页核对所选配套名称。",
  },
  "shopee-my-halo-telco-full-hotspot": {
    en: "Halo's terms say Tune Talk supplies the mobile service as a co-branded product with Winner Venture. A registered SIM must be activated in Malaysia within 14 days by reload, call, or SMS. The text terms do not publish a numerical hotspot pool, post-quota speed, or FUP threshold for the image-led EPIK cards, so do not infer those details from a listing title or the RM4.96 snapshot.",
    ms: "Terma Halo menyatakan Tune Talk membekalkan perkhidmatan mudah alih sebagai produk berjenama bersama Winner Venture. SIM berdaftar mesti diaktifkan di Malaysia dalam 14 hari melalui reload, panggilan atau SMS. Terma teks tidak menerbitkan kuota hotspot bernombor, kelajuan selepas kuota atau ambang FUP untuk kad EPIK berasaskan imej, jadi jangan andaikan butiran itu daripada tajuk listing atau snapshot RM4.96.",
    zh: "Halo 条款说明移动服务由 Tune Talk 以与 Winner Venture 联名的方式提供。已注册 SIM 必须在马来西亚于 14 天内通过充值、通话或短信激活。文字条款没有为图片式 EPIK 卡公布数值热点额度、限额后速度或 FUP 门槛，因此不要从商品标题或 RM4.96 价格记录推断这些信息。",
  },
  "shopee-my-motorcycle-bluetooth-intercom-c1-c2": {
    en: "The catalog supports only that this is a C1/C2 motorcycle Bluetooth intercom headset. It does not identify a manufacturer or verify Bluetooth version, range, waterproof rating, battery life, pairing count, helmet compatibility, certification, or warranty. Confirm all of those from the selected listing before relying on it for a ride.",
    ms: "Katalog hanya menyokong bahawa ini ialah headset interkom Bluetooth motosikal C1/C2. Ia tidak mengenal pasti pengeluar atau mengesahkan versi Bluetooth, jarak, penarafan kalis air, bateri, bilangan pairing, keserasian helmet, pensijilan atau waranti. Sahkan semua perkara itu daripada listing dipilih sebelum menggunakannya untuk tunggangan.",
    zh: "目录只能确认这是一款 C1/C2 摩托车蓝牙对讲耳机。它没有标明制造商，也没有核实蓝牙版本、距离、防水等级、续航、配对数量、头盔兼容性、认证或保修。骑行前请在所选商品页确认这些内容。",
  },
};

function researchParagraph(locale: "en" | "ms" | "zh", productIds: string[]) {
  return productIds.map((id) => research[id][locale]).join(" ");
}

function relatedLinks(locale: "en" | "ms" | "zh", scenario: Scenario) {
  const index = scenarios.findIndex((candidate) => candidate.key === scenario.key);
  const related = [scenarios[(index + 1) % scenarios.length], scenarios[(index + 7) % scenarios.length]];
  const suffix = locale === "en" ? "" : locale === "ms" ? "-my" : "-zh";
  const prefix = locale === "en" ? "/en" : locale === "ms" ? "/my" : "/zh";
  const labels = locale === "en" ? ["related buyer guide", "another Malaysia checklist"] : locale === "ms" ? ["panduan pembeli berkaitan", "senarai semak Malaysia lain"] : ["相关购买指南", "另一份马来西亚检查清单"];
  return related.map((item, position) => `[${labels[position]}](${prefix}/blog/${item.key}-guide-malaysia${suffix})`).join(" and ");
}

function buildPage(scenario: Scenario, variant: number) {
  const selectedIds = variant === 0 ? scenario.products.slice(0, 1) : variant === 1 ? scenario.products.slice(0, 2) : scenario.products;
  const enProducts = productList("en", selectedIds);
  const msProducts = productList("ms", selectedIds);
  const zhProducts = productList("zh", selectedIds);
  const pattern = ["guide", "comparison", "bundle", "checklist"][variant];
  const englishSlug = slugify(`${scenario.key}-${pattern}-malaysia`);
  const msSlug = slugify(`${scenario.key}-${pattern}-malaysia-my`);
  const zhSlug = slugify(`${scenario.key}-${pattern}-malaysia-zh`);
  const imageProduct = selectedIds.map((id) => requiredProduct(id)).find((product) => product.imageUrl);
  const imageUrl = imageProduct?.imageUrl || "";
  const imageName = imageProduct ? names[imageProduct.id as keyof typeof names] : null;

  const enTitle = variant === 0
    ? `Best ${enProducts} Guide for ${scenario.en} in Malaysia`
    : variant === 1
      ? `${enProducts}: What Fits ${scenario.en} in Malaysia?`
      : variant === 2
        ? `Best ${scenario.category} Bundle for ${scenario.en} in Malaysia`
        : `${scenario.category} Buying Checklist for ${scenario.en} in Malaysia`;
  const msTitle = variant === 0
    ? `Panduan ${msProducts} untuk ${scenario.ms} di Malaysia`
    : variant === 1
      ? `${msProducts}: Mana Sesuai untuk ${scenario.ms} di Malaysia?`
      : variant === 2
        ? `Bundle ${scenario.category} untuk ${scenario.ms} di Malaysia`
        : `Senarai Semak ${scenario.category} untuk ${scenario.ms} di Malaysia`;
  const zhTitle = variant === 0
    ? `马来西亚${scenario.zh}的${zhProducts}购买指南`
    : variant === 1
      ? `${zhProducts}：马来西亚${scenario.zh}该怎么选？`
      : variant === 2
        ? `马来西亚${scenario.zh}的${scenario.category}组合指南`
        : `马来西亚${scenario.zh}的${scenario.category}购买清单`;

  const enDescription = `Compare ${enProducts} for ${scenario.en} in Malaysia. Review the supplied Shopee listings, dated price snapshots, practical fit, and checks to make before checkout.`;
  const msDescription = `Bandingkan ${msProducts} untuk ${scenario.ms} di Malaysia. Semak listing Shopee dibekalkan, snapshot harga bertarikh, kesesuaian praktikal dan perkara yang perlu disahkan sebelum checkout.`;
  const zhDescription = `比较适合马来西亚${scenario.zh}的${zhProducts}。查看所提供的 Shopee 商品页、带日期的价格记录、实际适配情况，以及付款前要核对的事项。`;
  const priceSummaryEn = selectedIds.map((id) => `${names[id as keyof typeof names].en}: ${requiredProduct(id).price}`).join("; ");
  const priceSummaryMs = selectedIds.map((id) => `${names[id as keyof typeof names].ms}: ${requiredProduct(id).price}`).join("；");
  const priceSummaryZh = selectedIds.map((id) => `${names[id as keyof typeof names].zh}：${requiredProduct(id).price}`).join("；");
  const researchEn = researchParagraph("en", selectedIds);
  const researchMs = researchParagraph("ms", selectedIds);
  const researchZh = researchParagraph("zh", selectedIds);
  const relatedEn = relatedLinks("en", scenario);
  const relatedMs = relatedLinks("ms", scenario);
  const relatedZh = relatedLinks("zh", scenario);

  return {
    slug: englishSlug,
    status: "draft",
    pageConfig: {
      templateKey: variant === 1 ? "x-vs-y" : "best-x-for-y-in-z",
      category: scenario.category,
      useCase: scenario.en,
      market: "Malaysia",
      primaryKeyword: enTitle,
      disclosure: "This page contains affiliate links. If you buy through them, we may earn a commission at no extra cost to you. Product inclusion and editorial guidance are based on the stated buyer scenario and documented listing information, not commission rate.",
    },
    translations: [
      {
        locale: "en",
        title: enTitle,
        slug: englishSlug,
        metaTitle: enTitle,
        metaDescription: enDescription,
        quickAnswer: `There is no automatic winner for ${scenario.en}. Start with the need you are solving, then compare the live listing, selected variation, and price. The supplied price snapshots were ${priceSummaryEn}; they can change.`,
        heroImageUrl: imageUrl,
        keyTakeaways: [
          `Use the listing only after confirming it fits ${scenario.en}.`,
          `Recorded price snapshots: ${priceSummaryEn}.`,
          "Confirm the selected variation, seller terms, compatibility, and availability at checkout.",
        ],
        sections: [
          { id: `${englishSlug}-en-fit`, sectionTitle: `What matters for ${scenario.en}`, sectionImageUrl: imageUrl, sectionBody: `The useful choice depends on the actual job, not a marketplace title alone. For ${scenario.en}, compare the role each item plays, whether it creates a real gap in your current setup, and whether the listed variation is the one you intended to buy. ${imageName ? `${imageName.en} is the only selected item with a verified image in the current catalog; items without a verified image are intentionally shown without one.` : "The current catalog has no verified image for this combination, so this page intentionally omits product imagery rather than substituting an unrelated asset."}` },
          { id: `${englishSlug}-en-evidence`, sectionTitle: "What the published evidence supports", sectionImageUrl: "", sectionBody: researchEn },
          { id: `${englishSlug}-en-compare`, sectionTitle: "Compare the listing, not assumptions", sectionImageUrl: "", sectionBody: `The supplied listings identify products that may be relevant, but they do not establish a permanent price, stock level, warranty outcome, or full technical specification. Compare ${enProducts} against your own requirements, then confirm the seller, selected variation, included accessories or plan, and return conditions before payment.` },
          { id: `${englishSlug}-en-checkout`, sectionTitle: "Malaysia checkout checks", sectionImageUrl: "", sectionBody: "Before buying, confirm the final payable amount, variation name, shipping destination, seller identity, and any compatibility or registration requirement. For prepaid SIMs, treat the starter-SIM price separately from an active plan and verify activation, KYC, data, hotspot, validity, and fair-use terms with the operator." },
          { id: `${englishSlug}-en-related`, sectionTitle: "Continue your research", sectionImageUrl: "", sectionBody: `For adjacent decisions, read our ${relatedEn}. They use the same affiliate-disclosure and evidence limits, but apply them to a different buyer situation.` },
        ],
        faqItems: [
          { id: `${englishSlug}-en-faq-1`, question: `Which option should I choose for ${scenario.en}?`, answer: `Choose the item that solves the first real constraint in your setup. Review the live listing and do not treat the dated price snapshot as a guarantee.` },
          { id: `${englishSlug}-en-faq-2`, question: "What should I verify before checkout?", answer: "Verify the selected variation, final price, seller terms, compatibility, shipping, and any local registration or activation requirement. Marketplace terms can change." },
        ],
        body: `## Affiliate disclosure\nThis page contains affiliate links. If you buy through them, we may earn a commission at no extra cost to you.\n\n## Method and evidence\nWe reviewed the supplied Shopee Malaysia listing data and the linked primary sources where the exact product or operator was identifiable. ${researchEn}\n\n## Limits of this guide\nWe did not perform hands-on testing and do not claim measured performance, reliability, coverage, battery life, cooling output, audio quality, or warranty outcomes. A listing snapshot is not proof of a permanent price, included plan, seller authorisation, or full specification.\n\n## Related reading\nContinue with our ${relatedEn}.\n\n## Bottom line\nFor ${scenario.en}, use this page as a checkout checklist. Compare the live variation and price with your actual need before buying.`,
      },
      {
        locale: "ms",
        title: msTitle,
        slug: msSlug,
        metaTitle: msTitle,
        metaDescription: msDescription,
        quickAnswer: `Tiada pemenang automatik untuk ${scenario.ms}. Mulakan dengan keperluan sebenar, kemudian bandingkan listing live, variasi dipilih dan harga. Snapshot harga dibekalkan ialah ${priceSummaryMs} dan boleh berubah.`,
        heroImageUrl: imageUrl,
        keyTakeaways: [
          `Gunakan listing hanya selepas mengesahkan ia sesuai untuk ${scenario.ms}.`,
          `Snapshot harga direkodkan: ${priceSummaryMs}.`,
          "Sahkan variasi dipilih, terma penjual, keserasian dan stok semasa checkout.",
        ],
        sections: [
          { id: `${englishSlug}-ms-fit`, sectionTitle: `Apa yang penting untuk ${scenario.ms}`, sectionImageUrl: imageUrl, sectionBody: `Pilihan yang berguna bergantung pada kerja sebenar, bukan tajuk marketplace semata-mata. Untuk ${scenario.ms}, bandingkan fungsi setiap item, sama ada ia menyelesaikan kekurangan sebenar dalam setup anda dan sama ada variasi listing adalah yang anda mahu beli. ${imageName ? `${imageName.ms} ialah satu-satunya item dipilih dengan imej disahkan dalam katalog semasa; item tanpa imej disahkan sengaja dipaparkan tanpa imej.` : "Katalog semasa tiada imej disahkan untuk gabungan ini, jadi halaman ini sengaja tidak menggunakan imej produk yang tidak berkaitan."}` },
          { id: `${englishSlug}-ms-evidence`, sectionTitle: "Apa yang disokong oleh bukti diterbitkan", sectionImageUrl: "", sectionBody: researchMs },
          { id: `${englishSlug}-ms-compare`, sectionTitle: "Bandingkan listing, bukan andaian", sectionImageUrl: "", sectionBody: `Listing dibekalkan mengenal pasti produk yang mungkin relevan, tetapi ia tidak membuktikan harga tetap, stok, hasil waranti atau spesifikasi penuh. Bandingkan ${msProducts} dengan keperluan anda, kemudian sahkan penjual, variasi dipilih, aksesori atau pelan disertakan dan syarat pemulangan sebelum membayar.` },
          { id: `${englishSlug}-ms-checkout`, sectionTitle: "Semakan checkout Malaysia", sectionImageUrl: "", sectionBody: "Sebelum membeli, sahkan jumlah akhir, nama variasi, alamat penghantaran, identiti penjual dan sebarang syarat keserasian atau pendaftaran. Untuk SIM prabayar, bezakan harga starter SIM daripada pelan aktif dan semak pengaktifan, KYC, data, hotspot, tempoh sah serta FUP dengan operator." },
          { id: `${englishSlug}-ms-related`, sectionTitle: "Teruskan penyelidikan anda", sectionImageUrl: "", sectionBody: `Untuk keputusan berkaitan, baca ${relatedMs}. Panduan ini menggunakan pendedahan affiliate dan had bukti yang sama, tetapi untuk situasi pembeli berbeza.` },
        ],
        faqItems: [
          { id: `${englishSlug}-ms-faq-1`, question: `Pilihan mana sesuai untuk ${scenario.ms}?`, answer: "Pilih item yang menyelesaikan kekangan sebenar dalam setup anda dahulu. Semak listing live dan jangan anggap snapshot harga bertarikh sebagai jaminan." },
          { id: `${englishSlug}-ms-faq-2`, question: "Apa yang perlu disahkan sebelum checkout?", answer: "Sahkan variasi, harga akhir, terma penjual, keserasian, penghantaran dan syarat pendaftaran atau pengaktifan tempatan. Terma marketplace boleh berubah." },
        ],
        body: `## Pendedahan affiliate\nHalaman ini mengandungi pautan affiliate. Jika anda membeli melaluinya, kami mungkin menerima komisen tanpa kos tambahan.\n\n## Kaedah dan bukti\nKami menyemak data listing Shopee Malaysia yang dibekalkan serta sumber utama yang dipautkan apabila produk atau operator tepat dapat dikenal pasti. ${researchMs}\n\n## Had panduan ini\nKami tidak menjalankan ujian hands-on dan tidak mendakwa mengukur prestasi, kebolehpercayaan, liputan, bateri, penyejukan, audio atau hasil waranti. Snapshot listing bukan bukti harga kekal, pelan disertakan, penjual sah atau spesifikasi penuh.\n\n## Bacaan berkaitan\nTeruskan dengan ${relatedMs}.\n\n## Kesimpulan\nUntuk ${scenario.ms}, gunakan halaman ini sebagai senarai semak checkout. Bandingkan variasi dan harga live dengan keperluan sebenar anda sebelum membeli.`,
      },
      {
        locale: "zh-Hans",
        title: zhTitle,
        slug: zhSlug,
        metaTitle: zhTitle,
        metaDescription: zhDescription,
        quickAnswer: `针对${scenario.zh}没有自动胜出的选择。先确认自己要解决的问题，再比较实时商品页、所选版本与价格。所提供的价格记录为${priceSummaryZh}，这些信息可能变化。`,
        heroImageUrl: imageUrl,
        keyTakeaways: [
          `先确认商品页是否真的适合${scenario.zh}。`,
          `已记录的价格：${priceSummaryZh}。`,
          "结账时确认所选版本、卖家条款、兼容性和库存。",
        ],
        sections: [
          { id: `${englishSlug}-zh-fit`, sectionTitle: `${scenario.zh}要先看什么`, sectionImageUrl: imageUrl, sectionBody: `真正有用的选择取决于实际需求，而不只是平台商品标题。针对${scenario.zh}，应比较每件商品能解决什么问题、它是否补足你现有装备的缺口，以及所选版本是否正确。${imageName ? `${imageName.zh} 是当前目录中唯一有已核实图片的入选商品；没有已核实图片的商品会刻意省略图片。` : "当前目录没有这组商品的已核实图片，因此本页刻意不使用不相关的产品图片。"}` },
          { id: `${englishSlug}-zh-evidence`, sectionTitle: "公开资料能够支持什么", sectionImageUrl: "", sectionBody: researchZh },
          { id: `${englishSlug}-zh-compare`, sectionTitle: "比较商品页，不要凭想象", sectionImageUrl: "", sectionBody: `所提供的商品页能帮助识别可能相关的商品，但并不代表固定价格、库存、保修结果或完整规格。把${zhProducts}与你的真实需求对照，并在付款前确认卖家、所选版本、包含的配件或配套，以及退货条件。` },
          { id: `${englishSlug}-zh-checkout`, sectionTitle: "马来西亚结账前检查", sectionImageUrl: "", sectionBody: "付款前确认最终金额、版本名称、送货地址、卖家身份，以及任何兼容性或注册要求。预付 SIM 卡应把 starter SIM 价格与有效配套分开看，并向运营商确认激活、KYC、数据、热点、有效期和公平使用条款。" },
          { id: `${englishSlug}-zh-related`, sectionTitle: "继续你的研究", sectionImageUrl: "", sectionBody: `如需做相邻决策，请继续阅读${relatedZh}。这些文章采用相同的联盟披露和证据限制，但讨论不同的购买场景。` },
        ],
        faqItems: [
          { id: `${englishSlug}-zh-faq-1`, question: `${scenario.zh}该选哪一个？`, answer: "先选能解决你当前真实限制的商品。查看实时商品页，不要把带日期的价格记录当成保证。" },
          { id: `${englishSlug}-zh-faq-2`, question: "结账前要确认什么？", answer: "确认所选版本、最终价格、卖家条款、兼容性、配送，以及任何本地注册或激活要求。平台条款可能变化。" },
        ],
        body: `## 联盟链接披露\n本页含联盟链接。如果你通过链接购买，我们可能获得佣金，但你不需要支付额外费用。\n\n## 方法与证据\n我们查阅了所提供的 Shopee Malaysia 商品页资料，以及在能够确认准确产品或运营商时附带的主要来源。${researchZh}\n\n## 本文限制\n我们没有进行亲手测试，因此不会声称测得性能、可靠性、网络覆盖、续航、降温效果、音频效果或保修结果。商品页快照不代表固定价格、一定包含的配套、授权卖家或完整规格。\n\n## 相关阅读\n继续阅读${relatedZh}。\n\n## 结论\n针对${scenario.zh}，把本页当作结账检查清单。购买前请把实时版本与价格同你的真实需求比较。`,
      },
    ],
    affiliateLinks: selectedIds.map((id) => offer(id, scenario)),
  };
}

const pages = scenarios.flatMap((scenario) => [0, 1, 2, 3].map((variant) => buildPage(scenario, variant))).slice(0, 98);

if (pages.length !== 98) throw new Error(`Expected 98 pages, generated ${pages.length}`);
if (new Set(pages.flatMap((page) => page.translations.map((translation) => translation.slug))).size !== pages.length * 3) {
  throw new Error("Generated duplicate localized slugs");
}

writeFileSync(outputPath, `${JSON.stringify({ pages }, null, 2)}\n`, "utf8");
console.log(`Generated ${pages.length} topic groups (${pages.length * 3} localized pages) at ${outputPath}`);

if (apply) {
  const contentPath = new URL("../data/pages.json", import.meta.url);
  const existingPages = JSON.parse(readFileSync(contentPath, "utf8")) as Array<Record<string, unknown>>;
  const generatedBySlug = new Map(pages.map((page) => [page.slug, page]));
  const now = new Date().toISOString();
  const nextPages = existingPages.map((page) => {
    const replacement = generatedBySlug.get(String(page.slug));
    return replacement ? { ...page, ...replacement, id: page.id, updatedAt: now } : page;
  });
  const replaced = nextPages.filter((page) => generatedBySlug.has(String(page.slug))).length;
  if (replaced !== pages.length) throw new Error(`Expected to replace ${pages.length} pages, replaced ${replaced}`);
  writeFileSync(contentPath, `${JSON.stringify(nextPages, null, 2)}\n`, "utf8");
  console.log(`Replaced ${replaced} generated topic groups in data/pages.json`);
}
