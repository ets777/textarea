import App from '../node_modules/etsbox-canvas-lib/src/App.js';

const config = {
    canvasId: 'app',
    width: 450,
    height: 120,
    backgroundColor: 'white'
}
const app = new App(config);
const context = app.context;

const textareaWidth = 400;
const textareaHeight = 40;
const textareaX = 20;
const textareaY = 20;
const textareaPaddingLeft = 10;
const textareaPaddingTop = 10;
const textareaPaddingRight = 10;
const textareaPaddingBottom = 10;
const textareaMaxLength = 15;
let textareaText = '';
let textareaFocus = false;
let textareaCaretPosition = 0;
let previousTextareaCaretPosition = 0;
const textareaCaretInterval = 1000;
const cycleDuration = 10;
let totalTime = 0;
let timeShift = 0;
let startSelectionPosition = 0;
let endSelectionPosition = 0;
let isSelectionInProgress = false;
let isTextSelected = false;
let ctrlIsDown = false;

function drawBorder() {
    context.beginPath();
    context.rect(textareaX, textareaY, textareaWidth, textareaHeight);
    context.stroke();
}

function isCursorAboveArea(e) {
    const cursorX = e.offsetX;
    const cursorY = e.offsetY;

    return cursorX < textareaX + textareaWidth &&
        cursorX > textareaX &&
        cursorY < textareaY + textareaHeight &&
        cursorY > textareaY;
}

function drawCaret() {
    const textWidth = context.measureText(textareaText.substring(0, textareaCaretPosition)).width;

    if (textareaCaretPosition !== previousTextareaCaretPosition) {
        timeShift = totalTime % textareaCaretInterval;
    }

    if (textareaFocus && (totalTime - timeShift) % textareaCaretInterval < textareaCaretInterval / 2) {
        const caretX = textareaX + textareaPaddingLeft + textWidth;

        context.beginPath();
        context.lineWidth = 2;
        context.moveTo(caretX, textareaY + 5);
        context.lineTo(caretX, textareaY + textareaHeight - 5);
        context.stroke();
    }

    previousTextareaCaretPosition = textareaCaretPosition;
}

function drawText() {
    context.fillStyle = 'black';
    context.font = '30px Arial';
    context.rect(textareaX, textareaY, textareaWidth, textareaHeight);
    context.fillText(textareaText, textareaX + textareaPaddingLeft, textareaY + textareaHeight - textareaPaddingBottom);
}

function drawOutputText() {
    context.fillStyle = 'black';
    context.font = '30px Arial';
    if (textareaText.length > 0) {
        context.fillText(`Привет, ${textareaText}`, textareaX, 100);
    }
}

function drawLabelText() {
    context.fillStyle = 'black';
    context.font = '12px Arial';
    context.fillText('Введите ваше имя', textareaX, textareaY - 5);
}

function drawSelection() {
    if (isTextSelected || isSelectionInProgress) {
        let selectionX;
        let selectionWidth;
        context.fillStyle = 'cyan';
        if (startSelectionPosition < endSelectionPosition) {
            selectionX = context.measureText(textareaText.substring(0, startSelectionPosition)).width;
            selectionWidth = context.measureText(textareaText.substring(startSelectionPosition, endSelectionPosition)).width;
        } else {
            selectionX = context.measureText(textareaText.substring(0, endSelectionPosition)).width;
            selectionWidth = context.measureText(textareaText.substring(endSelectionPosition, startSelectionPosition)).width;
        }

        context.fillRect(textareaX + textareaPaddingLeft + selectionX, textareaY + textareaPaddingTop - 3, selectionWidth, textareaHeight - textareaPaddingTop - 3);
    }
}

function setCaretPosition(e) {
    const cursorX = e.offsetX;
    let textWidth = context.measureText(textareaText).width;

    if (cursorX > textWidth + textareaX + textareaPaddingLeft) {
        textareaCaretPosition = textareaText.length;
        return;
    }

    for (let i = 1; i <= textareaText.length; i++) {
        textWidth = context.measureText(textareaText.substring(0, i)).width;

        if (textWidth + textareaX + textareaPaddingLeft > cursorX) {
            const prevTextWidth = context.measureText(textareaText.substring(0, i - 1)).width;

            if (cursorX - (prevTextWidth + textareaX + textareaPaddingLeft) > textWidth + textareaX + textareaPaddingLeft - cursorX) {
                textareaCaretPosition = i;
            } else {
                textareaCaretPosition = i - 1;
            }

            return;
        }

        textareaCaretPosition = i + 1;
    }
}

function resetSelection() {
    startSelectionPosition = 0;
    endSelectionPosition = 0;
    isSelectionInProgress = false;
    isTextSelected = false;
}

function deleteSelectedText() {
    if (endSelectionPosition > startSelectionPosition) {
        textareaText = textareaText.slice(0, startSelectionPosition) + textareaText.slice(endSelectionPosition, textareaText.length);
        textareaCaretPosition = startSelectionPosition;
    } else {
        textareaText = textareaText.slice(0, endSelectionPosition) + textareaText.slice(startSelectionPosition, textareaText.length);
        textareaCaretPosition = endSelectionPosition;
    }

    resetSelection();
}

