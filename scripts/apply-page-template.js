const fs = require('fs');
const file = 'apps/bao-website/src/client/components/InnerPagesViews.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. /about/about-street-children
const target1 = `  // 1. STANDALONE PAGE: /about/about-street-children
  if (pageSlug === 'about-street-children') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-14">
        {/* Page Hero Banner */}
        <section className="bg-[#E6A500] text-black p-8 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="px-3.5 py-1.5 bg-white text-black font-extrabold uppercase tracking-wider text-[15px] inline-block">
              Who We Are · Child Rights & Protection
            </span>
            <h1 className="text-[38px] sm:text-[48px] font-extrabold text-black leading-tight">
              About Street-Connected Children in Tanzania
            </h1>
            <p className="text-[20px] text-black font-medium leading-relaxed">
              Understanding the realities, inherent dignity, legal rights, and extraordinary
              resilience of children and youth living and working on the streets.
            </p>
          </div>
          <div className="lg:col-span-5">
            <img
              src="/media/public/images/organization/abouts.webp"
              alt="Children participating in Babawatoto session"
              className="w-full h-80 object-cover border-4 border-white shadow-lg"
            />
          </div>
        </section>`;

const repl1 = `  // 1. STANDALONE PAGE: /about/about-street-children
  if (pageSlug === 'about-street-children') {
    return (
      <StandardPageTemplate
        pageTitle="About Street-Connected Children"
        pageBadge="Child Rights & Protection"
        heroImage="/media/public/images/organization/abouts.webp"
        leadTitle="Understanding Realities, Rights & Potential of Children on the Streets"
        leadDescription="Street-connected children and youth in Tanzania are children for whom the street has become a central reference point—whether for daily survival, temporary shelter, or informal livelihood. At Babawatoto Centre for Children and Youth Trust (BAO), we recognize that every street-connected child possesses inherent human dignity and full legal rights under Tanzania’s Law of the Child Act (2009) and the UN Convention on the Rights of the Child. Rather than viewing street-connected children as passive victims, BAO’s social workers, educators, and creative arts mentors meet children where they are—providing daily street outreach, trauma-informed psychosocial counselling, safe family tracing, and accelerated catch-up education."
        charLimit={340}
        siteData={siteData}
        navigate={navigate}
      >`;

const close1 = `        <DynamicCmsPageBlocks pageKey="about-street-children" lang={lang} siteData={siteData} />
      </div>
    );
  }`;

const closeRepl1 = `        <DynamicCmsPageBlocks pageKey="about-street-children" lang={lang} siteData={siteData} />
      </StandardPageTemplate>
    );
  }`;

if (content.includes(target1)) {
  content = content.replace(target1, repl1);
  content = content.replace(close1, closeRepl1);
  console.log('Page 1 replaced');
} else {
  console.log('Target 1 not found');
}

// 2. /about/growing-up-on-the-streets
const target2 = `  // 2. STANDALONE PAGE: /about/growing-up-on-the-streets
  if (pageSlug === 'growing-up-on-the-streets') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-14">
        <section className="bg-[#E6A500] text-black p-8 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="px-3.5 py-1.5 bg-white text-black font-extrabold uppercase tracking-wider text-[15px] inline-block">
              Who We Are · Realities & Pathways to Reintegration
            </span>
            <h1 className="text-[38px] sm:text-[48px] font-extrabold text-black leading-tight">
              Growing Up on the Streets
            </h1>
            <p className="text-[20px] text-black font-medium leading-relaxed">
              Addressing the compounding risks faced by street-connected youth and creating
              sustainable pathways back to family, education, and decent livelihoods.
            </p>
          </div>
          <div className="lg:col-span-5">
            <img
              src="/media/public/images/programmes/Youth discussion.JPG"
              alt="Growing up on the streets dialogue"
              className="w-full h-80 object-cover border-4 border-white shadow-lg"
            />
          </div>
        </section>`;

