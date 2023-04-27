import * as dayjs from 'dayjs';

import { Box } from '@airtable/blocks/ui';
import { Text } from '@airtable/blocks/ui';

import { colors } from '@airtable/blocks/ui';
import { useState } from 'react';

import React from 'react';

export default function Datetime({ date, onChange }): JSX.Element {
  const [error, setError] = useState(null);
  const handleChange = (date): void => {
    const isValid = dayjs(date, 'YYYY-MM-DD[T]HH:MM', true).isValid();
    if (isValid) {
      setError(null);
      onChange(date);
    } else setError('Please enter a valid date');
  };
  return (
    <Box>
      <input
        className="datetime-input"
        onChange={(e): void => handleChange(e.target.value)}
        type="datetime-local"
        value={date}
      />
      {error && <Text textColor={colors.RED}>{error}</Text>}
    </Box>
  );
}
