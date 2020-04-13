import React, { Component, ChangeEvent, MouseEvent } from "react";
import { Theme, withStyles, Table, TablePagination, Paper } from "@material-ui/core";
import { Classes } from "jss";

import ManagementHead from "./ManagementHead";
import ManagementBody from "./ManagementBody";
import ManagementTitle from "./ManagementTitle";
import { GlobalContext } from "../../../../utils/contexts";
import { completeMember, revertMember } from "../../../../utils/members";

const styles = (theme: Theme) => ({
  tableContainer: {
    position: "relative" as "relative",
    marginTop: theme.spacing(1)
  }
});
  
interface PropsI {
  classes: Classes;
  theme: Theme;
  data: { [key: string]: any }[];
  presetFilters: { [key: string]: any };
  updateTable: Function;
}

interface StateI {
  rows: { [key: string]: any }[];
  sortId: string;
  sortDirection: "asc" | "desc" | undefined;
  searchQuery: string;
  currentPage: number;
  rowsPerPage: number;
  usePresetFilters: boolean;
}

class ManagementTable extends Component<PropsI, StateI> {
  static contextType = GlobalContext;

  constructor(props: Readonly<PropsI>) {
    super(props);
    this.state = {
      rows: props.data,
      sortId: "discordId",
      sortDirection: "asc",
      searchQuery: "",
      currentPage: 0,
      rowsPerPage: 10,
      usePresetFilters: false
    }

    this.onCheckboxChange = this.onCheckboxChange.bind(this);
    this.onIconButtonClick = this.onIconButtonClick.bind(this);
    this.onSortButtonClick = this.onSortButtonClick.bind(this);
    this.onSearchBarChange = this.onSearchBarChange.bind(this);

    this.onPageChange = this.onPageChange.bind(this);
    this.onRowsPerPageChange = this.onRowsPerPageChange.bind(this);
  }

  onCheckboxChange(rowId: number, columnName: string) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      var rows = this.state.rows;
      const row = this.state.rows[rowId];
      if(row && !row.confirmedByAdmiralty) {
        row[columnName] = !row[columnName];
        rows[rowId] = row;
        this.setState({rows});
      }
    }
  }

  onIconButtonClick(iconType: "editMember" | "completeMember" | "revertMember" | "requestMember" | "requestsMember", data?: any) {
    return (event: MouseEvent<HTMLButtonElement, MouseEvent>) => {
      this.iconMethods[iconType](data);
    }
  }

  private iconMethods: { [key: string]: any } = {
    edit: (data: any) => {
      const row = this.props.data.find((row => row._id === data._id));
      this.context.toggleContainer("editMember", true, () => { this.props.updateTable(); }, { ...row });
    }, complete: (data: any) => {
      this.context.toggleLoader(true);
      completeMember(data._id, (res: { success: boolean, msg: string, errors: any }) => {
        this.context.toggleLoader(false);
        this.context.toggleNotification(true, {
          type: (res.success) ? "success" : "error", message: res.msg, hideDelay: 2000
        });
        if(!res.success) return;
        this.props.updateTable();
      });
    }, revert: (data: any) => {
      this.context.toggleLoader(true);
      revertMember(data._id, (res: { success: boolean, msg: string, errors: any }) => {
        this.context.toggleLoader(false);
        this.context.toggleNotification(true, {
          type: (res.success) ? "success" : "error", message: res.msg, hideDelay: 2000
        });
        if(!res.success) return;
        this.props.updateTable();
      });
    }, request: (data: any) => {
      const row = this.props.data.find((row => row._id === data._id));
      this.context.toggleContainer("requestMember", true, () => { this.props.updateTable(); }, { ...row });
    }, requests: (data: any) => {
      const row = this.props.data.find((row => row._id === data._id));
      this.context.toggleContainer("requestsMember", true, () => { this.props.updateTable(); }, { ...row });
    }
  }

  onSortButtonClick(columnName: string) {
    return (event: MouseEvent<HTMLButtonElement, MouseEvent>) => {
      var sortDirection: "asc" | "desc" | undefined = "asc";
      if(this.state.sortId === columnName) {
        sortDirection = (this.state.sortDirection === "asc") ? "desc" : "asc";
      }
      this.setState({ sortId: columnName, sortDirection: sortDirection, usePresetFilters: false });
    }
  }

  onSearchBarChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const searchQuery: string = event.target.value;
    this.setState({ searchQuery, currentPage: 0 });
  }

  onPageChange(x: any, pageNumber: number) {
    this.setState({currentPage: pageNumber});
  }

  onRowsPerPageChange(event: ChangeEvent<HTMLInputElement>) {
    const rowsPerPage: number = parseInt(event.target.value);
    this.setState({rowsPerPage});
  }

  UNSAFE_componentWillReceiveProps() {
    this.setState({ usePresetFilters: true });
  }

  componentDidUpdate(prevProps: Readonly<PropsI> & Readonly<{ children?: React.ReactNode; }>) {
    if(this.props !== prevProps) {
      const dataCopy = JSON.parse(JSON.stringify(this.props.data));
      surfaceNested(dataCopy);
      processRows(dataCopy);
      this.setState({ rows: dataCopy });
    }
  }
    
  render() {
    const { classes, presetFilters, updateTable } = this.props;
    const { rows, sortId, sortDirection, searchQuery, currentPage, rowsPerPage, usePresetFilters } = this.state;

    var filters: { [key: string]: any } = presetFilters;
    if(!usePresetFilters) {
      filters.sortId = sortId;
      filters.sortDirection = sortDirection;
    }
    let filteredColumn = tableColumns.find(column => column.name === filters.sortId);
    if(!filteredColumn) filteredColumn = {};

    var rowsCopy: { [key: string]: any }[] = [ ...rows ];
    const rowsLength = rowsCopy.length;
    if(rowsLength > 0) {
      sortRows(rowsCopy, filters.sortId, filters.sortDirection);
      rowsCopy = filterRows(rowsCopy, sortId, searchQuery);
      rowsCopy = snipRows(rowsCopy, currentPage, rowsPerPage);
    }
    
    return (
      <div>
        <ManagementTitle
          filteredColumn={filteredColumn}
          onSearchBarChange={this.onSearchBarChange}
          updateTable={updateTable}
        />
        <Paper className={classes.tableContainer}>
          <Table>
            <ManagementHead
              tableColumns={tableColumns}
              filters={filters}
              onSortButtonClick={this.onSortButtonClick}
            />
            {
              (rowsLength > 0) ?
                <ManagementBody
                  tableColumns={tableColumns}
                  rows={rows}
                  rowsCopy={rowsCopy}
                  onCheckboxChange={this.onCheckboxChange}
                  onIconButtonClick={this.onIconButtonClick}
                />
              : <></>
            }
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={rowsLength}
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
        </Paper>
      </div>
    )
  }
}