const repl2 = `  // 2. STANDALONE PAGE: /about/growing-up-on-the-streets
  if (pageSlug === 'growing-up-on-the-streets') {
    return (
      <StandardPageTemplate
        pageTitle="Growing Up on the Streets"
        pageBadge="Youth Empowerment & Livelihoods"
        heroImage="/media/public/images/programmes/Youth discussion.JPG"
        leadTitle="Addressing Compounding Risks and Creating Sustainable Pathways Off the Streets"
        leadDescription="Growing up on the streets presents immense physical, emotional, and social hurdles for young people across Tanzania. In urban Dar es Salaam, youth navigate severe vulnerability, informal hazardous labour, substance exposure, and social stigma. Babawatoto Organization provides comprehensive safe-space rehabilitation, trauma therapy, and accelerated MEMKWA education. When provided with safe shelter, continuous mentorship, and vocational pathways, Tanzanian youth demonstrate remarkable capability as artisans, performers, entrepreneurs, and peer leaders who actively transform their home communities."
        charLimit={340}
        siteData={siteData}
        navigate={navigate}
      >`;

const close2 = `        <DynamicCmsPageBlocks pageKey="growing-up-on-the-streets" lang={lang} siteData={siteData} />
      </div>
    );
  }`;

const closeRepl2 = `        <DynamicCmsPageBlocks pageKey="growing-up-on-the-streets" lang={lang} siteData={siteData} />
      </StandardPageTemplate>
    );
  }`;

if (content.includes(target2)) {
  content = content.replace(target2, repl2);
  content = content.replace(close2, closeRepl2);
  console.log('Page 2 replaced');
} else {
  console.log('Target 2 not found');
}

// 3. /about/our-team
const target3 = `  // 3. STANDALONE PAGE: /about/our-team (Meet the Team)
  if (pageSlug === 'our-team') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-14">
        <section className="bg-[#E6A500] text-black p-8 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="px-3.5 py-1.5 bg-white text-black font-extrabold uppercase tracking-wider text-[15px] inline-block">
              Who We Are · Leadership & Practitioners
            </span>
            <h1 className="text-[38px] sm:text-[48px] font-extrabold text-black leading-tight">
              Meet the Babawatoto Team
            </h1>
            <p className="text-[20px] text-black font-medium leading-relaxed">
              Multidisciplinary social workers, accredited MEMKWA educators, professional creative
              arts facilitators, and safeguarding champions.
            </p>
          </div>
          <div className="lg:col-span-5">
            <img
              src="/media/public/images/staff/mgunga.webp"
              alt="Babawatoto Leadership"
              className="w-full h-80 object-cover border-4 border-white shadow-lg"
            />
          </div>
        </section>`;

const repl3 = `  // 3. STANDALONE PAGE: /about/our-team (Meet the Team)
  if (pageSlug === 'our-team') {
    return (
      <StandardPageTemplate
        pageTitle="Meet the Babawatoto Team"
        pageBadge="Leadership & Practitioners"
        heroImage="/media/public/images/staff/mgunga.webp"
        leadTitle="Multidisciplinary Social Workers, Educators, Artists and Safeguarding Champions"
        leadDescription="Behind every reunified family, every child returning to school, and every youth starting a sustainable livelihood stands a committed team of Tanzanian social workers, teachers, master craftspeople, and creative artists. Babawatoto Organization is led by seasoned practitioners with deep roots in community child protection, performing arts therapy, and rights-based advocacy across Dar es Salaam. Our frontline personnel work closely with municipal social welfare offices, local government authorities, and community health desks to uphold strict safeguarding standards."
        charLimit={340}
        siteData={siteData}
        navigate={navigate}
      >`;

const close3 = `        <DynamicCmsPageBlocks pageKey="about-our-team" lang={lang} siteData={siteData} />
      </div>
    );
  }`;

const closeRepl3 = `        <DynamicCmsPageBlocks pageKey="about-our-team" lang={lang} siteData={siteData} />
      </StandardPageTemplate>
    );
  }`;

