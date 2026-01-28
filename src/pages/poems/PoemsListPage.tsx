import { Link } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { SEOHead } from '../../components/SEOHead';
import { getAllPoems } from '../../data/poems';
import './PoemsListPage.css';

export function PoemsListPage() {
  const poems = getAllPoems();

  // Group poems by poet
  const poemsByPoet = poems.reduce((acc, poem) => {
    if (!acc[poem.poet]) {
      acc[poem.poet] = [];
    }
    acc[poem.poet].push(poem);
    return acc;
  }, {} as Record<string, typeof poems>);

  // Sort poets alphabetically by last name
  const sortedPoets = Object.keys(poemsByPoet).sort((a, b) => {
    const lastNameA = a.split(' ').pop() || a;
    const lastNameB = b.split(' ').pop() || b;
    return lastNameA.localeCompare(lastNameB);
  });

  return (
    <Layout>
      <SEOHead
        title="Poem Analyses - Poetry Editor"
        description="Browse our collection of analyzed poems with line-by-line commentary, literary devices, and technical analysis."
      />
      <div className="poems-list-page">
        <h1>Poem Analyses</h1>
        <p className="poems-list-intro">
          Explore our collection of {poems.length} analyzed poems with line-by-line commentary,
          literary devices, themes, and technical analysis.
        </p>

        <div className="poets-grid">
          {sortedPoets.map(poet => (
            <div key={poet} className="poet-section">
              <h2 className="poet-name">{poet}</h2>
              <ul className="poem-links">
                {poemsByPoet[poet]
                  .sort((a, b) => a.title.localeCompare(b.title))
                  .map(poem => (
                    <li key={poem.slug}>
                      <Link to={`/poems/${poem.slug}`}>
                        {poem.title}
                        <span className="poem-year">({poem.year})</span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
