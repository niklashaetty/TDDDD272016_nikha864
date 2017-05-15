/**
 This component is the course chooser that appears when one tries to add a new course to a semester.
 */
import React from 'react';

// CSS
import '../css/addcourse.css';

// Material UI
import RaisedButton from 'material-ui/RaisedButton';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import {
    Table,
    TableBody,
    TableFooter,
    TableHeader,
    TableHeaderColumn,
    TableRow,
    TableRowColumn,
} from 'material-ui/Table';

const styles = {
    filterButton: {
        width: 120,
        height: 35,
        float: 'left',
        marginRight: 10,
        marginTop: 18,
    },
    filterSearch:{
        field: {
            width: 200,
            height: 75,
            float: 'left',
            marginRight: 10,
            marginTop: -14,
        },
        input: {
            color: '#595959',
        }
    },
    radioButton: {
        icon:  {
            width: 15,
            height: 15,
            marginTop: 3,
        },

        text: {
            fontSize: 12,
            width: 140,
            height: 5,
        }
    },

    courseTable:{
        general: {
            width: '100%',
        },
        smallColumn: {
            width: 35,
        },
        mediumColumn: {
            width: 55,
        },
        largeColumn: {
            width: 200,
        }
    }
};

const tableData = [
    {
        "ects": "6*",
        "level": "A",
        "name": "Testcourse 103",
        "period": "HT1/HT2",
        "block": "1",
        "code": "TDDD17"
    },
    {
        "ects": "6*",
        "level": "G2",
        "name": "Testcourse 103",
        "period": "HT1/HT2",
        "block": "2",
        "code": "c2"
    },
    {
        "ects": "6*",
        "level": "G1",
        "name": "Testcourse 103",
        "period": "VT1",
        "block": "3",
        "code": "c3"
    },
    {
        "ects": "6*",
        "level": "G1",
        "name": "Testcourse 1017",
        "period": "VT2",
        "block": "4",
        "code": "c4"
    },
    {
        "ects": "6*",
        "level": "G2",
        "name": "Testcourse 104",
        "period": "HT1/HT2",
        "block": "1/2",
        "code": "c5"
    },
    {
        "ects": "6*",
        "level": "A",
        "name": "Testcourse 103",
        "period": "HT1/HT2",
        "block": "2/3",
        "code": "c6"
    },
    {
        "ects": "6*",
        "level": "A",
        "name": "Testcourse 103",
        "period": "HT1/HT2",
        "block": "3/4",
        "code": "c7"
    },

];

