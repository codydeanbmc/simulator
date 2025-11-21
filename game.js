const gameState = {
    role: "Entry Level SE",
    xp: 0,
    levelIndex: 0, // 0: Entry, 1: Mid, 2: Principal
    maxXP: 100, // XP needed for next level
    isGameOver: false,
    availableEncounters: [] // To track questions that haven't been answered correctly yet
};

const levels = [
    {
        name: "Entry Level SE",
        maxXP: 100,
        intro: "Welcome, Rookie! Your goal is to master the basics. Conduct high-level demos and don't mess up the slide deck!",
        encounters: [] // Populated later
    },
    {
        name: "Mid Level SE",
        maxXP: 300,
        intro: "Promoted! You are now a Mid-Level SE. Time to get your hands dirty with Proof of Concepts (PoCs) and technical deep dives.",
        encounters: []
    },
    {
        name: "Principal SE / SME",
        maxXP: 500,
        intro: "You made it to the top! You are a Principal Engineer. The tough questions come to you. Architecture and Strategy are your domain.",
        encounters: []
    }
];

const elements = {
    startBtn: document.getElementById('start-btn'),
    mainMenu: document.getElementById('main-menu'),
    gamePlay: document.getElementById('game-play'),
    playerRole: document.getElementById('player-role'),
    scoreDisplay: document.getElementById('score'),
    dialogueBox: document.getElementById('dialogue-box'),
    actionArea: document.getElementById('action-area'),
    messageLog: document.getElementById('message-log')
};

function init() {
    elements.startBtn.addEventListener('click', startGame);
    updateUI();
}

function updateUI() {
    elements.playerRole.textContent = `Role: ${gameState.role}`;
    elements.scoreDisplay.textContent = `XP: ${gameState.xp} / ${gameState.maxXP}`;
}

function logMessage(msg) {
    const p = document.createElement('div');
    p.textContent = `> ${msg}`;
    elements.messageLog.prepend(p);
}

function startGame() {
    gameState.xp = 0;
    gameState.levelIndex = 0;
    gameState.isGameOver = false;
    
    loadLevel(0);
    
    elements.mainMenu.style.display = 'none';
    elements.gamePlay.style.display = 'flex';
}

function loadLevel(index) {
    gameState.levelIndex = index;
    const levelConfig = levels[index];
    gameState.role = levelConfig.name;
    gameState.maxXP = levelConfig.maxXP;
    
    // Create a copy of the encounters for this level
    // We use a shallow copy of the array, but that's fine as we just want to remove items
    gameState.availableEncounters = [...levelConfig.encounters];
    
    updateUI();
    logMessage(`PROMOTION: You are now ${gameState.role}`);
    
    elements.dialogueBox.textContent = levelConfig.intro;
    elements.actionArea.innerHTML = '';
    
    const btn = createButton("Ready!", () => {
        nextEncounter();
    });
    elements.actionArea.appendChild(btn);
}

function nextEncounter() {
    if (gameState.xp >= gameState.maxXP) {
        // Level Up or Win
        if (gameState.levelIndex < levels.length - 1) {
            loadLevel(gameState.levelIndex + 1);
        } else {
            triggerWin();
        }
        return;
    }
    
    // Check if we have available encounters
    if (gameState.availableEncounters.length === 0) {
        // Edge case: No more questions but haven't reached XP cap.
        // This shouldn't happen with good math, but let's handle it.
        // Maybe just give a bonus and move on?
        logMessage("All tasks complete! Bonus XP granted.");
        gameState.xp = gameState.maxXP; // Force level up
        nextEncounter(); // Recurse to trigger level up logic
        return;
    }
    
    // Pick a random encounter from the available pool
    const encounterIndex = Math.floor(Math.random() * gameState.availableEncounters.length);
    const encounter = gameState.availableEncounters[encounterIndex];
    
    // Store reference to current encounter index or object if needed, but for now we pass it
    renderEncounter(encounter);
}

