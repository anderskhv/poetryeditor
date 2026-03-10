import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';
import { RhymeDictionary } from './pages/RhymeDictionary';
import { RhymeWord } from './pages/RhymeWord';
import { RhymeWordFiltered } from './pages/RhymeWordFiltered';
import { RhymePair } from './pages/RhymePair';
import { Thesaurus, ThesaurusWord } from './pages/Thesaurus';
import { WordCompare } from './pages/WordCompare';
import { SyllableCounter } from './pages/SyllableCounter';
import { SyllableList } from './pages/SyllableList';
import { SyllableWord } from './pages/SyllableWord';
import { HaikuChecker } from './pages/HaikuChecker';
import { RhymeSchemeAnalyzer } from './pages/RhymeSchemeAnalyzer';
import { SonnetChecker } from './pages/SonnetChecker';
import { PoetryStats } from './pages/PoetryStats';
import { LearnHaiku } from './pages/learn/LearnHaiku';
import { LearnSonnet } from './pages/learn/LearnSonnet';
import { LearnFreeVerse } from './pages/learn/LearnFreeVerse';
import { LearnScansion } from './pages/learn/LearnScansion';
import { LearnRhymeTypes } from './pages/learn/LearnRhymeTypes';
import { LearnMeter } from './pages/learn/LearnMeter';
import { PoemPage } from './pages/poems/PoemPage';
import { PoemsListPage } from './pages/poems/PoemsListPage';
import { RhymeSchemePage } from './pages/RhymeSchemePage';
import { RhymeCategoryPage } from './pages/RhymeCategoryPage';
import { MyCollections } from './pages/MyCollections';
import { CollectionView } from './pages/CollectionView';
import { Widget } from './pages/Widget';
import { EmbedPage } from './pages/EmbedPage';
import { ResetPassword } from './pages/ResetPassword';
import { SharedCollection } from './pages/SharedCollection';
import { Analytics } from './pages/Analytics';
import { Analytics2 } from './pages/Analytics2';
import { EditorialReport } from './pages/EditorialReport';
import { RouteError } from './components/RouteError';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/rhymes',
    element: <RhymeDictionary />,
  },
  {
    path: '/rhyme-finder',
    element: <RhymeDictionary />,
  },
  {
    path: '/rhyming-dictionary',
    element: <RhymeDictionary />,
  },
  {
    path: '/rhymes/category',
    element: <RhymeCategoryPage />,
  },
  {
    path: '/rhymes/category/:category',
    element: <RhymeCategoryPage />,
  },
  {
    path: '/rhymes/:word',
    element: <RhymeWord />,
  },
  {
    path: '/words-that-rhyme-with/:word',
    element: <RhymeWord />,
  },
  {
    path: '/rhymes-with/:word',
    element: <RhymeWord />,
  },
  {
    path: '/rhymes/:word/:syllables',
    element: <RhymeWordFiltered />,
  },
  {
    path: '/rhymes/:word1-and-:word2',
    element: <RhymePair />,
  },
  {
    path: '/synonyms',
    element: <Thesaurus />,
  },
  {
    path: '/synonym-finder',
    element: <Thesaurus />,
  },
  {
    path: '/thesaurus',
    element: <Thesaurus />,
  },
  {
    path: '/synonyms/:word',
    element: <ThesaurusWord />,
  },
  {
    path: '/synonyms-of/:word',
    element: <ThesaurusWord />,
  },
  {
    path: '/synonyms-for/:word',
    element: <ThesaurusWord />,
  },
  {
    path: '/compare/:words',
    element: <WordCompare />,
  },
  {
    path: '/imagery',
    element: <Navigate to="/synonyms" replace />,
  },
  {
    path: '/imagery/:word',
    element: <Navigate to="/synonyms" replace />,
  },
  {
    path: '/syllables',
    element: <SyllableCounter />,
  },
  {
    path: '/syllable-counter',
    element: <SyllableCounter />,
  },
  {
    path: '/syllables/:slug',
    element: <SyllableList />,
  },
  {
    path: '/how-many-syllables-in/:word',
    element: <SyllableWord />,
  },
  {
    path: '/haiku-checker',
    element: <HaikuChecker />,
  },
  {
    path: '/rhyme-scheme-analyzer',
    element: <RhymeSchemeAnalyzer />,
  },
  {
    path: '/sonnet-checker',
    element: <SonnetChecker />,
  },
  {
    path: '/poetry-statistics',
    element: <PoetryStats />,
  },
  // Learn pages
  {
    path: '/learn/haiku',
    element: <LearnHaiku />,
  },
  {
    path: '/learn/sonnet',
    element: <LearnSonnet />,
  },
  {
    path: '/learn/free-verse',
    element: <LearnFreeVerse />,
  },
  {
    path: '/learn/scansion',
    element: <LearnScansion />,
  },
  {
    path: '/learn/rhyme-types',
    element: <LearnRhymeTypes />,
  },
  {
    path: '/learn/meter',
    element: <LearnMeter />,
  },
  // Poem analysis pages
  {
    path: '/poems',
    element: <PoemsListPage />,
  },
  {
    path: '/poems/:slug',
    element: <PoemPage />,
  },
  // Rhyme scheme pages
  {
    path: '/rhyme-scheme/:scheme',
    element: <RhymeSchemePage />,
  },
  // User collections
  {
    path: '/my-collections',
    element: <MyCollections />,
  },
  {
    path: '/my-collections/:id',
    element: <CollectionView />,
  },
  // Widget pages
  {
    path: '/widget',
    element: <Widget />,
  },
  {
    path: '/embed',
    element: <EmbedPage />,
  },
  // Password reset
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    path: '/share/:token',
    element: <SharedCollection />,
  },
  {
    path: '/editorial-report',
    element: <EditorialReport />,
  },
  {
    path: '/editorial-report/:reportId',
    element: <EditorialReport />,
  },
  {
    path: '/analytics',
    element: <Analytics />,
    errorElement: <RouteError title="Analytics error" message="There was a problem loading analytics. Please refresh or try again in a moment." />,
  },
  {
    path: '/analytics2',
    element: <Analytics2 />,
    errorElement: <RouteError title="Analytics error" message="There was a problem loading analytics. Please refresh or try again in a moment." />,
  },
]);
