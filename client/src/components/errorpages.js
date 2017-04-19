/**
 *  Contains error pages such as 404, 503
 *
 */
import {Link} from 'react-router';
import React, {Component} from 'react';

// CSS
import '../css/errorpages.css'

// Components
import Header from './header';


/**
 * Standard 404 page
 */
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

/**
 * Course plan missing 404 page
 */
export class CoursePlanNotFound extends Component {
    render() {
        return (
          <div>
              <Header />
              <div className="error_page">
                  <p className="not_found_big"> 404 </p>
                  <p className="not_found_small"> Sorry, this course plan does not exist</p>
                  <Link to="/">
                      <button className="submit">Go home</button>
                  </Link>
              </div>
          </div>
        );
    }
}