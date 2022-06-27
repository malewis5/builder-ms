import ReactDOM from 'react-dom';
import React from 'react';
import Test from './Test';
import * as pageData from './page.json';

ReactDOM.render(<Test pageData={pageData} />, document.getElementById('root'));
