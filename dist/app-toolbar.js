/**
 * The AppToolbar class is the implementation of the main application toolbar.
 * It uses the App.view and App.toolbarView for enabling / disabling button.
 * Events are attached to the App.eventManager
 */
import { DocumentView } from './document-view.js';
import { EditorPanel } from './editor-panel.js';
import { ResponsiveView } from './responsive-view.js';
import { Toolbar } from './toolbar.js';
import { appendDivTo } from './utils/functions.js';
export class AppToolbar extends Toolbar {
    constructor(div, app) {
        super(div, app);
        this.active = true;
        let iconsArrowLeft = `${app.host}/music/icons/toolbar/arrow-left.png`;
        let iconsArrowRight = `${app.host}/music/icons/toolbar/arrow-right.png`;
        let iconsDocument = `${app.host}/music/icons/toolbar/document.png`;
        let iconsEditor = `${app.host}/music/icons/toolbar/editor.png`;
        let iconsGithubSignin = `${app.host}/music/icons/toolbar/github-signin.png`;
        let iconsCommunitySignin = `${app.host}/music/icons/toolbar/developer-community.svg`;
        let iconsLayout = `${app.host}/music/icons/toolbar/layout.png`;
        let iconsResponsive = `${app.host}/music/icons/toolbar/responsive.png`;
        let iconsZoomIn = `${app.host}/music/icons/toolbar/zoom-in.png`;
        let iconsZoomOut = `${app.host}/music/icons/toolbar/zoom-out.png`;
        let iconsSettings = `${app.host}/music/icons/toolbar/settings.png`;
        ////////////////////////////////////////////////////////////////////////
        // View selection
        ////////////////////////////////////////////////////////////////////////
        const viewSelectorMenu = appendDivTo(this.element, { class: `vrv-menu` });
        this.viewSelector = appendDivTo(viewSelectorMenu, { class: `vrv-btn-icon-left`, style: { backgroundImage: `url(${iconsLayout})` }, 'data-before': `View` });
        const viewSelectorSubmenuContent = appendDivTo(viewSelectorMenu, { class: `vrv-menu-content` });
        appendDivTo(viewSelectorSubmenuContent, { class: `vrv-v-separator` });
        let viewCount = 0;
        // if (this.app.options.enableDocument) {
        //     this.viewDocument = appendDivTo(viewSelectorSubmenuContent, { class: `vrv-menu-icon-left`, style: { backgroundImage: `url(${iconsDocument})` }, 'data-before': `Document` });
        //     this.viewDocument.dataset.view = 'document';
        //     this.app.eventManager.bind(this.viewDocument, 'click', this.app.setView);
        //     viewCount += 1;
        // }
        if (this.app.options.enableResponsive) {
            this.viewResponsive = appendDivTo(viewSelectorSubmenuContent, { class: `vrv-menu-icon-left`, style: { backgroundImage: `url(${iconsResponsive})` }, 'data-before': `Responsive` });
            this.viewResponsive.dataset.view = 'responsive';
            this.app.eventManager.bind(this.viewResponsive, 'click', this.app.setView);
            viewCount += 1;
        }
        // if (this.app.options.enableEditor) {
        //     this.viewEditor = appendDivTo(viewSelectorSubmenuContent, { class: `vrv-menu-icon-left`, style: { backgroundImage: `url(${iconsEditor})` }, 'data-before': `Editor` });
        //     this.viewEditor.dataset.view = 'editor';
        //     this.app.eventManager.bind(this.viewEditor, 'click', this.app.setView);
        //     viewCount += 1;
        // }
        if (viewCount === 1) {
            viewSelectorMenu.style.display = 'none';
        }
        ////////////////////////////////////////////////////////////////////////
        // File
        ////////////////////////////////////////////////////////////////////////
        const fileMenu = appendDivTo(this.element, { class: `vrv-menu` });
        if (!app.options.enableEditor)
            fileMenu.style.display = 'none';
        this.fileMenuBtn = appendDivTo(fileMenu, { class: `vrv-btn-text`, 'data-before': `File` });
        const fileMenuContent = appendDivTo(fileMenu, { class: `vrv-menu-content` });
        appendDivTo(fileMenuContent, { class: `vrv-v-separator` });
        this.fileImport = appendDivTo(fileMenuContent, { class: `vrv-menu-text`, 'data-before': `Import MEI file` });
        this.fileImport.dataset.ext = 'MEI';
        this.app.eventManager.bind(this.fileImport, 'click', this.app.fileImport);
        // this.fileImportMusicXML = appendDivTo(fileMenuContent, { class: `vrv-menu-text`, 'data-before': `Import MusicXML file` });
        // fileMenuContent.appendChild(this.fileImportMusicXML);
        // this.app.eventManager.bind(this.fileImportMusicXML, 'click', this.app.fileImport);
        // this.fileImportCMME = appendDivTo(fileMenuContent, { class: `vrv-menu-text`, 'data-before': `Import CMME file` });
        // fileMenuContent.appendChild(this.fileImportCMME);
        // this.app.eventManager.bind(this.fileImportCMME, 'click', this.app.fileImport);
        const fileRecentSubMenu = appendDivTo(fileMenuContent, { class: `vrv-submenu` });
        this.fileRecent = appendDivTo(fileRecentSubMenu, { class: `vrv-submenu-text`, 'data-before': `Recent files` });
        this.subSubMenu = appendDivTo(fileRecentSubMenu, { class: `vrv-submenu-content` });
        // appendDivTo(fileMenuContent, { class: `vrv-v-separator` });
        // const fileExport = appendDivTo(fileMenuContent, { class: `vrv-menu-text`, 'data-before': `Export MEI file` });
        // fileExport.dataset.ext = 'MEI';
        // this.app.eventManager.bind(fileExport, 'click', this.app.fileExport);
        // const fileCopy = appendDivTo(fileMenuContent, { class: `vrv-menu-text`, 'data-before': `Copy MEI to clipboard` });
        // this.app.eventManager.bind(fileCopy, 'click', this.app.fileCopyToClipboard);
        // appendDivTo(fileMenuContent, { class: `vrv-v-separator` });
        // const fileExportPDF = appendDivTo(fileMenuContent, { class: `vrv-menu-text`, 'data-before': `Export as PDF` });
        // this.app.eventManager.bind(fileExportPDF, 'click', this.app.fileExportPDF);
        // const fileExportMIDI = appendDivTo(fileMenuContent, { class: `vrv-menu-text`, 'data-before': `Export as MIDI` });
        // this.app.eventManager.bind(fileExportMIDI, 'click', this.app.fileExportMIDI);
        // appendDivTo(fileMenuContent, { class: `vrv-v-separator` });
        // this.fileSelection = appendDivTo(fileMenuContent, { class: `vrv-menu-text`, 'data-before': `Apply content selection` });
        // this.app.eventManager.bind(this.fileSelection, 'click', this.app.fileSelection);
        // ////////////////////////////////////////////////////////////////////////
        // // GitHub
        // ////////////////////////////////////////////////////////////////////////
        // this.githubMenu = appendDivTo(this.element, { class: `vrv-menu`, style: { display: `none` } });
        // appendDivTo(this.githubMenu, { class: `vrv-btn-text`, 'data-before': `GitHub` });
        // const githubMenuContent = appendDivTo(this.githubMenu, { class: `vrv-menu-content` });
        // appendDivTo(githubMenuContent, { class: `vrv-v-separator` });
        // this.githubImport = appendDivTo(githubMenuContent, { class: `vrv-menu-text`, 'data-before': `Import MEI file from GitHub` });
        // this.app.eventManager.bind(this.githubImport, 'click', this.app.githubImport);
        // this.githubExport = appendDivTo(githubMenuContent, { class: `vrv-menu-text`, 'data-before': `Export (commit/push) to GitHub` });
        // this.app.eventManager.bind(this.githubExport, 'click', this.app.githubExport);
        // ////////////////////////////////////////////////////////////////////////
        // // Navigation
        // ////////////////////////////////////////////////////////////////////////
        // this.pageControls = appendDivTo(this.element, { class: `vrv-btn-group` });
        // appendDivTo(this.pageControls, { class: `vrv-h-separator` });
        // this.prevPage = appendDivTo(this.pageControls, { class: `vrv-btn-icon-left`, style: { backgroundImage: `url(${iconsArrowLeft})` }, 'data-before': `Previous` });
        // this.app.eventManager.bind(this.prevPage, 'click', this.app.prevPage);
        // this.nextPage = appendDivTo(this.pageControls, { class: `vrv-btn-icon`, style: { backgroundImage: `url(${iconsArrowRight})` }, 'data-before': `Next` });
        // this.app.eventManager.bind(this.nextPage, 'click', this.app.nextPage);
        ////////////////////////////////////////////////////////////////////////
        // Zoom
        ////////////////////////////////////////////////////////////////////////
        this.zoomControls = appendDivTo(this.element, { class: `vrv-btn-group` });
        appendDivTo(this.zoomControls, { class: `vrv-h-separator` });
        this.zoomOut = appendDivTo(this.zoomControls, { class: `vrv-btn-icon-left`, style: { backgroundImage: `url(${iconsZoomOut})` }, 'data-before': `缩放` });
        this.app.eventManager.bind(this.zoomOut, 'click', this.app.zoomOut);
        this.zoomIn = appendDivTo(this.zoomControls, { class: `vrv-btn-icon`, style: { backgroundImage: `url(${iconsZoomIn})` }, 'data-before': `放大` });
        this.app.eventManager.bind(this.zoomIn, 'click', this.app.zoomIn);
        ////////////////////////////////////////////////////////////////////////
        // Sub-toolbars
        ////////////////////////////////////////////////////////////////////////
        this.midiPlayerSubToolbar = appendDivTo(this.element, {});
        this.editorSubToolbar = appendDivTo(this.element, {});

        // 选择曲谱
        const scoreMenu = appendDivTo(this.element, { class: `vrv-menu` });
        this.scoreMenuBtn = appendDivTo(scoreMenu, { class: `vrv-btn-text`, 'data-before': `选择曲谱播放` });


        this.scorePlayControl = appendDivTo(this.element, { class: `vrv-btn-group` });
        appendDivTo(this.scorePlayControl, { class: `vrv-h-separator` });
        this.openOrCloseTempo = appendDivTo(this.scorePlayControl, { class: `vrv-btn-text`, 'data-before': `打开节奏` });
        this.app.eventManager.bind(this.openOrCloseTempo, 'click', this.app.openOrCloseTempo);

        this.scoreCursorControl = appendDivTo(this.element, { class: `vrv-btn-group` });
        appendDivTo(this.scoreCursorControl, { class: `vrv-h-separator` });
        this.openOrCloseCursor = appendDivTo(this.scoreCursorControl, { class: `vrv-btn-text`, 'data-before': `关闭音符标` });
        this.app.eventManager.bind(this.openOrCloseCursor, 'click', this.app.openOrCloseCursor);

        this.scoreSqCursorControl = appendDivTo(this.element, { class: `vrv-btn-group` });
        appendDivTo(this.scoreSqCursorControl, { class: `vrv-h-separator` });
        this.openOrCloseSqCursor = appendDivTo(this.scoreSqCursorControl, { class: `vrv-btn-text`, 'data-before': `打开速度标` });
        this.app.eventManager.bind(this.openOrCloseSqCursor, 'click', this.app.openOrCloseSqCursor);

        const scoreMenuContent = appendDivTo(scoreMenu, { class: `vrv-menu-content` });
        appendDivTo(scoreMenuContent, { class: `vrv-v-separator` });

        this.loadScoreMenu(scoreMenu, scoreMenuContent);

        // ////////////////////////////////////////////////////////////////////////
        // // Settings
        // ////////////////////////////////////////////////////////////////////////
        // appendDivTo(this.element, { class: `vrv-h-separator` });
        // const settingsMenu = appendDivTo(this.element, { class: `vrv-menu` });
        // if (!app.options.enableEditor)
        //     settingsMenu.style.display = 'none';
        // appendDivTo(settingsMenu, { class: `vrv-btn-icon-left`, style: { backgroundImage: `url(${iconsSettings})` }, 'data-before': `Settings` });
        // const settingsMenuContent = appendDivTo(settingsMenu, { class: `vrv-menu-content` });
        // appendDivTo(settingsMenuContent, { class: `vrv-v-separator` });
        // this.settingsEditor = appendDivTo(settingsMenuContent, { class: `vrv-menu-text`, 'data-before': `Editor options` });
        // this.app.eventManager.bind(this.settingsEditor, 'click', this.app.settingsEditor);
        // this.settingsVerovio = appendDivTo(settingsMenuContent, { class: `vrv-menu-text`, 'data-before': `Verovio options` });
        // this.app.eventManager.bind(this.settingsVerovio, 'click', this.app.settingsVerovio);
        // ////////////////////////////////////////////////////////////////////////
        // // Help
        // ////////////////////////////////////////////////////////////////////////
        // appendDivTo(this.element, { class: `vrv-h-separator` });
        // const helpMenu = appendDivTo(this.element, { class: `vrv-menu` });
        // if (!app.options.enableEditor)
        //     helpMenu.style.display = 'none';
        // appendDivTo(helpMenu, { class: `vrv-btn-text`, 'data-before': `Help` });
        // const helpMenuContent = appendDivTo(helpMenu, { class: `vrv-menu-content` });
        // appendDivTo(helpMenuContent, { class: `vrv-v-separator` });
        // this.helpAbout = appendDivTo(helpMenuContent, { class: `vrv-menu-text`, 'data-before': `About this application` });
        // this.app.eventManager.bind(this.helpAbout, 'click', this.app.helpAbout);
        // this.helpReset = appendDivTo(helpMenuContent, { class: `vrv-menu-text`, 'data-before': `Reset to default` });
        // this.app.eventManager.bind(this.helpReset, 'click', this.app.helpReset);
        // ////////////////////////////////////////////////////////////////////////
        // // Login
        // ////////////////////////////////////////////////////////////////////////
        // this.loginGroup = appendDivTo(this.element, { class: `vrv-btn-group-right` });
        // if (!app.options.enableEditor)
        //     this.loginGroup.style.display = 'none';
        // appendDivTo(this.loginGroup, { class: `vrv-h-separator` });
        // this.logout = appendDivTo(this.loginGroup, { class: `vrv-btn-text`, style: { display: `none` }, 'data-before': `Logout` });
        // this.app.eventManager.bind(this.logout, 'click', this.app.logout);
        // this.login = appendDivTo(this.loginGroup, { class: `vrv-btn-icon`, style: { backgroundImage: `url(${iconsGithubSignin})` }, 'data-before': `Github` });
        // this.app.eventManager.bind(this.login, 'click', this.app.login);

        // developer community center
        this.loginGroup = appendDivTo(this.element, { class: `vrv-btn-group-right` });
        if (!app.options.enableEditor) {
            this.loginGroup.style.display = 'none';
        }
        appendDivTo(this.loginGroup, { class: `vrv-h-separator` });
        this.developerCenter = appendDivTo(this.loginGroup, { class: `vrv-btn-icon`, style: { backgroundImage: `url(${iconsCommunitySignin})` }, 'data-before': `开发社区` });
        this.app.eventManager.bind(this.loginGroup, 'click', this.app.login);
        
        // Bindings for hiding menu once an item has be click - the corresponding class is
        // removed when the toolbar is moused over
        for (const node of this.element.querySelectorAll('div.vrv-menu')) {
            this.eventManager.bind(node, 'mouseover', this.onMouseOver);
        }
        for (const node of this.element.querySelectorAll('div.vrv-menu-text')) {
            this.eventManager.bind(node, 'click', this.onClick);
        }
    }

