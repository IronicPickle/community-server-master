import React, { Component, ChangeEvent } from "react";
import { Theme, withStyles, Table, TablePagination, Paper, Toolbar, Typography, Grid } from "@material-ui/core";
import ManagementHead from "./ManagementHead";
import ManagementBody from "./ManagementBody";
import ManagementTitle from "./ManagementTitle";
import { globalContext } from "../../../../utils/contexts";
import HTTPMembers, { QueryOptions, DBMemberData } from "../../../../http_utils/HTTPMembers";
import ErrorOutlineIcon from "@material-ui/icons/ErrorOutline";
import { ClassNameMap } from "@material-ui/core/styles/withStyles";
import CreateMember from "../../containers/CreateMember";

const styles = (theme: Theme) => ({
  tableContainer: {
    position: "relative" as "relative",
    marginTop: theme.spacing(1)
  }
});

export type IconType = "edit" | "complete" | "revert" | "request" | "requests";
  
interface Props {
  classes: ClassNameMap;
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
  createMemberState: boolean;
}

class ManagementTable extends Component<Props, State> {
  static contextType = globalContext;

  constructor(props: Readonly<Props>) {
    super(props);
    this.state = {
      rows: [],
      count: 0,
      sortKey: "discordName",
      sortDirection: 1,
      searchQuery: "",
      currentPage: 0,
      rowsPerPage: 10,
      createMemberState: false
    }

    this.updateTable = this.updateTable.bind(this);

    this.onSortButtonClick = this.onSortButtonClick.bind(this);
    this.onSearchBarChange = this.onSearchBarChange.bind(this);
    this.onSearchBarSubmit = this.onSearchBarSubmit.bind(this);

    this.onPageChange = this.onPageChange.bind(this);
    this.onRowsPerPageChange = this.onRowsPerPageChange.bind(this);

    this.openCreateMember = this.openCreateMember.bind(this);
    this.createMemberClose = this.createMemberClose.bind(this);
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
      snipLimit: this.state.rowsPerPage
    }
    this.context.toggleLoader(true);
    const res = await HTTPMembers.query(queryData);
    this.context.toggleLoader(false);
    if(!res.data) return;
    this.setState({ rows: res.data.members, count: res.data.count });
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

  openCreateMember() {
    this.setState({ createMemberState: true });
  }

  createMemberClose() {
    this.updateTable();
    this.setState({ createMemberState: false });
  }
    
  render() {
    const { classes, theme } = this.props;
    const { rows, count, sortKey, sortDirection, currentPage, rowsPerPage, createMemberState } = this.state;

    const filteredColumn = tableColumns.find((column: Column) => column.name === sortKey);
    
    return (
      <>
        <CreateMember state={createMemberState} onClose={this.createMemberClose} />
        <ManagementTitle
          filteredColumn={filteredColumn}
          onSearchBarChange={this.onSearchBarChange}
          onSearchBarSubmit={this.onSearchBarSubmit}
          openCreateMember={this.openCreateMember}
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
  sortable: boolean;
}

const tableColumns: Column[] = [
  { name: "avatar", title: "Avatar", sortable: false },
  { name: "discordName", title: "Discord Name", sortable: true },
  { name: "joinDate", title: "Joined", sortable: true }
]


export default withStyles(styles, { withTheme: true })(ManagementTable);