// ── Dice Unicode faces
const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

// ── State
let rollCount = 0;
let totalSum   = 0;
let bestScore  = null;
let history    = [];
let rolling    = false;

// ── DOM refs
const die1El      = document.getElementById('die-1');
const die2El      = document.getElementById('die-2');
const val1El      = document.getElementById('val-1');
const val2El      = document.getElementById('val-2');
const totalValEl  = document.getElementById('total-value');
const rollBadge   = document.getElementById('roll-badge');
const rollCountEl = document.getElementById('roll-count');
const bestEl      = document.getElementById('best-score');
const avgEl       = document.getElementById('avg-score');
const historyList = document.getElementById('history-list');
const rollBtn     = document.getElementById('roll-btn');

// ── Roll
function roll() {
    if (rolling) return;
    rolling = true;
    rollBtn.disabled = true;

    // Shake both dice
    die1El.classList.add('shake');
    die2El.classList.add('shake');

    // Rapid flicker during shake
    const flickerInterval = setInterval(() => {
        die1El.textContent = DICE_FACES[Math.floor(Math.random() * 6)];
        die2El.textContent = DICE_FACES[Math.floor(Math.random() * 6)];
    }, 80);

    setTimeout(() => {
        clearInterval(flickerInterval);
        die1El.classList.remove('shake');
        die2El.classList.remove('shake');

        const v1 = Math.floor(Math.random() * 6);   // 0–5
        const v2 = Math.floor(Math.random() * 6);
        const total = (v1 + 1) + (v2 + 1);          // 2–12

        // Update dice display
        die1El.textContent = DICE_FACES[v1];
        die2El.textContent = DICE_FACES[v2];
        val1El.textContent = v1 + 1;
        val2El.textContent = v2 + 1;

        // Update total with pop
        totalValEl.textContent = total;
        triggerPop(totalValEl);

        // Determine badge
        const badge = getBadge(total);
        rollBadge.textContent   = badge.text;
        rollBadge.className     = 'roll-badge ' + badge.cls;

        // Update stats
        rollCount++;
        totalSum += total;
        if (bestScore === null || total > bestScore) bestScore = total;

        rollCountEl.textContent = rollCount;
        bestEl.textContent      = bestScore;
        avgEl.textContent       = (totalSum / rollCount).toFixed(1);

        // Add to history
        addToHistory(v1 + 1, v2 + 1, total, badge);

        rolling = false;
        rollBtn.disabled = false;
    }, 700);
}

// ── Badge logic
function getBadge(total) {
    if (total === 12)            return { text: '🎉 Max!',   cls: 'badge-max' };
    if (total === 2)             return { text: '😬 Snake!', cls: 'badge-min' };
    if (total === 7 || total === 11) return { text: '🍀 Lucky!', cls: 'badge-lucky' };
    return { text: '', cls: '' };
}

// ── History
function addToHistory(v1, v2, total, badge) {
    history.unshift({ v1, v2, total, badge, num: rollCount });

    // Rebuild list (only show last 20)
    historyList.innerHTML = '';
    history.slice(0, 20).forEach(entry => {
        const item = document.createElement('div');
        item.className = 'history-item';

        const tagHtml = entry.badge.text
            ? `<span class="h-tag ${entry.badge.cls.replace('badge-', '')}">${entry.badge.text}</span>`
            : `<span class="h-tag empty"></span>`;

        item.innerHTML = `
            <span class="h-roll-num">#${entry.num}</span>
            <span class="h-dice">${DICE_FACES[entry.v1 - 1]}</span>
            <span class="h-plus">+</span>
            <span class="h-dice">${DICE_FACES[entry.v2 - 1]}</span>
            <span class="h-total">${entry.total}</span>
            ${tagHtml}
        `;
        historyList.appendChild(item);
    });
}

// ── Clear history
function clearHistory() {
    history = [];
    historyList.innerHTML = '<p class="history-empty">No rolls yet. Roll the dice!</p>';
}

// ── Restart
function restart() {
    rollCount = 0;
    totalSum  = 0;
    bestScore = null;
    history   = [];

    die1El.textContent = '⚀';
    die2El.textContent = '⚁';
    val1El.textContent = '1';
    val2El.textContent = '2';
    totalValEl.textContent = '3';
    rollBadge.textContent  = '';
    rollBadge.className    = 'roll-badge';

    rollCountEl.textContent = '0';
    bestEl.textContent      = '—';
    avgEl.textContent       = '—';

    clearHistory();
}

// ── Pop helper
function triggerPop(el) {
    el.classList.remove('pop');
    void el.offsetWidth; // reflow
    el.classList.add('pop');
    el.addEventListener('animationend', () => el.classList.remove('pop'), { once: true });
}

// ── Keyboard shortcut: Space or Enter = Roll
document.addEventListener('keydown', (e) => {
    if ((e.code === 'Space' || e.code === 'Enter') && !rolling) {
        e.preventDefault();
        roll();
    }
});
