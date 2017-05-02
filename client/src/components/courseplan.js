/**
 * This module contains all components related to rendering a course plan.
 *
 * CourseDashBoard:
 *  The bottom component that provides feedback on a course plan
 *
 * Semester:
 *  One semester component, contains the information of courses in one semester
 *
 * CoursePlan:
 *  The main component that ties everything together.
 *
 */
import React, {Component} from 'react';
import {browserHistory} from 'react-router';

// Material UI
import FontIcon from 'material-ui/FontIcon';
import LinearProgress from 'material-ui/LinearProgress';
import RaisedButton from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
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

const styles = {
    button: {
        width: 85,
        height: 35,
    },
    deletebutton: {
        width: 85,
        height: 35,
    }
};

/** Dashboard for one course plan.
 *  Renders feedback for a course plan. */
export class CourseDashBoard extends Component {
    constructor(props) {
        super(props);
        this.deleteCoursePlan = this.deleteCoursePlan.bind(this);
        this.state = {
            openDialog: false,
            maxAdvancedECTS: 60,
            maxECTS: 90,
            editMode: this.props.editMode
        };
    }

    // Handle dialog logic
    handleOpenDialog = () => {
        this.setState({openDialog: true});
    };

    handleCloseDialog = () => {
        this.setState({openDialog: false});
    };

    // Handle opening of editor
    openEditor = () => {
        let path = "/p/" + this.props.planHash + "/edit";
        browserHistory.push({
            pathname: path,
            state: {username: this.props.username,
                planHash: this.props.planHash}
        });

    };

    // Handle closing of editor
    exitEditor = () => {
        let path = "/p/" + this.props.planHash;
        browserHistory.push({
            pathname: path,
            state: {username: this.props.username}
        });

    };

    // Send a request to the server to delete a course plan
    async deleteCoursePlan() {
        let planHash = window.location.href.substring(window.location.href.lastIndexOf('/')+1);
        let payload = new FormData();
        payload.append("token", Auth.getToken());
        payload.append("identifier", planHash);
        const request = await fetch('https://tddd27-nikha864-backend.herokuapp.com/delete_plan', {
            method: 'post',
            body: payload
        });
        let response = await request.json();

        // Deletion successful, push user back to dashboard!
        if(response.success){
            browserHistory.push({
                pathname: '/dashboard',
                state: {username: this.props.username}
            });
        }

        // TODO: IN CASE DELETION FAILED; FIX

    };

    // Define action for the dialog buttons
    defineActions() {
        return [
            <FlatButton
              label="Cancel"
              primary={true}
              onTouchTap={this.handleCloseDialog}
            />,
            <FlatButton
              label="Delete"
              primary={true}
              onTouchTap={this.deleteCoursePlan}
            />,
        ];
    }

    render() {
        let dialogActions = this.defineActions();

        // Define icons
        const positiveIcon = <FontIcon
          className="material-icons"
          style={{fontSize: '22px', color: '#66cc91', marginRight: 5}}>check_circle</FontIcon>;

        const negativeIcon = <FontIcon className="material-icons" style={{
            fontSize: '22px',
            color: '#ED4337',
            marginRight: 5
        }}>highlight_off</FontIcon>;

        const warningIcon = <FontIcon className="material-icons" style={{
            fontSize: '22px',
            color: '#ffbb40',
            marginRight: 5
        }}>error_outline</FontIcon>;


        // Check what type of icon should be displayed
        let advancedECTSIcon = (this.props.advancedECTS >= this.state.maxAdvancedECTS) ? positiveIcon : negativeIcon;
        let ECTSIcon = (this.props.ects >= this.state.maxECTS) ? positiveIcon : negativeIcon;
        let scheduleConflictIcon = this.props.scheduleConflict ? warningIcon: positiveIcon;

        // Check for scheduling conflicts
        let scheduleConflict;
        if(this.props.scheduleConflict){
            scheduleConflict =
              <span className="hint--top hint--warning hint--rounded hint--large" aria-label="This plan contains scheduling conflicts. This means two courses run on the same block, at the same time.">
                  <div className="field">
                        {scheduleConflictIcon} Scheduling conflicts
                  </div>
              </span>
        }
        else{
            scheduleConflict =
              <div className="field">
                  {scheduleConflictIcon} No scheduling conflicts!
              </div>
        }

        // Hide edit buttons if in editor mode
        let editButton;
        if(this.state.editMode){
            editButton = <div className="field_sidebyside">
                <RaisedButton
                  target="_blank"
                  label="Back"
                  disabled={!this.props.allowEdit}
                  style={styles.button}
                  onTouchTap={this.exitEditor}
                />
            </div>;
        }
        else{
            editButton = <div className="field_sidebyside">
                <RaisedButton
                  target="_blank"
                  label="Edit"
                  disabled={!this.props.allowEdit}
                  style={styles.button}
                  onTouchTap={this.openEditor}
                />
            </div>;
        }

        return(
          <div>
              <div className="box_headline"> Dashboard</div>
              <div className="box_content_small">
                  <div className="box_content_left">
                      {scheduleConflict}
                      <div className="field_small">
                          {advancedECTSIcon} Advanced ETCS points: {this.props.advancedECTS}/{this.state.maxAdvancedECTS}
                      </div>
                      <div className="field_small">
                          <LinearProgress style={{
                              color: 'green',
                              width: 400,
                              marginTop: 4,
                              marginBottom: 4,
                              marginLeft: 25,
                              height: 5
                          }} mode="determinate" max={this.state.maxAdvancedECTS} min={0} value={this.props.advancedECTS}/>
                      </div>

                      <div className="field_small">

                          {ECTSIcon}ECTS points: {this.props.ects}/{this.state.maxECTS}

                      </div>
                      <div className="field_small">
                          <LinearProgress style={{
                              color: 'green',
                              width: 600,
                              marginLeft: 25,
                              marginTop: 4,
                              marginBottom: 4,
                              height: 5}}
                                          mode="determinate" max={this.state.maxECTS} min={0} value={this.props.ects}/>
                      </div>

                  </div>
                  <div className="box_content_right">
                      <div className="field_small">
                          Course plan name: {this.props.name}
                      </div>
                      <div className="field_small">
                          Created by: {this.props.owner}
                      </div>
                      <div className="field_small">
                          Programme: {this.props.programme}
                      </div>
                      <div className="field_small">
                          Profile: {this.props.profile}
                      </div>

                      <div className="field">
                      </div>

                      {editButton}
                      <div className="field_sidebyside">
                          <RaisedButton
                            target="_blank"
                            secondary={true}
                            label="Delete"
                            disabled={!this.props.allowEdit}
                            style={styles.deletebutton}
                            onTouchTap={this.handleOpenDialog}
                          />

                          <Dialog
                            title="Are you sure you want to delete this course plan?"
                            actions={dialogActions}
                            modal={false}
                            open={this.state.openDialog}
                            onRequestClose={this.handleCloseDialog}
                          >
                              This action cannot be reverted.
                          </Dialog>
                      </div>

                  </div>
              </div>
          </div>
        );
    }
}

