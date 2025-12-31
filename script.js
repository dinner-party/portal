// ========================================
// DEFAULT CONFIGURATION
// ========================================

const DEFAULTS = {
    code: '9473',
    prompt: 'ENTER ACCESS CODE',
    riddle: 'A heart of ice and veins of steel, many things in me congeal.\n\nOnly when I open up, will secrets be revealed.',
    theme: 'mystery',
    typeSpeed: 30,
    alignment: 'left'
};

// ========================================
// LOAD SETTINGS FROM STORAGE
// ========================================

function loadSettings() {
    const saved = localStorage.getItem('escapeRoomSettings');
    if (saved) {
        try {
            return { ...DEFAULTS, ...JSON.parse(saved) };
        } catch (e) {
            return { ...DEFAULTS };
        }
    }
    return { ...DEFAULTS };
}

function saveSettings(settings) {
    localStorage.setItem('escapeRoomSettings', JSON.stringify(settings));
}

function clearSettings() {
    localStorage.removeItem('escapeRoomSettings');
}

let settings = loadSettings();

// ========================================
// DOM ELEMENTS
// ========================================

const boxes = [
    document.getElementById('box1'),
    document.getElementById('box2'),
    document.getElementById('box3'),
    document.getElementById('box4')
];
const submitBtn = document.getElementById('submitBtn');
const codeEntry = document.getElementById('codeEntry');
const riddleContainer = document.getElementById('riddleContainer');
const riddleText = document.getElementById('riddleText');
const cursor = document.getElementById('cursor');
const flashOverlay = document.getElementById('flashOverlay');

// Settings elements
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const settingsClose = document.getElementById('settingsClose');
const settingsTheme = document.getElementById('settingsTheme');
const settingsCode = document.getElementById('settingsCode');
const settingsPrompt = document.getElementById('settingsPrompt');
const settingsRiddle = document.getElementById('settingsRiddle');
const settingsTypeSpeed = document.getElementById('settingsTypeSpeed');
const settingsAlignment = document.getElementById('settingsAlignment');
const settingsSave = document.getElementById('settingsSave');
const settingsReset = document.getElementById('settingsReset');

// Prompt text element
const promptText = document.querySelector('.prompt-text');

// ========================================
// INITIALIZATION
// ========================================

function init() {
    // Apply saved theme
    applyTheme(settings.theme);
    
    // Apply saved prompt text
    if (settings.prompt) {
        promptText.textContent = settings.prompt;
    }
    
    // Apply saved alignment
    applyAlignment(settings.alignment);
    
    // Auto-focus first box
    boxes[0].focus();
}

function applyAlignment(alignment) {
    riddleText.style.textAlign = alignment;
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update settings dropdown
    if (settingsTheme) {
        settingsTheme.value = theme;
    }
    
    settings.theme = theme;
}

window.addEventListener('load', init);

// ========================================
// SETTINGS BUTTON REVEAL (Ctrl+,)
// ========================================

document.addEventListener('keydown', (e) => {
    // Don't trigger if settings modal is open
    if (settingsModal.classList.contains('open')) {
        return;
    }
    
        // Ctrl+, (Windows/Linux) or Cmd+, (Mac) to toggle settings button
    if (e.ctrlKey && e.key === ',') {
    if ((e.ctrlKey || e.metaKey) && e.key === ',') {
         e.preventDefault();
         e.preventDefault();
         settingsBtn.classList.toggle('visible');
         settingsBtn.classList.toggle('visible');
     }
     }
});

// Long press detection for mobile (hold for 3 seconds)
let longPressTimer = null;

document.addEventListener('touchstart', (e) => {
    // Don't trigger if settings modal is open or touching an input
    if (settingsModal.classList.contains('open') || 
        e.target.tagName === 'INPUT' || 
        e.target.tagName === 'TEXTAREA' ||
        e.target.tagName === 'BUTTON' ||
        e.target.tagName === 'SELECT') {
        return;
    }

    longPressTimer = setTimeout(() => {
        settingsBtn.classList.toggle('visible');
    }, 3000);
});

document.addEventListener('touchend', () => {
    clearTimeout(longPressTimer);
});

document.addEventListener('touchmove', () => {
    clearTimeout(longPressTimer);
});

// ========================================
// SETTINGS MODAL
// ========================================

function openSettings() {
    // Populate current settings
    settingsTheme.value = settings.theme;
    settingsCode.value = settings.code;
    settingsPrompt.value = settings.prompt;
    settingsRiddle.value = settings.riddle;
    settingsTypeSpeed.value = settings.typeSpeed;
    settingsAlignment.value = settings.alignment;
    
    settingsModal.classList.add('open');
}

