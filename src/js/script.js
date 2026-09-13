const elements = {
  theTextForTest: document.getElementById('theTextForTest'),
  btnStartTest: document.getElementById('btnStartTest'),
  notStarted: document.getElementById('not-started'),
  difficultyPanel: document.getElementById('difficultyPanel'),
  modePanel: document.getElementById('modePanel'),
  timeCounter: document.getElementById('timeCounter'),
  liveWPMEl: document.getElementById('liveWPM'),
  liveAccEl: document.getElementById('liveAcc'),
  testComplete: document.getElementById('test-complete'),
  content: document.getElementById('content'),
  baselineEstablished: document.getElementById('baseline-established'),
  highScoresSmashed: document.getElementById('high-score-smashed'),
  lastWPMEl: document.getElementById('lastWPMEl'),
  resetBtnTest: document.getElementById('resetBtnTest'),
  charElements: [],
  currentIndex: 0,
  seconds: 60,
  baseTime: 60,
  lastWPM: 0,
  WPM: 0,
  accuracy: 0,
  totalWord: {
    correct: 0,
    wrong: 0,
  },
  timerRef: '',
  modeCounter: 'timed',
  startController: new AbortController(),
  hiddenInput: null,
};

const createMobileInput = () => {
  elements.hiddenInput = document.createElement('input');
  elements.hiddenInput.type = 'text';
  elements.hiddenInput.id = 'mobileHiddenInput';
  elements.hiddenInput.style.cssText =
    'position: absolute; opacity: 0; pointer-events: none; height: 0; width: 0;';
  document.body.appendChild(elements.hiddenInput);
  elements.hiddenInput.addEventListener('input', handleMobileTyping);
};

const hiddenShape = el => {
  el.classList.add('hidden-item');
  el.inert = true;
};

const showShape = el => {
  el.classList.remove('hidden-item');
  el.inert = false;
};

const toggleBtnRestTest = () => {
  if (elements.resetBtnTest.disabled) elements.resetBtnTest.disabled = false;
  else elements.resetBtnTest.disabled = true;
};

const editUIStats = el => {
  const wpmEl = el.querySelector('.result-wpm');
  const accEl = el.querySelector('.result-accuracy');
  const correctCharEl = el.querySelector('.result-correct-chars');
  const wrongCharEl = el.querySelector('.result-wrong-chars');
  const timeEl = el.querySelector('.result-time');
  const finalElapsedSeconds =
    elements.modeCounter === 'timed'
      ? elements.baseTime - elements.seconds
      : elements.seconds;
  wpmEl.textContent = elements.WPM;
  accEl.textContent = elements.accuracy;
  correctCharEl.textContent = elements.totalWord.correct;
  wrongCharEl.textContent = elements.totalWord.wrong;
  timeEl.textContent = finalElapsedSeconds;
};

const counter = () => {
  const min = Math.floor(elements.seconds / elements.baseTime)
    .toString()
    .padStart(2, '0');
  const sec = Math.floor(elements.seconds % elements.baseTime)
    .toString()
    .padStart(2, '0');
  elements.timeCounter.querySelector('#min').textContent = min;
  elements.timeCounter.querySelector('#sec').textContent = sec;
  elements.seconds--;
};

const setLastWPM = () => {
  if (!(elements.lastWPM <= elements.WPM)) return;
  elements.lastWPM = elements.WPM;
  elements.lastWPMEl.textContent = elements.lastWPM;
  localStorage.setItem('lastWPM', elements.lastWPM.toString());
};

const counterUp = () => {
  const min = Math.floor(elements.seconds / elements.baseTime)
    .toString()
    .padStart(2, '0');
  const sec = Math.floor(elements.seconds % elements.baseTime)
    .toString()
    .padStart(2, '0');
  elements.timeCounter.querySelector('#min').textContent = min;
  elements.timeCounter.querySelector('#sec').textContent = sec;
  elements.seconds++;
};

const getLastWPM = () => {
  const res = localStorage.getItem('lastWPM');
  if (!res) return;
  elements.lastWPM = +res;
  elements.lastWPMEl.textContent = elements.lastWPM;
};

