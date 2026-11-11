const fs = require('fs');
const file = 'apps/bao-website/src/client/components/InnerPagesViews.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. ProjectsView list page
const targetProjectsList = `  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-14">
      <section className="bg-[#E6A500] text-black p-8 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-5">
          <span className="px-3.5 py-1.5 bg-white text-black font-extrabold uppercase tracking-wider text-[15px] inline-block">
            {dict.nav.projects}
          </span>
          <h1 className="text-[38px] sm:text-[48px] font-extrabold text-black leading-tight">
            {lang === 'en' ? 'What We Do: Projects & Field Initiatives' : 'Miradi Yetu Katika Jamii'}
          </h1>
          <p className="text-[20px] text-black font-medium leading-relaxed">
            Babawatoto Organization executes targeted, evidence-based field initiatives empowering
            vulnerable children, street-connected youth, young mothers, and at-risk households in
            Tanzania.
          </p>
        </div>
        <div className="lg:col-span-5">
          <img
            src="/media/public/images/projects/ahadi.webp"
            alt="Babawatoto Projects"
            className="w-full h-80 object-cover border-4 border-white shadow-lg"
          />
        </div>
      </section>`;

const replProjectsList = `  return (
    <StandardPageTemplate
      pageTitle={lang === 'en' ? 'What We Do: Projects & Field Initiatives' : 'Miradi Yetu Katika Jamii'}
      pageBadge={dict.nav.projects}
      heroImage="/media/public/images/projects/ahadi.webp"
      leadTitle="Targeted, Evidence-Based Field Initiatives Across Tanzania"
      leadDescription="Babawatoto Organization executes targeted, evidence-based field initiatives empowering vulnerable children, street-connected youth, young mothers, and at-risk households in Tanzania. Our projects integrate community child protection desks, catch-up primary education, creative arts psychosocial therapy, and youth micro-enterprise development across Dar es Salaam."
      charLimit={340}
      siteData={siteData}
      navigate={navigate}
    >`;

// 2. Individual Project Page (/projects/:slug)
const targetProjectDetail = `        {/* Project Hero Banner */}
        <section className="bg-[#E6A500] text-black p-8 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-white text-black font-extrabold uppercase tracking-wider text-[15px]">
                {proj?.category || 'Community Project'}
              </span>
              <span className="px-3 py-1 bg-white/90 text-black font-bold uppercase text-[15px]">
                {projStatus}
              </span>
            </div>
            <h1 className="text-[38px] sm:text-[48px] font-extrabold text-black leading-tight">
              {tr?.title || defaultPriority?.title_en || 'Babawatoto Project'}
            </h1>
            <p className="text-[20px] text-black font-medium leading-relaxed">
              {tr?.summary ||
                tr?.short_description ||
                defaultPriority?.short_description_en ||
                ''}
            </p>
          </div>
          <div className="lg:col-span-5">
            <img
              src={imgUrl}
              alt={tr?.title}
              className="w-full h-80 object-cover border-4 border-white shadow-lg"
            />
          </div>
        </section>`;

const replProjectDetail = `        {/* Standard Page Template with Floating Title */}
        <StandardPageTemplate
          pageTitle={tr?.title || defaultPriority?.title_en || 'Babawatoto Project'}
          pageBadge={proj?.category || 'Community Project'}
          heroImage={imgUrl}
          leadTitle="Field Implementation & Community Impact Strategy"
          leadDescription={tr?.summary || tr?.short_description || defaultPriority?.short_description_en || 'Babawatoto Centre executes community-centred initiatives delivering measurable child protection and livelihoods.'}
          charLimit={340}
          siteData={siteData}
          navigate={navigate}
        >`;

// 3. Resources View Gallery (/resources/gallery)
const targetGallery = `  // 1. STANDALONE PAGE: /resources/gallery (Our Gallery)
  if (activeSub === 'gallery') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-14">
        <section className="bg-[#E6A500] text-black p-8 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="px-3.5 py-1.5 bg-white text-black font-extrabold uppercase tracking-wider text-[15px] inline-block">
              Resources · Visual Archive
            </span>
            <h1 className="text-[38px] sm:text-[48px] font-extrabold text-black leading-tight">
              Our Field Photo & Video Gallery
            </h1>
            <p className="text-[20px] text-black font-medium leading-relaxed">
              Verified field photographs and documentary videos across Child Protection, MEMKWA
              Education, HEART Creative Arts, and Youth Livelihoods in Dar es Salaam.
            </p>
          </div>
          <div className="lg:col-span-5">
            <img
              src="/media/public/images/programmes/arts1.webp"
              alt="Babawatoto Visual Gallery"
              className="w-full h-80 object-cover border-4 border-white shadow-lg"
            />
          </div>
        </section>`;

