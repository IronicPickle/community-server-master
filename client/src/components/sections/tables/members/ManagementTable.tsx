import React, { Component, ChangeEvent } from "react";
import { Theme, withStyles, Table, TablePagination, Paper, Toolbar, Typography, Grid } from "@material-ui/core";
import { Classes } from "@material-ui/styles/mergeClasses/mergeClasses";
import ManagementHead from "./ManagementHead";
import ManagementBody from "./ManagementBody";
import ManagementTitle from "./ManagementTitle";
import { GlobalContext } from "../../../../utils/contexts";
import HTTPMembers, { QueryOptions, DBMemberData } from "../../../../http_utils/HTTPMembers";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";

const styles = (theme: Theme) => ({
  tableContainer: {
    position: "relative" as "relative",
    marginTop: theme.spacing(1)
  }
});

export type IconType = "edit" | "complete" | "revert" | "request" | "requests";
  
interface Props {
  classes: Classes;
  theme: Theme;
}

interface State {
  rows: DBMemberData[];
  count: number;
  sortKey: string;
  sortDirection: 1 | -1;
  searchQuery: string;
  currentPage: number;
  rowsPerPage: number;
  stage?: 0 | 1 | 2 | 3;
}

class ManagementTable extends Component<Props, State> {
  static contextType = GlobalContext;

  constructor(props: Readonly<Props>) {
    super(props);
    this.state = {
      rows: [],
      count: 0,
      sortKey: "discordName",
      sortDirection: 1,
      searchQuery: "",
      currentPage: 0,
      rowsPerPage: 10
    }

    this.updateTable = this.updateTable.bind(this);

    this.onCheckboxChange = this.onCheckboxChange.bind(this);
    this.onIconButtonClick = this.onIconButtonClick.bind(this);
    this.onSortButtonClick = this.onSortButtonClick.bind(this);
    this.onSearchBarChange = this.onSearchBarChange.bind(this);
    this.onSearchBarSubmit = this.onSearchBarSubmit.bind(this);
    this.onStageChange = this.onStageChange.bind(this);

    this.onPageChange = this.onPageChange.bind(this);
    this.onRowsPerPageChange = this.onRowsPerPageChange.bind(this);
  }

  componentDidMount() {
    this.updateTable();
  }

  async updateTable(): Promise<void> {
    
    const queryData: QueryOptions = {
      searchKey: this.state.sortKey,
      searchQuery: this.state.searchQuery,
      sortKey: this.state.sortKey,
      sortDirection: this.state.sortDirection,
      snipStart: this.state.currentPage * this.state.rowsPerPage,
      snipLimit: this.state.rowsPerPage,
      stage: this.state.stage
    }
    this.context.toggleLoader(true);
    const res = await HTTPMembers.query(queryData);
    this.context.toggleLoader(false);
    if(!res.data) return;
    this.setState({ rows: res.data.members, count: res.data.count });
  }

  onCheckboxChange(rowId: number, columnName: string) {
    return () => {
      var rows = this.state.rows;
      const row = this.state.rows[rowId];
      if(row && !row.confirmedByAdmiralty) {
        row[columnName] = !row[columnName];
        rows[rowId] = row;
        this.setState({rows});
      }
    }
  }

  onIconButtonClick(iconType: IconType, _id: string) {
    return () => {
      this.iconMethods[iconType](_id);
    }
  }

  private iconMethods: { [key: string]: (_id: string) => any } = {
    /*edit: (_id: string) => {
      const row = this.state.rows.find((row => row._id === _id));
      this.context.toggleContainer("editMember", true, () => { this.updateTable(); }, { ...row });
    }*/
  }

  onSortButtonClick(columnName: string) {
    return () => {
      let sortDirection: -1 | 1 = 1;
      if(this.state.sortKey === columnName) {
        sortDirection = (this.state.sortDirection === 1) ? -1 : 1;
      }
      this.setState({ sortKey: columnName, sortDirection }, () => {
        this.updateTable();
      });
    }
  }

  onSearchBarChange(event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
    const searchQuery: string = event.target.value;
    this.setState({ searchQuery, currentPage: 0 });
  }

  onSearchBarSubmit() {
    this.updateTable();
  }

  onStageChange(stage?: 0 | 1 | 2 | 3) {
    return () => {
      this.setState({ stage }, () => {
        this.updateTable();
      });
    }
  }

  onPageChange(x: any, pageNumber: number) {
    this.setState({ currentPage: pageNumber }, () => {
      this.updateTable();
    });
  }

  onRowsPerPageChange(event: ChangeEvent<HTMLInputElement>) {
    const rowsPerPage: number = parseInt(event.target.value);
    this.setState({ rowsPerPage }, () => {
      this.updateTable();
    });
    
  }
    
  render() {
    const { classes, theme } = this.props;
    const { rows, count, sortKey, sortDirection, currentPage, rowsPerPage, stage } = this.state;

    const filteredColumn = tableColumns.find((column: Column) => column.name === sortKey);
    
    return (
      <>
        <ManagementTitle
          filteredColumn={filteredColumn}
          stage={stage}
          onSearchBarChange={this.onSearchBarChange}
          onSearchBarSubmit={this.onSearchBarSubmit}
          onStageChange={this.onStageChange}
          updateTable={this.updateTable}
        />
        <Paper className={classes.tableContainer}>
        {
          (rows.length === 0) ?
            <Grid container justify="center">
              <Grid item>
                <Toolbar>
                  <ErrorOutlineIcon  style={{ marginRight: theme.spacing(1) }} />
                  <Typography variant="body2" component="p" align="center" noWrap
                  >No data to display</Typography>
                </Toolbar>
              </Grid>
            </Grid>
            
          :
            <>
              <Table>
                <ManagementHead
                  columns={tableColumns}
                  filters={{ sortKey, sortDirection }}
                  onSortButtonClick={this.onSortButtonClick}
                />
                <ManagementBody
                  columns={tableColumns}
                  rows={JSON.parse(JSON.stringify(rows))}
                  onCheckboxChange={this.onCheckboxChange}
                  onIconButtonClick={this.onIconButtonClick}
                />
              </Table>
              <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={count}
              rowsPerPage={rowsPerPage}
              page={currentPage}
              backIconButtonProps={{
                "aria-label": "previous page",
              }}
              nextIconButtonProps={{
                "aria-label": "next page",
              }}
              onChangePage={this.onPageChange}
              onChangeRowsPerPage={this.onRowsPerPageChange}
            />
          </>
        }
        </Paper>
      </>
    )
  }
}

export interface Column {
  name: string;
  title: string;
  isBool?: boolean;
  disabled?: boolean;
}

const tableColumns: Column[] = [
  { name: "discordName", title: "Discord Name" },
  { name: "joinDate", title: "Joined" }
]


export default withStyles(styles, { withTheme: true })(ManagementTable);