if (content.includes(target3)) {
  content = content.replace(target3, repl3);
  content = content.replace(close3, closeRepl3);
  console.log('Page 3 replaced');
} else {
  console.log('Target 3 not found');
}

// 4. Standalone Pages for other /about/* routes (who-we-are, mission-and-vision, our-history, leadership-and-governance)
const target4 = `  // 4. STANDALONE PAGES FOR OTHER /about/* ROUTES (who-we-are, mission-and-vision, our-history, leadership-and-governance)
  const whoWeAre = siteData.settings?.who_we_are_section || {};
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-14">
      <section className="bg-[#E6A500] text-black p-8 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-5">
          <span className="px-3.5 py-1.5 bg-white text-black font-extrabold uppercase tracking-wider text-[15px] inline-block">
            {lang === 'sw'
              ? whoWeAre.badge_sw || whoWeAre.badge_en || dict.nav.aboutUs
              : whoWeAre.badge_en || org.about_badge || dict.nav.aboutUs}
          </span>
          <h1 className="text-[38px] sm:text-[48px] font-extrabold text-black leading-tight">
            {pageSlug === 'mission-and-vision'
              ? 'Our Mission, Vision & Core Values'
              : pageSlug === 'our-history'
              ? 'Our History & Grassroots Journey Since 2007'
              : pageSlug === 'leadership-and-governance'
              ? 'Leadership, Governance & Safeguarding Accountability'
              : lang === 'sw'
              ? whoWeAre.title_sw || whoWeAre.title_en || org.full_name || org.legal_name || ''
              : whoWeAre.title_en || org.full_name || org.legal_name || ''}
          </h1>
          <p className="text-[20px] text-black font-medium leading-relaxed">
            {lang === 'sw'
              ? whoWeAre.summary_sw || whoWeAre.summary_en || org.about_summary || ''
              : whoWeAre.summary_en || org.about_summary || ''}
          </p>
        </div>
        <div className="lg:col-span-5">
          <img
            src="/media/public/images/organization/hero1.webp"
            alt="Babawatoto Organization"
            className="w-full h-80 object-cover border-4 border-white shadow-lg"
          />
        </div>
      </section>`;

const repl4 = `  // 4. STANDALONE PAGES FOR OTHER /about/* ROUTES (who-we-are, mission-and-vision, our-history, leadership-and-governance)
  const whoWeAre = siteData.settings?.who_we_are_section || {};
  const currentTitle = pageSlug === 'mission-and-vision'
    ? 'Our Mission, Vision & Core Values'
    : pageSlug === 'our-history'
    ? 'Our History & Grassroots Journey Since 2007'
    : pageSlug === 'leadership-and-governance'
    ? 'Leadership, Governance & Safeguarding Accountability'
    : whoWeAre.title_en || org.full_name || 'Who We Are';

  const currentBadge = whoWeAre.badge_en || org.about_badge || 'Babawatoto Organization';
  const currentSummary = whoWeAre.summary_en || org.about_summary || 'Founded in 2007 in Mburahati Barafu, Dar es Salaam, Babawatoto Organization works at the grassroots level to protect vulnerable children, reunite street-connected youth with families, and build resilient communities across Tanzania.';

  return (
    <StandardPageTemplate
      pageTitle={currentTitle}
      pageBadge={currentBadge}
      heroImage="/media/public/images/organization/hero1.webp"
      leadTitle="Institutional Mandate, Vision & Safeguarding Accountability"
      leadDescription={currentSummary}
      charLimit={340}
      siteData={siteData}
      navigate={navigate}
    >`;

const close4 = `      <DynamicCmsPageBlocks pageKey={\`about-\${pageSlug}\`} lang={lang} siteData={siteData} />
    </div>
  );
}`;

const closeRepl4 = `      <DynamicCmsPageBlocks pageKey={\`about-\${pageSlug}\`} lang={lang} siteData={siteData} />
    </StandardPageTemplate>
  );
}`;