/** Semester component with courses and box for ONE semester */
class Semester extends Component {
    constructor(props) {
        super(props);
        this.state = {
            boxClassName: '',
            semester: null
        };
    }

    componentWillMount(){
        let boxClassName;

        // Decide where to place div
        switch(this.props.semesterIndex){

            case 0:
                boxClassName = 'upper_left_wrapper';
                break;
            case 1:
                boxClassName = 'upper_right_wrapper';
                break;
            case 2:
                boxClassName = 'lower_left_wrapper';
                break;

            case 3:
                boxClassName = 'lower_right_wrapper';
                break;
            default:
                boxClassName = 'upper_left_wrapper';
        }
        this.setState({
            boxClassName: boxClassName,
            semester: this.props.semester,
            scheduleConflict: this.props.scheduleConflict
        });
    }

    render() {

        // Table head
        let tableHead = <thead>
        <tr className="table_header">
            <td className="table_small">Block</td>
            <td className="table_small" >Code</td>
            <td>Name</td>
            <td className="table_small">ECTS</td>
            <td className="table_small">Level</td>
        </tr>
        <tr><td> </td><td> </td><td> </td><td> </td><td> </td><td> </td></tr>
        <tr className="table_header">
            <td>Period 1</td>
        </tr>
        </thead>;

        let row;


        // Period 1
        let period1Rows = this.props.semester.period1.map(function(obj){
            row = <tr>
                <td>{obj.block}</td>
                <td>{obj.code}</td>
                <td>{obj.name}</td>
                <td>{obj.points}</td>
                <td>{obj.level}</td>
            </tr>;
            return row;
        });

        // Period 2
        let period2Rows = this.props.semester.period2.map(function(obj){
            row = <tr>
                <td>{obj.block}</td>
                <td>{obj.code}</td>
                <td>{obj.name}</td>
                <td>{obj.points}</td>
                <td>{obj.level}</td>
            </tr>;
            return row;
        });

        // ScheduleConflict warning
        const warningIcon = <FontIcon className="material-icons" style={{
            fontSize: '14px',
            color: '#ffbb40',
            marginRight: 5
        }}>error_outline</FontIcon>;
        let scheduleConflictIcon = this.props.scheduleConflict ? warningIcon: null;

        return (
          <div className={this.state.boxClassName}>
              <div className="box_headline">{this.state.semester.semester}</div>
              <div className="box_content">
                  <div className="semester_table">
                      <table className="standard_table">
                          {tableHead}
                          <tbody>
                          {period1Rows}
                          <tr className="table_header">
                              <td>Period 2</td>
                          </tr>
                          <tr><td> </td><td> </td><td> </td><td> </td><td> </td><td> </td></tr>
                          {period2Rows}
                          </tbody>
                      </table>

                  </div>
                  <div className="semester_summary">
                      <p className="semester_summary_ects">Total ECTS points: {this.state.semester.ects}</p>
                  </div>
                  <div className="semester_summary">
                      <p className="semester_summary_ects">Total advanced ECTS points: {this.state.semester.advanced_ects}</p>
                      <div className="warning_icon">
                        <span className="hint--top hint--warning hint--rounded hint--medium" aria-label="This semester contains a scheduling conflict.">
                            {scheduleConflictIcon}
                        </span>
                      </div>
                  </div>
              </div>
          </div>
        );
    }
}

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
            coursePlanDoesNotExists: false
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
                    semesterBoxes.push(<Semester semesterIndex={i} semester={semesters[i]} scheduleConflict={scheduleConflict}/>)
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