function closeSettings() {
    settingsModal.classList.remove('open');
}

settingsBtn.addEventListener('click', openSettings);
settingsClose.addEventListener('click', closeSettings);

// Close on overlay click
settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        closeSettings();
    }
});

// Save settings
settingsSave.addEventListener('click', () => {
    const newCode = settingsCode.value.trim();
    
    // Validate code is 4 digits
    if (!/^\d{4}$/.test(newCode)) {
        settingsCode.style.borderColor = 'var(--error-color)';
        settingsCode.focus();
        setTimeout(() => {
            settingsCode.style.borderColor = '';
        }, 1000);
        return;
    }
    
    settings.code = newCode;
    settings.prompt = settingsPrompt.value || DEFAULTS.prompt;
    settings.riddle = settingsRiddle.value || DEFAULTS.riddle;
    settings.theme = settingsTheme.value;
    settings.typeSpeed = parseInt(settingsTypeSpeed.value);
    settings.alignment = settingsAlignment.value;
    
    // Apply prompt text
    promptText.textContent = settings.prompt;
    
    // Apply alignment
    applyAlignment(settings.alignment);
    
    applyTheme(settings.theme);
    saveSettings(settings);
    closeSettings();
    
    // Reset the game state in case it was completed
    resetGame();
});

// Reset to defaults
settingsReset.addEventListener('click', () => {
    if (confirm('Reset all settings to defaults?')) {
        clearSettings();
        settings = { ...DEFAULTS };
        applyTheme(settings.theme);
        applyAlignment(settings.alignment);
        promptText.textContent = settings.prompt;
        closeSettings();
        resetGame();
    }
});

// Live theme preview in settings
settingsTheme.addEventListener('change', () => {
    applyTheme(settingsTheme.value);
});

// ========================================
// CODE ENTRY
// ========================================

boxes.forEach((box, index) => {
    box.addEventListener('input', (e) => {
        let value = e.target.value;
        
        // Handle multiple digits
        if (value.length > 1) {
            value = value.slice(-1);
        }
        
        // Only allow digits 0-9
        if (!/^[0-9]$/.test(value)) {
            e.target.value = '';
            return;
        }
        
        e.target.value = value;

        // Auto-advance to next box or auto-submit on last box
        if (value) {
            if (index < boxes.length - 1) {
                boxes[index + 1].focus();
            } else {
                // Fourth digit entered - auto-submit
                submitBtn.click();
            }
        }
    });

    box.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !box.value && index > 0) {
            boxes[index - 1].focus();
        }
        
        if (e.key === 'Enter') {
            submitBtn.click();
        }
    });

    box.addEventListener('focus', () => {
        box.select();
    });
});

// ========================================
// SUBMIT HANDLER
// ========================================

submitBtn.addEventListener('click', () => {
    const enteredCode = boxes.map(box => box.value).join('');

    if (enteredCode === settings.code) {
        handleSuccess();
    } else {
        handleFailure();
    }
});

function handleFailure() {
    flashOverlay.classList.add('active');
    boxes.forEach(box => box.classList.add('error'));

    setTimeout(() => {
        flashOverlay.classList.remove('active');
        boxes.forEach(box => box.classList.remove('error'));
    }, 300);

    boxes.forEach(box => box.value = '');
    boxes[0].focus();
}

function handleSuccess() {
    codeEntry.classList.add('hidden');
    settingsBtn.classList.remove('visible');

    setTimeout(() => {
        riddleContainer.classList.add('visible');
        typeRiddle();
    }, 500);
}

// ========================================
// RIDDLE TYPEWRITER
// ========================================

function typeRiddle() {
    let charIndex = 0;
    const riddleToType = settings.riddle;
    
    const typeInterval = setInterval(() => {
        if (charIndex < riddleToType.length) {
            const char = riddleToType[charIndex];
            if (char === '\n') {
                riddleText.innerHTML += '<br>';
            } else {
                riddleText.innerHTML += char;
            }
            charIndex++;
        } else {
            clearInterval(typeInterval);
            setTimeout(() => {
                cursor.classList.add('hidden');
            }, 1500);
        }
    }, settings.typeSpeed);
}

// ========================================
// RESET GAME
// ========================================

function resetGame() {
    // Clear riddle
    riddleText.innerHTML = '';
    cursor.classList.remove('hidden');
    
    // Show code entry
    codeEntry.classList.remove('hidden');
    riddleContainer.classList.remove('visible');
    
    // Hide settings button
    settingsBtn.classList.remove('visible');
    
    // Clear inputs
    boxes.forEach(box => box.value = '');
    boxes[0].focus();
}
