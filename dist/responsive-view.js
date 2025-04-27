/**
 * The ResponsiveView class implements a dynamic rendering view fitting and adjusting to the view port.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EditorView } from './editor-view.js';
import { VerovioView } from './verovio-view.js';
import { appendDivTo } from './utils/functions.js';
export class ResponsiveView extends VerovioView {
    constructor(div, app, verovio) {
        super(div, app, verovio);
        // initializes ui underneath the parent element, as well as Verovio communication
        this.svgWrapper = appendDivTo(this.element, { class: `vrv-svg-wrapper` });
        this.midiIds = [];
    }
    ////////////////////////////////////////////////////////////////////////
    // VerovioView update methods
    ////////////////////////////////////////////////////////////////////////
    updateView(update_1) {
        return __awaiter(this, arguments, void 0, function* (update, lightEndLoading = true) {
            switch (update) {
                case (VerovioView.Update.Activate):
                    yield this.updateActivate();
                    break;
                case (VerovioView.Update.LoadData):
                    yield this.updateLoadData();
                    break;
                case (VerovioView.Update.Resized):
                    yield this.updateResized();
                    break;
                case (VerovioView.Update.Update):
                    yield this.updateUpdateData();
                    break;
                case (VerovioView.Update.Zoom):
                    yield this.updateZoom();
                    break;
            }
            this.app.endLoading(lightEndLoading);
        });
    }
    updateActivate() {
        return __awaiter(this, void 0, void 0, function* () {
            this.app.verovioOptions.adjustPageHeight = true;
            this.app.verovioOptions.breaks = 'auto';
            this.app.verovioOptions.footer = 'none';
            this.app.verovioOptions.scale = this.currentScale;
            this.app.verovioOptions.pageHeight = this.svgWrapper.clientHeight * (100 / this.app.verovioOptions.scale);
            this.app.verovioOptions.pageWidth = this.svgWrapper.clientWidth * (100 / this.app.verovioOptions.scale);
            this.app.verovioOptions.justifyVertically = false;
            this.app.midiPlayer.view = this;
            this.midiIds = [];
            if (this.app.verovioOptions.pageHeight !== 0) {
                yield this.verovio.setOptions(this.app.verovioOptions);
            }
        });
    }
    updateLoadData() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(this instanceof EditorView)) {
                this.element.style.height = this.element.parentElement.style.height;
                this.element.style.width = this.element.parentElement.style.width;
            }
            if (this.ui && this.element && this.svgWrapper) {
                this.updateSVGDimensions();
                // Reset pageHeight and pageWidth to match the effective scaled viewport width
                this.app.verovioOptions.scale = this.currentScale;
                this.app.verovioOptions.pageHeight = this.svgWrapper.clientHeight * (100 / this.app.verovioOptions.scale);
                this.app.verovioOptions.pageWidth = this.svgWrapper.clientWidth * (100 / this.app.verovioOptions.scale);
                // Not sure why we need to remove the top margin from the calculation... to be investigated
                this.app.verovioOptions.pageHeight -= (this.app.verovioOptions.pageMarginTop) * (100 / this.app.verovioOptions.scale);
                if (this.app.verovioOptions.pageHeight !== 0) {
                    yield this.verovio.setOptions(this.app.verovioOptions);
                }
                if (this.app.pageCount > 0) {
                    yield this.verovio.setOptions(this.app.verovioOptions);
                    yield this.verovio.redoLayout(this.app.verovioOptions);
                    this.app.pageCount = yield this.verovio.getPageCount();
                    if (this.currentPage > this.app.pageCount) {
                        this.currentPage = this.app.pageCount;
                    }
                    yield this.renderPage();
                }
            }
        });
    }
    updateResized() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateLoadData();
        });
    }
    updateUpdateData() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.verovio.loadData(this.app.mei);
            this.app.pageCount = yield this.verovio.getPageCount();
            yield this.updateLoadData();
        });
    }
    updateZoom() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateLoadData();
        });
    }
    renderPage() {
        return __awaiter(this, arguments, void 0, function* (lightEndLoading = false) {
            const svg = yield this.verovio.renderToSVG(this.currentPage);
            this.svgWrapper.innerHTML = svg;
            if (lightEndLoading)
                this.app.endLoading(true);
        });
    }

    midiReset() {
        let sq_cursor = document.querySelector('#playback-sq-cursor');
        if (sq_cursor) {
            sq_cursor.setAttribute('x1', -100);
            sq_cursor.setAttribute('x2', -100);
        }

        if (this.cachedCursorArray) {
            for (let l = 0; l < this.cachedCursorArray.length; l++) {
                this.cachedCursorArray[l].setAttribute('x1', -100);
                this.cachedCursorArray[l].setAttribute('x2', -100);
            }
            this.cachedCursorArray = [];
        }

        this.tempoStop();

        for (let i = 0, len = this.midiIds.length; i < len; i++) {
            let note = this.svgWrapper.querySelector('#' + this.midiIds[i]);
            if (note) {
                note.style.filter = "";
            }
        }
        this.midiIds = [];
    }
    seekTempoProcess() {
        if (this.tickstack) {
            this.tickstack = [];
        }
    }
    tempoValid(valid) {
        this.isTempoValid = valid;
    }
    getTempoValid() {
        return this.isTempoValid;
    }
    cursorValid(valid) {
        this.stand_cursor = valid;
        if (!valid) {
            if (this.cachedCursorArray) {
                for (let l = 0; l < this.cachedCursorArray.length; l++) {
                    this.cachedCursorArray[l].setAttribute('x1', -100);
                    this.cachedCursorArray[l].setAttribute('x2', -100);
                }
            }
        }
    }
    getCursorValid() {
        return this.stand_cursor;
    }
    sqCursorValid(valid) {
        this.sq_cursor_flash = valid;
        if (!valid) {
            let sq_cursor = document.querySelector('#playback-sq-cursor');
            if (sq_cursor) {
                sq_cursor.setAttribute('x1', -100);
                sq_cursor.setAttribute('x2', -100);
            }
        }
    }
    getSqCursorValid() {
        return this.sq_cursor_flash;
    }
    getTempoPlayStatus() {
        return this.tempoPlayFlag;
    }
    tempoStop() {
        this.tempoPlayFlag = false;
    }
    tempoStart() {
        this.tempoPlayFlag = true;
    }
    initMetronomeAudio() {
        this.isTempoValid = false;
        this.tempoStart();
        /////// 
        let self = this
        if (window.AudioContext) {
            if (!this.audioContext) {
                this.audioContext = new AudioContext();    
            } 
            if (!this.firstTempoSoundBuffer) {
                let urls = ['/music/sounds/audio_tempo_up.mp3', '/sounds/audio_tempo_up.mp3']
                for (let i = 0; i < urls.length; i++) {
                    this.loadTempoSound(urls[i], (buffer) => { 
                        self.firstTempoSoundBuffer = buffer; 
                    });
                }
            }
            if (!this.tempoSoundBuffer) {
                let urls = ['/music/sounds/audio_tempo.mp3', '/sounds/audio_tempo.mp3']
                for (let i = 0; i < urls.length; i++) {
                    this.loadTempoSound(urls[i], (buffer) => { 
                        self.tempoSoundBuffer = buffer; 
                    });
                }
            }
        } else {
            alert('Web Audio API is not supported.');
        }
    }
    playTempo(isMeasureFirstBeat) {
        if (!this.isTempoValid) {
            this.tickstack = [];
            return;
        }
        if (!this.tickstack || this.tickstack.length == 0) {
            return;
        }
        if (this.tickstack && this.tickstack.length > 0) {
            this.tickstack.splice(0, 1);
        }
        
        if (!this.tempoPlayFlag) {
            return;
        }
        
        if (!this.audioContext) {
            return;
        }
        if (isMeasureFirstBeat) {
            if (!this.firstTempoSoundBuffer) return;
        } else {
            if (!this.tempoSoundBuffer) return;
        }
        
        
        const source = this.audioContext.createBufferSource();
        if (isMeasureFirstBeat) {
            source.buffer = this.firstTempoSoundBuffer;
        } else {
            source.buffer = this.tempoSoundBuffer;
        }

        source.connect(this.audioContext.destination);
        source.start(this.tick / 1000);
    }
    
    loadTempoSound(url, callback) {
        let self = this;
        fetch(url)
            .then(response => {
                if (response.status == 200) {
                    return response.arrayBuffer()
                }
                return ""
            })
            .then(data => {
                if (data) {
                    return self.audioContext.decodeAudioData(data)
                }
                return null;
            }).then(buffer => {
                if (buffer) {
                    callback(buffer)
                }
            })
            .catch(error => {
                // console.error('Error loading sound:', error)
            });
    }
    midiUpdate(time) {
        return __awaiter(this, void 0, void 0, function* () {
            //const animateStart = document.getElementById( "highlighting-start" );
            let vrvTime = time;

            let elementsAtTime = yield this.app.verovio.getElementsAtTime(vrvTime);
            if (Object.keys(elementsAtTime).length === 0 || elementsAtTime.page === 0) {
                //console.debug( "Nothing returned by getElementsAtTime" );
                return;
            }
            if (elementsAtTime.page != this.currentPage) {
                this.currentPage = elementsAtTime.page;
                this.app.startLoading("Loading content ...", true);
                let event = new CustomEvent('onPage');
                this.app.customEventManager.dispatch(event);
            }

            // alex:: cursor
            // Add or update cursor based on elementsAtTime
            // Always update cursor position on each tick
            let svgNS = "http://www.w3.org/2000/svg";
            let svg = this.svgWrapper.querySelector('svg');

            const ___count = 64;

            let self = this;

            if (this.isTempoValid && this.tempoPlayFlag) {
                let tempo_json_str = yield this.app.verovio.getTempo(vrvTime);
                let tempoObj = JSON.parse(tempo_json_str)
                if (tempoObj) {
                    this.measureBeatsCount = tempoObj.count;
                    if (!this.tempobegin) {
                        this.tempobegin = true;
                        this.measureBegin = tempoObj.begin;
                        this.tick = this.measureBegin;
                        this.tickstack = [];
                        this.tickstack.push(this.tick);
                        this.playTempo(true);
                        for (let i = 1; i < this.measureBeatsCount; i++) {
                            if (this.tickstack && this.tickstack.indexOf(self.measureBegin + tempoObj.beatduration * i) == -1) {
                                this.tickstack.push(this.measureBegin + tempoObj.beatduration * i);
                                setTimeout(() => {
                                    self.tick = self.measureBegin + tempoObj.beatduration * i;
                                    self.playTempo(false);
                                }, tempoObj.beatduration * i);
                            }
                        }
                    } else if (tempoObj.begin != this.measureBegin) {
                        this.measureBegin = tempoObj.begin;
                        this.tick = tempoObj.begin;
                        this.tickstack.push(this.tick);
                        this.playTempo(true);
                        for (let i = 1; i < this.measureBeatsCount; i++) {
                            if (this.tickstack && this.tickstack.indexOf(self.measureBegin + tempoObj.beatduration * i) == -1) {
                                this.tickstack.push(this.measureBegin + tempoObj.beatduration * i);
                                setTimeout(() => {
                                    self.tick = self.measureBegin + tempoObj.beatduration * i;
                                    self.playTempo(false);
                                }, tempoObj.beatduration * i);
                            }
                        }
                    }
                }
            }

            if (this.stand_cursor) {

                let _toolbar = document.querySelector('.vrv-toolbar');
                let toolbarHeight = _toolbar.getBoundingClientRect().height;
                let windowScrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

                toolbarHeight = toolbarHeight - windowScrollTop;

                let cursorPositioned = [];
                let cursorArray = [];
                let staffGroups = [];
                let staffCheckStat = [];
                let measure = null;

                let sq_cursor = null;

                if (elementsAtTime.notes.length > 0) {
                    for (let i = 0; i < elementsAtTime.notes.length; i++) {
                        let note = this.svgWrapper.querySelector('#' + elementsAtTime.notes[i]);
                        
                        if (note) {
                            const noteBBox = note.getBBox();
                            const ctm = note.getScreenCTM();                // 当前元素的坐标变换矩阵
                            const _point = note.ownerSVGElement.createSVGPoint();

                            _point.x = noteBBox.x + noteBBox.width / 2;
                            _point.y = noteBBox.y + noteBBox.height;

                            const cursorPoint = _point.matrixTransform(ctm);
                
                            let _measure = note.closest('g.measure');
                            let _system = _measure.closest('g.system');

                            let _systemLtPoint = note.ownerSVGElement.createSVGPoint();
                            let _systemBBox = _system.getBBox()
                            _systemLtPoint.x = _systemBBox.x + _systemBBox.width / 2;
                            _systemLtPoint.y = _systemBBox.y;

                            let _systemRbPoint = note.ownerSVGElement.createSVGPoint();
                            _systemRbPoint.x = _systemBBox.x;
                            _systemRbPoint.y = _systemBBox.y + _systemBBox.height;

                            const systemLtPoint = _systemLtPoint.matrixTransform(ctm);
                            const systemRbPoint = _systemRbPoint.matrixTransform(ctm);

                            if (_measure != measure) {
                                measure = _measure;
                                cursorPositioned = [];
                                cursorArray = [];
                                staffGroups = [];
                                staffCheckStat = [];

                                staffGroups = _measure.querySelectorAll('g.staff')

                                if (this.sq_cursor_flash) {
                                    /////////////////////////////////////////////////////////////////////
                                    sq_cursor = svg.querySelector('#playback-sq-cursor');
                                    if (!sq_cursor) {
                                        sq_cursor = document.createElementNS(svgNS, 'line');
                                        sq_cursor.setAttribute('id', 'playback-sq-cursor');
                                        sq_cursor.setAttribute('stroke', 'blue');
                                        sq_cursor.setAttribute('stroke-width', '2');
                                        sq_cursor.setAttribute('opacity', '0.5');
                                        
                                        svg.appendChild(sq_cursor);
                                    }

                                    let sq_cursor_rawX = 0;
                                    if (sq_cursor.getAttribute('x1')) {
                                        sq_cursor_rawX = parseFloat(sq_cursor.getAttribute('x1'))
                                    }
                                    let sq_cursor_rawY = 0;
                                    if (sq_cursor.getAttribute('y1')) {
                                        sq_cursor_rawY = parseFloat(sq_cursor.getAttribute('y1'))
                                    }

                                    let sq_cursor_rawY2 = 0;
                                    if (sq_cursor.getAttribute('y2')) {
                                        sq_cursor_rawY2 = parseFloat(sq_cursor.getAttribute('y2'))
                                    }

                                    // if (systemLtPoint.y - toolbarHeight == sq_cursor_rawY && cursorPoint.x > sq_cursor_rawX 
                                    //     || systemLtPoint.y - toolbarHeight != sq_cursor_rawY && systemLtPoint.y - toolbarHeight > sq_cursor_rawY2) {
                                    if (systemLtPoint.y - toolbarHeight == sq_cursor_rawY && cursorPoint.x > sq_cursor_rawX 
                                        || systemLtPoint.y - toolbarHeight != sq_cursor_rawY) {
                                    
                                        sq_cursor.setAttribute('x1', cursorPoint.x);
                                        sq_cursor.setAttribute('x2', cursorPoint.x);
                                        sq_cursor.setAttribute('y1', systemLtPoint.y - toolbarHeight);
                                        sq_cursor.setAttribute('y2', systemRbPoint.y - toolbarHeight);
                                    }

                                    let _barline = _measure.querySelector('g.barLine');
                                    let _barlinePoint = _measure.ownerSVGElement.createSVGPoint();
                                    let _barlineBBox = _barline.getBBox();
                                    _barlinePoint.x = _barlineBBox.x
                                    _barlinePoint.y = _barlineBBox.y
                                    const barlinePoint = _barlinePoint.matrixTransform(ctm);
                                    
                                    let _staffGroups = _measure.querySelectorAll('g.staff')
                                    let measureTsNotes = []
            
                                    let nextNoteIndex = -1;
            
                                    for (let k = 0; k < _staffGroups.length; k++) {
                                        
                                        let singleStaffGroup = _staffGroups[k];
                                        let singleStaffNotes = singleStaffGroup.querySelectorAll('g.note');
            
                                        if (singleStaffNotes) {
                                            for (let j = 0; j < singleStaffNotes.length; j++) {
                                                let singleStaffNoteId = singleStaffNotes[j].id
                                                let singleStaffNoteTime = yield this.app.verovio.getTimeForElement(singleStaffNoteId)
                                                let _singleStaffNotePoint = _measure.ownerSVGElement.createSVGPoint();
                                                let singleStaffNoteBBox = singleStaffNotes[j].getBBox()
                                                _singleStaffNotePoint.x = singleStaffNoteBBox.x + singleStaffNoteBBox.width / 2;
                                                _singleStaffNotePoint.y = singleStaffNoteBBox.y;
            
                                                const singleStaffNotePoint = _singleStaffNotePoint.matrixTransform(ctm);
                                                
                                                measureTsNotes.push({
                                                    id: singleStaffNoteId,
                                                    time: singleStaffNoteTime,
                                                    x: singleStaffNotePoint.x,
                                                    y1: systemLtPoint.y - toolbarHeight,
                                                    y2: systemRbPoint.y - toolbarHeight
                                                })
                                            }
                                        }
                                        
                                        // let singleStaffRests1 = singleStaffGroup.querySelectorAll('g.mRest');
                                        let singleStaffRests2 = singleStaffGroup.querySelectorAll('g.rest');
                                        let singleStaffRests = []
                                        // if (singleStaffRests1) {
                                        //     singleStaffRests.push(...singleStaffRests1)
                                        // }
                                        if (singleStaffRests2) {
                                            singleStaffRests.push(...singleStaffRests2)
                                        }
            
                                        for (let j = 0; j < singleStaffRests.length; j++) {
                                            let singleStaffNoteId = singleStaffRests[j].id
                                            let singleStaffNoteTime = yield this.app.verovio.getTimeForElement(singleStaffNoteId)
                                            let _singleStaffNotePoint = _measure.ownerSVGElement.createSVGPoint();
                                            let singleStaffNoteBBox = singleStaffRests[j].getBBox()
                                            _singleStaffNotePoint.x = singleStaffNoteBBox.x + singleStaffNoteBBox.width / 2;
                                            _singleStaffNotePoint.y = singleStaffNoteBBox.y;
            
                                            const singleStaffNotePoint = _singleStaffNotePoint.matrixTransform(ctm);
                                            
                                            measureTsNotes.push({
                                                id: singleStaffNoteId,
                                                time: singleStaffNoteTime,
                                                x: singleStaffNotePoint.x,
                                                y1: systemLtPoint.y - toolbarHeight,
                                                y2: systemRbPoint.y - toolbarHeight
                                            })
                                        }
                                    
                                    }
            
                                    
                                    measureTsNotes = measureTsNotes.sort((a, b) => a.time < b.time)
            
                                    for (let i = 0; i < measureTsNotes.length; i++) {
                                        if (measureTsNotes[i].time > time && measureTsNotes[i].x > cursorPoint.x) {
                                            nextNoteIndex = i;
                                            break;
                                        }
                                    }
            
                                    let nextFlag = false;
                                    if (nextNoteIndex > 0) {
                                        for (let i = 0; i < ___count; i++) {
                                            let disx = (measureTsNotes[nextNoteIndex].x - cursorPoint.x) / ___count * (i + 1);
                                            let distime = (measureTsNotes[nextNoteIndex].time - time) / ___count * (i + 1);
                                            let destx = cursorPoint.x + disx
                                            
                                            setTimeout(() => {
                                                let sq_cursor_rawX = 0;
                                                if (sq_cursor.getAttribute('x1')) {
                                                    sq_cursor_rawX = parseFloat(sq_cursor.getAttribute('x1'))
                                                }
                                                let sq_cursor_rawY = 0;
                                                if (sq_cursor.getAttribute('y1')) {
                                                    sq_cursor_rawY = parseFloat(sq_cursor.getAttribute('y1'))
                                                }

                                                let sq_cursor_rawY2 = 0;
                                                if (sq_cursor.getAttribute('y2')) {
                                                    sq_cursor_rawY2 = parseFloat(sq_cursor.getAttribute('y2'))
                                                }

                                                // if (measureTsNotes[0].y1 == sq_cursor_rawY && destx > sq_cursor_rawX 
                                                //     || measureTsNotes[0].y1 != sq_cursor_rawY && measureTsNotes[0].y1 > sq_cursor_rawY2) {
                                                if (measureTsNotes[0].y1 == sq_cursor_rawY && destx > sq_cursor_rawX 
                                                    || measureTsNotes[0].y1 != sq_cursor_rawY) {
                                                    sq_cursor.setAttribute('x1', destx);
                                                    sq_cursor.setAttribute('x2', destx);
                                                    sq_cursor.setAttribute('y1', measureTsNotes[0].y1);
                                                    sq_cursor.setAttribute('y2', measureTsNotes[0].y2);
                                                }
                                                
                                            }, distime)
                                        }
                                        
                                    } else {
                                        nextFlag = true;
                                    }
                                    
                                    if (nextFlag) {
                                        let _systemMeasures = [];
                                        let nextMeasure = null;
                                        let nextstaffGroups = [];
                                        let __measureGroups1 = _system.querySelectorAll('g.measure');
                                        let measureGroups1 = []
                                        for (let i = 0; i < __measureGroups1.length; i++) {
                                            if (__measureGroups1[i].id != _measure.id) {
                                                measureGroups1.push(__measureGroups1[i]);
                                            }
                                        }
                                        
                                        let nextmeasureTsNotes = []
                                        if (measureGroups1) {
                                            for (let i = 0; i < measureGroups1.length; i++) {
                                                let delgatemeasure1 = measureGroups1[i]
                                                let delgatenote1 = delgatemeasure1.querySelector('g.note')
                                                
                                                // let delgatenoteTime1 = yield this.app.verovio.getTimeForElement(delgatenote1.id)
                                                let _delgatenotePoint1 = _measure.ownerSVGElement.createSVGPoint();
                                                let delgatenotePointBBox1 = delgatenote1.getBBox()
                                                _delgatenotePoint1.x = delgatenotePointBBox1.x + delgatenotePointBBox1.width / 2;
                                                _delgatenotePoint1.y = delgatenotePointBBox1.y;
            
                                                const delgatenotePoint1 = _delgatenotePoint1.matrixTransform(ctm);
                                                _systemMeasures.push({
                                                    measure: delgatemeasure1,
                                                    // time: delgatenoteTime1,
                                                    x: delgatenotePoint1.x
                                                })
                                            }
                                            _systemMeasures = _systemMeasures.filter(item => item.x > barlinePoint.x).sort((a, b) => a.x < b.x)
                                            
                                            let ___system = null;
                                            if (_systemMeasures.length > 0) {
                                                nextMeasure = _systemMeasures[0].measure
            
                                                nextstaffGroups = nextMeasure.querySelectorAll('g.staff')
                                                ___system = _system;
                                            } else {
                                                let page = _system.closest('g.page-margin');
                                                if (page) {
                                                    let ___systemGroups = page.querySelectorAll('g.system');
                                                    let _systemGroups = []
                                                    for (let i = 0; i < ___systemGroups.length; i++) {
                                                        if (___systemGroups[i].id != _system.id) {
                                                            _systemGroups.push(___systemGroups[i]);
                                                        }
                                                    }
                                                    let _delgateSystemNotes = [];
                                                    for (let j = 0; j < _systemGroups.length; j++) {
                                                        let _singleSystem = _systemGroups[j];
            
                                                        let delgateSystemNote = _singleSystem.querySelector('g.note');
                                                        if (!delgateSystemNote) {
                                                            delgateSystemNote = _singleSystem.querySelector('g.rest');
                                                        }
                                                        // if (!delgateSystemNote) {
                                                        //     delgateSystemNote = _singleSystem.querySelector('g.mRest');
                                                        // }
            
                                                        if (delgateSystemNote) {
                                                            let _delgateSystemNoteTime = yield this.app.verovio.getTimeForElement(delgateSystemNote.id)
                                                            _delgateSystemNotes.push({
                                                                system: _singleSystem,
                                                                time: _delgateSystemNoteTime
                                                            })
                                                        }
                                                    }
                                                    _delgateSystemNotes = _delgateSystemNotes.sort((a, b) => a.time < b.time)
                                                    if (_delgateSystemNotes.length > 0) {
                                                        let measureGroups1 = _delgateSystemNotes[0].system.querySelectorAll('g.measure');
                                                        
                                                        if (measureGroups1) {
                                                            for (let i = 0; i < measureGroups1.length; i++) {
                                                                let delgatemeasure1 = measureGroups1[i]
                                                                let delgatenote1 = delgatemeasure1.querySelector('g.note')
                                                                
                                                                let delgatenoteTime1 = yield this.app.verovio.getTimeForElement(delgatenote1.id)
                                                                let _delgatenotePoint1 = _measure.ownerSVGElement.createSVGPoint();
                                                                let delgatenotePointBBox1 = delgatenote1.getBBox()
                                                                _delgatenotePoint1.x = delgatenotePointBBox1.x + delgatenotePointBBox1.width / 2;
                                                                _delgatenotePoint1.y = delgatenotePointBBox1.y;
                            
                                                                const delgatenotePoint1 = _delgatenotePoint1.matrixTransform(ctm);
                                                                _systemMeasures.push({
                                                                    measure: delgatemeasure1,
                                                                    time: delgatenoteTime1,
                                                                    x: delgatenotePoint1.x
                                                                })
                                                            }
                                                            _systemMeasures = _systemMeasures.sort((a, b) => a.time < b.time)
                            
                                                            if (_systemMeasures.length > 0) {
                                                                nextMeasure = _systemMeasures[0].measure
                            
                                                                nextstaffGroups = nextMeasure.querySelectorAll('g.staff')
                                                                ___system = _delgateSystemNotes[0].system;
                                                            } 
                                                        }
                                                    }
                                                }
                                            }
            
                                            if (nextstaffGroups) {
                                                for (let k = 0; k < nextstaffGroups.length; k++) {
                                                
                                                    let singleStaffGroup = nextstaffGroups[k];
                                                    let singleStaffNotes = singleStaffGroup.querySelectorAll('g.note');
                                                    
                                                    if (singleStaffNotes) {
                                                        for (let j = 0; j < singleStaffNotes.length; j++) {
                                                            let singleStaffNoteId = singleStaffNotes[j].id
                                                            let singleStaffNoteTime = yield this.app.verovio.getTimeForElement(singleStaffNoteId)
                                                            let _singleStaffNotePoint = _measure.ownerSVGElement.createSVGPoint();
                                                            let singleStaffNoteBBox = singleStaffNotes[j].getBBox()
                                                            _singleStaffNotePoint.x = singleStaffNoteBBox.x + singleStaffNoteBBox.width / 2;
                                                            _singleStaffNotePoint.y = singleStaffNoteBBox.y;
            
                                                            const singleStaffNotePoint = _singleStaffNotePoint.matrixTransform(ctm);
                                                            
                                                            nextmeasureTsNotes.push({
                                                                note: singleStaffNotes[j],
                                                                system: ___system,
                                                                id: singleStaffNoteId,
                                                                time: singleStaffNoteTime,
                                                                x: singleStaffNotePoint.x,
                                                                y1: systemLtPoint.y - toolbarHeight,
                                                                y2: systemRbPoint.y - toolbarHeight
                                                            })
                                                        }
                                                    }
            
            
                                                    // let singleStaffRests1 = singleStaffGroup.querySelectorAll('g.mRest');
                                                    let singleStaffRests2 = singleStaffGroup.querySelectorAll('g.rest');
                                                    let singleStaffRests = []
                                                    // if (singleStaffRests1) {
                                                    //     singleStaffRests.push(...singleStaffRests1)
                                                    // }
                                                    if (singleStaffRests2) {
                                                        singleStaffRests.push(...singleStaffRests2)
                                                    }
            
                                                    for (let j = 0; j < singleStaffRests.length; j++) {
                                                        let singleStaffNoteId = singleStaffRests[j].id
                                                        let singleStaffNoteTime = yield this.app.verovio.getTimeForElement(singleStaffNoteId)
                                                        let _singleStaffNotePoint = _measure.ownerSVGElement.createSVGPoint();
                                                        let singleStaffNoteBBox = singleStaffRests[j].getBBox()
                                                        _singleStaffNotePoint.x = singleStaffNoteBBox.x + singleStaffNoteBBox.width / 2;
                                                        _singleStaffNotePoint.y = singleStaffNoteBBox.y;
            
                                                        const singleStaffNotePoint = _singleStaffNotePoint.matrixTransform(ctm);
                                                        
                                                        nextmeasureTsNotes.push({
                                                            note: singleStaffRests[j],
                                                            system: ___system,
                                                            id: singleStaffNoteId,
                                                            time: singleStaffNoteTime,
                                                            x: singleStaffNotePoint.x,
                                                            y1: systemLtPoint.y - toolbarHeight,
                                                            y2: systemRbPoint.y - toolbarHeight
                                                        })
                                                    }
                                                    
                                                }
                                            }
                                        }
            
                                        nextmeasureTsNotes = nextmeasureTsNotes.sort((a, b) => a.time < b.time)
            
                                        if (nextmeasureTsNotes.length > 0) {
                                            if (nextmeasureTsNotes[0].x > cursorPoint.x) {
                                                for (let i = 0; i < ___count; i++) {
                                                    let disx = (nextmeasureTsNotes[0].x - cursorPoint.x) / ___count * (i + 1);
                                                    let distime = (nextmeasureTsNotes[0].time - time) / ___count * (i + 1);
                                                    let destx = cursorPoint.x + disx
                                                    setTimeout(() => {
                                                        let sq_cursor_rawX = 0;
                                                        if (sq_cursor.getAttribute('x1')) {
                                                            sq_cursor_rawX = parseFloat(sq_cursor.getAttribute('x1'))
                                                        }

                                                        let sq_cursor_rawY = 0;
                                                        if (sq_cursor.getAttribute('y1')) {
                                                            sq_cursor_rawY = parseFloat(sq_cursor.getAttribute('y1'))
                                                        }

                                                        let sq_cursor_rawY2 = 0;
                                                        if (sq_cursor.getAttribute('y2')) {
                                                            sq_cursor_rawY2 = parseFloat(sq_cursor.getAttribute('y2'))
                                                        }

                                                        // if (measureTsNotes[0].y1 == sq_cursor_rawY && destx > sq_cursor_rawX 
                                                        //     || measureTsNotes[0].y1 != sq_cursor_rawY && measureTsNotes[0].y1 > sq_cursor_rawY2) {
                                                        if (measureTsNotes[0].y1 == sq_cursor_rawY && destx > sq_cursor_rawX 
                                                            || measureTsNotes[0].y1 != sq_cursor_rawY) {
                                                        
                                                            sq_cursor.setAttribute('x1', destx);
                                                            sq_cursor.setAttribute('x2', destx);
                                                            sq_cursor.setAttribute('y1', measureTsNotes[0].y1);
                                                            sq_cursor.setAttribute('y2', measureTsNotes[0].y2);
                                                        }
                                                    }, distime)
                                                }
                                            } else {
                                                for (let i = 0; i < ___count / 2; i++) {
                                                    let disx = (barlinePoint.x - cursorPoint.x) / (___count / 2) * (i + 1);
                                                    if (disx > 0) {
                                                        let distime = (nextmeasureTsNotes[0].time - time) / ___count * (i + 1);
                                                        let destx = cursorPoint.x + disx
                                                        
                                                        setTimeout(() => {
                                                            let sq_cursor_rawX = 0;
                                                            if (sq_cursor.getAttribute('x1')) {
                                                                sq_cursor_rawX = parseFloat(sq_cursor.getAttribute('x1'))
                                                            }

                                                            let sq_cursor_rawY = 0;
                                                            if (sq_cursor.getAttribute('y1')) {
                                                                sq_cursor_rawY = parseFloat(sq_cursor.getAttribute('y1'))
                                                            }

                                                            let sq_cursor_rawY2 = 0;
                                                            if (sq_cursor.getAttribute('y2')) {
                                                                sq_cursor_rawY2 = parseFloat(sq_cursor.getAttribute('y2'))
                                                            }

                                                            // if (measureTsNotes[0].y1 == sq_cursor_rawY && destx > sq_cursor_rawX 
                                                            //     || measureTsNotes[0].y1 != sq_cursor_rawY && measureTsNotes[0].y1 > sq_cursor_rawY2) {
                                                            if (measureTsNotes[0].y1 == sq_cursor_rawY && destx > sq_cursor_rawX 
                                                                || measureTsNotes[0].y1 != sq_cursor_rawY) {
                                                            
                                                                sq_cursor.setAttribute('x1', destx);
                                                                sq_cursor.setAttribute('x2', destx);
                                                                sq_cursor.setAttribute('y1', measureTsNotes[0].y1);
                                                                sq_cursor.setAttribute('y2', measureTsNotes[0].y2);
                                                            }
                                                        }, distime)
                                                    }
                                                }
                                                let _grpSym = nextmeasureTsNotes[0].system.querySelector('g.grpSym');
                                                if (_grpSym) {
                                                    let _startBracePoint = nextmeasureTsNotes[0].note.ownerSVGElement.createSVGPoint();
                                                    let _startBracePointBBox = _grpSym.getBBox()
                                                    _startBracePoint.x = _startBracePointBBox.x;
                                                    _startBracePoint.y = _startBracePointBBox.y;

                                                    const startBracePoint = _startBracePoint.matrixTransform(ctm);
                                                    for (let i = ___count / 2; i < ___count; i++) {
                                                        let disx = (nextmeasureTsNotes[0].x - startBracePoint.x) / (___count / 2) * (i - ___count / 2 + 1);
                                                        let distime = (nextmeasureTsNotes[0].time - time) / ___count * (i + 1);
                                                        let destx = startBracePoint.x + disx
                                                        
                                                        setTimeout(() => {
                                                            let sq_cursor_rawX = 0;
                                                            if (sq_cursor.getAttribute('x1')) {
                                                                sq_cursor_rawX = parseFloat(sq_cursor.getAttribute('x1'))
                                                            }
                                                            let sq_cursor_rawY = 0;
                                                            if (sq_cursor.getAttribute('y1')) {
                                                                sq_cursor_rawY = parseFloat(sq_cursor.getAttribute('y1'))
                                                            }

                                                            let sq_cursor_rawY2 = 0;
                                                            if (sq_cursor.getAttribute('y2')) {
                                                                sq_cursor_rawY2 = parseFloat(sq_cursor.getAttribute('y2'))
                                                            }

                                                            // if (measureTsNotes[0].y1 == sq_cursor_rawY && destx > sq_cursor_rawX 
                                                            //     || measureTsNotes[0].y1 != sq_cursor_rawY && measureTsNotes[0].y1 > sq_cursor_rawY2) {
                                                            if (measureTsNotes[0].y1 == sq_cursor_rawY && destx > sq_cursor_rawX 
                                                                || measureTsNotes[0].y1 != sq_cursor_rawY) {
                                                            
                                                                sq_cursor.setAttribute('x1', destx);
                                                                sq_cursor.setAttribute('x2', destx);
                                                                sq_cursor.setAttribute('y1', measureTsNotes[0].y1);
                                                                sq_cursor.setAttribute('y2', measureTsNotes[0].y2);
                                                            }
                                                        }, distime)
                                                    }
                                                }
                                            }
                                        } 
                                    }
                                    /////////////////////////////////////////////////////////////////////
                                } else {
                                    sq_cursor = svg.querySelector('#playback-sq-cursor');
                                    if (sq_cursor) {
                                        sq_cursor.setAttribute('x1', -100);
                                        sq_cursor.setAttribute('x2', -100);
                                    }
                                }

                                for (let k = 0; k < staffGroups.length; k++) {

                                    let __cursor = svg.querySelector('#playback-cursor' + (k + 1));
                                    if (!__cursor) {
                                        __cursor = document.createElementNS(svgNS, 'line');
                                        __cursor.setAttribute('id', 'playback-cursor' + (k + 1));
                                        __cursor.setAttribute('stroke', 'green');
                                        __cursor.setAttribute('stroke-width', '4');
                                        __cursor.setAttribute('opacity', '0.6');
                                        
                                        svg.appendChild(__cursor);
                                    }
                                    cursorArray.push(__cursor);
                                    cursorPositioned.push(false);
                                    staffCheckStat.push(false);
                                }
                            }


                            ///////////////////
                            const _staffGroup = note.closest('g.staff');
                            if (_staffGroup) {
                                let targetStaffIndex = -1;
                                for (let j = 0; j < staffGroups.length; j++) {
                                    if (staffGroups[j] == _staffGroup) {
                                        targetStaffIndex = j;
                                        break;
                                    }
                                }
                                if (targetStaffIndex > -1 && !staffCheckStat[targetStaffIndex]) {
                                    const staffBox = _staffGroup.getBBox();
                                    const _staffLtPoint = note.ownerSVGElement.createSVGPoint();
                                    _staffLtPoint.x = staffBox.x;
                                    _staffLtPoint.y = staffBox.y;

                                    const _staffRbPoint = note.ownerSVGElement.createSVGPoint();
                                    _staffRbPoint.x = staffBox.x + staffBox.width;
                                    _staffRbPoint.y = staffBox.y + staffBox.height;

                                    const staffLtPoint = _staffLtPoint.matrixTransform(ctm);
                                    const staffRbPoint = _staffRbPoint.matrixTransform(ctm);

                                    staffCheckStat[targetStaffIndex] = true;

                                    cursorArray[targetStaffIndex].setAttribute('x1', cursorPoint.x);
                                    cursorArray[targetStaffIndex].setAttribute('x2', cursorPoint.x);
                                    cursorArray[targetStaffIndex].setAttribute('y1', staffLtPoint.y - toolbarHeight);
                                    cursorArray[targetStaffIndex].setAttribute('y2', staffRbPoint.y - toolbarHeight);

                                    cursorPositioned[targetStaffIndex] = true;
                                }
                                
                            }
                            
                            let _cursorPositioned = cursorPositioned.filter(item => item === true)
                            if (_cursorPositioned.length == cursorPositioned.length) {
                                break;
                            }

                        }
                    }
                    
                } else if (elementsAtTime.rests && elementsAtTime.rests.length > 0) { // rest mscore-beam-none ;   rest;    mRest
                    for (let i = 0; i < elementsAtTime.rests.length; i++) {
                        let note = this.svgWrapper.querySelector('#' + elementsAtTime.rests[i]);
                        if (note) {
                            const ctm = note.getScreenCTM(); 

                            const _point = note.ownerSVGElement.createSVGPoint();

                            let noteBBox = note.getBBox();

                            _point.x = noteBBox.x + noteBBox.width / 2;
                            _point.y = noteBBox.y + noteBBox.height;

                            const cursorPoint = _point.matrixTransform(ctm);

                            let _system = note.closest('g.system');

                            let _systemLtPoint = note.ownerSVGElement.createSVGPoint();
                            let _systemBBox = _system.getBBox()
                            _systemLtPoint.x = _systemBBox.x + _systemBBox.width / 2;
                            _systemLtPoint.y = _systemBBox.y;

                            let _systemRbPoint = note.ownerSVGElement.createSVGPoint();
                            _systemRbPoint.x = _systemBBox.x;
                            _systemRbPoint.y = _systemBBox.y + _systemBBox.height;
                            
                            const systemLtPoint = _systemLtPoint.matrixTransform(ctm);
                            const systemRbPoint = _systemRbPoint.matrixTransform(ctm);

                            if (this.sq_cursor_flash) {
                                sq_cursor = svg.querySelector('#playback-sq-cursor');
                                if (!sq_cursor) {
                                    sq_cursor = document.createElementNS(svgNS, 'line');
                                    sq_cursor.setAttribute('id', 'playback-sq-cursor');
                                    sq_cursor.setAttribute('stroke', 'blue');
                                    sq_cursor.setAttribute('stroke-width', '2');
                                    sq_cursor.setAttribute('opacity', '0.5');
                                    
                                    svg.appendChild(sq_cursor);
                                }

                                let sq_cursor_rawX = 0;
                                if (sq_cursor.getAttribute('x1')) {
                                    sq_cursor_rawX = parseFloat(sq_cursor.getAttribute('x1'))
                                }
                                let sq_cursor_rawY = 0;
                                if (sq_cursor.getAttribute('y1')) {
                                    sq_cursor_rawY = parseFloat(sq_cursor.getAttribute('y1'))
                                }
                                let sq_cursor_rawY2 = 0;
                                if (sq_cursor.getAttribute('y2')) {
                                    sq_cursor_rawY2 = parseFloat(sq_cursor.getAttribute('y2'))
                                }

                                // if (systemLtPoint.y - toolbarHeight == sq_cursor_rawY && cursorPoint.x > sq_cursor_rawX 
                                //     || systemLtPoint.y - toolbarHeight != sq_cursor_rawY && systemLtPoint.y - toolbarHeight > sq_cursor_rawY2) {
                                if (systemLtPoint.y - toolbarHeight == sq_cursor_rawY && cursorPoint.x > sq_cursor_rawX 
                                    || systemLtPoint.y - toolbarHeight != sq_cursor_rawY) {
                                
                                    sq_cursor.setAttribute('x1', cursorPoint.x);
                                    sq_cursor.setAttribute('x2', cursorPoint.x);
                                    sq_cursor.setAttribute('y1', systemLtPoint.y - toolbarHeight);
                                    sq_cursor.setAttribute('y2', systemRbPoint.y - toolbarHeight);
                                }

                                let _measure = note.closest('g.measure');

                                if (_measure) {

                                    let _barline = _measure.querySelector('g.barLine');
                                    let _barlinePoint = note.ownerSVGElement.createSVGPoint();
                                    let _barlineBBox = _barline.getBBox();
                                    _barlinePoint.x = _barlineBBox.x
                                    _barlinePoint.y = _barlineBBox.y
                                    const barlinePoint = _barlinePoint.matrixTransform(ctm);
                                    
                                    let _staffGroups = _measure.querySelectorAll('g.staff')
                                    let measureTsNotes = []
            
                                    let nextNoteIndex = -1;
            
                                    for (let k = 0; k < _staffGroups.length; k++) {
                                        
                                        let singleStaffGroup = _staffGroups[k];
                                        let singleStaffNotes = singleStaffGroup.querySelectorAll('g.note');
            
                                        if (singleStaffNotes) {
                                            for (let j = 0; j < singleStaffNotes.length; j++) {
                                                let singleStaffNoteId = singleStaffNotes[j].id
                                                let singleStaffNoteTime = yield this.app.verovio.getTimeForElement(singleStaffNoteId)
                                                let _singleStaffNotePoint = note.ownerSVGElement.createSVGPoint();
                                                let singleStaffNoteBBox = singleStaffNotes[j].getBBox()
                                                _singleStaffNotePoint.x = singleStaffNoteBBox.x + singleStaffNoteBBox.width / 2;
                                                _singleStaffNotePoint.y = singleStaffNoteBBox.y;
            
                                                const singleStaffNotePoint = _singleStaffNotePoint.matrixTransform(ctm);
                                                
                                                measureTsNotes.push({
                                                    type: 'note',
                                                    id: singleStaffNoteId,
                                                    time: singleStaffNoteTime,
                                                    x: singleStaffNotePoint.x,
                                                    y1: systemLtPoint.y - toolbarHeight,
                                                    y2: systemRbPoint.y - toolbarHeight
                                                })
                                            }
                                        }
                                        
                                        // let singleStaffRests1 = singleStaffGroup.querySelectorAll('g.mRest');
                                        let singleStaffRests2 = singleStaffGroup.querySelectorAll('g.rest');
                                        
                                        let singleStaffRests = []
                                        // if (singleStaffRests1) {
                                        //     singleStaffRests.push(...singleStaffRests1)
                                        // }
                                        if (singleStaffRests2) {
                                            singleStaffRests.push(...singleStaffRests2)
                                        }
                                        
                                        for (let j = 0; j < singleStaffRests.length; j++) {
                                            let singleStaffNoteId = singleStaffRests[j].id
                                            let singleStaffNoteTime = yield this.app.verovio.getTimeForElement(singleStaffNoteId)
                                            let _singleStaffNotePoint = note.ownerSVGElement.createSVGPoint();
                                            let singleStaffNoteBBox = singleStaffRests[j].getBBox()
                                            _singleStaffNotePoint.x = singleStaffNoteBBox.x + singleStaffNoteBBox.width / 2;
                                            _singleStaffNotePoint.y = singleStaffNoteBBox.y;
            
                                            const singleStaffNotePoint = _singleStaffNotePoint.matrixTransform(ctm);
                                            
                                            measureTsNotes.push({
                                                type: 'rest',
                                                id: singleStaffNoteId,
                                                time: singleStaffNoteTime,
                                                x: singleStaffNotePoint.x,
                                                y1: systemLtPoint.y - toolbarHeight,
                                                y2: systemRbPoint.y - toolbarHeight
                                            })
                                        }
                                    
                                    }
            
                                    measureTsNotes = measureTsNotes.sort((a, b) => a.time < b.time)

                                    let firstNoteIndex = -1;
                                    let firstNoteTime = -1;
                                    for (let i = 0; i < measureTsNotes.length; i++) {
                                        if (measureTsNotes[i].type == 'note') {
                                            firstNoteIndex = i;
                                            firstNoteTime = measureTsNotes[firstNoteIndex].time
                                            break;
                                        }
                                    }
                                    
            
                                    for (let i = 0; i < measureTsNotes.length; i++) {
                                        if (measureTsNotes[i].time > time) {
                                            if (firstNoteIndex > -1) {
                                                if (measureTsNotes[i].type == 'note') {
                                                    if (measureTsNotes[i].x > cursorPoint.x) {
                                                        nextNoteIndex = i;
                                                        break;
                                                    }
                                                }
                                            } else {
                                                if (measureTsNotes[i].x > cursorPoint.x) {
                                                    nextNoteIndex = i;
                                                    break; 
                                                }
                                            }
                                        }
                                    }
            
                                    let nextFlag = false;
                                    if (nextNoteIndex > 0) {
                                        for (let i = 0; i < ___count; i++) {
                                            let disx = (measureTsNotes[nextNoteIndex].x - cursorPoint.x) / ___count * (i + 1);
                                            let distime = (measureTsNotes[nextNoteIndex].time - time) / ___count * (i + 1);
                                            let destx = cursorPoint.x + disx
                                            
                                            setTimeout(() => {
                                                let sq_cursor_rawX = 0;
                                                if (sq_cursor.getAttribute('x1')) {
                                                    sq_cursor_rawX = parseFloat(sq_cursor.getAttribute('x1'))
                                                }
                                                let sq_cursor_rawY = 0;
                                                if (sq_cursor.getAttribute('y1')) {
                                                    sq_cursor_rawY = parseFloat(sq_cursor.getAttribute('y1'))
                                                }
                                                let sq_cursor_rawY2 = 0;
                                                if (sq_cursor.getAttribute('y2')) {
                                                    sq_cursor_rawY2 = parseFloat(sq_cursor.getAttribute('y2'))
                                                }

                                                // if (measureTsNotes[0].y1 == sq_cursor_rawY && destx > sq_cursor_rawX 
                                                //     || measureTsNotes[0].y1 != sq_cursor_rawY && measureTsNotes[0].y1 > sq_cursor_rawY2) {
                                                if (measureTsNotes[0].y1 == sq_cursor_rawY && destx > sq_cursor_rawX 
                                                    || measureTsNotes[0].y1 != sq_cursor_rawY) {
                                                    sq_cursor.setAttribute('x1', destx);
                                                    sq_cursor.setAttribute('x2', destx);
                                                    sq_cursor.setAttribute('y1', measureTsNotes[0].y1);
                                                    sq_cursor.setAttribute('y2', measureTsNotes[0].y2);
                                                }
                                            }, distime)
                                        }
                                        
                                    } else {
                                        nextFlag = true;
                                    }
                                    
                                    if (nextFlag) {
                                        let _systemMeasures = [];
                                        let nextMeasure = null;
                                        let nextstaffGroups = [];
                                        
                                        let __measureGroups1 = _system.querySelectorAll('g.measure');
                                        let measureGroups1 = []
                                        for (let i = 0; i < __measureGroups1.length; i++) {
                                            if (__measureGroups1[i].id != _measure.id) {
                                                measureGroups1.push(__measureGroups1[i]);
                                            }
                                        }
                                        let nextmeasureTsNotes = []
                                        if (measureGroups1) {
                                            for (let i = 0; i < measureGroups1.length; i++) {
                                                let delgatemeasure1 = measureGroups1[i]
                                                let delgatenote1 = delgatemeasure1.querySelector('g.note')
                                                
                                                // let delgatenoteTime1 = yield this.app.verovio.getTimeForElement(delgatenote1.id)
                                                let _delgatenotePoint1 = note.ownerSVGElement.createSVGPoint();
                                                let delgatenotePointBBox1 = delgatenote1.getBBox()
                                                _delgatenotePoint1.x = delgatenotePointBBox1.x + delgatenotePointBBox1.width / 2;
                                                _delgatenotePoint1.y = delgatenotePointBBox1.y;
            
                                                const delgatenotePoint1 = _delgatenotePoint1.matrixTransform(ctm);
                                                _systemMeasures.push({
                                                    measure: delgatemeasure1,
                                                    // time: delgatenoteTime1,
                                                    x: delgatenotePoint1.x
                                                })
                                            }
                                            _systemMeasures = _systemMeasures.filter(item => item.x > barlinePoint.x).sort((a, b) => a.x < b.x)
            
                                            let ___system = null;
                                            if (_systemMeasures.length > 0) {
                                                nextMeasure = _systemMeasures[0].measure
            
                                                nextstaffGroups = nextMeasure.querySelectorAll('g.staff')
                                                ___system = _system;
                                            } else {
                                                let page = _system.closest('g.page-margin');
                                                if (page) {
                                                    let ___systemGroups = page.querySelectorAll('g.system');
                                                    let _systemGroups = []
                                                    for (let i = 0; i < ___systemGroups.length; i++) {
                                                        if (___systemGroups[i].id != _system.id) {
                                                            _systemGroups.push(___systemGroups[i]);
                                                        }
                                                    }
                                                    let _delgateSystemNotes = [];
                                                    for (let j = 0; j < _systemGroups.length; j++) {
                                                        let _singleSystem = _systemGroups[j];
            
                                                        let delgateSystemNote = _singleSystem.querySelector('g.note');
                                                        if (!delgateSystemNote) {
                                                            delgateSystemNote = _singleSystem.querySelector('g.rest');
                                                        }
                                                        // if (!delgateSystemNote) {
                                                        //     delgateSystemNote = _singleSystem.querySelector('g.mRest');
                                                        // }
            
                                                        if (delgateSystemNote) {
                                                            let _delgateSystemNoteTime = yield this.app.verovio.getTimeForElement(delgateSystemNote.id)
                                                            _delgateSystemNotes.push({
                                                                system: _singleSystem,
                                                                time: _delgateSystemNoteTime
                                                            })
                                                        }
                                                    }
                                                    _delgateSystemNotes = _delgateSystemNotes.sort((a, b) => a.time < b.time)
                                                    if (_delgateSystemNotes.length > 0) {
                                                        let measureGroups1 = _delgateSystemNotes[0].system.querySelectorAll('g.measure');
                                                        
                                                        if (measureGroups1) {
                                                            for (let i = 0; i < measureGroups1.length; i++) {
                                                                let delgatemeasure1 = measureGroups1[i]
                                                                let delgatenote1 = delgatemeasure1.querySelector('g.note')
                                                                
                                                                let delgatenoteTime1 = yield this.app.verovio.getTimeForElement(delgatenote1.id)
                                                                let _delgatenotePoint1 = note.ownerSVGElement.createSVGPoint();
                                                                let delgatenotePointBBox1 = delgatenote1.getBBox()
                                                                _delgatenotePoint1.x = delgatenotePointBBox1.x + delgatenotePointBBox1.width / 2;
                                                                _delgatenotePoint1.y = delgatenotePointBBox1.y;
                            
                                                                const delgatenotePoint1 = _delgatenotePoint1.matrixTransform(ctm);
                                                                _systemMeasures.push({
                                                                    measure: delgatemeasure1,
                                                                    time: delgatenoteTime1,
                                                                    x: delgatenotePoint1.x
                                                                })
                                                            }
                                                            _systemMeasures = _systemMeasures.sort((a, b) => a.time < b.time)
                            
                                                            if (_systemMeasures.length > 0) {
                                                                nextMeasure = _systemMeasures[0].measure
                            
                                                                nextstaffGroups = nextMeasure.querySelectorAll('g.staff')
                                                                ___system = _delgateSystemNotes[0].system;
                                                            } 
                                                            
                                                        }
                                                    }
                                                }
                                            }
            
                                            if (nextstaffGroups) {
                                                for (let k = 0; k < nextstaffGroups.length; k++) {
                                                
                                                    let singleStaffGroup = nextstaffGroups[k];
                                                    let singleStaffNotes = singleStaffGroup.querySelectorAll('g.note');
                                                    
                                                    if (singleStaffNotes) {
                                                        for (let j = 0; j < singleStaffNotes.length; j++) {
                                                            let singleStaffNoteId = singleStaffNotes[j].id
                                                            let singleStaffNoteTime = yield this.app.verovio.getTimeForElement(singleStaffNoteId)
                                                            let _singleStaffNotePoint = _measure.ownerSVGElement.createSVGPoint();
                                                            let singleStaffNoteBBox = singleStaffNotes[j].getBBox()
                                                            _singleStaffNotePoint.x = singleStaffNoteBBox.x + singleStaffNoteBBox.width / 2;
                                                            _singleStaffNotePoint.y = singleStaffNoteBBox.y;
            
                                                            const singleStaffNotePoint = _singleStaffNotePoint.matrixTransform(ctm);
                                                            
                                                            nextmeasureTsNotes.push({
                                                                note: singleStaffNotes[j],
                                                                system: ___system,
                                                                id: singleStaffNoteId,
                                                                time: singleStaffNoteTime,
                                                                x: singleStaffNotePoint.x,
                                                                y1: systemLtPoint.y - toolbarHeight,
                                                                y2: systemRbPoint.y - toolbarHeight
                                                            })
                                                        }
                                                    }
            
            
                                                    // let singleStaffRests1 = singleStaffGroup.querySelectorAll('g.mRest');
                                                    let singleStaffRests2 = singleStaffGroup.querySelectorAll('g.rest');
                                                    let singleStaffRests = []
                                                    // if (singleStaffRests1) {
                                                    //     singleStaffRests.push(...singleStaffRests1)
                                                    // }
                                                    if (singleStaffRests2) {
                                                        singleStaffRests.push(...singleStaffRests2)
                                                    }
            
                                                    for (let j = 0; j < singleStaffRests.length; j++) {
                                                        let singleStaffNoteId = singleStaffRests[j].id
                                                        let singleStaffNoteTime = yield this.app.verovio.getTimeForElement(singleStaffNoteId)
                                                        let _singleStaffNotePoint = _measure.ownerSVGElement.createSVGPoint();
                                                        let singleStaffNoteBBox = singleStaffRests[j].getBBox()
                                                        _singleStaffNotePoint.x = singleStaffNoteBBox.x + singleStaffNoteBBox.width / 2;
                                                        _singleStaffNotePoint.y = singleStaffNoteBBox.y;
            
                                                        const singleStaffNotePoint = _singleStaffNotePoint.matrixTransform(ctm);
                                                        
                                                        nextmeasureTsNotes.push({
                                                            note: singleStaffRests[j],
                                                            system: ___system,
                                                            id: singleStaffNoteId,
                                                            time: singleStaffNoteTime,
                                                            x: singleStaffNotePoint.x,
                                                            y1: systemLtPoint.y - toolbarHeight,
                                                            y2: systemRbPoint.y - toolbarHeight
                                                        })
                                                    }
                                                    
                                                }
                                            }
                                        }
            
                                        nextmeasureTsNotes = nextmeasureTsNotes.sort((a, b) => a.time < b.time)
            
                                        if (nextmeasureTsNotes.length > 0) {
                                            if (nextmeasureTsNotes[0].x > cursorPoint.x) {
                                                for (let i = 0; i < ___count; i++) {
                                                    let disx = (nextmeasureTsNotes[0].x - cursorPoint.x) / ___count * (i + 1);
                                                    if (disx > 0) {
                                                        let distime = (nextmeasureTsNotes[0].time - time) / ___count * (i + 1);
                                                        let destx = cursorPoint.x + disx
                                                        setTimeout(() => {
                                                            let sq_cursor_rawX = 0;
                                                            if (sq_cursor.getAttribute('x1')) {
                                                                sq_cursor_rawX = parseFloat(sq_cursor.getAttribute('x1'))
                                                            }

                                                            let sq_cursor_rawY = 0;
                                                            if (sq_cursor.getAttribute('y1')) {
                                                                sq_cursor_rawY = parseFloat(sq_cursor.getAttribute('y1'))
                                                            }
                                                            let sq_cursor_rawY2 = 0;
                                                            if (sq_cursor.getAttribute('y2')) {
                                                                sq_cursor_rawY2 = parseFloat(sq_cursor.getAttribute('y2'))
                                                            }

                                                            // if (measureTsNotes[0].y1 == sq_cursor_rawY && destx > sq_cursor_rawX 
                                                            //     || measureTsNotes[0].y1 != sq_cursor_rawY && measureTsNotes[0].y1 > sq_cursor_rawY2) {
                                                            if (measureTsNotes[0].y1 == sq_cursor_rawY && destx > sq_cursor_rawX 
                                                                || measureTsNotes[0].y1 != sq_cursor_rawY) {
                                                                sq_cursor.setAttribute('x1', destx);
                                                                sq_cursor.setAttribute('x2', destx);
                                                                sq_cursor.setAttribute('y1', measureTsNotes[0].y1);
                                                                sq_cursor.setAttribute('y2', measureTsNotes[0].y2);
                                                            }
                                                        }, distime)
                                                    }
                                                }
                                            } else {
                                                for (let i = 0; i < ___count / 2; i++) {
                                                    let disx = (barlinePoint.x - cursorPoint.x) / (___count / 2) * (i + 1);
                                                    let distime = (nextmeasureTsNotes[0].time - time) / ___count * (i + 1);
                                                    let destx = cursorPoint.x + disx
                                                    
                                                    setTimeout(() => {
                                                        let sq_cursor_rawX = 0;
                                                        if (sq_cursor.getAttribute('x1')) {
                                                            sq_cursor_rawX = parseFloat(sq_cursor.getAttribute('x1'))
                                                        }

                                                        let sq_cursor_rawY = 0;
                                                        if (sq_cursor.getAttribute('y1')) {
                                                            sq_cursor_rawY = parseFloat(sq_cursor.getAttribute('y1'))
                                                        }
                                                        let sq_cursor_rawY2 = 0;
                                                        if (sq_cursor.getAttribute('y2')) {
                                                            sq_cursor_rawY2 = parseFloat(sq_cursor.getAttribute('y2'))
                                                        }

                                                        // if (nextmeasureTsNotes[0].y1 == sq_cursor_rawY && destx > sq_cursor_rawX 
                                                        //     || nextmeasureTsNotes[0].y1 != sq_cursor_rawY && nextmeasureTsNotes[0].y1 > sq_cursor_rawY2) {
                                                        if (nextmeasureTsNotes[0].y1 == sq_cursor_rawY && destx > sq_cursor_rawX 
                                                            || nextmeasureTsNotes[0].y1 != sq_cursor_rawY) {
                                                        
                                                            sq_cursor.setAttribute('x1', destx);
                                                            sq_cursor.setAttribute('x2', destx);
                                                            sq_cursor.setAttribute('y1', nextmeasureTsNotes[0].y1);
                                                            sq_cursor.setAttribute('y2', nextmeasureTsNotes[0].y2);
                                                        }
                                                    }, distime)
                                                }
                                                let _grpSym = nextmeasureTsNotes[0].system.querySelector('g.grpSym');
                                                if (_grpSym) {
                                                    let _startBracePoint = nextmeasureTsNotes[0].note.ownerSVGElement.createSVGPoint();
                                                    let _startBracePointBBox = _grpSym.getBBox()
                                                    _startBracePoint.x = _startBracePointBBox.x;
                                                    _startBracePoint.y = _startBracePointBBox.y;

                                                    const startBracePoint = _startBracePoint.matrixTransform(ctm);
                                                    for (let i = ___count / 2; i < ___count; i++) {
                                                        let disx = (nextmeasureTsNotes[0].x - startBracePoint.x) / (___count / 2) * (i - ___count / 2 + 1);
                                                        let distime = (nextmeasureTsNotes[0].time - time) / ___count * (i + 1);
                                                        let destx = startBracePoint.x + disx
                                                        
                                                        setTimeout(() => {
                                                            let sq_cursor_rawX = 0;
                                                            if (sq_cursor.getAttribute('x1')) {
                                                                sq_cursor_rawX = parseFloat(sq_cursor.getAttribute('x1'))
                                                            }
                                                            let sq_cursor_rawY = 0;
                                                            if (sq_cursor.getAttribute('y1')) {
                                                                sq_cursor_rawY = parseFloat(sq_cursor.getAttribute('y1'))
                                                            }
                                                            let sq_cursor_rawY2 = 0;
                                                            if (sq_cursor.getAttribute('y2')) {
                                                                sq_cursor_rawY2 = parseFloat(sq_cursor.getAttribute('y2'))
                                                            }

                                                            // if (nextmeasureTsNotes[0].y1 == sq_cursor_rawY && destx > sq_cursor_rawX 
                                                            //     || nextmeasureTsNotes[0].y1 != sq_cursor_rawY && nextmeasureTsNotes[0].y1 > sq_cursor_rawY2) {
                                                            if (nextmeasureTsNotes[0].y1 == sq_cursor_rawY && destx > sq_cursor_rawX 
                                                                || nextmeasureTsNotes[0].y1 != sq_cursor_rawY) {
                                                                sq_cursor.setAttribute('x1', destx);
                                                                sq_cursor.setAttribute('x2', destx);
                                                                sq_cursor.setAttribute('y1', nextmeasureTsNotes[0].y1);
                                                                sq_cursor.setAttribute('y2', nextmeasureTsNotes[0].y2);
                                                            }
                                                        }, distime)
                                                    }
                                                }
                                            }
                                        } 
                                    }
            
                                }
                            } else {
                                sq_cursor = svg.querySelector('#playback-sq-cursor');
                                if (sq_cursor) {
                                    sq_cursor.setAttribute('x1', -100);
                                    sq_cursor.setAttribute('x2', -100);
                                }
                            }

                            break;

                        }
                    }
                } else {
                    if (this.sq_cursor_flash) {
                        if (elementsAtTime.measure) {
                            let _measure = this.svgWrapper.querySelector('#' + elementsAtTime.measure);
                            if (_measure) {
                                const ctm = _measure.getScreenCTM(); 

                                let _barline = _measure.querySelector('g.barLine');
                                let _barlinePoint = _measure.ownerSVGElement.createSVGPoint();
                                let _barlineBBox = _barline.getBBox();
                                _barlinePoint.x = _barlineBBox.x
                                _barlinePoint.y = _barlineBBox.y
                                const barlinePoint = _barlinePoint.matrixTransform(ctm);

                                let _system = _measure.closest('g.system');

                                let _systemLtPoint = _measure.ownerSVGElement.createSVGPoint();
                                let _systemBBox = _system.getBBox()
                                _systemLtPoint.x = _systemBBox.x + _systemBBox.width / 2;
                                _systemLtPoint.y = _systemBBox.y;

                                let _systemRbPoint = _measure.ownerSVGElement.createSVGPoint();
                                _systemRbPoint.x = _systemBBox.x;
                                _systemRbPoint.y = _systemBBox.y + _systemBBox.height;

                                const systemLtPoint = _systemLtPoint.matrixTransform(ctm);
                                const systemRbPoint = _systemRbPoint.matrixTransform(ctm);
                                
                                let _staffGroups = _measure.querySelectorAll('g.staff')
                                let measureTsNotes = []

                                sq_cursor = svg.querySelector('#playback-sq-cursor');
                                if (!sq_cursor) {
                                    sq_cursor = document.createElementNS(svgNS, 'line');
                                    sq_cursor.setAttribute('id', 'playback-sq-cursor');
                                    sq_cursor.setAttribute('stroke', 'blue');
                                    sq_cursor.setAttribute('stroke-width', '2');
                                    sq_cursor.setAttribute('opacity', '0.5');
                                    
                                    svg.appendChild(sq_cursor);
                                }

                                let currNoteIndex = -1;

                                for (let k = 0; k < _staffGroups.length; k++) {
                                    
                                    let singleStaffGroup = _staffGroups[k];
                                    let singleStaffNotes = singleStaffGroup.querySelectorAll('g.note');

                                    if (singleStaffNotes) {
                                        for (let j = 0; j < singleStaffNotes.length; j++) {
                                            let singleStaffNoteId = singleStaffNotes[j].id
                                            let singleStaffNoteTime = yield this.app.verovio.getTimeForElement(singleStaffNoteId)
                                            let _singleStaffNotePoint = _measure.ownerSVGElement.createSVGPoint();
                                            let singleStaffNoteBBox = singleStaffNotes[j].getBBox()
                                            _singleStaffNotePoint.x = singleStaffNoteBBox.x + singleStaffNoteBBox.width / 2;
                                            _singleStaffNotePoint.y = singleStaffNoteBBox.y;

                                            const singleStaffNotePoint = _singleStaffNotePoint.matrixTransform(ctm);
                                            
                                            measureTsNotes.push({
                                                id: singleStaffNoteId,
                                                time: singleStaffNoteTime,
                                                x: singleStaffNotePoint.x,
                                                y1: systemLtPoint.y - toolbarHeight,
                                                y2: systemRbPoint.y - toolbarHeight
                                            })
                                        }
                                    }
                                    
                                    // let singleStaffRests1 = singleStaffGroup.querySelectorAll('g.mRest');
                                    let singleStaffRests2 = singleStaffGroup.querySelectorAll('g.rest');
                                    let singleStaffRests = []
                                    // if (singleStaffRests1) {
                                    //     singleStaffRests.push(...singleStaffRests1)
                                    // }
                                    if (singleStaffRests2) {
                                        singleStaffRests.push(...singleStaffRests2)
                                    }

                                    for (let j = 0; j < singleStaffRests.length; j++) {
                                        let singleStaffNoteId = singleStaffRests[j].id
                                        let singleStaffNoteTime = yield this.app.verovio.getTimeForElement(singleStaffNoteId)
                                        let _singleStaffNotePoint = _measure.ownerSVGElement.createSVGPoint();
                                        let singleStaffNoteBBox = singleStaffRests[j].getBBox()
                                        _singleStaffNotePoint.x = singleStaffNoteBBox.x + singleStaffNoteBBox.width / 2;
                                        _singleStaffNotePoint.y = singleStaffNoteBBox.y;

                                        const singleStaffNotePoint = _singleStaffNotePoint.matrixTransform(ctm);
                                        
                                        measureTsNotes.push({
                                            id: singleStaffNoteId,
                                            time: singleStaffNoteTime,
                                            x: singleStaffNotePoint.x,
                                            y1: systemLtPoint.y - toolbarHeight,
                                            y2: systemRbPoint.y - toolbarHeight
                                        })
                                    }
                                
                                }

                                
                                measureTsNotes = measureTsNotes.sort((a, b) => a.time < b.time)

                                for (let i = 0; i < measureTsNotes.length; i++) {
                                    if (measureTsNotes[i].time > time) {
                                        if (i > 0) {
                                            currNoteIndex = i - 1;
                                        } 
                                        break;
                                    }
                                }

                                let nextFlag = false;
                                if (currNoteIndex >= 0) {
                                    if (currNoteIndex < measureTsNotes.length - 1) {
                                        let disx = measureTsNotes[currNoteIndex + 1].x - measureTsNotes[currNoteIndex].x
                                        let distime = measureTsNotes[currNoteIndex + 1].time - measureTsNotes[currNoteIndex].time
                                        let destx = measureTsNotes[currNoteIndex].x + disx * (time - measureTsNotes[currNoteIndex].time) / distime
                                        let sq_cursor_rawX = 0;
                                        if (sq_cursor.getAttribute('x1')) {
                                            sq_cursor_rawX = parseFloat(sq_cursor.getAttribute('x1'))
                                        }
                                        let sq_cursor_rawY = 0;
                                        if (sq_cursor.getAttribute('y1')) {
                                            sq_cursor_rawY = parseFloat(sq_cursor.getAttribute('y1'))
                                        }
                                        let sq_cursor_rawY2 = 0;
                                        if (sq_cursor.getAttribute('y2')) {
                                            sq_cursor_rawY2 = parseFloat(sq_cursor.getAttribute('y2'))
                                        }

                                        // if (measureTsNotes[0].y1 == sq_cursor_rawY && destx > sq_cursor_rawX 
                                        //     || measureTsNotes[0].y1 != sq_cursor_rawY && measureTsNotes[0].y1 > sq_cursor_rawY2) {
                                        if (measureTsNotes[0].y1 == sq_cursor_rawY && destx > sq_cursor_rawX 
                                            || measureTsNotes[0].y1 != sq_cursor_rawY) {
                                            sq_cursor.setAttribute('x1', destx);
                                            sq_cursor.setAttribute('x2', destx);
                                            sq_cursor.setAttribute('y1', measureTsNotes[0].y1);
                                            sq_cursor.setAttribute('y2', measureTsNotes[0].y2);
                                        }
                                        
                                    } else {
                                        nextFlag = true;
                                    }
                                }
                                
                                if (nextFlag) {
                                    let _systemMeasures = [];
                                    let nextMeasure = null;
                                    let nextstaffGroups = [];
                                    
                                    let __measureGroups1 = _system.querySelectorAll('g.measure');
                                    let measureGroups1 = []
                                    for (let i = 0; i < __measureGroups1.length; i++) {
                                        if (__measureGroups1[i].id != _measure.id) {
                                            measureGroups1.push(__measureGroups1[i]);
                                        }
                                    }
                                    let nextmeasureTsNotes = []
                                    if (measureGroups1) {
                                        for (let i = 0; i < measureGroups1.length; i++) {
                                            let delgatemeasure1 = measureGroups1[i]
                                            let delgatenote1 = delgatemeasure1.querySelector('g.note')
                                            
                                            // let delgatenoteTime1 = yield this.app.verovio.getTimeForElement(delgatenote1.id)
                                            let _delgatenotePoint1 = _measure.ownerSVGElement.createSVGPoint();
                                            let delgatenotePointBBox1 = delgatenote1.getBBox()
                                            _delgatenotePoint1.x = delgatenotePointBBox1.x + delgatenotePointBBox1.width / 2;
                                            _delgatenotePoint1.y = delgatenotePointBBox1.y;

                                            const delgatenotePoint1 = _delgatenotePoint1.matrixTransform(ctm);
                                            _systemMeasures.push({
                                                measure: delgatemeasure1,
                                                // time: delgatenoteTime1,
                                                x: delgatenotePoint1.x
                                            })
                                        }
                                        _systemMeasures = _systemMeasures.filter(item => item.x > barlinePoint.x).sort((a, b) => a.x < b.x)

                                        if (_systemMeasures.length > 0) {
                                            nextMeasure = _systemMeasures[0].measure

                                            nextstaffGroups = nextMeasure.querySelectorAll('g.staff')
                                        } else {
                                            let page = _system.closest('g.page-margin');
                                            if (page) {
                                                let ___systemGroups = page.querySelectorAll('g.system');
                                                let _systemGroups = []
                                                for (let i = 0; i < ___systemGroups.length; i++) {
                                                    if (___systemGroups[i].id != _system.id) {
                                                        _systemGroups.push(___systemGroups[i]);
                                                    }
                                                }
                                                let _delgateSystemNotes = [];
                                                for (let j = 0; j < _systemGroups.length; j++) {
                                                    let _singleSystem = _systemGroups[j];

                                                    let delgateSystemNote = _singleSystem.querySelector('g.note');
                                                    if (!delgateSystemNote) {
                                                        delgateSystemNote = _singleSystem.querySelector('g.rest');
                                                    }
                                                    // if (!delgateSystemNote) {
                                                    //     delgateSystemNote = _singleSystem.querySelector('g.mRest');
                                                    // }

                                                    if (delgateSystemNote) {
                                                        let _delgateSystemNoteTime = yield this.app.verovio.getTimeForElement(delgateSystemNote.id)
                                                        _delgateSystemNotes.push({
                                                            system: _singleSystem,
                                                            time: _delgateSystemNoteTime
                                                        })
                                                    }
                                                }
                                                _delgateSystemNotes = _delgateSystemNotes.sort((a, b) => a.time < b.time)
                                                if (_delgateSystemNotes.length > 0) {
                                                    let measureGroups1 = _delgateSystemNotes[0].system.querySelectorAll('g.measure');
                                                    
                                                    if (measureGroups1) {
                                                        for (let i = 0; i < measureGroups1.length; i++) {
                                                            let delgatemeasure1 = measureGroups1[i]
                                                            let delgatenote1 = delgatemeasure1.querySelector('g.note')
                                                            
                                                            let delgatenoteTime1 = yield this.app.verovio.getTimeForElement(delgatenote1.id)
                                                            let _delgatenotePoint1 = _measure.ownerSVGElement.createSVGPoint();
                                                            let delgatenotePointBBox1 = delgatenote1.getBBox()
                                                            _delgatenotePoint1.x = delgatenotePointBBox1.x + delgatenotePointBBox1.width / 2;
                                                            _delgatenotePoint1.y = delgatenotePointBBox1.y;
                        
                                                            const delgatenotePoint1 = _delgatenotePoint1.matrixTransform(ctm);
                                                            _systemMeasures.push({
                                                                measure: delgatemeasure1,
                                                                time: delgatenoteTime1,
                                                                x: delgatenotePoint1.x
                                                            })
                                                        }
                                                        _systemMeasures = _systemMeasures.sort((a, b) => a.time < b.time)
                        
                                                        if (_systemMeasures.length > 0) {
                                                            nextMeasure = _systemMeasures[0].measure
                        
                                                            nextstaffGroups = nextMeasure.querySelectorAll('g.staff')
                                                        } 
                                                        
                                                    }
                                                }
                                            }
                                        }

                                        if (nextstaffGroups) {
                                            for (let k = 0; k < nextstaffGroups.length; k++) {
                                            
                                                let singleStaffGroup = nextstaffGroups[k];
                                                let singleStaffNotes = singleStaffGroup.querySelectorAll('g.note');
                                                
                                                if (singleStaffNotes) {
                                                    for (let j = 0; j < singleStaffNotes.length; j++) {
                                                        let singleStaffNoteId = singleStaffNotes[j].id
                                                        let singleStaffNoteTime = yield this.app.verovio.getTimeForElement(singleStaffNoteId)
                                                        let _singleStaffNotePoint = _measure.ownerSVGElement.createSVGPoint();
                                                        let singleStaffNoteBBox = singleStaffNotes[j].getBBox()
                                                        _singleStaffNotePoint.x = singleStaffNoteBBox.x + singleStaffNoteBBox.width / 2;
                                                        _singleStaffNotePoint.y = singleStaffNoteBBox.y;

                                                        const singleStaffNotePoint = _singleStaffNotePoint.matrixTransform(ctm);
                                                        
                                                        nextmeasureTsNotes.push({
                                                            id: singleStaffNoteId,
                                                            time: singleStaffNoteTime,
                                                            x: singleStaffNotePoint.x,
                                                            y1: systemLtPoint.y - toolbarHeight,
                                                            y2: systemRbPoint.y - toolbarHeight
                                                        })
                                                    }
                                                }


                                                // let singleStaffRests1 = singleStaffGroup.querySelectorAll('g.mRest');
                                                let singleStaffRests2 = singleStaffGroup.querySelectorAll('g.rest');
                                                let singleStaffRests = []
                                                // if (singleStaffRests1) {
                                                //     singleStaffRests.push(...singleStaffRests1)
                                                // }
                                                if (singleStaffRests2) {
                                                    singleStaffRests.push(...singleStaffRests2)
                                                }

                                                for (let j = 0; j < singleStaffRests.length; j++) {
                                                    let singleStaffNoteId = singleStaffRests[j].id
                                                    let singleStaffNoteTime = yield this.app.verovio.getTimeForElement(singleStaffNoteId)
                                                    let _singleStaffNotePoint = _measure.ownerSVGElement.createSVGPoint();
                                                    let singleStaffNoteBBox = singleStaffRests[j].getBBox()
                                                    _singleStaffNotePoint.x = singleStaffNoteBBox.x + singleStaffNoteBBox.width / 2;
                                                    _singleStaffNotePoint.y = singleStaffNoteBBox.y;

                                                    const singleStaffNotePoint = _singleStaffNotePoint.matrixTransform(ctm);
                                                    
                                                    nextmeasureTsNotes.push({
                                                        id: singleStaffNoteId,
                                                        time: singleStaffNoteTime,
                                                        x: singleStaffNotePoint.x,
                                                        y1: systemLtPoint.y - toolbarHeight,
                                                        y2: systemRbPoint.y - toolbarHeight
                                                    })
                                                }
                                                
                                            }
                                        }
                                    }

                                    nextmeasureTsNotes = nextmeasureTsNotes.sort((a, b) => a.time < b.time)

                                    if (nextmeasureTsNotes.length > 0) {
                                        sq_cursor = svg.querySelector('#playback-sq-cursor');
                                        if (!sq_cursor) {
                                            sq_cursor = document.createElementNS(svgNS, 'line');
                                            sq_cursor.setAttribute('id', 'playback-sq-cursor');
                                            sq_cursor.setAttribute('stroke', 'blue');
                                            sq_cursor.setAttribute('stroke-width', '2');
                                            sq_cursor.setAttribute('opacity', '0.5');
                                            
                                            svg.appendChild(sq_cursor);
                                        }
                                        
                                        let disx = barlinePoint.x - measureTsNotes[currNoteIndex].x
                                        let distime = (nextmeasureTsNotes[0].time - measureTsNotes[currNoteIndex].time) / 2

                                        let destx = measureTsNotes[currNoteIndex].x + disx * (time - measureTsNotes[currNoteIndex].time) / distime
                                        let sq_cursor_rawX = 0;
                                        if (sq_cursor.getAttribute('x1')) {
                                            sq_cursor_rawX = parseFloat(sq_cursor.getAttribute('x1'))
                                        }
                                        let sq_cursor_rawY = 0;
                                        if (sq_cursor.getAttribute('y1')) {
                                            sq_cursor_rawY = parseFloat(sq_cursor.getAttribute('y1'))
                                        }
                                        let sq_cursor_rawY2 = 0;
                                        if (sq_cursor.getAttribute('y2')) {
                                            sq_cursor_rawY2 = parseFloat(sq_cursor.getAttribute('y2'))
                                        }

                                        // if (measureTsNotes[0].y1 == sq_cursor_rawY && destx > sq_cursor_rawX 
                                        //     || measureTsNotes[0].y1 != sq_cursor_rawY && measureTsNotes[0].y1 > sq_cursor_rawY2) {
                                        if (measureTsNotes[0].y1 == sq_cursor_rawY && destx > sq_cursor_rawX 
                                            || measureTsNotes[0].y1 != sq_cursor_rawY) {
                                            sq_cursor.setAttribute('x1', destx);
                                            sq_cursor.setAttribute('x2', destx);
                                            sq_cursor.setAttribute('y1', measureTsNotes[0].y1);
                                            sq_cursor.setAttribute('y2', measureTsNotes[0].y2);
                                        }

                                        this.measure_barlinegap_time = measureTsNotes[currNoteIndex].time
                                        this.measure_barlinegap_x = barlinePoint.x
                                    } else if (currNoteIndex < 0) {
                                        if (!this.measure_barlinegap_time) {
                                            this.measure_barlinegap_time = 0.0001;
                                        }
                                        if (this.measure_barlinegap_time == 0.0001) {
                                            if (measureTsNotes.length > 0) {
                                                let disx = measureTsNotes[0].x;
                                                let distime = measureTsNotes[0].time - this.measure_barlinegap_time;

                                                let _grpSym = _system.querySelector('g.grpSym');
                                                if (_grpSym) {
                                                    let _startBracePoint = _measure.ownerSVGElement.createSVGPoint();
                                                    let _startBracePointBBox = _grpSym.getBBox()
                                                    _startBracePoint.x = _startBracePointBBox.x;
                                                    _startBracePoint.y = _startBracePointBBox.y;

                                                    const startBracePoint = _startBracePoint.matrixTransform(ctm);

                                                    let destx = startBracePoint.x + disx * (time - this.measure_barlinegap_time) / distime
                                                    let sq_cursor_rawX = 0;
                                                    if (sq_cursor.getAttribute('x1')) {
                                                        sq_cursor_rawX = parseFloat(sq_cursor.getAttribute('x1'))
                                                    }
                                                    let sq_cursor_rawY = 0;
                                                    if (sq_cursor.getAttribute('y1')) {
                                                        sq_cursor_rawY = parseFloat(sq_cursor.getAttribute('y1'))
                                                    }
                                                    let sq_cursor_rawY2 = 0;
                                                    if (sq_cursor.getAttribute('y2')) {
                                                        sq_cursor_rawY2 = parseFloat(sq_cursor.getAttribute('y2'))
                                                    }

                                                    // if (measureTsNotes[0].y1 == sq_cursor_rawY && destx > sq_cursor_rawX 
                                                    //     || measureTsNotes[0].y1 != sq_cursor_rawY && measureTsNotes[0].y1 > sq_cursor_rawY2) {
                                                    if (measureTsNotes[0].y1 == sq_cursor_rawY && destx > sq_cursor_rawX 
                                                        || measureTsNotes[0].y1 != sq_cursor_rawY) {
                                                        sq_cursor.setAttribute('x1', destx);
                                                        sq_cursor.setAttribute('x2', destx);
                                                        sq_cursor.setAttribute('y1', measureTsNotes[0].y1);
                                                        sq_cursor.setAttribute('y2', measureTsNotes[0].y2);
                                                    }
                                                }
                                            }
                                        } else {
                                            if (measureTsNotes.length > 0) {
                                                let disx = measureTsNotes[0].x - measure_barlinegap_x;
                                                let distime = (measureTsNotes[0].time - this.measure_barlinegap_time) / 2

                                                let destx = this.measure_barlinegap_x + disx * (time - this.measure_barlinegap_time) / distime

                                                let sq_cursor_rawX = 0;
                                                if (sq_cursor.getAttribute('x1')) {
                                                    sq_cursor_rawX = parseFloat(sq_cursor.getAttribute('x1'))
                                                }
                                                let sq_cursor_rawY = 0;
                                                if (sq_cursor.getAttribute('y1')) {
                                                    sq_cursor_rawY = parseFloat(sq_cursor.getAttribute('y1'))
                                                }
                                                let sq_cursor_rawY2 = 0;
                                                if (sq_cursor.getAttribute('y2')) {
                                                    sq_cursor_rawY2 = parseFloat(sq_cursor.getAttribute('y2'))
                                                }

                                                // if (measureTsNotes[0].y1 == sq_cursor_rawY && destx > sq_cursor_rawX 
                                                //     || measureTsNotes[0].y1 != sq_cursor_rawY && measureTsNotes[0].y1 > sq_cursor_rawY2) {
                                                if (measureTsNotes[0].y1 == sq_cursor_rawY && destx > sq_cursor_rawX 
                                                    || measureTsNotes[0].y1 != sq_cursor_rawY) {
                                                    sq_cursor.setAttribute('x1', destx);
                                                    sq_cursor.setAttribute('x2', destx);
                                                    sq_cursor.setAttribute('y1', measureTsNotes[0].y1);
                                                    sq_cursor.setAttribute('y2', measureTsNotes[0].y2);
                                                } 
                                            }
                                            
                                        }
                                    }
                                }

                            }
                            
                        }
                    } else {
                        sq_cursor = svg.querySelector('#playback-sq-cursor');
                        if (sq_cursor) {
                            sq_cursor.setAttribute('x1', -100);
                            sq_cursor.setAttribute('x2', -100);
                        }
                    }
                }

                for (let l = 0; l < cursorPositioned.length; l++) {
                    if (!cursorPositioned[l]) {
                        cursorArray[l].setAttribute('x1', -100);
                        cursorArray[l].setAttribute('x2', -100);
                    }
                }

                this.cachedCursorArray = cursorArray;

                //////////////////////////////////////////////////////////////////////////////////////////////
                const scrollContainer = this.svgWrapper.parentElement;
                if (scrollContainer && cursorArray.length > 0) {
                    const containerTop = scrollContainer.offsetTop; // 容器相对于其 offsetParent 的顶部距离
                    const containerBottom = containerTop + scrollContainer.offsetHeight; // 容器底部的绝对位置
                    const scrollY = scrollContainer.scrollTop; // 容器当前的垂直滚动位置
                    const containerViewableHeight = scrollContainer.clientHeight; // 容器的可视高度

                    let cursorYTopRelativeToContainerArray = [];
                    let cursorYBottomRelativeToContainerArray = [];
                    // let cursorCenterYRelativeToContainerArray = [];
                    for (let k = 0; k < cursorArray.length; k++) {
                        const cursorYTopRelativeToContainer = parseFloat(cursorArray[k].getAttribute('y1'));
                        const cursorYBottomRelativeToContainer = parseFloat(cursorArray[k].getAttribute('y2'));

                        // const cursorCenterYRelativeToContainer = (parseFloat(cursorArray[k].getAttribute('y1')) + parseFloat(cursorArray[k].getAttribute('y2'))) / 2;

                        cursorYTopRelativeToContainerArray.push(cursorYTopRelativeToContainer);
                        cursorYBottomRelativeToContainerArray.push(cursorYBottomRelativeToContainer);
                        // cursorCenterYRelativeToContainerArray.push(cursorCenterYRelativeToContainer);

                    }

                    cursorYTopRelativeToContainerArray = cursorYTopRelativeToContainerArray.sort((a, b) => a - b);
                    cursorYBottomRelativeToContainerArray = cursorYBottomRelativeToContainerArray.sort((a, b) => a - b);
                    // cursorCenterYRelativeToContainerArray = cursorCenterYRelativeToContainerArray.sort((a, b) => a - b);

                    let translateYOffset = 50
                    // 光标顶部超出可视区域上方
                    if (cursorYTopRelativeToContainerArray[0] < scrollY) {
                        // scrollContainer.scrollTop = cursorYTopRelativeToContainerArray[0];
                        let progressY = cursorYTopRelativeToContainerArray[0] - scrollY - translateYOffset;
                        svg.style.transform = `translateY(-${progressY}px)`;

                        if (this.stand_cursor) {
                            for (let j = 0; j < cursorArray.length; j++) {
                                let y1Val = parseFloat(cursorArray[j].getAttribute('y1'));
                                let y2Val = parseFloat(cursorArray[j].getAttribute('y2'));
                                cursorArray[j].setAttribute('y1', y1Val - progressY);
                                cursorArray[j].setAttribute('y2', y2Val - progressY);
                            }
    
                            if (this.sq_cursor_flash && sq_cursor) {
                                let y1Val1 = parseFloat(sq_cursor.getAttribute('y1'));
                                let y2Val1 = parseFloat(sq_cursor.getAttribute('y2'));
                                sq_cursor.setAttribute('y1', y1Val1 - progressY);
                                sq_cursor.setAttribute('y2', y2Val1 - progressY);
                            }
                        }
                    }
                    // 光标底部超出可视区域下方
                    else if (cursorYBottomRelativeToContainerArray[cursorYBottomRelativeToContainerArray.length - 1] > scrollY + containerViewableHeight) {
                        // scrollContainer.scrollTop = cursorYBottomRelativeToContainerArray[cursorYBottomRelativeToContainerArray.length - 1] - containerViewableHeight;
                        let progressY = cursorYBottomRelativeToContainerArray[cursorYBottomRelativeToContainerArray.length - 1] - containerViewableHeight - scrollY + translateYOffset;
                        
                        svg.style.transform = `translateY(-${progressY}px)`;

                        if (this.stand_cursor) {
                            for (let j = 0; j < cursorArray.length; j++) {
                                let y1Val = parseFloat(cursorArray[j].getAttribute('y1'));
                                let y2Val = parseFloat(cursorArray[j].getAttribute('y2'));
                                cursorArray[j].setAttribute('y1', y1Val - progressY);
                                cursorArray[j].setAttribute('y2', y2Val - progressY);
                            }
    
                            if (this.sq_cursor_flash && sq_cursor) {
                                let y1Val1 = parseFloat(sq_cursor.getAttribute('y1'));
                                let y2Val1 = parseFloat(sq_cursor.getAttribute('y2'));
                                sq_cursor.setAttribute('y1', y1Val1 - progressY);
                                sq_cursor.setAttribute('y2', y2Val2 - progressY);
                            }
                        }
                    }

                    // if (cursorCenterYRelativeToContainerArray[0] < scrollY) {
                    //     scrollContainer.scrollTo({ top: cursorCenterYRelativeToContainerArray[0], behavior: 'smooth' });
                    // } else if (cursorCenterYRelativeToContainerArray[cursorCenterYRelativeToContainerArray.length - 1] > scrollY + containerViewableHeight) {
                    //     scrollContainer.scrollTo({ top: cursorCenterYRelativeToContainerArray[cursorCenterYRelativeToContainerArray.length - 1] - containerViewableHeight, behavior: 'smooth' });
                    // }
                }
                //////////////////////////////////////////////////////////////////////////////////////////////

            } else {
                let sq_cursor = svg.querySelector('#playback-sq-cursor');
                if (sq_cursor) {
                    sq_cursor.setAttribute('x1', -100);
                    sq_cursor.setAttribute('x2', -100);
                }
            }

            if ((elementsAtTime.notes.length > 0) && (this.midiIds != elementsAtTime.notes)) {
                //updatePageOrScrollTo(elementsAtTime.notes[0]);
                for (let i = 0, len = this.midiIds.length; i < len; i++) {
                    let noteId = this.midiIds[i];
                    if (elementsAtTime.notes.indexOf(noteId) === -1) {
                        let note = this.svgWrapper.querySelector('#' + noteId);
                        if (note) {
                            note.style.fill = "";
                            note.style.filter = "";
                            // note.style.stroke = "";
                        }
                    }
                }
                ;
                this.midiIds = elementsAtTime.notes;
                for (let i = 0, len = this.midiIds.length; i < len; i++) {
                    let note = this.svgWrapper.querySelector('#' + this.midiIds[i]);
                    if (note) {
                        note.style.fill = "#e60000";
                        // note.style.stroke = '#e60000';
                        note.style.filter = "url(#highlighting)";
                    }
                    //if ( note ) animateStart.beginElement();
                }
                ;
            }

            // if (elementsAtTime.measure) {
            //     let measureid = elementsAtTime.measure
            //     let measure = this.svgWrapper.querySelector('#' + measureid);
                
            //     if (measureid != this.measureid) {
            //         if (this.measure) {
            //             this.measure.style.fill = "";
            //             // this.measure.style.stroke = "";
            //         }
            //         measure.style.fill = "purple";
            //         // measure.style.stroke = '#e60000';
            //         this.measure = measure
            //         this.measureid = measureid
            //     }
            // }
        });
    }
    midiStop() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let i = 0, len = this.midiIds.length; i < len; i++) {
                let note = this.svgWrapper.querySelector('#' + this.midiIds[i]);
                if (note)
                    note.style.filter = "";
            }
            ;
            this.midiIds = [];
        });
    }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    updateSVGDimensions() {
        this.svgWrapper.style.height = this.element.style.height;
        this.svgWrapper.style.width = this.element.style.width;
    }
    ////////////////////////////////////////////////////////////////////////
    // Custom event methods
    ////////////////////////////////////////////////////////////////////////
    onPage(e) {
        if (!super.onPage(e))
            return false;
        //console.debug("ResponsiveView::onPage");
        this.renderPage(true);
        return true;
    }
    ////////////////////////////////////////////////////////////////////////
    // Event listeners
    ////////////////////////////////////////////////////////////////////////
    scrollListener(e) {
        let element = e.target;
        this.svgWrapper.scrollTop = element.scrollTop;
        this.svgWrapper.scrollLeft = element.scrollLeft;
    }
}
//# sourceMappingURL=responsive-view.js.map