import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';
import { RhymeDictionary } from './pages/RhymeDictionary';
import { RhymeWord } from './pages/RhymeWord';
import { Thesaurus, ThesaurusWord } from './pages/Thesaurus';
import { SyllableCounter } from './pages/SyllableCounter';
import { SyllableWord } from './pages/SyllableWord';
import { HaikuChecker } from './pages/HaikuChecker';
import { RhymeSchemeAnalyzer } from './pages/RhymeSchemeAnalyzer';
import { SonnetChecker } from './pages/SonnetChecker';
import { LearnHaiku } from './pages/learn/LearnHaiku';
import { LearnSonnet } from './pages/learn/LearnSonnet';
import { LearnFreeVerse } from './pages/learn/LearnFreeVerse';
import { LearnScansion } from './pages/learn/LearnScansion';
import { PoemPage } from './pages/poems/PoemPage';

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
    path: '/synonyms',
    element: <Thesaurus />,
  },
  {
    path: '/synonyms/:word',
    element: <ThesaurusWord />,
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
    path: '/syllables/:word',
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
    path: '/poems/:slug',
    element: <PoemPage />,
  },
]);
