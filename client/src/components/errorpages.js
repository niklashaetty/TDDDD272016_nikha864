/* Contains error pages such as 404, 503 '*/
import {Link} from 'react-router';
import React, {Component} from 'react';
import '../css/errorpages.css'
import Header from './header';

export class NotFound extends Component {
    render() {
        return (
          <div>
              <Header />
              <div className="error_page">
                  <p className="not_found_big"> 404 </p>
                  <p className="not_found_small"> The page could not be found </p>
                  <Link to="/">
                      <button className="submit">Go home</button>
                  </Link>
              </div>
          </div>
        );
    }
}