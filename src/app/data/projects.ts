/**
 * Central project data: single source of truth used by the project list,
 * featured section on the dashboard, and individual project detail pages.
 */

export interface RepoLink {
  label: string
  url: string
}

export interface Project {
  /** URL slug, used as the :id param in /project/:id */
  id: string
  title: string
  /** Short blurb shown on cards (list page + dashboard featured section) */
  shortDescription: string
  /** Full paragraph shown on the detail page */
  description: string
  tags: string[]
  category: string
  /** When the work happened, e.g. "Fall 2022" or "2023-present". Shown on cards and the detail page. */
  period?: string
  icon: string
  logo?: string
  /** Single GitHub repo link (shown on cards + detail page) */
  github?: string
  /** For projects with multiple repos (shown on detail page only) */
  repoLinks?: RepoLink[]
  /** Live demo / site URL */
  demo?: string
  /** Path to a report or paper PDF under assets/papers, linked from the detail page */
  paper?: string
  /** Screenshot shown as the card thumbnail and on the detail page */
  image?: string
  /** Architecture diagram rendered in its own section on the detail page */
  architecture?: string
  /** Bullet-point highlights shown on the detail page */
  highlights?: string[]
  /**
   * Honest limitations and takeaways, shown on the detail page below the
   * highlights. Sourced from each project's own report; flaws I know
   * about, not marketing.
   */
  lessons?: string[]
  status?: 'live' | 'in-progress' | 'research' | 'proposal'
  /**
   * Opt-in identifier for a live-data widget rendered above the About
   * section on the detail page. The detail-page component switches on
   * this value to render the matching embed component.
   */
  liveEmbed?: 'world-cup-summary' | 'mri-explorer' | 'empathy-explorer'
}

