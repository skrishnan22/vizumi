'use client';

import styles from './HeroIllustration.module.css';

export function HeroIllustration() {
  return (
    <div className={styles.container}>
      <svg
        viewBox="0 0 800 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.svg}
        aria-hidden="true"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
          <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
          <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0" />
            <stop offset="50%" stopColor="#14b8a6" stopOpacity="1" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Soft shadow */}
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.1" />
          </filter>
        </defs>

        {/* === LEFT SIDE: URL/Document Icon === */}
        <g className={styles.sourceGroup}>
          {/* Browser window */}
          <rect
            x="80"
            y="140"
            width="140"
            height="120"
            rx="12"
            fill="white"
            filter="url(#softShadow)"
            className={styles.browserWindow}
          />
          {/* Browser header bar */}
          <rect x="80" y="140" width="140" height="28" rx="12" fill="#f1f5f9" />
          <rect x="80" y="156" width="140" height="12" fill="#f1f5f9" />
          {/* Browser dots */}
          <circle cx="96" cy="154" r="4" fill="#fca5a5" />
          <circle cx="110" cy="154" r="4" fill="#fcd34d" />
          <circle cx="124" cy="154" r="4" fill="#86efac" />
          {/* URL bar */}
          <rect x="92" y="178" width="116" height="20" rx="4" fill="#f1f5f9" />
          {/* Link icon in URL bar */}
          <path
            d="M104 188 L108 184 M108 188 L104 184"
            stroke="#0d9488"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <rect x="114" y="185" width="40" height="6" rx="2" fill="#cbd5e1" />
          {/* Content lines */}
          <rect x="92" y="208" width="80" height="6" rx="2" fill="#e2e8f0" />
          <rect x="92" y="220" width="100" height="6" rx="2" fill="#e2e8f0" />
          <rect x="92" y="232" width="60" height="6" rx="2" fill="#e2e8f0" />

          {/* Floating link icon */}
          <g className={styles.linkIcon}>
            <circle cx="120" cy="120" r="20" fill="url(#tealGradient)" filter="url(#glow)" />
            <path
              d="M114 124 L110 128 A6 6 0 0 0 118 136 L122 132 M126 120 L130 116 A6 6 0 0 0 122 108 L118 112 M114 128 L126 116"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        </g>

        {/* === CENTER: AI Processing / Flow === */}
        <g className={styles.processingGroup}>
          {/* Flow particles */}
          <circle className={styles.particle1} cx="260" cy="200" r="4" fill="url(#tealGradient)" />
          <circle className={styles.particle2} cx="300" cy="180" r="3" fill="url(#purpleGradient)" />
          <circle className={styles.particle3} cx="340" cy="210" r="5" fill="url(#tealGradient)" />
          <circle className={styles.particle4} cx="380" cy="190" r="3" fill="url(#orangeGradient)" />
          <circle className={styles.particle5} cx="420" cy="205" r="4" fill="url(#tealGradient)" />
          <circle className={styles.particle6} cx="460" cy="185" r="3" fill="url(#purpleGradient)" />

          {/* Flow lines */}
          <path
            className={styles.flowLine1}
            d="M230 200 Q350 160 500 200"
            stroke="url(#flowGradient)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            className={styles.flowLine2}
            d="M230 200 Q350 240 500 200"
            stroke="url(#flowGradient)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Central AI node */}
          <g className={styles.aiNode}>
            <circle cx="400" cy="200" r="36" fill="white" filter="url(#softShadow)" />
            <circle cx="400" cy="200" r="32" fill="#f0fdfa" />
            <circle cx="400" cy="200" r="24" stroke="url(#tealGradient)" strokeWidth="2" fill="none" />
            {/* AI sparkle/brain icon */}
            <path
              d="M392 196 L400 188 L408 196 M392 204 L400 212 L408 204 M388 200 L412 200"
              stroke="url(#tealGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              className={styles.aiIcon}
            />
            {/* Orbiting dots */}
            <circle className={styles.orbit1} cx="400" cy="160" r="3" fill="#14b8a6" />
            <circle className={styles.orbit2} cx="440" cy="200" r="3" fill="#8b5cf6" />
            <circle className={styles.orbit3} cx="400" cy="240" r="3" fill="#f97316" />
          </g>
        </g>

        {/* === RIGHT SIDE: Visual Notes Network === */}
        <g className={styles.notesGroup}>
          {/* Connection lines */}
          <line x1="540" y1="140" x2="600" y2="100" stroke="#e2e8f0" strokeWidth="2" className={styles.connectionLine} />
          <line x1="540" y1="140" x2="620" y2="160" stroke="#e2e8f0" strokeWidth="2" className={styles.connectionLine} />
          <line x1="540" y1="140" x2="580" y2="200" stroke="#e2e8f0" strokeWidth="2" className={styles.connectionLine} />
          <line x1="580" y1="200" x2="540" y2="260" stroke="#e2e8f0" strokeWidth="2" className={styles.connectionLine} />
          <line x1="580" y1="200" x2="660" y2="220" stroke="#e2e8f0" strokeWidth="2" className={styles.connectionLine} />
          <line x1="620" y1="160" x2="700" y2="140" stroke="#e2e8f0" strokeWidth="2" className={styles.connectionLine} />
          <line x1="660" y1="220" x2="720" y2="260" stroke="#e2e8f0" strokeWidth="2" className={styles.connectionLine} />

          {/* Main note card */}
          <g className={styles.noteCard1}>
            <rect x="510" y="110" width="60" height="60" rx="12" fill="white" filter="url(#softShadow)" />
            <rect x="510" y="110" width="60" height="16" rx="12" fill="url(#tealGradient)" />
            <rect x="510" y="122" width="60" height="4" fill="url(#tealGradient)" />
            <rect x="518" y="134" width="36" height="4" rx="1" fill="#e2e8f0" />
            <rect x="518" y="142" width="44" height="4" rx="1" fill="#e2e8f0" />
            <rect x="518" y="150" width="28" height="4" rx="1" fill="#e2e8f0" />
          </g>

          {/* Secondary nodes */}
          <g className={styles.noteNode1}>
            <circle cx="600" cy="100" r="18" fill="white" filter="url(#softShadow)" />
            <circle cx="600" cy="100" r="14" fill="#f0fdfa" />
            <rect x="592" y="96" width="16" height="3" rx="1" fill="#14b8a6" />
            <rect x="592" y="102" width="12" height="3" rx="1" fill="#cbd5e1" />
          </g>

          <g className={styles.noteNode2}>
            <circle cx="620" cy="160" r="16" fill="white" filter="url(#softShadow)" />
            <circle cx="620" cy="160" r="12" fill="#faf5ff" />
            <rect x="612" y="156" width="16" height="3" rx="1" fill="#8b5cf6" />
            <rect x="612" y="162" width="10" height="3" rx="1" fill="#cbd5e1" />
          </g>

          <g className={styles.noteNode3}>
            <circle cx="580" cy="200" r="20" fill="white" filter="url(#softShadow)" />
            <circle cx="580" cy="200" r="16" fill="#fff7ed" />
            <rect x="570" y="195" width="20" height="3" rx="1" fill="#f97316" />
            <rect x="570" y="201" width="14" height="3" rx="1" fill="#cbd5e1" />
          </g>

          <g className={styles.noteNode4}>
            <circle cx="540" cy="260" r="14" fill="white" filter="url(#softShadow)" />
            <circle cx="540" cy="260" r="10" fill="#f0fdfa" />
            <rect x="534" y="258" width="12" height="2" rx="1" fill="#14b8a6" />
          </g>

          <g className={styles.noteNode5}>
            <circle cx="660" cy="220" r="16" fill="white" filter="url(#softShadow)" />
            <circle cx="660" cy="220" r="12" fill="#f0fdfa" />
            <rect x="652" y="216" width="16" height="3" rx="1" fill="#14b8a6" />
            <rect x="652" y="222" width="10" height="3" rx="1" fill="#cbd5e1" />
          </g>

          <g className={styles.noteNode6}>
            <circle cx="700" cy="140" r="12" fill="white" filter="url(#softShadow)" />
            <circle cx="700" cy="140" r="8" fill="#faf5ff" />
            <rect x="694" y="138" width="12" height="2" rx="1" fill="#8b5cf6" />
          </g>

          <g className={styles.noteNode7}>
            <circle cx="720" cy="260" r="14" fill="white" filter="url(#softShadow)" />
            <circle cx="720" cy="260" r="10" fill="#fff7ed" />
            <rect x="714" y="258" width="12" height="2" rx="1" fill="#f97316" />
          </g>
        </g>
      </svg>
    </div>
  );
}