class AddCourse extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            openBlock: false,
            openPeriod: false,
            openLevel: false,
            selectedBlock: 'All blocks',
            selectedPeriod: 'All periods',
            selectedLevel: 'All levels',
            selectedSearch: '',
            courseTableHeight: '400px',
        };
    }

    handleOpenBlock = (event) => {
        this.setState({openBlock: true,
            anchorElBlock: event.currentTarget,});
    };

    handleOpenPeriod = (event) => {
        this.setState({openPeriod: true,
            anchorElPeriod: event.currentTarget
        });
    };

    handleOpenLevel = (event) => {
        this.setState({openLevel: true,
            anchorElLevel: event.currentTarget
        });
    };

    handleRequestClose = () => {
        this.setState({
            openBlock: false,
            openPeriod: false,
            openLevel: false,
        });
    };

    filterBlock = (event, value) => {
        event.preventDefault();
        this.setState({
            selectedBlock: value,
            openBlock: false,
        });
    };

    filterPeriod = (event, value) => {
        event.preventDefault();
        this.setState({
            selectedPeriod: value,
            openPeriod: false,
        });
    };

    filterSearch = (event, value) => {
        event.preventDefault();
        this.setState({
            selectedSearch: value,

        });
    };

    filterLevel = (event, value) => {
        event.preventDefault();
        this.setState({
            selectedLevel: value,
            openLevel: false,
        });
    };

    /* Filter all courses based on the criteria in selected* states */
    filterCourses = () => {
        let _this = this;

        // If All is selected, replace search query with empty string to not filter anything
        let periodsChosen = (_this.state.selectedPeriod === "All periods") ? "" : _this.state.selectedPeriod;
        let blocksChosen = (_this.state.selectedBlock === "All blocks") ? "" : _this.state.selectedBlock.substring(_this.state.selectedBlock.indexOf(" ")+1); // Strip "Block " from selectedBlock
        let levelsChosen = (_this.state.selectedLevel === "All levels") ? "" : _this.state.selectedLevel;
        let textChosen =  _this.state.selectedSearch.toLowerCase();
        return tableData.filter(function(course){
            let courseCode = course.code.toLowerCase();
            let courseName = course.name.toLowerCase();
            return (
              course.period.includes(periodsChosen) &&
              course.block.includes(blocksChosen)  &&
              course.level.includes(levelsChosen) &&
              (courseCode.includes(textChosen) || courseName.includes(textChosen))
            )
        });
    };

    render() {
        let filterByBlock = <div>
            <RaisedButton
              style={styles.filterButton}
              onTouchTap={this.handleOpenBlock}
              label={this.state.selectedBlock}
            />
            <Popover
              open={this.state.openBlock}
              anchorEl={this.state.anchorElBlock}
              anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
              targetOrigin={{horizontal: 'left', vertical: 'top'}}
              onRequestClose={this.handleRequestClose}
            >
                <Menu value={this.state.selectedBlock} onChange={this.filterBlock}>
                    <MenuItem value="All blocks"  primaryText="All blocks"/>
                    <MenuItem  value="Block 1" primaryText="Block 1" />
                    <MenuItem  value="Block 2" primaryText="Block 2" />
                    <MenuItem  value="Block 3" primaryText="Block 3" />
                    <MenuItem  value="Block 4" primaryText="Block 4" />
                </Menu>
            </Popover>
        </div>;

        let filterByPeriod =
          <div>
              <RaisedButton
                style={styles.filterButton}
                onTouchTap={this.handleOpenPeriod}
                label={this.state.selectedPeriod}
              />
              <Popover
                open={this.state.openPeriod}
                anchorEl={this.state.anchorElPeriod}
                anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                targetOrigin={{horizontal: 'left', vertical: 'top'}}
                onRequestClose={this.handleRequestClose}
              >
                  <Menu value={this.state.selectedPeriod} onChange={this.filterPeriod}>
                      <MenuItem value="All periods"  primaryText="All periods"/>
                      <MenuItem  value="VT1" primaryText="Spring 1 (VT1)" />
                      <MenuItem  value="VT2" primaryText="Spring 2 (VT1)" />
                      <MenuItem  value="HT1" primaryText="Fall 1 (HT1)" />
                      <MenuItem  value="HT2" primaryText="Fall 1 (HT2)" />
                  </Menu>
              </Popover>
          </div>;

        let filterByLevel =
          <div>
              <RaisedButton
                style={styles.filterButton}
                onTouchTap={this.handleOpenLevel}
                label={this.state.selectedLevel}
              />
              <Popover
                open={this.state.openLevel}
                anchorEl={this.state.anchorElLevel}
                anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                targetOrigin={{horizontal: 'left', vertical: 'top'}}
                onRequestClose={this.handleRequestClose}
              >
                  <Menu value={this.state.selectedLevel} onChange={this.filterLevel}>
                      <MenuItem value="All levels"  primaryText="All levels"/>
                      <MenuItem  value="A" primaryText="Advanced (A)" />
                      <MenuItem  value="G1" primaryText="Introductory level 1 (G1)" />
                      <MenuItem  value="G2" primaryText="Introductory level 1 (G2)" />
                  </Menu>
              </Popover>
          </div>;

        let filterBySearch =
          <div>
              <TextField
                value={this.state.selectedSearch}
                onChange={this.filterSearch}
                style={styles.filterSearch.field}
                inputStyle={styles.filterSearch.input}
                floatingLabelText="Filter by code or name"
              />
          </div>;

        let filteredCourses = this.filterCourses();
        let courseTable =
          <div>
              <Table
                height={this.state.courseTableHeight}
                fixedHeader={false}
                style={styles.courseTable.general}
              >
                  <TableHeader
                    displaySelectAll={false}
                    adjustForCheckbox={true}
                    enableSelectAll={false}

                  >
                      <TableRow className="table_row">
                          <TableHeaderColumn className="table_row" style={styles.courseTable.mediumColumn} tooltip="Course code">Code</TableHeaderColumn>
                          <TableHeaderColumn className="table_row" style={styles.courseTable.largeColumn} tooltip="Course name">Name</TableHeaderColumn>
                          <TableHeaderColumn className="table_row" style={styles.courseTable.mediumColumn} tooltip="Course period">Period</TableHeaderColumn>
                          <TableHeaderColumn className="table_row" style={styles.courseTable.smallColumn} tooltip="Timetable group">Block</TableHeaderColumn>
                          <TableHeaderColumn className="table_row" style={styles.courseTable.smallColumn} tooltip="Credits (ECTS)">Credits</TableHeaderColumn>
                          <TableHeaderColumn className="table_row" style={styles.courseTable.smallColumn} tooltip="Course level">Level</TableHeaderColumn>
                      </TableRow>
                  </TableHeader>
                  <TableBody
                    displayRowCheckbox={true}
                    showRowHover={true}
                  >
                      {filteredCourses.map( (row, index) => (
                        <TableRow className="table_row" key={index} >
                            <TableRowColumn className="table_row" >{row.code}</TableRowColumn>
                            <TableRowColumn className="table_row"  >{row.name}</TableRowColumn>
                            <TableRowColumn  className="table_row" >{row.period}</TableRowColumn>
                            <TableRowColumn  className="table_row"> {row.block}</TableRowColumn>
                            <TableRowColumn  className="table_row" >{row.ects}</TableRowColumn>
                            <TableRowColumn   className="table_row">{row.level}</TableRowColumn>
                        </TableRow>
                      ))}
                  </TableBody>
              </Table>
          </div>;

        return (
          <div>
              <div className="filter_menu">
                  {filterBySearch}
                  {filterByBlock}
                  {filterByPeriod}
                  {filterByLevel}
              </div>

              <div className="course_table">
                  {courseTable}
              </div>
          </div>
        );
    }
}
export default AddCourse;