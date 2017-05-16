/** Semester component with courses and box for ONE semester */

import React, {Component} from 'react';

// CSS
import '../css/semester.css';

// Material UI
import FontIcon from 'material-ui/FontIcon';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import CircularProgress from 'material-ui/CircularProgress';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';

// Components
import Auth from './auth';
import AddCourse from './addcourse';

const styles = {
    deleteIcon: {
        fontSize: 15,
        color: 'red',
    },
    addCourse: {
        fontSize: 19,
        height: '19px',
        width: '19px',
        color: '#545a6a',
        marginTop: 0
    }

};

class Semester extends Component {
    constructor(props) {
        super(props);
        this.deleteSemester = this.deleteSemester.bind(this);
        this.state = {
            boxClassName: '',
            plan: null,
            semester: null,
            editMode: this.props.editMode,
            openDialogDeleteSemester: false,
            loading: false,
            openDialogNewCourse: false,
            enableCourseButton: false,
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
            scheduleConflict: this.props.scheduleConflict,
            plan: this.props.plan
        });
    }

    /*
     ---
     Here is logic for when editMode === true.
     ---
     */
    handleOpenDialogDeleteSemester = () => {
        this.setState({openDialogDeleteSemester: true});
    };

    handleCloseDialogDeleteSemester = () => {
        this.setState({openDialogDeleteSemester: false});
    };

    handleOpenDialogNewCourse = () => {
        this.setState({openDialogNewCourse: true});
    };

    handleCloseDialogNewCourse = () => {
        this.setState({
            openDialogNewCourse: false,
            enableCourseButton: false,
        });
    };

    // When a course is chosen, enable the button to add course
    handleEnableCourseButton = (enabled) =>{
        this.setState({
            enableCourseButton: enabled,
        });
    };

    // Delete a semester
    async deleteSemester (){
        this.setState({loading: true});
        this.handleCloseDialogDeleteSemester();
        let payload = new FormData();
        payload.append("token", Auth.getToken());
        payload.append("identifier", this.state.plan.plan_hash);
        payload.append("semester_name", this.state.semester.semester);
        const request = await fetch('https://tddd27-nikha864-backend.herokuapp.com/delete_semester', {
            method: 'post',
            body: payload
        });

        let response = await request.json();

        this.props.callback(response);
        this.setState({loading: false});
    };


    // Add a course to a semester
    async addCourse(){
        let payload = new FormData();
        payload.append("token", Auth.getToken());
        payload.append("identifier", this.state.plan.plan_hash);
        payload.append("semester_name", this.state.semester.semester);
        payload.append("course_code", );
        payload.append("course_name");
        payload.append("course_period");
        payload.append("course_block");
        payload.append("course_credits");
        payload.append("course_level");
        const request = await fetch('https://tddd27-nikha864-backend.herokuapp.com/add_course', {
            method: 'post',
            body: payload
        });

        let response = await request.json();
        this.props.callback(response);
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

        // EDITMODE: Add delete button if in editMode.
        let boxHeadline;
        let newCourseButton;
        if(this.state.editMode){
            boxHeadline =
              <div className="box_headline">
                  <div className="box_headline_text">{this.state.semester.semester}</div>
                  <div className="delete_icon_right"> <FontIcon onClick={this.handleOpenDialogDeleteSemester} className="material-icons" style={styles.deleteIcon}>clear</FontIcon></div>
              </div>;
            newCourseButton = <div className="semester_summary">
                <p onClick={this.handleOpenDialogNewCourse} className="semester_summary_new_course new_course"><FontIcon className="material-icons" style={styles.addCourse}>add</FontIcon> Add new course</p>
            </div>;


        }
        else{
            boxHeadline = <div className="box_headline"><div className="box_headline_text">{this.state.semester.semester}</div></div>;
            newCourseButton = <div className="semester_summary"> </div>;
        }

        // EDITMODE: Actions for dialog
        const dialogActionsDeleteSemester = [
            <FlatButton
              label="Cancel"
              primary={true}
              onTouchTap={this.handleCloseDialogDeleteSemester}
            />,
            <FlatButton
              label="Delete"
              primary={true}
              onTouchTap={this.deleteSemester}
            />
        ];

        const dialogActionsNewCourse = [
            <FlatButton
              label="Cancel"
              primary={true}
              onTouchTap={this.handleCloseDialogNewCourse}
            />,
            <FlatButton
              label="Add course"
              disabled={!this.state.enableCourseButton}
              primary={true}
              onTouchTap={this.addCourse}
            />
        ];
        return (
          <div className={this.state.boxClassName}>
              {boxHeadline}
              <div className="box_content">
                  <div className="semester_table">
                      <table className="standard_table">
                          {tableHead}
                          <tbody>
                          {period1Rows}
                          <tr className="table_header">
                              <td>Period 2</td>
                          </tr>
                          <tr>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                          </tr>
                          {period2Rows}
                          </tbody>
                      </table>

                  </div>
                  {newCourseButton}
                  <div className="semester_summary">
                  </div>
                  <div className="semester_summary">
                      <p className="semester_summary_ects">Total ECTS points: {this.state.semester.ects}</p>
                  </div>
                  <div className="semester_summary">
                      <p className="semester_summary_ects">Total advanced ECTS
                          points: {this.state.semester.advanced_ects}</p>
                      <div className="warning_icon">
                        <span className="hint--top hint--warning hint--rounded hint--medium"
                              aria-label="This semester contains a scheduling conflict.">
                            {scheduleConflictIcon}
                        </span>
                      </div>
                  </div>
              </div>


              <Dialog
                title="Are you sure you want to delete this semester?"
                actions={dialogActionsDeleteSemester}
                modal={false}
                open={this.state.openDialogDeleteSemester}
                onRequestClose={this.handleCloseDialogDeleteSemester}
              >
                  This action cannot be reverted.
              </Dialog>

              <Dialog
                title={"Add a new course to " + this.state.semester.semester + "."}
                actions={dialogActionsNewCourse}
                modal={false}
                open={this.state.openDialogNewCourse}
                onRequestClose={this.handleCloseDialogNewCourse}
              >
                  <AddCourse callbackEnableAddCourseButton={this.handleEnableCourseButton}/>
              </Dialog>

          </div>
        );
    }

}
export default Semester;