function renderEncounter(encounter) {
    elements.dialogueBox.textContent = encounter.text;
    elements.actionArea.innerHTML = '';
    
    // Shuffle options
    const shuffledOptions = [...encounter.options].sort(() => Math.random() - 0.5);
    
    shuffledOptions.forEach(opt => {
        const btn = createButton(opt.text, () => handleChoice(opt, encounter));
        elements.actionArea.appendChild(btn);
    });
}

function handleChoice(option, encounter) {
    // Calculate XP
    const xpGain = option.xp || 0;
    gameState.xp += xpGain;
    
    // Feedback
    const screen = document.getElementById('screen');
    if (xpGain > 0) {
        logMessage(`SUCCESS: ${option.feedback || "Good job!"} (+${xpGain} XP)`);
        elements.dialogueBox.textContent = option.feedback || "Correct!";
        screen.classList.add('flash-green');
        setTimeout(() => screen.classList.remove('flash-green'), 500);
        
        // Remove the encounter from available pool
        const index = gameState.availableEncounters.indexOf(encounter);
        if (index > -1) {
            gameState.availableEncounters.splice(index, 1);
        }
    } else {
        logMessage(`FAILURE: ${option.feedback || "Oops."} (${xpGain} XP)`);
        elements.dialogueBox.textContent = option.feedback || "That didn't go well.";
        screen.classList.add('flash-red');
        screen.classList.add('shake');
        setTimeout(() => {
            screen.classList.remove('flash-red');
            screen.classList.remove('shake');
        }, 500);
        // Do NOT remove encounter, so it can be repeated
    }
    
    if (gameState.xp < 0) {
        triggerGameOver();
        return;
    }

    updateUI();
    
    // Wait a moment then go to next encounter
    elements.actionArea.innerHTML = '';
    const btn = createButton("Next...", () => nextEncounter());
    elements.actionArea.appendChild(btn);
}

function createButton(text, onClick) {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.className = "choice-btn";
    btn.onclick = onClick;
    return btn;
}

function triggerWin() {
    elements.dialogueBox.textContent = "Congratulations! You are a legend at BMC Helix. You have retired as a wealthy consultant.";
    elements.actionArea.innerHTML = '';
    elements.actionArea.appendChild(createButton("Play Again", () => location.reload()));
    logMessage("GAME OVER - YOU WIN");
}

function triggerGameOver() {
    elements.dialogueBox.textContent = "You have been let go. Maybe engineering isn't for you?";
    elements.actionArea.innerHTML = '';
    elements.actionArea.appendChild(createButton("Try Again", () => location.reload()));
    logMessage("GAME OVER - TERMINATED");
}

// --- Content Definitions ---

