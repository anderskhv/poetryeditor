import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import { RhymeDictionary } from './pages/RhymeDictionary';
import { RhymeWord } from './pages/RhymeWord';
import { SyllableCounter } from './pages/SyllableCounter';
import { SyllableWord } from './pages/SyllableWord';
import { HaikuChecker } from './pages/HaikuChecker';
import { MeterAnalyzer } from './pages/MeterAnalyzer';
import { RhymeSchemeAnalyzer } from './pages/RhymeSchemeAnalyzer';
import { SonnetChecker } from './pages/SonnetChecker';
import { PoetMaker } from './pages/PoetMaker';

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
    path: '/meter-analyzer',
    element: <MeterAnalyzer />,
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
    path: '/poet-maker',
    element: <PoetMaker />,
  },
]);