const startTimerDown = () => {
  elements.timerRef = setInterval(() => {
    if (elements.seconds === 0) {
      clearInterval(elements.timerRef);
      let targetEl;
      if (elements.lastWPM === 0) {
        targetEl = elements.baselineEstablished;
      } else if (elements.WPM > elements.lastWPM) {
        targetEl = elements.highScoresSmashed;
      } else {
        targetEl = elements.testComplete;
      }
      editUIStats(targetEl);
      showShape(targetEl);
      hiddenShape(elements.content);
      setLastWPM();
      document.removeEventListener('keydown', handleTyping);
      elements.hiddenInput.blur();
    }
    counter();
  }, 1000);
};

const startTimerUp = () => {
  elements.timerRef = setInterval(counterUp, 1000);
};

const focusMobileInput = () => {
  if (window.innerWidth < 768) {
    elements.hiddenInput.focus();
  }
};

const triggerStartTest = () => {
  hiddenShape(elements.notStarted);
  if (elements.modeCounter === 'timed') startTimerDown();
  else startTimerUp();
  elements.theTextForTest.classList.remove('overlay-text');
  elements.theTextForTest.setAttribute('aria-hidden', false);
  elements.startController.abort();
  toggleModePanels();
  toggleBtnRestTest();
  focusMobileInput();
};

const computeWPM = () => {
  const elapsedSeconds =
    elements.modeCounter === 'timed'
      ? elements.baseTime - elements.seconds
      : elements.seconds;
  const elapsedMinutes = elapsedSeconds / 60;
  elements.WPM =
    elapsedMinutes > 0
      ? Math.round(elements.totalWord.correct / 5 / elapsedMinutes)
      : 0;
};

const computeAccuracy = () => {
  const totalChars = elements.totalWord.wrong + elements.totalWord.correct;
  elements.accuracy =
    totalChars > 0
      ? Math.round((elements.totalWord.correct / totalChars) * 100)
      : 100;
};

const computeStats = () => {
  computeWPM();
  computeAccuracy();
};

const clickOfText = () => {
  elements.theTextForTest.addEventListener('click', triggerStartTest, {
    signal: elements.startController.signal,
  });
};

const clickOfBtnStart = () => {
  elements.btnStartTest.addEventListener('click', triggerStartTest, {
    signal: elements.startController.signal,
  });
};

const pressOnKey = () => {
  document.addEventListener('keypress', triggerStartTest, {
    signal: elements.startController.signal,
  });
};

const handlersForStart = () => {
  clickOfText();
  clickOfBtnStart();
  pressOnKey();
};

const startTestHandler = () => {
  handlersForStart();
};

const splitTextAndCreateSpan = () => {
  let passageText = elements.theTextForTest.textContent;
  passageText = passageText.replace(/\s+/g, ' ').trim();
  elements.charElements = passageText.split('');
  elements.theTextForTest.innerHTML = '';
  elements.charElements.forEach((chr, i) => {
    const span = document.createElement('span');
    span.textContent = chr;
    if (i === 0) span.classList.add('current-cursor');
    span.classList.add('char');
    elements.theTextForTest.append(span);
  });
};

const vaildRightCahr = chr => {
  const typeSound = new Audio('./sounds/key-click.mp3');
  typeSound.volume = 0.5;
  typeSound.play();
  chr.classList.remove('current-cursor');
  chr.classList.add('right-cursor');
  elements.totalWord.correct++;
};

const vaildWrongCahr = chr => {
  const errorSound = new Audio('./sounds/erorr.mp3');
  errorSound.volume = 0.5;
  errorSound.play();
  chr.classList.remove('current-cursor');
  chr.classList.add('wrong-cursor');
  elements.totalWord.wrong++;
};

const markOnNextEl = nextChr => {
  if (!nextChr) return;
  nextChr.classList.add('current-cursor');
};

const handleBackSpace = () => {
  if (elements.currentIndex <= 0) return;
  const targerChar =
    document.querySelectorAll('.char')[elements.currentIndex - 1];
  const type = document
    .querySelectorAll('.char')
    [elements.currentIndex - 1].classList.contains('right-cursor')
    ? 'correct'
    : 'wrong';
  document
    .querySelectorAll('.char')
    .forEach(btn => btn.classList.remove('current-cursor'));
  targerChar.classList.remove('wrong-cursor', 'right-cursor');
  elements.totalWord[type]--;
  markOnNextEl(targerChar);
  computeStats();
  elements.liveWPMEl.textContent = elements.WPM;
  elements.liveAccEl.textContent = elements.accuracy;
  elements.currentIndex--;
};

