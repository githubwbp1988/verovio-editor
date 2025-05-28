/**
 * The Keyboard class.
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
import { EventManager } from './event-manager.js';
import { appendDivTo, appendMidiPlayerTo } from './utils/functions.js';
import { midiScale } from './utils/midi-scale.js';
export class Keyboard {
    constructor(div, app) {
        let iconsLeft = `${app.host}/music/icons/keyboard/left.png`;
        let iconsRight = `${app.host}/music/icons/keyboard/right.png`;
        this.element = div;
        // Remove previous content
        this.element.innerHTML = "";
        this.app = app;
        this.midiPlayerElement = appendMidiPlayerTo(this.element, {});
        this.midiPlayerElement.setAttribute('src', midiScale);
        this.eventManager = new EventManager(this);
        this.bindListeners(); // Document/Window-scoped events
        let left = appendDivTo(this.element, { class: `vrv-keyboard-navigator`, style: { backgroundImage: `url(${iconsLeft})` } });
        this.eventManager.bind(left, 'click', this.activateLower);
        this.keyboardWrapper = appendDivTo(this.element, { class: `vrv-keyboard-wrapper` });
        let right = appendDivTo(this.element, { class: `vrv-keyboard-navigator`, style: { backgroundImage: `url(${iconsRight})` } });
        this.eventManager.bind(right, 'click', this.activateHigher);
        this.octaves = appendDivTo(this.keyboardWrapper, { class: `vrv-keyboard-octaves` });
        this.keys = appendDivTo(this.keyboardWrapper, { class: `vrv-keyboard-keys` });
        this.eventManager.bind(this.keys, 'mousedown', this.mouseDownListener);
        this.eventManager.bind(this.keys, 'mouseup', this.mouseUpListener);
        this.letters = ['A', 'W', 'S', 'E', 'D', 'F', 'T', 'G', 'Y', 'H', 'U', 'J', 'K', 'O', 'L', 'P', ';'];
        this.octaveNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        this.octaveNumbers.forEach(octave => {
            let oct = appendDivTo(this.octaves, { class: `vrv-keyboard-octave` });
            oct.innerHTML = `C${octave}`;
            let midi = (octave + 1) * 12;
            let c2 = appendDivTo(this.keys, { class: `vrv-keyboard-key white`, 'data-midi': `${midi++}` });
            let c2s = appendDivTo(this.keys, { class: `vrv-keyboard-key black`, 'data-midi': `${midi++}` });
            let d2 = appendDivTo(this.keys, { class: `vrv-keyboard-key white`, 'data-midi': `${midi++}` });
            let d2s = appendDivTo(this.keys, { class: `vrv-keyboard-key black`, 'data-midi': `${midi++}` });
            let e2 = appendDivTo(this.keys, { class: `vrv-keyboard-key white`, 'data-midi': `${midi++}` });
            let f2 = appendDivTo(this.keys, { class: `vrv-keyboard-key white`, 'data-midi': `${midi++}` });
            let f2s = appendDivTo(this.keys, { class: `vrv-keyboard-key black`, 'data-midi': `${midi++}` });
            let g2 = appendDivTo(this.keys, { class: `vrv-keyboard-key white`, 'data-midi': `${midi++}` });
            let g2s = appendDivTo(this.keys, { class: `vrv-keyboard-key black`, 'data-midi': `${midi++}` });
            let a2 = appendDivTo(this.keys, { class: `vrv-keyboard-key white`, 'data-midi': `${midi++}` });
            let a2s = appendDivTo(this.keys, { class: `vrv-keyboard-key black`, 'data-midi': `${midi++}` });
            let b2 = appendDivTo(this.keys, { class: `vrv-keyboard-key white`, 'data-midi': `${midi++}` });
        });
        this.eventManager.bind(this.element, 'mouseleave', this.mouseLeaveListener);
        this.eventManager.bind(this.element, 'mouseenter', this.mouseEnterListener);
        this.currentOctave = 3;
        this.activate();
    }
    bindListeners() {
        this.boundKeyDown = (e) => this.keyDownListener(e);
        this.boundKeyUp = (e) => this.keyUpListener(e);
    }
    keyDownListener(e) {
        if (e.key === 'ArrowLeft')
            this.activateLower();
        else if (e.key === 'ArrowRight')
            this.activateHigher();
        else {
            let index = this.letters.indexOf(e.key.toUpperCase());
            if (index !== -1) {
                let octaveIndex = (this.currentOctave - 1) * 12 + index;
                let key = this.keys.children[octaveIndex];
                key.classList.add("active");
                this.playNoteSound((index + 12 * this.currentOctave).toString());
            }
        }
        e.preventDefault();
        //console.log(e);
    }
    keyUpListener(e) {
        this.keys.querySelectorAll('.vrv-keyboard-key').forEach(element => element.classList.remove("active"));
        console.log(e);
    }
    mouseDownListener(e) {
        let target = e.target;
        target.classList.add("active");
        if (target.dataset.midi) {
            this.playNoteSound(target.dataset.midi);
        }
        e.preventDefault();
    }
    mouseUpListener(e) {
        let target = e.target;
        target.classList.remove("active");
    }
    mouseEnterListener(e) {
        document.addEventListener('keydown', this.boundKeyDown);
        document.addEventListener('keyup', this.boundKeyUp);
    }
    mouseLeaveListener(e) {
        document.removeEventListener('keydown', this.boundKeyDown);
        document.removeEventListener('keyup', this.boundKeyUp);
    }
    ////////////////////////////////////////////////////////////////////////
    // Async worker methods
    ////////////////////////////////////////////////////////////////////////
    playNoteSound(midi) {
        return __awaiter(this, void 0, void 0, function* () {
            let midiNum = Number(midi);
            // Limit the range to playable notes
            if (Number(midi) > 107)
                return;
            if (Number(midi) < 21)
                return;
            this.midiPlayerElement.stop();
            this.midiPlayerElement.currentTime = ((Number(midi) - 21) * 0.5);
            this.midiPlayerElement.start();
            setTimeout(() => {
                this.midiPlayerElement.stop();
            }, 500);
        });
    }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    activateLower() {
        if (this.currentOctave <= 1)
            return;
        this.currentOctave--;
        this.activate();
    }
    activateHigher() {
        if (this.currentOctave >= this.octaveNumbers.length)
            return;
        this.currentOctave++;
        this.activate();
    }
    activate() {
        this.keys.querySelectorAll('.vrv-keyboard-key').forEach(element => element.classList.remove('selected'));
        this.octaves.querySelectorAll('.vrv-keyboard-octave').forEach(element => element.classList.remove('selected'));
        let key = this.keys.children[(this.currentOctave - 1) * 12];
        this.letters.forEach(letter => {
            if (key) {
                key.setAttribute('data-key', letter);
                key.classList.add('selected');
                key = key.nextElementSibling;
            }
        });
        let octave = this.octaves.children[this.currentOctave - 1];
        octave.classList.add('selected');
        let totalWidth = this.keys.scrollWidth;
        if (totalWidth === 0)
            return;
        let visibleWidth = this.keys.clientWidth;
        let octaveWidth = octave.scrollWidth;
        let octaveOffset = octave.offsetLeft;
        let shift = octaveOffset - (visibleWidth / 2) + (octaveWidth / 2);
        //this.keyboardWrapper.scrollLeft = shift;
        this.keyboardWrapper.scroll({
            left: shift,
            behavior: "smooth",
        });
    }
}
class Octave {
}
//# sourceMappingURL=keyboard.js.map