export const PROJECTS: Project[] = [
  {
    id: 'edgar-signals',
    title: 'EDGAR Fundamentals Signals',
    shortDescription:
      'Point-in-time earnings-surprise signals reconstructed from SEC EDGAR filings across 11 sectors, with walk-forward validation and an honest, weak-but-real result.',
    description:
      "A fundamentals-analytics study that asks whether the earnings surprise disclosed in a 10-Q or 10-K predicts how a stock drifts over the following quarter, the classic post-earnings-announcement drift, rebuilt from free public data. It pulls the SEC EDGAR companyfacts XBRL API for 154 large caps across all 11 sectors, keys every value to its filing date so no feature uses information the market did not yet have, and builds Standardized Unexpected Earnings with a seasonal random walk (no paid analyst estimates). Returns are measured excess of each stock's own sector ETF, evaluation is walk-forward with transaction costs, and a calibrated XGBoost model is benchmarked against honest baselines. Each snapshot is versioned in Postgres and served through the same ingest-and-read pattern as the World Cup engine.",
    tags: ['Python', 'FastAPI', 'PostgreSQL', 'Angular', 'XGBoost', 'Chart.js'],
    category: 'Machine Learning',
    period: '2026',
    icon: 'query_stats',
    repoLinks: [
      { label: 'FastAPI Server', url: 'https://github.com/regmibishal1/ResearchPortfolio-FastAPI' },
      { label: 'Angular UI', url: 'https://github.com/regmibishal1/ResearchPortfolio-UI' },
    ],
    demo: '/stocks',
    status: 'in-progress',
    highlights: [
      'Point-in-time feature panel from the EDGAR companyfacts API: every value keyed to its filing date, verified median filing lag 35 days with zero look-ahead',
      'Standardized Unexpected Earnings via a seasonal random walk, reconstructed without any paid analyst estimates, across 154 large caps in all 11 sectors',
      "Returns measured excess of each stock's own SPDR sector ETF, so sector moves are stripped out and no skill scores exactly zero",
      'Walk-forward, expanding-window validation with transaction costs; calibrated XGBoost benchmarked against base-rate, SUE-only, and calibrated-persistence baselines',
      'Per-snapshot versioning in Postgres behind a SELECT-only read role, mirroring the World Cup ingest-and-read architecture',
    ],
    lessons: [
      'The earnings-surprise drift is real but weak (information coefficient about 0.04, t-stat 2.7) and regime-dependent: it works in 2014-2015, 2017, and 2023, and breaks in 2016 and 2022. It is not a standalone strategy',
      'Single-name quarterly return direction is close to a coin flip (AUC about 0.50), and the fundamentals do not change that, which is consistent with market efficiency',
      'Volatility is forecastable, but a calibrated recent-volatility baseline matches the model, so the filing fundamentals add nothing on top. Reporting that honestly, rather than claiming an edge, was the whole point',
      'The universe is current-surviving tickers, so results carry mild survivorship bias, and overlapping 63-day return windows make the cumulative curve illustrative rather than tradable',
    ],
  },
  {
    id: 'world-cup-prediction',
    title: 'World Cup 2026 Live Prediction Engine',
    shortDescription:
      'Calibrated XGBoost + 2M-simulation Monte Carlo pipeline that predicts the 2026 FIFA World Cup. Auto-refreshes daily; played group-stage matches are locked into every simulation.',
    description:
      'End-to-end machine-learning system that forecasts the 2026 FIFA World Cup. Trained a calibrated XGBoost classifier on ~12,000 international matches since 2014 with positional FIFA-rating features, Elo ratings dating back to 1872, rolling form, and tournament-weighted sample weights. Probabilities are isotonically calibrated and fed into a Monte Carlo simulator that runs 2 million tournaments, bridging classification probabilities to score distributions via a Poisson xG solver. The pipeline updates daily during the tournament: every completed group-stage match is locked into every subsequent simulation, sharpening predictions as the bracket unfolds. Each daily snapshot is versioned in Postgres so the UI can show how predictions evolve over time.',
    tags: ['Python', 'XGBoost', 'FastAPI', 'PostgreSQL', 'Angular', 'Chart.js'],
    category: 'Machine Learning',
    period: '2026',
    icon: 'sports_soccer',
    image: 'assets/projects/world-cup-prediction.webp',
    repoLinks: [
      { label: 'FastAPI Server', url: 'https://github.com/regmibishal1/ResearchPortfolio-FastAPI' },
      { label: 'Angular UI', url: 'https://github.com/regmibishal1/ResearchPortfolio-UI' },
    ],
    demo: '/world-cup',
    liveEmbed: 'world-cup-summary',
    status: 'live',
    highlights: [
      'Calibrated XGBoost multi-class model on win/draw/loss with isotonic probability calibration',
      'Nine orthogonal features: Elo difference, positional squad strength (GK/DEF/MID/ATT), rolling form, neutral-venue flag',
      '2M Monte Carlo simulations per snapshot, parallelised across CPU cores with optional CuPy GPU acceleration',
      'Poisson xG solver maps 3-class probabilities to realistic scorelines for FIFA group-stage tiebreakers',
      'Daily auto-refresh: completed matches override Poisson sampling so predictions sharpen as the tournament unfolds',
      'Per-snapshot versioning in Postgres with isolated read-only schema role for the public read endpoints',
    ],
  },
  {
    id: 'showupmd',
    title: 'ShowUpMD: Maryland Civic Engagement App',
    shortDescription:
      'Full-stack civic app for Maryland voters, with district lookup, candidate browser, legislation tracker, and an AI chat assistant powered by a RAG pipeline over real government data.',
    description:
      'Full-stack civic web app that helps Maryland residents prepare for the 2026 primary election. Enter your address to instantly see your congressional and state legislative districts, current representatives, every candidate on your ballot, and relevant legislation, all in one place. Features "Civvy", an AI chat assistant powered by a RAG pipeline (BGE-M3 embeddings + pgvector) that answers plain-English questions about Maryland bills. Data is ingested from 5+ government sources including the Maryland General Assembly API, OpenStates, Census Geocoder, and the MD State Board of Elections.',
    tags: ['Next.js', 'FastAPI', 'PostgreSQL', 'pgvector', 'AI/RAG', 'Cloudflare'],
    category: 'Full Stack',
    period: '2026',
    icon: 'how_to_vote',
    image: 'assets/projects/showupmd.webp',
    logo: 'assets/showupmd-logo.svg',
    demo: 'https://showupmd.org',
    status: 'live',
    highlights: [
      '"Civvy" AI chat assistant answers plain-English questions about Maryland bills via a BGE-M3 + pgvector RAG pipeline',
      'Address-based district lookup using the Census Geocoder returns congressional and state legislative districts instantly',
      'Candidate browser and legislation tracker pulling live data from the Maryland General Assembly API and OpenStates',
      'Data ingested and normalized from 5+ government sources including the MD State Board of Elections',
      'Deployed on Cloudflare with Cloudflare Tunnel for real-IP propagation and end-to-end request tracing',
    ],
  },
  {
    id: 'research-portfolio',
    title: 'Research Portfolio Platform',
    shortDescription:
      'Architected a full-stack platform to showcase data analysis and research, featuring an Angular frontend, Spring Boot authentication, and FastAPI resource server.',
    description:
      'Architected a full-stack portfolio platform to showcase exploratory data analysis and machine learning research. Designed an Angular frontend integrated with a secure Java Spring Boot authentication API and a Python FastAPI resource server for hosting machine learning models and utilities. Features a live statistics explorer powered by server-side NumPy sampling, structured request-scoped logging with real-IP detection, and a responsive dark-themed UI built with Angular Material.',
    tags: ['Angular', 'Java Spring Boot', 'Python FastAPI', 'PostgreSQL'],
    category: 'Full Stack',
    period: '2023-present',
    icon: 'language',
    image: 'assets/projects/research-portfolio.webp',
    architecture: 'assets/diagrams/portfolio-architecture.svg',
    repoLinks: [
      { label: 'FastAPI Server', url: 'https://github.com/regmibishal1/ResearchPortfolio-FastAPI' },
      { label: 'Angular UI', url: 'https://github.com/regmibishal1/ResearchPortfolio-UI' },
    ],
    status: 'in-progress',
    highlights: [
      'Angular 17 frontend with Material Design, dark theme, and custom glass morphism UI components',
      'Spring Boot authentication API with JWT token-based security, CORS protection, and role-based access control',
      'Python FastAPI resource server with structured request-scoped logging, real-IP detection, and X-Request-ID tracing',
      'Live statistics explorer with server-side NumPy sampling, returning histograms and summary stats in real time',
      'PostgreSQL database for user data and session management',
    ],
  },
  {
    id: 'takeout-organizer',
    title: 'Takeout Organizer',
    shortDescription:
      'Python tool that repairs Google Photos Takeout exports: restores real EXIF metadata from JSON sidecars, de-duplicates by perceptual hash, and organizes everything without ever touching the originals.',
    description:
      'When you export a Google Photos library with Takeout, the photos arrive stripped of their metadata: capture dates and GPS coordinates are dumped into separate JSON sidecar files with famously inconsistent naming. Takeout Organizer matches each photo to its sidecar, writes the metadata back into the file itself with ExifTool, and rebuilds a clean date-organized library. A perceptual-hash de-duplication pass catches the same photo across re-compressions, which solves the overlap between a Takeout export and downloaded shared albums, and keeps the best copy of each. Every operation is copy-based and collision-safe: source files are never modified or deleted, which a dedicated source-integrity test enforces. Runs headless as a CLI or with a desktop GUI, resumes interrupted sessions, and has been exercised on a multi-terabyte library.',
    tags: ['Python', 'ExifTool', 'Pillow', 'CLI', 'GitHub Actions'],
    category: 'Tools',
    period: '2026',
    icon: 'photo_library',
    status: 'in-progress',
    highlights: [
      'Writes real EXIF tags (DateTimeOriginal, GPS) via ExifTool rather than only setting filesystem timestamps, the shortcut most Takeout tools take',
      'Handles the awkward Takeout filename patterns: edited variants, duplicate counters, truncated sidecar names, live-photo pairs, and Unicode or case mismatches',
      'Perceptual de-duplication (difference hash) catches the same photo across re-compressions and keeps the best copy: sidecar-backed first, then highest resolution',
      'Shared-album aware: photos without sidecars are kept and dated from embedded EXIF, then de-duplicated against the Takeout export',
      'Source files are never modified or deleted; every run is copy-based and a source-integrity test verifies it',
      'CI on Linux, Windows, and macOS across Python versions, including an end-to-end test that writes and reads back metadata through a real ExifTool binary',
    ],
    lessons: [
      'Perceptual-hash thresholds are a judgment call: tight enough to avoid false merges, loose enough to catch re-compressions. Borderline pairs are flagged in a report for human review instead of being auto-deleted',
      'The Takeout sidecar format is undocumented and inconsistent, so filename matching grew case by case from real exports rather than from any spec',
      'The first version wrote timestamps in UTC, which put photos hours off in local photo apps; it now respects the local system timezone',
      'A difference hash misses semantic duplicates (same scene, different crop or heavy edit), so those remain a manual decision by design',
      'The repo is staying private until it has processed my own complete library end to end; a tool that rewrites photo metadata should be proven on its author first',
    ],
  },
  {
    id: 'mri-classification',
    title: 'Classification of MRI Images',
    shortDescription:
      "Investigated ResNet CNN architectures for early Alzheimer's Disease classification using MRI data, with saliency maps for model interpretation.",
    description:
      "Investigated the efficacy of various ResNet architectures for early Alzheimer's Disease classification utilizing constrained MRI datasets. Demonstrated the stability and clinical potential of pre-trained convolutional neural networks, specifically ResNet-50, and used saliency maps to interpret predictive performance and highlight the brain regions each model attends to. Completed as the final project for a graduate deep learning course (UMD DATA 612), with the full write-up available below.",
    tags: ['Python', 'PyTorch', 'CNN', 'ResNet'],
    category: 'Machine Learning',
    period: 'Summer 2023',
    icon: 'psychology',
    image: 'assets/projects/mri-classification.webp',
    paper: 'assets/papers/alzheimer-mri-resnet.pdf',
    status: 'research',
    liveEmbed: 'mri-explorer',
    highlights: [
      'Benchmarked all five ResNet variants (18/34/50/101/152) on the public Hugging Face Alzheimer MRI dataset across four dementia stages',
      'ResNet-50 delivered the best result at 99.06% test accuracy, plus the most stable training of the five variants',
      'Class-averaged saliency maps reveal which brain regions each model attends to per dementia stage',
      'Deeper was not better: ResNet-101 and ResNet-152 underperformed, showing the limits of added capacity on constrained medical data',
    ],
    lessons: [
      'Severe class imbalance: the Moderate Demented class had only ~15 test samples versus 632 Non-Demented, so weighted metrics compensate on paper, but the minority-class signal is too thin to trust the headline accuracy for that stage',
      "Discrete labels for a continuous disease: Alzheimer's progresses gradually, so forcing four buckets loses information, and a better design uses longitudinal scans from the same patients over time",
      'Without clinical domain expertise, the saliency maps could only confirm the models look inside the brain. Whether they attend to diagnostically meaningful regions (e.g. atrophy) is unvalidated',
      'Classification reports were not generated for every model during training due to compute cost, so model selection leaned too heavily on test loss alone',
      'The preferred dataset (ADNI) was inaccessible, and the substitute ships no label provenance, so how the stage labels were assigned is unknown. The whole study is a feasibility proof on a limited dataset, not a clinical result',
    ],
  },
  {
    id: 'empathy-emotion',
    title: 'Empathy and Emotion Prediction',
    shortDescription:
      'Developed a multimodal transformer model to classify empathy and emotional valence in conversational data for the WASSA 2023 NLP Shared Task.',
    description:
      "Built multimodal transformer models for the WASSA 2023 Shared Task, predicting empathy, emotional intensity, and emotional polarity in conversational reactions to news articles. The architecture combines transformer text embeddings with non-textual features (demographics, conversation context) through several fusion strategies: concatenation, MLP-on-categorical, gating, and attention. The naive multimodal fusion consistently edged out the text-only baseline on Pearson correlation, the shared task's metric, while the error metrics revealed the trade-offs of simple feature combination, an honest negative result the report analyzes in depth. Completed as the final project for a graduate NLP course (UMD DATA 641); the full report is available below.",
    tags: ['Python', 'NLP', 'Transformers', 'HuggingFace'],
    category: 'Machine Learning',
    period: 'Spring 2023',
    icon: 'forum',
    image: 'assets/projects/empathy-emotion.webp',
    paper: 'assets/papers/empathy-emotion-wassa.pdf',
    status: 'research',
    liveEmbed: 'empathy-explorer',
    highlights: [
      'Built for the WASSA 2023 Shared Task on empathy detection and emotion classification in news-driven conversation',
      'Multimodal architecture fuses transformer text embeddings with demographic and conversational features via four combining strategies',
      'Predicts continuous empathy, emotional intensity, and emotional polarity scores plus discrete emotion labels',
      'Multimodal fusion beat the text-only baseline on Pearson correlation across all three regression targets, with a rigorous error-metric trade-off analysis',
    ],
    lessons: [
      'The multimodal gain was marginal and inconsistent: no single fusion method won across all three targets, and text-only was actually best for emotional intensity, so "multimodal helps" is not a clean conclusion',
      'Pearson correlation and the error metrics (MSE/RMSE/MAE) moved in opposite directions, so a higher correlation score did not mean a better model. It taught me to pick the evaluation metric deliberately, not opportunistically',
      'Feature leakage risk in the metadata: columns like speaker_id and essay_id were one-to-one correlated, and the eval set contained unseen article_ids, so the binary-encoding mismatch between train and eval was never fully resolved',
      'Early runs were unstable on local hardware (one eval produced NaN loss). Moving to Colab fixed reproducibility, underlining how much environment stability affects results',
      'The attention and gating fusion strategies underperformed and were dropped after only 3 to 5 epochs. A fair comparison would give every method the same training budget before ruling it out',
    ],
  },
  {
    id: 'autism-sentiment',
    title: 'Autism Tweet Sentiment Analysis',
    shortDescription:
      'Graduate capstone study design: measuring how autism awareness events shift public sentiment on Twitter, specified end to end from data and methods through ethics, communication, and resourcing.',
    description:
      'My graduate capstone (UMD DATA 698, Research Methods and Study Designs) produced a complete formal study design for a question the autism community actually has: which awareness events improve public sentiment toward autism, and which do not? The design pairs autism-related tweets collected around past awareness events with event timelines and CDC ADDM prevalence data, and specifies the full pipeline: preprocessing, sentiment scoring, a human-labeled validation set to check the sentiment model before trusting it, and the comparative analysis across events. It goes beyond the modeling to the parts research proposals usually skip: an ethics, legal, and privacy assessment of social media data, a communication plan for autism organizations and researchers, and a costed resource plan (two data scientists, two data labelers, a graphic designer, and a manager). An earlier course proposal for a Dask + NLTK processing pipeline grew into this design. The study was designed end to end but deliberately not executed.',
    tags: ['Python', 'Dask', 'NLTK', 'Scikit-Learn', 'Research Design'],
    category: 'Data Science',
    period: 'Summer 2022',
    icon: 'bar_chart',
    paper: 'assets/papers/autism-sentiment-study-design.pdf',
    status: 'proposal',
    highlights: [
      'Complete 15-page study design carried through the capstone process: business case, synopsis, staged specification drafts, peer review, and final submission',
      'Pairs tweet sentiment around awareness events with event timelines and CDC ADDM prevalence data to measure which event formats move public sentiment',
      'Methodology includes a human-labeled validation step so the sentiment model is checked against people before its outputs are trusted',
      'Dedicated ethics, legal, and privacy analysis for social media data, written before any collection would begin',
      'Resource plan sizes the study honestly as a team effort: data scientists, data labelers, a designer, and a manager, with software and cloud costs',
    ],
    lessons: [
      'This stayed a design because executing it (multi-year tweet collection plus a human-labeling budget for ground truth) was larger than the timeframe allowed, and I chose not to ship a half-built version',
      'Writing the design before any code forced me through the parts I would have skipped as a beginner: validating the sentiment model against human labels, privacy handling, and how results reach the people who would use them',
      'Specifying personnel and costs made it obvious this was a team project, not a solo one; peer review caught gaps I could not see myself',
      'Twitter/X API access and pricing changes since 2022 would materially reshape the data-collection plan, so the design would need revisiting before any real execution',
    ],
  },
  {
    id: 'spacex-launch-analysis',
    title: 'SpaceX Launch and Landing Prediction',
    shortDescription:
      'Classified SpaceX launch and booster-landing outcomes with grid-searched decision trees, kNN, SVM, and random forests, and reported plainly where rare-event class imbalance beat the models.',
    description:
      'Final project for a graduate machine learning course (UMD DATA 603) asking what factors drive the success of SpaceX launches and booster recoveries. Using the launch data SpaceX publishes through its API (204 launches, with rocket, payload, core, and landing details), the project trains and grid-search-tunes four classifiers: decision tree, k-nearest neighbors, support vector machine, and random forest. Landing prediction worked: the random forest reached an f1 of 0.95 on successes and 0.86 on failures, and its feature importances made physical sense (whether a landing was attempted, payload mass, flight number of the core, landing legs, core reuse). Launch-failure prediction did not work, and the report says so: only four launches in the dataset carried a payload that failed, and no amount of tuning fixes four positive examples.',
    tags: ['Python', 'scikit-learn', 'Pandas', 'GridSearchCV'],
    category: 'Machine Learning',
    period: 'Fall 2022',
    icon: 'rocket_launch',
    paper: 'assets/papers/spacex-launch-landing.pdf',
    status: 'research',
    highlights: [
      'Four classifier families (decision tree, kNN, SVM, random forest) tuned with grid-search cross-validation on a common pipeline',
      'Landing models performed well: random forest f1 of 0.95 for success and 0.86 for failure, with recall of 1.0 and 0.75 respectively',
      'Feature importances sanity-checked against physics: landing attempted, payload mass, core flight number, legs, and reuse topped the list',
      'The launch-failure result is reported as a failure: with four positive examples, every model was effectively useless at detecting them',
    ],
    lessons: [
      'Class imbalance with genuinely rare events was the lesson of the project: accuracy looked fine while the models missed the thing that mattered, and 204 rows cannot be tuned out of that hole',
      'The max tree depth was capped to guard against overfitting the tiny dataset, which likely also left some landing performance on the table; small data forces that trade',
      'SpaceX is the only company publishing launch data at this detail, so there was no external dataset to validate against; single-source conclusions stay tentative',
      'This was an early end-to-end ML project, and the durable value was the workflow (clean, tune, compare, interrogate feature importances) rather than the headline scores',
    ],
  },
  {
    id: 'cifar10-representations',
    title: 'Data Representations for Image Classification',
    shortDescription:
      'MATLAB comparison of raw pixels, PCA, kernel PCA, and t-SNE as inputs to a kNN classifier on grayscale CIFAR10: PCA wins on consistency, and none of it rescues the wrong classifier.',
    description:
      'Final project for a graduate data representation course (UMD DATA 604), built entirely in MATLAB: a controlled comparison of what representation you hand a classifier. Grayscale CIFAR10 images are fed to a k-nearest-neighbors classifier four ways: raw pixels, principal component analysis, kernel PCA, and t-SNE embeddings, with the k and training-size choices tuned first on the raw baseline. PCA finished with the best global accuracy (31.7%), kernel PCA just behind (31.6%), t-SNE at 25.8%, and raw pixels last. The per-class picture was messier: t-SNE won five of the ten classes outright while losing the average, because PCA never had the lowest lows. A companion midterm applied the same PCA-plus-kNN machinery to Fashion MNIST.',
    tags: ['MATLAB', 'PCA', 'Kernel PCA', 't-SNE', 'kNN'],
    category: 'Data Science',
    period: 'Spring 2023',
    icon: 'scatter_plot',
    paper: 'assets/papers/cifar10-representations-knn.pdf',
    status: 'research',
    highlights: [
      'Same classifier, four representations: raw pixels, PCA, kernel PCA, and t-SNE, compared on both per-class and global accuracy',
      'PCA took the best average accuracy by being consistent rather than by winning classes; t-SNE won the most individual classes while losing the average',
      'Intrinsic-dimensionality estimation and reconstruction checks confirm the reduced bases actually preserve the data before any classification',
      'Written up as a full report with the complete MATLAB appendix, so every figure is reproducible from the code in the paper',
    ],
    lessons: [
      'Roughly 32% accuracy on CIFAR10 is the real headline: kNN on pixel-derived features is the wrong tool for natural images, and no representation choice closes the gap to a convolutional network',
      't-SNE is a visualization method; using its embedding as classifier input misuses it, and the results show exactly the inconsistency you would expect',
      'Kernel PCA needed kernel and parameter tuning that was left on the table, a reminder that a method is only as good as the effort spent fitting it',
      'Converting to grayscale threw away discriminative signal before the comparison even began, a preprocessing decision made for tractability that shaped every downstream number',
    ],
  },
  {
    id: 'climate-snowfall',
    title: 'Climate Change and Snowfall Trends',
    shortDescription:
      'First data science project: a three-person team study of temperature and snowfall trends from NOAA station data, from raw API exploration to a decision-tree snow model.',
    description:
      'My first data science project, built with two classmates in an introductory graduate course (UMD DATA 602). The team worked directly against the NOAA Climate Data API, first mapping its stations, datasets, and data-category endpoints to find stations with long, usable records, then pulling decades of daily temperature and precipitation data for the Baltimore-Washington region. The analysis looks for climate-change signals in average, maximum, and minimum temperature trends and in snowfall specifically, and finishes with a decision-tree model of snowfall that only became workable after reframing the target from snowfall amount to a binary snow or no-snow day. Most of the project, honestly, was learning to get real data into a usable state.',
    tags: ['Python', 'Pandas', 'NOAA API', 'Jupyter'],
    category: 'Data Science',
    period: 'Fall 2021',
    icon: 'ac_unit',
    status: 'research',
    highlights: [
      'Systematic exploration of the NOAA Climate Data API (stations, datasets, and data-category endpoints) to find stations with long, complete records',
      'Decades of daily temperature and precipitation history analyzed for trend, using the BWI airport station as the anchor series',
      'Snowfall modeling reframed from predicting amounts to classifying snow versus no-snow days, which turned an unworkable regression into a usable decision tree',
      'Missing-data strategy chosen per series: dropping rows was fine for temperature questions but corrupted the snowfall record, which needed imputation instead',
    ],
    lessons: [
      'The first real lesson of working with real data: most of the project was acquisition and cleaning, and the modeling at the end was the smallest part',
      'Dropping missing rows is not one decision; it was fine for temperature trends and quietly wrong for snowfall, and noticing the difference took us a while',
      'Predicting snowfall amounts was beyond the data and the team at the time; simplifying the question to snow or no-snow was the difference between nothing and something',
      'Three people passing one notebook around taught version discipline the hard way: the project folder had a Git repo that never received a single commit',
    ],
  },
]