if (content.includes(target4)) {
  content = content.replace(target4, repl4);
  content = content.replace(close4, closeRepl4);
  console.log('Page 4 replaced');
} else {
  console.log('Target 4 not found');
}

// 5. News & Events View (/news-events)
const targetNews = `export function NewsAndEventsView({ lang, siteData }: { lang: LanguageCode; siteData: any }) {
  const dict = UI_TRANSLATIONS[lang];
  const news = siteData.news || [];
  const events = siteData.events || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-14">
      <section className="bg-[#E6A500] text-black p-8 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-5">
          <span className="px-3.5 py-1.5 bg-white text-black font-extrabold uppercase tracking-wider text-[15px] inline-block">
            Who We Are · Field Updates & Community Events
          </span>
          <h1 className="text-[38px] sm:text-[48px] font-extrabold text-black leading-tight">
            {dict.nav.newsAndEvents}
          </h1>
          <p className="text-[20px] text-black font-medium leading-relaxed">
            Stay up to date with Babawatoto Organization field updates, advocacy campaigns,
            cultural performances, and community forums across Tanzania.
          </p>
        </div>
        <div className="lg:col-span-5">
          <img
            src="/media/public/images/programmes/arts1.webp"
            alt="Babawatoto News and Events"
            className="w-full h-80 object-cover border-4 border-white shadow-lg"
          />
        </div>
      </section>`;

const replNews = `export function NewsAndEventsView({ lang, siteData, navigate }: { lang: LanguageCode; siteData: any; navigate?: (path: string) => void }) {
  const dict = UI_TRANSLATIONS[lang];
  const news = siteData.news || [];
  const events = siteData.events || [];

  return (
    <StandardPageTemplate
      pageTitle="News & Community Updates"
      pageBadge="Field Updates & Public Announcements"
      heroImage="/media/public/images/programmes/arts1.webp"
      leadTitle="Stay Informed with Grassroots Milestones and Multi-Sectoral Events"
      leadDescription="Stay up to date with Babawatoto Organization field updates, advocacy campaigns, cultural performances, and community forums across Tanzania. Our social workers, educators, and creative arts mentors regularly document breakthrough interventions, partner dialogues, and child rights advocacy across Dar es Salaam."
      charLimit={340}
      siteData={siteData}
      navigate={navigate}
    >`;

const closeNews = `      {/* Commemorative News & Events Section */}
      <SectionSeparator label="Commemorative Milestone & Community Action" />
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border-2 border-[#E6A500] p-8 lg:p-12">
        <div className="lg:col-span-7 space-y-4">
          <span className="px-3 py-1 bg-[#E6A500] text-black font-extrabold uppercase text-[15px] inline-block">
            Milestones in the Community
          </span>
          <h3 className="text-[30px] font-extrabold text-black">
            Sharing Progress, Advocating for Child Rights Across Tanzania
          </h3>
          <p className="text-[18px] text-black leading-relaxed">
            Our news dispatches and community gatherings serve to commemorate key milestones in Tanzanian child
            welfare — from street outreach dialogues and cultural arts showcases to high-level multi-sectoral forums
            with local government and civil society leaders.
          </p>
          <p className="text-[18px] text-black leading-relaxed">
            Each event reflects our community-first methodology: engaging children and caregivers as active agents
            of sustainable progress rather than passive beneficiaries.
          </p>
        </div>
        <div className="lg:col-span-5">
          <figure className="border-4 border-white shadow-xl overflow-hidden bg-[#F2F2F2]">
            <img
              src="/media/public/images/programmes/arts1.webp"
              alt="Commemorative Event"
              className="w-full h-80 object-cover"
            />
            <figcaption className="p-3 bg-white text-xs font-semibold text-black/75">
              Community cultural performance and public advocacy gathering in Dar es Salaam.
            </figcaption>
          </figure>
        </div>
      </section>
    </div>
  );
}`;

