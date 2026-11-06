/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { PhoneProvider } from './context/PhoneContext';
import { PhoneChassis } from './components/PhoneChassis';

export default function App() {
  return (
    <PhoneProvider>
      <PhoneChassis />
    </PhoneProvider>
  );
}
