const fs = require('fs');
const file = 'apps/bao-website/src/client/components/InnerPagesViews.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Projects List: /projects
const oldProjectsList = `  return (
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

const newProjectsList = `  return (
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

if (content.includes(oldProjectsList)) {
  content = content.replace(oldProjectsList, newProjectsList);
  content = content.replace(
    `        <SectionSeparator label="Institutional Donors & Partners Supporting Projects" />\n      </div>\n    );\n  }`,
    `        <SectionSeparator label="Institutional Donors & Partners Supporting Projects" />\n    </StandardPageTemplate>\n  );\n  }`
  );
  console.log('Projects list updated');
}

// 2. Project Detail: /projects/:slug
const oldProjDetailStart = `        {/* Project Hero Banner */}
        <section className="bg-[#E6A500] text-black p-8 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3.5 py-1.5 bg-white text-black font-extrabold uppercase text-[15px]">
                Project Status: {projStatus}
              </span>
              <span className="px-3.5 py-1.5 bg-white text-black font-bold text-[15px] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-black" /> {projLocation}
              </span>
            </div>
            <h1 className="text-[38px] sm:text-[48px] font-extrabold text-black leading-tight">
              {tr?.title}
            </h1>
            <p className="text-[20px] text-black font-medium leading-relaxed">
              {tr?.summary || tr?.short_description}
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

const newProjDetailStart = `        <StandardPageTemplate
          pageTitle={tr?.title || 'Babawatoto Project'}
          pageBadge={\`Project Status: \${projStatus}\`}
          heroImage={imgUrl}
          leadTitle="Field Implementation & Community Impact Strategy"
          leadDescription={tr?.summary || tr?.short_description || 'Babawatoto Centre executes community-centred initiatives delivering measurable child protection, non-formal education, and livelihoods.'}
          charLimit={340}
          siteData={siteData}
          navigate={navigate}
        >`;

if (content.includes(oldProjDetailStart)) {
  content = content.replace(oldProjDetailStart, newProjDetailStart);
  content = content.replace(
    `          navigate={navigate}\n        />\n      </div>\n    );`,
    `          navigate={navigate}\n        />\n      </StandardPageTemplate>\n    );`
  );
  console.log('Project detail updated');
}

// 3. Resources View Gallery
const oldGalleryPattern = /if \(activeSub === 'gallery'\) \{\s*return \(\s*<div className="max-w-7xl mx-auto px-4 py-12 space-y-14">\s*<section className="bg-\[#E6A500\] text-black p-8 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">[\s\S]*?<\/section>/;

const newGalleryHeader = `if (activeSub === 'gallery') {
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

if (oldGalleryPattern.test(content)) {
  content = content.replace(oldGalleryPattern, newGalleryHeader);
  content = content.replace(
    `              <div className="p-5 space-y-2">\n                <h3 className="text-[21px] font-extrabold text-black">{vid.title}</h3>\n                <p className="text-[18px] text-black leading-relaxed">{vid.desc}</p>\n              </div>\n            </div>\n          ))}\n        </section>\n      </div>\n    );`,
    `              <div className="p-5 space-y-2">\n                <h3 className="text-[21px] font-extrabold text-black">{vid.title}</h3>\n                <p className="text-[18px] text-black leading-relaxed">{vid.desc}</p>\n              </div>\n            </div>\n          ))}\n        </section>\n      </StandardPageTemplate>\n    );`
  );
  console.log('Gallery section updated');
}

// 4. Resources Documentation
const oldDocPattern = /if \(activeSub === 'documentation'\) \{\s*return \(\s*<div className="max-w-7xl mx-auto px-4 py-12 space-y-14">\s*<section className="bg-\[#E6A500\] text-black p-8 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">[\s\S]*?<\/section>/;

const newDocHeader = `if (activeSub === 'documentation') {
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

if (oldDocPattern.test(content)) {
  content = content.replace(oldDocPattern, newDocHeader);
  content = content.replace(
    `<DynamicCmsPageBlocks pageKey="resources-documentation" lang={lang} siteData={siteData} />\n      </div>\n    );`,
    `<DynamicCmsPageBlocks pageKey="resources-documentation" lang={lang} siteData={siteData} />\n      </StandardPageTemplate>\n    );`
  );
  console.log('Documentation updated');
}

// 5. Resources Policies
const oldPolPattern = /if \(activeSub === 'policies-and-guidelines'\) \{\s*return \(\s*<div className="max-w-7xl mx-auto px-4 py-12 space-y-14">\s*<section className="bg-\[#E6A500\] text-black p-8 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">[\s\S]*?<\/section>/;

const newPolHeader = `if (activeSub === 'policies-and-guidelines') {
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

if (oldPolPattern.test(content)) {
  content = content.replace(oldPolPattern, newPolHeader);
  content = content.replace(
    `<DynamicCmsPageBlocks pageKey="resources-policies-and-guidelines" lang={lang} siteData={siteData} />\n      </div>\n    );`,
    `<DynamicCmsPageBlocks pageKey="resources-policies-and-guidelines" lang={lang} siteData={siteData} />\n      </StandardPageTemplate>\n    );`
  );
  console.log('Policies updated');
}

// 6. Resources Publications
const oldPubPattern = /\/\/ 4\. STANDALONE PAGE: \/resources\/publications[\s\S]*?<section className="bg-\[#E6A500\] text-black p-8 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">[\s\S]*?<\/section>/;

const newPubHeader = `// 4. STANDALONE PAGE: /resources/publications (Publications)
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

if (oldPubPattern.test(content)) {
  content = content.replace(oldPubPattern, newPubHeader);
  content = content.replace(
    `<DynamicCmsPageBlocks pageKey="resources-publications" lang={lang} siteData={siteData} />\n    </div>\n  );\n}`,
    `<DynamicCmsPageBlocks pageKey="resources-publications" lang={lang} siteData={siteData} />\n    </StandardPageTemplate>\n  );\n}`
  );
  console.log('Publications updated');
}

fs.writeFileSync(file, content, 'utf8');
console.log('All inner pages converted to StandardPageTemplate.');

