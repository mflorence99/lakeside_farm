import './styles.css';

import LakesideFarmApp from './app';
import SanityCheck from './sanity';

import { initializeBlock } from '@airtable/blocks/ui';

import React from 'react';

initializeBlock(() => (
  <SanityCheck>
    <LakesideFarmApp />
  </SanityCheck>
));