const closeReplNews = `      {/* Commemorative News & Events Section */}
      <SectionSeparator label="Commemorative Milestone & Community Action" />
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border-2 border-[#E6A500] p-8 lg:p-12">
        <div className="lg:col-span-7 space-y-4">
          <span className="px-3 py-1 bg-[#E6A500] text-black font-extrabold uppercase text-[15px] inline-block">
            Milestones in the Community
          </span>
          <h3 className="text-[30px] font-extrabold text-black">
            Sharing Progress, Advocating for Child Rights Across Tanzania
          </h3>
          <p className="text-[18px] text-black leading-relaxed">
            Our news dispatches and community gatherings serve to commemorate key milestones in Tanzanian child
            welfare — from street outreach dialogues and cultural arts showcases to high-level multi-sectoral forums
            with local government and civil society leaders.
          </p>
          <p className="text-[18px] text-black leading-relaxed">
            Each event reflects our community-first methodology: engaging children and caregivers as active agents
            of sustainable progress rather than passive beneficiaries.
          </p>
        </div>
        <div className="lg:col-span-5">
          <figure className="border-4 border-white shadow-xl overflow-hidden bg-[#F2F2F2]">
            <img
              src="/media/public/images/programmes/arts1.webp"
              alt="Commemorative Event"
              className="w-full h-80 object-cover"
            />
            <figcaption className="p-3 bg-white text-xs font-semibold text-black/75">
              Community cultural performance and public advocacy gathering in Dar es Salaam.
            </figcaption>
          </figure>
        </div>
      </section>
    </StandardPageTemplate>
  );
}`;

if (content.includes(targetNews)) {
  content = content.replace(targetNews, replNews);
  content = content.replace(closeNews, closeReplNews);
  console.log('News & Events replaced');
} else {
  console.log('Target News not found');
}

// 6. Contact View (/contact)
const targetContact = `export function ContactView({ lang, siteData }: { lang: LanguageCode; siteData: any }) {
  const dict = UI_TRANSLATIONS[lang];
  const contact = siteData.settings?.contact_details || {};
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ text: string; isErr?: boolean } | null>(null);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone,
          subject,
          message,
          honeypot: '',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');
      setStatusMsg({ text: data.message });
      setFullName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setStatusMsg({ text: err.message, isErr: true });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-14">
      <section className="bg-[#E6A500] text-black p-8 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-5">
          <span className="px-3.5 py-1.5 bg-white text-black font-extrabold uppercase tracking-wider text-[15px] inline-block">
            Dar es Salaam Headquarters
          </span>
          <h1 className="text-[38px] sm:text-[48px] font-extrabold text-black leading-tight">
            {dict.nav.contactUs}
          </h1>
          <p className="text-[20px] text-black font-medium leading-relaxed">
            Connect with our head office in Mburahati Barafu, Dar es Salaam for programme
            partnerships, donor inquiries, child safeguarding referrals, or community visits.
          </p>
        </div>
        <div className="lg:col-span-5">
          <img
            src="/media/public/images/organization/cover.jpg"
            alt="Contact Babawatoto Organization"
            className="w-full h-72 object-cover border-4 border-white shadow-lg"
          />
        </div>
      </section>`;

const replContact = `export function ContactView({ lang, siteData, navigate }: { lang: LanguageCode; siteData: any; navigate?: (path: string) => void }) {
  const dict = UI_TRANSLATIONS[lang];
  const contact = siteData.settings?.contact_details || {};
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ text: string; isErr?: boolean } | null>(null);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone,
          subject,
          message,
          honeypot: '',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');
      setStatusMsg({ text: data.message });
      setFullName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setStatusMsg({ text: err.message, isErr: true });
    }
  };

  return (
    <StandardPageTemplate
      pageTitle="Contact Babawatoto"
      pageBadge="Headquarters & Community Inquiries"
      heroImage="/media/public/images/organization/cover.jpg"
      leadTitle="Connect with Our Head Office in Mburahati Barafu, Dar es Salaam"
      leadDescription="Connect with our head office in Mburahati Barafu, Dar es Salaam for programme partnerships, donor inquiries, child safeguarding referrals, or community visits. Babawatoto Organization welcomes all stakeholders committed to advancing the welfare, protection, and rights of Tanzanian children and vulnerable youth."
      charLimit={340}
      siteData={siteData}
      navigate={navigate}
    >`;