const surfaceNested = (rows: { [key: string]: any }[]) => {
  for(const i in rows) {
    const row = rows[i];
    for(const ii in row) {
      const cell = row[ii];
      if(typeof cell === "object") {
        for(const iii in cell) {
          const nested = cell[iii];
          const name = iii.charAt(0).toUpperCase() + iii.substr(1);
          rows[i][ii + name] = nested;
        }
      }
    }
  }
}

const processRows = (rows: { [key: string]: any }[]) => {
  for(const i in rows) {
    const row = rows[i];
    for(const ii in row) {
      const cell = row[ii];
      if(ii === "applicationStatusStage") {
        const states = ["Not Started", "In Progress", "Completed"];
        rows[i][ii] = states[cell];
      }
    }
  }
}

const sortRows = (rows: { [key: string]: any }[], columnName: string, sortDirection: "asc" | "desc" | undefined) => {
  rows.sort((a: { [key: string]: any }, b: { [key: string]: any }) => {
    const A = ((sortDirection === "asc") ? a : b)[columnName];
    const B = ((sortDirection !== "asc") ? a : b)[columnName];
    return sortMethods[typeof A](A, B);
  });
}

const sortMethods: { [key: string]: Function } = {
  string: (A: string, B: string) => {
    return A.localeCompare(B);
  }, number: (A: number, B: number) => {
    return A - B;
  }, boolean: (A: boolean, B: boolean) => {
    return (A < B) ? 1 : -1;
  }
}

const filterRows = (rows: { [key: string]: any }[], sortId: string, searchQuery: string) => {
  return rows.filter((row: { [key: string]: any }) => {
    const cell = row[sortId];
    const columnAsString = (cell + "").toLocaleLowerCase();
    if(columnAsString.includes(searchQuery.toLocaleLowerCase())) {
      return true;
    }
    return false;
  });
}

const snipRows = (rows: { [key: string]: any }[], currentPage: number, rowsPerPage: number) => {
  const startIndex = (currentPage * rowsPerPage)
  return rows.slice(startIndex, (startIndex + rowsPerPage));
}

const tableColumns: { [key: string]: any }[] = [
  { name: "discordId", title: "Discord ID" },
  { name: "inaraName", title: "Inara Name" },
  { name: "inGameName", title: "In-Game Name" },
  { name: "joinedPrivateGroup", title: "Joined Private Group", isBool: true },
  { name: "applicationStatusStage", title: "Application Stage" }
]


export default withStyles(styles, { withTheme: true })(ManagementTable);