const replGallery = `  // 1. STANDALONE PAGE: /resources/gallery (Our Gallery)
  if (activeSub === 'gallery') {
    return (
      <StandardPageTemplate
        pageTitle="Field Photo & Video Gallery"
        pageBadge="Resources · Visual Archive"
        heroImage="/media/public/images/programmes/arts1.webp"
        leadTitle="Verified Field Photography and Visual Archives Across Tanzania"
        leadDescription="Verified field photographs and documentary videos across Child Protection, MEMKWA Education, HEART Creative Arts, and Youth Livelihoods in Dar es Salaam. Every image reflects our strict safeguarding consent policy and captures authentic moments of youth and community empowerment."
        charLimit={340}
        siteData={siteData}
        navigate={navigate}
      >`;

// 4. Resources Documentation (/resources/documentation)
const targetDoc = `  // 2. STANDALONE PAGE: /resources/documentation (Documentation)
  if (activeSub === 'documentation') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-14">
        <section className="bg-[#E6A500] text-black p-8 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="px-3.5 py-1.5 bg-white text-black font-extrabold uppercase tracking-wider text-[15px] inline-block">
              Resources · Operational Briefs
            </span>
            <h1 className="text-[38px] sm:text-[48px] font-extrabold text-black leading-tight">
              Programme Documentation & Briefs
            </h1>
            <p className="text-[20px] text-black font-medium leading-relaxed">
              Standard operating procedures, community facilitator guides, programme overviews,
              and institutional practice briefs.
            </p>
          </div>
          <div className="lg:col-span-5">
            <img
              src="/media/public/images/organization/hero2.webp"
              alt="Documentation and Briefs"
              className="w-full h-80 object-cover border-4 border-white shadow-lg"
            />
          </div>
        </section>`;

const replDoc = `  // 2. STANDALONE PAGE: /resources/documentation (Documentation)
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
      >`;

// 5. Resources Policies (/resources/policies-and-guidelines)
const targetPolicy = `  // 3. STANDALONE PAGE: /resources/policies-and-guidelines (Policy and Guidelines)
  if (activeSub === 'policies-and-guidelines') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-14">
        <section className="bg-[#E6A500] text-black p-8 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="px-3.5 py-1.5 bg-white text-black font-extrabold uppercase tracking-wider text-[15px] inline-block">
              Resources · Governance & Safeguarding
            </span>
            <h1 className="text-[38px] sm:text-[48px] font-extrabold text-black leading-tight">
              Institutional Policies & Guidelines
            </h1>
            <p className="text-[20px] text-black font-medium leading-relaxed">
              Official safeguarding policies, ethical operating codes, data privacy guidelines, and
              whistleblowing mechanisms protecting children, youth, and staff.
            </p>
          </div>
          <div className="lg:col-span-5">
            <img
              src="/media/public/images/organization/hero3.webp"
              alt="Policies and Guidelines"
              className="w-full h-80 object-cover border-4 border-white shadow-lg"
            />
          </div>
        </section>`;

const replPolicy = `  // 3. STANDALONE PAGE: /resources/policies-and-guidelines (Policy and Guidelines)
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
      >`;

// 6. Resources Publications (/resources/publications)
const targetPub = `  // 4. STANDALONE PAGE: /resources/publications (Publications)
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-14">
      <section className="bg-[#E6A500] text-black p-8 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-5">
          <span className="px-3.5 py-1.5 bg-white text-black font-extrabold uppercase tracking-wider text-[15px] inline-block">
            Resources · Research & Reports
          </span>
          <h1 className="text-[38px] sm:text-[48px] font-extrabold text-black leading-tight">
            Publications, Reports & Studies
          </h1>
          <p className="text-[20px] text-black font-medium leading-relaxed">
            Annual reports, audited financial disclosures, thematic policy briefs, and academic
            research on street children in Tanzania.
          </p>
        </div>
        <div className="lg:col-span-5">
          <img
            src="/media/public/images/organization/abouts.webp"
            alt="Publications and Reports"
            className="w-full h-80 object-cover border-4 border-white shadow-lg"
          />
        </div>
      </section>`;

const replPub = `  // 4. STANDALONE PAGE: /resources/publications (Publications)
  return (
    <StandardPageTemplate
      pageTitle="Publications, Reports & Studies"
      pageBadge="Resources · Research & Reports"
      heroImage="/media/public/images/organization/abouts.webp"
      leadTitle="Audited Annual Disclosures, Thematic Studies and Research"
      leadDescription="Annual reports, audited financial disclosures, thematic policy briefs, and academic research on street children in Tanzania. Babawatoto publishes verified reports to promote transparency, evidence-based interventions, and cross-sectoral collaboration."
      charLimit={340}
      siteData={siteData}
      navigate={navigate}
    >`;