const handleTyping = e => {
  if (e.key === 'Backspace') {
    handleBackSpace();
    return;
  }
  if (e.key.length !== 1) return;
  const keyPressed = e.key;
  const expectedKey = elements.charElements[elements.currentIndex];
  const targerChar = document.querySelectorAll('.char')[elements.currentIndex];
  const nextChr = document.querySelectorAll('.char')[elements.currentIndex + 1];
  if (keyPressed === expectedKey) vaildRightCahr(targerChar);
  else vaildWrongCahr(targerChar);
  markOnNextEl(nextChr);
  computeStats();
  elements.liveWPMEl.textContent = elements.WPM;
  elements.liveAccEl.textContent = elements.accuracy;
  elements.currentIndex++;
  if (elements.currentIndex >= elements.charElements.length) {
    document.removeEventListener('keydown', handleTyping);
    clearInterval(elements.timerRef);
    elements.modeCounter === 'timed' ? elements.seconds++ : elements.seconds--;
    let targetEl;
    if (elements.lastWPM === 0) {
      targetEl = elements.baselineEstablished;
    } else if (elements.WPM > elements.lastWPM) {
      targetEl = elements.highScoresSmashed;
    } else {
      targetEl = elements.testComplete;
    }
    editUIStats(targetEl);
    showShape(targetEl);
    hiddenShape(elements.content);
    setLastWPM();
    return;
  }
};

const handleMobileTyping = e => {
  if (e.inputType === 'deleteContentBackward') {
    handleBackSpace();
    return;
  }
  const keyPressed = e.data;
  if (!keyPressed || keyPressed.length !== 1) return;

  const expectedKey = elements.charElements[elements.currentIndex];
  const targerChar = document.querySelectorAll('.char')[elements.currentIndex];
  const nextChr = document.querySelectorAll('.char')[elements.currentIndex + 1];

  if (keyPressed === expectedKey) vaildRightCahr(targerChar);
  else vaildWrongCahr(targerChar);

  markOnNextEl(nextChr);
  computeStats();
  elements.liveWPMEl.textContent = elements.WPM;
  elements.liveAccEl.textContent = elements.accuracy;
  elements.currentIndex++;

  if (elements.currentIndex >= elements.charElements.length) {
    elements.hiddenInput.blur();
    clearInterval(elements.timerRef);
    elements.modeCounter === 'timed' ? elements.seconds++ : elements.seconds--;
    let targetEl;
    if (elements.lastWPM === 0) {
      targetEl = elements.baselineEstablished;
    } else if (elements.WPM > elements.lastWPM) {
      targetEl = elements.highScoresSmashed;
    } else {
      targetEl = elements.testComplete;
    }
    editUIStats(targetEl);
    showShape(targetEl);
    hiddenShape(elements.content);
    setLastWPM();
    return;
  }
};

const typingHandler = () => {
  splitTextAndCreateSpan();
  document.addEventListener('keydown', handleTyping);
};

const renderTextPessage = dif => {
  const passagesLookup = {
    easy: 'The sun rose over the quiet town. Birds sang in the trees as people woke up and started their day.',
    medium:
      'Learning a new programming language takes time and patience. Consistent practice every day is the key to building strong problem-solving skills.',
    hard: 'The archaeological expedition unearthed artifacts that complicated prevailing theories about Bronze Age trade networks. Obsidian from Anatolia, lapis lazuli from Afghanistan, and amber from the Baltic—all discovered in a single Mycenaean tomb—suggested commercial connections far more extensive than previously hypothesized.',
  };
  const passage = passagesLookup[dif];
  elements.theTextForTest.textContent = passage;
};

const markOnTargetBtn = (el, parentEl) => {
  parentEl.querySelectorAll('.chip').forEach(btn => {
    btn.classList.remove('chip-active');
    btn.setAttribute('aria-pressed', false);
  });
  el.classList.add('chip-active');
  el.setAttribute('aria-pressed', true);
};

