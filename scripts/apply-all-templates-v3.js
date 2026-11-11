const fs = require('fs');
const file = 'apps/bao-website/src/client/components/InnerPagesViews.tsx';
let content = fs.readFileSync(file, 'utf8');

// Documentation
content = content.replace(
  /\/\/ 2\. STANDALONE PAGE: \/resources\/documentation[\s\S]*?<section className="bg-\[#E6A500\][\s\S]*?<\/section>/,
  `// 2. STANDALONE PAGE: /resources/documentation
  if (activeSub === 'documentation') {
    return (
      <StandardPageTemplate
        pageTitle="Programme Documentation & Briefs"
        pageBadge="Resources · Operational Briefs"
        heroImage="/media/public/images/organization/hero2.webp"
        leadTitle="Standard Operating Procedures and Institutional Practice Manuals"
        leadDescription="Standard operating procedures, community facilitator guides, programme overviews, and institutional practice briefs. Babawatoto Organization maintains thorough, transparent documentation of all methodologies used in street work, psychosocial recovery, and non-formal education."
        charLimit={340}
        siteData={siteData}
        navigate={navigate}
      >`
);
content = content.replace(
  `<DynamicCmsPageBlocks pageKey="resources-documentation" lang={lang} siteData={siteData} />\n      </div>\n    );`,
  `<DynamicCmsPageBlocks pageKey="resources-documentation" lang={lang} siteData={siteData} />\n      </StandardPageTemplate>\n    );`
);

// Policies and Guidelines
content = content.replace(
  /\/\/ 3\. STANDALONE PAGE: \/resources\/policies-and-guidelines[\s\S]*?<section className="bg-\[#E6A500\][\s\S]*?<\/section>/,
  `// 3. STANDALONE PAGE: /resources/policies-and-guidelines
  if (activeSub === 'policies-and-guidelines') {
    return (
      <StandardPageTemplate
        pageTitle="Policies & Operational Guidelines"
        pageBadge="Resources · Governance & Safeguarding"
        heroImage="/media/public/images/organization/hero3.webp"
        leadTitle="Strict Safeguarding Standards and Ethical Codes of Conduct"
        leadDescription="Official safeguarding policies, ethical operating codes, data privacy guidelines, and whistleblowing mechanisms protecting children, youth, and staff. Babawatoto maintains a zero-tolerance policy against child abuse, exploitation, and discrimination across all operations."
        charLimit={340}
        siteData={siteData}
        navigate={navigate}
      >`
);
content = content.replace(
  `<DynamicCmsPageBlocks pageKey="resources-policies-and-guidelines" lang={lang} siteData={siteData} />\n      </div>\n    );`,
  `<DynamicCmsPageBlocks pageKey="resources-policies-and-guidelines" lang={lang} siteData={siteData} />\n      </StandardPageTemplate>\n    );`
);