document.addEventListener('mousedown', e => {
    isSelectionInProgress = isCursorAboveArea(e);
    setCaretPosition(e);
    startSelectionPosition = textareaCaretPosition;
    endSelectionPosition = textareaCaretPosition;
});

document.addEventListener('mousemove', e => {
    document.body.style.cursor = isCursorAboveArea(e) ? 'text' : 'default';
    if (isSelectionInProgress && isCursorAboveArea(e)) {
        setCaretPosition(e);
        endSelectionPosition = textareaCaretPosition;

        isTextSelected = true;
    }
});

document.addEventListener('mouseup', e => {
    textareaFocus = isCursorAboveArea(e) || isSelectionInProgress;

    isSelectionInProgress = false;
});

document.addEventListener('click', e => {
    if (textareaFocus) {
        setCaretPosition(e);
    }

    if (endSelectionPosition == startSelectionPosition) {
        resetSelection();
    }

});

document.addEventListener('keypress', e => {
    if (textareaFocus && e.key != 'Enter' && e.key != 'Delete' && (textareaText.length < textareaMaxLength || isTextSelected)) {

        if (isTextSelected) {
            deleteSelectedText();
        }

        textareaText = textareaText.slice(0, textareaCaretPosition) + e.key + textareaText.slice(textareaCaretPosition, textareaText.length);
        textareaCaretPosition++;
    }
});

document.addEventListener('keydown', e => {
    if (isTextSelected && ['Delete', 'Backspace'].includes(e.key)) {
        deleteSelectedText();
    } else {
        if (e.key == 'Backspace') {
            textareaText = textareaText.slice(0, textareaCaretPosition - +(textareaCaretPosition > 0)) + textareaText.slice(textareaCaretPosition, textareaText.length);
            textareaCaretPosition -= +(textareaCaretPosition > 0);
        }

        if (e.key == 'Delete') {
            textareaText = textareaText.slice(0, textareaCaretPosition) + textareaText.slice(textareaCaretPosition + 1, textareaText.length);
        }
    }

    if (e.key == 'ArrowLeft' && !ctrlIsDown) {
        textareaCaretPosition -= +(textareaCaretPosition > 0);
        resetSelection();
    }

    if (e.key == 'ArrowRight' && !ctrlIsDown) {
        textareaCaretPosition += +(textareaCaretPosition < textareaText.length);
        resetSelection();
    }

    if (['ArrowLeft', 'ArrowRight'].includes(e.key) && ctrlIsDown) {
        let wordsPosition = [...textareaText.matchAll(/\s+/g)];
        wordsPosition = wordsPosition.map(a => a.index + a[0].length);

        if (e.key == 'ArrowLeft') {
            wordsPosition = wordsPosition.filter(a => a < textareaCaretPosition);
            textareaCaretPosition = wordsPosition[wordsPosition.length - 1] || 0;
        } else {
            wordsPosition = wordsPosition.filter(a => a > textareaCaretPosition);
            textareaCaretPosition = wordsPosition[0] || textareaText.length;
        }
    }

    if (e.key == 'Control') {
        ctrlIsDown = true;
    }

    if ((e.key == 'c' || e.key == 'с') && ctrlIsDown && isTextSelected) {
        if (startSelectionPosition > endSelectionPosition) {
            navigator.clipboard.writeText(textareaText.slice(endSelectionPosition, startSelectionPosition));
        } else {
            navigator.clipboard.writeText(textareaText.slice(startSelectionPosition, endSelectionPosition));
        }
    }

    if ((e.key == 'x' || e.key == 'ч') && ctrlIsDown && isTextSelected) {
        navigator.clipboard.writeText(textareaText.slice(startSelectionPosition, endSelectionPosition));

        deleteSelectedText();
    }

    if ((e.key == 'v' || e.key == 'м') && ctrlIsDown) {
        navigator.clipboard.readText().then(clipboardText => {
            if (clipboardText.length > 0) {
                deleteSelectedText();

                textareaText = textareaText.slice(0, textareaCaretPosition) + clipboardText + textareaText.slice(textareaCaretPosition, textareaText.length);

                if (textareaText.length > textareaMaxLength) {
                    textareaText = textareaText.slice(0, textareaMaxLength);
                }

                textareaCaretPosition += clipboardText.length;
            }
        });
    }

    if ((e.key == 'a' || e.key == 'ф') && ctrlIsDown) {
        isTextSelected = true;
        startSelectionPosition = 0;
        endSelectionPosition = textareaText.length;
        textareaCaretPosition = textareaText.length;
    }
});

document.addEventListener('keyup', e => {
    if (e.key == 'Control') {
        ctrlIsDown = false;
    }
});

function textareaCycle() {
    totalTime += cycleDuration;
    app.clearBoard();
    drawBorder();
    drawSelection();
    drawCaret();
    drawOutputText();
    drawLabelText();
    drawText();
}

setInterval(textareaCycle, cycleDuration);