/** Semester component with courses and box for ONE semester */


import React, {Component} from 'react';

import FontIcon from 'material-ui/FontIcon';

class Semester extends Component {
    constructor(props) {
        super(props);
        this.state = {
            boxClassName: '',
            semester: null,
            editMode: this.props.editMode
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
export default Semester;