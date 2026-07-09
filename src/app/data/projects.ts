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
  /**
   * Set when the project was graduate coursework, e.g. "Graduate coursework, UMD (DATA 603)".
   * Rendered as a school badge on the detail page and a school icon on cards, so
   * classwork is never mistaken for professional or production work.
   */
  coursework?: string
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

// Definition order only matters WITHIN a period: the exported list below is
// sorted newest-first by period, and the sort is stable, so entries sharing a
// period keep the order they are written in here (main project first, then
// its companion notebooks).
const PROJECT_DEFINITIONS: Project[] = [
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
    image: 'assets/projects/edgar-signals.webp',
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
      'The platform serving this site: an Angular frontend, a Spring Boot auth API, and a FastAPI model server, all running in Docker on home hardware behind Cloudflare.',
    description:
      'The platform serving the site you are on. An Angular frontend on Cloudflare Pages talks to a Java Spring Boot authentication API and a Python FastAPI model server, both running in Docker on home hardware behind a Cloudflare Tunnel, so nothing needs a cloud bill. Includes a live statistics explorer powered by server-side NumPy sampling, structured request-scoped logging with real-IP detection, and a dark-themed UI built with Angular Material.',
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
    image: 'assets/projects/takeout-organizer.webp',
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
    coursework: 'Graduate coursework, UMD (DATA 612)',
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
    coursework: 'Graduate coursework, UMD (DATA 641)',
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
    coursework: 'Graduate capstone, UMD (DATA 698)',
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
    coursework: 'Graduate coursework, UMD (DATA 603)',
    icon: 'rocket_launch',
    image: 'assets/projects/spacex-launch-landing.webp',
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
    coursework: 'Graduate coursework, UMD (DATA 604)',
    icon: 'scatter_plot',
    image: 'assets/projects/cifar10-representations.webp',
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
    coursework: 'Graduate coursework, UMD (DATA 602)',
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
  {
    id: 'ml-fundamentals-notebooks',
    title: 'Machine Learning Fundamentals, by Hand',
    shortDescription:
      'The notebook series behind the SpaceX project: Bayesian classifiers, logistic regression, PCA with eigenfaces, decision trees, and regression, each worked through from the math down.',
    description:
      'The working notebooks from a graduate machine learning course (UMD DATA 603), kept because they are where the fundamentals actually sank in. The series walks through Bayesian classifiers from their decision-theory notation, binary and multiclass logistic regression with confusion matrices, precision, recall, and ROC analysis, decision-tree exercises, and regression on housing data. The largest notebook applies PCA to the Labeled Faces in the Wild dataset, building eigenfaces, projecting the faces into the reduced basis, and classifying with kNN, which is the assignment that made dimensionality reduction concrete rather than abstract. These notebooks are coursework, not products, and that is the point: they are the reps that the later projects stand on.',
    tags: ['Python', 'scikit-learn', 'NumPy', 'Jupyter'],
    category: 'Machine Learning',
    period: 'Fall 2022',
    coursework: 'Graduate coursework, UMD (DATA 603)',
    icon: 'functions',
    image: 'assets/projects/ml-fundamentals-notebooks.webp',
    status: 'research',
    highlights: [
      'Bayesian classifiers implemented from the notation up, then compared against library versions',
      'Logistic regression notebook covers the full evaluation loop: confusion matrix heatmaps, precision, recall, and ROC curves',
      'PCA on Labeled Faces in the Wild: eigenfaces, projection, reconstruction, and kNN classification in the reduced space',
      'Decision-tree and regression exercises rounding out the classical toolkit before the SpaceX final project applied it',
    ],
    lessons: [
      'Implementing a method before importing it changes what you remember; the Bayes notebooks are why decision boundaries stopped being magic',
      'Evaluating with a confusion matrix first, and accuracy last, became a habit here and paid off immediately on the class-imbalanced SpaceX data',
      'Eigenfaces made obvious what variance explained actually means: the first components encode lighting and pose long before identity',
      'Notebooks written to learn are messy by nature; the discipline of cleaning one up for submission was itself part of the learning',
    ],
  },
  {
    id: 'monte-carlo-notebooks',
    title: 'Monte Carlo and Bayesian Sampling',
    shortDescription:
      'Sampling methods from first principles: inverse-transform and rejection sampling, then MCMC posterior estimation, built and visualized in notebooks before ever touching a library.',
    description:
      'Notebooks from a graduate computational statistics course (UMD DATA 606) covering how random sampling actually works. The core notebook builds up from probability mass and density functions to inverse-transform sampling, then rejection sampling with an explicit envelope function, deriving and plotting each step. The homework applies Markov chain Monte Carlo to posterior estimation, running multiple chains and comparing their traces and densities to check convergence by eye. This is the probabilistic footing under the later calibrated-model work: isotonic calibration and Brier scores in the World Cup and EDGAR projects trace straight back to these exercises.',
    tags: ['Python', 'NumPy', 'Matplotlib', 'Bayesian Statistics'],
    category: 'Data Science',
    period: 'Spring 2022',
    coursework: 'Graduate coursework, UMD (DATA 606)',
    icon: 'casino',
    image: 'assets/projects/monte-carlo-notebooks.webp',
    status: 'research',
    highlights: [
      'Inverse-transform sampling derived from the quantile function and verified against known distributions',
      'Rejection sampling with an explicit envelope, plotted so the acceptance region is visible rather than implied',
      'MCMC homework estimates posteriors with multiple chains, comparing trace plots and densities for convergence',
      'Every method implemented with NumPy and plotted by hand before any statistical library was allowed to hide the mechanics',
    ],
    lessons: [
      'Watching rejection sampling waste most of its draws when the envelope is loose taught more about efficiency than any formula',
      'Convergence diagnostics started as eyeballing trace plots; knowing what good and bad chains look like still guides how I read samplers today',
      'The gap between a distribution on paper and samples from it in code is where most of my early probability misunderstandings lived',
      'These were homework-scale problems with known answers, which is exactly what made the methods checkable while learning them',
    ],
  },
  {
    id: 'distributed-data-notebooks',
    title: 'First Steps in Distributed Data: Dask and Spark',
    shortDescription:
      'A first contact with distributed tooling: Dask clients, partitioned dataframes over Tesla market and fundamentals data, Spark comparisons, and unit tests written inside the notebook.',
    description:
      'A working notebook from a graduate big data systems course (UMD DATA 605) that was less about the model and entirely about the plumbing. It stands up a local Dask cluster with explicit worker, thread, and memory limits, wraps the connection handling in helper functions, and then, unusually for a notebook, unit-tests those helpers with unittest right between the cells. Tesla price history and fundamentals load through dask.dataframe with lazy evaluation and type conversion, mirroring the same flow discussed for Spark, and a small decision tree at the end closes the train-test loop. The model itself trained on five rows of fundamentals data, which was never the point.',
    tags: ['Python', 'Dask', 'Spark', 'unittest'],
    category: 'Data Science',
    period: 'Spring 2022',
    coursework: 'Graduate coursework, UMD (DATA 605)',
    icon: 'hub',
    image: 'assets/projects/distributed-data-notebooks.webp',
    status: 'research',
    highlights: [
      'Local Dask cluster configured with explicit workers, threads per worker, and memory limits rather than defaults',
      'Connection-handling helpers wrapped and unit-tested with unittest inside the notebook itself',
      'Tesla price history and fundamentals loaded through dask.dataframe with lazy evaluation, profiling, and dtype control',
      'A small end-to-end train-test split and decision tree confirm the pipeline runs, deliberately modest in scope',
    ],
    lessons: [
      'Distributed tooling on data that fits in memory adds overhead and nothing else; feeling that firsthand is what made the lesson stick',
      'The decision tree at the end trained on five rows of fundamentals, a reminder that infrastructure exercises and modeling exercises are different assignments',
      'Writing tests inside a notebook felt strange and turned out to be the most durable habit this course left me with',
      'Lazy evaluation surprises you exactly once per mistake; learning when Dask actually computes was half the value of the exercise',
    ],
  },
  {
    id: 'deep-learning-notebooks',
    title: 'PyTorch Notebooks: CNNs and What They Learn',
    shortDescription:
      'The homework behind the Alzheimer project: training CNNs on MNIST, using a frozen ResNet50 as a feature extractor on CIFAR10, and watching t-SNE turn raw pixels into separable clusters.',
    description:
      'The PyTorch homework notebooks from a graduate deep learning course (UMD DATA 612), the direct on-ramp to the Alzheimer MRI final project. The MNIST notebooks build the training loop from scratch (data loaders, network definition, optimization, evaluation) and then reload the trained network to visualize its learned embeddings with t-SNE, where the ten digits separate into clean, nearly disjoint clusters. The feature-extraction homework freezes a pretrained ResNet50, upsamples CIFAR10 images to fit it, harvests penultimate-layer features for train and test sets, and shows via t-SNE how much structure a network trained on ImageNet already imposes on images it has never seen.',
    tags: ['Python', 'PyTorch', 'ResNet', 't-SNE'],
    category: 'Machine Learning',
    period: 'Summer 2023',
    coursework: 'Graduate coursework, UMD (DATA 612)',
    icon: 'device_hub',
    image: 'assets/projects/deep-learning-notebooks.webp',
    status: 'research',
    highlights: [
      'MNIST training loop written out in full: loaders, model, loss, optimizer, and evaluation, with hyperparameters surfaced at the top',
      'Trained-model embeddings visualized with t-SNE, showing the ten digits as cleanly separated clusters',
      'Pretrained ResNet50 used as a frozen feature extractor on upsampled CIFAR10, with penultimate-layer features harvested for both splits',
      'Direct preparation for the Alzheimer MRI final project, where the same transfer-learning pattern carried the result',
    ],
    lessons: [
      'The t-SNE before-and-after is the single most convincing picture of what a network learns: raw pixels are soup, learned features are islands',
      'Transfer learning worked embarrassingly well compared to training from scratch, which reframed how I scope small-data image problems',
      'Upsampling 32-pixel CIFAR images to feed a network built for 224 made the resolution mismatch, and its cost, impossible to ignore',
      'Homework-sized runs taught GPU budgeting: knowing roughly what an epoch costs before launching it is a skill, not trivia',
    ],
  },
  {
    id: 'first-semester-notebooks',
    title: 'First Notebooks: Learning Pandas the Hard Way',
    shortDescription:
      'The very first notebooks of the degree: a class-survey analysis and a Celtics box-score win-loss tree, kept as an honest record of where the learning curve started.',
    description:
      "The earliest notebooks of the graduate program (UMD DATA 602, first semester), kept unpolished on purpose. The first analyzes a survey of the cohort's interests: reading the CSV, handling missing values, joining tables, and growing a decision tree over interest columns that, in hindsight, mostly memorized 35 classmates. The second pulls Boston Celtics box scores and hits real-world data cleaning immediately, non-breaking space characters hiding in both the values and the column names, before fitting a win-loss decision tree on a season of games and reading it against basketball intuition. Neither is a project so much as a record of first contact with pandas, scikit-learn, and messy data.",
    tags: ['Python', 'Pandas', 'scikit-learn', 'Jupyter'],
    category: 'Data Science',
    period: 'Fall 2021',
    coursework: 'Graduate coursework, UMD (DATA 602)',
    icon: 'school',
    image: 'assets/projects/first-semester-notebooks.webp',
    status: 'research',
    highlights: [
      'First real pandas work: CSV loading, missing-value handling, joins, and grouped aggregation on the class survey',
      'Celtics box-score cleaning surfaced non-breaking space characters in values and column names, a classic messy-data initiation',
      'Win-loss decision tree over a season of games, sanity-checked against basketball sense (points, rebounds, turnovers)',
      'Kept as-is rather than retrofitted, so the growth between these and the later projects is visible',
    ],
    lessons: [
      'The survey decision tree fit 35 rows perfectly and predicted nothing; it was my first overfit before I knew the word for it',
      'The invisible non-breaking space bug took longer than the modeling and taught the durable lesson that data inspection comes before everything',
      'Small single-season sports data makes every conclusion fragile, and the temptation to narrate noise is strong; resisting it started here',
      'Keeping early work visible is deliberate: the distance between these notebooks and the later point-in-time EDGAR work is the actual portfolio',
    ],
  },
]

/** Representative month for each season, for ordering periods within a year. */
const SEASON_MONTH: Record<string, number> = { Spring: 2, Summer: 6, Fall: 9 }

/**
 * Sortable rank for a period string ("Fall 2022", "2026", "2023-present").
 * Plain years rank mid-year; "-present" ranks late in its start year so an
 * ongoing project sits above that year's finished work.
 */
function periodRank(period?: string): number {
  if (!period) return 0
  const year = Number(period.match(/\d{4}/)?.[0] ?? 0)
  const season = Object.keys(SEASON_MONTH).find((s) => period.startsWith(s))
  const month = season ? SEASON_MONTH[season] : period.includes('present') ? 12 : 6
  return year * 100 + month
}

/**
 * Projects in reverse-chronological order (newest first). The list page and
 * the dashboard's featured slice both read this, so time order holds
 * everywhere without any component doing its own sorting.
 */
export const PROJECTS: Project[] = [...PROJECT_DEFINITIONS].sort(
  (a, b) => periodRank(b.period) - periodRank(a.period)
)