const toggleModePanels = () => {
  elements.difficultyPanel.classList.toggle('not-able');
  elements.modePanel.classList.toggle('not-able');
};

const handleDifficultyPanel = () => {
  elements.difficultyPanel.addEventListener('click', e => {
    const targetEl = e.target.closest('.chip');
    if (!targetEl) return;
    const dif = targetEl.dataset.difficulty;
    renderTextPessage(dif);
    markOnTargetBtn(targetEl, elements.difficultyPanel);
    splitTextAndCreateSpan();
  });
};

const renderTimeCount = time => {
  elements.timeCounter.querySelector('#min').textContent = time.min;
  elements.timeCounter.querySelector('#sec').textContent = time.sec;
};

const renderTimeMode = mode => {
  const timeMode = mode;
  const gameModes = {
    timed: {
      min: '01',
      sec: '00',
    },
    passage: {
      min: '00',
      sec: '00',
    },
  };
  elements.modeCounter = timeMode;
  if (elements.modeCounter === 'timed') elements.seconds = 60;
  else elements.seconds = 0;
  renderTimeCount(gameModes[timeMode]);
};

const handleMode = () => {
  elements.modePanel.addEventListener('click', e => {
    const targetEl = e.target.closest('.chip');
    if (!targetEl) return;
    renderTimeMode(targetEl.dataset.mode);
    markOnTargetBtn(targetEl, elements.modePanel);
  });
};

const resetStates = () => {
  elements.WPM = 0;
  elements.accuracy = 0;
  elements.seconds = 60;
  elements.currentIndex = 0;
  elements.totalWord.correct = 0;
  elements.totalWord.wrong = 0;
  elements.charElements = [];
  elements.modeCounter = 'timed';
  elements.timerRef = '';
  elements.startController = new AbortController();
};

const resetstatesUI = () => {
  elements.liveWPMEl.textContent = elements.WPM;
  elements.liveAccEl.textContent = '100';
  elements.timeCounter.querySelector('#min').textContent = '01';
  elements.timeCounter.querySelector('#sec').textContent = '00';
  elements.theTextForTest.classList.add('overlay-text');
};

const reset = e => {
  const parentEl = e.target.closest('.container-shape');
  if (parentEl) {
    hiddenShape(parentEl);
    showShape(elements.content);
  }
  clearInterval(elements.timerRef);
  resetStates();
  resetstatesUI();
  handlersForStart();
  showShape(elements.notStarted);
  toggleBtnRestTest();
  splitTextAndCreateSpan();
  document.addEventListener('keydown', handleTyping);
  toggleModePanels();
  elements.hiddenInput.value = '';
};

const handleBtnsResst = () => {
  document.querySelectorAll('.btnReset').forEach(btn => {
    btn.addEventListener('click', reset);
  });
};

const updateSummary = (text, parentEl) => {
  const summary = parentEl.querySelector('.dropdown-heading');
  summary.textContent = text;
};

const handlePanelsMobile = () => {
  const panels = document.querySelectorAll('.dropdown-panel');
  panels.forEach(panel => {
    panel.addEventListener('change', e => {
      const targetInput = e.target.closest('input[type="radio"]');
      if (!targetInput) return;
      const parentEl = targetInput.closest('.dropdown');
      const icon = parentEl.querySelector('.icon-recolor');
      const val = targetInput.value;
      updateSummary(val, parentEl);
      icon.classList.toggle('rotate-180');
      if (targetInput.name === 'difficulty-idle') {
        renderTextPessage(val);
        splitTextAndCreateSpan();
      } else renderTimeMode(targetInput.value);
      parentEl.open = false;
    });
    const parentPanel = panel.closest('.dropdown');
    parentPanel.addEventListener('click', e => {
      const parentEl = e.currentTarget;
      const icon = parentEl.querySelector('.icon-recolor');
      icon.classList.toggle('rotate-180');
    });
  });
};

const init = () => {
  createMobileInput();
  handlePanelsMobile();
  handleBtnsResst();
  getLastWPM();
  startTestHandler();
  typingHandler();
  handleDifficultyPanel();
  handleMode();
};

init();
