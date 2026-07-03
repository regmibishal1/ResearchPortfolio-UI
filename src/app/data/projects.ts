/**
 * Central project data — single source of truth used by the project list,
 * featured section on the dashboard, and individual project detail pages.
 */

export interface RepoLink {
  label: string
  url: string
}

export interface Project {
  /** URL slug — used as the :id param in /project/:id */
  id: string
  title: string
  /** Short blurb shown on cards (list page + dashboard featured section) */
  shortDescription: string
  /** Full paragraph shown on the detail page */
  description: string
  tags: string[]
  category: string
  icon: string
  logo?: string
  /** Single GitHub repo link (shown on cards + detail page) */
  github?: string
  /** For projects with multiple repos — shown on detail page only */
  repoLinks?: RepoLink[]
  /** Live demo / site URL */
  demo?: string
  /** Bullet-point highlights shown on the detail page */
  highlights?: string[]
  /**
   * Honest limitations and takeaways, shown on the detail page below the
   * highlights. Sourced from each project's own report — flaws I know
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
    id: 'world-cup-prediction',
    title: 'World Cup 2026 Live Prediction Engine',
    shortDescription:
      'Calibrated XGBoost + 2M-simulation Monte Carlo pipeline that predicts the 2026 FIFA World Cup. Auto-refreshes daily; played group-stage matches are locked into every simulation.',
    description:
      'End-to-end machine-learning system that forecasts the 2026 FIFA World Cup. Trained a calibrated XGBoost classifier on ~12,000 international matches since 2014 with positional FIFA-rating features, Elo ratings dating back to 1872, rolling form, and tournament-weighted sample weights. Probabilities are isotonically calibrated and fed into a Monte Carlo simulator that runs 2 million tournaments, bridging classification probabilities to score distributions via a Poisson xG solver. The pipeline updates daily during the tournament: every completed group-stage match is locked into every subsequent simulation, sharpening predictions as the bracket unfolds. Each daily snapshot is versioned in Postgres so the UI can show how predictions evolve over time.',
    tags: ['Python', 'XGBoost', 'FastAPI', 'PostgreSQL', 'Angular', 'Chart.js'],
    category: 'Machine Learning',
    icon: 'sports_soccer',
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
    title: 'ShowUpMD — Maryland Civic Engagement App',
    shortDescription:
      'Full-stack civic app for Maryland voters — district lookup, candidate browser, legislation tracker, and an AI chat assistant powered by a RAG pipeline over real government data.',
    description:
      'Full-stack civic web app that helps Maryland residents prepare for the 2026 primary election. Enter your address to instantly see your congressional and state legislative districts, current representatives, every candidate on your ballot, and relevant legislation — all in one place. Features "Civvy", an AI chat assistant powered by a RAG pipeline (BGE-M3 embeddings + pgvector) that answers plain-English questions about Maryland bills. Data is ingested from 5+ government sources including the Maryland General Assembly API, OpenStates, Census Geocoder, and the MD State Board of Elections.',
    tags: ['Next.js', 'FastAPI', 'PostgreSQL', 'pgvector', 'AI/RAG', 'Cloudflare'],
    category: 'Full Stack',
    icon: 'how_to_vote',
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
    icon: 'language',
    repoLinks: [
      { label: 'FastAPI Server', url: 'https://github.com/regmibishal1/ResearchPortfolio-FastAPI' },
      { label: 'Angular UI', url: 'https://github.com/regmibishal1/ResearchPortfolio-UI' },
    ],
    status: 'in-progress',
    highlights: [
      'Angular 17 frontend with Material Design, dark theme, and custom glass morphism UI components',
      'Spring Boot authentication API with JWT token-based security, CORS protection, and role-based access control',
      'Python FastAPI resource server with structured request-scoped logging, real-IP detection, and X-Request-ID tracing',
      'Live statistics explorer — server-side NumPy sampling with histogram and summary stats returned in real time',
      'PostgreSQL database for user data and session management',
    ],
  },
  {
    id: 'mri-classification',
    title: 'Classification of MRI Images',
    shortDescription:
      "Investigated ResNet CNN architectures for early Alzheimer's Disease classification using MRI data, leveraging saliency maps for model interpretation.",
    description:
      "Investigated the efficacy of various ResNet architectures for early Alzheimer's Disease classification utilizing constrained MRI datasets. Demonstrated the robust stability and clinical potential of pre-trained convolutional neural networks, specifically ResNet-50, and leveraged saliency maps to interpret predictive performance and highlight diagnostically relevant brain regions.",
    tags: ['Python', 'PyTorch', 'CNN', 'ResNet'],
    category: 'Machine Learning',
    icon: 'psychology',
    status: 'research',
    liveEmbed: 'mri-explorer',
    highlights: [
      'Benchmarked all five ResNet variants (18/34/50/101/152) on the public Hugging Face Alzheimer MRI dataset across four dementia stages',
      'ResNet-50 delivered the best result — 99.06% test accuracy — and the most stable training of the five variants',
      'Class-averaged saliency maps reveal which brain regions each model attends to per dementia stage',
      'Deeper was not better: ResNet-101 and ResNet-152 underperformed, showing the limits of added capacity on constrained medical data',
    ],
    lessons: [
      'Severe class imbalance: the Moderate Demented class had only ~15 test samples versus 632 Non-Demented — weighted metrics compensate on paper, but the minority-class signal is too thin to trust the headline accuracy for that stage',
      "Discrete labels for a continuous disease: Alzheimer's progresses gradually, so forcing four buckets loses information — a better design uses longitudinal scans from the same patients over time",
      'Without clinical domain expertise, the saliency maps could only confirm the models look inside the brain — whether they attend to diagnostically meaningful regions (e.g. atrophy) is unvalidated',
      'Classification reports were not generated for every model during training due to compute cost, so model selection leaned too heavily on test loss alone',
      'The preferred dataset (ADNI) was inaccessible; the substitute ships no label provenance, so how the stage labels were assigned is unknown — the whole study is a feasibility proof on a limited dataset, not a clinical result',
    ],
  },
  {
    id: 'empathy-emotion',
    title: 'Empathy and Emotion Prediction',
    shortDescription:
      'Developed a multimodal transformer model to classify empathy and emotional valence in conversational data for the WASSA 2023 NLP Shared Task.',
    description:
      "Built multimodal transformer models for the WASSA 2023 Shared Task, predicting empathy, emotional intensity, and emotional polarity in conversational reactions to news articles. The architecture combines transformer text embeddings with non-textual features (demographics, conversation context) through several fusion strategies — concatenation, MLP-on-categorical, gating, and attention. The naive multimodal fusion consistently edged out the text-only baseline on Pearson correlation, the shared task's metric, while the error metrics revealed the trade-offs of simple feature combination — an honest negative result the report analyzes in depth.",
    tags: ['Python', 'NLP', 'Transformers', 'HuggingFace'],
    category: 'Machine Learning',
    icon: 'forum',
    status: 'research',
    liveEmbed: 'empathy-explorer',
    highlights: [
      'Built for the WASSA 2023 Shared Task on empathy detection and emotion classification in news-driven conversation',
      'Multimodal architecture fuses transformer text embeddings with demographic and conversational features via four combining strategies',
      'Predicts continuous empathy, emotional intensity, and emotional polarity scores plus discrete emotion labels',
      'Multimodal fusion beat the text-only baseline on Pearson correlation across all three regression targets, with a rigorous error-metric trade-off analysis',
    ],
    lessons: [
      'The multimodal gain was marginal and inconsistent: no single fusion method won across all three targets — text-only was actually best for emotional intensity, so "multimodal helps" is not a clean conclusion',
      'Pearson correlation and the error metrics (MSE/RMSE/MAE) moved in opposite directions, so a higher correlation score did not mean a better model — a reminder to pick the evaluation metric deliberately, not opportunistically',
      'Feature leakage risk in the metadata: columns like speaker_id and essay_id were one-to-one correlated, and the eval set contained unseen article_ids — the binary-encoding mismatch between train and eval was never fully resolved',
      'Early runs were unstable on local hardware (one eval produced NaN loss); moving to Colab fixed reproducibility, underlining how much environment stability affects results',
      'The attention and gating fusion strategies underperformed and were dropped after only 3–5 epochs — a fair comparison would give every method the same training budget before ruling it out',
    ],
  },
  {
    id: 'autism-sentiment',
    title: 'Autism Tweet Sentiment Analysis',
    shortDescription:
      'Research proposal for a scalable Dask + Scikit-Learn pipeline to track public sentiment shifts in Twitter data around autism awareness events.',
    description:
      'Research proposal for a scalable sentiment analysis study of Twitter discourse around autism awareness events. The proposed design pairs a Dask-based distributed pipeline with NLTK preprocessing and Scikit-Learn classifiers to quantify how high-profile media events shift public perception over time, without ever loading the full tweet corpus into memory. The study was scoped and designed but not carried out.',
    tags: ['Python', 'Dask', 'NLTK', 'Scikit-Learn'],
    category: 'Data Science',
    icon: 'bar_chart',
    status: 'proposal',
    highlights: [
      'Proposed a Dask-based distributed pipeline to process millions of tweets out-of-core',
      'Study design compares sentiment before, during, and after awareness events across annual cycles',
      'Planned NLTK preprocessing (tokenization, lemmatization, stopword removal) feeding Scikit-Learn classifiers',
    ],
    lessons: [
      'This stayed a proposal — the scope (multi-year tweet collection plus a labeling strategy for sentiment ground truth) was larger than the timeframe allowed, and I chose not to ship a half-built version',
      'Twitter/X API access and pricing changes since the proposal would materially reshape the data-collection plan, so the original design would need revisiting before any real execution',
    ],
  },
]
