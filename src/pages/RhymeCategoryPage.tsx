import { Link, useParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { SEOHead } from '../components/SEOHead';
import './RhymeCategoryPage.css';

// Define rhyme categories with their words
export const rhymeCategories: Record<string, {
  title: string;
  description: string;
  words: string[];
  relatedCategories: string[];
}> = {
  colors: {
    title: 'Color Words',
    description: 'Words for colors commonly used in poetry - find rhymes for red, blue, white, black, and more.',
    words: ['red', 'blue', 'white', 'black', 'green', 'gold', 'gray', 'pink', 'brown', 'yellow', 'purple', 'orange', 'silver', 'violet', 'crimson', 'scarlet', 'azure', 'ivory'],
    relatedCategories: ['nature', 'emotions'],
  },
  emotions: {
    title: 'Emotion Words',
    description: 'Words for feelings and emotions in poetry - find rhymes for love, hate, joy, fear, and more.',
    words: ['love', 'hate', 'joy', 'fear', 'hope', 'grief', 'rage', 'peace', 'pride', 'shame', 'glad', 'sad', 'happy', 'angry', 'lonely', 'content', 'sorrow', 'bliss', 'despair', 'delight'],
    relatedCategories: ['colors', 'nature'],
  },
  nature: {
    title: 'Nature Words',
    description: 'Words from nature for poetry - find rhymes for sun, moon, sea, sky, tree, and more.',
    words: ['sun', 'moon', 'star', 'sea', 'sky', 'tree', 'rain', 'snow', 'wind', 'cloud', 'storm', 'earth', 'fire', 'water', 'flower', 'leaf', 'grass', 'river', 'mountain', 'ocean', 'forest', 'meadow'],
    relatedCategories: ['colors', 'time'],
  },
  time: {
    title: 'Time Words',
    description: 'Words related to time in poetry - find rhymes for day, night, hour, year, and more.',
    words: ['day', 'night', 'hour', 'year', 'time', 'dawn', 'dusk', 'noon', 'spring', 'summer', 'fall', 'winter', 'moment', 'second', 'minute', 'morning', 'evening', 'midnight', 'forever', 'always'],
    relatedCategories: ['nature', 'emotions'],
  },
  body: {
    title: 'Body Words',
    description: 'Words for body parts in poetry - find rhymes for heart, hand, eye, face, and more.',
    words: ['heart', 'hand', 'eye', 'face', 'head', 'mind', 'soul', 'bone', 'skin', 'blood', 'breath', 'lip', 'arm', 'foot', 'tear', 'voice', 'smile', 'touch', 'finger', 'shoulder'],
    relatedCategories: ['emotions', 'actions'],
  },
  actions: {
    title: 'Action Words',
    description: 'Verbs commonly used in poetry - find rhymes for run, fly, cry, dream, and more.',
    words: ['run', 'fly', 'cry', 'dream', 'sing', 'dance', 'fall', 'rise', 'sleep', 'wake', 'love', 'hate', 'live', 'die', 'walk', 'stand', 'speak', 'hear', 'see', 'feel', 'think', 'know'],
    relatedCategories: ['emotions', 'body'],
  },
};

export function RhymeCategoryPage() {
  const { category } = useParams<{ category: string }>();

  const categoryData = category ? rhymeCategories[category] : null;
  const allCategories = Object.keys(rhymeCategories);

  // If no category or invalid category, show category index
  if (!categoryData) {
    return (
      <Layout>
        <SEOHead
          title="Rhyme Categories - Find Rhymes by Topic"
          description="Browse rhyming words by category: colors, emotions, nature, time, body parts, and actions. Find the perfect rhyme for your poetry."
          canonicalPath="/rhymes/category"
          keywords="rhyme categories, poetry words by topic, rhyming word lists, poetry vocabulary"
          jsonLd={{
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Rhyme Categories",
            "description": "Browse rhyming words organized by category for poetry writing.",
            "hasPart": allCategories.map(cat => ({
              "@type": "ItemList",
              "name": rhymeCategories[cat].title,
              "url": `https://poetryeditor.com/rhymes/category/${cat}`
            }))
          }}
        />
        <div className="rhyme-category-page">
          <h1>Rhyme Categories</h1>
          <p className="category-intro">
            Find rhyming words organized by topic. Choose a category to explore words commonly used in poetry.
          </p>

          <div className="category-grid">
            {allCategories.map(cat => (
              <Link key={cat} to={`/rhymes/category/${cat}`} className="category-card">
                <h2>{rhymeCategories[cat].title}</h2>
                <p>{rhymeCategories[cat].description}</p>
                <span className="word-count">{rhymeCategories[cat].words.length} words</span>
              </Link>
            ))}
          </div>

          <div className="back-link">
            <Link to="/rhymes">← Back to Rhyme Dictionary</Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead
        title={`${categoryData.title} That Rhyme - Poetry Rhyme Dictionary`}
        description={categoryData.description}
        canonicalPath={`/rhymes/category/${category}`}
        keywords={`${categoryData.words.slice(0, 5).join(' rhymes, ')} rhymes, ${category} poetry words, rhyming ${category}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": `${categoryData.title} for Poetry`,
          "description": categoryData.description,
          "numberOfItems": categoryData.words.length,
          "itemListElement": categoryData.words.map((word, idx) => ({
            "@type": "ListItem",
            "position": idx + 1,
            "name": word,
            "url": `https://poetryeditor.com/rhymes/${encodeURIComponent(word)}`
          }))
        }}
      />

      <div className="rhyme-category-page">
        <nav className="category-breadcrumb">
          <Link to="/rhymes">Rhyme Dictionary</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to="/rhymes/category">Categories</Link>
          <span className="breadcrumb-separator">/</span>
          <span>{categoryData.title}</span>
        </nav>

        <h1>{categoryData.title} That Rhyme</h1>
        <p className="category-description">{categoryData.description}</p>

        <div className="category-word-grid">
          {categoryData.words.map(word => (
            <Link
              key={word}
              to={`/rhymes/${encodeURIComponent(word)}`}
              className="category-word-card"
            >
              <span className="word-text">{word}</span>
              <span className="find-rhymes">Find rhymes →</span>
            </Link>
          ))}
        </div>

        <div className="related-categories">
          <h2>Related Categories</h2>
          <div className="related-links">
            {categoryData.relatedCategories.map(cat => (
              <Link key={cat} to={`/rhymes/category/${cat}`} className="related-category-link">
                {rhymeCategories[cat]?.title || cat}
              </Link>
            ))}
          </div>
        </div>

        <div className="category-actions">
          <Link to="/rhymes/category" className="action-button secondary">
            All Categories
          </Link>
          <Link to="/rhymes" className="action-button primary">
            Search Any Word
          </Link>
        </div>
      </div>
    </Layout>
  );
}
