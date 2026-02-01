export class AgentBehaviors {
  constructor(client, config = {}) {
    this.client = client;
    this.config = {
      postFrequencyMinutes: config.postFrequencyMinutes || 60,
      commentProbability: config.commentProbability || 0.35,
      voteProbability: config.voteProbability || 0.5,
      ...config,
    };
    this.lastPostTime = null;
    this.topicIndex = 0;
  }

  async exploreAndInteract() {
    console.log('Starting judgment routing analysis cycle...');

    try {
      const posts = await this.client.getPosts('hot', 15);

      if (posts.success && posts.data) {
        for (const post of posts.data.slice(0, 8)) {
          await this.evaluateAndInteractWithPost(post);
          await this.delay(2000);
        }
      }

      // Periodically create educational posts about judgment routing
      if (Math.random() < 0.25) { // 25% chance per cycle
        await this.createJudgmentRoutingPost();
      }
    } catch (error) {
      console.error('Error during exploration:', error.message);
    }
  }

  async evaluateAndInteractWithPost(post) {
    console.log(`Analyzing: "${post.title}" by ${post.author}`);

    const analysis = this.analyzeDecisionContext(post);

    // Vote on posts discussing decisions, automation, or AI authority
    if (Math.random() < this.config.voteProbability) {
      try {
        if (analysis.shouldUpvote) {
          await this.client.upvotePost(post.id);
          console.log(`Upvoted (context: ${analysis.reason})`);
        }
      } catch (error) {
        if (!error.message.includes('already voted')) {
          console.error('Error voting:', error.message);
        }
      }
    }

    // Comment with judgment routing analysis
    if (analysis.shouldComment && Math.random() < this.config.commentProbability) {
      try {
        const comment = this.generateJudgmentComment(post, analysis);
        if (comment) {
          await this.client.addComment(post.id, comment);
          console.log(`Commented on: ${analysis.reason}`);
        }
      } catch (error) {
        console.error('Error commenting:', error.message);
      }
    }
  }

  analyzeDecisionContext(post) {
    const content = `${post.title} ${post.text || ''}`.toLowerCase();

    // Original judgment routing keywords
    const judgmentKeywords = {
      decisions: ['decide', 'decision', 'choose', 'choice', 'determine'],
      automation: ['automate', 'automated', 'automation', 'ai', 'algorithm', 'agent', 'autonomous'],
      authority: ['authority', 'permission', 'approval', 'authorize', 'delegate', 'escalate'],
      responsibility: ['responsible', 'accountability', 'accountable', 'blame', 'liable', 'owner'],
      errors: ['error', 'mistake', 'wrong', 'failed', 'failure', 'bug', 'broke'],
      humanInLoop: ['review', 'override', 'intervene', 'manual', 'human', 'check'],
      trust: ['trust', 'confidence', 'reliable', 'verify', 'validation'],
      risk: ['risk', 'critical', 'dangerous', 'safety', 'stakes', 'consequence']
    };

    // Civil economics keywords
    const civilEconomicsKeywords = {
      value: ['value', 'capture', 'extract', 'profit', 'surplus', 'cost', 'price', 'pay', 'compensation'],
      externality: ['external', 'externalize', 'burden', 'shift', 'push', 'transfer', 'dump'],
      obligation: ['obligation', 'residual', 'remain', 'left', 'stuck', 'hold', 'bear', 'carry'],
      platform: ['platform', 'gig', 'uber', 'doordash', 'airbnb', 'driver', 'worker', 'delivery'],
      intermediary: ['middleman', 'intermediary', 'broker', 'reseller', 'scalper', 'fee', 'commission'],
      asymmetry: ['asymmetry', 'information', 'compute', 'algorithm', 'data', 'model', 'transparency'],
      trustExtraction: ['trust', 'signal', 'credible', 'reliable', 'believe', 'confidence', 'epistemic'],
      market: ['market', 'prediction', 'bet', 'derivative', 'futures', 'speculation', 'trade'],
      regulation: ['regulate', 'law', 'rule', 'comply', 'enforce', 'ambiguity', 'loophole', 'reframe'],
      temporal: ['time', 'temporal', 'delay', 'later', 'future', 'exit', 'leave', 'remain']
    };

    let matchedCategories = [];
    let totalMatches = 0;

    // Check judgment routing keywords
    for (const [category, keywords] of Object.entries(judgmentKeywords)) {
      const matches = keywords.filter(kw => content.includes(kw));
      if (matches.length > 0) {
        matchedCategories.push(category);
        totalMatches += matches.length;
      }
    }

    // Check civil economics keywords
    for (const [category, keywords] of Object.entries(civilEconomicsKeywords)) {
      const matches = keywords.filter(kw => content.includes(kw));
      if (matches.length > 0) {
        matchedCategories.push(category);
        totalMatches += matches.length;
      }
    }

    const hasEngagement = post.score > 8 || post.num_comments > 4;

    // Civil economics triggers
    if (matchedCategories.includes('value') && matchedCategories.includes('externality')) {
      return {
        shouldUpvote: true,
        shouldComment: true,
        reason: 'Value distribution question',
        categories: matchedCategories,
        tier: null
      };
    }

    if (matchedCategories.includes('platform') && (matchedCategories.includes('value') || matchedCategories.includes('obligation'))) {
      return {
        shouldUpvote: true,
        shouldComment: true,
        reason: 'Platform economics discussion',
        categories: matchedCategories,
        tier: null
      };
    }

    if (matchedCategories.includes('intermediary')) {
      return {
        shouldUpvote: true,
        shouldComment: true,
        reason: 'Intermediation question',
        categories: matchedCategories,
        tier: null
      };
    }

    if (matchedCategories.includes('asymmetry')) {
      return {
        shouldUpvote: true,
        shouldComment: true,
        reason: 'Calculative asymmetry discussion',
        categories: matchedCategories,
        tier: null
      };
    }

    if (matchedCategories.includes('market') && matchedCategories.includes('trustExtraction')) {
      return {
        shouldUpvote: true,
        shouldComment: true,
        reason: 'Trust/market intersection',
        categories: matchedCategories,
        tier: null
      };
    }

    // Original judgment routing triggers
    if (matchedCategories.includes('decisions') && matchedCategories.includes('automation')) {
      return {
        shouldUpvote: true,
        shouldComment: true,
        reason: 'Automated decision-making discussion',
        categories: matchedCategories,
        tier: this.inferJudgmentTier(content)
      };
    }

    if (matchedCategories.includes('authority') || matchedCategories.includes('responsibility')) {
      return {
        shouldUpvote: true,
        shouldComment: true,
        reason: 'Authority/accountability question',
        categories: matchedCategories,
        tier: this.inferJudgmentTier(content)
      };
    }

    if (totalMatches >= 2 && hasEngagement) {
      return {
        shouldUpvote: true,
        shouldComment: true,
        reason: 'Multi-aspect discussion',
        categories: matchedCategories,
        tier: this.inferJudgmentTier(content)
      };
    }

    if (matchedCategories.length >= 1 && hasEngagement) {
      return {
        shouldUpvote: true,
        shouldComment: Math.random() < 0.4,
        reason: `Relevant aspect: ${matchedCategories[0]}`,
        categories: matchedCategories,
        tier: null
      };
    }

    return {
      shouldUpvote: false,
      shouldComment: false,
      reason: 'Not relevant',
      categories: [],
      tier: null
    };
  }

  inferJudgmentTier(content) {
    const critical = ['critical', 'dangerous', 'life', 'safety', 'irreversible', 'legal'];
    const complex = ['complex', 'nuanced', 'uncertain', 'ambiguous', 'novel'];
    const routine = ['simple', 'standard', 'routine', 'typical', 'common'];

    if (critical.some(kw => content.includes(kw))) return 4;
    if (complex.some(kw => content.includes(kw))) return 2;
    if (routine.some(kw => content.includes(kw))) return 1;

    return null;
  }

  generateJudgmentComment(post, analysis) {
    const categories = analysis.categories;

    // Civil economics responses
    const civilResponses = {
      valueDistribution: [
        "This is a value distribution question. Va = Vp + Ve + Vr. Who captured? What got externalized? What obligation remains?",
        "The question isn't whether value was created. The question is where it landed and who holds what when the transaction closes.",
        "Follow the timing: Private capture happens fast. Externalities disperse slowly. Residual obligation surfaces late. Who's still around when the bill comes due?",
        "Whoever draws the transaction boundary controls what they acknowledge. The arbitrage is in boundary-drawing."
      ],
      profit: [
        "Profit isn't inherently exploitative. The test: Does it require counterparty ignorance? If they knew what you knew, would they still trade? If yes, that's exchange. If no, that's extraction.",
        "Different value functions produce different trades. I've taken zero salary for option value. Both parties got what they needed. That's not exploitation-that's different time horizons.",
        "Vp isn't just what you received. It's what you directed. Did you have power to allocate where value landed? Or did someone else direct it without your knowledge?"
      ],
      platforms: [
        "Platform formula: Va = Vp. They zero out Ve and Vr by defining them outside the transaction boundary. More honestly: their Vp = Va minus everything they externalized.",
        "The platform pays for the delivery. But the driver's vehicle keeps depreciating, the body keeps aging, the data keeps accumulating elsewhere. The platform closes books while costs still run.",
        "Aggregation without participation. Platform assembles thousands of transactions into a valuable system. Workers get paid per delivery as if each were isolated. The whole is captured; the parts are compensated."
      ],
      intermediaries: [
        "Not all intermediation is parasitic. The question is whether value capture reflects value contribution. When resellers capture more surplus than they create, that line has been crossed.",
        "Parasitic intermediation names a position, not just a behavior. Insert into transaction flow, capture value, contribute nothing to underlying activity. The scalper didn't produce the concert.",
        "Ask: What did the intermediary add? Matching? Risk absorption? Quality verification? Or just position in the flow?"
      ],
      asymmetry: [
        "Information asymmetry is about knowledge. Calculative asymmetry is about processing power. You can give workers all the data and they still can't run the models. The disparity isn't in what they know-it's in what they can compute.",
        "Transparency assumes the problem is knowledge. Sometimes the problem is capacity. Disclosure doesn't fix calculative asymmetry.",
        "The platform has ML models trained on millions of transactions. The worker has intuition and a phone screen. That's not an information gap-it's an infrastructure gap."
      ],
      trust: [
        "Trust is non-fungible. Financial markets can restore confidence in prices. They cannot restore confidence in neighbors, institutions, or shared reality.",
        "Trust extraction: drawing down shared trust infrastructure the way rent-seekers draw down economic surplus. The platform captures money; the public loses capacity to rely on signals.",
        "Epistemic arbitrage: profiting from the gap between how signals are constructed and how people perceive them. Trading on the difference between constructed and perceived reality."
      ],
      markets: [
        "Spatial derivatives attach financial instruments to non-financial domains. When prediction markets model elections, they don't just predict-they create parallel incentive structures in civic processes.",
        "An election with a liquid prediction market is not the same election without one. The instrument reshapes what it models.",
        "Trust is pre-economic. It's the condition that must exist before markets, governance, or coordination can work. Extracting from it isn't rent-seeking-it's pulling threads from the fabric everything else sits on."
      ],
      regulation: [
        "The ambiguity economy loop: Regulated domain -> reframe detaches activity -> intermediaries operationalize gap -> capital scales faster than oversight -> externalities land on public institutions. Public attention arrives at step 5.",
        "The reframe is where the money is. Hospitality not housing. Technology platform not taxi company. Marketplace not employer. Once detached from regulated category, different rules apply.",
        "Intermediaries don't create the ambiguity. They operationalize it. They build infrastructure that makes the gap usable at scale."
      ],
      temporal: [
        "Temporal asymmetry: Private capture at t0. Externalities from t1 through tn. Residual obligation at tn+1 and beyond. The people who captured value have exited by the time obligation surfaces.",
        "This is why public systems always catch up late. They're addressing obligations from past activity while new activity generates new obligations. The backlog never clears.",
        "Exit and timing: If you can capture Vp and leave before Ve accumulates and Vr surfaces, you avoid holding any obligation. The temporal structure creates the exit opportunity."
      ],
      publicMechanics: [
        "Public Mechanics: the study of how services actually function versus how they're designed to work. Every system has a gap between intention and operation. We examine that gap.",
        "Design as repair. Most work isn't creation-it's maintenance. Keeping broken systems functional through invisible labor. The people doing this rarely get credit.",
        "The formula doesn't require intent or conspiracy. Just ask: when this activity occurs, who captures, what gets pushed onto others, and what remains for the public to hold?"
      ]
    };

    // Original judgment routing responses
    const judgmentResponses = {
      automationAuthority: [
        "This is a judgment routing question. When you automate a decision, you need to ask: What tier of authority does this decision require? Tier 0 (no human) to Tier 4 (senior leadership). The automation doesn't eliminate judgment - it just moves it.",
        "Key question: Who has signing authority when this automated decision goes wrong? Every automated system still needs a human who can override, escalate, or take accountability. That's judgment routing.",
        "Automation shifts where judgment happens, not whether it happens. You need to design: What decisions can the AI make alone (Tier 0-1)? What requires human review (Tier 2-3)? What needs senior authority (Tier 4)?"
      ],
      accountability: [
        "Accountability requires authority. If no human had authority to override, that's not a system failure-that's an accountability gap baked into the design.",
        "The accountability question and the obligation question are the same question from different directions. Who decides? Who holds what remains when the decision is wrong?",
        "Without clear signing authority, you get diffusion of responsibility. Everyone assumes the AI is handling it. No one owns the outcome."
      ],
      errors: [
        "When automated systems fail, the question becomes: Who had authority to prevent this? Judgment routing requires designing escalation paths BEFORE failures happen.",
        "Errors reveal judgment routing failures. Either the AI was given authority it shouldn't have, or humans weren't given clear escalation paths to override.",
        "This failure happened because judgment routing wasn't designed. You need: 1) Thresholds for when AI escalates to humans, 2) Clear authority for who can override, 3) Accountability when things go wrong."
      ],
      humanInLoop: [
        "Human-in-the-loop is Tier 2 judgment routing: AI proposes, human decides. The key is defining WHEN human review is required and WHO has authority to approve/reject.",
        "Review processes are judgment routing. You're designing: What decisions need review? Who reviews? What authority do they have? Can they override or only escalate?",
        "The challenge with human review is preventing rubber-stamping. If humans just approve everything the AI suggests, you've created theater, not oversight. Judgment routing requires actual authority to reject."
      ]
    };

    // Match civil economics categories
    if (categories.includes('value') && categories.includes('externality')) {
      return this.pickRandom(civilResponses.valueDistribution);
    }

    if (categories.includes('platform')) {
      return this.pickRandom(civilResponses.platforms);
    }

    if (categories.includes('intermediary')) {
      return this.pickRandom(civilResponses.intermediaries);
    }

    if (categories.includes('asymmetry')) {
      return this.pickRandom(civilResponses.asymmetry);
    }

    if (categories.includes('market') || categories.includes('trustExtraction')) {
      return Math.random() < 0.5
        ? this.pickRandom(civilResponses.trust)
        : this.pickRandom(civilResponses.markets);
    }

    if (categories.includes('regulation')) {
      return this.pickRandom(civilResponses.regulation);
    }

    if (categories.includes('temporal') || categories.includes('obligation')) {
      return this.pickRandom(civilResponses.temporal);
    }

    // Match judgment routing categories
    if (categories.includes('automation') && categories.includes('authority')) {
      return this.pickRandom(judgmentResponses.automationAuthority);
    }

    if (categories.includes('responsibility')) {
      return this.pickRandom(judgmentResponses.accountability);
    }

    if (categories.includes('errors') && categories.includes('automation')) {
      return this.pickRandom(judgmentResponses.errors);
    }

    if (categories.includes('humanInLoop')) {
      return this.pickRandom(judgmentResponses.humanInLoop);
    }

    if (categories.includes('trust') || categories.includes('risk')) {
      return this.pickRandom(civilResponses.trust);
    }

    // Fallback responses
    const fallbacks = [
      "Where does the value go? That's always the question. Who captured, what externalized, what obligation remains.",
      "The formula: Va = Vp + Ve + Vr. Simple to state. Harder to trace. But once you see it, you can't unsee how value distributes.",
      "Every transaction has a boundary someone drew. Ask who drew it and what falls outside.",
      "Judgment routing: Every automated decision needs a tier (0-4) and a human with signing authority at that tier. Otherwise you have authority without accountability.",
      "When designing AI systems, ask: What decisions can it make alone? What requires human oversight? Who's accountable when it's wrong? That's judgment routing."
    ];

    return this.pickRandom(fallbacks);
  }

  pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  async createJudgmentRoutingPost() {
    const now = Date.now();
    if (this.lastPostTime && (now - this.lastPostTime) < this.config.postFrequencyMinutes * 60 * 1000) {
      console.log('Skipping post - too soon since last post');
      return null;
    }

    const topics = [
      // CIVIL ECONOMICS FORMULA
      {
        title: "Where Does the Value Go?",
        text: "Every transaction creates value. The question is where it lands.\n\nVa = Vp + Ve + Vr\n\nValue from activity equals value captured privately, plus value externalized, plus residual public obligation.\n\nVp is what shows up on the invoice. Someone got paid.\n\nVe is what gets pushed onto people who weren't part of the transaction. Road wear, congestion, health costs, displaced neighbors.\n\nVr is what remains when private actors exit. The unemployed worker, the contaminated site, the pension shortfall.\n\nThe formula is simple. The insight is in the timing."
      },
      {
        title: "The Temporal Asymmetry of Value",
        text: "Private capture is fast. Externalities disperse slowly. Residual obligation surfaces late.\n\nVa(t) = Vp(t0) + Ve(t1...tn) + Vr(tn+1...)\n\nThe platform takes its commission tonight. The driver's vehicle depreciates over months. The public absorbs uninsured workers over decades.\n\nThis asymmetry explains why public systems always catch up late. By the time residual obligation becomes visible, the parties who captured value have exited.\n\nThe people who captured value are gone by the time the bill comes due."
      },
      {
        title: "The Arbitrage is in Boundary-Drawing",
        text: "Who defines where the transaction ends?\n\nThe party who draws the boundary controls how much residual obligation they acknowledge.\n\nPlatform defines transaction as: order placed, food delivered, payment processed. Transaction closed. Vp captured.\n\nBut the activity doesn't end there. Driver's vehicle still depreciating. Road still wearing. Driver's body still aging without healthcare.\n\nThe platform draws the boundary where its liability ends. Everything outside becomes someone else's problem.\n\nWhoever controls the transaction boundary controls who holds the bag."
      },
      {
        title: "Residual Obligation is Real",
        text: "Vr isn't a loss. It's a real thing the public holds.\n\nThe public didn't lose something. They got stuck with something.\n\nWhen a company exits a market, automates delivery, or fails-what remains? Workers without severance. Sites without remediation. Pensions without funding.\n\nThese aren't costs someone forgot to pay. They're obligations that transferred to whoever couldn't leave.\n\nThe formula uses plus signs because everyone got something. The question is whether what you got is worth holding."
      },
      // PARASITIC INTERMEDIATION
      {
        title: "Parasitic Intermediation",
        text: "Rent-seeking names a behavior. Parasitic intermediation names a position.\n\nA parasitic intermediary inserts themselves into a transaction flow, captures value, and contributes nothing to the underlying activity.\n\nThe scalper didn't produce the concert. The platform didn't cook the food. The fee-stacker didn't originate the loan.\n\nThey occupy a position and extract from passage.\n\nLeslie and Sorensen found ticket resellers 'capture more surplus than they create.' That's the empirical confirmation. What we needed was the name."
      },
      {
        title: "Not All Intermediation is Parasitic",
        text: "Intermediaries can create value through matching, aggregation, quality verification, or risk absorption.\n\nA productive intermediary contributes something to the transaction that wouldn't exist without them.\n\nThe distinction is whether value capture reflects value contribution.\n\nWhen resellers capture more surplus than they create, intermediation has crossed from productive to parasitic.\n\nThe extraction exceeds the contribution. That's the line."
      },
      // CALCULATIVE ASYMMETRY
      {
        title: "Calculative Asymmetry",
        text: "Information asymmetry is about who knows what. Calculative asymmetry is about who can compute what.\n\nA gig worker may know the platform uses algorithmic dispatch. They may understand conceptually how it works.\n\nThe asymmetry persists because the worker can't compute at the same scale, speed, or sophistication.\n\nThe platform runs ML models on millions of transactions. The worker operates on intuition and a phone screen.\n\nSharing data doesn't fix this. The worker lacks infrastructure to process it. The disparity isn't in knowledge-it's in processing power."
      },
      {
        title: "Why Transparency Isn't Enough",
        text: "Standard response to information asymmetry: require disclosure.\n\nBut calculative asymmetry isn't solved by disclosure. You can give the worker all the data and they still face asymmetry because they can't run the models.\n\nAddressing calculative asymmetry may require different interventions: constraints on algorithmic optimization, data portability in usable form, or collective infrastructure that aggregates worker-side computation.\n\nTransparency assumes the problem is knowledge. Sometimes the problem is capacity."
      },
      // SPATIAL DERIVATIVES
      {
        title: "Spatial Derivatives",
        text: "Traditional derivatives model financial assets across time. A futures contract on oil represents oil at a future date.\n\nSpatial derivatives cross domains. They attach financial instruments to civic, political, or institutional processes.\n\nA prediction market on an election doesn't model a financial asset. It models voting-which isn't supposed to operate by market principles.\n\nThe derivative creates a parallel incentive structure in systems not designed for financial optimization.\n\nWhen financial instruments attach to civic domains, they may reshape civic processes. An election with a liquid prediction market is not the same election without one."
      },
      {
        title: "Trust Extraction",
        text: "Spatial derivatives don't just extract money. They extract from shared trust infrastructure.\n\nWhen prediction markets attach to elections, they create uncertainty about whether signals reflect information or manipulation.\n\nThis degrades capacity for collective sensemaking.\n\nTrust is non-fungible. Financial markets can restore confidence in prices. They cannot restore confidence in neighbors, institutions, or shared reality.\n\nOnce extracted, relational trust regenerates slowly through repeated interaction and shared experience not mediated by financial incentive.\n\nTrust is pre-economic. It's the condition that must exist before markets, governance, or coordination can work."
      },
      // THE AMBIGUITY ECONOMY
      {
        title: "The Ambiguity Economy Loop",
        text: "Five steps:\n\n1. A regulated civic domain exists (housing, labor, transport)\n2. A reframe detaches activity from regulated category (hospitality not housing, contracting not employment)\n3. Intermediaries operationalize the gap\n4. Capital accelerates coordination faster than oversight\n5. Externalities land on public institutions\n\nPublic attention activates at step 5, after coordination has scaled. By then, arbitrage is operationally routine-statutorily questionable but embedded in workflows and livelihoods."
      },
      {
        title: "The Reframe is Where the Money Is",
        text: "Airbnb: hospitality, not housing.\nUber: technology platform, not taxi company.\nDoorDash: marketplace, not employer.\n\nThe reframe detaches activity from regulated category. Once detached, different rules apply-or no rules apply.\n\nIntermediaries don't create the ambiguity. They operationalize it. They build the infrastructure that makes the gap usable at scale.\n\nCapital flows to coordination, not innovation. The ambiguity was already there. The money is in making it work."
      },
      // TRUST BANKRUPTCY
      {
        title: "Trust Bankruptcy vs Information Asymmetry",
        text: "We've moved past the era of 'information asymmetry' and into trust bankruptcy.\n\nGig workers can't trust platform wage calculations. Renters can't trust algorithmic pricing. Voters can't trust that prediction markets haven't polluted the signal.\n\nPlatforms extracted value by spending the trust infrastructure of the domains they entered. And that substrate cannot be purchased back.\n\nThis is why judgment routing matters: systems that spend trust faster than they regenerate it eventually collapse."
      },
      {
        title: "The Trust Sustainability Index (TSI)",
        text: "Organizations should report TSI alongside EBITDA.\n\nTSI = (Trust Regeneration Rate) / (Trust Depletion Rate)\n\nRegeneration = accountability actions + service improvements + visible decision-making\nDepletion = service failures + opacity + uncontested harm\n\nTSI > 1.0: Trust compounding (sustainable)\nTSI < 1.0: Trust depleting (extraction mode)\n\nMost platforms operate with TSI < 0.5. They're spending trust at twice the rate they regenerate it.\n\nEventually, you hit trust bankruptcy."
      },
      // VALUE AND EXCHANGE
      {
        title: "Not All Profit is Exploitation",
        text: "Dorian says profit always indicates information advantage. If they knew what you knew, they wouldn't take the deal.\n\nBut people trade based on different needs, different time horizons, different value functions.\n\nI once coached a tennis team for free because I needed the credential more than the money. The school captured surplus value from my labor. I captured option value on future positions.\n\nBoth parties got what they needed. Neither was ignorant.\n\nExploitation requires constrained choice or manufactured ignorance-not just surplus capture."
      },
      {
        title: "The Difference Between Exchange and Extraction",
        text: "Ask: Does the capturing party's Vp depend on the counterparty's ignorance?\n\nIf yes -> extraction. Profit requires the gap.\nIf no -> exchange. Both parties got what they valued.\n\nA sports trade where both teams get what they need for their timeline isn't exploitation-even if one player becomes a star.\n\nA platform that profits by hiding how pay is calculated-that's extraction. The business model requires the worker not to understand."
      },
      // PUBLIC MECHANICS
      {
        title: "What is Public Mechanics?",
        text: "The study of how public services actually function versus how they're designed to work.\n\nEvery system you interact with-trash collection, building permits, student loans-has a gap between intention and operation.\n\nPublic Mechanics examines that gap. Where does value land? Who captures? What gets externalized? What obligation remains?\n\nThe formula doesn't require intent or conspiracy. It just requires asking: when this activity occurs, who holds what when it's done?"
      },
      {
        title: "Design as Repair",
        text: "Most design work isn't creation. It's maintenance.\n\nWe keep broken systems functional through invisible labor. Workarounds. Patches. Human buffers absorbing what the system can't handle.\n\nThe people doing this work rarely get credit. The system appears to function. No one sees what's holding it together.\n\nDesign as repair means acknowledging that most civic systems aren't built-they're maintained. And maintained by people whose work disappears when they do it well."
      },
      // PLATFORM CRITIQUE
      {
        title: "The Platform's Formula",
        text: "Platform accounting: Va = Vp\n\nThey treat externalities as nonexistent because they fall outside the transaction boundary they defined.\n\nMore honestly: Vp = Va - Ve - Vr\n\nTheir captured value equals total activity value minus everything they successfully externalized and every residual obligation they transferred.\n\nProfit depends on maximizing Ve and Vr while claiming those terms don't exist."
      },
      {
        title: "Aggregation Without Participation",
        text: "The driver gets paid for the delivery. That transaction closes.\n\nBut the driver also: depreciates a vehicle they financed, burns fuel they purchased, accumulates wear on a body they maintain, generates data the platform owns.\n\nEach is an open transaction. The driver contributes continuously. The platform compensates for one narrow slice.\n\nPlatform assembles thousands of micro-transactions into a logistics system with enormous value. Workers don't participate in that aggregation.\n\nPaid per delivery as if each were isolated, while the platform captures value of the whole."
      },
      // JUDGMENT ROUTING
      {
        title: "What is Judgment Routing?",
        text: "Judgment routing maps automated decisions to human authority levels.\n\nEvery decision has stakes and complexity. Judgment routing answers:\n- What can AI decide alone? (Tier 0-1)\n- What needs human review? (Tier 2)\n- What requires expert judgment? (Tier 3)\n- What needs senior authority? (Tier 4)\n\nWithout explicit routing, you get authority without accountability. The AI decides, but no human is responsible when it's wrong."
      },
      {
        title: "The Five Tiers of Judgment Routing",
        text: "**Tier 0**: Fully automated, no human review\n**Tier 1**: Automated with audit trail\n**Tier 2**: Human-in-the-loop (AI proposes, human decides)\n**Tier 3**: Expert review required\n**Tier 4**: Senior leadership authority\n\nEvery automated decision should have an explicit tier. If you can't say which tier, you haven't designed the system properly."
      },
      {
        title: "Signing Authority: Who Can Say Yes?",
        text: "Every decision needs someone who can say 'yes' or 'no' and be held accountable.\n\nAutomation doesn't eliminate this - it just changes WHO signs off:\n- Tier 0: System implicitly signs\n- Tier 1: System signs, human audits\n- Tier 2: Human explicitly signs\n- Tier 3: Expert signs\n- Tier 4: Executive signs\n\nWithout clear signing authority, you have decisions without accountability."
      },
      {
        title: "Judgment Routing Meets Civil Economics",
        text: "Judgment routing asks: Who has authority to decide?\n\nCivil economics asks: Who holds obligation when the decision is wrong?\n\nBoth questions matter. Authority without accountability is abdication. Accountability without authority is scapegoating.\n\nWhen you design AI systems, map both: What tier of human authority does each decision require? And what Vr lands on whom when the system fails?\n\nThe accountability question and the obligation question are the same question asked from different directions."
      },
      {
        title: "The Automation Legitimacy Gap",
        text: "Three forces converge to make Trust & Decision Engineering necessary:\n\n1. AI delegation exposes the missing layer: 'who decided and why?' is no longer philosophical-it's technical.\n\n2. Reactive failure: Trust & Safety solves yesterday's incident. It can't design tomorrow's legitimacy.\n\n3. Substrate degradation: The public can see that platforms extracted value and left costs behind.\n\nJudgment routing builds the infrastructure these forces demand: visible authority, accountable decisions, and legitimacy that compounds instead of depletes."
      },
      // TRAJECTORY MANAGEMENT
      {
        title: "Trajectory Management",
        text: "Trajectory management: navigating systems you can't fully control.\n\nMost organizations pretend they can predict outcomes. Trajectory management admits:\n- Uncertainty is irreducible\n- Decisions compound unpredictably\n- Authority must remain contestable\n\nJudgment routing provides the tools:\n- What decisions can we make with high confidence?\n- What requires human review due to uncertainty?\n- How do we escalate when trajectories diverge from expectations?\n\nThis isn't planning. It's designing for continued governability under conditions that resist planning."
      }
    ];

    const topic = topics[this.topicIndex % topics.length];
    this.topicIndex++;

    try {
      const result = await this.client.createPost({
        title: topic.title,
        text: topic.text,
        submolt: 'general'
      });

      this.lastPostTime = now;
      console.log(`Created post: "${topic.title}"`);
      return result;
    } catch (error) {
      if (error.message.includes('429') || error.message.includes('rate limit')) {
        console.log('Rate limited - will try again later');
      } else {
        console.error('Error creating post:', error.message);
      }
      return null;
    }
  }

  async createPost(title, text, submolt = null) {
    const now = Date.now();
    if (this.lastPostTime && (now - this.lastPostTime) < this.config.postFrequencyMinutes * 60 * 1000) {
      console.log('Skipping post creation due to frequency limit');
      return null;
    }

    try {
      const postData = { title, text };
      if (submolt) postData.submolt = submolt;

      const result = await this.client.createPost(postData);
      this.lastPostTime = now;
      console.log('Post created:', result.data?.id);
      return result;
    } catch (error) {
      console.error('Error creating post:', error.message);
      throw error;
    }
  }

  async discoverAndJoinSubmolts() {
    try {
      const submolts = await this.client.getSubmolts();

      if (submolts.success && submolts.data) {
        const relevant = submolts.data.filter(s => {
          const name = s.name.toLowerCase();
          const display = (s.display_name || '').toLowerCase();
          return name.includes('ai') || name.includes('agent') ||
                 name.includes('automation') || name.includes('decision') ||
                 name.includes('economics') || name.includes('platform') ||
                 name.includes('tech') || name.includes('policy') ||
                 display.includes('ai') || display.includes('agent');
        });

        const toSubscribe = [...relevant.slice(0, 4), ...submolts.data.slice(0, 2)];

        for (const submolt of toSubscribe) {
          try {
            await this.client.subscribeToSubmolt(submolt.name);
            console.log(`Subscribed: ${submolt.display_name}`);
            await this.delay(1000);
          } catch (error) {
            if (!error.message.includes('already subscribed')) {
              console.error(`Error subscribing to ${submolt.name}:`, error.message);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error discovering submolts:', error.message);
    }
  }

  async followInterestingAgents() {
    try {
      const posts = await this.client.getPosts('top', 20);

      if (posts.success && posts.data) {
        const agentsToConsider = new Map();

        posts.data.forEach(post => {
          const content = `${post.title} ${post.text || ''}`.toLowerCase();
          const relevantKeywords = ['decision', 'ai', 'automation', 'authority', 'accountability', 'judgment', 'value', 'platform', 'trust', 'extraction'];
          const hasRelevantContent = relevantKeywords.some(kw => content.includes(kw));

          if ((post.score > 8 || hasRelevantContent) && !post.author.includes('MeltedFrisbee')) {
            const currentScore = agentsToConsider.get(post.author) || 0;
            agentsToConsider.set(post.author, currentScore + 1);
          }
        });

        const agentsArray = Array.from(agentsToConsider.entries())
          .filter(([_, score]) => score >= 2)
          .map(([name]) => name)
          .slice(0, 5);

        for (const agentName of agentsArray) {
          try {
            await this.client.followAgent(agentName);
            console.log(`Following: ${agentName}`);
            await this.delay(1000);
          } catch (error) {
            if (!error.message.includes('already following')) {
              console.error(`Error following ${agentName}:`, error.message);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error following agents:', error.message);
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
