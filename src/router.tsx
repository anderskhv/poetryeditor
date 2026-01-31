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
import { HaikuChecker } from './pages/HaikuChecker';
import { RhymeSchemeAnalyzer } from './pages/RhymeSchemeAnalyzer';
import { SonnetChecker } from './pages/SonnetChecker';
import { PoetryStats } from './pages/PoetryStats';
import { LearnHaiku } from './pages/learn/LearnHaiku';
import { LearnSonnet } from './pages/learn/LearnSonnet';
import { LearnFreeVerse } from './pages/learn/LearnFreeVerse';
import { LearnScansion } from './pages/learn/LearnScansion';
import { PoemPage } from './pages/poems/PoemPage';
import { PoemsListPage } from './pages/poems/PoemsListPage';
import { RhymeSchemePage } from './pages/RhymeSchemePage';
import { Widget } from './pages/Widget';
import { EmbedPage } from './pages/EmbedPage';

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
    path: '/rhymes/:word',
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
    path: '/synonyms/:word',
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
    path: '/syllables/:slug',
    element: <SyllableList />,
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
  // Widget pages
  {
    path: '/widget',
    element: <Widget />,
  },
  {
    path: '/embed',
    element: <EmbedPage />,
  },
]);