    loadScoreMenu(scoreMenu, scoreMenuContent) {
        let self = this;
        let paths = ['/mei/list', '/music/mei/list']
        for (let i = 0; i < paths.length; i++) {
            fetch(paths[i]).then(function (response) {
                // if (response.status !== 200) {
                //     alert( 'File could not be fetched, loading default file');
                //     throw new Error( "Not 200 response" );
                // }
                if (response.status == 200) {
                    return response.text();
                }
                return null;
            }).then( function (text) {
                if (text) {
                    const fileList = text.split('\n').filter(item => item.length > 0);
                    self.initScoreMenu(scoreMenu, scoreMenuContent, fileList)
                }
            }).catch (err => {
                
            });
        }
    }
    initScoreMenu(scoreMenu, scoreMenuContent, fileList) {
        for (let i = 0; i < fileList.length; i++) {
            const filename = fileList[i];
            const filedirpath = '/music/mei/';
            const _score = appendDivTo(scoreMenuContent, { class: `vrv-menu-text`, 'data-before': filename });
            _score.dataset.filepath = `${filedirpath}${filename}.mei`;
            _score.dataset.filename = filename;
            this.app.eventManager.bind(_score, 'click', this.app.fileLoadMei);
        }
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    updateAll() {
        this.updateToolbarBtnEnabled(this.prevPage, (this.app.toolbarView.currentPage > 1));
        this.updateToolbarBtnEnabled(this.nextPage, (this.app.toolbarView.currentPage < this.app.pageCount));
        this.updateToolbarBtnEnabled(this.zoomOut, ((this.app.pageCount > 0) && (this.app.toolbarView.currentZoomIndex > 0)));
        this.updateToolbarBtnEnabled(this.zoomIn, ((this.app.pageCount > 0) && (this.app.toolbarView.currentZoomIndex < this.app.zoomLevels.length - 1)));
        // let isResponsive = ((this.app.view instanceof ResponsiveView) && !(this.app.view instanceof EditorPanel));
        let isResponsive = true;
        // let isEditor = (this.app.view instanceof EditorPanel);
        let isEditor = false;
        // let isDocument = (this.app.view instanceof DocumentView);
        let isDocument = false;
        const hasSelection = (this.app.options.selection && Object.keys(this.app.options.selection).length !== 0);
        this.updateToolbarGrp(this.pageControls, !isDocument);
        this.updateToolbarGrp(this.midiPlayerSubToolbar, isEditor || isResponsive);
        this.updateToolbarGrp(this.editorSubToolbar, isEditor);
        this.updateToolbarSubmenuBtn(this.viewDocument, isDocument);
        this.updateToolbarSubmenuBtn(this.viewResponsive, isResponsive);
        this.updateToolbarSubmenuBtn(this.viewEditor, isEditor);
        this.updateToolbarSubmenuBtn(this.fileSelection, hasSelection);
        if (this.app.githubManager.isLoggedIn()) {
            this.githubMenu.style.display = 'block';
            this.updateToolbarBtnDisplay(this.logout, true);
            this.login.setAttribute("data-before", this.app.githubManager.name);
            this.login.classList.add("inactivated");
        }
        this.updateRecent();
    }
    updateRecent() {
        this.subSubMenu.innerHTML = "";
        let fileList = this.app.fileStack.fileList();
        for (let i = 0; i < fileList.length; i++) {
            const entry = appendDivTo(this.subSubMenu, { class: `vrv-menu-text`, 'data-before': fileList[i].filename });
            entry.dataset.idx = fileList[i].idx.toString();
            this.app.eventManager.bind(entry, 'click', this.app.fileLoadRecent);
            this.eventManager.bind(entry, 'click', this.onClick);
        }
    }
    ////////////////////////////////////////////////////////////////////////
    // Mouse methods
    ////////////////////////////////////////////////////////////////////////
    updateMenuStat(e) {
        if (e.detail.name == 'tempo') {
            if (e.detail.stat) {
                this.openOrCloseTempo.setAttribute('data-before', '关闭节奏');
            } else {
                this.openOrCloseTempo.setAttribute('data-before', '打开节奏');
            }
        } else if (e.detail.name == 'cursor') {
            if (e.detail.stat == 0) {
                this.openOrCloseCursor.setAttribute('data-before', '打开音符标');
                this.openOrCloseSqCursor.setAttribute('data-before', '打开速度标');
                this.openOrCloseSqCursor.style.display = 'none';
            } else if (e.detail.stat == 1) {
                this.openOrCloseCursor.setAttribute('data-before', '关闭音符标');
                this.openOrCloseSqCursor.setAttribute('data-before', '打开速度标');
                this.openOrCloseSqCursor.style.display = 'block';
            } else if (e.detail.stat == 2) {
                this.openOrCloseCursor.setAttribute('data-before', '关闭音符标');
                this.openOrCloseSqCursor.setAttribute('data-before', '关闭速度标');
                this.openOrCloseSqCursor.style.display = 'block';
            }
        } else if (e.detail.name == 'score') {
            let filename = e.detail.filename
            let suffixIndex = e.detail.filename.indexOf('.mei');
            if (suffixIndex > -1) {
                filename = filename.substring(0, suffixIndex);
            }
            this.scoreMenuBtn.setAttribute("data-before", `当前曲谱 - ${filename}`);
        }
    }
    onMouseOver(e) {
        for (const node of this.element.querySelectorAll('div.vrv-menu-content')) {
            // Hide the menu content
            node.classList.remove("clicked");
        }
    }
    onClick(e) {
        for (const node of this.element.querySelectorAll('div.vrv-menu-content')) {
            // Remove the class so the menu content is shown again with a hover
            node.classList.add("clicked");

            if (e.target.dataset.before && e.target.dataset.filepath && e.target.dataset.filename) {
                this.scoreMenuBtn.setAttribute("data-before", `当前曲谱 - ${e.target.dataset.filename}`);
            }
        }
    }
    ////////////////////////////////////////////////////////////////////////
    // Event methods
    ////////////////////////////////////////////////////////////////////////
    onActivate(e) {
        if (!super.onActivate(e))
            return false;
        //console.debug("AppToolbar::onActivate");
        this.updateAll();
        return true;
    }
    onEndLoading(e) {
        if (!super.onEndLoading(e))
            return false;
        //console.debug("AppToolbar::onEndLoading");
        this.updateAll();
        return true;
    }
    onStartLoading(e) {
        if (!super.onStartLoading(e))
            return false;
        //console.debug("AppToolbar:onStartLoading");
        this.updateToolbarBtnEnabled(this.prevPage, false);
        this.updateToolbarBtnEnabled(this.nextPage, false);
        this.updateToolbarBtnEnabled(this.zoomOut, false);
        this.updateToolbarBtnEnabled(this.zoomIn, false);
        return true;
    }
    onUpdateView(e) {
        if (!super.onUpdateView(e))
            return false;
        //console.debug("AppToolbar::onUpdate");
        this.updateAll();
        return true;
    }
}
//# sourceMappingURL=app-toolbar.js.map