/**
 * Created by iinh on 4/11/17.
 */
import React, {Component} from 'react';
import {browserHistory} from 'react-router';


// Material UI
import FontIcon from 'material-ui/FontIcon';
import LinearProgress from 'material-ui/LinearProgress';
import Divider from 'material-ui/Divider';
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

// Dashboard for one course plan
class CourseDashBoard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            openDialog: false,
            maxAdvancedECTS: 60,
            maxECTS: 90,
            scheduleConflict: true
        };
    }

    // Handle dialog logic
    handleOpenDialog = () => {
        this.setState({openDialog: true});
    };

    handleCloseDialog = () => {
        this.setState({openDialog: false});
    };

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
              onTouchTap={this.handleCloseDialog}
            />,
        ];
    }

    render() {
        let dialogActions = this.defineActions();
        console.log(this.props.advancedECTS);

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
        let scheduleConflictIcon = warningIcon; // TODO: FIX LOGIC

        // If
        let scheduleConflict;
        if(this.state.scheduleConflict){
            scheduleConflict =
              <span className="hint--top hint--warning hint--rounded hint--large" aria-label="You have scheduling conflicts. This means two courses run on the same block, at the same time.">
                  <div className="field">
                        {scheduleConflictIcon} Advanced ETCS points: {this.props.advancedECTS}/{this.state.maxAdvancedECTS}
                  </div>
              </span>;
        }
        else{
            scheduleConflict =
              <div className="field">
                  {scheduleConflictIcon} Advanced ETCS points: {this.props.advancedECTS}/{this.state.maxAdvancedECTS}
              </div>
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
                          Programme: {this.props.programme}
                      </div>
                      <div className="field_small">
                          Profile: {this.props.profile}
                      </div>
                      <div className="field_small">
                          Course plan name: {this.props.name}
                      </div>
                      <div className="field_small">
                          Created by: {this.props.owner}
                      </div>

                      <div className="field">

                      </div>

                      <div className="field_sidebyside">
                          <RaisedButton
                            target="_blank"
                            label="Edit"
                            disabled={!this.props.allowEdit}
                            style={styles.button}
                          />

                      </div>

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

// One semester component
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
            semester: this.props.semester
        });
    }

    render() {
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
                  <div className="semester_summary"> Total ECTS points: {this.state.semester.ects}</div>
              </div>
          </div>
        );
    }
}

// The entire course plan site component
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
            advancedECTS: 0
        };
    }

    async componentWillMount() {
        let coursePlan = await this.getCoursePlan();
        console.log(coursePlan);
        console.log(coursePlan.advanced_ects);
        let username = await Auth.getUsername();
        this.setState({
            username: username,
            allowEdit: coursePlan.owner === username,
            planOwner: coursePlan.owner,
            planHash: coursePlan.plan_hash,
            ECTS: coursePlan.ects,
            advancedECTS: coursePlan.advanced_ects,
            plan: coursePlan,
            loading: false
        });
    }

    /* Get the course plan of current link. Set meta dat */
    async getCoursePlan() {

        // Get the hash of the course plan by looking at the url. Lets hope that works...
        let planHash = window.location.href.substring(window.location.href.lastIndexOf('/')+1);

        // Send a request for plan
        let payload = new FormData();
        payload.append("token", Auth.getToken());
        payload.append("plan_hash", planHash);
        const request = await fetch('https://tddd27-nikha864-backend.herokuapp.com/get_plan', {
            method: 'post',
            body: payload
        });
        let response = await request.json();

        // If plan data could not be found, push the user to 404 page
        // (NOT_FOUND will render NotFound component)
        if(!response.success){
            browserHistory.push('/NOT_FOUND');
        }

        // Harvest props from the server response
        else{
            return response.plan
        }
    }

    render() {
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

            let test = this.state.plan;
            let semesters = test.semesters;
            let semesterBoxes = [];
            for (let i = 0; i < semesters.length; i++) {
                semesterBoxes.push(<Semester semesterIndex={i} semester={semesters[i]}/>)
            }

            return (
              <div>
                  <Header user={this.state.username}/>
                  <div className="toppadding100"> </div>
                  <div className="content_wrapper">
                      {semesterBoxes}

                      <div className="lowest_wrapper">
                          <CourseDashBoard allowEdit={this.state.allowEdit} owner={this.state.planOwner} ects={this.state.ECTS} advancedECTS={this.state.advancedECTS} />
                      </div>
                  </div>
              </div>
            );
        }
    }

}

export default CoursePlan;