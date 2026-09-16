/**
 * Deadlock Custom Randomizer & Build Roulette (ES6)
 * Mod for Deadlock Panorama UI
 * 
 * Features:
 * - Configurable hero pool selection with 38 heroes.
 * - Accurate Deadlock official Russian localizations (Леди Гейст, Пелена, Вязкус, Аполлон, Дрём).
 * - Vertical roster-style portraits for all heroes (_vertical_psd.vtex).
 * - Sleek, compact hero cards with enlarged font and clean square checkbox.
 * - Deadlock emerald brand green visual theme (#5fe69e).
 * - Build roulette: Gun / Spirit / Melee (equal 33.3% odds) with official in-game textures.
 * - Language switcher [RU] / [ENG] independent of game client language.
 * - Buttons attached directly inside RandomHeroCard without displacing roster layout or causing scroll.
 * - Intercepts standard '?' click to trigger the custom randomizer.
 * - Automatically finds and selects the rolled hero in the game's roster with MAX priority.
 * - Balanced centered roulette footer with "ЕЩЁ РАЗ" and "ПРИНЯТЬ И ЗАКРЫТЬ".
 * - Detailed in-game console logging via $.Msg / $.Warning.
 */

(() => {
    'use strict';

    // ---------------------------------------------------------------------------
    // LOGGING UTILITIES (In-game console output)
    // ---------------------------------------------------------------------------
    const log = (...args) => {
        const str = args.map(a => {
            if (a === null) return "null";
            if (a === undefined) return "undefined";
            if (typeof a === "object") {
                try { return JSON.stringify(a); } catch (e) { return String(a); }
            }
            return String(a);
        }).join(" ");
        try {
            $.Msg("[Deadlock-Randomizer] " + str);
        } catch (e) {}
    };

    const logWarn = (...args) => {
        const str = args.map(a => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ");
        try {
            $.Warning("[Deadlock-Randomizer WARN] " + str);
        } catch (e) {}
    };

    log(">>> Custom Randomizer script loaded! <<<");

    // ---------------------------------------------------------------------------
    // HEROES DATABASE (All 38 Heroes with accurate Russian localization)
    // ---------------------------------------------------------------------------
    const HEROES_DATA = [
        { id: "abrams", heroId: 6, name: "Abrams", ru: "Абрамс", token: "#hero_atlas", icon: "bull", released: true },
        { id: "bebop", heroId: 15, name: "Bebop", ru: "Бибоп", token: "#hero_bebop", icon: "bebop", released: true },
        { id: "dynamo", heroId: 11, name: "Dynamo", ru: "Динамо", token: "#hero_dynamo", icon: "sumo", released: true },
        { id: "grey_talon", heroId: 17, name: "Grey Talon", ru: "Серый Коготь", token: "#hero_orion", icon: "archer", released: true },
        { id: "haze", heroId: 13, name: "Haze", ru: "Пелена", token: "#hero_haze", icon: "haze", released: true },
        { id: "holliday", heroId: 14, name: "Holliday", ru: "Холлидей", token: "#hero_astro", icon: "astro", released: true },
        { id: "infernus", heroId: 1, name: "Infernus", ru: "Инфернус", token: "#hero_inferno", icon: "inferno", released: true },
        { id: "ivy", heroId: 20, name: "Ivy", ru: "Айви", token: "#hero_tengu", icon: "tengu", released: true },
        { id: "kelvin", heroId: 12, name: "Kelvin", ru: "Кельвин", token: "#hero_kelvin", icon: "kelvin", released: true },
        { id: "lady_geist", heroId: 4, name: "Lady Geist", ru: "Леди Гейст", token: "#hero_ghost", icon: "spectre", released: true },
        { id: "lash", heroId: 31, name: "Lash", ru: "Хлыст", token: "#hero_lash", icon: "lash", released: true },
        { id: "mcginnis", heroId: 8, name: "McGinnis", ru: "Макгиннис", token: "#hero_forge", icon: "engineer", released: true },
        { id: "mirage", heroId: 52, name: "Mirage", ru: "Мираж", token: "#hero_mirage", icon: "mirage", released: true },
        { id: "mo_and_krill", heroId: 18, name: "Mo & Krill", ru: "Мо и Крил", token: "#hero_krill", icon: "digger", released: true },
        { id: "paradox", heroId: 10, name: "Paradox", ru: "Парадокс", token: "#hero_chrono", icon: "chrono", released: true },
        { id: "pocket", heroId: 50, name: "Pocket", ru: "Карман", token: "#hero_synth", icon: "synth", released: true },
        { id: "seven", heroId: 2, name: "Seven", ru: "Семь", token: "#hero_gigawatt", icon: "gigawatt", released: true },
        { id: "shiv", heroId: 19, name: "Shiv", ru: "Шив", token: "#hero_shiv", icon: "shiv", released: true },
        { id: "vindicta", heroId: 3, name: "Vindicta", ru: "Виндикта", token: "#hero_hornet", icon: "hornet", released: true },
        { id: "viscous", heroId: 35, name: "Viscous", ru: "Вязкус", token: "#hero_viscous", icon: "viscous", released: true },
        { id: "warden", heroId: 25, name: "Warden", ru: "Страж", token: "#hero_warden", icon: "warden", released: true },
        { id: "wraith", heroId: 7, name: "Wraith", ru: "Призрак", token: "#hero_wraith", icon: "wraith", released: true },
        { id: "yamato", heroId: 27, name: "Yamato", ru: "Ямато", token: "#hero_yamato", icon: "yamato", released: true },
        { id: "calico", heroId: 16, name: "Calico", ru: "Калико", token: "#hero_nano", icon: "nano", released: true },
        { id: "vyper", heroId: 21, name: "Vyper", ru: "Вайпер", token: "#hero_kali", icon: "kali", cardClass: "hero_viper", released: true },
        { id: "sinclair", heroId: 60, name: "Sinclair", ru: "Синклер", token: "#hero_magician", icon: "magician", released: true },
        { id: "apollo", heroId: 77, name: "Apollo", ru: "Аполлон", token: "#hero_fencer", icon: "fencer", released: true },
        { id: "billy", heroId: 72, name: "Billy", ru: "Билли", token: "#hero_punkgoat", icon: "punkgoat", released: true },
        { id: "celeste", heroId: 81, name: "Celeste", ru: "Селеста", token: "#hero_unicorn", icon: "unicorn", released: true },
        { id: "drifter", heroId: 64, name: "Drifter", ru: "Дрифтер", token: "#hero_drifter", icon: "drifter", released: true },
        { id: "graves", heroId: 76, name: "Graves", ru: "Грейвс", token: "#hero_necro", icon: "necro", released: true },
        { id: "mina", heroId: 63, name: "Mina", ru: "Мина", token: "#hero_vampirebat", icon: "vampirebat", released: true },
        { id: "paige", heroId: 67, name: "Paige", ru: "Пейдж", token: "#hero_bookworm", icon: "bookworm", released: true },
        { id: "rem", heroId: 79, name: "Rem", ru: "Дрём", token: "#hero_familiar", icon: "familiar", released: true },
        { id: "silver", heroId: 80, name: "Silver", ru: "Сильвер", token: "#hero_werewolf", icon: "werewolf", released: true },
        { id: "the_doorman", heroId: 69, name: "The Doorman", ru: "Швейцар", token: "#hero_doorman", icon: "doorman", released: true },
        { id: "venator", heroId: 65, name: "Venator", ru: "Венатор", token: "#hero_priest", icon: "priest", released: true },
        { id: "victor", heroId: 66, name: "Victor", ru: "Виктор", token: "#hero_frank", icon: "frank", released: true }
    ];

    // ---------------------------------------------------------------------------
    // BUILDS DEFINITIONS (Gun / Spirit / Melee with official Deadlock VPK textures)
    // ---------------------------------------------------------------------------
    const BUILDS = [
        {
            id: "gun",
            name: "GUN",
            ruName: "ОРУЖИЕ (GUN)",
            enName: "WEAPON (GUN)",
            color: "#f59e0b",
            glowColor: "rgba(245, 158, 11, 0.6)",
            iconPath: "s2r://panorama/images/shop/catalog/catalog_shop_tab_icon_weapon_psd.vtex"
        },
        {
            id: "spirit",
            name: "SPIRIT",
            ruName: "СПИРИТ (SPIRIT)",
            enName: "SPIRIT",
            color: "#a855f7",
            glowColor: "rgba(168, 85, 247, 0.6)",
            iconPath: "s2r://panorama/images/shop/catalog/catalog_shop_tab_icon_spirit_psd.vtex"
        },
        {
            id: "melee",
            name: "MELEE",
            ruName: "БЛИЖНИЙ БОЙ (MELEE)",
            enName: "MELEE",
            color: "#10b981",
            glowColor: "rgba(16, 185, 129, 0.6)",
            iconPath: "s2r://panorama/images/upgrades/mods_armor/melee_damage_psd.vtex"
        }
    ];

    // ---------------------------------------------------------------------------
    // LOCALIZATION DICTIONARY (RU / ENG)
    // ---------------------------------------------------------------------------
    const I18N = {
        ru: {
            rosterSpinBtn: "РУЛЕТКА",
            rosterSpinTooltipTitle: "Случайный ростер из 3 героев",
            rosterSpinTooltipDesc: "Крутить 3 рулетки героев и билдов с автовыбором приоритетов",
            rosterSettingsTooltipTitle: "Настройки рандомайзера",
            rosterSettingsTooltipDesc: "Выбрать пул героев для случайного выбора",
            settingsTitle: "НАСТРОЙКА РАНДОМАЙЗЕРА ГЕРОЕВ",
            settingsSubtitle: "Выберите пул героев для случайного выбора и рулетки билда",
            btnSelectAll: (count) => `Выбрать всех (${count})`,
            btnDeselectAll: "Снять всех",
            searchPlaceholder: "Поиск героя...",
            selectedCount: (selected, total) => `Выбрано: ${selected} / ${total}`,
            errMinHeroes: "Выберите минимум 3 героев для рулетки!",
            errMinHeroesShort: "минимум 3",
            btnSpinNow: "КРУТИТЬ РУЛЕТКУ СЕЙЧАС",
            btnDone: "Готово",
            rouletteTitle: "🎰 РУЛЕТКА РОСТЕРА: 3 ГЕРОЯ И БИЛДЫ",
            priorityHighBadge: "▲ ВЫСОКИЙ ПРИОРИТЕТ",
            priorityMedBadge: "▲ ПРИОРИТЕТ",
            priorityLowBadge: "● СТАНДАРТНЫЙ",
            slotHeroHeader: "1. ВЫБОР ГЕРОЯ",
            slotBuildHeader: "2. РУЛЕТКА БИЛДА",
            heroRandomPlaceholder: "Случайный герой...",
            heroSelectingPlaceholder: "Выбираем...",
            btnSpinAgain: "ЕЩЁ РАЗ",
            btnAcceptClose: "ПРИНЯТЬ И ЗАКРЫТЬ"
        },
        en: {
            rosterSpinBtn: "ROULETTE",
            rosterSpinTooltipTitle: "Random 3-Hero Roster",
            rosterSpinTooltipDesc: "Spin 3 hero & build roulettes with auto priorities",
            rosterSettingsTooltipTitle: "Randomizer Settings",
            rosterSettingsTooltipDesc: "Select hero pool for randomizer",
            settingsTitle: "HERO RANDOMIZER SETTINGS",
            settingsSubtitle: "Select hero pool for random roll and build roulette",
            btnSelectAll: (count) => `Select All (${count})`,
            btnDeselectAll: "Deselect All",
            searchPlaceholder: "Search hero...",
            selectedCount: (selected, total) => `Selected: ${selected} / ${total}`,
            errMinHeroes: "Please select at least 3 heroes!",
            errMinHeroesShort: "min. 3 required",
            btnSpinNow: "SPIN ROULETTE NOW",
            btnDone: "Done",
            rouletteTitle: "🎰 ROSTER ROULETTE: 3 HEROES & BUILDS",
            priorityHighBadge: "▲ HIGH PRIORITY",
            priorityMedBadge: "▲ PRIORITY",
            priorityLowBadge: "● STANDARD",
            slotHeroHeader: "1. HERO SELECTION",
            slotBuildHeader: "2. BUILD ROULETTE",
            heroRandomPlaceholder: "Random hero...",
            heroSelectingPlaceholder: "Selecting...",
            btnSpinAgain: "SPIN AGAIN",
            btnAcceptClose: "ACCEPT AND CLOSE"
        }
    };

    // Global persistent state across popup reopenings
    if (!globalThis.__DeadlockCustomRandomizerState) {
        const defaultSelected = new Set(
            HEROES_DATA.map(h => h.id)
        );
        globalThis.__DeadlockCustomRandomizerState = {
            selectedHeroIds: defaultSelected,
            isSpinning: false,
            lastResults: null,
            currentLanguage: "en",
            _langManuallyChanged: false,
            rosterApplied: false,
            isApplyingRoster: false
        };
    }

    const state = globalThis.__DeadlockCustomRandomizerState;
    if (!state.currentLanguage || !state._langManuallyChanged) {
        state.currentLanguage = "en";
    }
    if (state.rosterApplied === undefined) {
        state.rosterApplied = false;
    }
    if (state.isApplyingRoster === undefined) {
        state.isApplyingRoster = false;
    }

    const t = (key, ...args) => {
        const lang = (state && state.currentLanguage === "en") ? "en" : "ru";
        const entry = I18N[lang][key];
        if (typeof entry === "function") return entry(...args);
        return entry !== undefined ? entry : key;
    };

    const isRussianLanguage = () => {
        return state.currentLanguage !== "en";
    };

    const getHeroDisplayName = (hero) => {
        if (!hero) return "";
        return isRussianLanguage() ? (hero.ru || hero.name) : hero.name;
    };

    const playSound = (name) => {
        try {
            $.DispatchEvent("PlaySoundEffect", name);
        } catch (e) {}
    };

    const activatePanel = (panel) => {
        if (!panel || !panel.IsValid || !panel.IsValid()) return false;
        try {
            $.DispatchEvent("MouseActivate", panel, "mouse");
            $.DispatchEvent("Activated", panel, "mouse");
            $.DispatchEvent("onactivate", panel);
            return true;
        } catch (e) {
            return false;
        }
    };

    const contextMenuPanel = (panel) => {
        if (!panel || !panel.IsValid || !panel.IsValid()) return false;
        try {
            $.DispatchEvent("oncontextmenu", panel);
            $.DispatchEvent("ContextMenu", panel);
            return true;
        } catch (e) {
            return false;
        }
    };

    /**
     * Sets official hero textures from Deadlock's pak01_dir.vpk
     * vertical = _vertical_psd.vtex (exact full-body card portraits from roster menu)
     * sm = _sm_psd.vtex (square mini-icon)
     */
    const setHeroPanelImage = (panel, hero, style = "vertical") => {
        if (!panel || !panel.IsValid()) return;
        let file;
        if (style === "sm") {
            file = hero.icon === "hornet" ? "hornet_sm_png.vtex" : `${hero.icon}_sm_psd.vtex`;
        } else {
            file = `${hero.icon}_vertical_psd.vtex`;
        }
        const vtexPath = `s2r://panorama/images/heroes/${file}`;
        try {
            panel.SetImage(vtexPath);
        } catch (e) {
            try {
                panel.style.backgroundImage = `url('${vtexPath}')`;
                panel.style.backgroundSize = "cover";
                panel.style.backgroundPosition = "center";
                panel.style.backgroundRepeat = "no-repeat";
            } catch (e2) {}
        }
    };

    // ---------------------------------------------------------------------------
    // CUSTOM RANDOMIZER CONTROLLER CLASS (ES6)
    // ---------------------------------------------------------------------------
    class CustomRandomizer {
        constructor() {
            this.rootPanel = null;
            this.menuModal = null;
            this.rouletteModal = null;
            this.searchQuery = "";
            this.ignoreRandomCardClick = false;

            // Roster elements
            this.rosterSpinBtn = null;
            this.rosterSpinLabel = null;
            this.rosterSettingsBtn = null;

            // Settings modal elements
            this.titleLbl = null;
            this.subtitleLbl = null;
            this.btnSelectAllLbl = null;
            this.btnDeselectAllLbl = null;
            this.searchEntry = null;
            this.countBadge = null;
            this.heroGrid = null;
            this.footerSpinLbl = null;
            this.footerSaveLbl = null;
            this.langBtnRU = null;
            this.langBtnEN = null;

            // Roulette modal elements
            this.rouletteTitleLbl = null;
            this.slots = [];
            this.spinAgainBtn = null;
            this.spinAgainLbl = null;
            this.applyBtn = null;
            this.applyLbl = null;
        }

        init() {
            log("Initializing CustomRandomizer manager...");
            this.rootPanel = $.GetContextPanel();
            if (!this.rootPanel) {
                logWarn("Context panel is null in init()!");
                return;
            }

            // Start watch loop to monitor DOM elements
            this.startWatcher();
        }

        startWatcher() {
            const checkAndInject = () => {
                try {
                    if (this.rootPanel && this.rootPanel.IsValid && this.rootPanel.IsValid()) {
                        this.ensureInjectedUI();
                    }
                } catch (err) {
                    logWarn("Watcher tick error: " + err);
                }

                // Fast check every 120ms so buttons attach immediately without delay
                $.Schedule(0.12, checkAndInject);
            };

            $.Schedule(0.05, checkAndInject);
        }

        ensureInjectedUI() {
            // Find or create the modal container
            let container = this.rootPanel.FindChildTraverse("CustomRandomizerRoot");
            if (!container || !container.IsValid()) {
                container = $.CreatePanel("Panel", this.rootPanel, "CustomRandomizerRoot");
                container.hittest = false;
                log("Created #CustomRandomizerRoot host container.");
            }

            if (!this.menuModal || !this.menuModal.IsValid()) {
                this.buildSettingsModal(container);
            }

            if (!this.rouletteModal || !this.rouletteModal.IsValid()) {
                this.buildRouletteModal(container);
            }

            // Attach mod buttons to roster grid
            this.attachButtonsToRoster();
        }

        attachButtonsToRoster() {
            try {
                const rosterGrid = this.rootPanel.FindChildTraverse("RosterHeroes");
                if (!rosterGrid || !rosterGrid.IsValid()) return;

                // Ensure any old modifications to RandomHeroCard are reset to vanilla
                const randomCards = rosterGrid.FindChildrenWithClassTraverse("RandomHeroCard");
                const randomCard = (randomCards && randomCards.length > 0) ? randomCards[0] : null;
                if (randomCard && randomCard.IsValid()) {
                    randomCard.RemoveClass("CR_RandomHeroCard");
                    const oldInner = randomCard.FindChildTraverse("CR_RosterCardInner");
                    if (oldInner && oldInner.IsValid()) {
                        try { oldInner.DeleteAsync(0); } catch (e) {}
                    }
                    const labels = randomCard.FindChildrenWithClassTraverse("Label");
                    if (labels) {
                        labels.forEach(l => {
                            if (l && l.IsValid() && l.text === "?") {
                                l.style.visibility = "visible";
                            }
                        });
                    }
                }

                // Check if button wrapper already exists
                let btnWrap = rosterGrid.FindChild("CR_RosterButtonWrapper");
                if (btnWrap && btnWrap.IsValid()) {
                    if (this.rosterSpinLabel && this.rosterSpinLabel.IsValid()) {
                        this.rosterSpinLabel.text = t("rosterSpinBtn");
                    }
                    if (randomCard && randomCard.IsValid() && !btnWrap._positioned) {
                        rosterGrid.MoveChildAfter(btnWrap, randomCard);
                        btnWrap._positioned = true;
                    }
                    return;
                }

                log("Creating and attaching CR_RosterButtonWrapper to RosterHeroes...");

                btnWrap = $.CreatePanel("Panel", rosterGrid, "CR_RosterButtonWrapper");
                btnWrap.AddClass("CR_RosterButtonWrapper");

                // Upper Button: 🎰 РУЛЕТКА (starts custom randomizer + build roulette)
                const spinBtn = $.CreatePanel("Button", btnWrap, "CR_SpinBtn");
                spinBtn.AddClass("CR_RosterGridBtn");
                spinBtn.AddClass("CR_SpinBtn");

                const onSpinActivate = () => {
                    log(">>> CR_SpinBtn activated! Starting custom randomizer...");
                    this.startRandomization();
                };
                spinBtn.SetPanelEvent("onactivate", onSpinActivate);
                try {
                    $.RegisterEventHandler("Activated", spinBtn, onSpinActivate);
                } catch (e) {}

                spinBtn.SetPanelEvent("onmouseover", () => {
                    try {
                        $.DispatchEvent("UIShowTitleTextTooltip", spinBtn, t("rosterSpinTooltipTitle"), t("rosterSpinTooltipDesc"));
                    } catch (e) {}
                });
                spinBtn.SetPanelEvent("onmouseout", () => {
                    try {
                        $.DispatchEvent("UIHideTitleTextTooltip", spinBtn);
                    } catch (e) {}
                });

                const spinIcon = $.CreatePanel("Label", spinBtn, "CR_SpinIcon");
                spinIcon.text = "🎰";
                spinIcon.AddClass("CR_SpinIcon");
                spinIcon.hittest = false;

                this.rosterSpinLabel = $.CreatePanel("Label", spinBtn, "CR_SpinLabel");
                this.rosterSpinLabel.text = t("rosterSpinBtn");
                this.rosterSpinLabel.AddClass("CR_SpinLabel");
                this.rosterSpinLabel.hittest = false;

                // Lower Button: ⚙ НАСТРОЙКИ (opens hero pool settings modal)
                const settingsBtn = $.CreatePanel("Button", btnWrap, "CR_SettingsGearBtn");
                settingsBtn.AddClass("CR_RosterGridBtn");
                settingsBtn.AddClass("CR_SettingsGearBtn");

                const onSettingsActivate = () => {
                    log(">>> CR_SettingsGearBtn activated! Opening settings...");
                    this.openSettingsMenu();
                };
                settingsBtn.SetPanelEvent("onactivate", onSettingsActivate);
                try {
                    $.RegisterEventHandler("Activated", settingsBtn, onSettingsActivate);
                } catch (e) {}

                settingsBtn.SetPanelEvent("onmouseover", () => {
                    try {
                        $.DispatchEvent("UIShowTitleTextTooltip", settingsBtn, t("rosterSettingsTooltipTitle"), t("rosterSettingsTooltipDesc"));
                    } catch (e) {}
                });
                settingsBtn.SetPanelEvent("onmouseout", () => {
                    try {
                        $.DispatchEvent("UIHideTitleTextTooltip", settingsBtn);
                    } catch (e) {}
                });

                const gearIcon = $.CreatePanel("Panel", settingsBtn, "CR_GearIcon");
                gearIcon.AddClass("CR_GearIconImg");
                gearIcon.hittest = false;

                // Place right next to RandomHeroCard in Slot 8 of Row 5
                if (randomCard && randomCard.IsValid()) {
                    rosterGrid.MoveChildAfter(btnWrap, randomCard);
                    btnWrap._positioned = true;
                    log("Moved CR_RosterButtonWrapper after RandomHeroCard in RosterHeroes.");
                }

                log("Successfully attached CR_RosterButtonWrapper into RosterHeroes!");
            } catch (err) {
                logWarn("attachButtonsToRoster failed: " + err);
            }
        }

        // -----------------------------------------------------------------------
        // SETTINGS MODAL
        // -----------------------------------------------------------------------
        buildSettingsModal(parent) {
            try {
                this.menuModal = $.CreatePanel("Panel", parent, "CR_SettingsModal");
                this.menuModal.AddClass("CR_ModalBackdrop");
                this.menuModal.AddClass("Hidden");
                this.menuModal.style.visibility = "collapse";
                this.menuModal.style.opacity = "0.0";
                this.menuModal.hittest = true;

                const dialog = $.CreatePanel("Panel", this.menuModal, "CR_SettingsDialog");
                dialog.AddClass("CR_DialogWindow");

                // Header
                const header = $.CreatePanel("Panel", dialog, "CR_DialogHeader");
                header.AddClass("CR_Header");

                const titleWrap = $.CreatePanel("Panel", header, "CR_TitleWrap");
                titleWrap.AddClass("CR_TitleWrap");

                this.titleLbl = $.CreatePanel("Label", titleWrap, "CR_HeaderTitle");
                this.titleLbl.text = t("settingsTitle");
                this.titleLbl.AddClass("CR_TitleText");

                this.subtitleLbl = $.CreatePanel("Label", titleWrap, "CR_HeaderSubtitle");
                this.subtitleLbl.text = t("settingsSubtitle");
                this.subtitleLbl.AddClass("CR_SubtitleText");

                const closeBtn = $.CreatePanel("Button", header, "CR_CloseBtn");
                closeBtn.AddClass("CR_CloseButton");
                const onCloseSettings = () => this.closeSettingsMenu();
                closeBtn.SetPanelEvent("onactivate", onCloseSettings);
                try {
                    $.RegisterEventHandler("Activated", closeBtn, onCloseSettings);
                } catch (e) {}
                const closeLbl = $.CreatePanel("Label", closeBtn, "");
                closeLbl.text = "✕";
                closeLbl.hittest = false;

                // Control Toolbar
                const toolbar = $.CreatePanel("Panel", dialog, "CR_Toolbar");
                toolbar.AddClass("CR_Toolbar");

                // Preset Button: Select All
                const btnAll = $.CreatePanel("Button", toolbar, "CR_BtnPresetAll");
                btnAll.AddClass("CR_FilterBtn");
                this.btnSelectAllLbl = $.CreatePanel("Label", btnAll, "");
                this.btnSelectAllLbl.text = t("btnSelectAll", HEROES_DATA.length);
                this.btnSelectAllLbl.hittest = false;
                const onAllClick = () => this.selectAll();
                btnAll.SetPanelEvent("onactivate", onAllClick);
                try { $.RegisterEventHandler("Activated", btnAll, onAllClick); } catch (e) {}

                // Preset Button: Clear All
                const btnClear = $.CreatePanel("Button", toolbar, "CR_BtnPresetClear");
                btnClear.AddClass("CR_FilterBtn");
                this.btnDeselectAllLbl = $.CreatePanel("Label", btnClear, "");
                this.btnDeselectAllLbl.text = t("btnDeselectAll");
                this.btnDeselectAllLbl.hittest = false;
                const onClearClick = () => this.deselectAll();
                btnClear.SetPanelEvent("onactivate", onClearClick);
                try { $.RegisterEventHandler("Activated", btnClear, onClearClick); } catch (e) {}

                // Language Switcher [RU] / [ENG]
                const langWrap = $.CreatePanel("Panel", toolbar, "CR_LangSwitchWrap");
                langWrap.AddClass("CR_LangSwitchWrap");

                this.langBtnRU = $.CreatePanel("Button", langWrap, "CR_LangBtn_RU");
                this.langBtnRU.AddClass("CR_LangBtn");
                this.langBtnRU.SetHasClass("ActiveLang", state.currentLanguage === "ru");
                const ruLbl = $.CreatePanel("Label", this.langBtnRU, "");
                ruLbl.text = "RU";
                ruLbl.hittest = false;
                this.langBtnRU.SetPanelEvent("onactivate", () => this.setLanguage("ru"));
                try { $.RegisterEventHandler("Activated", this.langBtnRU, () => this.setLanguage("ru")); } catch (e) {}

                this.langBtnEN = $.CreatePanel("Button", langWrap, "CR_LangBtn_EN");
                this.langBtnEN.AddClass("CR_LangBtn");
                this.langBtnEN.SetHasClass("ActiveLang", state.currentLanguage === "en");
                const enLbl = $.CreatePanel("Label", this.langBtnEN, "");
                enLbl.text = "ENG";
                enLbl.hittest = false;
                this.langBtnEN.SetPanelEvent("onactivate", () => this.setLanguage("en"));
                try { $.RegisterEventHandler("Activated", this.langBtnEN, () => this.setLanguage("en")); } catch (e) {}

                // Search Bar
                this.searchEntry = $.CreatePanel("TextEntry", toolbar, "CR_SearchInput");
                this.searchEntry.AddClass("CR_SearchEntry");
                this.searchEntry.placeholder = t("searchPlaceholder");
                this.searchEntry.SetPanelEvent("ontextentrychange", () => {
                    this.searchQuery = this.searchEntry.text.toLowerCase().trim();
                    this.refreshHeroGrid();
                });

                // Count Badge
                this.countBadge = $.CreatePanel("Label", toolbar, "CR_CountBadge");
                this.countBadge.AddClass("CR_CountBadge");
                this.updateCountBadge();

                // Hero Grid Container (Scrollable)
                const gridScroll = $.CreatePanel("Panel", dialog, "CR_GridScroll");
                gridScroll.AddClass("CR_GridScroll");

                this.heroGrid = $.CreatePanel("Panel", gridScroll, "CR_HeroGrid");
                this.heroGrid.AddClass("CR_HeroGrid");

                // Populate Grid
                this.populateHeroGrid();

                // Footer
                const footer = $.CreatePanel("Panel", dialog, "CR_DialogFooter");
                footer.AddClass("CR_Footer");

                const spinBtn = $.CreatePanel("Button", footer, "CR_FooterSpinBtn");
                spinBtn.AddClass("CR_PrimaryButton");
                const onFooterSpin = () => {
                    const activePool = HEROES_DATA.filter(h => state.selectedHeroIds.has(h.id));
                    if (activePool.length < 3) {
                        this.showWarningToast(t("errMinHeroes"));
                        return;
                    }
                    this.closeSettingsMenu();
                    this.startRandomization();
                };
                spinBtn.SetPanelEvent("onactivate", onFooterSpin);
                try { $.RegisterEventHandler("Activated", spinBtn, onFooterSpin); } catch (e) {}
                this.footerSpinLbl = $.CreatePanel("Label", spinBtn, "");
                this.footerSpinLbl.text = t("btnSpinNow");
                this.footerSpinLbl.hittest = false;

                const saveBtn = $.CreatePanel("Button", footer, "CR_FooterSaveBtn");
                saveBtn.AddClass("CR_SecondaryButton");
                const onFooterSave = () => this.closeSettingsMenu();
                saveBtn.SetPanelEvent("onactivate", onFooterSave);
                try { $.RegisterEventHandler("Activated", saveBtn, onFooterSave); } catch (e) {}
                this.footerSaveLbl = $.CreatePanel("Label", saveBtn, "");
                this.footerSaveLbl.text = t("btnDone");
                this.footerSaveLbl.hittest = false;

                log("Settings modal built successfully with language switcher [RU] / [ENG].");
            } catch (err) {
                logWarn("Failed to build settings modal: " + err);
            }
        }

        setLanguage(lang) {
            state._langManuallyChanged = true;
            if (state.currentLanguage === lang) return;
            state.currentLanguage = lang;
            log("Language switched to:", lang);
            this.updateUILanguage();
            playSound("soundHeroCardHover");
        }

        updateUILanguage() {
            // Update [RU] / [ENG] buttons active state
            if (this.langBtnRU && this.langBtnRU.IsValid()) {
                this.langBtnRU.SetHasClass("ActiveLang", state.currentLanguage === "ru");
            }
            if (this.langBtnEN && this.langBtnEN.IsValid()) {
                this.langBtnEN.SetHasClass("ActiveLang", state.currentLanguage === "en");
            }

            // Update Settings modal text
            if (this.titleLbl && this.titleLbl.IsValid()) this.titleLbl.text = t("settingsTitle");
            if (this.subtitleLbl && this.subtitleLbl.IsValid()) this.subtitleLbl.text = t("settingsSubtitle");
            if (this.btnSelectAllLbl && this.btnSelectAllLbl.IsValid()) this.btnSelectAllLbl.text = t("btnSelectAll", HEROES_DATA.length);
            if (this.btnDeselectAllLbl && this.btnDeselectAllLbl.IsValid()) this.btnDeselectAllLbl.text = t("btnDeselectAll");
            if (this.searchEntry && this.searchEntry.IsValid()) this.searchEntry.placeholder = t("searchPlaceholder");
            if (this.footerSpinLbl && this.footerSpinLbl.IsValid()) this.footerSpinLbl.text = t("btnSpinNow");
            if (this.footerSaveLbl && this.footerSaveLbl.IsValid()) this.footerSaveLbl.text = t("btnDone");

            this.updateCountBadge();

            // Update hero names in the grid
            if (this.heroGrid && this.heroGrid.IsValid()) {
                const cards = this.heroGrid.Children();
                cards.forEach(card => {
                    const heroId = card.id.replace("CR_Card_", "");
                    const hero = HEROES_DATA.find(h => h.id === heroId);
                    if (hero) {
                        const nameLbl = card.FindChildTraverse("CR_HeroName");
                        if (nameLbl && nameLbl.IsValid()) {
                            nameLbl.text = getHeroDisplayName(hero);
                        }
                    }
                });
            }

            // Update Roulette modal text
            if (this.rouletteTitleLbl && this.rouletteTitleLbl.IsValid()) this.rouletteTitleLbl.text = t("rouletteTitle");
            if (this.spinAgainLbl && this.spinAgainLbl.IsValid()) this.spinAgainLbl.text = t("btnSpinAgain");
            if (this.applyLbl && this.applyLbl.IsValid()) this.applyLbl.text = t("btnAcceptClose");

            if (this.slots && this.slots.length > 0) {
                this.slots.forEach((slot, sIdx) => {
                    if (slot.badgeLbl && slot.badgeLbl.IsValid()) slot.badgeLbl.text = t(slot.badgeKey);
                    if (slot.heroHeaderLbl && slot.heroHeaderLbl.IsValid()) slot.heroHeaderLbl.text = t("slotHeroHeader");
                    if (slot.buildHeaderLbl && slot.buildHeaderLbl.IsValid()) slot.buildHeaderLbl.text = t("slotBuildHeader");

                    if (state.lastResults && state.lastResults[sIdx]) {
                        const res = state.lastResults[sIdx];
                        if (slot.heroNameLbl && slot.heroNameLbl.IsValid()) {
                            slot.heroNameLbl.text = getHeroDisplayName(res.hero);
                        }
                        if (slot.resultBuildLbl && slot.resultBuildLbl.IsValid()) {
                            const bName = (state.currentLanguage === "en") ? res.build.enName : res.build.ruName;
                            slot.resultBuildLbl.text = bName;
                            slot.resultBuildLbl.style.color = res.build.color;
                        }
                    } else if (slot.heroNameLbl && slot.heroNameLbl.IsValid() && !state.isSpinning) {
                        slot.heroNameLbl.text = t("heroRandomPlaceholder");
                    }
                });
            }

            // Update Roster quick button
            if (this.rosterSpinLabel && this.rosterSpinLabel.IsValid()) {
                this.rosterSpinLabel.text = t("rosterSpinBtn");
            }
        }

        populateHeroGrid() {
            if (!this.heroGrid || !this.heroGrid.IsValid()) return;
            this.heroGrid.RemoveAndDeleteChildren();

            HEROES_DATA.forEach(hero => {
                const card = $.CreatePanel("Panel", this.heroGrid, `CR_Card_${hero.id}`);
                card.AddClass("CR_HeroCard");
                card.SetHasClass("Selected", state.selectedHeroIds.has(hero.id));

                // Hero Portrait using official Deadlock vertical roster art (_vertical_psd.vtex)
                const portraitWrap = $.CreatePanel("Panel", card, "CR_PortraitWrap");
                portraitWrap.AddClass("CR_PortraitWrap");

                const heroImg = $.CreatePanel("Image", portraitWrap, "CR_HeroImg");
                heroImg.AddClass("CR_HeroImage");
                heroImg.SetScaling("stretch-to-cover-preserve-aspect");
                setHeroPanelImage(heroImg, hero, "vertical");

                // Info Wrap: Checkbox in bottom-left corner next to localized Hero Name
                const infoWrap = $.CreatePanel("Panel", card, "CR_CardInfo");
                infoWrap.AddClass("CR_CardInfo");

                const checkIcon = $.CreatePanel("Panel", infoWrap, "CR_CheckIcon");
                checkIcon.AddClass("CR_CheckIcon");
                checkIcon.hittest = false;

                const heroNameLbl = $.CreatePanel("Label", infoWrap, "CR_HeroName");
                heroNameLbl.text = getHeroDisplayName(hero);
                heroNameLbl.AddClass("CR_HeroName");
                heroNameLbl.hittest = false;

                // Toggle click event
                card.SetPanelEvent("onactivate", () => {
                    this.toggleHero(hero.id);
                    card.SetHasClass("Selected", state.selectedHeroIds.has(hero.id));
                    playSound("soundHeroCardActivate");
                });
            });
        }

        refreshHeroGrid() {
            if (!this.heroGrid || !this.heroGrid.IsValid()) return;

            const cards = this.heroGrid.Children();
            cards.forEach(card => {
                const heroId = card.id.replace("CR_Card_", "");
                const hero = HEROES_DATA.find(h => h.id === heroId);
                if (!hero) return;

                card.SetHasClass("Selected", state.selectedHeroIds.has(hero.id));

                // Filter by search query (supports both English and Russian query)
                if (this.searchQuery) {
                    const q = this.searchQuery;
                    const match = hero.name.toLowerCase().includes(q) ||
                                  hero.ru.toLowerCase().includes(q) ||
                                  hero.id.toLowerCase().includes(q);
                    card.SetHasClass("Hidden", !match);
                } else {
                    card.RemoveClass("Hidden");
                }
            });

            this.updateCountBadge();
        }

        toggleHero(heroId) {
            if (state.selectedHeroIds.has(heroId)) {
                state.selectedHeroIds.delete(heroId);
            } else {
                state.selectedHeroIds.add(heroId);
            }
            this.updateCountBadge();
            log("Toggled hero:", heroId, "Now active in pool:", state.selectedHeroIds.has(heroId));
        }

        selectAll() {
            HEROES_DATA.forEach(h => state.selectedHeroIds.add(h.id));
            this.refreshHeroGrid();
            playSound("soundHeroCardActivate");
            log("Selected all 38 heroes.");
        }

        deselectAll() {
            state.selectedHeroIds.clear();
            this.refreshHeroGrid();
            playSound("soundHeroCardActivate");
            log("Deselected all heroes.");
        }

        updateCountBadge() {
            if (!this.countBadge || !this.countBadge.IsValid()) return;
            const count = state.selectedHeroIds.size;
            const total = HEROES_DATA.length;
            if (count < 3) {
                this.countBadge.text = `${t("selectedCount", count, total)} (${t("errMinHeroesShort")})`;
                this.countBadge.AddClass("WarningCount");
            } else {
                this.countBadge.text = t("selectedCount", count, total);
                this.countBadge.RemoveClass("WarningCount");
            }
        }

        showWarningToast(message) {
            try {
                if (!this.rootPanel || !this.rootPanel.IsValid()) return;
                let toast = this.rootPanel.FindChildTraverse("CR_WarningToast");
                if (!toast || !toast.IsValid()) {
                    toast = $.CreatePanel("Panel", this.rootPanel, "CR_WarningToast");
                    toast.AddClass("CR_WarningToast");
                    const iconLbl = $.CreatePanel("Label", toast, "");
                    iconLbl.AddClass("CR_ToastIcon");
                    iconLbl.text = "⚠️";
                    iconLbl.hittest = false;

                    const msgLbl = $.CreatePanel("Label", toast, "CR_ToastMessage");
                    msgLbl.AddClass("CR_ToastMsg");
                    msgLbl.hittest = false;
                }

                const msgLbl = toast.FindChildTraverse("CR_ToastMessage");
                if (msgLbl && msgLbl.IsValid()) {
                    msgLbl.text = message;
                }

                toast.RemoveClass("ToastHidden");
                toast.AddClass("ToastVisible");
                playSound("soundHeroCardHover");

                if (this._toastTimer) {
                    try { $.CancelScheduled(this._toastTimer); } catch (e) {}
                }
                this._toastTimer = $.Schedule(3.0, () => {
                    if (toast && toast.IsValid()) {
                        toast.RemoveClass("ToastVisible");
                        toast.AddClass("ToastHidden");
                    }
                });
            } catch (err) {
                logWarn("Failed to show warning toast: " + err);
            }
        }

        openSettingsMenu() {
            log("Opening settings menu...");
            if (!this.menuModal || !this.menuModal.IsValid()) {
                const container = this.rootPanel.FindChildTraverse("CustomRandomizerRoot") || this.rootPanel;
                this.buildSettingsModal(container);
            }
            this.refreshHeroGrid();
            this.menuModal.RemoveClass("Hidden");
            this.menuModal.style.visibility = "visible";
            this.menuModal.style.opacity = "1.0";
            playSound("soundHeroCardHover");
        }

        closeSettingsMenu() {
            log("Closing settings menu.");
            if (!this.menuModal) return;
            this.menuModal.AddClass("Hidden");
            this.menuModal.style.visibility = "collapse";
            this.menuModal.style.opacity = "0.0";
        }

        // -----------------------------------------------------------------------
        // ROULETTE & RANDOMIZATION ENGINE
        // -----------------------------------------------------------------------
        buildRouletteModal(parent) {
            try {
                this.rouletteModal = $.CreatePanel("Panel", parent, "CR_RouletteModal");
                this.rouletteModal.AddClass("CR_ModalBackdrop");
                this.rouletteModal.AddClass("Hidden");
                this.rouletteModal.style.visibility = "collapse";
                this.rouletteModal.style.opacity = "0.0";
                this.rouletteModal.hittest = true;

                const dialog = $.CreatePanel("Panel", this.rouletteModal, "CR_RouletteDialog");
                dialog.AddClass("CR_DialogWindow");
                dialog.AddClass("CR_RouletteWindow");

                // Header
                const header = $.CreatePanel("Panel", dialog, "CR_RouletteHeader");
                header.AddClass("CR_Header");

                this.rouletteTitleLbl = $.CreatePanel("Label", header, "CR_RouletteTitle");
                this.rouletteTitleLbl.text = t("rouletteTitle");
                this.rouletteTitleLbl.AddClass("CR_TitleText");

                // Header Controls (Close Button 'X')
                const headerControls = $.CreatePanel("Panel", header, "CR_RouletteHeaderControls");
                headerControls.AddClass("CR_HeaderControls");

                const closeBtn = $.CreatePanel("Button", headerControls, "CR_RouletteCloseBtn");
                closeBtn.AddClass("CR_CloseButton");
                const onCloseRoulette = () => {
                    log("User clicked 'X' to close roulette modal!");
                    this.closeRouletteModal();
                };
                closeBtn.SetPanelEvent("onactivate", onCloseRoulette);
                try {
                    $.RegisterEventHandler("Activated", closeBtn, onCloseRoulette);
                } catch (e) {}
                const closeLbl = $.CreatePanel("Label", closeBtn, "");
                closeLbl.text = "✕";
                closeLbl.hittest = false;

                // 3 Roulette Slots Container (Horizontal Layout)
                const slotsContainer = $.CreatePanel("Panel", dialog, "CR_RouletteSlotsContainer");
                slotsContainer.AddClass("CR_RouletteSlotsContainer");

                this.slots = [];
                const slotConfigs = [
                    { badgeKey: "priorityHighBadge", badgeClass: "CR_PriorityHigh" },
                    { badgeKey: "priorityLowBadge", badgeClass: "CR_PriorityLow" },
                    { badgeKey: "priorityLowBadge", badgeClass: "CR_PriorityLow" }
                ];

                slotConfigs.forEach((cfg, sIdx) => {
                    const slotCard = $.CreatePanel("Panel", slotsContainer, `CR_Slot_${sIdx}`);
                    slotCard.AddClass("CR_RouletteSlotCard");

                    // Priority Badge (High Priority / Priority / Standard)
                    const badge = $.CreatePanel("Panel", slotCard, `CR_Badge_${sIdx}`);
                    badge.AddClass("CR_PriorityBadge");
                    badge.AddClass(cfg.badgeClass);

                    const badgeLbl = $.CreatePanel("Label", badge, "");
                    badgeLbl.text = t(cfg.badgeKey);
                    badgeLbl.hittest = false;

                    // Stage 1: Hero Selection
                    const heroHeader = $.CreatePanel("Label", slotCard, `CR_HeroHeader_${sIdx}`);
                    heroHeader.text = t("slotHeroHeader");
                    heroHeader.AddClass("CR_SlotSectionLabel");

                    const heroBox = $.CreatePanel("Panel", slotCard, `CR_HeroBox_${sIdx}`);
                    heroBox.AddClass("CR_SlotHeroBox");

                    const heroImg = $.CreatePanel("Image", heroBox, `CR_SlotHeroImg_${sIdx}`);
                    heroImg.AddClass("CR_SlotHeroImg");
                    heroImg.SetScaling("stretch-to-fit-preserve-aspect");
                    setHeroPanelImage(heroImg, HEROES_DATA[sIdx] || HEROES_DATA[0], "vertical");

                    const heroInfoCol = $.CreatePanel("Panel", heroBox, `CR_HeroInfoCol_${sIdx}`);
                    heroInfoCol.AddClass("CR_SlotHeroInfoCol");

                    const heroNameLbl = $.CreatePanel("Label", heroInfoCol, `CR_SlotHeroName_${sIdx}`);
                    heroNameLbl.text = t("heroRandomPlaceholder");
                    heroNameLbl.AddClass("CR_SlotHeroName");

                    // Stage 2: Build Roulette
                    const buildHeader = $.CreatePanel("Label", slotCard, `CR_BuildHeader_${sIdx}`);
                    buildHeader.text = t("slotBuildHeader");
                    buildHeader.AddClass("CR_SlotSectionLabel");

                    const stripViewport = $.CreatePanel("Panel", slotCard, `CR_StripViewport_${sIdx}`);
                    stripViewport.AddClass("CR_SlotStripViewport");

                    const pointer = $.CreatePanel("Label", stripViewport, `CR_Pointer_${sIdx}`);
                    pointer.AddClass("CR_RoulettePointer");
                    pointer.text = "▼";
                    pointer.hittest = false;

                    const buildStrip = $.CreatePanel("Panel", stripViewport, `CR_SlotBuildStrip_${sIdx}`);
                    buildStrip.AddClass("CR_BuildStrip");
                    this.populateSlotBuildStrip(buildStrip);

                    // Final Result Build Label
                    const resultBuildLbl = $.CreatePanel("Label", slotCard, `CR_SlotResultBuild_${sIdx}`);
                    resultBuildLbl.AddClass("CR_SlotResultBuild");

                    this.slots.push({
                        slotCard,
                        badgeLbl,
                        badgeKey: cfg.badgeKey,
                        heroHeaderLbl: heroHeader,
                        heroImg,
                        heroNameLbl,
                        buildHeaderLbl: buildHeader,
                        buildStrip,
                        resultBuildLbl
                    });
                });

                // Centered Action Buttons Footer
                const actions = $.CreatePanel("Panel", dialog, "CR_RouletteActions");
                actions.AddClass("CR_Footer");
                actions.AddClass("CR_CenteredFooter");

                const centerWrap = $.CreatePanel("Panel", actions, "CR_RouletteCenterWrap");
                centerWrap.AddClass("CR_FooterCenterWrap");

                // 1. Spin Again Button
                this.spinAgainBtn = $.CreatePanel("Button", centerWrap, "CR_SpinAgainBtn");
                this.spinAgainBtn.AddClass("CR_SecondaryButton");
                const onSpinAgain = () => {
                    log("User clicked 'Spin Again'!");
                    if (state.isSpinning) return;
                    const activePool = HEROES_DATA.filter(h => state.selectedHeroIds.has(h.id));
                    if (activePool.length < 3) {
                        this.showWarningToast(t("errMinHeroes"));
                        this.closeRouletteModal();
                        this.openSettingsMenu();
                        return;
                    }
                    this.startRandomization();
                };
                this.spinAgainBtn.SetPanelEvent("onactivate", onSpinAgain);
                try { $.RegisterEventHandler("Activated", this.spinAgainBtn, onSpinAgain); } catch (e) {}
                this.spinAgainLbl = $.CreatePanel("Label", this.spinAgainBtn, "");
                this.spinAgainLbl.text = t("btnSpinAgain");
                this.spinAgainLbl.hittest = false;

                // 2. Accept and Close Button
                this.applyBtn = $.CreatePanel("Button", centerWrap, "CR_ApplyBtn");
                this.applyBtn.AddClass("CR_PrimaryButton");
                const onApply = () => {
                    log("User clicked 'Принять и закрыть'!");
                    if (state.isSpinning) return;
                    if (!state.rosterApplied && !state.isApplyingRoster && state.lastResults) {
                        this.applyRosterSelection(state.lastResults);
                    }
                    this.closeRouletteModal();
                };
                this.applyBtn.SetPanelEvent("onactivate", onApply);
                try { $.RegisterEventHandler("Activated", this.applyBtn, onApply); } catch (e) {}
                this.applyLbl = $.CreatePanel("Label", this.applyBtn, "");
                this.applyLbl.text = t("btnAcceptClose");
                this.applyLbl.hittest = false;

                log("3-Slot Roulette modal built successfully.");
            } catch (err) {
                logWarn("Failed to build roulette modal: " + err);
            }
        }

        populateSlotBuildStrip(strip) {
            if (!strip || !strip.IsValid()) return;
            strip.RemoveAndDeleteChildren();

            // Create 30 repeating build items (Gun, Spirit, Melee x 10)
            const repeats = 10;
            for (let r = 0; r < repeats; r++) {
                BUILDS.forEach((b) => {
                    const item = $.CreatePanel("Panel", strip, "");
                    item.AddClass("CR_StripItemCompact");
                    item.AddClass(`Build_${b.id}`);

                    // Official game icon from VPK
                    const iconWrap = $.CreatePanel("Panel", item, "");
                    iconWrap.AddClass("CR_StripIconWrap");

                    const iconImg = $.CreatePanel("Image", iconWrap, "");
                    iconImg.AddClass("CR_StripItemIconImg");
                    iconImg.SetScaling("stretch-to-fit-preserve-aspect");
                    try {
                        iconImg.SetImage(b.iconPath);
                    } catch (e) {
                        try {
                            iconImg.style.backgroundImage = `url('${b.iconPath}')`;
                            iconImg.style.backgroundSize = "contain";
                            iconImg.style.backgroundPosition = "center";
                            iconImg.style.backgroundRepeat = "no-repeat";
                        } catch (e2) {}
                    }

                    const name = $.CreatePanel("Label", item, "");
                    name.text = b.name;
                    name.AddClass("CR_StripItemText");
                    name.hittest = false;
                });
            }
        }

        closeRouletteModal() {
            log("closeRouletteModal() called!");
            if (!this.rouletteModal || !this.rouletteModal.IsValid()) return;
            this.rouletteModal.AddClass("Hidden");
            this.rouletteModal.style.visibility = "collapse";
            this.rouletteModal.style.opacity = "0.0";
            state.isSpinning = false;
            log("Roulette modal closed successfully.");
        }

        /**
         * Clears all heroes currently marked as inRoster from the game roster.
         */
        clearRoster(onDone) {
            try {
                const rosterGrid = this.rootPanel.FindChildTraverse("RosterHeroes");
                if (!rosterGrid || !rosterGrid.IsValid()) {
                    if (onDone) onDone();
                    return;
                }

                const heroCards = rosterGrid.FindChildrenWithClassTraverse("HeroCard");
                const inRosterCards = [];
                if (heroCards && heroCards.length > 0) {
                    for (let i = 0; i < heroCards.length; i++) {
                        const c = heroCards[i];
                        if (!c || !c.IsValid()) continue;
                        const inRoster = (c.BHasClass && c.BHasClass("inRoster")) || (c.HasClass && c.HasClass("inRoster"));
                        if (inRoster) {
                            inRosterCards.push(c);
                        }
                    }
                }

                log(`clearRoster: Found ${inRosterCards.length} heroes currently in roster to deselect.`);
                if (inRosterCards.length === 0) {
                    if (onDone) onDone();
                    return;
                }

                let idx = 0;
                const stepDeselect = () => {
                    if (idx >= inRosterCards.length) {
                        log("clearRoster: All previously selected heroes deselected.");
                        if (onDone) onDone();
                        return;
                    }
                    const card = inRosterCards[idx++];
                    if (card && card.IsValid()) {
                        const inRoster = (card.BHasClass && card.BHasClass("inRoster")) || (card.HasClass && card.HasClass("inRoster"));
                        if (inRoster) {
                            this.triggerCardClick(card);
                        }
                    }
                    $.Schedule(0.025, stepDeselect);
                };

                stepDeselect();
            } catch (err) {
                logWarn("Error in clearRoster: " + err);
                if (onDone) onDone();
            }
        }

        startRandomization() {
            log("startRandomization() called!");
            if (state.isSpinning) {
                log("Already spinning, ignoring request.");
                return;
            }

            // Check pool size
            const activePool = HEROES_DATA.filter(h => state.selectedHeroIds.has(h.id));
            log("Active hero pool size:", activePool.length);

            if (activePool.length < 3) {
                logWarn("Active pool has fewer than 3 heroes! Cannot start roulette.");
                this.showWarningToast(t("errMinHeroes"));
                this.openSettingsMenu();
                return;
            }

            // Ensure roulette modal exists
            if (!this.rouletteModal || !this.rouletteModal.IsValid()) {
                const container = this.rootPanel.FindChildTraverse("CustomRandomizerRoot") || this.rootPanel;
                this.buildRouletteModal(container);
            }

            state.isSpinning = true;
            state.rosterApplied = false;
            state.isApplyingRoster = false;

            if (this.spinAgainBtn && this.spinAgainBtn.IsValid()) {
                this.spinAgainBtn.AddClass("Disabled");
            }
            if (this.applyBtn && this.applyBtn.IsValid()) {
                this.applyBtn.AddClass("Disabled");
            }

            // Pick 3 distinct heroes
            let poolToSample = [...activePool];

            // Fisher-Yates shuffle
            for (let i = poolToSample.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [poolToSample[i], poolToSample[j]] = [poolToSample[j], poolToSample[i]];
            }

            // In Deadlock roster:
            // 1st RMB = High Priority (2 arrows)
            // 0 RMB = Standard (0 arrows)
            // Slot 0: High Priority (1 RMB)
            // Slot 1: Standard (0 RMB)
            // Slot 2: Standard (0 RMB)
            const targetResults = [
                {
                    hero: poolToSample[0],
                    build: BUILDS[Math.floor(Math.random() * BUILDS.length)],
                    priority: "high",
                    rmbClicks: 1
                },
                {
                    hero: poolToSample[1],
                    build: BUILDS[Math.floor(Math.random() * BUILDS.length)],
                    priority: "low",
                    rmbClicks: 0
                },
                {
                    hero: poolToSample[2],
                    build: BUILDS[Math.floor(Math.random() * BUILDS.length)],
                    priority: "low",
                    rmbClicks: 0
                }
            ];

            state.lastResults = targetResults;
            log(">>> 3 Targets Selected:", targetResults.map((r, idx) => `Slot ${idx}: ${r.hero.name} (${r.build.name}) [${r.rmbClicks}x RMB]`).join(" | "));

            // Open modal
            this.rouletteModal.RemoveClass("Hidden");
            this.rouletteModal.style.visibility = "visible";
            this.rouletteModal.style.opacity = "1.0";

            // Reset slot displays to selecting state
            this.slots.forEach(slot => {
                if (slot.heroNameLbl && slot.heroNameLbl.IsValid()) {
                    slot.heroNameLbl.text = t("heroSelectingPlaceholder");
                }
                if (slot.resultBuildLbl && slot.resultBuildLbl.IsValid()) {
                    slot.resultBuildLbl.text = "";
                }
            });

            // 1. Immediately deselect all heroes currently on roster
            this.clearRoster(() => {
                log("Roster cleared before roll. Starting animation...");
            });

            // 2. Launch animations for all 3 slots
            this.animateAllSlots(targetResults, activePool);
        }

        animateHeroSlot(slotIndex, targetHero, pool, maxSteps, onComplete) {
            const slot = this.slots[slotIndex];
            if (!slot) {
                if (onComplete) onComplete();
                return;
            }

            let step = 0;
            const tick = () => {
                if (!this.rouletteModal || !this.rouletteModal.IsValid()) {
                    if (onComplete) onComplete();
                    return;
                }

                step++;
                const isFinal = step >= maxSteps;
                const currentHero = isFinal ? targetHero : pool[Math.floor(Math.random() * pool.length)];

                if (slot.heroImg && slot.heroImg.IsValid()) {
                    setHeroPanelImage(slot.heroImg, currentHero, "vertical");
                }
                if (slot.heroNameLbl && slot.heroNameLbl.IsValid()) {
                    slot.heroNameLbl.text = getHeroDisplayName(currentHero);
                }

                playSound("soundHeroCardHover");

                if (!isFinal) {
                    const delay = 0.04 + (step / maxSteps) * 0.10;
                    $.Schedule(delay, tick);
                } else {
                    playSound("soundHeroCardActivate");
                    log(`Slot ${slotIndex} locked on hero:`, currentHero.name);
                    if (onComplete) onComplete();
                }
            };

            tick();
        }

        animateSlotBuildStrip(slotIndex, chosenBuild, onComplete) {
            const slot = this.slots[slotIndex];
            if (!slot) {
                if (onComplete) onComplete();
                return;
            }

            const stripViewport = slot.slotCard.FindChildTraverse(`CR_StripViewport_${slotIndex}`);
            if (!stripViewport || !stripViewport.IsValid()) {
                if (onComplete) onComplete();
                return;
            }

            // Cleanly delete previous strip to eliminate any leftover CSS transition state
            if (slot.buildStrip && slot.buildStrip.IsValid()) {
                try { slot.buildStrip.DeleteAsync(0); } catch (e) {}
            }

            // Create fresh strip anchored at translateX(0px)
            const buildStrip = $.CreatePanel("Panel", stripViewport, `CR_SlotBuildStrip_${slotIndex}`);
            buildStrip.AddClass("CR_BuildStrip");
            slot.buildStrip = buildStrip;

            // Ensure center pointer stays on top of strip
            const pointer = stripViewport.FindChildTraverse(`CR_Pointer_${slotIndex}`);
            if (pointer && pointer.IsValid()) {
                try { stripViewport.MoveChildAfter(pointer, buildStrip); } catch (e) {}
            }

            // Populate fresh 30 build items
            this.populateSlotBuildStrip(buildStrip);

            const buildIdx = BUILDS.findIndex(b => b.id === chosenBuild.id);
            const targetIndex = buildIdx !== -1 ? buildIdx : 0;

            // Geometry: Item width 100px + 10px margin = 110px pitch
            // Exact offset (+41px) places the target item dead-center under the ▼ arrow
            const itemWidth = 110;
            const landingRepeat = 7;
            const landingIndex = (landingRepeat * 3) + targetIndex;
            const finalOffset = -(landingIndex * itemWidth) + 41;

            $.Schedule(0.05, () => {
                if (!buildStrip || !buildStrip.IsValid()) return;
                buildStrip.AddClass("CR_SpinningAnimation");
                buildStrip.style.transform = `translateX(${finalOffset}px)`;
            });

            $.Schedule(1.90, () => {
                playSound("soundHeroCardActivate");

                // Highlight winning item in strip and dim neighboring items
                try {
                    buildStrip.AddClass("CR_FinishedSpin");
                    const winningItem = buildStrip.GetChild(landingIndex);
                    if (winningItem && winningItem.IsValid()) {
                        winningItem.AddClass("CR_WinningBuildItem");
                    }
                } catch (e) {}

                if (slot.resultBuildLbl && slot.resultBuildLbl.IsValid()) {
                    const bName = (state.currentLanguage === "en") ? chosenBuild.enName : chosenBuild.ruName;
                    slot.resultBuildLbl.text = bName;
                    slot.resultBuildLbl.style.color = chosenBuild.color;
                }
                if (onComplete) onComplete();
            });
        }

        animateAllSlots(targetResults, activePool) {
            let slotsFinished = 0;
            const onSlotFullyFinished = () => {
                slotsFinished++;
                if (slotsFinished >= 3) {
                    log(">>> All 3 slots finished spinning!");
                    state.isSpinning = false;
                    playSound("soundHeroCardActivate");

                    if (this.spinAgainBtn && this.spinAgainBtn.IsValid()) {
                        this.spinAgainBtn.RemoveClass("Disabled");
                    }
                    if (this.applyBtn && this.applyBtn.IsValid()) {
                        this.applyBtn.RemoveClass("Disabled");
                    }

                    // Automatically select all 3 heroes in the roster with respective priorities!
                    this.applyRosterSelection(targetResults);
                }
            };

            // Slot 0: 12 hero steps, then build strip spin
            this.animateHeroSlot(0, targetResults[0].hero, activePool, 12, () => {
                $.Schedule(0.12, () => {
                    this.animateSlotBuildStrip(0, targetResults[0].build, onSlotFullyFinished);
                });
            });

            // Slot 1: 15 hero steps, then build strip spin
            this.animateHeroSlot(1, targetResults[1].hero, activePool, 15, () => {
                $.Schedule(0.12, () => {
                    this.animateSlotBuildStrip(1, targetResults[1].build, onSlotFullyFinished);
                });
            });

            // Slot 2: 18 hero steps, then build strip spin
            this.animateHeroSlot(2, targetResults[2].hero, activePool, 18, () => {
                $.Schedule(0.12, () => {
                    this.animateSlotBuildStrip(2, targetResults[2].build, onSlotFullyFinished);
                });
            });
        }

        // -----------------------------------------------------------------------
        // ROSTER INTERACTION & PRIORITY ASSIGNMENT
        // -----------------------------------------------------------------------
        findHeroCardInRoster(targetHero) {
            if (!targetHero) return null;
            const rosterGrid = this.rootPanel.FindChildTraverse("RosterHeroes");
            if (!rosterGrid || !rosterGrid.IsValid()) return null;

            // Build candidate CSS classes to match the HeroCard panel
            const candidateClasses = [];
            if (targetHero.cardClass) candidateClasses.push(targetHero.cardClass);
            if (targetHero.id === "vyper") candidateClasses.push("hero_viper", "hero_vyper");
            if (targetHero.id === "mo_and_krill") candidateClasses.push("hero_krill", "hero_digger", "hero_mo_and_krill");
            if (targetHero.token) candidateClasses.push(targetHero.token.replace("#", ""));
            if (targetHero.id) candidateClasses.push(`hero_${targetHero.id}`);
            if (targetHero.icon) candidateClasses.push(`hero_${targetHero.icon}`);
            if (targetHero.name) {
                candidateClasses.push(`hero_${targetHero.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`);
            }

            const uniqueClasses = candidateClasses.filter((c, idx) => c && candidateClasses.indexOf(c) === idx);

            // Method 1: Find directly by candidate CSS classes in RosterHeroes
            for (let k = 0; k < uniqueClasses.length; k++) {
                const cls = uniqueClasses[k];
                const matching = rosterGrid.FindChildrenWithClassTraverse(cls);
                if (matching && matching.length > 0) {
                    for (let m = 0; m < matching.length; m++) {
                        const p = matching[m];
                        if (p && p.IsValid && p.IsValid()) {
                            if ((p.BHasClass && p.BHasClass("HeroCard")) || (p.HasClass && p.HasClass("HeroCard"))) {
                                return p;
                            }
                            let cur = p;
                            while (cur && cur.IsValid && cur.IsValid() && cur !== rosterGrid) {
                                if ((cur.BHasClass && cur.BHasClass("HeroCard")) || (cur.HasClass && cur.HasClass("HeroCard"))) {
                                    return cur;
                                }
                                cur = cur.GetParent ? cur.GetParent() : null;
                            }
                            return p;
                        }
                    }
                }
            }

            // Method 2: Scan all CitadelHeroCard panels in RosterHeroes
            const heroCards = rosterGrid.FindChildrenWithClassTraverse("HeroCard");
            if (heroCards && heroCards.length > 0) {
                for (let i = 0; i < heroCards.length; i++) {
                    const c = heroCards[i];
                    if (!c || !c.IsValid()) continue;

                    // 2a. Match card classes against candidate classes
                    for (let k = 0; k < uniqueClasses.length; k++) {
                        const cls = uniqueClasses[k];
                        if ((c.BHasClass && c.BHasClass(cls)) || (c.HasClass && c.HasClass(cls))) {
                            return c;
                        }
                    }

                    // 2b. Match CitadelHeroImage attributes or src
                    const heroImg = c.FindChildTraverse("HeroImage") || c.FindChildTraverse("CitadelHeroImage");
                    if (heroImg && heroImg.IsValid && heroImg.IsValid()) {
                        // Match hero_id attribute or property
                        if (targetHero.heroId !== undefined) {
                            try {
                                if (heroImg.GetAttributeInt && heroImg.GetAttributeInt("hero_id", -1) === targetHero.heroId) return c;
                                if (heroImg.GetAttributeString && heroImg.GetAttributeString("hero_id", "") === String(targetHero.heroId)) return c;
                                if (heroImg.heroid === targetHero.heroId || heroImg.hero_id === targetHero.heroId) return c;
                            } catch (e) {}
                        }

                        // Match heroname attribute
                        try {
                            const heroNameAttr = heroImg.GetAttributeString ? heroImg.GetAttributeString("heroname", "") : "";
                            if (heroNameAttr) {
                                if (targetHero.token && heroNameAttr === targetHero.token.replace("#", "")) return c;
                                if (heroNameAttr === targetHero.id || heroNameAttr === targetHero.icon) return c;
                                if (uniqueClasses.indexOf(heroNameAttr) !== -1) return c;
                            }
                        } catch (e) {}

                        // Match src substring
                        const src = heroImg.src || "";
                        if (src) {
                            if (targetHero.icon && src.indexOf(targetHero.icon) !== -1) return c;
                            if (targetHero.id && src.indexOf(targetHero.id) !== -1) return c;
                            if (targetHero.token && src.indexOf(targetHero.token.replace("#hero_", "")) !== -1) return c;
                        }
                    }
                }
            }
            return null;
        }

        triggerCardClick(panel) {
            if (!panel || !panel.IsValid()) return;
            try { $.DispatchEvent("Activated", panel, "mouse"); } catch (e) {}
            try { $.DispatchEvent("MouseActivate", panel, "mouse"); } catch (e) {}
            try { $.DispatchEvent("onactivate", panel); } catch (e) {}

            const cardShape = panel.FindChildTraverse("CardShape");
            if (cardShape && cardShape.IsValid()) {
                try { $.DispatchEvent("Activated", cardShape, "mouse"); } catch (e) {}
                try { $.DispatchEvent("MouseActivate", cardShape, "mouse"); } catch (e) {}
            }

            const cardBacker = panel.FindChildTraverse("CardBacker");
            if (cardBacker && cardBacker.IsValid()) {
                try { $.DispatchEvent("Activated", cardBacker, "mouse"); } catch (e) {}
                try { $.DispatchEvent("MouseActivate", cardBacker, "mouse"); } catch (e) {}
            }
        }

        triggerCardContextMenu(panel) {
            if (!panel || !panel.IsValid()) return;
            try { $.DispatchEvent("ContextMenu", panel, "mouse"); } catch (e) {}
            try { $.DispatchEvent("oncontextmenu", panel); } catch (e) {}

            const cardShape = panel.FindChildTraverse("CardShape");
            if (cardShape && cardShape.IsValid()) {
                try { $.DispatchEvent("ContextMenu", cardShape, "mouse"); } catch (e) {}
            }
        }

        applyRosterSelection(results, onComplete) {
            if (!results || results.length < 3) {
                if (onComplete) onComplete();
                return;
            }

            if (state.rosterApplied || state.isApplyingRoster) {
                log(">>> applyRosterSelection: Already applied or currently applying, skipping duplicate execution.");
                if (onComplete) onComplete();
                return;
            }

            state.isApplyingRoster = true;
            log(">>> applyRosterSelection: Applying 3 heroes with priorities to roster...");

            // Process slots sequentially: Slot 0 (1x RMB -> High) -> Slot 1 (0x RMB -> Standard) -> Slot 2 (0x RMB -> Standard)
            const setupHero = (slotIndex, callback) => {
                const result = results[slotIndex];
                if (!result || !result.hero) {
                    if (callback) callback();
                    return;
                }
                const hero = result.hero;
                const card = this.findHeroCardInRoster(hero);
                if (!card) {
                    logWarn(`Could not find roster card for ${hero.name}`);
                    if (callback) callback();
                    return;
                }

                try {
                    card.ScrollParentToMakeFullyVisible();
                } catch (e) {}

                const hasClass = (c, cls) => (c.BHasClass && c.BHasClass(cls)) || (c.HasClass && c.HasClass(cls));
                const inRoster = hasClass(card, "inRoster");

                // Step 1: Add to roster if not present
                if (!inRoster) {
                    log(`Adding ${hero.name} (Slot ${slotIndex}) to roster...`);
                    this.triggerCardClick(card);
                    try { $.DispatchEvent("CitadelRosterSelected", card); } catch (e) {}
                }

                // Step 2: Set priority with RMB clicks
                const rmbNeeded = result.rmbClicks || 0;
                log(`Setting priority for ${hero.name}: ${rmbNeeded}x RMB clicks needed.`);

                if (rmbNeeded === 0) {
                    $.Schedule(0.1, () => {
                        if (callback) callback();
                    });
                    return;
                }

                let rmbCount = 0;
                const doRmb = () => {
                    if (rmbCount >= rmbNeeded) {
                        log(`RMB cycles completed for ${hero.name}.`);
                        $.Schedule(0.1, () => {
                            if (callback) callback();
                        });
                        return;
                    }
                    rmbCount++;
                    log(`RMB click ${rmbCount}/${rmbNeeded} for ${hero.name}...`);
                    this.triggerCardContextMenu(card);
                    $.Schedule(0.1, doRmb);
                };

                $.Schedule(0.1, doRmb);
            };

            // Sequence: Slot 0 -> Slot 1 -> Slot 2
            setupHero(0, () => {
                setupHero(1, () => {
                    setupHero(2, () => {
                        state.isApplyingRoster = false;
                        state.rosterApplied = true;
                        log(">>> All 3 heroes successfully assigned in roster with target priorities!");
                        playSound("soundHeroCardActivate");
                        if (onComplete) onComplete();
                    });
                });
            });
        }
    }

    // Instantiate and boot
    const randomizerInstance = new CustomRandomizer();
    randomizerInstance.init();

    // Export globally for inspection, hot reloading, and XML snippet onactivate
    globalThis.__DeadlockCustomRandomizer = randomizerInstance;
    globalThis.OnCustomRandomizerActivated = () => {
        log("OnCustomRandomizerActivated triggered!");
        randomizerInstance.startRandomization();
    };
    try {
        const root = $.GetContextPanel();
        if (root) {
            root.OnCustomRandomizerActivated = globalThis.OnCustomRandomizerActivated;
            root.StartCustomRandomizer = globalThis.OnCustomRandomizerActivated;
        }
    } catch (e) {}
})();