// Level 1: Entry Level
levels[0].encounters = [
    {
        text: "Client: 'We need a tool to manage our IT assets and discover what's on our network.'",
        options: [
            { text: "BMC Helix Discovery is perfect for that.", xp: 20, feedback: "Correct! Discovery provides 100% visibility." },
            { text: "Have you tried an Excel spreadsheet?", xp: -10, feedback: "Client rolls eyes." },
            { text: "We can use BMC Helix Chatbot.", xp: -5, feedback: "That's for conversation, not discovery." }
        ]
    },
    {
        text: "Client: 'Our service desk is overwhelmed with password reset calls.'",
        options: [
            { text: "Hire more people.", xp: -10, feedback: "Inefficient solution." },
            { text: "Implement BMC Helix Virtual Agent for self-service.", xp: 20, feedback: "Spot on! Deflect those tickets." },
            { text: "Turn off the phones.", xp: -20, feedback: "Client is angry." }
        ]
    },
    {
        text: "Manager: 'Hey, are you ready for the ITSM demo?'",
        options: [
            { text: "Yes, I have the script ready.", xp: 10, feedback: "Preparation is key." },
            { text: "I'll wing it.", xp: -10, feedback: "The demo crashed." },
            { text: "What's ITSM?", xp: -50, feedback: "Manager looks concerned." }
        ]
    },
    {
        text: "Client: 'Does BMC Helix support ITIL v4 practices?'",
        options: [
            { text: "Yes, it's fully certified.", xp: 20, feedback: "Good answer." },
            { text: "I think so?", xp: 0, feedback: "Confidence is low." },
            { text: "No, we use our own framework.", xp: -20, feedback: "Incorrect." }
        ]
    },
    {
        text: "Client: 'Can employees request services from their mobile phone?'",
        options: [
            { text: "Yes, BMC Helix Digital Workplace is mobile-first.", xp: 20, feedback: "Correct. Modern experience." },
            { text: "No, they must use a VPN and laptop.", xp: -10, feedback: "That sounds ancient." },
            { text: "Only if they have an iPhone 15.", xp: -5, feedback: "Odd restriction." }
        ]
    },
    {
        text: "Client: 'We have a lot of manual HR processes. Can you help?'",
        options: [
            { text: "Helix Business Workflows handles non-IT cases.", xp: 20, feedback: "Exactly! HR, Facilities, etc." },
            { text: "Just file an IT incident for everything.", xp: -10, feedback: "Terrible advice." },
            { text: "We only do IT.", xp: -5, feedback: "Missed sales opportunity." }
        ]
    },
    {
        text: "Manager: 'Make sure you show the CMDB structure in the demo.'",
        options: [
            { text: "I'll show the Service Model in Discovery.", xp: 20, feedback: "Good visual." },
            { text: "I'll just show a list of tables.", xp: 5, feedback: "Boring but accurate." },
            { text: "What is a CMDB?", xp: -20, feedback: "Go study!" }
        ]
    },
    {
        text: "Client: 'Is your solution SaaS or On-Premise?'",
        options: [
            { text: "We offer both, plus Hybrid options.", xp: 20, feedback: "Flexibility wins." },
            { text: "SaaS only.", xp: -5, feedback: "Not entirely true." },
            { text: "It runs on my laptop.", xp: -20, feedback: "Unprofessional." }
        ]
    },
    {
        text: "Client: 'How do you handle major outages?'",
        options: [
            { text: "Major Incident Management module brings teams together.", xp: 20, feedback: "Correct." },
            { text: "We panic.", xp: -10, feedback: "Not reassuring." },
            { text: "We send an email to everyone.", xp: -5, feedback: "Spam." }
        ]
    },
    {
        text: "Client: 'Can I integrate Microsoft Teams?'",
        options: [
            { text: "Yes, seamless integration with Chatbot and ITSM.", xp: 20, feedback: "Collaborative." },
            { text: "No, we compete with Microsoft.", xp: -10, feedback: "False." },
            { text: "Only if you pay extra.", xp: 0, feedback: "Technically true sometimes? But avoid price talk." }
        ]
    },
    {
        text: "Client: 'Does the system learn from past tickets?'",
        options: [
            { text: "Yes, Real-time Incident Correlation and KCS.", xp: 20, feedback: "Smart answer." },
            { text: "No, it's just a database.", xp: -10, feedback: "Underselling." },
            { text: "Maybe?", xp: -5, feedback: "Be sure." }
        ]
    },
    {
        text: "Client: 'Can I get a report of all open high priority tickets?'",
        options: [
            { text: "Let me show you Helix Dashboards.", xp: 20, feedback: "Visual proof." },
            { text: "I'll export a CSV later.", xp: -5, feedback: "Weak demo." },
            { text: "No.", xp: -20, feedback: "Wrong." }
        ]
    }
];

