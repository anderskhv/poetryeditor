import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { SEOHead } from '../components/SEOHead';
import './WhereToSharePage.css';

interface Resource {
  name: string;
  description: string;
  url: string;
  type: 'community' | 'workshop' | 'journal' | 'contest';
}

const COMMUNITIES: Resource[] = [
  {
    name: 'r/OCPoetry',
    description: 'Reddit\'s largest original poetry community. Requires giving feedback on two poems before posting your own — this forces close reading and builds reciprocity.',
    url: 'https://www.reddit.com/r/OCPoetry/',
    type: 'community',
  },
  {
    name: 'r/Poetry',
    description: 'For sharing and discussing published poetry. Good for finding readers and understanding what resonates with a general audience.',
    url: 'https://www.reddit.com/r/Poetry/',
    type: 'community',
  },
  {
    name: 'The Poetry Foundation',
    description: 'The largest poetry website in the world. Not a submission venue, but essential reading — their archives, articles, and podcast are an education in craft.',
    url: 'https://www.poetryfoundation.org/',
    type: 'community',
  },
  {
    name: 'AllPoetry',
    description: 'One of the most active online poetry communities. Good for volume feedback and building an audience, though quality of critique varies.',
    url: 'https://allpoetry.com/',
    type: 'community',
  },
];

const WORKSHOPS: Resource[] = [
  {
    name: 'Local open mic nights',
    description: 'Search "[your city] poetry open mic" to find live readings near you. Nothing teaches you about your poems like reading them aloud to strangers.',
    url: '',
    type: 'workshop',
  },
  {
    name: 'Hugo House (Seattle)',
    description: 'One of the leading literary centers in the US. Offers online and in-person workshops, many open nationally.',
    url: 'https://hugohouse.org/',
    type: 'workshop',
  },
  {
    name: 'The Poetry School (London)',
    description: 'High-quality online courses and workshops run by published poets. One of the best options for structured learning outside of an MFA.',
    url: 'https://poetryschool.com/',
    type: 'workshop',
  },
  {
    name: 'Poets & Writers workshops database',
    description: 'Searchable directory of writing conferences, residencies, and workshops. Filter by genre, location, and cost.',
    url: 'https://www.pw.org/conferences_and_residencies',
    type: 'workshop',
  },
];

const JOURNALS: Resource[] = [
  {
    name: 'Rattle',
    description: 'One of the most accessible literary journals for emerging poets. No reading fee, relatively fast response times, and they publish a wide range of styles.',
    url: 'https://www.rattle.com/',
    type: 'journal',
  },
  {
    name: 'The Sun Magazine',
    description: 'Publishes poetry alongside essays and fiction. Known for emotional honesty and accessible work. Pays for accepted pieces.',
    url: 'https://www.thesunmagazine.org/',
    type: 'journal',
  },
  {
    name: 'Poetry Magazine',
    description: 'The most prestigious poetry journal in the English language, published since 1912. Extremely competitive but worth aspiring to.',
    url: 'https://www.poetryfoundation.org/poetrymagazine',
    type: 'journal',
  },
  {
    name: 'Submittable',
    description: 'The standard platform for literary submissions. Most journals use it. Create an account and browse open calls — you\'ll find hundreds of venues.',
    url: 'https://www.submittable.com/',
    type: 'journal',
  },
  {
    name: 'Poets & Writers literary magazine database',
    description: 'Comprehensive, searchable database of literary magazines sorted by genre, payment, and selectivity.',
    url: 'https://www.pw.org/literary_magazines',
    type: 'journal',
  },
];

const CONTESTS: Resource[] = [
  {
    name: 'Winning Writers',
    description: 'Curated list of the best free poetry contests. Updated regularly. A good starting point before paying entry fees.',
    url: 'https://winningwriters.com/',
    type: 'contest',
  },
  {
    name: 'National Poetry Competition (UK)',
    description: 'One of the most prestigious single-poem contests in the world. Open internationally. Judged blind.',
    url: 'https://poetrysociety.org.uk/competition/',
    type: 'contest',
  },
];

function ResourceCard({ resource }: { resource: Resource }) {
  const inner = (
    <>
      <h4 className="resource-name">{resource.name}</h4>
      <p className="resource-description">{resource.description}</p>
    </>
  );

  if (resource.url) {
    return (
      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="resource-card">
        {inner}
        <span className="resource-external">↗</span>
      </a>
    );
  }

  return <div className="resource-card no-link">{inner}</div>;
}

export function WhereToSharePage() {
  return (
    <Layout>
      <SEOHead
        title="Where to Share Your Poetry - Poetry Editor"
        description="Communities, workshops, literary journals, and contests for poets ready to share their work. From Reddit to prestigious literary magazines."
        canonicalPath="/where-to-share"
      />
      <div className="where-to-share-page">
        <header className="share-header">
          <h1>Where to Share Your Poetry</h1>
          <p className="share-intro">
            Writing is half the work. Sharing is the other half. Here are the best places
            to find readers, get feedback, and publish your poems — from friendly online
            communities to the most competitive literary journals.
          </p>
        </header>

        <section className="share-section">
          <h2>Online Communities</h2>
          <p className="section-note">Start here. Read other people's work. Give honest feedback. Then share your own.</p>
          <div className="resource-grid">
            {COMMUNITIES.map(r => <ResourceCard key={r.name} resource={r} />)}
          </div>
        </section>

        <section className="share-section">
          <h2>Workshops &amp; Classes</h2>
          <p className="section-note">Structured feedback from experienced poets is worth more than a thousand online comments.</p>
          <div className="resource-grid">
            {WORKSHOPS.map(r => <ResourceCard key={r.name} resource={r} />)}
          </div>
        </section>

        <section className="share-section">
          <h2>Literary Journals</h2>
          <p className="section-note">When your poems are polished and you're ready for publication.</p>
          <div className="resource-grid">
            {JOURNALS.map(r => <ResourceCard key={r.name} resource={r} />)}
          </div>
        </section>

        <section className="share-section">
          <h2>Contests</h2>
          <p className="section-note">A good contest gives you a deadline and a reason to finish.</p>
          <div className="resource-grid">
            {CONTESTS.map(r => <ResourceCard key={r.name} resource={r} />)}
          </div>
        </section>

        <section className="share-readiness">
          <h3>Are you ready to submit?</h3>
          <ul className="readiness-checklist">
            <li>You've revised the poem at least twice, days apart</li>
            <li>You've read it aloud and it sounds right</li>
            <li>At least one other person has read it and given honest feedback</li>
            <li>You can articulate what the poem is trying to do (even if only to yourself)</li>
            <li>You've read the journal/venue you're submitting to — your poem fits their aesthetic</li>
          </ul>
          <p className="readiness-note">
            If you haven't done all of these, consider running your collection through
            an <Link to="/">editorial report</Link> first.
          </p>
        </section>
      </div>
    </Layout>
  );
}
