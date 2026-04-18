    const sentences = {
      easy: [
        "The quick brown fox jumps over the lazy dog.",
        "Pack my box with five dozen liquor jugs.",
        "How vexingly quick daft zebras jump.",
        "The five boxing wizards jump quickly.",
        "Bright vixens jump dozing fowl."
      ],
      medium: [
        "Typing fast is a skill that requires both speed and precision to master.",
        "The best way to improve your typing is to practice every single day.",
        "Technology has changed the way we communicate and share information globally.",
        "A good typist can type over eighty words per minute with high accuracy."
      ],
      hard: [
        "Quantum computing leverages superposition and entanglement to process complex algorithms exponentially faster than classical machines.",
        "The juxtaposition of minimalist architecture against baroque ornamentation creates a surprisingly cohesive aesthetic experience.",
        "Cryptographic hash functions ensure data integrity by generating fixed-length outputs that are computationally irreversible."
      ]
    };

    let currentDifficulty = 'easy';
    let currentSentence = '';
    let timer = null;
    let timeElapsed = 0;
    let totalCharactersTyped = 0;
    let correctCharactersTyped = 0;
    let isPlaying = false;

    // Elements
    const screens = {
      home: document.getElementById('home-screen'),
      game: document.getElementById('game-screen'),
      results: document.getElementById('results-screen'),
      stats: document.getElementById('stats-screen')
    };
    
    // Home elements
    const diffBtns = document.querySelectorAll('.diff-btn');
    const startBtn = document.getElementById('start-btn');
    
    // Game elements
    const liveTime = document.getElementById('live-time');
    const liveWpm = document.getElementById('live-wpm');
    const liveAcc = document.getElementById('live-acc');
    const progressBar = document.getElementById('progress-bar');
    const sentenceBox = document.getElementById('sentence-box');
    const inputField = document.getElementById('type-input');
    const giveUpBtn = document.getElementById('give-up-btn');
    
    // Result elements
    const resWpm = document.getElementById('res-wpm');
    const resAcc = document.getElementById('res-acc');
    const resTime = document.getElementById('res-time');
    const resEmoji = document.getElementById('result-emoji');
    const resTitle = document.getElementById('result-title');
    const resContext = document.getElementById('result-context');
    const resAccLabel = document.getElementById('res-acc-label');
    const resAccFill = document.getElementById('result-accuracy-fill');
    const homeBtn = document.getElementById('home-btn');
    const newSentenceBtn = document.getElementById('new-sentence-btn');

    // Stats elements
    const viewStatsBtn = document.getElementById('view-stats-btn');
    const statsBackBtn = document.getElementById('stats-back-btn');
    const statsGraph = document.getElementById('stats-graph');
    const recordsList = document.getElementById('records-list');

    // Utils
    function switchScreen(screenName) {
      Object.values(screens).forEach(s => s.classList.remove('active'));
      screens[screenName].classList.add('active');
    }

    function getWordCount(text) {
      return text.trim().split(/\s+/).filter(w => w.length > 0).length;
    }

    // Home Logic
    diffBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        diffBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        currentDifficulty = btn.getAttribute('data-diff');
      });
    });

    startBtn.addEventListener('click', () => startGame(true));

    viewStatsBtn.addEventListener('click', () => {
      renderStats();
      switchScreen('stats');
    });

    statsBackBtn.addEventListener('click', () => {
      switchScreen('home');
    });

    // Game Logic
    function startGame(newSentence = true) {
      if (newSentence) {
        const list = sentences[currentDifficulty];
        currentSentence = list[Math.floor(Math.random() * list.length)];
      }
      
      timeElapsed = 0;
      totalCharactersTyped = 0;
      correctCharactersTyped = 0;
      isPlaying = false;
      clearInterval(timer);
      
      liveTime.textContent = '0.0';
      liveWpm.textContent = '0';
      liveAcc.textContent = '100';
      progressBar.style.width = '0%';
      
      renderSentence();
      inputField.value = '';
      
      switchScreen('game');
      // Small timeout to ensure display:flex is applied before focusing
      setTimeout(() => inputField.focus(), 50);
    }

    function renderSentence() {
      sentenceBox.innerHTML = '';
      for(let i = 0; i < currentSentence.length; i++) {
        const span = document.createElement('span');
        span.className = 'char';
        span.textContent = currentSentence[i];
        sentenceBox.appendChild(span);
      }
      const extraSpan = document.createElement('span');
      extraSpan.className = 'char extra';
      sentenceBox.appendChild(extraSpan);
      
      updateHighlights('');
    }

    function updateHighlights(val) {
      const spans = sentenceBox.querySelectorAll('.char:not(.extra)');
      const extraSpan = sentenceBox.querySelector('.extra');
      let allCorrect = true;
      
      spans.forEach((span, i) => {
        span.className = 'char';
        if (i < val.length) {
          if (val[i] === currentSentence[i]) {
            span.classList.add('correct');
          } else {
            span.classList.add('incorrect');
            allCorrect = false;
          }
        }
      });
      extraSpan.className = 'char extra';
      
      if (val.length < currentSentence.length) {
        spans[val.length].classList.add('current');
      } else {
        extraSpan.classList.add('current');
        if (val.length > currentSentence.length) {
          allCorrect = false;
        }
      }
      
      const progress = Math.min((val.length / currentSentence.length) * 100, 100);
      progressBar.style.width = progress + '%';
      
      return val.length === currentSentence.length && allCorrect;
    }

    inputField.addEventListener('paste', e => e.preventDefault());

    inputField.addEventListener('keydown', (e) => {
      // Only track character additions to total strokes
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        totalCharactersTyped++;
        const idx = inputField.value.length;
        if (idx < currentSentence.length && e.key === currentSentence[idx]) {
          correctCharactersTyped++;
        }
      }
    });

    inputField.addEventListener('input', () => {
      if (!isPlaying && inputField.value.length > 0) {
        isPlaying = true;
        startTimer();
      }
      
      const isDone = updateHighlights(inputField.value);
      
      if (isDone) {
        endGame(true);
      }
    });

    function startTimer() {
      timer = setInterval(() => {
        timeElapsed += 0.1;
        updateLiveStats();
      }, 100);
    }

    function updateLiveStats() {
      liveTime.textContent = timeElapsed.toFixed(1);
      
      let wpm = 0;
      if (timeElapsed > 0) {
        const words = getWordCount(inputField.value);
        wpm = Math.round(words / (timeElapsed / 60));
      }
      liveWpm.textContent = wpm;
      
      let acc = 100;
      if (totalCharactersTyped > 0) {
        acc = Math.round((correctCharactersTyped / totalCharactersTyped) * 100);
      }
      liveAcc.textContent = acc;
    }

    giveUpBtn.addEventListener('click', () => {
      if(isPlaying) endGame(false);
      else switchScreen('home'); // If they didn't even start typing
    });

    function endGame(completed) {
      clearInterval(timer);
      isPlaying = false;
      
      let words = completed ? getWordCount(currentSentence) : getWordCount(inputField.value);
      let finalWpm = timeElapsed > 0 ? Math.round(words / (timeElapsed / 60)) : 0;
      let finalAcc = totalCharactersTyped > 0 ? Math.round((correctCharactersTyped / totalCharactersTyped) * 100) : 0;
      
      if (timeElapsed === 0) {
        finalAcc = 0;
        finalWpm = 0;
      }
      
      saveRecord(finalWpm, finalAcc, timeElapsed.toFixed(1), currentDifficulty);
      
      showResults(finalWpm, finalAcc, timeElapsed.toFixed(1));
    }

    // Results Logic
    function showResults(wpm, acc, time) {
      resWpm.textContent = wpm;
      resAcc.textContent = acc;
      resTime.textContent = time;
      resAccLabel.textContent = acc + '%';
      
      if (wpm < 30) {
        resEmoji.textContent = '🐢';
        resTitle.textContent = 'Keep practicing!';
      } else if (wpm < 50) {
        resEmoji.textContent = '👍';
        resTitle.textContent = 'Good effort!';
      } else if (wpm < 70) {
        resEmoji.textContent = '⚡';
        resTitle.textContent = 'Nice work!';
      } else {
        resEmoji.textContent = '🏆';
        resTitle.textContent = 'Outstanding!';
      }
      
      resContext.textContent = `The average typist types around 40 WPM. You typed at ${wpm} WPM!`;
      
      switchScreen('results');
      
      // Reset accuracy bar
      resAccFill.style.transition = 'none';
      resAccFill.style.width = '0%';
      // Force reflow
      void resAccFill.offsetWidth;
      
      // Set correct color
      if (acc >= 90) resAccFill.style.background = 'var(--correct)';
      else if (acc >= 70) resAccFill.style.background = '#eab308'; // yellow
      else resAccFill.style.background = 'var(--incorrect)';
      
      // Animate
      resAccFill.style.transition = 'width 1s cubic-bezier(0.4, 0, 0.2, 1)';
      resAccFill.style.width = acc + '%';
    }

    homeBtn.addEventListener('click', () => {
      switchScreen('home');
    });

    newSentenceBtn.addEventListener('click', () => {
      startGame(true);
    });

    function saveRecord(wpm, acc, time, diff) {
      const record = {
        date: new Date().toISOString(),
        wpm: wpm,
        acc: acc,
        time: time,
        diff: diff
      };
      let records = JSON.parse(localStorage.getItem('typingRecords') || '[]');
      records.push(record);
      if (records.length > 50) records.shift();
      localStorage.setItem('typingRecords', JSON.stringify(records));
    }

    function renderStats() {
      let records = JSON.parse(localStorage.getItem('typingRecords') || '[]');
      
      // Render List
      recordsList.innerHTML = '';
      if (records.length === 0) {
        recordsList.innerHTML = '<p class="text-center" style="color: var(--text-muted); padding: 16px 0;">No games played yet.</p>';
      } else {
        const sortedRecords = [...records].reverse();
        sortedRecords.forEach(r => {
          const d = new Date(r.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' });
          const item = document.createElement('div');
          item.style.display = 'flex';
          item.style.justifyContent = 'space-between';
          item.style.padding = '12px';
          item.style.border = '1px solid var(--border)';
          item.style.borderRadius = '8px';
          
          item.innerHTML = `
            <div>
              <div style="font-weight: 600; color: var(--text-main); font-size: 1.125rem;">${r.wpm} WPM</div>
              <div style="font-size: 0.875rem; color: var(--text-muted);">${d}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: 500; color: var(--text-main);">${r.acc}% Acc</div>
              <div style="font-size: 0.875rem; color: var(--text-muted); text-transform: capitalize;">${r.diff}</div>
            </div>
          `;
          recordsList.appendChild(item);
        });
      }
      
      // Render Graph
      statsGraph.innerHTML = '';
      const graphData = records.slice(-15);
      if (graphData.length === 0) {
        statsGraph.innerHTML = '<p style="width: 100%; text-align: center; align-self: center; color: var(--text-muted);">Play a game to see your graph!</p>';
      } else {
        const maxWpm = Math.max(10, ...graphData.map(r => r.wpm));
        graphData.forEach(r => {
          const heightPercent = Math.max(5, (r.wpm / maxWpm) * 100);
          
          const barContainer = document.createElement('div');
          barContainer.style.flex = '1';
          barContainer.style.height = '100%';
          barContainer.style.display = 'flex';
          barContainer.style.flexDirection = 'column';
          barContainer.style.justifyContent = 'flex-end';
          barContainer.style.alignItems = 'center';
          
          barContainer.title = \`\${r.wpm} WPM (\${r.acc}% Acc)\`;
          
          if (graphData.length <= 10) {
            const label = document.createElement('div');
            label.textContent = r.wpm;
            label.style.fontSize = '0.75rem';
            label.style.color = 'var(--text-muted)';
            label.style.marginBottom = '4px';
            barContainer.appendChild(label);
          }
          
          const bar = document.createElement('div');
          bar.style.width = '100%';
          bar.style.maxWidth = '24px';
          bar.style.height = heightPercent + '%';
          bar.style.backgroundColor = 'var(--primary)';
          bar.style.borderRadius = '4px 4px 0 0';
          
          barContainer.appendChild(bar);
          statsGraph.appendChild(barContainer);
        });
      }
    }