const closeContact = `      {/* Commemorative Contact Section */}
      <SectionSeparator label="Commemorative Partnership & Community Open Door" />
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border-2 border-[#E6A500] p-8 lg:p-12">
        <div className="lg:col-span-7 space-y-4">
          <span className="px-3 py-1 bg-[#E6A500] text-black font-extrabold uppercase text-[15px] inline-block">
            Our Open Door Policy
          </span>
          <h3 className="text-[30px] font-extrabold text-black">
            Welcoming Partners, Donors, and Advocates for Tanzanian Children
          </h3>
          <p className="text-[18px] text-black leading-relaxed">
            Since opening our doors in Mburahati, Babawatoto Centre for Children and Youth Trust has welcomed
            community members, international partners, and government agencies to witness first-hand our
            grassroots rehabilitation and creative education model.
          </p>
          <p className="text-[18px] text-black leading-relaxed">
            We commemorate the enduring trust and goodwill shared with our neighbours, local leaders, and global
            supporters who join hands to ensure no child is left behind on the streets.
          </p>
        </div>
        <div className="lg:col-span-5">
          <figure className="border-4 border-white shadow-xl overflow-hidden bg-[#F2F2F2]">
            <img
              src="/media/public/images/organization/hero3.webp"
              alt="Babawatoto Centre Open Door"
              className="w-full h-80 object-cover"
            />
            <figcaption className="p-3 bg-white text-xs font-semibold text-black/75">
              Community outreach centre and welcoming space at Mburahati Barafu, Dar es Salaam.
            </figcaption>
          </figure>
        </div>
      </section>
    </div>
  );
}`;

const closeReplContact = `      {/* Commemorative Contact Section */}
      <SectionSeparator label="Commemorative Partnership & Community Open Door" />
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white border-2 border-[#E6A500] p-8 lg:p-12">
        <div className="lg:col-span-7 space-y-4">
          <span className="px-3 py-1 bg-[#E6A500] text-black font-extrabold uppercase text-[15px] inline-block">
            Our Open Door Policy
          </span>
          <h3 className="text-[30px] font-extrabold text-black">
            Welcoming Partners, Donors, and Advocates for Tanzanian Children
          </h3>
          <p className="text-[18px] text-black leading-relaxed">
            Since opening our doors in Mburahati, Babawatoto Centre for Children and Youth Trust has welcomed
            community members, international partners, and government agencies to witness first-hand our
            grassroots rehabilitation and creative education model.
          </p>
          <p className="text-[18px] text-black leading-relaxed">
            We commemorate the enduring trust and goodwill shared with our neighbours, local leaders, and global
            supporters who join hands to ensure no child is left behind on the streets.
          </p>
        </div>
        <div className="lg:col-span-5">
          <figure className="border-4 border-white shadow-xl overflow-hidden bg-[#F2F2F2]">
            <img
              src="/media/public/images/organization/hero3.webp"
              alt="Babawatoto Centre Open Door"
              className="w-full h-80 object-cover"
            />
            <figcaption className="p-3 bg-white text-xs font-semibold text-black/75">
              Community outreach centre and welcoming space at Mburahati Barafu, Dar es Salaam.
            </figcaption>
          </figure>
        </div>
      </section>
    </StandardPageTemplate>
  );
}`;

if (content.includes(targetContact)) {
  content = content.replace(targetContact, replContact);
  content = content.replace(closeContact, closeReplContact);
  console.log('Contact replaced');
} else {
  console.log('Target Contact not found');
}

fs.writeFileSync(file, content, 'utf8');
console.log('InnerPagesViews updated successfully');

