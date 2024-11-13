import React, { Suspense } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { StyledEngineProvider } from '@mui/material/styles';
import {
  DevTools,
  LanguageDetector,
  Tolgee,
  TolgeeProvider,
} from '@tolgee/react';
import { FormatIcu } from '@tolgee/format-icu';
import ReactDOM from 'react-dom';
import { QueryClientProvider } from 'react-query';

import { BrowserRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import 'reflect-metadata';
import 'regenerator-runtime/runtime';

import { GlobalLoading, LoadingProvider } from 'tg.component/GlobalLoading';
import { GlobalErrorModal } from 'tg.component/GlobalErrorModal';
import { BottomPanelProvider } from 'tg.component/bottomPanel/BottomPanelContext';
import { GlobalContext } from 'tg.globalContext/GlobalContext';
import { App } from './component/App';
import ErrorBoundary from './component/ErrorBoundary';
import { FullPageLoading } from './component/common/FullPageLoading';
import { ThemeProvider } from './ThemeProvider';

import reportWebVitals from './reportWebVitals';
import { MuiLocalizationProvider } from 'tg.component/MuiLocalizationProvider';
import { languageStorage, queryClient } from './initialSetup';
import { branchName } from './branch.json';

function getFeatureName(branch: string) {
  const parts = branch.split('/');
  return parts[parts.length - 1];
}

const tolgee = Tolgee()
  .use(DevTools())
  .use(FormatIcu())
  .use(LanguageDetector())
  .use(languageStorage)
  .init({
    defaultLanguage: 'en',
    fallbackLanguage: 'en',
    apiUrl: import.meta.env.VITE_APP_TOLGEE_API_URL,
    apiKey: import.meta.env.VITE_APP_TOLGEE_API_KEY,
    tagNewKeys: [`draft: ${getFeatureName(branchName)}`],
    staticData: {
      zh: () => import('./i18n/zh.json').then((m) => m.default),
      en: () => import('./i18n/en.json').then((m) => m.default),
      zhTw: () => import('./i18n/zh-Hans.json').then((m) => m.default),
    },
  });

const MainWrapper = () => {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider>
        <CssBaseline />
        <LoadingProvider>
          <GlobalLoading />
          <Suspense fallback={<FullPageLoading />}>
            <TolgeeProvider
              tolgee={tolgee}
              fallback={<FullPageLoading />}
              options={{ useSuspense: false }}
            >
              <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                  {/* @ts-ignore */}
                  <ErrorBoundary>
                    <SnackbarProvider data-cy="global-snackbars">
                      <GlobalContext>
                        <BottomPanelProvider>
                          <MuiLocalizationProvider>
                            <App />
                            <GlobalErrorModal />
                          </MuiLocalizationProvider>
                        </BottomPanelProvider>
                      </GlobalContext>
                    </SnackbarProvider>
                  </ErrorBoundary>
                </QueryClientProvider>
              </BrowserRouter>
            </TolgeeProvider>
          </Suspense>
        </LoadingProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

ReactDOM.render(<MainWrapper />, document.getElementById('root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