// Level 2: Mid Level
levels[1].encounters = [
    {
        text: "PoV Task: The customer wants to integrate Jira for Devs and Helix for Ops. How?",
        options: [
            { text: "Use Multi-Cloud Broker (MCB).", xp: 40, feedback: "Excellent. Seamless integration." },
            { text: "Email tickets back and forth.", xp: -10, feedback: "Not scalable." },
            { text: "Build a custom API integration from scratch.", xp: 10, feedback: "Works, but high maintenance." }
        ]
    },
    {
        text: "PoV Task: The dashboard is slow. What do you check first?",
        options: [
            { text: "Blame the network.", xp: -5, feedback: "Lazy troubleshooting." },
            { text: "Check the database queries and indexing.", xp: 30, feedback: "Found a missing index!" },
            { text: "Restart the server.", xp: 5, feedback: "Temporary fix." }
        ]
    },
    {
        text: "Client: 'We need to monitor our Kubernetes clusters.'",
        options: [
            { text: "BMC Helix Operations Management with AIOps.", xp: 40, feedback: "Perfect fit for container monitoring." },
            { text: "Just use kubectl logs.", xp: -10, feedback: "Not an enterprise solution." },
            { text: "We don't do that.", xp: -20, feedback: "We definitely do." }
        ]
    },
    {
        text: "PoV Task: Client wants to ingest events from SolarWinds.",
        options: [
            { text: "Use Intelligent Integrations (II) connector.", xp: 30, feedback: "Correct, standard path." },
            { text: "Tell them to replace SolarWinds.", xp: -10, feedback: "Aggressive." },
            { text: "Write a script to parse emails.", xp: -5, feedback: "Brittle solution." }
        ]
    },
    {
        text: "PoV Task: Need to map dependencies for a complex custom banking app.",
        options: [
            { text: "Write a custom TPL pattern in Discovery.", xp: 40, feedback: "Deep dive success!" },
            { text: "Manually draw it in Visio.", xp: -10, feedback: "Painful." },
            { text: "Scan it with a basic sweep.", xp: 0, feedback: "Won't catch details." }
        ]
    },
    {
        text: "Client: 'ServiceNow is cheaper. Why BMC?'",
        options: [
            { text: "BMC offers better ServiceOps value and innovation.", xp: 30, feedback: "Focus on value." },
            { text: "They are terrible.", xp: -20, feedback: "Don't bash competitors." },
            { text: "Are they?", xp: -5, feedback: "Know your market." }
        ]
    },
    {
        text: "PoV Task: Client needs to migrate data from legacy Remedy v7.",
        options: [
            { text: "Use Helix Data Manager (HDM).", xp: 30, feedback: "The right tool for the job." },
            { text: "Copy paste.", xp: -50, feedback: "Impossible." },
            { text: "Start fresh, delete all history.", xp: -10, feedback: "Client needs compliance data." }
        ]
    },
    {
        text: "Troubleshooting: The API call is returning 401 Unauthorized.",
        options: [
            { text: "Check the RSSO / JWT token validity.", xp: 30, feedback: "Good debugging." },
            { text: "Reboot the router.", xp: -5, feedback: "Unlikely cause." },
            { text: "Change the password to 'admin123'.", xp: -10, feedback: "Security risk." }
        ]
    },
    {
        text: "PoV Task: Show me how AIOps predicts failure before it happens.",
        options: [
            { text: "Demonstrate Service Predictions and Anomaly Detection.", xp: 40, feedback: "Wow factor achieved." },
            { text: "Show a static report.", xp: -10, feedback: "Not predictive." },
            { text: "Look at the crystal ball.", xp: 5, feedback: "Funny, but no." }
        ]
    },
    {
        text: "Client: 'We want to trigger Ansible playbooks from an incident.'",
        options: [
            { text: "Configure Intelligent Automation (IA) policies.", xp: 40, feedback: "Automation is power." },
            { text: "Manually run the playbook.", xp: -5, feedback: "Defeats the purpose." },
            { text: "We don't support Ansible.", xp: -20, feedback: "Yes we do." }
        ]
    }
];