// Projects List
content = content.replace(
  /export function ProjectsView[\s\S]*?if \(slug\) \{[\s\S]*?\}\s*return \(\s*<div className="max-w-7xl mx-auto px-4 py-12 space-y-14">\s*<section className="bg-\[#E6A500\][\s\S]*?<\/section>/,
  (m) => {
    return m.replace(/<div className="max-w-7xl mx-auto px-4 py-12 space-y-14">\s*<section className="bg-\[#E6A500\][\s\S]*?<\/section>/,
      `<StandardPageTemplate
      pageTitle={lang === 'en' ? 'What We Do: Projects & Field Initiatives' : 'Miradi Yetu Katika Jamii'}
      pageBadge={dict.nav.projects}
      heroImage="/media/public/images/projects/ahadi.webp"
      leadTitle="Targeted, Evidence-Based Field Initiatives Across Tanzania"
      leadDescription="Babawatoto Organization executes targeted, evidence-based field initiatives empowering vulnerable children, street-connected youth, young mothers, and at-risk households in Tanzania. Our projects integrate community child protection desks, catch-up primary education, creative arts psychosocial therapy, and youth micro-enterprise development across Dar es Salaam."
      charLimit={340}
      siteData={siteData}
      navigate={navigate}
    >`
    );
  }
);
content = content.replace(
  `        <SectionSeparator label="Institutional Donors & Partners Supporting Projects" />\n      </div>\n    );\n  }`,
  `        <SectionSeparator label="Institutional Donors & Partners Supporting Projects" />\n    </StandardPageTemplate>\n  );\n  }`
);

// Project Detail
content = content.replace(
  /if \(slug\) \{[\s\S]*?return \(\s*<div className="max-w-7xl mx-auto px-4 py-12 space-y-14">\s*{\/\* Project Hero Banner \*\/}\s*<section className="bg-\[#E6A500\][\s\S]*?<\/section>/,
  (m) => {
    return m.replace(/return \(\s*<div className="max-w-7xl mx-auto px-4 py-12 space-y-14">\s*{\/\* Project Hero Banner \*\/}\s*<section className="bg-\[#E6A500\][\s\S]*?<\/section>/,
      `return (
        <StandardPageTemplate
          pageTitle={tr?.title || 'Babawatoto Project'}
          pageBadge={\`Project Status: \${projStatus}\`}
          heroImage={imgUrl}
          leadTitle="Field Implementation & Community Impact Strategy"
          leadDescription={tr?.summary || tr?.short_description || 'Babawatoto Centre executes community-centred initiatives delivering measurable child protection, non-formal education, and livelihoods.'}
          charLimit={340}
          siteData={siteData}
          navigate={navigate}
        >`
    );
  }
);
content = content.replace(
  `          videoId="FgXXMyMLF9k"\n          videoTitle="BABAWATOTO FIELD PROJECT DOCUMENTARY SHOWCASE"\n          videoDescription="Watch how Babawatoto Organization's field projects engage children, youth, and communities across Tanzania."\n          navigate={navigate}\n        />\n      </div>\n    );`,
  `          videoId="FgXXMyMLF9k"\n          videoTitle="BABAWATOTO FIELD PROJECT DOCUMENTARY SHOWCASE"\n          videoDescription="Watch how Babawatoto Organization's field projects engage children, youth, and communities across Tanzania."\n          navigate={navigate}\n        />\n      </StandardPageTemplate>\n    );`
);

// ImpactView
content = content.replace(
  /export function ImpactView\(\{ lang, siteData \}: \{ lang: LanguageCode; siteData: any \}\) \{\s*const dict = UI_TRANSLATIONS\[lang\];\s*const indicators = siteData\.indicators \|\| \[\];\s*return \(\s*<div className="max-w-7xl mx-auto px-4 py-12 space-y-14">\s*<section className="bg-\[#E6A500\] text-black p-8 lg:p-14 space-y-4">[\s\S]*?<\/section>/,
  `export function ImpactView({ lang, siteData, navigate }: { lang: LanguageCode; siteData: any; navigate?: (path: string) => void }) {
  const dict = UI_TRANSLATIONS[lang];
  const indicators = siteData.indicators || [];

  return (
    <StandardPageTemplate
      pageTitle="Verified Reach, Outcomes & MEL Impact"
      pageBadge="Monitoring, Evaluation & Learning (MEL)"
      heroImage="/media/public/images/organization/hero1.webp"
      leadTitle="Rigorous MEL Accountability and Indicator Verification"
      leadDescription="Rigorous monitoring, evaluation, and learning (MEL) indicators verified across Child Protection, Catch-Up Education, Creative Arts, and Youth Livelihoods in Tanzania. Every data point is cross-verified with community registers, local government social welfare officers, and project logs."
      charLimit={340}
      siteData={siteData}
      navigate={navigate}
    >`
);
content = content.replace(
  `<SectionSeparator label="Impact Record Archives & Verifications" />\n      </div>\n    );\n}`,
  `<SectionSeparator label="Impact Record Archives & Verifications" />\n    </StandardPageTemplate>\n  );\n}`
);

// StoriesView
content = content.replace(
  /export function StoriesView\(\{ lang, siteData \}: \{ lang: LanguageCode; siteData: any \}\) \{\s*const dict = UI_TRANSLATIONS\[lang\];\s*const stories = siteData\.stories \|\| \[\];\s*return \(\s*<div className="max-w-7xl mx-auto px-4 py-12 space-y-14">\s*<section className="bg-\[#E6A500\] text-black p-8 lg:p-14 space-y-4">[\s\S]*?<\/section>/,
  `export function StoriesView({ lang, siteData, navigate }: { lang: LanguageCode; siteData: any; navigate?: (path: string) => void }) {
  const dict = UI_TRANSLATIONS[lang];
  const stories = siteData.stories || [];

  return (
    <StandardPageTemplate
      pageTitle="Stories of Transformation & Hope"
      pageBadge="Inspirational Journeys & Voices"
      heroImage="/media/public/images/organization/hero2.webp"
      leadTitle="Real Voices and Resilient Journeys from Street to Community"
      leadDescription="First-person narratives and verified case studies documenting journeys from street life to family reunification, school, and dignified self-reliance. Each story reflects personal courage and community support."
      charLimit={340}
      siteData={siteData}
      navigate={navigate}
    >`
);
content = content.replace(
  `<SectionSeparator label="Youth Reflection & Storytelling Circles" />\n      </div>\n    );\n}`,
  `<SectionSeparator label="Youth Reflection & Storytelling Circles" />\n    </StandardPageTemplate>\n  );\n}`
);

// GetInvolvedView
content = content.replace(
  /export function GetInvolvedView\(\{ lang, siteData \}: \{ lang: LanguageCode; siteData: any \}\) \{\s*const dict = UI_TRANSLATIONS\[lang\];[\s\S]*?return \(\s*<div className="max-w-7xl mx-auto px-4 py-12 space-y-14">\s*<div className="bg-\[#E6A500\] text-black p-8 lg:p-14 space-y-4">[\s\S]*?<\/div>/,
  (m) => {
    return m.replace(/return \(\s*<div className="max-w-7xl mx-auto px-4 py-12 space-y-14">\s*<div className="bg-\[#E6A500\] text-black p-8 lg:p-14 space-y-4">[\s\S]*?<\/div>/,
      `return (
    <StandardPageTemplate
      pageTitle="Partner With Us & Get Involved"
      pageBadge="Partnerships & Community Solidarity"
      heroImage="/media/public/images/organization/hero3.webp"
      leadTitle="Collaborative Action for Street-Connected Children and Youth"
      leadDescription="Partner with Babawatoto Centre for Children and Youth Trust to expand safe spaces, educational bursaries, creative arts therapy, and sustainable youth livelihoods in Tanzania. Whether as an institutional donor, foundation, volunteer mentor, or community advocate, your partnership creates lasting generational transformation."
      charLimit={340}
      siteData={siteData}
      navigate={navigate}
    >`
    );
  }
);
content = content.replace(
  `{/* Policy Note */}\n        <p className="text-[15px] text-black font-semibold">\n          All volunteers must complete mandatory background checks and sign Babawatoto's Child\n          Safeguarding & Protection Policy before interacting with children.\n        </p>\n      </div>\n    </div>\n  );\n}`,
  `{/* Policy Note */}\n        <p className="text-[15px] text-black font-semibold">\n          All volunteers must complete mandatory background checks and sign Babawatoto's Child\n          Safeguarding & Protection Policy before interacting with children.\n        </p>\n      </div>\n    </StandardPageTemplate>\n  );\n}`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully completed all inner pages.');

