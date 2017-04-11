import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();


import Routes from './routes'

// Here we customize the theme of Material UI components, globally.
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

const muiTheme = getMuiTheme({
    palette: {
        primary1Color: '#545a6a',
        accent1Color: '#ED4337'
    }
});


// Render whatever route we're at, see routes.js
ReactDOM.render(<MuiThemeProvider muiTheme={muiTheme}><Routes/></MuiThemeProvider>, document.getElementById('root')

);