// Level 3: Principal
levels[2].encounters = [
    {
        text: "CTO: 'We need a ServiceOps strategy to unify Service and Operations Management.'",
        options: [
            { text: "Combine Helix ITSM and Helix AIOps for a unified view.", xp: 50, feedback: "Exactly. Break down those silos." },
            { text: "Buy two different tools from different vendors.", xp: -20, feedback: "Integration nightmare." },
            { text: "Just focus on Service Management.", xp: -10, feedback: "Missed opportunity." }
        ]
    },
    {
        text: "Strategic Meeting: A major bank wants a hybrid cloud solution with strict compliance.",
        options: [
            { text: "Propose Helix On-Premise.", xp: 10, feedback: "Valid, but they want hybrid." },
            { text: "Propose BMC Helix SaaS with hybrid connectors.", xp: 50, feedback: "Modern, scalable, and compliant." },
            { text: "Tell them to move everything to public cloud.", xp: -30, feedback: "Compliance violation." }
        ]
    },
    {
        text: "CIO: 'We are moving 100% to AWS. What is the impact on our BMC footprint?'",
        options: [
            { text: "We run on AWS. Move to Helix SaaS on AWS.", xp: 50, feedback: "Seamless transition." },
            { text: "You have to cancel your contract.", xp: -50, feedback: "Revenue loss!" },
            { text: "I need to check with support.", xp: -10, feedback: "You should know this." }
        ]
    },
    {
        text: "Strategy: Competitor is spreading FUD saying 'BMC is legacy'. Counter it.",
        options: [
            { text: "Highlight our Containerized, Microservices architecture.", xp: 50, feedback: "Modern tech stack wins." },
            { text: "Ignore them.", xp: -10, feedback: "Don't let it stick." },
            { text: "Say 'Old is Gold'.", xp: -20, feedback: "Wrong message." }
        ]
    },
    {
        text: "Architecture: Client requires RPO of < 15 mins for Disaster Recovery.",
        options: [
            { text: "Design a High Availability architecture with Geo-Redundancy.", xp: 50, feedback: "Solid architecture." },
            { text: "Backups once a day is enough.", xp: -50, feedback: "Data loss risk." },
            { text: "Use a thumb drive.", xp: -100, feedback: "Fired." }
        ]
    },
    {
        text: "Strategy: Client wants to merge two large Helix instances into one.",
        options: [
            { text: "Plan a Consolidation strategy using Helix Data Manager.", xp: 50, feedback: "Complex but doable." },
            { text: "Just delete one.", xp: -20, feedback: "Data loss." },
            { text: "Tell them to keep them separate.", xp: 0, feedback: "Maybe valid, but consolidation saves money." }
        ]
    },
    {
        text: "CISO: 'Is your SaaS environment FedRAMP certified?'",
        options: [
            { text: "Yes, we have BMC Helix Government Cloud.", xp: 50, feedback: "Security assured." },
            { text: "What is FedRAMP?", xp: -50, feedback: "Embarrassing." },
            { text: "No, but we are secure.", xp: -20, feedback: "Not good enough for Gov." }
        ]
    },
    {
        text: "Architecture: 'We need to process 1 million events per second.'",
        options: [
            { text: "Scale the AIOps data layer (Kafka/Elastic).", xp: 50, feedback: "Performance engineering." },
            { text: "One server should be enough.", xp: -20, feedback: "Crash imminent." },
            { text: "Filter out 90% of events.", xp: 10, feedback: "Valid tactic, but need capacity too." }
        ]
    },
    {
        text: "Partner: 'We want to build a specific Healthcare vertical on Helix.'",
        options: [
            { text: "Leverage the Developer Sandbox and OEM program.", xp: 40, feedback: "Ecosystem growth." },
            { text: "You can't modify the code.", xp: -10, feedback: "False." },
            { text: "Good luck.", xp: 0, feedback: "Not helpful." }
        ]
    },
    {
        text: "Crisis: A PoC environment has a global outage during the final presentation.",
        options: [
            { text: "Calmly explain the RCA and switch to backup slides.", xp: 50, feedback: "Grace under pressure." },
            { text: "Run out of the room.", xp: -50, feedback: "Cowardice." },
            { text: "Blame the intern.", xp: -20, feedback: "Unprofessional." }
        ]
    }
];

init();
