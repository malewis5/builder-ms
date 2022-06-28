import { OmniPage } from '@peakactivity/merce-shared-frontend-components';
import React, { useEffect } from 'react';
import '@peakactivity/merce-shared-frontend-components/lib/index.css';

const Test = (props) => {
  return (
    <OmniPage data={props.pageData.snapshot.lookup} version="2"></OmniPage>
  );
};

export default Test;