// Closures for Resources
const closeGallery = `        <SectionSeparator label="Official @babawatotoorganization Video Archive" />

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              id: 'pdx8DWYJM_o',
              title: 'BABAWATOTO ORGANIZATION CIRCUS PERFORMANCE!!!!',
              desc: 'Acrobatics and circus arts showcase by Babawatoto youth.',
            },
            {
              id: 'FgXXMyMLF9k',
              title: 'BABAWATOTO ORGANIZATION THEATER ARTS PERFORMANCE LIVE',
              desc: 'Community theatre for child protection and social behaviour change.',
            },
            {
              id: 'R09iiZAHiFs',
              title: 'BABAWATOTO ORGANIZATION LIVE PERFORMANCE',
              desc: 'Live cultural drumming, dance, and youth empowerment performance.',
            },
          ].map((vid) => (
            <div key={vid.id} className="bg-white border-2 border-[#E6A500] overflow-hidden">
              <div className="aspect-video bg-white">
                <iframe
                  src={\`https://www.youtube.com/embed/\${vid.id}?rel=0&enablejsapi=1\`}
                  title={vid.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
              <div className="p-5 space-y-2">
                <h3 className="text-[21px] font-extrabold text-black">{vid.title}</h3>
                <p className="text-[18px] text-black leading-relaxed">{vid.desc}</p>
              </div>
            </div>
          ))}
        </section>
      </div>
    );
  }`;

const closeReplGallery = `        <SectionSeparator label="Official @babawatotoorganization Video Archive" />

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              id: 'pdx8DWYJM_o',
              title: 'BABAWATOTO ORGANIZATION CIRCUS PERFORMANCE!!!!',
              desc: 'Acrobatics and circus arts showcase by Babawatoto youth.',
            },
            {
              id: 'FgXXMyMLF9k',
              title: 'BABAWATOTO ORGANIZATION THEATER ARTS PERFORMANCE LIVE',
              desc: 'Community theatre for child protection and social behaviour change.',
            },
            {
              id: 'R09iiZAHiFs',
              title: 'BABAWATOTO ORGANIZATION LIVE PERFORMANCE',
              desc: 'Live cultural drumming, dance, and youth empowerment performance.',
            },
          ].map((vid) => (
            <div key={vid.id} className="bg-white border-2 border-[#E6A500] overflow-hidden">
              <div className="aspect-video bg-white">
                <iframe
                  src={\`https://www.youtube.com/embed/\${vid.id}?rel=0&enablejsapi=1\`}
                  title={vid.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
              <div className="p-5 space-y-2">
                <h3 className="text-[21px] font-extrabold text-black">{vid.title}</h3>
                <p className="text-[18px] text-black leading-relaxed">{vid.desc}</p>
              </div>
            </div>
          ))}
        </section>
      </StandardPageTemplate>
    );
  }`;

if (content.includes(targetProjectsList)) {
  content = content.replace(targetProjectsList, replProjectsList);
  // replace end of projects list
  content = content.replace(
    `        <SectionSeparator label="Institutional Donors & Partners Supporting Projects" />
      </div>
    );
  }`,
    `        <SectionSeparator label="Institutional Donors & Partners Supporting Projects" />
    </StandardPageTemplate>
  );
}`
  );
  console.log('Projects list replaced');
}

if (content.includes(targetProjectDetail)) {
  content = content.replace(targetProjectDetail, replProjectDetail);
  content = content.replace(
    `          navigate={navigate}
        />
      </div>
    );
  }`,
    `          navigate={navigate}
        />
      </StandardPageTemplate>
    );
  }`
  );
  console.log('Project detail replaced');
}

if (content.includes(targetGallery)) {
  content = content.replace(targetGallery, replGallery);
  content = content.replace(closeGallery, closeReplGallery);
  console.log('Gallery replaced');
}

if (content.includes(targetDoc)) {
  content = content.replace(targetDoc, replDoc);
  content = content.replace(
    `        <DynamicCmsPageBlocks pageKey="resources-documentation" lang={lang} siteData={siteData} />
      </div>
    );
  }`,
    `        <DynamicCmsPageBlocks pageKey="resources-documentation" lang={lang} siteData={siteData} />
      </StandardPageTemplate>
    );
  }`
  );
  console.log('Documentation replaced');
}

if (content.includes(targetPolicy)) {
  content = content.replace(targetPolicy, replPolicy);
  content = content.replace(
    `        <DynamicCmsPageBlocks pageKey="resources-policies-and-guidelines" lang={lang} siteData={siteData} />
      </div>
    );
  }`,
    `        <DynamicCmsPageBlocks pageKey="resources-policies-and-guidelines" lang={lang} siteData={siteData} />
      </StandardPageTemplate>
    );
  }`
  );
  console.log('Policies replaced');
}

if (content.includes(targetPub)) {
  content = content.replace(targetPub, replPub);
  content = content.replace(
    `        <DynamicCmsPageBlocks pageKey="resources-publications" lang={lang} siteData={siteData} />
    </div>
  );
}`,
    `        <DynamicCmsPageBlocks pageKey="resources-publications" lang={lang} siteData={siteData} />
    </StandardPageTemplate>
  );
}`
  );
  console.log('Publications replaced');
}

fs.writeFileSync(file, content, 'utf8');
console.log('Finished updating additional inner pages.');

