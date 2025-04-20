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

            let _toolbar = document.querySelector('.vrv-toolbar');
            let toolbarHeight = _toolbar.getBoundingClientRect().height;

            let cursorPositioned = [];
            let cursorArray = [];
            let staffGroups = [];
            let staffCheckStat = [];
            let measure = null;

            if (elementsAtTime.notes.length > 0) {
                
                for (let i = 0; i < elementsAtTime.notes.length; i++) {
                    let note = this.svgWrapper.querySelector('#' + elementsAtTime.notes[i]);

                    // cursor sliding on tempo
                    // let noteTime = yield this.app.verovio.getTimeForElement(elementsAtTime.notes[i])
                    
                    if (note) {
                        const noteBBox = note.getBBox();
                        const ctm = note.getScreenCTM();                // 当前元素的坐标变换矩阵
                        const _point = note.ownerSVGElement.createSVGPoint();

                        _point.x = noteBBox.x + noteBBox.width / 2;
                        _point.y = noteBBox.y + noteBBox.height;

                        const cursorPoint = _point.matrixTransform(ctm);
            
                        let _measure = note.closest('g.measure');
                        // let _system = _measure.closest('g.system');

                        // let _systemLtPoint = note.ownerSVGElement.createSVGPoint();
                        // let _systemBBox = _system.getBBox()
                        // _systemLtPoint.x = _systemBBox.x;
                        // _systemLtPoint.y = _systemBBox.y;

                        // let _systemRbPoint = note.ownerSVGElement.createSVGPoint();
                        // _systemRbPoint.x = _systemBBox.x + _systemBBox.width;
                        // _systemRbPoint.y = _systemBBox.y + _systemBBox.height;

                        // const systemLtPoint = _systemLtPoint.matrixTransform(ctm);
                        // const systemRbPoint = _systemRbPoint.matrixTransform(ctm);

                        if (_measure != measure) {
                            measure = _measure;
                            cursorPositioned = [];
                            cursorArray = [];
                            staffGroups = [];
                            staffCheckStat = [];

                            staffGroups = _measure.querySelectorAll('g.staff')

                            // if (!noteTimeProcessed) {
                            //     staffGroups = _measure.querySelectorAll('g.staff')
                            //     if (!this.staffGroups || this.staffGroups != staffGroups) {
                            //         this.staffGroups = staffGroups
                            //         this.measureTsNotes = []
                            //     }

                            //     sq_cursor = svg.querySelector('#playback-sq-cursor');
                            //     if (!sq_cursor) {
                            //         sq_cursor = document.createElementNS(svgNS, 'line');
                            //         sq_cursor.setAttribute('id', 'playback-sq-cursor');
                            //         sq_cursor.setAttribute('stroke', 'blue');
                            //         sq_cursor.setAttribute('stroke-width', '2');
                            //         sq_cursor.setAttribute('opacity', '0.5');
                                    
                            //         svg.appendChild(sq_cursor);
                            //     }
                            // }

                            for (let k = 0; k < staffGroups.length; k++) {
                                // if (!noteTimeProcessed) {
                                //     let singleStaffGroup = staffGroups[k];
                                //     let singleStaffNotes = singleStaffGroup.querySelectorAll('g.note');
                                //     if (!this.measureTsNotes) {
                                //         this.measureTsNotes = []
                                //     }
    
                                //     if (singleStaffNotes) {
                                //         for (let j = 0; j < singleStaffNotes.length; j++) {
                                //             let singleStaffNoteId = singleStaffNotes[j].id
                                //             let singleStaffNoteTime = yield this.app.verovio.getTimeForElement(singleStaffNoteId)
                                //             let _singleStaffNotePoint = note.ownerSVGElement.createSVGPoint();
                                //             let singleStaffNoteBBox = singleStaffNotes[j].getBBox()
                                //             _singleStaffNotePoint.x = singleStaffNoteBBox.x + singleStaffNoteBBox.width / 2;
                                //             _singleStaffNotePoint.y = singleStaffNoteBBox.y;

                                //             const singleStaffNotePoint = _singleStaffNotePoint.matrixTransform(ctm);
                                            
                                //             this.measureTsNotes.push({
                                //                 id: singleStaffNoteId,
                                //                 time: singleStaffNoteTime,
                                //                 x: singleStaffNotePoint.x,
                                //                 y1: systemLtPoint.y - toolbarHeight,
                                //                 y2: systemRbPoint.y - toolbarHeight
                                //             })
                                //         }
                                //     }
                                    
                                //     let singleStaffRests1 = singleStaffGroup.querySelectorAll('g.mRest');
                                //     let singleStaffRests2 = singleStaffGroup.querySelectorAll('g.rest');
                                //     let singleStaffRests = []
                                //     if (singleStaffRests1) {
                                //         singleStaffRests.push(...singleStaffRests1)
                                //     }
                                //     if (singleStaffRests2) {
                                //         singleStaffRests.push(...singleStaffRests2)
                                //     }

                                //     for (let j = 0; j < singleStaffRests.length; j++) {
                                //         let singleStaffNoteId = singleStaffRests[j].id
                                //         let singleStaffNoteTime = yield this.app.verovio.getTimeForElement(singleStaffNoteId)
                                //         let _singleStaffNotePoint = note.ownerSVGElement.createSVGPoint();
                                //         let singleStaffNoteBBox = singleStaffRests[j].getBBox()
                                //         _singleStaffNotePoint.x = singleStaffNoteBBox.x + singleStaffNoteBBox.width / 2;
                                //         _singleStaffNotePoint.y = singleStaffNoteBBox.y;

                                //         const singleStaffNotePoint = _singleStaffNotePoint.matrixTransform(ctm);
                                        
                                //         this.measureTsNotes.push({
                                //             id: singleStaffNoteId,
                                //             time: singleStaffNoteTime,
                                //             x: singleStaffNotePoint.x,
                                //             y1: systemLtPoint.y - toolbarHeight,
                                //             y2: systemRbPoint.y - toolbarHeight
                                //         })
                                //     }
                                // }

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

                            // if (!noteTimeProcessed) {
                            //     this.measureTsNotes = this.measureTsNotes.sort((a, b) => a.time < b.time)
                            //     if (this.measureTsNotes.length > 0) {
                            //         noteTimeProcessed = true
                            //     }
                            // }

                            // if (!nextNoteTimeProcessed) {
                            //     let measureGroups1 = _system.querySelectorAll('g.measure')
                            //     if (measureGroups1) {
                            //         let _systemMeasures = []
                            //         for (let i = 0; i < measureGroups1.length; i++) {
                            //             let delgatemeasure1 = measureGroups1[i]
                            //             if (delgatemeasure1.id != measure.id) {
                            //                 let delgatenote1 = delgatemeasure1.querySelector('g.note')
                                        
                            //                 // let delgatenoteTime1 = yield this.app.verovio.getTimeForElement(delgatenote1.id)
                            //                 let _delgatenotePoint1 = note.ownerSVGElement.createSVGPoint();
                            //                 let delgatenotePointBBox1 = delgatenote1.getBBox()
                            //                 _delgatenotePoint1.x = delgatenotePointBBox1.x + delgatenotePointBBox1.width / 2;
                            //                 _delgatenotePoint1.y = delgatenotePointBBox1.y;

                            //                 const delgatenotePoint1 = _delgatenotePoint1.matrixTransform(ctm);
                            //                 _systemMeasures.push({
                            //                     measure: delgatemeasure1,
                            //                     // time: delgatenoteTime1,
                            //                     x: delgatenotePoint1.x
                            //                 })
                            //             }
                            //         }
                            //         _systemMeasures = _systemMeasures.sort((a, b) => a.x < b.x)

                            //         if (_systemMeasures.length > 0) {
                            //             let nextMeasure = _systemMeasures[0].measure

                            //             let nextstaffGroups = nextMeasure.querySelectorAll('g.staff')
                            //             if (!this.nextstaffGroups || this.nextstaffGroups != nextstaffGroups) {
                            //                 if (nextstaffGroups) {
                            //                     this.nextstaffGroups = nextstaffGroups
                            //                 }
                            //                 this.nextmeasureTsNotes = []
                            //             }
                            //         }

                            //         if (this.nextstaffGroups) {
                            //             for (let k = 0; k < this.nextstaffGroups.length; k++) {
                                        
                            //                 let singleStaffGroup = this.nextstaffGroups[k];
                            //                 let singleStaffNotes = singleStaffGroup.querySelectorAll('g.note');
                                            
                            //                 if (singleStaffNotes) {
                            //                     for (let j = 0; j < singleStaffNotes.length; j++) {
                            //                         let singleStaffNoteId = singleStaffNotes[j].id
                            //                         let singleStaffNoteTime = yield this.app.verovio.getTimeForElement(singleStaffNoteId)
                            //                         let _singleStaffNotePoint = note.ownerSVGElement.createSVGPoint();
                            //                         let singleStaffNoteBBox = singleStaffNotes[j].getBBox()
                            //                         _singleStaffNotePoint.x = singleStaffNoteBBox.x + singleStaffNoteBBox.width / 2;
                            //                         _singleStaffNotePoint.y = singleStaffNoteBBox.y;
        
                            //                         const singleStaffNotePoint = _singleStaffNotePoint.matrixTransform(ctm);
                                                    
                            //                         this.nextmeasureTsNotes.push({
                            //                             id: singleStaffNoteId,
                            //                             time: singleStaffNoteTime,
                            //                             x: singleStaffNotePoint.x,
                            //                             y1: systemLtPoint.y - toolbarHeight,
                            //                             y2: systemRbPoint.y - toolbarHeight
                            //                         })
                            //                     }
                            //                 }


                            //                 let singleStaffRests1 = singleStaffGroup.querySelectorAll('g.mRest');
                            //                 let singleStaffRests2 = singleStaffGroup.querySelectorAll('g.rest');
                            //                 let singleStaffRests = []
                            //                 if (singleStaffRests1) {
                            //                     singleStaffRests.push(...singleStaffRests1)
                            //                 }
                            //                 if (singleStaffRests2) {
                            //                     singleStaffRests.push(...singleStaffRests2)
                            //                 }

                            //                 for (let j = 0; j < singleStaffRests.length; j++) {
                            //                     let singleStaffNoteId = singleStaffRests[j].id
                            //                     let singleStaffNoteTime = yield this.app.verovio.getTimeForElement(singleStaffNoteId)
                            //                     let _singleStaffNotePoint = note.ownerSVGElement.createSVGPoint();
                            //                     let singleStaffNoteBBox = singleStaffRests[j].getBBox()
                            //                     _singleStaffNotePoint.x = singleStaffNoteBBox.x + singleStaffNoteBBox.width / 2;
                            //                     _singleStaffNotePoint.y = singleStaffNoteBBox.y;

                            //                     const singleStaffNotePoint = _singleStaffNotePoint.matrixTransform(ctm);
                                                
                            //                     this.nextmeasureTsNotes.push({
                            //                         id: singleStaffNoteId,
                            //                         time: singleStaffNoteTime,
                            //                         x: singleStaffNotePoint.x,
                            //                         y1: systemLtPoint.y - toolbarHeight,
                            //                         y2: systemRbPoint.y - toolbarHeight
                            //                     })
                            //                 }
                                            
                            //             }
                            //         }
                            //     }

                            //     if (!this.nextmeasureTsNotes) {
                            //         this.nextmeasureTsNotes = []
                            //     }
                            //     this.nextmeasureTsNotes = this.nextmeasureTsNotes.sort((a, b) => a.time < b.time)
                            //     if (this.nextmeasureTsNotes.length > 0) {
                            //         nextNoteTimeProcessed = true
                            //     }
                            // }
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
                
            }

            for (let l = 0; l < cursorPositioned.length; l++) {
                if (!cursorPositioned[l]) {
                    cursorArray[l].setAttribute('x1', -100);
                    cursorArray[l].setAttribute('x2', -100);
                }
            }

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
                    for (let j = 0; j < cursorArray.length; j++) {
                        let y1Val = parseFloat(cursorArray[j].getAttribute('y1'));
                        let y2Val = parseFloat(cursorArray[j].getAttribute('y2'));
                        cursorArray[j].setAttribute('y1', y1Val - progressY);
                        cursorArray[j].setAttribute('y2', y2Val - progressY);
                    }
                }
                // 光标底部超出可视区域下方
                else if (cursorYBottomRelativeToContainerArray[cursorYBottomRelativeToContainerArray.length - 1] > scrollY + containerViewableHeight) {
                    // scrollContainer.scrollTop = cursorYBottomRelativeToContainerArray[cursorYBottomRelativeToContainerArray.length - 1] - containerViewableHeight;
                    let progressY = cursorYBottomRelativeToContainerArray[cursorYBottomRelativeToContainerArray.length - 1] - containerViewableHeight - scrollY + translateYOffset;
                    
                    svg.style.transform = `translateY(-${progressY}px)`;

                    for (let j = 0; j < cursorArray.length; j++) {
                        let y1Val = parseFloat(cursorArray[j].getAttribute('y1'));
                        let y2Val = parseFloat(cursorArray[j].getAttribute('y2'));
                        cursorArray[j].setAttribute('y1', y1Val - progressY);
                        cursorArray[j].setAttribute('y2', y2Val - progressY);
                    }
                }

                // if (cursorCenterYRelativeToContainerArray[0] < scrollY) {
                //     scrollContainer.scrollTo({ top: cursorCenterYRelativeToContainerArray[0], behavior: 'smooth' });
                // } else if (cursorCenterYRelativeToContainerArray[cursorCenterYRelativeToContainerArray.length - 1] > scrollY + containerViewableHeight) {
                //     scrollContainer.scrollTo({ top: cursorCenterYRelativeToContainerArray[cursorCenterYRelativeToContainerArray.length - 1] - containerViewableHeight, behavior: 'smooth' });
                // }
            }
            //////////////////////////////////////////////////////////////////////////////////////////////

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

            // console.log('******* elementsAtTime => ', elementsAtTime)

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