/**
 * This module contains the course plan parent that ties a courseplan together.
 */
import React, {Component} from 'react';
import {browserHistory} from 'react-router';

// Material UI
import CircularProgress from 'material-ui/CircularProgress';

// CSS
import '../css/contentboxes.css';
import '../css/courseplan.css';
import '../index.css';
import '../css/hint.css'; // Tooltips hint.css

// Components
import Header from './header';
import Auth from './auth';
import {CoursePlanNotFound} from './errorpages';
import Semester from './semester';
import CourseDashBoard from './coursedashboard';

/** The main course plan component that renders an entire course plan*/
class CoursePlan extends Component {
    constructor(props) {
        super(props);
        this.state = {
            allowEdit: false,
            username: null,
            planOwner: null,
            planHash: null,
            openDialog: false,
            loading: true,
            ECTS: 0,
            advancedECTS: 0,
            coursePlanDoesNotExists: false,
        };
    }

    async componentWillMount() {
        let coursePlan = await this.getCoursePlan();
        let username = await Auth.getUsername();

        if(coursePlan.success){
            this.setState({
                username: username,
                allowEdit: coursePlan.plan.owner === username,
                planOwner: coursePlan.plan.owner,
                planHash: coursePlan.plan.plan_hash,
                ECTS: coursePlan.plan.ects,
                advancedECTS: coursePlan.plan.advanced_ects,
                plan: coursePlan.plan,
                loading: false
            });
        }

        else{
            this.setState({
                username: username,
                coursePlanDoesNotExists: true,
                loading: false
            });
        }

    }

    /* Get the course plan of current link. Set meta dat */
    async getCoursePlan() {

        // Get the hash of the course plan by looking at the url. Lets hope that works...
        let planHash = window.location.href.substring(window.location.href.lastIndexOf('/')+1);

        // Send a request for plan
        let payload = new FormData();
        payload.append("plan_hash", planHash);
        const request = await fetch('https://tddd27-nikha864-backend.herokuapp.com/get_plan', {
            method: 'post',
            body: payload
        });
        return await request.json();
    }

    /* Check if a semester has a scheduling conflict */
    checkForScheduleConflict (semester){
        return semester.schedule_conflict;
    }

    render() {

        // Show loading icon when loading
        if(this.state.loading){
            return(
              <div>
                  <Header user={this.state.username}/>
                  <div className="padding500"> </div>
                  <CircularProgress size={80} thickness={5} />
              </div>
            )
        }
        else {

            // If the course plan does not exist, render template showing that
            if(this.state.coursePlanDoesNotExists){
                return (
                  <div>
                      <CoursePlanNotFound/>
                  </div>
                );
            }

            // But if we DO find a course plan, lets render it!
            else {
                let plan = this.state.plan;
                let semesters = plan.semesters;
                let scheduleConflict = false; // init conflict to false
                let semesterBoxes = [];
                for (let i = 0; i < semesters.length; i++) {
                    scheduleConflict = this.checkForScheduleConflict(semesters[i]);
                    semesterBoxes.push(<Semester semesterIndex={i} semester={semesters[i]} editMode={false} scheduleConflict={scheduleConflict}/>)
                }

                return (
                  <div>
                      <Header user={this.state.username}/>
                      <div className="toppadding100"> </div>
                      <div className="content_wrapper">
                          {semesterBoxes}

                          <div className="lowest_wrapper">
                              <CourseDashBoard name={plan.name} scheduleConflict={scheduleConflict} username={this.state.username}
                                               allowEdit={this.state.allowEdit} profile={plan.profile}
                                               programme={plan.programme} planHash={this.state.planHash}
                                               owner={this.state.planOwner} ects={this.state.ECTS}
                                               advancedECTS={this.state.advancedECTS} editMode={false}/>
                          </div>
                      </div>
                  </div>
                );
            }
        }
    }
}

export default CoursePlan;