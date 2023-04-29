import * as dayjs from 'dayjs';

import { Box } from '@airtable/blocks/ui';
import { Text } from '@airtable/blocks/ui';

import { colors } from '@airtable/blocks/ui';
import { useState } from 'react';

import React from 'react';

export default function Datetime({
  date,
  disabled = false,
  onChange,
  type = 'date'
}): JSX.Element {
  const [error, setError] = useState(null);
  const handleChange = (date): void => {
    const isValid = dayjs(date, 'YYYY-MM-DD[T]HH:MM', true).isValid();
    if (isValid) {
      setError(null);
      onChange(date);
    } else setError('Invalid date');
  };
  return (
    <Box>
      <input
        className="datetime-input"
        disabled={disabled}
        onChange={(e): void => handleChange(e.target.value)}
        type={type}
        value={date}
      />
      {error && <Text textColor={colors.RED}>{error}</Text>}
    </Box>
  );
}
